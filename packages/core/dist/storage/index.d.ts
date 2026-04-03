import { IndexedDBStorage } from './adapters/indexeddb';
import { LocalStorageCache } from './adapters/localstorage';
import type { StorageConfig, ComponentState } from '../types';
export interface StorageAdapter {
    getComponentState(componentKey: string): ComponentState | null;
    setComponentState(componentKey: string, state: ComponentState): void;
    clearComponentState(componentKey: string): void;
    getAllComponentStates(): Record<string, ComponentState>;
    clearAll(): void;
    getEntryCount(): Promise<number>;
}
export declare class TemporalStorage {
    private idb;
    private cache;
    private config;
    constructor(config?: StorageConfig);
    init(): Promise<void>;
    getComponentState(componentKey: string): Promise<ComponentState>;
    setComponentState(componentKey: string, state: ComponentState): Promise<void>;
    clearComponentState(componentKey: string): Promise<void>;
    getAllComponentStates(): Record<string, ComponentState>;
    getIDB(): IndexedDBStorage;
    getCache(): LocalStorageCache;
    getConfig(): Required<StorageConfig>;
    applyRetentionPolicy(): Promise<void>;
    clearAll(): void;
}
export { IndexedDBStorage } from './adapters/indexeddb';
export { LocalStorageCache } from './adapters/localstorage';
//# sourceMappingURL=index.d.ts.map