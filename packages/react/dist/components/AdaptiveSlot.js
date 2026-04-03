import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useContext, useMemo } from 'react';
import { TierContext } from './Temporal';
export function AdaptiveSlot({ children }) {
    const { tier: currentTier } = useContext(TierContext) ?? { tier: 'T0' };
    const tierNodes = useMemo(() => {
        const map = new Map();
        React.Children.forEach(children, (child) => {
            if (React.isValidElement(child) && child.type === AdaptiveTier) {
                const tierValue = child.props.tier;
                map.set(tierValue, child.props.children);
            }
        });
        return map;
    }, [children]);
    const resolved = useMemo(() => {
        if (tierNodes.has(currentTier)) {
            return tierNodes.get(currentTier);
        }
        for (let i = parseInt(currentTier.slice(1)); i >= 0; i--) {
            const t = `T${i}`;
            if (tierNodes.has(t)) {
                return tierNodes.get(t);
            }
        }
        if (tierNodes.has(undefined)) {
            return tierNodes.get(undefined);
        }
        return null;
    }, [currentTier, tierNodes]);
    return _jsx(_Fragment, { children: resolved });
}
export function AdaptiveTier({ children }) {
    return _jsx(_Fragment, { children: children });
}
export { TierContext };
