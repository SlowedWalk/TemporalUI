import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { LedgerEntry, TemporalConfig, StorageConfig } from '../../types';

interface TemporalDBSchema extends DBSchema {
  ledger: {
    key: string;
    value: LedgerEntry;
    indexes: {
      'by-component': string;
      'by-timestamp': number;
    };
  };
}

export class IndexedDBStorage {
  private db: IDBPDatabase<TemporalDBSchema> | null = null;
  private namespace: string;
  private ready: Promise<void>;

  constructor(config: StorageConfig = {}) {
    this.namespace = config.namespace ?? 'temporalui';
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    try {
      this.db = await openDB<TemporalDBSchema>(`${this.namespace}-db`, 1, {
        upgrade(db) {
          const store = db.createObjectStore('ledger', {
            keyPath: 'id',
          });
          store.createIndex('by-component', 'componentKey');
          store.createIndex('by-timestamp', 'timestamp');
        },
      });
    } catch {
      this.db = null;
    }
  }

  async waitForReady(): Promise<void> {
    await this.ready;
  }

  async addEntry(entry: LedgerEntry): Promise<void> {
    await this.waitForReady();
    if (!this.db) throw new Error('[IndexedDBStorage] Database not available');
    await this.db.put('ledger', entry);
  }

  async addEntries(entries: LedgerEntry[]): Promise<void> {
    await this.waitForReady();
    if (!this.db) throw new Error('[IndexedDBStorage] Database not available');
    const tx = this.db.transaction('ledger', 'readwrite');
    await Promise.all([
      ...entries.map((entry) => tx.store.put(entry)),
      tx.done,
    ]);
  }

  async getEntriesByComponent(componentKey: string): Promise<LedgerEntry[]> {
    await this.waitForReady();
    if (!this.db) throw new Error('[IndexedDBStorage] Database not available');
    return this.db.getAllFromIndex('ledger', 'by-component', componentKey);
  }

  async getAllEntries(): Promise<LedgerEntry[]> {
    await this.waitForReady();
    if (!this.db) throw new Error('[IndexedDBStorage] Database not available');
    return this.db.getAll('ledger');
  }

  async clearComponent(componentKey: string): Promise<void> {
    await this.waitForReady();
    if (!this.db) throw new Error('[IndexedDBStorage] Database not available');
    const entries = await this.getEntriesByComponent(componentKey);
    const tx = this.db.transaction('ledger', 'readwrite');
    await Promise.all([
      ...entries.map((entry) => tx.store.delete(entry.id)),
      tx.done,
    ]);
  }

  async clearAll(): Promise<void> {
    await this.waitForReady();
    if (!this.db) throw new Error('[IndexedDBStorage] Database not available');
    await this.db.clear('ledger');
  }

  async getEntryCount(): Promise<number> {
    await this.waitForReady();
    if (!this.db) throw new Error('[IndexedDBStorage] Database not available');
    return this.db.count('ledger');
  }

  async applyRetentionPolicy(
    maxEvents: number,
    retentionDays: number,
    maxTotalBytes: number
  ): Promise<void> {
    await this.waitForReady();
    if (!this.db) return;

    const entries = await this.getAllEntries();
    if (entries.length === 0) return;

    const now = Date.now();
    const msPerDay = 86400000;
    const cutoffTime = now - retentionDays * msPerDay;

    const entriesByComponent: Record<string, LedgerEntry[]> = {};
    for (const entry of entries) {
      if (!entriesByComponent[entry.componentKey]) {
        entriesByComponent[entry.componentKey] = [];
      }
      entriesByComponent[entry.componentKey].push(entry);
    }

    const tx = this.db.transaction('ledger', 'readwrite');
    for (const componentKey in entriesByComponent) {
      let componentEntries = entriesByComponent[componentKey]
        .filter((e) => e.timestamp >= cutoffTime)
        .sort((a, b) => a.timestamp - b.timestamp);

      if (componentEntries.length > maxEvents) {
        componentEntries = componentEntries.slice(-maxEvents);
      }

      const keepIds = new Set(componentEntries.map((e) => e.id));
      const allComponentEntries = entriesByComponent[componentKey];
      for (const entry of allComponentEntries) {
        if (!keepIds.has(entry.id)) {
          await tx.store.delete(entry.id);
        }
      }
    }
    await tx.done;
  }
}
