import { type VNode } from 'vue';
import type { Tier } from '@temporalui/core';
export interface AdaptiveSlotProps {
    default?: VNode | VNode[];
}
export declare const AdaptiveSlot: import("vue").DefineComponent<{}, () => VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export interface AdaptiveTierProps {
    tier?: Tier | `${Tier}|${Tier}` | `${Tier}+`;
}
export declare const AdaptiveTier: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    tier: {
        type: StringConstructor;
        default: undefined;
    };
}>, () => VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    tier: {
        type: StringConstructor;
        default: undefined;
    };
}>> & Readonly<{}>, {
    tier: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
//# sourceMappingURL=AdaptiveSlot.d.ts.map