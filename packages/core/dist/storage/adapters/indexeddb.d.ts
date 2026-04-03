import type { LedgerEntry, StorageConfig } from '../../types';
export declare class IndexedDBStorage {
    private db;
    private namespace;
    private ready;
    constructor(config?: StorageConfig);
    private init;
    waitForReady(): Promise<void>;
    addEntry(entry: LedgerEntry): Promise<void>;
    addEntries(entries: LedgerEntry[]): Promise<void>;
    getEntriesByComponent(componentKey: string): Promise<LedgerEntry[]>;
    getAllEntries(): Promise<LedgerEntry[]>;
    clearComponent(componentKey: string): Promise<void>;
    clearAll(): Promise<void>;
    getEntryCount(): Promise<number>;
    applyRetentionPolicy(maxEvents: number, retentionDays: number, maxTotalBytes: number): Promise<void>;
}
//# sourceMappingURL=indexeddb.d.ts.map