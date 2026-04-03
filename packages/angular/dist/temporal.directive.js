var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, Input, Output, EventEmitter, ElementRef, } from '@angular/core';
import { Subject, takeUntil, } from 'rxjs';
import { TemporalZoneService, } from './temporal-zone.service';
let TemporalDirective = class TemporalDirective {
    constructor(elementRef, temporalService) {
        this.elementRef = elementRef;
        this.temporalService = temporalService;
        this.temporalColdStartTier = 'T0';
        this.temporalObserve = true;
        this.temporalTierChange = new EventEmitter();
        this.destroy$ = new Subject();
        this.element = null;
        this.currentState = {
            tier: this.temporalColdStartTier,
            signal: 0,
            lastUpdated: Date.now(),
        };
        this.element = this.elementRef.nativeElement;
    }
    ngOnInit() {
        this.initComponent();
    }
    ngOnChanges(changes) {
        if (changes['temporalId'] &&
            !changes['temporalId'].firstChange) {
            this.initComponent();
        }
    }
    ngOnDestroy() {
        if (this.temporalObserve && this.temporalId) {
            this.temporalService.stopObserving(this.temporalId, this.temporalDomain);
        }
        this.destroy$.next();
        this.destroy$.complete();
    }
    async initComponent() {
        if (!this.temporalId)
            return;
        this.temporalService.getComponentState$(this.temporalId, this.temporalDomain)
            .pipe(takeUntil(this.destroy$))
            .subscribe(state => {
            if (state.tier !== this.currentState.tier) {
                this.temporalTierChange.emit({
                    previous: this.currentState.tier,
                    current: state.tier,
                });
            }
            this.currentState = state;
        });
        const state = await this.temporalService.registerComponent(this.temporalId, this.temporalDomain, this.temporalColdStartTier);
        this.updateElementAttributes(state);
        if (this.temporalObserve && this.element) {
            this.temporalService.observeComponent(this.temporalId, this.element, this.temporalDomain);
        }
    }
    updateElementAttributes(state) {
        if (!this.element)
            return;
        this.element.setAttribute('data-temporal-id', this.temporalId);
        this.element.setAttribute('data-temporal-tier', state.tier);
        this.element.setAttribute('data-temporal-signal', state.signal.toString());
    }
    get tier() {
        return this.currentState.tier;
    }
    get signal() {
        return this.currentState.signal;
    }
    is(tier) {
        return this.currentState.tier === tier;
    }
    atLeast(tier) {
        const order = ['T0', 'T1', 'T2', 'T3'];
        return order.indexOf(this.currentState.tier) >= order.indexOf(tier);
    }
    async reset() {
        await this.temporalService.reset(this.temporalId, this.temporalDomain);
    }
    override(tier) {
        this.temporalService.override(this.temporalId, this.temporalDomain, tier);
    }
    get density() {
        return this.temporalService.getDensityProfile(this.currentState.tier);
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], TemporalDirective.prototype, "temporalId", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], TemporalDirective.prototype, "temporalDomain", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], TemporalDirective.prototype, "temporalColdStartTier", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], TemporalDirective.prototype, "temporalObserve", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], TemporalDirective.prototype, "temporalDebug", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], TemporalDirective.prototype, "temporalTierChange", void 0);
TemporalDirective = __decorate([
    Directive({
        selector: '[temporal]',
        standalone: true,
    }),
    __metadata("design:paramtypes", [ElementRef,
        TemporalZoneService])
], TemporalDirective);
export { TemporalDirective };
let TemporalSlotDirective = class TemporalSlotDirective {
    constructor() { }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], TemporalSlotDirective.prototype, "tier", void 0);
TemporalSlotDirective = __decorate([
    Directive({
        selector: 'temporal-slot',
        standalone: true,
    }),
    __metadata("design:paramtypes", [])
], TemporalSlotDirective);
export { TemporalSlotDirective };
