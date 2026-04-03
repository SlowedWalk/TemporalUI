import { type VNode } from 'vue';
import { TemporalEngine, type TemporalConfig, type Tier } from '@temporalui/core';
export interface TemporalTestProviderProps {
    engine?: TemporalEngine;
    config?: TemporalConfig;
    seedTier?: Tier;
    children?: VNode | VNode[];
}
export declare function createTestEngine(config?: TemporalConfig, seedTier?: Tier): TemporalEngine;
//# sourceMappingURL=index.d.ts.map