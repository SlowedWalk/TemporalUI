import { InteractionLedger } from './ledger';
import { TemporalObserver, createObserver } from './observer';
import { ProficiencyClassifier } from './classifier';
import { AdaptationResolver } from './resolver';
import { TemporalStorage } from '../storage';
import type {
  Tier,
  LedgerEntry,
  TemporalConfig,
  ClassifierConfig,
  SignalScores,
  ComponentState,
  DensityProfile,
} from '../types';
import { DEFAULT_CONFIG, DEFAULT_DENSITY_PROFILES } from '../types';

export interface TemporalEngineOptions {
  config?: TemporalConfig;
  storage?: TemporalStorage;
}

export interface TierChangeCallback {
  (componentId: string, previous: Tier, current: Tier): void;
}

export class TemporalEngine {
  private config: TemporalConfig;
  private storage: TemporalStorage;
  private ledgers: Map<string, InteractionLedger> = new Map();
  private observers: Map<string, TemporalObserver> = new Map();
  private classifier: ProficiencyClassifier;
  private resolver: AdaptationResolver;
  private sessionIndex: number = 0;
  private tierChangeCallbacks: TierChangeCallback[] = [];
  private evaluationInterval: ReturnType<typeof setInterval> | null = null;
  private coldStartTier: Tier = 'T0';
  private componentStates: Map<string, ComponentState> = new Map();

  constructor(options: TemporalEngineOptions = {}) {
    this.config = options.config ?? {};
    this.storage = options.storage ?? new TemporalStorage(this.config.storage);

    const classifierConfig = this.config.classifier ?? {};
    this.classifier = new ProficiencyClassifier(classifierConfig);
    this.resolver = new AdaptationResolver({
      thresholds: classifierConfig.tierThresholds,
      hysteresis: classifierConfig.hysteresis,
    });
  }

  async init(): Promise<void> {
    await this.storage.init();
    this.sessionIndex = this.getSessionCount();
    this.startEvaluationLoop();
  }

  setColdStartTier(tier: Tier): void {
    this.coldStartTier = tier;
  }

  onTierChange(callback: TierChangeCallback): void {
    this.tierChangeCallbacks.push(callback);
  }

  private notifyTierChange(componentId: string, previous: Tier, current: Tier): void {
    for (const callback of this.tierChangeCallbacks) {
      callback(componentId, previous, current);
    }
  }

  registerComponent(
    componentId: string,
    domain?: string,
    coldStartTier?: Tier
  ): InteractionLedger {
    const componentKey = this.computeComponentKey(componentId, domain);

    if (this.ledgers.has(componentKey)) {
      return this.ledgers.get(componentKey)!;
    }

    const ledger = new InteractionLedger({
      componentKey,
      maxEvents: this.config.storage?.maxEventsPerComponent ?? DEFAULT_CONFIG.storage.maxEventsPerComponent,
      retentionDays: this.config.storage?.retentionDays ?? DEFAULT_CONFIG.storage.retentionDays,
    }, async (entries) => {
      const idb = this.storage.getIDB();
      await idb.addEntries(entries);
    });

    this.ledgers.set(componentKey, ledger);
    return ledger;
  }

  observeComponent(
    componentId: string,
    element: HTMLElement,
    domain?: string
  ): TemporalObserver {
    const componentKey = this.computeComponentKey(componentId, domain);

    if (!this.ledgers.has(componentKey)) {
      this.registerComponent(componentId, domain);
    }

    const ledger = this.ledgers.get(componentKey)!;
    const observer = createObserver(element, (eventType, depth, duration) => {
      switch (eventType) {
        case 't:click':
          ledger.recordClick(depth);
          break;
        case 't:hover-dwell':
          ledger.recordHoverDwell(duration ?? 600, depth);
          break;
        case 't:focus':
          ledger.recordFocus(depth);
          break;
        case 't:dismiss':
          ledger.recordDismiss(depth);
          break;
        case 't:scroll-past':
          ledger.recordScrollPast(depth);
          break;
        case 't:deep-action':
          ledger.recordDeepAction(duration);
          break;
        case 't:error-self-recover':
          ledger.recordErrorSelfRecover();
          break;
      }
    });

    observer.attach();
    this.observers.set(componentKey, observer);
    return observer;
  }

  stopObserving(componentId: string, domain?: string): void {
    const componentKey = this.computeComponentKey(componentId, domain);
    const observer = this.observers.get(componentKey);
    if (observer) {
      observer.detach();
      this.observers.delete(componentKey);
    }
  }

  async computeTier(componentId: string, domain?: string): Promise<{ tier: Tier; signal: number }> {
    const componentKey = this.computeComponentKey(componentId, domain);
    const cached = await this.storage.getComponentState(componentKey);

    const idb = this.storage.getIDB();
    const entries = await idb.getEntriesByComponent(componentKey);

    if (entries.length === 0) {
      const tier = cached?.tier ?? this.coldStartTier;
      return { tier, signal: cached?.signal ?? 0 };
    }

    const { rawSignal, scores } = this.classifier.compute(entries);
    const tier = this.resolver.resolveTier(componentKey, rawSignal, scores);

    const state: ComponentState = {
      tier,
      signal: rawSignal,
      lastUpdated: Date.now(),
    };

    await this.storage.setComponentState(componentKey, state);
    this.componentStates.set(componentKey, state);

    if (cached && cached.tier !== tier) {
      this.notifyTierChange(componentId, cached.tier, tier);
    }

    return { tier, signal: rawSignal };
  }

  async getComponentState(componentId: string, domain?: string): Promise<ComponentState> {
    const componentKey = this.computeComponentKey(componentId, domain);
    return this.storage.getComponentState(componentKey);
  }

  overrideTier(componentId: string, domain: string | undefined, tier: Tier): void {
    const componentKey = this.computeComponentKey(componentId, domain);
    this.resolver.overrideTier(componentKey, tier);
  }

  async reset(componentId: string, domain?: string): Promise<void> {
    const componentKey = this.computeComponentKey(componentId, domain);
    await this.storage.clearComponentState(componentKey);
    this.resolver.reset(componentKey);
    
    const idb = this.storage.getIDB();
    await idb.clearComponent(componentKey);
  }

  getDensityProfile(tier: Tier): DensityProfile {
    const profiles = this.config.density?.profiles ?? DEFAULT_DENSITY_PROFILES;
    return profiles[tier] ?? DEFAULT_DENSITY_PROFILES[tier];
  }

  getComponentStates(): Map<string, ComponentState> {
    return new Map(this.componentStates);
  }

  getAllLedgers(): Map<string, InteractionLedger> {
    return new Map(this.ledgers);
  }

  clearAll(): void {
    for (const observer of this.observers.values()) {
      observer.detach();
    }
    this.observers.clear();
    this.ledgers.clear();
    this.componentStates.clear();
    this.resolver.resetAll();
    this.storage.clearAll();
    this.stopEvaluationLoop();
  }

  private computeComponentKey(componentId: string, domain?: string): string {
    if (domain) {
      return `${domain}:${componentId}`;
    }
    return componentId;
  }

  private getSessionCount(): number {
    try {
      const stored = localStorage.getItem('temporalui:sessionIndex');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  }

  private startEvaluationLoop(): void {
    const interval = this.config.classifier?.evaluationInterval ?? DEFAULT_CONFIG.classifier.evaluationInterval;
    this.evaluationInterval = setInterval(async () => {
      for (const [componentKey] of this.ledgers) {
        const [domain, id] = componentKey.includes(':') 
          ? componentKey.split(':') 
          : [undefined, componentKey];
        await this.computeTier(id, domain);
      }
      await this.storage.applyRetentionPolicy();
    }, interval);
  }

  private stopEvaluationLoop(): void {
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
    }
  }
}

export { InteractionLedger } from './ledger';
export { TemporalObserver } from './observer';
export { ProficiencyClassifier } from './classifier';
export { AdaptationResolver } from './resolver';
export { TemporalStorage } from '../storage';
