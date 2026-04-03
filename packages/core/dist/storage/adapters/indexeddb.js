import { openDB } from 'idb';
export class IndexedDBStorage {
    db = null;
    namespace;
    ready;
    constructor(config = {}) {
        this.namespace = config.namespace ?? 'temporalui';
        this.ready = this.init();
    }
    async init() {
        try {
            this.db = await openDB(`${this.namespace}-db`, 1, {
                upgrade(db) {
                    const store = db.createObjectStore('ledger', {
                        keyPath: 'id',
                    });
                    store.createIndex('by-component', 'componentKey');
                    store.createIndex('by-timestamp', 'timestamp');
                },
            });
        }
        catch {
            this.db = null;
        }
    }
    async waitForReady() {
        await this.ready;
    }
    async addEntry(entry) {
        await this.waitForReady();
        if (!this.db)
            throw new Error('[IndexedDBStorage] Database not available');
        await this.db.put('ledger', entry);
    }
    async addEntries(entries) {
        await this.waitForReady();
        if (!this.db)
            throw new Error('[IndexedDBStorage] Database not available');
        const tx = this.db.transaction('ledger', 'readwrite');
        await Promise.all([
            ...entries.map((entry) => tx.store.put(entry)),
            tx.done,
        ]);
    }
    async getEntriesByComponent(componentKey) {
        await this.waitForReady();
        if (!this.db)
            throw new Error('[IndexedDBStorage] Database not available');
        return this.db.getAllFromIndex('ledger', 'by-component', componentKey);
    }
    async getAllEntries() {
        await this.waitForReady();
        if (!this.db)
            throw new Error('[IndexedDBStorage] Database not available');
        return this.db.getAll('ledger');
    }
    async clearComponent(componentKey) {
        await this.waitForReady();
        if (!this.db)
            throw new Error('[IndexedDBStorage] Database not available');
        const entries = await this.getEntriesByComponent(componentKey);
        const tx = this.db.transaction('ledger', 'readwrite');
        await Promise.all([
            ...entries.map((entry) => tx.store.delete(entry.id)),
            tx.done,
        ]);
    }
    async clearAll() {
        await this.waitForReady();
        if (!this.db)
            throw new Error('[IndexedDBStorage] Database not available');
        await this.db.clear('ledger');
    }
    async getEntryCount() {
        await this.waitForReady();
        if (!this.db)
            throw new Error('[IndexedDBStorage] Database not available');
        return this.db.count('ledger');
    }
    async applyRetentionPolicy(maxEvents, retentionDays, maxTotalBytes) {
        await this.waitForReady();
        if (!this.db)
            return;
        const entries = await this.getAllEntries();
        if (entries.length === 0)
            return;
        const now = Date.now();
        const msPerDay = 86400000;
        const cutoffTime = now - retentionDays * msPerDay;
        const entriesByComponent = {};
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
