import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useMemo, useState, useEffect, useRef } from 'react';
import { TemporalEngine, } from '@temporalui/core';
export const TemporalRootContext = createContext(null);
export function TemporalZone({ config = {}, debug = false, children }) {
    const [engine] = useState(() => new TemporalEngine({ config }));
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
        engine.init().then(() => setIsReady(true));
    }, [engine]);
    const value = useMemo(() => ({
        engine,
        config,
        debug,
    }), [engine, config, debug]);
    if (!isReady) {
        return (_jsx(TemporalRootContext.Provider, { value: value, children: children }));
    }
    return (_jsx(TemporalRootContext.Provider, { value: value, children: children }));
}
export function useTemporalRoot() {
    const context = useContext(TemporalRootContext);
    if (!context) {
        throw new Error('[TemporalUI] useTemporalRoot must be used within a TemporalZone');
    }
    return context;
}
export const TierContext = createContext(null);
export function Temporal({ id, domain, coldStartTier = 'T0', observe = true, onTierChange, children, }) {
    const { engine } = useTemporalRoot();
    const elementRef = useRef(null);
    const [state, setState] = useState({
        tier: coldStartTier,
        signal: 0,
    });
    useEffect(() => {
        if (coldStartTier !== 'T0') {
            engine.setColdStartTier(coldStartTier);
        }
        engine.registerComponent(id, domain, coldStartTier);
        if (onTierChange) {
            engine.onTierChange((componentId, previous, current) => {
                const key = domain ? `${domain}:${id}` : id;
                if (componentId === key) {
                    onTierChange(previous, current);
                }
            });
        }
        engine.computeTier(id, domain).then((result) => {
            setState(result);
        });
        let observer;
        if (observe && elementRef.current) {
            observer = engine.observeComponent(id, elementRef.current, domain);
        }
        return () => {
            if (observe && observer) {
                engine.stopObserving(id, domain);
            }
        };
    }, [id, domain, coldStartTier, observe, onTierChange, engine]);
    const is = (tier) => state.tier === tier;
    const atLeast = (tier) => {
        const tierOrder = ['T0', 'T1', 'T2', 'T3'];
        return tierOrder.indexOf(state.tier) >= tierOrder.indexOf(tier);
    };
    const reset = async () => {
        await engine.reset(id, domain);
        setState({ tier: coldStartTier, signal: 0 });
    };
    const override = (tier) => {
        engine.overrideTier(id, domain, tier);
        setState({ tier, signal: tierToSignal(tier) });
    };
    const density = engine.getDensityProfile(state.tier);
    const contextValue = {
        ...state,
        componentId: id,
        domain,
        is,
        atLeast,
        reset,
        override,
        density,
    };
    return (_jsx(TierContext.Provider, { value: contextValue, children: _jsx("div", { ref: elementRef, "data-temporal-id": id, "data-temporal-tier": state.tier, "data-temporal-signal": state.signal, children: children }) }));
}
function tierToSignal(tier) {
    const map = {
        T0: 0.1,
        T1: 0.4,
        T2: 0.675,
        T3: 0.9,
    };
    return map[tier];
}
