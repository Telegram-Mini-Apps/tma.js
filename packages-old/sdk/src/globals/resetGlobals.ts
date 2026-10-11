import { resetGlobals as resetBridgeGlobals } from '@tma.js/bridge';

import { resetSignals } from '@/globals/signals-registry.js';

/**
 * Resets all bridge globals and locally created signals.
 */
export function resetGlobals() {
  resetBridgeGlobals();
  resetSignals();
}
