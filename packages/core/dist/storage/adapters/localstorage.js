export class LocalStorageCache {
    namespace;
    constructor(namespace = 'temporalui') {
        this.namespace = namespace;
    }
    getKey(componentKey) {
        return `${this.namespace}:${componentKey}`;
    }
    getGlobalKey() {
        return `${this.namespace}:state`;
    }
    getComponentState(componentKey) {
        try {
            const data = localStorage.getItem(this.getKey(componentKey));
            if (!data)
                return null;
            return JSON.parse(data);
        }
        catch {
            return null;
        }
    }
    setComponentState(componentKey, state) {
        try {
            localStorage.setItem(this.getKey(componentKey), JSON.stringify(state));
        }
        catch {
            console.warn('[LocalStorageCache] Failed to save component state');
        }
    }
    clearComponentState(componentKey) {
        try {
            localStorage.removeItem(this.getKey(componentKey));
        }
        catch {
            // ignore
        }
    }
    getAllComponentStates() {
        const result = {};
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
        }
        catch {
            // ignore
        }
        return result;
    }
    clearAll() {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`${this.namespace}:`)) {
                    keys.push(key);
                }
            }
            keys.forEach((key) => localStorage.removeItem(key));
        }
        catch {
            // ignore
        }
    }
    estimateSize() {
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
        }
        catch {
            // ignore
        }
        return size;
    }
}
