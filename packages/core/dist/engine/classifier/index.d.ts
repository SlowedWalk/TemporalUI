import type { LedgerEntry, SignalWeights, SignalScores, ClassifierConfig } from '../../types';
export interface ClassifierResult {
    rawSignal: number;
    scores: SignalScores;
}
export declare class ProficiencyClassifier {
    private weights;
    private thresholds;
    private hysteresis;
    constructor(config?: ClassifierConfig);
    compute(entries: LedgerEntry[]): ClassifierResult;
    private groupBySessions;
    private scoreEngagementDepth;
    private scoreRecurrence;
    private scoreDismissalRate;
    private scoreInteractSpeed;
    private scoreErrorRecovery;
    private computeWeightedSignal;
    applyHysteresis(currentSignal: number, previousSignal: number, direction: 'promote' | 'demote'): number;
    getWeights(): SignalWeights;
    setWeights(weights: Partial<SignalWeights>): void;
}
//# sourceMappingURL=index.d.ts.map