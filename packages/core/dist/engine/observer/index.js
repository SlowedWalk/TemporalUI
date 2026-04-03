export class TemporalObserver {
    element;
    onEvent;
    hoverDwellThreshold;
    depthAttribute;
    boundHandlers = new Map();
    hoverTimers = new Map();
    constructor(options) {
        this.element = options.element;
        this.onEvent = options.onEvent;
        this.hoverDwellThreshold = options.hoverDwellThreshold ?? 600;
        this.depthAttribute = options.depthAttribute ?? 'data-temporal-depth';
    }
    getDepth(element) {
        const depth = element.getAttribute(this.depthAttribute);
        return depth === 'deep' ? 'deep' : 'surface';
    }
    handleClick = (e) => {
        const target = e.target;
        const depth = this.getDepth(target);
        this.onEvent('t:click', depth);
    };
    handleMouseEnter = (e) => {
        const target = e.target;
        const element = target;
        const timer = setTimeout(() => {
            const depth = this.getDepth(target);
            this.onEvent('t:hover-dwell', depth, this.hoverDwellThreshold);
        }, this.hoverDwellThreshold);
        this.hoverTimers.set(target, timer);
        target.addEventListener('mouseleave', () => this.handleMouseLeave(target), { once: true });
    };
    handleMouseLeave = (target) => {
        const timer = this.hoverTimers.get(target);
        if (timer) {
            clearTimeout(timer);
            this.hoverTimers.delete(target);
        }
    };
    handleFocus = (e) => {
        const target = e.target;
        const depth = this.getDepth(target);
        this.onEvent('t:focus', depth);
    };
    handleBlur = (e) => {
        const target = e.target;
        if (target.hasAttribute('data-temporal-dismiss')) {
            const depth = this.getDepth(target);
            this.onEvent('t:dismiss', depth);
        }
    };
    handleScroll = (e) => {
        const target = e.target;
        const depth = this.getDepth(target);
        this.onEvent('t:scroll-past', depth);
    };
    attach() {
        this.element.addEventListener('click', this.handleClick);
        this.element.addEventListener('mouseenter', this.handleMouseEnter);
        this.element.addEventListener('focusin', this.handleFocus);
        this.element.addEventListener('focusout', this.handleBlur);
        this.boundHandlers.set('click', this.handleClick);
        this.boundHandlers.set('mouseenter', this.handleMouseEnter);
        this.boundHandlers.set('focusin', this.handleFocus);
        this.boundHandlers.set('focusout', this.handleBlur);
    }
    detach() {
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
export function createObserver(element, onEvent) {
    return new TemporalObserver({ element, onEvent });
}
