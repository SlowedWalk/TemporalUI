import { nanoid } from 'nanoid';
import type { LedgerEntry, TemporalEvent, EventDepth, Session } from '../types';

export interface LedgerOptions {
  componentKey: string;
  maxEvents?: number;
  retentionDays?: number;
}

export class InteractionLedger {
  private componentKey: string;
  private maxEvents: number;
  private retentionDays: number;
  private currentSessionIndex: number = 0;
  private sessionStartTime: number = Date.now();
  private pendingEntries: LedgerEntry[] = [];
  private flushTimeout: ReturnType<typeof setTimeout> | null = null;
  private onFlush?: (entries: LedgerEntry[]) => void | Promise<void>;

  constructor(options: LedgerOptions, onFlush?: (entries: LedgerEntry[]) => void | Promise<void>) {
    this.componentKey = options.componentKey;
    this.maxEvents = options.maxEvents ?? 2000;
    this.retentionDays = options.retentionDays ?? 180;
    this.onFlush = onFlush;
  }

  setFlushCallback(callback: (entries: LedgerEntry[]) => void | Promise<void>): void {
    this.onFlush = callback;
  }

  startNewSession(): void {
    this.currentSessionIndex++;
    this.sessionStartTime = Date.now();
  }

  getCurrentSession(): Session {
    return {
      index: this.currentSessionIndex,
      startTime: this.sessionStartTime,
      endTime: Date.now(),
    };
  }

  recordEvent(
    eventType: TemporalEvent,
    depth: EventDepth = 'surface',
    duration?: number
  ): LedgerEntry {
    const entry: LedgerEntry = {
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

  recordClick(depth: EventDepth = 'surface'): LedgerEntry {
    return this.recordEvent('t:click', depth);
  }

  recordHoverDwell(durationMs: number, depth: EventDepth = 'surface'): LedgerEntry {
    return this.recordEvent('t:hover-dwell', depth, durationMs);
  }

  recordFocus(depth: EventDepth = 'surface'): LedgerEntry {
    return this.recordEvent('t:focus', depth);
  }

  recordDismiss(depth: EventDepth = 'surface'): LedgerEntry {
    return this.recordEvent('t:dismiss', depth);
  }

  recordScrollPast(depth: EventDepth = 'surface'): LedgerEntry {
    return this.recordEvent('t:scroll-past', depth);
  }

  recordDeepAction(durationMs?: number): LedgerEntry {
    return this.recordEvent('t:deep-action', 'deep', durationMs);
  }

  recordErrorSelfRecover(): LedgerEntry {
    return this.recordEvent('t:error-self-recover', 'surface');
  }

  private scheduleFlush(): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }
    this.flushTimeout = setTimeout(() => {
      this.flush();
    }, 2000);
  }

  async flush(): Promise<void> {
    if (this.pendingEntries.length === 0) return;
    const entries = this.pendingEntries.splice(0);
    if (this.onFlush) {
      await this.onFlush(entries);
    }
  }

  async forceFlush(): Promise<void> {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }
    await this.flush();
  }

  getComponentKey(): string {
    return this.componentKey;
  }

  getPendingCount(): number {
    return this.pendingEntries.length;
  }
}
