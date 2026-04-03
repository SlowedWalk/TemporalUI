import { IndexedDBStorage } from './adapters/indexeddb';
import { LocalStorageCache } from './adapters/localstorage';
import type { StorageConfig, TemporalConfig, ComponentState } from '../types';
import { DEFAULT_CONFIG } from '../types';

export interface StorageAdapter {
  getComponentState(componentKey: string): ComponentState | null;
  setComponentState(componentKey: string, state: ComponentState): void;
  clearComponentState(componentKey: string): void;
  getAllComponentStates(): Record<string, ComponentState>;
  clearAll(): void;
  getEntryCount(): Promise<number>;
}

export class TemporalStorage {
  private idb: IndexedDBStorage;
  private cache: LocalStorageCache;
  private config: Required<StorageConfig>;

  constructor(config: StorageConfig = {}) {
    const defaultStorage = DEFAULT_CONFIG.storage;
    this.config = {
      namespace: config.namespace ?? defaultStorage.namespace,
      maxEventsPerComponent: config.maxEventsPerComponent ?? defaultStorage.maxEventsPerComponent,
      retentionDays: config.retentionDays ?? defaultStorage.retentionDays,
      maxTotalBytes: config.maxTotalBytes ?? defaultStorage.maxTotalBytes,
    } as Required<StorageConfig>;
    this.idb = new IndexedDBStorage(this.config);
    this.cache = new LocalStorageCache(this.config.namespace);
  }

  async init(): Promise<void> {
    await this.idb.waitForReady();
  }

  async getComponentState(componentKey: string): Promise<ComponentState> {
    const cached = this.cache.getComponentState(componentKey);
    if (cached) return cached;
    return { tier: 'T0', signal: 0, lastUpdated: Date.now() };
  }

  async setComponentState(componentKey: string, state: ComponentState): Promise<void> {
    this.cache.setComponentState(componentKey, state);
  }

  async clearComponentState(componentKey: string): Promise<void> {
    this.cache.clearComponentState(componentKey);
    await this.idb.clearComponent(componentKey);
  }

  getAllComponentStates(): Record<string, ComponentState> {
    return this.cache.getAllComponentStates();
  }

  getIDB(): IndexedDBStorage {
    return this.idb;
  }

  getCache(): LocalStorageCache {
    return this.cache;
  }

  getConfig(): Required<StorageConfig> {
    return this.config;
  }

  async applyRetentionPolicy(): Promise<void> {
    await this.idb.applyRetentionPolicy(
      this.config.maxEventsPerComponent,
      this.config.retentionDays,
      this.config.maxTotalBytes
    );
  }

  clearAll(): void {
    this.cache.clearAll();
  }
}

export { IndexedDBStorage } from './adapters/indexeddb';
export { LocalStorageCache } from './adapters/localstorage';
