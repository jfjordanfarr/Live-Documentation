import type { TideState } from "../tide";

/** The surf grows louder as the water rises. */
export function surfVolume(tide: TideState): number {
  return 0.2 + 0.6 * tide.level;
}

/** The gulls call louder while the water falls and the rocks come out. */
export function gullVolume(tide: TideState): number {
  return tide.rising ? 0.1 : 0.5;
}
