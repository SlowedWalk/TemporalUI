import { DEFAULT_SIGNAL_WEIGHTS } from '../../types';
export class ProficiencyClassifier {
    weights;
    thresholds;
    hysteresis;
    constructor(config = {}) {
        this.weights = { ...DEFAULT_SIGNAL_WEIGHTS, ...config.weights };
        this.thresholds = config.tierThresholds ?? [0.25, 0.55, 0.8];
        this.hysteresis = config.hysteresis ?? { promote: 0.05, demote: 0.05 };
    }
    compute(entries) {
        const sessions = this.groupBySessions(entries);
        const scores = {
            engagement_depth: this.scoreEngagementDepth(entries),
            session_recurrence: this.scoreRecurrence(sessions),
            dismissal_rate: this.scoreDismissalRate(entries),
            time_to_interact: this.scoreInteractSpeed(sessions),
            error_recovery: this.scoreErrorRecovery(entries),
        };
        const rawSignal = this.computeWeightedSignal(scores);
        return { rawSignal, scores };
    }
    groupBySessions(entries) {
        const sessions = new Map();
        for (const entry of entries) {
            if (!sessions.has(entry.sessionIndex)) {
                sessions.set(entry.sessionIndex, []);
            }
            sessions.get(entry.sessionIndex).push(entry);
        }
        return sessions;
    }
    scoreEngagementDepth(entries) {
        if (entries.length === 0)
            return 0;
        const deepEvents = entries.filter((e) => e.depth === 'deep').length;
        const totalEvents = entries.length;
        return Math.min(1, deepEvents / Math.max(1, totalEvents) * 4);
    }
    scoreRecurrence(sessions) {
        const n = sessions.size;
        if (n === 0)
            return 0;
        return Math.min(1, Math.log(n + 1) / Math.log(51));
    }
    scoreDismissalRate(entries) {
        const dismissals = entries.filter((e) => e.eventType === 't:dismiss').length;
        const helpImpressions = entries.filter((e) => e.eventType === 't:hover-dwell' || e.eventType === 't:focus').length;
        if (helpImpressions === 0)
            return 0.5;
        return Math.min(1, dismissals / Math.max(1, helpImpressions));
    }
    scoreInteractSpeed(sessions) {
        const firstTimes = [];
        for (const [, sessionEntries] of sessions) {
            if (sessionEntries.length === 0)
                continue;
            const sorted = [...sessionEntries].sort((a, b) => a.timestamp - b.timestamp);
            const firstEntry = sorted[0];
            const firstTime = firstEntry.timestamp - sessionEntries[0].timestamp;
            firstTimes.push(firstTime);
        }
        if (firstTimes.length === 0)
            return 0;
        const medianTime = firstTimes.sort((a, b) => a - b)[Math.floor(firstTimes.length / 2)];
        const maxTime = 30000;
        const normalized = Math.max(0, 1 - medianTime / maxTime);
        return normalized;
    }
    scoreErrorRecovery(entries) {
        const recoveries = entries.filter((e) => e.eventType === 't:error-self-recover').length;
        const totalErrors = entries.filter((e) => e.eventType === 't:error-self-recover' || e.eventType === 't:dismiss').length;
        if (totalErrors === 0)
            return 0.5;
        return Math.min(1, recoveries / Math.max(1, totalErrors));
    }
    computeWeightedSignal(scores) {
        let total = 0;
        let weightSum = 0;
        for (const key of Object.keys(this.weights)) {
            const weight = this.weights[key];
            const score = scores[key];
            total += score * weight;
            weightSum += weight;
        }
        return weightSum > 0 ? total / weightSum : 0;
    }
    applyHysteresis(currentSignal, previousSignal, direction) {
        const threshold = direction === 'promote'
            ? this.thresholds[0] + this.hysteresis.promote
            : this.thresholds[2] - this.hysteresis.demote;
        if (direction === 'promote' && currentSignal >= threshold && previousSignal < threshold) {
            return currentSignal;
        }
        if (direction === 'demote' && currentSignal <= threshold && previousSignal > threshold) {
            return currentSignal;
        }
        return previousSignal;
    }
    getWeights() {
        return { ...this.weights };
    }
    setWeights(weights) {
        this.weights = { ...this.weights, ...weights };
    }
}
