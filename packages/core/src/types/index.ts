export type Tier = 'T0' | 'T1' | 'T2' | 'T3';

export const TIER_RANGES: Record<Tier, { min: number; max: number }> = {
  T0: { min: 0.0, max: 0.25 },
  T1: { min: 0.25, max: 0.55 },
  T2: { min: 0.55, max: 0.8 },
  T3: { min: 0.8, max: 1.0 },
};

export const DEFAULT_TIER_THRESHOLDS: [number, number, number] = [0.25, 0.55, 0.8];

export const DEFAULT_HYSTERESIS = {
  promote: 0.05,
  demote: 0.05,
} as const;

export type TemporalEvent =
  | 't:click'
  | 't:hover-dwell'
  | 't:focus'
  | 't:dismiss'
  | 't:scroll-past'
  | 't:deep-action'
  | 't:error-self-recover';

export type EventDepth = 'surface' | 'deep';

export interface LedgerEntry {
  id: string;
  componentKey: string;
  eventType: TemporalEvent;
  timestamp: number;
  sessionIndex: number;
  depth: EventDepth;
  duration?: number;
}

export interface Session {
  index: number;
  startTime: number;
  endTime: number;
}

export type SignalWeightKey =
  | 'engagement_depth'
  | 'session_recurrence'
  | 'dismissal_rate'
  | 'time_to_interact'
  | 'error_recovery';

export interface SignalWeights {
  engagement_depth: number;
  session_recurrence: number;
  dismissal_rate: number;
  time_to_interact: number;
  error_recovery: number;
}

export const DEFAULT_SIGNAL_WEIGHTS: SignalWeights = {
  engagement_depth: 0.3,
  session_recurrence: 0.25,
  dismissal_rate: 0.2,
  time_to_interact: 0.15,
  error_recovery: 0.1,
};

export interface SignalScores {
  engagement_depth: number;
  session_recurrence: number;
  dismissal_rate: number;
  time_to_interact: number;
  error_recovery: number;
}

export interface DensityProfile {
  profileName: 'spacious' | 'comfortable' | 'compact' | 'dense';
  labelStyle: 'full' | 'short' | 'icon-only';
  iconLabels: 'always' | 'hover' | 'hidden';
  tooltipDelay: number;
  density: number;
}

export const DEFAULT_DENSITY_PROFILES: Record<Tier, DensityProfile> = {
  T0: { profileName: 'spacious', labelStyle: 'full', iconLabels: 'always', tooltipDelay: 200, density: 1.0 },
  T1: { profileName: 'comfortable', labelStyle: 'full', iconLabels: 'hover', tooltipDelay: 500, density: 0.8 },
  T2: { profileName: 'compact', labelStyle: 'short', iconLabels: 'hover', tooltipDelay: 800, density: 0.6 },
  T3: { profileName: 'dense', labelStyle: 'icon-only', iconLabels: 'hidden', tooltipDelay: 1200, density: 0.4 },
};

export interface ClassifierConfig {
  weights?: Partial<SignalWeights>;
  tierThresholds?: [number, number, number];
  hysteresis?: {
    promote: number;
    demote: number;
  };
  evaluationInterval?: number;
}

export interface StorageConfig {
  namespace?: string;
  maxEventsPerComponent?: number;
  retentionDays?: number;
  maxTotalBytes?: number;
}

export interface DensityConfig {
  profiles?: Partial<Record<Tier, DensityProfile>>;
  transitionDuration?: number;
}

export interface PrivacyConfig {
  consentRequired?: boolean;
  onConsentRequested?: () => boolean | Promise<boolean>;
}

export interface TemporalConfig {
  classifier?: ClassifierConfig;
  storage?: StorageConfig;
  density?: DensityConfig;
  privacy?: PrivacyConfig;
}

export const DEFAULT_CONFIG: Required<TemporalConfig> = {
  classifier: {
    weights: DEFAULT_SIGNAL_WEIGHTS,
    tierThresholds: DEFAULT_TIER_THRESHOLDS,
    hysteresis: DEFAULT_HYSTERESIS,
    evaluationInterval: 5000,
  },
  storage: {
    namespace: 'temporalui',
    maxEventsPerComponent: 2000,
    retentionDays: 180,
    maxTotalBytes: 10485760,
  },
  density: {
    profiles: DEFAULT_DENSITY_PROFILES,
    transitionDuration: 200,
  },
  privacy: {
    consentRequired: false,
  },
};

export interface ComponentState {
  tier: Tier;
  signal: number;
  lastUpdated: number;
}

export interface DomainState {
  componentSignals: Record<string, number>;
  domainSignal: number;
  lastUpdated: number;
}

export interface TemporalState {
  components: Record<string, ComponentState>;
  domains: Record<string, DomainState>;
}
