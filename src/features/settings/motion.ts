import type { Config } from '../../core/types';

export type MotionPreference = Config['reducedMotion'];

/**
 * Resolve the effective "reduce motion" state from the user preference and
 * the operating-system setting. The user can always force either behaviour.
 */
export function prefersReducedMotion(
  preference: MotionPreference,
  systemReduced: boolean,
): boolean {
  if (preference === 'on') return true;
  if (preference === 'off') return false;
  return systemReduced;
}
