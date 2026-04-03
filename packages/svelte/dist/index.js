import { TemporalEngine, } from '@temporalui/core';
let _engine = null;
let _isReady = false;
export function createTemporalZone(options = {}) {
    const engine = new TemporalEngine({ config: options.config });
    _engine = engine;
    engine.init().then(() => {
        _isReady = true;
    });
    return engine;
}
export function getEngine() {
    return _engine;
}
export function isZoneReady() {
    return _isReady;
}
export function useTemporalEngine() {
    return _engine;
}
export async function computeTier(componentId, domain, coldStartTier) {
    if (!_engine) {
        throw new Error('[TemporalUI] TemporalZone not initialized');
    }
    const tier = coldStartTier ?? 'T0';
    _engine.registerComponent(componentId, domain, tier);
    const result = await _engine.computeTier(componentId, domain);
    return {
        tier: result.tier,
        signal: result.signal,
        componentId,
        domain,
        is: (t) => result.tier === t,
        atLeast: (t) => {
            const order = ['T0', 'T1', 'T2', 'T3'];
            return order.indexOf(result.tier) >= order.indexOf(t);
        },
        reset: async () => {
            await _engine.reset(componentId, domain);
        },
        override: (t) => {
            _engine.overrideTier(componentId, domain, t);
        },
        density: _engine.getDensityProfile(result.tier),
    };
}
export function observeComponent(componentId, element, domain) {
    if (!_engine) {
        throw new Error('[TemporalUI] TemporalZone not initialized');
    }
    _engine.observeComponent(componentId, element, domain);
}
export function stopObserving(componentId, domain) {
    if (!_engine)
        return;
    _engine.stopObserving(componentId, domain);
}
export function getDensityProfile(tier) {
    if (!_engine) {
        return {
            profileName: 'comfortable',
            labelStyle: 'full',
            iconLabels: 'hover',
            tooltipDelay: 500,
            density: 0.8,
        };
    }
    return _engine.getDensityProfile(tier);
}
