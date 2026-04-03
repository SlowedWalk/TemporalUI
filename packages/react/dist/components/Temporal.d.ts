import React from 'react';
import { TemporalEngine, type TemporalConfig, type DensityProfile, type Tier } from '@temporalui/core';
export type { Tier, DensityProfile };
export interface TemporalContextValue {
    engine: TemporalEngine;
    config: TemporalConfig;
    debug: boolean;
}
export declare const TemporalRootContext: React.Context<TemporalContextValue | null>;
export interface TemporalZoneProps {
    config?: TemporalConfig;
    debug?: boolean;
    children: React.ReactNode;
}
export declare function TemporalZone({ config, debug, children }: TemporalZoneProps): import("react/jsx-runtime").JSX.Element;
export declare function useTemporalRoot(): TemporalContextValue;
export interface TierContextValue {
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
export declare const TierContext: React.Context<TierContextValue | null>;
export interface TemporalProps {
    id: string;
    domain?: string;
    coldStartTier?: Tier;
    observe?: boolean;
    onTierChange?: (previous: Tier, next: Tier) => void;
    children?: React.ReactNode;
}
export declare function Temporal({ id, domain, coldStartTier, observe, onTierChange, children, }: TemporalProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Temporal.d.ts.map