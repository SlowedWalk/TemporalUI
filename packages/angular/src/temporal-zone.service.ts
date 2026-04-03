import {
  Injectable,
  OnDestroy,
} from '@angular/core';
import {
  BehaviorSubject,
} from 'rxjs';
import {
  TemporalEngine,
  type TemporalConfig,
  type Tier,
  type ComponentState,
  type DensityProfile,
} from '@temporalui/core';

export type { Tier, DensityProfile, ComponentState };

export interface TemporalZoneConfig {
  config?: TemporalConfig;
  debug?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TemporalZoneService implements OnDestroy {
  private engine: TemporalEngine | null = null;
  private _isReady = new BehaviorSubject<boolean>(false);
  private _componentStates = new Map<string, BehaviorSubject<ComponentState>>();

  readonly isReady$ = this._isReady.asObservable();

  constructor() {
    this.init();
  }

  private async init(config?: TemporalConfig): Promise<void> {
    this.engine = new TemporalEngine({ config });
    await this.engine.init();
    this._isReady.next(true);
  }

  getEngine(): TemporalEngine {
    if (!this.engine) {
      throw new Error('[TemporalUI] TemporalEngine not initialized');
    }
    return this.engine;
  }

  getComponentState$(componentId: string, domain?: string): BehaviorSubject<ComponentState> {
    const key = this.computeKey(componentId, domain);
    
    if (!this._componentStates.has(key)) {
      const initial: ComponentState = {
        tier: 'T0',
        signal: 0,
        lastUpdated: Date.now(),
      };
      this._componentStates.set(key, new BehaviorSubject<ComponentState>(initial));
    }

    return this._componentStates.get(key)!;
  }

  async registerComponent(
    componentId: string,
    domain?: string,
    coldStartTier?: Tier
  ): Promise<ComponentState> {
    const engine = this.getEngine();
    engine.registerComponent(componentId, domain, coldStartTier ?? 'T0');
    
    const result = await engine.computeTier(componentId, domain);
    
    const state: ComponentState = {
      tier: result.tier,
      signal: result.signal,
      lastUpdated: Date.now(),
    };

    const subject = this.getComponentState$(componentId, domain);
    subject.next(state);

    return state;
  }

  observeComponent(
    componentId: string,
    element: HTMLElement,
    domain?: string
  ): void {
    const engine = this.getEngine();
    engine.observeComponent(componentId, element, domain);
  }

  stopObserving(componentId: string, domain?: string): void {
    const engine = this.getEngine();
    engine.stopObserving(componentId, domain);
  }

  async reset(componentId: string, domain?: string): Promise<void> {
    const engine = this.getEngine();
    await engine.reset(componentId, domain);
    
    const state: ComponentState = {
      tier: 'T0',
      signal: 0,
      lastUpdated: Date.now(),
    };
    
    const subject = this.getComponentState$(componentId, domain);
    subject.next(state);
  }

  override(componentId: string, domain: string | undefined, tier: Tier): void {
    const engine = this.getEngine();
    engine.overrideTier(componentId, domain, tier);
    
    const state: ComponentState = {
      tier,
      signal: tierToSignal(tier),
      lastUpdated: Date.now(),
    };
    
    const subject = this.getComponentState$(componentId, domain);
    subject.next(state);
  }

  getDensityProfile(tier: Tier): DensityProfile {
    const engine = this.getEngine();
    return engine.getDensityProfile(tier);
  }

  clearAll(): void {
    if (this.engine) {
      this.engine.clearAll();
    }
    for (const subject of this._componentStates.values()) {
      subject.next({
        tier: 'T0',
        signal: 0,
        lastUpdated: Date.now(),
      });
    }
  }

  ngOnDestroy(): void {
    this._isReady.complete();
    for (const subject of this._componentStates.values()) {
      subject.complete();
    }
    this._componentStates.clear();
  }

  private computeKey(componentId: string, domain?: string): string {
    if (domain) {
      return `${domain}:${componentId}`;
    }
    return componentId;
  }
}

function tierToSignal(tier: Tier): number {
  const map: Record<Tier, number> = {
    T0: 0.1,
    T1: 0.4,
    T2: 0.675,
    T3: 0.9,
  };
  return map[tier];
}
