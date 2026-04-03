import { nanoid } from 'nanoid';
export class InteractionLedger {
    componentKey;
    maxEvents;
    retentionDays;
    currentSessionIndex = 0;
    sessionStartTime = Date.now();
    pendingEntries = [];
    flushTimeout = null;
    onFlush;
    constructor(options, onFlush) {
        this.componentKey = options.componentKey;
        this.maxEvents = options.maxEvents ?? 2000;
        this.retentionDays = options.retentionDays ?? 180;
        this.onFlush = onFlush;
    }
    setFlushCallback(callback) {
        this.onFlush = callback;
    }
    startNewSession() {
        this.currentSessionIndex++;
        this.sessionStartTime = Date.now();
    }
    getCurrentSession() {
        return {
            index: this.currentSessionIndex,
            startTime: this.sessionStartTime,
            endTime: Date.now(),
        };
    }
    recordEvent(eventType, depth = 'surface', duration) {
        const entry = {
            id: nanoid(),
            componentKey: this.componentKey,
            eventType,
            timestamp: Date.now(),
            sessionIndex: this.currentSessionIndex,
            depth,
            duration,
        };
        this.pendingEntries.push(entry);
        this.scheduleFlush();
        return entry;
    }
    recordClick(depth = 'surface') {
        return this.recordEvent('t:click', depth);
    }
    recordHoverDwell(durationMs, depth = 'surface') {
        return this.recordEvent('t:hover-dwell', depth, durationMs);
    }
    recordFocus(depth = 'surface') {
        return this.recordEvent('t:focus', depth);
    }
    recordDismiss(depth = 'surface') {
        return this.recordEvent('t:dismiss', depth);
    }
    recordScrollPast(depth = 'surface') {
        return this.recordEvent('t:scroll-past', depth);
    }
    recordDeepAction(durationMs) {
        return this.recordEvent('t:deep-action', 'deep', durationMs);
    }
    recordErrorSelfRecover() {
        return this.recordEvent('t:error-self-recover', 'surface');
    }
    scheduleFlush() {
        if (this.flushTimeout) {
            clearTimeout(this.flushTimeout);
        }
        this.flushTimeout = setTimeout(() => {
            this.flush();
        }, 2000);
    }
    async flush() {
        if (this.pendingEntries.length === 0)
            return;
        const entries = this.pendingEntries.splice(0);
        if (this.onFlush) {
            await this.onFlush(entries);
        }
    }
    async forceFlush() {
        if (this.flushTimeout) {
            clearTimeout(this.flushTimeout);
            this.flushTimeout = null;
        }
        await this.flush();
    }
    getComponentKey() {
        return this.componentKey;
    }
    getPendingCount() {
        return this.pendingEntries.length;
    }
}
