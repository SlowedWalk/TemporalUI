import type { TemporalEvent, EventDepth } from '../../types';

export interface ObserverOptions {
  element: HTMLElement;
  onEvent: (eventType: TemporalEvent, depth: EventDepth, duration?: number) => void;
  hoverDwellThreshold?: number;
  depthAttribute?: string;
}

export class TemporalObserver {
  private element: HTMLElement;
  private onEvent: (eventType: TemporalEvent, depth: EventDepth, duration?: number) => void;
  private hoverDwellThreshold: number;
  private depthAttribute: string;
  private boundHandlers: Map<string, (e: Event) => void> = new Map();
  private hoverTimers: Map<Element, ReturnType<typeof setTimeout>> = new Map();

  constructor(options: ObserverOptions) {
    this.element = options.element;
    this.onEvent = options.onEvent;
    this.hoverDwellThreshold = options.hoverDwellThreshold ?? 600;
    this.depthAttribute = options.depthAttribute ?? 'data-temporal-depth';
  }

  private getDepth(element: Element): EventDepth {
    const depth = element.getAttribute(this.depthAttribute);
    return depth === 'deep' ? 'deep' : 'surface';
  }

  private handleClick = (e: Event): void => {
    const target = e.target as Element;
    const depth = this.getDepth(target);
    this.onEvent('t:click', depth);
  };

  private handleMouseEnter = (e: Event): void => {
    const target = e.target as Element;
    const element = target as HTMLElement;
    const timer = setTimeout(() => {
      const depth = this.getDepth(target);
      this.onEvent('t:hover-dwell', depth, this.hoverDwellThreshold);
    }, this.hoverDwellThreshold);
    this.hoverTimers.set(target, timer);
    target.addEventListener('mouseleave', () => this.handleMouseLeave(target), { once: true });
  };

  private handleMouseLeave = (target: Element): void => {
    const timer = this.hoverTimers.get(target);
    if (timer) {
      clearTimeout(timer);
      this.hoverTimers.delete(target);
    }
  };

  private handleFocus = (e: Event): void => {
    const target = e.target as Element;
    const depth = this.getDepth(target);
    this.onEvent('t:focus', depth);
  };

  private handleBlur = (e: Event): void => {
    const target = e.target as Element;
    if (target.hasAttribute('data-temporal-dismiss')) {
      const depth = this.getDepth(target);
      this.onEvent('t:dismiss', depth);
    }
  };

  private handleScroll = (e: Event): void => {
    const target = e.target as Element;
    const depth = this.getDepth(target);
    this.onEvent('t:scroll-past', depth);
  };

  attach(): void {
    this.element.addEventListener('click', this.handleClick);
    this.element.addEventListener('mouseenter', this.handleMouseEnter);
    this.element.addEventListener('focusin', this.handleFocus);
    this.element.addEventListener('focusout', this.handleBlur);

    this.boundHandlers.set('click', this.handleClick);
    this.boundHandlers.set('mouseenter', this.handleMouseEnter);
    this.boundHandlers.set('focusin', this.handleFocus);
    this.boundHandlers.set('focusout', this.handleBlur);
  }

  detach(): void {
    this.element.removeEventListener('click', this.handleClick);
    this.element.removeEventListener('mouseenter', this.handleMouseEnter);
    this.element.removeEventListener('focusin', this.handleFocus);
    this.element.removeEventListener('focusout', this.handleBlur);

    for (const timer of this.hoverTimers.values()) {
      clearTimeout(timer);
    }
    this.hoverTimers.clear();
    this.boundHandlers.clear();
  }
}

export function createObserver(
  element: HTMLElement,
  onEvent: (eventType: TemporalEvent, depth: EventDepth, duration?: number) => void
): TemporalObserver {
  return new TemporalObserver({ element, onEvent });
}
