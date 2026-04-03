export type Tier = 'T0' | 'T1' | 'T2' | 'T3';
export declare const TIER_RANGES: Record<Tier, {
    min: number;
    max: number;
}>;
export declare const DEFAULT_TIER_THRESHOLDS: [number, number, number];
export declare const DEFAULT_HYSTERESIS: {
    readonly promote: 0.05;
    readonly demote: 0.05;
};
export type TemporalEvent = 't:click' | 't:hover-dwell' | 't:focus' | 't:dismiss' | 't:scroll-past' | 't:deep-action' | 't:error-self-recover';
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
export type SignalWeightKey = 'engagement_depth' | 'session_recurrence' | 'dismissal_rate' | 'time_to_interact' | 'error_recovery';
export interface SignalWeights {
    engagement_depth: number;
    session_recurrence: number;
    dismissal_rate: number;
    time_to_interact: number;
    error_recovery: number;
}
export declare const DEFAULT_SIGNAL_WEIGHTS: SignalWeights;
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
export declare const DEFAULT_DENSITY_PROFILES: Record<Tier, DensityProfile>;
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
export declare const DEFAULT_CONFIG: Required<TemporalConfig>;
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
//# sourceMappingURL=index.d.ts.map