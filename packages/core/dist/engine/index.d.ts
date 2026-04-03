import { InteractionLedger } from './ledger';
import { TemporalObserver } from './observer';
import { TemporalStorage } from '../storage';
import type { Tier, TemporalConfig, ComponentState, DensityProfile } from '../types';
export interface TemporalEngineOptions {
    config?: TemporalConfig;
    storage?: TemporalStorage;
}
export interface TierChangeCallback {
    (componentId: string, previous: Tier, current: Tier): void;
}
export declare class TemporalEngine {
    private config;
    private storage;
    private ledgers;
    private observers;
    private classifier;
    private resolver;
    private sessionIndex;
    private tierChangeCallbacks;
    private evaluationInterval;
    private coldStartTier;
    private componentStates;
    constructor(options?: TemporalEngineOptions);
    init(): Promise<void>;
    setColdStartTier(tier: Tier): void;
    onTierChange(callback: TierChangeCallback): void;
    private notifyTierChange;
    registerComponent(componentId: string, domain?: string, coldStartTier?: Tier): InteractionLedger;
    observeComponent(componentId: string, element: HTMLElement, domain?: string): TemporalObserver;
    stopObserving(componentId: string, domain?: string): void;
    computeTier(componentId: string, domain?: string): Promise<{
        tier: Tier;
        signal: number;
    }>;
    getComponentState(componentId: string, domain?: string): Promise<ComponentState>;
    overrideTier(componentId: string, domain: string | undefined, tier: Tier): void;
    reset(componentId: string, domain?: string): Promise<void>;
    getDensityProfile(tier: Tier): DensityProfile;
    getComponentStates(): Map<string, ComponentState>;
    getAllLedgers(): Map<string, InteractionLedger>;
    clearAll(): void;
    private computeComponentKey;
    private getSessionCount;
    private startEvaluationLoop;
    private stopEvaluationLoop;
}
export { InteractionLedger } from './ledger';
export { TemporalObserver } from './observer';
export { ProficiencyClassifier } from './classifier';
export { AdaptationResolver } from './resolver';
export { TemporalStorage } from '../storage';
//# sourceMappingURL=index.d.ts.map