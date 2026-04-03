import { IndexedDBStorage } from './adapters/indexeddb';
import { LocalStorageCache } from './adapters/localstorage';
import { DEFAULT_CONFIG } from '../types';
export class TemporalStorage {
    idb;
    cache;
    config;
    constructor(config = {}) {
        const defaultStorage = DEFAULT_CONFIG.storage;
        this.config = {
            namespace: config.namespace ?? defaultStorage.namespace,
            maxEventsPerComponent: config.maxEventsPerComponent ?? defaultStorage.maxEventsPerComponent,
            retentionDays: config.retentionDays ?? defaultStorage.retentionDays,
            maxTotalBytes: config.maxTotalBytes ?? defaultStorage.maxTotalBytes,
        };
        this.idb = new IndexedDBStorage(this.config);
        this.cache = new LocalStorageCache(this.config.namespace);
    }
    async init() {
        await this.idb.waitForReady();
    }
    async getComponentState(componentKey) {
        const cached = this.cache.getComponentState(componentKey);
        if (cached)
            return cached;
        return { tier: 'T0', signal: 0, lastUpdated: Date.now() };
    }
    async setComponentState(componentKey, state) {
        this.cache.setComponentState(componentKey, state);
    }
    async clearComponentState(componentKey) {
        this.cache.clearComponentState(componentKey);
        await this.idb.clearComponent(componentKey);
    }
    getAllComponentStates() {
        return this.cache.getAllComponentStates();
    }
    getIDB() {
        return this.idb;
    }
    getCache() {
        return this.cache;
    }
    getConfig() {
        return this.config;
    }
    async applyRetentionPolicy() {
        await this.idb.applyRetentionPolicy(this.config.maxEventsPerComponent, this.config.retentionDays, this.config.maxTotalBytes);
    }
    clearAll() {
        this.cache.clearAll();
    }
}
export { IndexedDBStorage } from './adapters/indexeddb';
export { LocalStorageCache } from './adapters/localstorage';
