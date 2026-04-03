import { defineComponent, h, provide, inject, ref, computed, onMounted, onUnmounted, reactive, } from 'vue';
import { TemporalEngine, } from '@temporalui/core';
const TemporalRootKey = 'temporal-root';
export const TemporalZone = defineComponent({
    name: 'TemporalZone',
    props: {
        config: {
            type: Object,
            default: () => ({}),
        },
        debug: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { slots }) {
        const engine = new TemporalEngine({ config: props.config });
        const isReady = ref(false);
        engine.init().then(() => {
            isReady.value = true;
        });
        const value = {
            engine,
            config: props.config,
            debug: props.debug,
        };
        provide(TemporalRootKey, value);
        return () => {
            const defaultSlot = slots.default?.();
            return h('div', { class: 'temporal-zone' }, defaultSlot);
        };
    },
});
export function useTemporalRoot() {
    const context = inject(TemporalRootKey);
    if (!context) {
        throw new Error('[TemporalUI] useTemporalRoot must be used within TemporalZone');
    }
    return context;
}
const TierKey = 'temporal-tier';
export const Temporal = defineComponent({
    name: 'Temporal',
    props: {
        id: {
            type: String,
            required: true,
        },
        domain: {
            type: String,
            default: undefined,
        },
        coldStartTier: {
            type: String,
            default: 'T0',
        },
        observe: {
            type: Boolean,
            default: true,
        },
        onTierChange: {
            type: Function,
            default: undefined,
        },
    },
    setup(props, { slots }) {
        const { engine } = useTemporalRoot();
        const elementRef = ref(null);
        const state = reactive({
            tier: props.coldStartTier,
            signal: 0,
        });
        const is = (tier) => state.tier === tier;
        const atLeast = (tier) => {
            const tierOrder = ['T0', 'T1', 'T2', 'T3'];
            return tierOrder.indexOf(state.tier) >= tierOrder.indexOf(tier);
        };
        const reset = async () => {
            await engine.reset(props.id, props.domain);
            state.tier = props.coldStartTier;
            state.signal = 0;
        };
        const override = (tier) => {
            engine.overrideTier(props.id, props.domain, tier);
            state.tier = tier;
            state.signal = tierToSignal(tier);
        };
        const density = computed(() => engine.getDensityProfile(state.tier));
        onMounted(async () => {
            if (props.coldStartTier !== 'T0') {
                engine.setColdStartTier(props.coldStartTier);
            }
            engine.registerComponent(props.id, props.domain, props.coldStartTier);
            if (props.onTierChange) {
                engine.onTierChange((componentId, previous, current) => {
                    const key = props.domain ? `${props.domain}:${props.id}` : props.id;
                    if (componentId === key) {
                        props.onTierChange?.(previous, current);
                    }
                });
            }
            const result = await engine.computeTier(props.id, props.domain);
            state.tier = result.tier;
            state.signal = result.signal;
        });
        let observer;
        onMounted(() => {
            if (props.observe && elementRef.value) {
                observer = engine.observeComponent(props.id, elementRef.value, props.domain);
            }
        });
        onUnmounted(() => {
            if (props.observe && observer) {
                engine.stopObserving(props.id, props.domain);
            }
        });
        const contextValue = {
            tier: computed(() => state.tier),
            signal: computed(() => state.signal),
            componentId: props.id,
            domain: props.domain,
            is,
            atLeast,
            reset,
            override,
            density: density.value,
        };
        provide(TierKey, contextValue);
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
            const currentTier = state.tier;
            if (tierNodes.value.has(currentTier)) {
                return tierNodes.value.get(currentTier);
            }
            for (let i = parseInt(currentTier.slice(1)); i >= 0; i--) {
                const t = `T${i}`;
                if (tierNodes.value.has(t)) {
                    return tierNodes.value.get(t);
                }
            }
            return tierNodes.value.get(undefined);
        });
        return () => {
            return h('div', {
                ref: elementRef,
                'data-temporal-id': props.id,
                'data-temporal-tier': state.tier,
                'data-temporal-signal': state.signal,
            }, resolved.value || slots.default?.());
        };
    },
});
function tierToSignal(tier) {
    const map = {
        T0: 0.1,
        T1: 0.4,
        T2: 0.675,
        T3: 0.9,
    };
    return map[tier];
}
