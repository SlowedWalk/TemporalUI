import { EventEmitter, ElementRef, OnDestroy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { TemporalZoneService } from './temporal-zone.service';
import type { Tier, ComponentState, DensityProfile } from '@temporalui/core';
export type { Tier, DensityProfile, ComponentState };
export declare class TemporalDirective implements OnInit, OnDestroy, OnChanges {
    private elementRef;
    private temporalService;
    temporalId: string;
    temporalDomain?: string;
    temporalColdStartTier: Tier;
    temporalObserve: boolean;
    temporalDebug?: boolean;
    temporalTierChange: EventEmitter<{
        previous: Tier;
        current: Tier;
    }>;
    private destroy$;
    private element;
    private currentState;
    constructor(elementRef: ElementRef<HTMLElement>, temporalService: TemporalZoneService);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    private initComponent;
    private updateElementAttributes;
    get tier(): Tier;
    get signal(): number;
    is(tier: Tier): boolean;
    atLeast(tier: Tier): boolean;
    reset(): Promise<void>;
    override(tier: Tier): void;
    get density(): DensityProfile;
}
export declare class TemporalSlotDirective {
    tier?: Tier;
    constructor();
}
//# sourceMappingURL=temporal.directive.d.ts.map