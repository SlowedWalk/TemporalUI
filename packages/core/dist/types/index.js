export const TIER_RANGES = {
    T0: { min: 0.0, max: 0.25 },
    T1: { min: 0.25, max: 0.55 },
    T2: { min: 0.55, max: 0.8 },
    T3: { min: 0.8, max: 1.0 },
};
export const DEFAULT_TIER_THRESHOLDS = [0.25, 0.55, 0.8];
export const DEFAULT_HYSTERESIS = {
    promote: 0.05,
    demote: 0.05,
};
export const DEFAULT_SIGNAL_WEIGHTS = {
    engagement_depth: 0.3,
    session_recurrence: 0.25,
    dismissal_rate: 0.2,
    time_to_interact: 0.15,
    error_recovery: 0.1,
};
export const DEFAULT_DENSITY_PROFILES = {
    T0: { profileName: 'spacious', labelStyle: 'full', iconLabels: 'always', tooltipDelay: 200, density: 1.0 },
    T1: { profileName: 'comfortable', labelStyle: 'full', iconLabels: 'hover', tooltipDelay: 500, density: 0.8 },
    T2: { profileName: 'compact', labelStyle: 'short', iconLabels: 'hover', tooltipDelay: 800, density: 0.6 },
    T3: { profileName: 'dense', labelStyle: 'icon-only', iconLabels: 'hidden', tooltipDelay: 1200, density: 0.4 },
};
export const DEFAULT_CONFIG = {
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
