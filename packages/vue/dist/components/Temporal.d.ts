import { type PropType, type VNode } from 'vue';
import { TemporalEngine, type TemporalConfig, type Tier, type DensityProfile } from '@temporalui/core';
export type { Tier, DensityProfile };
export interface TemporalRootContextValue {
    engine: TemporalEngine;
    config: TemporalConfig;
    debug: boolean;
}
export interface TemporalZoneProps {
    config?: TemporalConfig;
    debug?: boolean;
}
export declare const TemporalZone: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    config: {
        type: PropType<TemporalConfig>;
        default: () => {};
    };
    debug: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => VNode, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    config: {
        type: PropType<TemporalConfig>;
        default: () => {};
    };
    debug: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    config: TemporalConfig;
    debug: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export declare function useTemporalRoot(): TemporalRootContextValue;
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
export interface TemporalProps {
    id: string;
    domain?: string;
    coldStartTier?: Tier;
    observe?: boolean;
    onTierChange?: (previous: Tier, next: Tier) => void;
}
export declare const Temporal: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    id: {
        type: StringConstructor;
        required: true;
    };
    domain: {
        type: StringConstructor;
        default: undefined;
    };
    coldStartTier: {
        type: PropType<Tier>;
        default: string;
    };
    observe: {
        type: BooleanConstructor;
        default: boolean;
    };
    onTierChange: {
        type: PropType<(previous: Tier, next: Tier) => void>;
        default: undefined;
    };
}>, () => VNode, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    id: {
        type: StringConstructor;
        required: true;
    };
    domain: {
        type: StringConstructor;
        default: undefined;
    };
    coldStartTier: {
        type: PropType<Tier>;
        default: string;
    };
    observe: {
        type: BooleanConstructor;
        default: boolean;
    };
    onTierChange: {
        type: PropType<(previous: Tier, next: Tier) => void>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    domain: string;
    coldStartTier: Tier;
    observe: boolean;
    onTierChange: (previous: Tier, next: Tier) => void;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
//# sourceMappingURL=Temporal.d.ts.map