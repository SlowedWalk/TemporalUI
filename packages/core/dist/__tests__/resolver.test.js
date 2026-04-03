import { describe, it, expect, beforeEach } from 'vitest';
import { AdaptationResolver } from '../engine/resolver';
describe('AdaptationResolver', () => {
    let resolver;
    beforeEach(() => {
        resolver = new AdaptationResolver();
    });
    describe('mapSignalToTier', () => {
        it('should map 0-0.25 to T0', () => {
            expect(resolver.mapSignalToTier(0)).toBe('T0');
            expect(resolver.mapSignalToTier(0.1)).toBe('T0');
            expect(resolver.mapSignalToTier(0.24)).toBe('T0');
        });
        it('should map 0.25-0.55 to T1', () => {
            expect(resolver.mapSignalToTier(0.25)).toBe('T1');
            expect(resolver.mapSignalToTier(0.4)).toBe('T1');
            expect(resolver.mapSignalToTier(0.54)).toBe('T1');
        });
        it('should map 0.55-0.80 to T2', () => {
            expect(resolver.mapSignalToTier(0.55)).toBe('T2');
            expect(resolver.mapSignalToTier(0.7)).toBe('T2');
            expect(resolver.mapSignalToTier(0.79)).toBe('T2');
        });
        it('should map 0.80-1.0 to T3', () => {
            expect(resolver.mapSignalToTier(0.8)).toBe('T3');
            expect(resolver.mapSignalToTier(0.9)).toBe('T3');
            expect(resolver.mapSignalToTier(1.0)).toBe('T3');
        });
    });
    describe('resolveTier', () => {
        it('should resolve tier for new component', () => {
            const tier = resolver.resolveTier('new-component', 0.5);
            expect(tier).toBe('T1');
        });
        it('should require hysteresis for promotion', () => {
            resolver.resolveTier('test', 0.2);
            resolver.resolveTier('test', 0.3);
            const tier = resolver.resolveTier('test', 0.31);
            expect(tier).toBe('T1');
        });
        it('should apply custom thresholds', () => {
            const customResolver = new AdaptationResolver({
                thresholds: [0.3, 0.6, 0.85],
            });
            expect(customResolver.mapSignalToTier(0.2)).toBe('T0');
            expect(customResolver.mapSignalToTier(0.4)).toBe('T1');
            expect(customResolver.mapSignalToTier(0.7)).toBe('T2');
            expect(customResolver.mapSignalToTier(0.9)).toBe('T3');
        });
    });
    describe('overrideTier', () => {
        it('should allow manual override', () => {
            resolver.resolveTier('test', 0.2);
            resolver.overrideTier('test', 'T3');
            const state = resolver.getState('test');
            expect(state?.tier).toBe('T3');
        });
    });
    describe('reset', () => {
        it('should reset component state', () => {
            resolver.resolveTier('test', 0.5);
            resolver.reset('test');
            const state = resolver.getState('test');
            expect(state).toBeNull();
        });
    });
});
