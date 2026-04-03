import type { Tier, SignalScores } from '../../types';
export interface ResolverConfig {
    thresholds?: [number, number, number];
    hysteresis?: {
        promote: number;
        demote: number;
    };
}
export interface TierTransition {
    previous: Tier;
    current: Tier;
    signal: number;
    scores?: SignalScores;
}
export declare class AdaptationResolver {
    private thresholds;
    private hysteresis;
    private currentState;
    constructor(config?: ResolverConfig);
    mapSignalToTier(signal: number): Tier;
    resolveTier(componentId: string, signal: number, scores?: SignalScores): Tier;
    private tierToNumber;
    private getThresholdsForTransition;
    getState(componentId: string): {
        tier: Tier;
        signal: number;
    } | null;
    overrideTier(componentId: string, tier: Tier): void;
    reset(componentId: string): void;
    resetAll(): void;
    getAllStates(): Record<string, {
        tier: Tier;
        signal: number;
    }>;
}
//# sourceMappingURL=index.d.ts.map