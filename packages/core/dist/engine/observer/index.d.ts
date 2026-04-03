import type { TemporalEvent, EventDepth } from '../../types';
export interface ObserverOptions {
    element: HTMLElement;
    onEvent: (eventType: TemporalEvent, depth: EventDepth, duration?: number) => void;
    hoverDwellThreshold?: number;
    depthAttribute?: string;
}
export declare class TemporalObserver {
    private element;
    private onEvent;
    private hoverDwellThreshold;
    private depthAttribute;
    private boundHandlers;
    private hoverTimers;
    constructor(options: ObserverOptions);
    private getDepth;
    private handleClick;
    private handleMouseEnter;
    private handleMouseLeave;
    private handleFocus;
    private handleBlur;
    private handleScroll;
    attach(): void;
    detach(): void;
}
export declare function createObserver(element: HTMLElement, onEvent: (eventType: TemporalEvent, depth: EventDepth, duration?: number) => void): TemporalObserver;
//# sourceMappingURL=index.d.ts.map