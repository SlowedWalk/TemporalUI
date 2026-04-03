import type { ComponentState, Tier, TemporalState } from '../../types';

export class LocalStorageCache {
  private namespace: string;

  constructor(namespace: string = 'temporalui') {
    this.namespace = namespace;
  }

  private getKey(componentKey: string): string {
    return `${this.namespace}:${componentKey}`;
  }

  private getGlobalKey(): string {
    return `${this.namespace}:state`;
  }

  getComponentState(componentKey: string): ComponentState | null {
    try {
      const data = localStorage.getItem(this.getKey(componentKey));
      if (!data) return null;
      return JSON.parse(data) as ComponentState;
    } catch {
      return null;
    }
  }

  setComponentState(componentKey: string, state: ComponentState): void {
    try {
      localStorage.setItem(this.getKey(componentKey), JSON.stringify(state));
    } catch {
      console.warn('[LocalStorageCache] Failed to save component state');
    }
  }

  clearComponentState(componentKey: string): void {
    try {
      localStorage.removeItem(this.getKey(componentKey));
    } catch {
      // ignore
    }
  }

  getAllComponentStates(): Record<string, ComponentState> {
    const result: Record<string, ComponentState> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.namespace}:`) && key !== this.getGlobalKey()) {
          const componentKey = key.slice(this.namespace.length + 1);
          const state = this.getComponentState(componentKey);
          if (state) {
            result[componentKey] = state;
          }
        }
      }
    } catch {
      // ignore
    }
    return result;
  }

  clearAll(): void {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.namespace}:`)) {
          keys.push(key);
        }
      }
      keys.forEach((key) => localStorage.removeItem(key));
    } catch {
      // ignore
    }
  }

  estimateSize(): number {
    let size = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.namespace}:`)) {
          const value = localStorage.getItem(key);
          if (value) {
            size += key.length + value.length;
          }
        }
      }
    } catch {
      // ignore
    }
    return size;
  }
}
