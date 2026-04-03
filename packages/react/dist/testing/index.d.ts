import React from 'react';
import type { Tier, TemporalConfig } from '@temporalui/core';
export interface TestProviderTierState {
    [componentId: string]: Tier;
}
export interface TemporalTestProviderProps {
    tiers?: TestProviderTierState;
    config?: TemporalConfig;
    children: React.ReactNode;
}
export declare function TemporalTestProvider({ tiers, config, children, }: TemporalTestProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useTestTier(componentId: string): Tier;
export declare function useTestSetTier(): (componentId: string, tier: Tier) => void;
//# sourceMappingURL=index.d.ts.map