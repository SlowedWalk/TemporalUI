import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useMemo, useState } from 'react';
const TestTierContext = createContext(null);
export function TemporalTestProvider({ tiers = {}, config = {}, children, }) {
    const [tierState, setTierState] = useState(tiers);
    const setTier = (componentId, tier) => {
        setTierState((prev) => ({ ...prev, [componentId]: tier }));
    };
    const value = useMemo(() => ({
        tiers: tierState,
        setTier,
    }), [tierState]);
    return (_jsx(TestTierContext.Provider, { value: value, children: children }));
}
export function useTestTier(componentId) {
    const context = useContext(TestTierContext);
    if (!context) {
        return 'T0';
    }
    return context.tiers[componentId] ?? 'T0';
}
export function useTestSetTier() {
    const context = useContext(TestTierContext);
    if (!context) {
        return () => { };
    }
    return context.setTier;
}
