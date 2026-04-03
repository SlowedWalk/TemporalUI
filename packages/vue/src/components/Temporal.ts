import {
  defineComponent,
  h,
  provide,
  inject,
  ref,
  computed,
  onMounted,
  onUnmounted,
  reactive,
  type PropType,
  type VNode,
  type Ref,
} from 'vue';
import {
  TemporalEngine,
  type TemporalConfig,
  type Tier,
  type DensityProfile,
} from '@temporalui/core';

export type { Tier, DensityProfile };

export interface TemporalRootContextValue {
  engine: TemporalEngine;
  config: TemporalConfig;
  debug: boolean;
}

const TemporalRootKey = 'temporal-root';

export interface TemporalZoneProps {
  config?: TemporalConfig;
  debug?: boolean;
}

export const TemporalZone = defineComponent({
  name: 'TemporalZone',
  props: {
    config: {
      type: Object as PropType<TemporalConfig>,
      default: () => ({}),
    },
    debug: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }): () => VNode {
    const engine = new TemporalEngine({ config: props.config });
    const isReady = ref(false);

    engine.init().then(() => {
      isReady.value = true;
    });

    const value: TemporalRootContextValue = {
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

export function useTemporalRoot(): TemporalRootContextValue {
  const context = inject<TemporalRootContextValue>(TemporalRootKey);
  if (!context) {
    throw new Error('[TemporalUI] useTemporalRoot must be used within TemporalZone');
  }
  return context;
}

export interface TierContextValue {
  tier: Tier;
  signal: number;
  componentId: string;
  domain?: string;
  is: (tier: Tier) => boolean;
  atLeast: (tier: Tier) => boolean;
  reset: () => Promise<void>;
  override: (tier: Tier) => void;
  density: DensityProfile;
}

const TierKey = 'temporal-tier';

export interface TemporalProps {
  id: string;
  domain?: string;
  coldStartTier?: Tier;
  observe?: boolean;
  onTierChange?: (previous: Tier, next: Tier) => void;
}

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
      type: String as PropType<Tier>,
      default: 'T0',
    },
    observe: {
      type: Boolean,
      default: true,
    },
    onTierChange: {
      type: Function as PropType<(previous: Tier, next: Tier) => void>,
      default: undefined,
    },
  },
  setup(props, { slots }): () => VNode {
    const { engine } = useTemporalRoot();
    const elementRef = ref<HTMLElement | null>(null);

    const state = reactive<{ tier: Tier; signal: number }>({
      tier: props.coldStartTier as Tier,
      signal: 0,
    });

    const is = (tier: Tier): boolean => state.tier === tier;

    const atLeast = (tier: Tier): boolean => {
      const tierOrder = ['T0', 'T1', 'T2', 'T3'] as const;
      return tierOrder.indexOf(state.tier) >= tierOrder.indexOf(tier);
    };

    const reset = async () => {
      await engine.reset(props.id, props.domain);
      state.tier = props.coldStartTier as Tier;
      state.signal = 0;
    };

    const override = (tier: Tier) => {
      engine.overrideTier(props.id, props.domain, tier);
      state.tier = tier;
      state.signal = tierToSignal(tier);
    };

    const density = computed(() => engine.getDensityProfile(state.tier));

    onMounted(async () => {
      if (props.coldStartTier !== 'T0') {
        engine.setColdStartTier(props.coldStartTier as Tier);
      }

      engine.registerComponent(props.id, props.domain, props.coldStartTier as Tier);

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

    let observer: any;
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

    const contextValue: TierContextValue = {
      tier: computed(() => state.tier) as unknown as Tier,
      signal: computed(() => state.signal) as unknown as number,
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
      const map = new Map<string | undefined, VNode[]>();

      defaultSlot.forEach((child: VNode) => {
        if (child.type && (child.type as any).name === 'AdaptiveTier') {
          const tierValue = (child.props as any)?.tier;
          if (!map.has(tierValue)) {
            map.set(tierValue, []);
          }
          map.get(tierValue)!.push(child);
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
        const t = `T${i}` as Tier;
        if (tierNodes.value.has(t)) {
          return tierNodes.value.get(t);
        }
      }

      return tierNodes.value.get(undefined);
    });

    return () => {
      return h(
        'div',
        {
          ref: elementRef,
          'data-temporal-id': props.id,
          'data-temporal-tier': state.tier,
          'data-temporal-signal': state.signal,
        },
        resolved.value || slots.default?.()
      );
    };
  },
});

function tierToSignal(tier: Tier): number {
  const map: Record<Tier, number> = {
    T0: 0.1,
    T1: 0.4,
    T2: 0.675,
    T3: 0.9,
  };
  return map[tier];
}
