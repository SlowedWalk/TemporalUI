export class TemporalDevTools {
    engine;
    panel = null;
    state = {
        isOpen: false,
        selectedComponent: null,
        activeTab: 'components',
    };
    components = new Map();
    eventStream = [];
    keybinding = 't';
    constructor(engine) {
        this.engine = engine;
    }
    init() {
        this.createPanel();
        this.setupKeybinding();
        this.startPolling();
    }
    destroy() {
        if (this.panel?.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
        this.removeKeybinding();
    }
    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'temporalui-devtools';
        panel.innerHTML = this.renderPanel();
        panel.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 400px;
      max-height: 60vh;
      background: #1a1a2e;
      color: #eee;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      z-index: 999999;
      border-radius: 8px 0 0 0;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
      display: none;
      overflow: hidden;
      flex-direction: column;
    `;
        document.body.appendChild(panel);
        this.panel = panel;
        this.attachEventListeners();
    }
    renderPanel() {
        const { isOpen, activeTab } = this.state;
        return `
      <div class="temporalui-devtools-header" style="
        padding: 12px 16px;
        background: #16213e;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        border-bottom: 1px solid #0f3460;
      ">
        <span style="font-weight: 600; color: #00d9ff;">⚡ TemporalUI DevTools</span>
        <span class="temporalui-devtools-toggle" style="font-size: 10px; color: #888;">${isOpen ? '▼' : '▲'}</span>
      </div>
      ${isOpen ? `
        <div class="temporalui-devtools-tabs" style="
          display: flex;
          border-bottom: 1px solid #0f3460;
        ">
          ${['components', 'events', 'signals', 'settings'].map(tab => `
            <button data-tab="${tab}" style="
              flex: 1;
              padding: 10px 8px;
              background: ${activeTab === tab ? '#0f3460' : 'transparent'};
              color: ${activeTab === tab ? '#00d9ff' : '#888'};
              border: none;
              cursor: pointer;
              font-size: 11px;
              text-transform: uppercase;
            ">${tab}</button>
          `).join('')}
        </div>
        <div class="temporalui-devtools-content" style="
          flex: 1;
          overflow: auto;
          padding: 12px;
        ">
          ${this.renderTabContent()}
        </div>
      ` : ''}
    `;
    }
    renderTabContent() {
        const { activeTab, selectedComponent } = this.state;
        switch (activeTab) {
            case 'components':
                return this.renderComponentsTab();
            case 'events':
                return this.renderEventsTab();
            case 'signals':
                return this.renderSignalsTab();
            case 'settings':
                return this.renderSettingsTab();
            default:
                return '';
        }
    }
    renderComponentsTab() {
        const components = Array.from(this.components.entries());
        if (components.length === 0) {
            return '<div style="color: #888; text-align: center; padding: 20px;">No components tracked yet</div>';
        }
        return `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${components.map(([id, state]) => `
          <div data-component="${id}" style="
            padding: 10px;
            background: #0f3460;
            border-radius: 4px;
            cursor: pointer;
            border-left: 3px solid ${this.getTierColor(state.tier)};
          ">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 500;">${id}</span>
              <span style="
                padding: 2px 8px;
                border-radius: 10px;
                background: ${this.getTierColor(state.tier)}20;
                color: ${this.getTierColor(state.tier)};
              ">${state.tier}</span>
            </div>
            <div style="color: #888; font-size: 11px;">
              Signal: ${(state.signal * 100).toFixed(1)}%
            </div>
          </div>
        `).join('')}
      </div>
    `;
    }
    renderEventsTab() {
        const events = this.eventStream.slice(-20).reverse();
        if (events.length === 0) {
            return '<div style="color: #888; text-align: center; padding: 20px;">No events recorded</div>';
        }
        return `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        ${events.map(e => `
          <div style="
            padding: 6px 8px;
            background: #0f3460;
            border-radius: 4px;
            font-size: 11px;
            display: flex;
            justify-content: space-between;
          ">
            <span style="color: #00d9ff;">${e.event}</span>
            <span style="color: #888;">${e.component}</span>
          </div>
        `).join('')}
      </div>
    `;
    }
    renderSignalsTab() {
        return `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="padding: 12px; background: #0f3460; border-radius: 4px;">
          <div style="margin-bottom: 8px; font-weight: 500;">Signal Weights</div>
          <div style="display: grid; gap: 8px;">
            <div style="display: flex; justify-content: space-between;">
              <span>engagement_depth</span>
              <span style="color: #00d9ff;">30%</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>session_recurrence</span>
              <span style="color: #00d9ff;">25%</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>dismissal_rate</span>
              <span style="color: #00d9ff;">20%</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>time_to_interact</span>
              <span style="color: #00d9ff;">15%</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>error_recovery</span>
              <span style="color: #00d9ff;">10%</span>
            </div>
          </div>
        </div>
      </div>
    `;
    }
    renderSettingsTab() {
        return `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="padding: 12px; background: #0f3460; border-radius: 4px;">
          <div style="margin-bottom: 8px; font-weight: 500;">Keyboard Shortcut</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="
              padding: 4px 8px;
              background: #16213e;
              border-radius: 4px;
              font-family: monospace;
            ">${this.keybinding}</span>
            <span style="color: #888;">Toggle panel</span>
          </div>
        </div>
        <button id="temporalui-clear-data" style="
          padding: 10px;
          background: #e94560;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">Clear All Data</button>
        <button id="temporalui-export-data" style="
          padding: 10px;
          background: #0f3460;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">Export Data (JSON)</button>
      </div>
    `;
    }
    getTierColor(tier) {
        const colors = {
            T0: '#ff6b6b',
            T1: '#ffd93d',
            T2: '#6bcb77',
            T3: '#00d9ff',
        };
        return colors[tier];
    }
    attachEventListeners() {
        if (!this.panel)
            return;
        const header = this.panel.querySelector('.temporalui-devtools-header');
        header?.addEventListener('click', () => this.toggle());
        this.panel.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.setActiveTab(tab);
            });
        });
        this.panel.querySelector('#temporalui-clear-data')?.addEventListener('click', () => {
            this.engine.clearAll();
            this.components.clear();
            this.eventStream = [];
            this.refresh();
        });
        this.panel.querySelector('#temporalui-export-data')?.addEventListener('click', () => {
            const data = {
                components: Object.fromEntries(this.components),
                events: this.eventStream,
                exportedAt: new Date().toISOString(),
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `temporalui-export-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }
    setupKeybinding() {
        document.addEventListener('keydown', (e) => {
            if (e.key === this.keybinding && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const target = e.target;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    this.toggle();
                }
            }
        });
    }
    removeKeybinding() {
        document.removeEventListener('keydown', () => { });
    }
    toggle() {
        this.state.isOpen = !this.state.isOpen;
        this.refresh();
    }
    setActiveTab(tab) {
        this.state.activeTab = tab;
        this.refresh();
    }
    refresh() {
        if (!this.panel)
            return;
        this.panel.innerHTML = this.renderPanel();
        this.panel.style.display = this.state.isOpen ? 'flex' : 'none';
        this.attachEventListeners();
    }
    startPolling() {
        setInterval(() => {
            this.updateComponentList();
        }, 2000);
    }
    async updateComponentList() {
        // This is a simplified version - in production you'd track all registered components
        // For now we'll just track components that have been computed
    }
    trackComponent(componentKey, state) {
        this.components.set(componentKey, state);
    }
    logEvent(event, component) {
        this.eventStream.push({
            event,
            component,
            timestamp: Date.now(),
        });
        if (this.eventStream.length > 100) {
            this.eventStream = this.eventStream.slice(-100);
        }
    }
}
let devToolsInstance = null;
export function initDevTools(engine) {
    if (devToolsInstance) {
        devToolsInstance.destroy();
    }
    devToolsInstance = new TemporalDevTools(engine);
    devToolsInstance.init();
    return devToolsInstance;
}
export function getDevTools() {
    return devToolsInstance;
}
