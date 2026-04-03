import type { Tier, DensityProfile } from '@temporalui/core';
export type { Tier, DensityProfile };
export interface UseTemporalResult {
    tier: Tier;
    signal: number;
    componentId: string;
    domain?: string;
    is: (tier: Tier) => boolean;
    atLeast: (tier: Tier) => boolean;
    reset: () => Promise<void>;
    override: (tier: Tier) => void;
}
export declare function useTemporal(id: string, domain?: string): UseTemporalResult;
export declare function useAdaptation(): {
    density: DensityProfile;
    labelStyle: 'full' | 'short' | 'icon-only';
    iconMode: 'always' | 'hover' | 'hidden';
    tooltipDelay: number;
};
//# sourceMappingURL=index.d.ts.map