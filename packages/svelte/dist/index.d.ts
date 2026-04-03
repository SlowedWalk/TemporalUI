import { TemporalEngine, type TemporalConfig, type Tier, type DensityProfile } from '@temporalui/core';
export type { Tier, DensityProfile };
export interface TemporalZoneOptions {
    config?: TemporalConfig;
    debug?: boolean;
}
export declare function createTemporalZone(options?: TemporalZoneOptions): TemporalEngine;
export declare function getEngine(): TemporalEngine | null;
export declare function isZoneReady(): boolean;
export declare function useTemporalEngine(): TemporalEngine | null;
export interface UseTemporalResult {
    tier: Tier;
    signal: number;
    componentId: string;
    domain?: string;
    is: (tier: Tier) => boolean;
    atLeast: (tier: Tier) => boolean;
    reset: () => Promise<void>;
    override: (tier: Tier) => void;
    density: DensityProfile;
}
export declare function computeTier(componentId: string, domain?: string, coldStartTier?: Tier): Promise<UseTemporalResult>;
export declare function observeComponent(componentId: string, element: HTMLElement, domain?: string): void;
export declare function stopObserving(componentId: string, domain?: string): void;
export declare function getDensityProfile(tier: Tier): DensityProfile;
//# sourceMappingURL=index.d.ts.map