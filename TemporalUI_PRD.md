# TemporalUI — Product & Technical Reference

> *"A UI framework where interfaces have memory and time."*

**Status:** Concept / Pre-Alpha &nbsp;|&nbsp; **Version:** 0.1.0 &nbsp;|&nbsp; **Paradigm:** Temporal-Adaptive UI &nbsp;|&nbsp; **License:** MIT (proposed) &nbsp;|&nbsp; **Document date:** March 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Vision & Design Principles](#3-vision--design-principles)
4. [Core Concepts](#4-core-concepts)
5. [Architecture Overview](#5-architecture-overview)
6. [The Temporal Engine](#6-the-temporal-engine)
7. [Adaptation Layers](#7-adaptation-layers)
8. [Component API Reference](#8-component-api-reference)
9. [Storage & Privacy Model](#9-storage--privacy-model)
10. [Proficiency Classification](#10-proficiency-classification)
11. [Developer Experience](#11-developer-experience)
12. [Competitive Landscape](#12-competitive-landscape)
13. [Roadmap](#13-roadmap)
14. [Risks & Mitigations](#14-risks--mitigations)
15. [Success Metrics](#15-success-metrics)
16. [Appendix](#16-appendix)

---

## 1. Executive Summary

Every UI framework built today treats each user session as a fresh slate. React renders what you tell it. Angular binds what you declare. Neither knows that a specific user has clicked the "Advanced Settings" button forty times, never touched the onboarding tooltip, or always navigates from the dashboard to the reports module within three seconds. The interface is stateless by design — and that design choice silently costs users thousands of hours of friction per year.

**TemporalUI** is a JavaScript/TypeScript UI framework that introduces *temporal awareness* as a first-class primitive. Components observe, remember, and adapt. The framework ships with a lightweight on-device interaction ledger, a multi-signal proficiency classifier, and a declarative adaptation DSL that lets developers specify *intent* ("promote this feature for power users") rather than hardcode behavior variants.

> **Core Proposition:** TemporalUI makes interfaces intelligent — not through a server-side ML pipeline or behavioral analytics dashboard, but through a self-contained, privacy-respecting temporal engine that runs entirely on the client, requiring zero backend changes and zero configuration from the end user.

The framework targets web application developers building tools, SaaS products, and enterprise software where users grow from novice to expert over time and the interface should grow with them. It is framework-agnostic at the adapter layer and designed to coexist with React, Vue, Angular, and Svelte via thin integration packages.

---

## 2. Problem Statement

### The Statelessness Tax

Modern UI frameworks inherit a fundamental assumption from the web's document-delivery origins: the interface is a pure function of application state. `Render(appState) → DOM`. This model is elegant, testable, and composable — but it discards an enormous amount of signal: who the user is in terms of experience, what they have already discovered, how they habitually navigate, and what friction points they consistently encounter.

The result is interfaces that:

- **Insult experienced users** by surfacing onboarding tooltips and "beginner" affordances to people who have used the product daily for two years.
- **Overwhelm new users** by presenting the full feature surface of a complex tool on their first session.
- **Stay frozen in their original layout** regardless of whether any user has ever actually clicked in the bottom-left corner where that feature lives.
- **Repeat themselves** — the same empty-state illustration, the same "get started" prompt, the same three-step wizard — every single session.

### What Developers Do Today

| Existing Approach | What it Solves | What it Misses |
|---|---|---|
| Feature flags / A/B testing | Controlled rollouts, population-level experiments | Individual history, real-time adaptation, proficiency |
| Behavioral analytics (Mixpanel, Heap) | Aggregate insight, funnel analysis | Per-user rendering decisions at component level |
| User onboarding SDKs (Pendo, Appcues) | Guided tours, tooltips | Layout adaptation, feature promotion, expertise tiers |
| Manual role-based UI | Admin vs regular user views | Continuous spectrum of proficiency, no reconfiguration |
| User preferences / settings pages | Explicit customization | Implicit learning, users who never touch settings |

None of these approaches treat the UI component itself as the owner of temporal intelligence. They all require either server infrastructure, separate analytics pipelines, or explicit user action. TemporalUI moves the intelligence into the render layer.

### The Opportunity

The client browser has abundant compute and persistent local storage. The interaction signals required to classify a user's proficiency are observable purely at the component level — no server roundtrip, no user survey, no data lake. The technical barrier to building temporal interfaces has collapsed; what is missing is a framework that makes this the default, not a bespoke engineering project.

---

## 3. Vision & Design Principles

TemporalUI's north star: *an interface that behaves like a thoughtful colleague who has watched you work.* It does not ask you what you know. It observes, infers, and adapts — silently, locally, and reversibly.

| # | Principle | Description |
|---|---|---|
| P-01 | **Zero Configuration** | Adaptation emerges from usage, not from developer-authored rules or user-completed surveys. The framework ships with sensible defaults and requires no setup beyond installation. |
| P-02 | **Local-First** | All interaction history and proficiency state lives on the device. No data leaves the browser unless the developer explicitly opts into sync. Privacy is the default, not a configuration. |
| P-03 | **Reversible Adaptation** | Every adaptation the framework makes can be overridden, paused, or reset by the user. The UI never locks someone into a mode they did not choose. |
| P-04 | **Composable Primitives** | Temporal awareness is exposed as small, composable hooks and directives. Developers combine them freely rather than adopting a monolithic rendering philosophy. |
| P-05 | **Graceful Degradation** | In private browsing, storage-blocked, or first-visit contexts, components render their default state with no errors, no blank screens, no console noise. |
| P-06 | **Observable State** | Every piece of temporal state the framework holds is inspectable through a devtools panel. No black boxes. Developers can see exactly what the engine knows and why it made each decision. |

> **Design Anti-Pattern:** TemporalUI is explicitly *not* a personalization engine, recommendation system, or behavioral manipulation tool. It adapts presentation complexity and layout density to observed proficiency. It does not use interaction history to nudge decisions, surface commercial promotions, or predict intent beyond interface efficiency.

---

## 4. Core Concepts

### The Interaction Ledger

Each TemporalUI component maintains an **Interaction Ledger** — a compact, append-only log of events associated with that component across all sessions. The ledger records: event type (click, hover, focus, dismiss, scroll-past), timestamp, session index, and duration-of-engagement. Ledger entries are stored in IndexedDB, scoped to a component identity key (an opaque hash derived from component name + route context).

The ledger is intentionally minimal. It stores no personally identifiable data and no content from user inputs. It is a pure behavioral trace at the component interaction layer.

### Proficiency Signal

From the ledger, the Temporal Engine computes a **Proficiency Signal** — a continuous scalar value between 0.0 (complete beginner) and 1.0 (expert) for a given component or feature area. The signal is derived from a weighted combination of sub-signals:

| Sub-Signal | Weight (default) | What it Measures |
|---|---|---|
| `engagement_depth` | 0.30 | Did the user reach sub-features, not just the top-level element? |
| `session_recurrence` | 0.25 | How many distinct sessions included interaction with this component? |
| `dismissal_rate` | 0.20 | How often does the user skip help/onboarding content near this component? |
| `time_to_interact` | 0.15 | How quickly does the user reach for this component after navigation? |
| `error_recovery` | 0.10 | Does the user self-correct without triggering help affordances? |

### Adaptation Tier

The Proficiency Signal maps onto one of four discrete **Adaptation Tiers**, which components use to gate their presentation mode:

| Tier | Signal Range | Display Name | Default Behavior |
|---|---|---|---|
| `T0` | 0.00 – 0.25 | Discovery | Full affordances, inline help, guided layout |
| `T1` | 0.25 – 0.55 | Familiar | Reduced onboarding noise, standard density |
| `T2` | 0.55 – 0.80 | Proficient | Compact layout, keyboard shortcut hints visible |
| `T3` | 0.80 – 1.00 | Expert | Maximum density, power features promoted, hints hidden |

### Temporal Scope

Temporal state is scoped along two axes:

- **Component scope** — proficiency is tracked per component, not per application. A user can be T3 in a data table component and T0 in a newly introduced charting panel.
- **Feature area scope** — developers can group components into named *domains* (e.g., `"reporting"`, `"settings"`) and the engine produces an aggregated domain-level signal in addition to the per-component signal.

### Adaptation Intent vs. Adaptation Rule

TemporalUI distinguishes between:

- **Intent declarations** — what the developer wants to happen at each tier (`at T3: show keyboard shortcut`, `at T0: show tooltip`). These are authored by the developer once.
- **Tier resolution** — which tier the current user is currently at. This is computed by the engine at runtime from the ledger.

The clean separation means developers never write conditional branches based on user history. They declare intent; the framework resolves it.

---

## 5. Architecture Overview

TemporalUI is structured in four horizontal layers, each independently testable and replaceable via adapter interfaces.

```
┌─────────────────────────────────────────────────────────────────┐
│  FRAMEWORK ADAPTERS                                             │
│  @temporalui/react  ·  @temporalui/vue  ·  @temporalui/angular │
│  @temporalui/svelte  ·  @temporalui/web-components              │
├─────────────────────────────────────────────────────────────────┤
│  COMPONENT PRIMITIVES    (core package: @temporalui/core)       │
│  <Temporal>  ·  <AdaptiveSlot>  ·  <TemporalZone>              │
│  useTemporal()  ·  useProfiler()  ·  useAdaptation()           │
├────────────────────────────┬────────────────────────────────────┤
│  TEMPORAL ENGINE           │  STORAGE LAYER                     │
│  TemporalObserver          │  InteractionLedger (IndexedDB)     │
│  ProficiencyClassifier     │  ProfileStore (localStorage)       │
│  AdaptationResolver        │  SyncAdapter (optional, pluggable) │
│  SignalAggregator          │  PrivacyGuard                      │
└────────────────────────────┴────────────────────────────────────┘
```

### Package Structure

| Package | Size (est.) | Responsibility |
|---|---|---|
| `@temporalui/core` | ~14 kB gz | Engine, ledger, primitives, storage |
| `@temporalui/react` | ~4 kB gz | React hooks + JSX component wrappers |
| `@temporalui/vue` | ~4 kB gz | Vue 3 composables + v-temporal directive |
| `@temporalui/angular` | ~5 kB gz | Angular directives + injection tokens |
| `@temporalui/devtools` | ~28 kB gz | Browser devtools panel (dev-only) |
| `@temporalui/sync` | ~6 kB gz | Optional cross-device sync adapter |

### Data Flow

1. A TemporalUI-wrapped component mounts. The `TemporalObserver` attaches interaction listeners (pointer, keyboard, focus, scroll) to the component's root element via a single shared event delegation contract.
2. Interaction events flow into the `InteractionLedger` as typed, timestamped entries. The ledger flushes to IndexedDB asynchronously, never blocking the render thread.
3. On each component mount (and on a configurable background interval), the `ProficiencyClassifier` reads the ledger and recomputes the Proficiency Signal for the relevant component/domain.
4. The `AdaptationResolver` maps the signal to a Tier and emits a reactive adaptation context value.
5. Child components subscribed to the adaptation context re-render with the appropriate intent declarations applied.

> **Performance Note:** Steps 3–5 are debounced and executed off the critical render path. On a cold page load, the component renders at its current tier immediately from the ProfileStore cache (`localStorage`, synchronous read). The full ledger recompute is a background task that never causes a layout-blocking rerender in the initial paint.

---

## 6. The Temporal Engine

### TemporalObserver

The `TemporalObserver` is the event-collection layer. It attaches to the DOM via a single delegated event listener on the TemporalZone boundary and routes events to their corresponding ledger entry by component identity. It is designed to have zero measurable impact on Interaction to Next Paint (INP) — all processing is async and deferred via `scheduler.postTask` (with `requestIdleCallback` fallback).

**Captured event types:**

| Event | Description |
|---|---|
| `t:click` | User pointer/touch activation |
| `t:hover-dwell` | Hover > 600ms (configurable), signals deliberate inspection |
| `t:focus` | Keyboard navigation into the component |
| `t:dismiss` | Closing a help popover, tooltip, or onboarding prompt |
| `t:scroll-past` | Scroll viewport passes element without stopping |
| `t:deep-action` | Interaction with a sub-feature marked as advanced |
| `t:error-self-recover` | Validation error followed by successful correction without help access |

### ProficiencyClassifier

The classifier runs a weighted scoring pass over the ledger for a given component key. The algorithm is intentionally transparent and inspectable — no neural network, no opaque model weights. Every scoring decision can be traced to a specific ledger entry.

```typescript
// Simplified proficiency computation pseudocode
function computeProficiency(ledger: LedgerEntry[], weights: SignalWeights): number {
  const sessions = groupBySessions(ledger);

  const signals = {
    engagement_depth:   scoreEngagementDepth(ledger),   // ratio of deep vs surface events
    session_recurrence: scoreRecurrence(sessions),       // log-scaled session count
    dismissal_rate:     scoreDismissalRate(ledger),      // help dismissals / help impressions
    time_to_interact:   scoreInteractSpeed(sessions),    // median first-interaction latency
    error_recovery:     scoreErrorRecovery(ledger),      // self-recoveries / total error events
  };

  const raw = Object.entries(signals).reduce(
    (acc, [k, v]) => acc + v * weights[k], 0
  );

  return Math.min(1.0, Math.max(0.0, raw));
}
```

### Tier Transition Hysteresis

To prevent jarring oscillation at tier boundaries (a user bumping between T1 and T2 repeatedly), the classifier implements hysteresis: promotion requires the signal to exceed the upper threshold by +0.05 for two consecutive evaluation cycles; demotion requires the signal to fall below the lower threshold by -0.05 for three consecutive cycles. Demotion is intentionally harder to trigger than promotion — the interface should not "forget" a user's expertise after a period of inactivity.

### Cold Start Handling

On a user's first session (empty ledger), the framework defaults to `T0 (Discovery)`. Developers can override the cold-start tier per component — a power-tool application may want to start at `T1` even for new users to avoid patronizing its technical audience.

```jsx
// Override cold-start tier for a specific component
<Temporal
  id="sql-editor"
  cold-start-tier="T1"
>
  <SqlEditorComponent />
</Temporal>
```

---

## 7. Adaptation Layers

TemporalUI exposes three independent adaptation layers. Developers use whichever combination is appropriate; they are not mutually dependent.

### Layer 1 — Visibility Adaptation

Control which UI elements are shown, hidden, or replaced based on tier.

```jsx
// React example
<AdaptiveSlot>
  <AdaptiveSlot.Tier tier="T0">
    <GettingStartedBanner />
  </AdaptiveSlot.Tier>

  <AdaptiveSlot.Tier tier="T1|T2">
    <ContextualHelp mode="compact" />
  </AdaptiveSlot.Tier>

  <AdaptiveSlot.Tier tier="T3">
    <KeyboardShortcutHint action="⌘K" />
  </AdaptiveSlot.Tier>
</AdaptiveSlot>
```

### Layer 2 — Density Adaptation

Adjust layout density, label verbosity, and whitespace automatically. The framework ships with four density profiles that map 1:1 to the tiers, but these are fully customizable via CSS custom properties on the `<TemporalZone>` root.

| Tier | Density Profile | Label Style | Icon Labels | Tooltip Delay |
|---|---|---|---|---|
| T0 | Spacious | Full text + description | Always visible | 200ms |
| T1 | Comfortable | Full text | On hover | 500ms |
| T2 | Compact | Short text | On hover | 800ms |
| T3 | Dense | Icons only (with title attr) | Hidden | 1200ms |

### Layer 3 — Feature Promotion

Advanced features that are buried in menus for beginners can be promoted to primary surfaces for expert users. Feature promotion is declared once; the engine handles placement.

```vue
<!-- Vue example — promote "Bulk Actions" to toolbar for T3 users -->
<DataTable>
  <template #toolbar>
    <TemporalPromote
      feature="bulk-actions"
      promote-at="T2"
      default-location="overflow-menu"
    >
      <BulkActionsButton />
    </TemporalPromote>
  </template>
</DataTable>
```

### Layout Memory

Beyond tier-based adaptation, TemporalUI also supports **positional memory** — components that can be repositioned by the user will remember and restore their position across sessions automatically when wrapped in `<Temporal memory="position">`. This applies to resizable panels, floating toolbars, collapsible sidebars, and draggable widgets.

```jsx
<Temporal id="sidebar-panel" memory="position size collapsed">
  <ResizableSidebar />
</Temporal>
```

> **Note:** TemporalUI does not modify text content authored by developers. It controls visibility, density, layout position, and feature promotion — not what the copy says. Localizing adaptation to these structural dimensions keeps the framework predictable and keeps content ownership with the developer.

---

## 8. Component API Reference

### Core Components

#### `<Temporal>`

Root boundary component. Wraps any subtree that should participate in temporal tracking. Establishes a TemporalContext that child components subscribe to.

| Prop | Type | Description |
|---|---|---|
| `id` | `string` (required) | Stable, unique identifier for this component context. Used as ledger key. |
| `domain` | `string` | Optional feature area grouping for aggregate proficiency scoring. |
| `memory` | `"position" \| "size" \| "collapsed" \| string[]` | Which physical state attributes to persist across sessions. |
| `cold-start-tier` | `"T0" \| "T1" \| "T2" \| "T3"` | Tier to assume before any ledger data exists. Default: `"T0"`. |
| `observe` | `boolean` | Whether to collect interaction events. Default: `true`. Set `false` to restore only, not track. |
| `onTierChange` | `(prev: Tier, next: Tier) => void` | Callback fired when tier transitions. Useful for analytics or A/B logging. |

#### `<AdaptiveSlot>`

Declarative conditional rendering based on current tier. Must be used inside a `<Temporal>` boundary. Only one child slot renders at a time.

| Prop | Type | Description |
|---|---|---|
| `fallback` | `ReactNode` | Content to render while tier is being resolved (cold-start flash prevention). |
| `animate` | `boolean` | Whether tier transitions should be animated. Default: `true`. |

Child `<AdaptiveSlot.Tier>` accepts:

| Prop | Type | Description |
|---|---|---|
| `tier` | `Tier \| TierRange \| string` | Which tier(s) this slot renders for. E.g., `"T2\|T3"` or `"T2+"` (T2 and above). |

#### `<TemporalZone>`

Application-level boundary. Place once near the root. Manages global configuration, shared storage instance, and the devtools connection. Also applies density CSS custom properties to the document root.

| Prop | Type | Description |
|---|---|---|
| `config` | `TemporalConfig` | Global configuration object (see Appendix A). |
| `storage` | `StorageAdapter` | Custom storage adapter. Default: built-in IndexedDB adapter. |
| `debug` | `boolean` | Enable devtools connection and verbose console output. |

### Core Hooks (React)

#### `useTemporal(id)`

Primary hook for consuming temporal state inside a component. Returns the current tier, proficiency signal, and adaptation utilities.

```typescript
const {
  tier,      // "T0" | "T1" | "T2" | "T3"
  signal,    // number 0.0–1.0
  is,        // (tier: Tier) => boolean
  atLeast,   // (tier: Tier) => boolean — T2+ pattern
  reset,     // () => void — clears ledger for this component
  override,  // (tier: Tier) => void — manual tier override
} = useTemporal('my-component-id');
```

#### `useAdaptation()`

Provides the current density profile and adaptation CSS classes for the nearest `<Temporal>` ancestor. Useful for custom styling that goes beyond the built-in density system.

```typescript
const { densityClass, labelStyle, iconMode } = useAdaptation();
```

#### `useProfiler(domain)`

Accesses the aggregated domain-level proficiency state. Use to build custom adaptation logic at the feature-area level.

```typescript
const { domainSignal, componentSignals, history } = useProfiler('reporting');
```

---

## 9. Storage & Privacy Model

### Storage Architecture

TemporalUI uses a two-tier storage model:

**Hot Store (localStorage)**
The current tier and proficiency signal for each tracked component are cached in `localStorage` under a namespaced key. This enables synchronous reads on page load with no IndexedDB latency, preventing the "flash of wrong tier" problem. The hot store is updated after each background ledger recompute.

**Cold Store (IndexedDB)**
The full interaction ledger is persisted in IndexedDB. Writes are always async and batched in 2-second windows. The cold store is the source of truth for proficiency recomputation and is read only during background classification passes, never during rendering.

### Data Retention Policy

The ledger applies automatic retention limits to prevent unbounded storage growth:

- **Event cap:** 2,000 events per component key (configurable, max 10,000)
- **Time cap:** Events older than 180 days are evicted (configurable)
- **Storage cap:** If total TemporalUI storage exceeds 10 MB, oldest events are evicted proportionally

### Privacy Guarantees

> **Privacy First:** The framework never transmits interaction data to any server by default. The `@temporalui/sync` package is an explicit opt-in, requires developer configuration, and requires user consent flow implementation by the developer. The core package has no network requests.

- No PII is stored — ledger entries contain only event type, timestamp, and component key hash
- Component key hashes are computed from developer-supplied IDs, not user identity
- The framework exposes a `temporalui.clearAll()` browser console API for users who wish to reset their state
- Storage is origin-scoped — temporal state from site A is never accessible to site B
- The devtools panel marks itself as development-only and is excluded from production builds via tree-shaking

### Cross-Device Sync (Optional)

The `@temporalui/sync` package provides a pluggable sync adapter interface. Developers implement the adapter against their own backend. The sync protocol transmits only the compressed proficiency signal vector — not the raw event ledger. This keeps sync payloads small (<1 kB per user) while allowing expert users to carry their tier state across devices.

```typescript
// Using the sync adapter with a custom backend
import { createSyncAdapter } from '@temporalui/sync';

const syncAdapter = createSyncAdapter({
  push: async (profile) => myApi.post('/temporal-profile', profile),
  pull: async ()        => myApi.get('/temporal-profile'),
  conflictStrategy: 'higher-signal-wins',
});
```

---

## 10. Proficiency Classification

### Signal Calibration

Each sub-signal is normalized to a 0.0–1.0 range using domain-specific heuristics derived from UX research on expert performance acquisition. The normalization curves are intentionally non-linear — early sessions produce rapid signal growth (first 5–10 sessions drive the bulk of the T0→T1 transition), while later sessions contribute diminishing returns, preventing artificial inflation for users who simply use an application frequently without exploring deeply.

### Session Recurrence Scoring

```typescript
// Logarithmic session scoring — rewards early sessions more
function scoreRecurrence(sessions: Session[]): number {
  const n = sessions.length;
  if (n === 0) return 0;
  return Math.min(1.0, Math.log(n + 1) / Math.log(51)); // saturates at ~50 sessions
}
```

### Engagement Depth Scoring

Deep actions are events tagged with `data-temporal-depth="deep"` by the developer. This attribute signals to the observer that this interaction is indicative of advanced exploration. The ratio of deep to surface events is a strong proficiency signal.

```html
<!-- Marking a feature as "deep" — observed by TemporalObserver -->
<button data-temporal-depth="deep">Configure Pipeline</button>
<button data-temporal-depth="deep">Export Raw JSON</button>
```

### Tier Progression (Typical User)

| Week | Sessions | Approx. Signal | Tier | Primary Driver |
|---|---|---|---|---|
| 1 | 2–3 | 0.05 – 0.12 | T0 | cold start |
| 2–3 | 6–10 | 0.18 – 0.30 | T0 → T1 | session_recurrence |
| 4–6 | 12–20 | 0.30 – 0.48 | T1 | dismissal_rate rising |
| 7–10 | 22–35 | 0.50 – 0.65 | T1 → T2 | engagement_depth + speed |
| 11+ | 40+ | 0.70 – 0.92 | T2 → T3 | deep_actions + error_recovery |

> **Calibration Note:** These progressions are baseline heuristics for general-purpose applications. Applications targeting specialist technical audiences (developer tools, CAD software, financial terminals) should recalibrate the scoring weights and tier thresholds using the `TemporalConfig.classifier` options. See Appendix A for the full configuration schema.

---

## 11. Developer Experience

### Installation

```bash
# Core + React adapter
npm install @temporalui/core @temporalui/react

# Angular
npm install @temporalui/core @temporalui/angular

# Vue 3
npm install @temporalui/core @temporalui/vue
```

### Minimal Integration (React)

```jsx
// 1. Wrap your app with TemporalZone
import { TemporalZone } from '@temporalui/react';

function App() {
  return (
    <TemporalZone>
      <Router />
    </TemporalZone>
  );
}

// 2. Wrap any component that should adapt
import { Temporal, AdaptiveSlot } from '@temporalui/react';

function DataGrid({ data }) {
  return (
    <Temporal id="data-grid" domain="reporting">
      <AdaptiveSlot>
        <AdaptiveSlot.Tier tier="T0">
          <GridOnboardingBanner />
        </AdaptiveSlot.Tier>
        <AdaptiveSlot.Tier tier="T3">
          <BulkEditToolbar />
        </AdaptiveSlot.Tier>
      </AdaptiveSlot>
      <GridBody data={data} />
    </Temporal>
  );
}
```

### DevTools Panel

Install the `@temporalui/devtools` package (dev-only dependency) to access the browser DevTools extension. The panel exposes:

- Live tier state per tracked component on the current page
- Raw proficiency signals and sub-signal breakdown
- Ledger event stream with timestamps and event types
- Manual tier override controls for testing adaptation states
- Time-travel: replay the tier progression from first session to current
- Export/import ledger data as JSON for testing and debugging

### Testing

TemporalUI provides a testing adapter that allows unit and integration tests to seed specific tier states without needing a populated ledger:

```typescript
import { TemporalTestProvider } from '@temporalui/react/testing';

test('renders bulk edit toolbar for T3 users', () => {
  render(
    <TemporalTestProvider tiers={{ 'data-grid': 'T3' }}>
      <DataGrid data={mockData} />
    </TemporalTestProvider>
  );
  expect(screen.getByTestId('bulk-edit-toolbar')).toBeInTheDocument();
});
```

### TypeScript Support

The entire framework is authored in TypeScript with strict mode enabled. All public APIs are fully typed including generic component ID types, tier union types, and adaptation context interfaces. Declaration files are shipped with each package.

---

## 12. Competitive Landscape

No existing framework occupies the same space. The closest adjacent categories and their differences:

| Category | Examples | Key Difference from TemporalUI |
|---|---|---|
| UI Frameworks | React, Angular, Vue, Svelte | Stateless by design. No temporal awareness. TemporalUI is a layer on top of these, not a replacement. |
| Component Libraries | MUI, PrimeNG, Radix | Provide styled, accessible components. No interaction memory. Fully compatible with TemporalUI wrappers. |
| User Onboarding | Pendo, Appcues, Shepherd.js | Overlay-based guided tours. One-time flows. No continuous adaptation based on accumulated expertise. |
| Feature Flags | LaunchDarkly, Unleash, Split | Server-side, manually configured, population-level targeting. Not per-user implicit learning. |
| Analytics SDKs | Mixpanel, Amplitude, PostHog | Collect data for human analysis, not for in-session rendering decisions. Server-dependent. |
| Personalization Engines | Optimizely, Dynamic Yield | Commercial/server-side. Focus on content and conversion optimization, not UI complexity adaptation. |
| Adaptive UI Research | Academic (UIST, CHI papers) | Proof-of-concept implementations, not production-grade developer libraries. |

> **Market Position:** TemporalUI occupies a unique position as a **client-side, zero-config, open-source adaptive UI runtime**. It is not a product analytics tool, not a personalization platform, and not a replacement for existing component systems. It is an intelligence layer that any web application can adopt without backend changes, with a minimal footprint and a strong privacy story.

---

## 13. Roadmap

### v0.1 — Foundation Alpha *(Current)*

Core engine (Observer, Classifier, Resolver), IndexedDB ledger, React adapter, `<Temporal>` + `<AdaptiveSlot>` primitives, `useTemporal` hook. DevTools panel basic inspector. TypeScript full types. Unit test suite.

### v0.2 — Adapters & Density

Vue 3 and Svelte adapters. Density adaptation system with configurable CSS custom properties. `<TemporalPromote>` component for feature promotion. Layout memory (`memory="position size collapsed"`). Integration tests with Playwright.

### v0.3 — Angular & Sync

Angular adapter with directives and injection tokens. `@temporalui/sync` package. Optional cross-device profile sync. Domain-level aggregated signals. `useProfiler` hook for aggregate domain access.

### v1.0 — Stable

API stability guarantee. Full DevTools panel (time-travel, tier override, ledger export). Web Components native adapter. Configurable classifier weights and tier thresholds. Performance profiling and bundle optimization. Migration guides from v0.x.

### v1.x — Ecosystem

Pre-built temporal wrappers for common component library primitives (MUI, Radix, PrimeNG). Visual regression testing integration for multi-tier snapshots. Storybook addon for tier simulation. Optional server-side rendering support for initial tier hydration.

---

## 14. Risks & Mitigations

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| **Misclassification of shared devices** — Multiple users on the same browser/device will accumulate a blended ledger, producing a proficiency signal that fits no one. | Medium | Medium | Document the limitation clearly. Provide session-scoped mode for kiosk/shared device contexts. Allow developers to gate temporal tracking behind authentication identity. |
| **First-session cold-start UX** — T0 default may feel patronizing to technical users discovering the app for the first time. | Low | Medium | Expose `cold-start-tier` override per component. Publish guidance on setting T1 default for developer tools and technical SaaS. |
| **Storage quota exhaustion** — Applications with many tracked components in long-term sessions may accumulate significant IndexedDB usage. | Low | Low | Automatic retention eviction (event cap + time cap). Storage usage estimate API for developers. Total cap at 10 MB with graceful degradation to hot-store-only mode. |
| **Privacy regulation compliance** — GDPR, CCPA, and emerging regulations may classify behavioral interaction logs as personal data. | High | Medium | Publish legal guidance. Implement `temporalui.clearAll()` erasure API. Document that data never leaves the device by default. Provide consent-gate integration example. |
| **Accessibility regression** — Tier-based UI changes (hiding labels, promoting density) may harm users with cognitive disabilities who rely on verbose affordances. | High | Medium | Tier promotions never remove ARIA labels or keyboard affordances — only visual density changes. Expose `prefers-reduced-adaptation` media query hook. Document WCAG compliance responsibility as developer-authored intent declarations. |
| **Developer adoption friction** — Requiring component wrapping may seem like too much overhead for existing large codebases. | Medium | Medium | Provide codemods for common component library patterns. Ensure wrapping is purely additive — zero behavior change without explicit adaptation declarations. |

---

## 15. Success Metrics

### Framework Adoption

- Weekly npm downloads within 6 months of v1.0 stable release
- GitHub stars and contributor diversity (framework-agnostic pull requests)
- Number of production applications reporting adoption via opt-in telemetry

### Developer Experience

- **Time to first adaptation:** target <15 minutes from `npm install` to a working tier-switching component in a new project
- **Bundle impact:** core package must remain under 20 kB gzipped in all v1.x releases
- **INP delta:** adding TemporalUI tracking to a component must produce <2ms Interaction to Next Paint regression on median hardware

### Application-Level Outcomes

For adopting applications that instrument their analytics:

- Reduction in help/tooltip dismissal rate for users classified T2+
- Reduction in time-to-task-completion for power users who gain access to promoted features
- Reduction in support tickets tagged "how do I find feature X" for T3 users
- No increase in task-error rate following density promotions (accessibility regression check)

### Classification Quality

- **Tier stability:** <5% of tier transitions should reverse within the same session
- **Expert agreement:** in user studies, self-identified "power users" should be classified T2 or T3 at a rate ≥80%
- **Novice agreement:** users on their first 3 sessions should be classified T0 at a rate ≥95%

---

## 16. Appendix

### A — Full Configuration Schema

```typescript
interface TemporalConfig {
  classifier?: {
    weights?: Partial<SignalWeights>;              // Override sub-signal weights
    tierThresholds?: [number, number, number];     // [T0→T1, T1→T2, T2→T3]
    hysteresis?: { promote: number; demote: number };
    evaluationInterval?: number;                  // ms between background recomputes
  };
  storage?: {
    namespace?: string;                           // Default: 'temporalui'
    maxEventsPerComponent?: number;               // Default: 2000
    retentionDays?: number;                       // Default: 180
    maxTotalBytes?: number;                       // Default: 10485760 (10 MB)
  };
  density?: {
    profiles?: Record<Tier, DensityProfile>;      // Custom density profiles
    transitionDuration?: number;                  // CSS transition ms. Default: 200
  };
  privacy?: {
    consentRequired?: boolean;                    // Disable tracking until consent
    onConsentRequested?: () => boolean;           // Async consent resolution
  };
}
```

### B — Ledger Entry Schema

```typescript
interface LedgerEntry {
  id: string;                    // nanoid, for deduplication
  componentKey: string;          // opaque hash of component id + route context
  eventType: TemporalEvent;      // t:click | t:hover-dwell | t:focus | ...
  timestamp: number;             // Date.now()
  sessionIndex: number;          // incrementing integer, resets per origin load
  depth: 'surface' | 'deep';    // from data-temporal-depth attribute
  duration?: number;             // ms, for dwell events only
}
```

### C — Glossary

| Term | Definition |
|---|---|
| **Interaction Ledger** | Append-only per-component event log stored in IndexedDB |
| **Proficiency Signal** | Continuous 0.0–1.0 scalar representing observed expertise for a component |
| **Adaptation Tier** | One of four discrete rendering modes (T0–T3) derived from the signal |
| **TemporalZone** | Application-level root provider component |
| **AdaptiveSlot** | Declarative conditional renderer keyed on tier |
| **Cold Start** | The state of a component with an empty ledger (first-ever session) |
| **Feature Promotion** | Moving a feature from a secondary to a primary surface for high-tier users |
| **Hot Store** | localStorage cache of current tier/signal for synchronous page-load reads |
| **Hysteresis** | Deliberate inertia preventing rapid tier oscillation at boundary values |
| **Domain** | A named grouping of components for aggregate proficiency scoring |

### D — Prior Art & References

- Greenberg, S. & Witten, I. (1985). "Adaptive Personalized Interfaces — A Question of Viability." *Behaviour and Information Technology.*
- Findlater, L. & McGrenere, J. (2004). "A Comparison of Static, Adaptive, and Adaptable Menus." *CHI 2004.*
- Norman, D. (1988). *The Design of Everyday Things.* Chapter on knowledge in the head vs knowledge in the world.
- Nielsen, J. (1993). *Usability Engineering.* Section 5.4 on progressive disclosure.
- Cockburn, A. et al. (2007). "A Review of Overview+Detail, Zooming, and Focus+Context Interfaces." *ACM Computing Surveys.*

---

*TemporalUI · PRD v0.1 · March 2026 · Confidential — Pre-Alpha Concept Document · temporalui.dev (proposed)*
