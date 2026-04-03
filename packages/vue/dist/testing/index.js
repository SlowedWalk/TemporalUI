import { TemporalEngine, } from '@temporalui/core';
export function createTestEngine(config, seedTier) {
    const engine = new TemporalEngine({ config });
    return engine;
}
