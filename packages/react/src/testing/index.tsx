import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { Tier, TemporalConfig, DensityProfile } from '@temporalui/core';

export interface TestProviderTierState {
  [componentId: string]: Tier;
}

export interface TemporalTestProviderProps {
  tiers?: TestProviderTierState;
  config?: TemporalConfig;
  children: React.ReactNode;
}

interface TestTierContextValue {
  tiers: TestProviderTierState;
  setTier: (componentId: string, tier: Tier) => void;
}

const TestTierContext = createContext<TestTierContextValue | null>(null);

export function TemporalTestProvider({
  tiers = {},
  config = {},
  children,
}: TemporalTestProviderProps) {
  const [tierState, setTierState] = useState(tiers);

  const setTier = (componentId: string, tier: Tier) => {
    setTierState((prev) => ({ ...prev, [componentId]: tier }));
  };

  const value = useMemo(() => ({
    tiers: tierState,
    setTier,
  }), [tierState]);

  return (
    <TestTierContext.Provider value={value}>
      {children}
    </TestTierContext.Provider>
  );
}

export function useTestTier(componentId: string): Tier {
  const context = useContext(TestTierContext);
  if (!context) {
    return 'T0';
  }
  return context.tiers[componentId] ?? 'T0';
}

export function useTestSetTier(): (componentId: string, tier: Tier) => void {
  const context = useContext(TestTierContext);
  if (!context) {
    return () => {};
  }
  return context.setTier;
}
