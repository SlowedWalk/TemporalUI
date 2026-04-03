import {
  TemporalEngine,
  type TemporalConfig,
  type Tier,
  type DensityProfile,
} from '@temporalui/core';

export type { Tier, DensityProfile };

let _engine: TemporalEngine | null = null;
let _isReady = false;

export interface TemporalZoneOptions {
  config?: TemporalConfig;
  debug?: boolean;
}

export function createTemporalZone(options: TemporalZoneOptions = {}): TemporalEngine {
  const engine = new TemporalEngine({ config: options.config });
  _engine = engine;
  engine.init().then(() => {
    _isReady = true;
  });
  return engine;
}

export function getEngine(): TemporalEngine | null {
  return _engine;
}

export function isZoneReady(): boolean {
  return _isReady;
}

export function useTemporalEngine(): TemporalEngine | null {
  return _engine;
}

export interface UseTemporalResult {
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

export async function computeTier(componentId: string, domain?: string, coldStartTier?: Tier): Promise<UseTemporalResult> {
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
    is: (t: Tier) => result.tier === t,
    atLeast: (t: Tier) => {
      const order = ['T0', 'T1', 'T2', 'T3'] as const;
      return order.indexOf(result.tier) >= order.indexOf(t);
    },
    reset: async () => {
      await _engine!.reset(componentId, domain);
    },
    override: (t: Tier) => {
      _engine!.overrideTier(componentId, domain, t);
    },
    density: _engine.getDensityProfile(result.tier),
  };
}

export function observeComponent(
  componentId: string,
  element: HTMLElement,
  domain?: string
): void {
  if (!_engine) {
    throw new Error('[TemporalUI] TemporalZone not initialized');
  }

  _engine.observeComponent(componentId, element, domain);
}

export function stopObserving(componentId: string, domain?: string): void {
  if (!_engine) return;
  _engine.stopObserving(componentId, domain);
}

export function getDensityProfile(tier: Tier): DensityProfile {
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
