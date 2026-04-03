import { defineComponent, h, inject, computed, } from 'vue';
const TierKey = 'temporal-tier';
export const AdaptiveSlot = defineComponent({
    name: 'AdaptiveSlot',
    setup(_props, { slots }) {
        const context = inject(TierKey);
        const currentTier = computed(() => context?.tier ?? 'T0');
        const tierNodes = computed(() => {
            const defaultSlot = slots.default?.() || [];
            const map = new Map();
            defaultSlot.forEach((child) => {
                if (child.type && child.type.name === 'AdaptiveTier') {
                    const tierValue = child.props?.tier;
                    if (!map.has(tierValue)) {
                        map.set(tierValue, []);
                    }
                    map.get(tierValue).push(child);
                }
            });
            return map;
        });
        const resolved = computed(() => {
            const ct = currentTier.value;
            if (tierNodes.value.has(ct)) {
                return tierNodes.value.get(ct);
            }
            for (let i = parseInt(ct.slice(1)); i >= 0; i--) {
                const t = `T${i}`;
                if (tierNodes.value.has(t)) {
                    return tierNodes.value.get(t);
                }
            }
            return tierNodes.value.get(undefined);
        });
        return () => h('span', { class: 'adaptive-slot' }, resolved.value);
    },
});
export const AdaptiveTier = defineComponent({
    name: 'AdaptiveTier',
    props: {
        tier: {
            type: String,
            default: undefined,
        },
    },
    setup(_props, { slots }) {
        return () => slots.default?.() || null;
    },
});
