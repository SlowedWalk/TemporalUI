import {
  defineComponent,
  h,
  inject,
  computed,
  type VNode,
} from 'vue';
import type { Tier, DensityProfile } from '@temporalui/core';

const TierKey = 'temporal-tier';

interface TierContextValue {
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

export interface AdaptiveSlotProps {
  default?: VNode | VNode[];
}

export const AdaptiveSlot = defineComponent({
  name: 'AdaptiveSlot',
  setup(_props, { slots }) {
    const context = inject<TierContextValue>(TierKey);

    const currentTier = computed(() => context?.tier ?? 'T0');

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
      const ct = currentTier.value;
      if (tierNodes.value.has(ct)) {
        return tierNodes.value.get(ct);
      }

      for (let i = parseInt(ct.slice(1)); i >= 0; i--) {
        const t = `T${i}` as Tier;
        if (tierNodes.value.has(t)) {
          return tierNodes.value.get(t);
        }
      }

      return tierNodes.value.get(undefined);
    });

    return () => h('span', { class: 'adaptive-slot' }, resolved.value);
  },
});

export interface AdaptiveTierProps {
  tier?: Tier | `${Tier}|${Tier}` | `${Tier}+`;
}

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
