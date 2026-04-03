import { TemporalEngine, type Tier, type ComponentState, type LedgerEntry, type SignalScores } from '@temporalui/core';
export type { Tier, ComponentState, LedgerEntry, SignalScores };
export declare class TemporalDevTools {
    private engine;
    private panel;
    private state;
    private components;
    private eventStream;
    private keybinding;
    constructor(engine: TemporalEngine);
    init(): void;
    destroy(): void;
    private createPanel;
    private renderPanel;
    private renderTabContent;
    private renderComponentsTab;
    private renderEventsTab;
    private renderSignalsTab;
    private renderSettingsTab;
    private getTierColor;
    private attachEventListeners;
    private setupKeybinding;
    private removeKeybinding;
    private toggle;
    private setActiveTab;
    private refresh;
    private startPolling;
    private updateComponentList;
    trackComponent(componentKey: string, state: ComponentState): void;
    logEvent(event: string, component: string): void;
}
export declare function initDevTools(engine: TemporalEngine): TemporalDevTools;
export declare function getDevTools(): TemporalDevTools | null;
//# sourceMappingURL=index.d.ts.map