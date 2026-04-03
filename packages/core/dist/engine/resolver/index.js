import { DEFAULT_TIER_THRESHOLDS, DEFAULT_HYSTERESIS } from '../../types';
export class AdaptationResolver {
    thresholds;
    hysteresis;
    currentState = new Map();
    constructor(config = {}) {
        this.thresholds = config.thresholds ?? DEFAULT_TIER_THRESHOLDS;
        this.hysteresis = config.hysteresis ?? DEFAULT_HYSTERESIS;
    }
    mapSignalToTier(signal) {
        if (signal < this.thresholds[0])
            return 'T0';
        if (signal < this.thresholds[1])
            return 'T1';
        if (signal < this.thresholds[2])
            return 'T2';
        return 'T3';
    }
    resolveTier(componentId, signal, scores) {
        const newTier = this.mapSignalToTier(signal);
        const existing = this.currentState.get(componentId);
        if (!existing) {
            this.currentState.set(componentId, {
                tier: newTier,
                signal,
                consecutive: 1,
                direction: null,
            });
            return newTier;
        }
        if (existing.tier === newTier) {
            existing.signal = signal;
            existing.consecutive = 1;
            existing.direction = null;
            return newTier;
        }
        const isPromotion = this.tierToNumber(newTier) > this.tierToNumber(existing.tier);
        const direction = isPromotion ? 'promote' : 'demote';
        if (existing.direction === direction) {
            const requiredConsecutive = isPromotion ? 2 : 3;
            existing.consecutive++;
            existing.signal = signal;
            if (existing.consecutive >= requiredConsecutive) {
                const [promoteThreshold, demoteThreshold] = this.getThresholdsForTransition(existing.tier, newTier, isPromotion);
                if (isPromotion && signal >= promoteThreshold) {
                    existing.tier = newTier;
                    existing.consecutive = 1;
                    existing.direction = null;
                    return newTier;
                }
                if (!isPromotion && signal <= demoteThreshold) {
                    existing.tier = newTier;
                    existing.consecutive = 1;
                    existing.direction = null;
                    return newTier;
                }
            }
        }
        else {
            existing.tier = newTier;
            existing.signal = signal;
            existing.consecutive = 1;
            existing.direction = direction;
        }
        return existing.tier;
    }
    tierToNumber(tier) {
        const map = { T0: 0, T1: 1, T2: 2, T3: 3 };
        return map[tier];
    }
    getThresholdsForTransition(from, to, isPromotion) {
        const fromNum = this.tierToNumber(from);
        const toNum = this.tierToNumber(to);
        if (isPromotion) {
            if (toNum === 1)
                return [this.thresholds[0] + this.hysteresis.promote, 0];
            if (toNum === 2)
                return [this.thresholds[1] + this.hysteresis.promote, 0];
            if (toNum === 3)
                return [this.thresholds[2] + this.hysteresis.promote, 0];
        }
        else {
            if (fromNum === 1)
                return [0, this.thresholds[0] - this.hysteresis.demote];
            if (fromNum === 2)
                return [0, this.thresholds[1] - this.hysteresis.demote];
            if (fromNum === 3)
                return [0, this.thresholds[2] - this.hysteresis.demote];
        }
        return [0, 0];
    }
    getState(componentId) {
        const state = this.currentState.get(componentId);
        if (!state)
            return null;
        return { tier: state.tier, signal: state.signal };
    }
    overrideTier(componentId, tier) {
        this.currentState.set(componentId, {
            tier,
            signal: tierToSignal(tier),
            consecutive: 1,
            direction: null,
        });
    }
    reset(componentId) {
        this.currentState.delete(componentId);
    }
    resetAll() {
        this.currentState.clear();
    }
    getAllStates() {
        const result = {};
        for (const [id, state] of this.currentState) {
            result[id] = { tier: state.tier, signal: state.signal };
        }
        return result;
    }
}
function tierToSignal(tier) {
    const map = {
        T0: 0.1,
        T1: 0.4,
        T2: 0.675,
        T3: 0.9,
    };
    return map[tier];
}
