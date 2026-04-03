import { OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TemporalEngine, type TemporalConfig, type Tier, type ComponentState, type DensityProfile } from '@temporalui/core';
export type { Tier, DensityProfile, ComponentState };
export interface TemporalZoneConfig {
    config?: TemporalConfig;
    debug?: boolean;
}
export declare class TemporalZoneService implements OnDestroy {
    private engine;
    private _isReady;
    private _componentStates;
    readonly isReady$: import("rxjs").Observable<boolean>;
    constructor();
    private init;
    getEngine(): TemporalEngine;
    getComponentState$(componentId: string, domain?: string): BehaviorSubject<ComponentState>;
    registerComponent(componentId: string, domain?: string, coldStartTier?: Tier): Promise<ComponentState>;
    observeComponent(componentId: string, element: HTMLElement, domain?: string): void;
    stopObserving(componentId: string, domain?: string): void;
    reset(componentId: string, domain?: string): Promise<void>;
    override(componentId: string, domain: string | undefined, tier: Tier): void;
    getDensityProfile(tier: Tier): DensityProfile;
    clearAll(): void;
    ngOnDestroy(): void;
    private computeKey;
}
//# sourceMappingURL=temporal-zone.service.d.ts.map