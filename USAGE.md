# TemporalUI Guide

TemporalUI is a UI framework that makes interfaces adaptive. Components observe user interactions and automatically adjust their complexity based on user proficiency (T0-T3 tiers).

## Installation

```bash
npm install @temporalui/core @temporalui/react
```

## Core Concepts

### Tiers (Proficiency Levels)

- **T0 (Beginner)**: Full guidance, spacious layout, tooltips always visible
- **T1 (Novice)**: Comfortable layout, tooltips on hover
- **T2 (Intermediate)**: Compact layout, abbreviated labels
- **T3 (Expert)**: Dense layout, minimal UI, keyboard-first

### Signal Types

The system tracks 5 signals to compute proficiency:
- `engagement_depth` - How deeply users engage with features
- `session_recurrence` - How often users return
- `dismissal_rate` - How often users dismiss help
- `time_to_interact` - How quickly users take action
- `error_recovery` - How well users recover from errors

---

## React

### Setup

```tsx
import { TemporalZone, Temporal, AdaptiveSlot, AdaptiveTier } from '@temporalui/react';

function App() {
  return (
    <TemporalZone config={{ classifier: { weights: { engagement_depth: 0.4 } } }}>
      <Dashboard />
    </TemporalZone>
  );
}
```

### Using the Temporal Component

```tsx
import { Temporal, useTemporal } from '@temporalui/react';

function FeaturePanel() {
  return (
    <Temporal id="feature-panel" domain="dashboard" coldStartTier="T1">
      <AdaptiveSlot>
        <AdaptiveTier tier="T0">
          <BeginnerView />
        </AdaptiveTier>
        <AdaptiveTier tier="T1">
          <NoviceView />
        </AdaptiveTier>
        <AdaptiveTier tier="T2">
          <IntermediateView />
        </AdaptiveTier>
        <AdaptiveTier tier="T3">
          <ExpertView />
        </AdaptiveTier>
      </AdaptiveSlot>
    </Temporal>
  );
}
```

### Using the Hook

```tsx
import { useTemporal } from '@temporalui/react';

function ControlPanel() {
  const { tier, signal, is, atLeast, reset, override } = useTemporal('control-panel');
  
  return (
    <div>
      <p>Current tier: {tier}</p>
      <p>Signal: {(signal * 100).toFixed(0)}%</p>
      
      {is('T0') && <HelpTooltip />}
      
      {atLeast('T2') && <AdvancedOptions />}
      
      <button onClick={reset}>Reset Progress</button>
      <button onClick={() => override('T3')}>Skip to Expert</button>
    </div>
  );
}
```

### Configuration Options

```tsx
<TemporalZone
  config={{
    classifier: {
      weights: {
        engagement_depth: 0.3,
        session_recurrence: 0.25,
        dismissal_rate: 0.2,
        time_to_interact: 0.15,
        error_recovery: 0.1,
      },
      tierThresholds: [0.25, 0.55, 0.8],
      hysteresis: { promote: 0.05, demote: 0.05 },
    },
    storage: {
      namespace: 'myapp',
      maxEventsPerComponent: 2000,
      retentionDays: 180,
    },
    density: {
      profiles: {
        T0: { profileName: 'spacious', labelStyle: 'full', iconLabels: 'always', tooltipDelay: 200, density: 1.0 },
        T1: { profileName: 'comfortable', labelStyle: 'full', iconLabels: 'hover', tooltipDelay: 500, density: 0.8 },
        T2: { profileName: 'compact', labelStyle: 'short', iconLabels: 'hover', tooltipDelay: 800, density: 0.6 },
        T3: { profileName: 'dense', labelStyle: 'icon-only', iconLabels: 'hidden', tooltipDelay: 1200, density: 0.4 },
      },
    },
  }}
>
  {children}
</TemporalZone>
```

---

## Vue 3

### Setup

```vue
<script setup>
import { TemporalZone, Temporal, AdaptiveSlot, AdaptiveTier } from '@temporalui/vue';
</script>

<template>
  <TemporalZone :config="{ classifier: { weights: { engagement_depth: 0.4 } } }">
    <Dashboard />
  </TemporalZone>
</template>
```

### Using the Component

```vue
<script setup>
import { ref } from 'vue';
import { useTemporal } from '@temporalui/vue';

const { tier, signal, is, atLeast, reset, override } = useTemporal('my-component');

const handleReset = async () => {
  await reset();
};
</script>

<template>
  <div>
    <p>Tier: {{ tier }}</p>
    <p>Signal: {{ (signal * 100).toFixed(0) }}%</p>
    
    <button v-if="is('T0')" @click="override('T1')">
      Dismiss Help
    </button>
    
    <button @click="handleReset">Reset</button>
  </div>
</template>
```

### Adaptive Rendering

```vue
<template>
  <Temporal id="feature-panel">
    <AdaptiveSlot>
      <AdaptiveTier tier="T0">
        <BeginnerView />
      </AdaptiveTier>
      <AdaptiveTier tier="T3">
        <ExpertView />
      </AdaptiveTier>
    </AdaptiveSlot>
  </Temporal>
</template>
```

---

## Svelte

### Setup

```svelte
<script lang="ts">
import { createTemporalZone, computeTier, observeComponent, getDensityProfile } from '@temporalui/svelte';
import { onMount } from 'svelte';

let engine: TemporalEngine;
let tier = $state('T0');

onMount(async () => {
  engine = createTemporalZone({ config: {} });
  const result = await computeTier('my-component');
  tier = result.tier;
});
</script>
```

### With DOM Observation

```svelte
<script lang="ts">
import { onMount } from 'svelte';
import { createTemporalZone, computeTier, observeComponent, stopObserving } from '@temporalui/svelte';

let element: HTMLElement;
let result: any;

onMount(async () => {
  const engine = createTemporalZone();
  result = await computeTier('feature-panel');
  
  observeComponent('feature-panel, element);
  
  return () => {
    stopObserving('feature-panel');
  };
});
</script>

<div bind:this={element} data-temporal-id="feature-panel">
  <p>Tier: {result.tier}</p>
</div>
```

### API Reference

```typescript
// Initialize a temporal zone
const engine = createTemporalZone({ config: { /* options */ } });

// Compute tier for a component
const result = await computeTier('component-id', 'domain', 'T0');

// Observe DOM interactions
observeComponent('component-id', element, 'domain');
stopObserving('component-id', 'domain');

// Get density profile for tier
const density = getDensityProfile('T2');
```

---

## Angular

### Setup

```typescript
import { TemporalDirective, TemporalSlotDirective } from '@temporalui/angular';

@Component({
  template: `
    <div [temporal]="componentId"
         [temporalDomain]="'dashboard'"
         [temporalColdStartTier]="'T1'"
         (temporalTierChange)="onTierChange($event)">
      {{ tier }}
    </div>
  `,
  imports: [TemporalDirective],
})
export class MyComponent {
  componentId = 'my-feature';
  tier = 'T0';
  
  onTierChange(event: { previous: Tier; current: Tier }) {
    console.log('Tier changed:', event);
  }
}
```

### Service API

```typescript
import { TemporalZoneService } from '@temporalui/angular';

@Component({
  template: `
    <button (click)="reset()">Reset</button>
  `,
})
export class ControlComponent {
  constructor(private temporal: TemporalZoneService) {}
  
  async registerComponent() {
    const state = await this.temporal.registerComponent('my-id', 'domain', 'T0');
    console.log(state.tier); // Current tier
  }
  
  async reset() {
    await this.temporal.reset('my-id', 'domain');
  }
  
  override(tier: Tier) {
    this.temporal.override('my-id', 'domain', tier);
  }
}
```

### Directive Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `temporalId` | string | required | Unique component identifier |
| `temporalDomain` | string | undefined | Optional domain grouping |
| `temporalColdStartTier` | Tier | 'T0' | Initial tier before data |
| `temporalObserve` | boolean | true | Enable DOM observation |
| `temporalDebug` | boolean | false | Enable debug logging |

---

## DevTools

Enable the DevTools panel for debugging:

```typescript
import { TemporalEngine } from '@temporalui/core';
import { initDevTools } from '@temporalui/devtools';

const engine = new TemporalEngine();
await engine.init();

initDevTools(engine);
```

Press `t` to toggle the panel. Features:
- View all tracked components and their tiers
- See real-time event stream
- View signal weights
- Export/clear data

---

## Tier Transition Examples

### Beginner to Expert Flow

| User Action | Signal Change | Tier |
|------------|---------------|------|
| First visit | +0.1 (session_recurrence) | T0 → T0 |
| Uses tooltips | +0.15 (engagement_depth) | T0 → T1 |
| Dismisses help | +0.2 (dismissal_rate) | T1 → T2 |
| Returns 5+ times | +0.25 (session_recurrence) | T2 → T3 |
| Uses keyboard shortcuts | +0.3 (engagement_depth) | T3 |

### Configuration for Faster Promotion

```typescript
const config = {
  classifier: {
    tierThresholds: [0.15, 0.35, 0.6], // Lower thresholds
    hysteresis: { promote: 0.02, demote: 0.08 }, // Easier to promote
  },
};
```

---

## Storage

Data is stored in:
- **IndexedDB**: Primary storage for interaction events
- **localStorage**: Cache for quick access

All data is namespaced to avoid conflicts. In private browsing mode, it gracefully degrades to memory-only.

---

## Type Reference

```typescript
type Tier = 'T0' | 'T1' | 'T2' | 'T3';

interface DensityProfile {
  profileName: 'spacious' | 'comfortable' | 'compact' | 'dense';
  labelStyle: 'full' | 'short' | 'icon-only';
  iconLabels: 'always' | 'hover' | 'hidden';
  tooltipDelay: number;
  density: number;
}

interface ComponentState {
  tier: Tier;
  signal: number;
  lastUpdated: number;
}
```
