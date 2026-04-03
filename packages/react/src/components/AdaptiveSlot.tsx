import React, { useContext, useMemo } from 'react';
import { TierContext, type Tier } from './Temporal';

export interface AdaptiveSlotProps {
  children: React.ReactNode;
}

export function AdaptiveSlot({ children }: AdaptiveSlotProps) {
  const { tier: currentTier } = useContext(TierContext) ?? { tier: 'T0' as Tier };

  const tierNodes = useMemo(() => {
    const map = new Map<string | undefined, React.ReactNode>();

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === AdaptiveTier) {
        const tierValue = (child.props as AdaptiveTierProps).tier;
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
      const t = `T${i}` as Tier;
      if (tierNodes.has(t)) {
        return tierNodes.get(t);
      }
    }

    if (tierNodes.has(undefined)) {
      return tierNodes.get(undefined);
    }

    return null;
  }, [currentTier, tierNodes]);

  return <>{resolved}</>;
}

export interface AdaptiveTierProps {
  tier?: Tier | `${Tier}|${Tier}` | `${Tier}+`;
  children: React.ReactNode;
}

export function AdaptiveTier({ children }: AdaptiveTierProps) {
  return <>{children}</>;
}

export { TierContext };
