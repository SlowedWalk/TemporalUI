import { inject } from 'vue';
const TierKey = 'temporal-tier';
export function useTemporal(id, domain) {
    const context = inject(TierKey);
    if (!context) {
        throw new Error(`[TemporalUI] useTemporal('${id}') must be used within a Temporal component`);
    }
    return {
        tier: context.tier,
        signal: context.signal,
        componentId: context.componentId,
        domain: context.domain,
        is: context.is,
        atLeast: context.atLeast,
        reset: context.reset,
        override: context.override,
    };
}
export function useAdaptation() {
    const context = inject(TierKey);
    if (!context) {
        return {
            density: {
                profileName: 'comfortable',
                labelStyle: 'full',
                iconLabels: 'hover',
                tooltipDelay: 500,
                density: 0.8,
            },
            labelStyle: 'full',
            iconMode: 'hover',
            tooltipDelay: 500,
        };
    }
    return {
        density: context.density,
        labelStyle: context.density.labelStyle,
        iconMode: context.density.iconLabels,
        tooltipDelay: context.density.tooltipDelay,
    };
}
