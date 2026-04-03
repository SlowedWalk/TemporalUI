import {
  Directive,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  Subject,
  takeUntil,
} from 'rxjs';
import {
  TemporalZoneService,
  type TemporalZoneConfig,
} from './temporal-zone.service';
import type { Tier, ComponentState, DensityProfile } from '@temporalui/core';

export type { Tier, DensityProfile, ComponentState };

@Directive({
  selector: '[temporal]',
  standalone: true,
})
export class TemporalDirective implements OnInit, OnDestroy, OnChanges {
  @Input() temporalId!: string;
  @Input() temporalDomain?: string;
  @Input() temporalColdStartTier: Tier = 'T0';
  @Input() temporalObserve = true;
  @Input() temporalDebug?: boolean;

  @Output() temporalTierChange = new EventEmitter<{
    previous: Tier;
    current: Tier;
  }>();

  private destroy$ = new Subject<void>();
  private element: HTMLElement | null = null;
  private currentState: ComponentState = {
    tier: this.temporalColdStartTier,
    signal: 0,
    lastUpdated: Date.now(),
  };

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private temporalService: TemporalZoneService
  ) {
    this.element = this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.initComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['temporalId'] &&
      !changes['temporalId'].firstChange
    ) {
      this.initComponent();
    }
  }

  ngOnDestroy(): void {
    if (this.temporalObserve && this.temporalId) {
      this.temporalService.stopObserving(
        this.temporalId,
        this.temporalDomain
      );
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async initComponent(): Promise<void> {
    if (!this.temporalId) return;

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

    const state = await this.temporalService.registerComponent(
      this.temporalId,
      this.temporalDomain,
      this.temporalColdStartTier
    );

    this.updateElementAttributes(state);

    if (this.temporalObserve && this.element) {
      this.temporalService.observeComponent(
        this.temporalId,
        this.element,
        this.temporalDomain
      );
    }
  }

  private updateElementAttributes(state: ComponentState): void {
    if (!this.element) return;

    this.element.setAttribute('data-temporal-id', this.temporalId);
    this.element.setAttribute('data-temporal-tier', state.tier);
    this.element.setAttribute('data-temporal-signal', state.signal.toString());
  }

  get tier(): Tier {
    return this.currentState.tier;
  }

  get signal(): number {
    return this.currentState.signal;
  }

  is(tier: Tier): boolean {
    return this.currentState.tier === tier;
  }

  atLeast(tier: Tier): boolean {
    const order = ['T0', 'T1', 'T2', 'T3'] as const;
    return order.indexOf(this.currentState.tier) >= order.indexOf(tier);
  }

  async reset(): Promise<void> {
    await this.temporalService.reset(this.temporalId, this.temporalDomain);
  }

  override(tier: Tier): void {
    this.temporalService.override(this.temporalId, this.temporalDomain, tier);
  }

  get density(): DensityProfile {
    return this.temporalService.getDensityProfile(this.currentState.tier);
  }
}

@Directive({
  selector: 'temporal-slot',
  standalone: true,
})
export class TemporalSlotDirective {
  @Input() tier?: Tier;

  constructor() {}
}
