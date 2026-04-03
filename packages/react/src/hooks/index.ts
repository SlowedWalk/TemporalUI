import { useContext } from 'react';
import { TierContext } from '../components/Temporal';
import type { Tier, DensityProfile } from '@temporalui/core';

export type { Tier, DensityProfile };

export interface UseTemporalResult {
  tier: Tier;
  signal: number;
  componentId: string;
  domain?: string;
  is: (tier: Tier) => boolean;
  atLeast: (tier: Tier) => boolean;
  reset: () => Promise<void>;
  override: (tier: Tier) => void;
}

export function useTemporal(id: string, domain?: string): UseTemporalResult {
  const context = useContext(TierContext);

  if (!context) {
    throw new Error(`[TemporalUI] useTemporal('${id}') must be used within a Temporal component`);
  }

  return {
    tier: context.tier,
    signal: context.signal,
    componentId: context.componentId,
    domain: context.domain,
    is: context.is,
    atLeast: context.atLeast,
    reset: context.reset,
    override: context.override,
  };
}

export function useAdaptation(): {
  density: DensityProfile;
  labelStyle: 'full' | 'short' | 'icon-only';
  iconMode: 'always' | 'hover' | 'hidden';
  tooltipDelay: number;
} {
  const context = useContext(TierContext);

  if (!context) {
    return {
      density: {
        profileName: 'comfortable',
        labelStyle: 'full',
        iconLabels: 'hover',
        tooltipDelay: 500,
        density: 0.8,
      },
      labelStyle: 'full',
      iconMode: 'hover',
      tooltipDelay: 500,
    };
  }

  return {
    density: context.density,
    labelStyle: context.density.labelStyle,
    iconMode: context.density.iconLabels,
    tooltipDelay: context.density.tooltipDelay,
  };
}
