import React from 'react';
import { TierContext, type Tier } from './Temporal';
export interface AdaptiveSlotProps {
    children: React.ReactNode;
}
export declare function AdaptiveSlot({ children }: AdaptiveSlotProps): import("react/jsx-runtime").JSX.Element;
export interface AdaptiveTierProps {
    tier?: Tier | `${Tier}|${Tier}` | `${Tier}+`;
    children: React.ReactNode;
}
export declare function AdaptiveTier({ children }: AdaptiveTierProps): import("react/jsx-runtime").JSX.Element;
export { TierContext };
//# sourceMappingURL=AdaptiveSlot.d.ts.map