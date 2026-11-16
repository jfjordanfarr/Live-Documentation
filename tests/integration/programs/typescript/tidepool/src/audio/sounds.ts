import type { TideState } from "../tide";
import { gullVolume, surfVolume } from "./mixer";

export type Cue = "chime" | "splash";

/** Plays a short cue from the audio elements the page carries. */
export function playCue(cue: Cue): void {
  const element = cue === "chime"
    ? document.getElementById("cue-chime") as HTMLAudioElement
    : document.getElementById("cue-splash") as HTMLAudioElement;
  element.currentTime = 0;
  void element.play();
}

/** Sets the looping surf and gulls to suit the tide. */
export function setAmbience(tide: TideState): void {
  (document.getElementById("ambient-surf") as HTMLAudioElement).volume = surfVolume(tide);
  (document.getElementById("ambient-gulls") as HTMLAudioElement).volume = gullVolume(tide);
}
