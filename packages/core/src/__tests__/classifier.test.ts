import { describe, it, expect, beforeEach } from 'vitest';
import { ProficiencyClassifier } from '../engine/classifier';
import type { LedgerEntry, SignalWeights } from '../types';

describe('ProficiencyClassifier', () => {
  let classifier: ProficiencyClassifier;

  beforeEach(() => {
    classifier = new ProficiencyClassifier();
  });

  describe('compute', () => {
    it('should return minimal signal for empty ledger', () => {
      const result = classifier.compute([]);
      expect(result.rawSignal).toBeLessThan(0.2);
    });

    it('should compute basic signal from entries', () => {
      const entries: LedgerEntry[] = [
        { id: '1', componentKey: 'test', eventType: 't:click', timestamp: 1000, sessionIndex: 0, depth: 'surface' },
        { id: '2', componentKey: 'test', eventType: 't:click', timestamp: 2000, sessionIndex: 0, depth: 'deep' },
      ];
      const result = classifier.compute(entries);
      expect(result.rawSignal).toBeGreaterThan(0);
    });

    it('should weight session_recurrence higher for more sessions', () => {
      const singleSession: LedgerEntry[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        componentKey: 'test',
        eventType: 't:click' as const,
        timestamp: 1000 + i,
        sessionIndex: 0,
        depth: 'surface' as const,
      }));

      const multipleSessions: LedgerEntry[] = [
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `s0-${i}`,
          componentKey: 'test',
          eventType: 't:click' as const,
          timestamp: 1000 + i,
          sessionIndex: 0,
          depth: 'surface' as const,
        })),
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `s1-${i}`,
          componentKey: 'test',
          eventType: 't:click' as const,
          timestamp: 100000 + i,
          sessionIndex: 1,
          depth: 'surface' as const,
        })),
      ];

      const singleResult = classifier.compute(singleSession);
      const multiResult = classifier.compute(multipleSessions);

      expect(multiResult.scores.session_recurrence).toBeGreaterThan(singleResult.scores.session_recurrence);
    });

    it('should compute high score for deep actions', () => {
      const surfaceOnly: LedgerEntry[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        componentKey: 'test',
        eventType: 't:click' as const,
        timestamp: 1000 + i,
        sessionIndex: 0,
        depth: 'surface' as const,
      }));

      const deepActions: LedgerEntry[] = [
        ...surfaceOnly,
        { id: 'deep1', componentKey: 'test', eventType: 't:deep-action', timestamp: 5000, sessionIndex: 0, depth: 'deep' },
        { id: 'deep2', componentKey: 'test', eventType: 't:deep-action', timestamp: 6000, sessionIndex: 0, depth: 'deep' },
      ];

      const surfaceResult = classifier.compute(surfaceOnly);
      const deepResult = classifier.compute(deepActions);

      expect(deepResult.scores.engagement_depth).toBeGreaterThan(surfaceResult.scores.engagement_depth);
    });
  });

  describe('hysteresis', () => {
    it('should not change signal without crossing threshold', () => {
      const result = classifier.applyHysteresis(0.29, 0.24, 'promote');
      expect(result).toBe(0.24);
    });

    it('should promote when threshold exceeded', () => {
      const result = classifier.applyHysteresis(0.35, 0.20, 'promote');
      expect(result).toBe(0.35);
    });
  });

  describe('custom weights', () => {
    it('should use custom weights when provided', () => {
      const customClassifier = new ProficiencyClassifier({
        weights: {
          engagement_depth: 0.5,
          session_recurrence: 0.1,
          dismissal_rate: 0.1,
          time_to_interact: 0.1,
          error_recovery: 0.2,
        },
      });

      const entries: LedgerEntry[] = [
        { id: '1', componentKey: 'test', eventType: 't:click', timestamp: 1000, sessionIndex: 0, depth: 'deep' },
      ];

      const result = customClassifier.compute(entries);
      expect(result.scores.engagement_depth).toBeGreaterThan(0.5);
    });
  });
});
