var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, } from '@angular/core';
import { BehaviorSubject, } from 'rxjs';
import { TemporalEngine, } from '@temporalui/core';
let TemporalZoneService = class TemporalZoneService {
    constructor() {
        this.engine = null;
        this._isReady = new BehaviorSubject(false);
        this._componentStates = new Map();
        this.isReady$ = this._isReady.asObservable();
        this.init();
    }
    async init(config) {
        this.engine = new TemporalEngine({ config });
        await this.engine.init();
        this._isReady.next(true);
    }
    getEngine() {
        if (!this.engine) {
            throw new Error('[TemporalUI] TemporalEngine not initialized');
        }
        return this.engine;
    }
    getComponentState$(componentId, domain) {
        const key = this.computeKey(componentId, domain);
        if (!this._componentStates.has(key)) {
            const initial = {
                tier: 'T0',
                signal: 0,
                lastUpdated: Date.now(),
            };
            this._componentStates.set(key, new BehaviorSubject(initial));
        }
        return this._componentStates.get(key);
    }
    async registerComponent(componentId, domain, coldStartTier) {
        const engine = this.getEngine();
        engine.registerComponent(componentId, domain, coldStartTier ?? 'T0');
        const result = await engine.computeTier(componentId, domain);
        const state = {
            tier: result.tier,
            signal: result.signal,
            lastUpdated: Date.now(),
        };
        const subject = this.getComponentState$(componentId, domain);
        subject.next(state);
        return state;
    }
    observeComponent(componentId, element, domain) {
        const engine = this.getEngine();
        engine.observeComponent(componentId, element, domain);
    }
    stopObserving(componentId, domain) {
        const engine = this.getEngine();
        engine.stopObserving(componentId, domain);
    }
    async reset(componentId, domain) {
        const engine = this.getEngine();
        await engine.reset(componentId, domain);
        const state = {
            tier: 'T0',
            signal: 0,
            lastUpdated: Date.now(),
        };
        const subject = this.getComponentState$(componentId, domain);
        subject.next(state);
    }
    override(componentId, domain, tier) {
        const engine = this.getEngine();
        engine.overrideTier(componentId, domain, tier);
        const state = {
            tier,
            signal: tierToSignal(tier),
            lastUpdated: Date.now(),
        };
        const subject = this.getComponentState$(componentId, domain);
        subject.next(state);
    }
    getDensityProfile(tier) {
        const engine = this.getEngine();
        return engine.getDensityProfile(tier);
    }
    clearAll() {
        if (this.engine) {
            this.engine.clearAll();
        }
        for (const subject of this._componentStates.values()) {
            subject.next({
                tier: 'T0',
                signal: 0,
                lastUpdated: Date.now(),
            });
        }
    }
    ngOnDestroy() {
        this._isReady.complete();
        for (const subject of this._componentStates.values()) {
            subject.complete();
        }
        this._componentStates.clear();
    }
    computeKey(componentId, domain) {
        if (domain) {
            return `${domain}:${componentId}`;
        }
        return componentId;
    }
};
TemporalZoneService = __decorate([
    Injectable({
        providedIn: 'root',
    }),
    __metadata("design:paramtypes", [])
], TemporalZoneService);
export { TemporalZoneService };
function tierToSignal(tier) {
    const map = {
        T0: 0.1,
        T1: 0.4,
        T2: 0.675,
        T3: 0.9,
    };
    return map[tier];
}
