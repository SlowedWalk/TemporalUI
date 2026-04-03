import type { ComponentState } from '../../types';
export declare class LocalStorageCache {
    private namespace;
    constructor(namespace?: string);
    private getKey;
    private getGlobalKey;
    getComponentState(componentKey: string): ComponentState | null;
    setComponentState(componentKey: string, state: ComponentState): void;
    clearComponentState(componentKey: string): void;
    getAllComponentStates(): Record<string, ComponentState>;
    clearAll(): void;
    estimateSize(): number;
}
//# sourceMappingURL=localstorage.d.ts.map