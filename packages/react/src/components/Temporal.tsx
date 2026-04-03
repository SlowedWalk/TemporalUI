import React, { createContext, useContext, useMemo, useState, useEffect, useRef } from 'react';
import {
  TemporalEngine,
  type TemporalConfig,
  type ComponentState,
  type DensityProfile,
  type Tier,
} from '@temporalui/core';

export type { Tier, DensityProfile };

export interface TemporalContextValue {
  engine: TemporalEngine;
  config: TemporalConfig;
  debug: boolean;
}

export const TemporalRootContext = createContext<TemporalContextValue | null>(null);

export interface TemporalZoneProps {
  config?: TemporalConfig;
  debug?: boolean;
  children: React.ReactNode;
}

export function TemporalZone({ config = {}, debug = false, children }: TemporalZoneProps) {
  const [engine] = useState(() => new TemporalEngine({ config }));
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    engine.init().then(() => setIsReady(true));
  }, [engine]);

  const value = useMemo(
    () => ({
      engine,
      config,
      debug,
    }),
    [engine, config, debug]
  );

  if (!isReady) {
    return (
      <TemporalRootContext.Provider value={value}>
        {children}
      </TemporalRootContext.Provider>
    );
  }

  return (
    <TemporalRootContext.Provider value={value}>
      {children}
    </TemporalRootContext.Provider>
  );
}

export function useTemporalRoot(): TemporalContextValue {
  const context = useContext(TemporalRootContext);
  if (!context) {
    throw new Error('[TemporalUI] useTemporalRoot must be used within a TemporalZone');
  }
  return context;
}

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

export const TierContext = createContext<TierContextValue | null>(null);

export interface TemporalProps {
  id: string;
  domain?: string;
  coldStartTier?: Tier;
  observe?: boolean;
  onTierChange?: (previous: Tier, next: Tier) => void;
  children?: React.ReactNode;
}

export function Temporal({
  id,
  domain,
  coldStartTier = 'T0',
  observe = true,
  onTierChange,
  children,
}: TemporalProps) {
  const { engine } = useTemporalRoot();
  const elementRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ tier: Tier; signal: number }>({
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

    let observer: any;
    if (observe && elementRef.current) {
      observer = engine.observeComponent(id, elementRef.current, domain);
    }

    return () => {
      if (observe && observer) {
        engine.stopObserving(id, domain);
      }
    };
  }, [id, domain, coldStartTier, observe, onTierChange, engine]);

  const is = (tier: Tier): boolean => state.tier === tier;

  const atLeast = (tier: Tier): boolean => {
    const tierOrder = ['T0', 'T1', 'T2', 'T3'] as const;
    return tierOrder.indexOf(state.tier) >= tierOrder.indexOf(tier);
  };

  const reset = async () => {
    await engine.reset(id, domain);
    setState({ tier: coldStartTier, signal: 0 });
  };

  const override = (tier: Tier) => {
    engine.overrideTier(id, domain, tier);
    setState({ tier, signal: tierToSignal(tier) });
  };

  const density = engine.getDensityProfile(state.tier);

  const contextValue: TierContextValue = {
    ...state,
    componentId: id,
    domain,
    is,
    atLeast,
    reset,
    override,
    density,
  };

  return (
    <TierContext.Provider value={contextValue}>
      <div
        ref={elementRef}
        data-temporal-id={id}
        data-temporal-tier={state.tier}
        data-temporal-signal={state.signal}
      >
        {children}
      </div>
    </TierContext.Provider>
  );
}

function tierToSignal(tier: Tier): number {
  const map: Record<Tier, number> = {
    T0: 0.1,
    T1: 0.4,
    T2: 0.675,
    T3: 0.9,
  };
  return map[tier];
}
