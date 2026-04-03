import type {
  LedgerEntry,
  SignalWeights,
  SignalScores,
  Session,
  ClassifierConfig,
} from '../../types';
import { DEFAULT_SIGNAL_WEIGHTS } from '../../types';

export interface ClassifierResult {
  rawSignal: number;
  scores: SignalScores;
}

export class ProficiencyClassifier {
  private weights: SignalWeights;
  private thresholds: [number, number, number];
  private hysteresis: { promote: number; demote: number };

  constructor(config: ClassifierConfig = {}) {
    this.weights = { ...DEFAULT_SIGNAL_WEIGHTS, ...config.weights };
    this.thresholds = config.tierThresholds ?? [0.25, 0.55, 0.8];
    this.hysteresis = config.hysteresis ?? { promote: 0.05, demote: 0.05 };
  }

  compute(entries: LedgerEntry[]): ClassifierResult {
    const sessions = this.groupBySessions(entries);
    
    const scores: SignalScores = {
      engagement_depth: this.scoreEngagementDepth(entries),
      session_recurrence: this.scoreRecurrence(sessions),
      dismissal_rate: this.scoreDismissalRate(entries),
      time_to_interact: this.scoreInteractSpeed(sessions),
      error_recovery: this.scoreErrorRecovery(entries),
    };

    const rawSignal = this.computeWeightedSignal(scores);

    return { rawSignal, scores };
  }

  private groupBySessions(entries: LedgerEntry[]): Map<number, LedgerEntry[]> {
    const sessions = new Map<number, LedgerEntry[]>();
    for (const entry of entries) {
      if (!sessions.has(entry.sessionIndex)) {
        sessions.set(entry.sessionIndex, []);
      }
      sessions.get(entry.sessionIndex)!.push(entry);
    }
    return sessions;
  }

  private scoreEngagementDepth(entries: LedgerEntry[]): number {
    if (entries.length === 0) return 0;
    
    const deepEvents = entries.filter((e) => e.depth === 'deep').length;
    const totalEvents = entries.length;
    
    return Math.min(1, deepEvents / Math.max(1, totalEvents) * 4);
  }

  private scoreRecurrence(sessions: Map<number, LedgerEntry[]>): number {
    const n = sessions.size;
    if (n === 0) return 0;
    
    return Math.min(1, Math.log(n + 1) / Math.log(51));
  }

  private scoreDismissalRate(entries: LedgerEntry[]): number {
    const dismissals = entries.filter((e) => e.eventType === 't:dismiss').length;
    const helpImpressions = entries.filter(
      (e) => e.eventType === 't:hover-dwell' || e.eventType === 't:focus'
    ).length;

    if (helpImpressions === 0) return 0.5;
    
    return Math.min(1, dismissals / Math.max(1, helpImpressions));
  }

  private scoreInteractSpeed(sessions: Map<number, LedgerEntry[]>): number {
    const firstTimes: number[] = [];
    
    for (const [, sessionEntries] of sessions) {
      if (sessionEntries.length === 0) continue;
      const sorted = [...sessionEntries].sort((a, b) => a.timestamp - b.timestamp);
      const firstEntry = sorted[0];
      const firstTime = firstEntry.timestamp - sessionEntries[0].timestamp;
      firstTimes.push(firstTime);
    }

    if (firstTimes.length === 0) return 0;
    
    const medianTime = firstTimes.sort((a, b) => a - b)[Math.floor(firstTimes.length / 2)];
    const maxTime = 30000;
    const normalized = Math.max(0, 1 - medianTime / maxTime);
    
    return normalized;
  }

  private scoreErrorRecovery(entries: LedgerEntry[]): number {
    const recoveries = entries.filter((e) => e.eventType === 't:error-self-recover').length;
    const totalErrors = entries.filter(
      (e) => e.eventType === 't:error-self-recover' || e.eventType === 't:dismiss'
    ).length;

    if (totalErrors === 0) return 0.5;
    
    return Math.min(1, recoveries / Math.max(1, totalErrors));
  }

  private computeWeightedSignal(scores: SignalScores): number {
    let total = 0;
    let weightSum = 0;
    
    for (const key of Object.keys(this.weights) as (keyof SignalWeights)[]) {
      const weight = this.weights[key];
      const score = scores[key];
      total += score * weight;
      weightSum += weight;
    }
    
    return weightSum > 0 ? total / weightSum : 0;
  }

  applyHysteresis(
    currentSignal: number,
    previousSignal: number,
    direction: 'promote' | 'demote'
  ): number {
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

  getWeights(): SignalWeights {
    return { ...this.weights };
  }

  setWeights(weights: Partial<SignalWeights>): void {
    this.weights = { ...this.weights, ...weights };
  }
}
