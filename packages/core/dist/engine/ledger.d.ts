import type { LedgerEntry, TemporalEvent, EventDepth, Session } from '../types';
export interface LedgerOptions {
    componentKey: string;
    maxEvents?: number;
    retentionDays?: number;
}
export declare class InteractionLedger {
    private componentKey;
    private maxEvents;
    private retentionDays;
    private currentSessionIndex;
    private sessionStartTime;
    private pendingEntries;
    private flushTimeout;
    private onFlush?;
    constructor(options: LedgerOptions, onFlush?: (entries: LedgerEntry[]) => void | Promise<void>);
    setFlushCallback(callback: (entries: LedgerEntry[]) => void | Promise<void>): void;
    startNewSession(): void;
    getCurrentSession(): Session;
    recordEvent(eventType: TemporalEvent, depth?: EventDepth, duration?: number): LedgerEntry;
    recordClick(depth?: EventDepth): LedgerEntry;
    recordHoverDwell(durationMs: number, depth?: EventDepth): LedgerEntry;
    recordFocus(depth?: EventDepth): LedgerEntry;
    recordDismiss(depth?: EventDepth): LedgerEntry;
    recordScrollPast(depth?: EventDepth): LedgerEntry;
    recordDeepAction(durationMs?: number): LedgerEntry;
    recordErrorSelfRecover(): LedgerEntry;
    private scheduleFlush;
    flush(): Promise<void>;
    forceFlush(): Promise<void>;
    getComponentKey(): string;
    getPendingCount(): number;
}
//# sourceMappingURL=ledger.d.ts.map