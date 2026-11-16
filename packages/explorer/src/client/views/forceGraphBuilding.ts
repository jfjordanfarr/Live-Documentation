/**
 * While the 3D Local Map builds, its nodes take no hover and no click, and the map says it is building (the owner's
 * decision of 2026-11-15: "not allowing hover or click interactions on the nodes as the map gets built ... should be
 * replaced only when it's not good enough").
 *
 * Building is what a person sees as the map being built: a body being packed, the reveal still bringing spheres in, a
 * perspective change's own animation, or the camera's framing flight that goes with them. It is not the settle that
 * follows, which `aria-busy` keeps saying and which can run on for many seconds after anything visibly moves. A lull
 * shorter than `BUILDING_HOLD` does not end it, so that one action is one building; the sign waits `BUILDING_SIGN_DELAY`
 * so that a quick update does not flash it. A pointer that has not moved since building began starts nothing, during the
 * build or in the drift after it, until its first move. This module is the rule; the view applies it.
 */

/** Milliseconds a lull in the work must last before building ends, so that packing then a reveal are one building. */
export const BUILDING_HOLD = 200;

/** Milliseconds building must last before the map shows that it is building. */
export const BUILDING_SIGN_DELAY = 300;

/** When the current building began, and when its work last stopped, if it has; both null when the map is not building. */
export interface Building {
  readonly since: number | null;
  readonly quietSince: number | null;
}

/** The map at rest. */
export const NOT_BUILDING: Building = { since: null, quietSince: null };

/**
 * What the map is doing now: `work` is a body packing, the reveal bringing spheres in, a perspective change or a change
 * of what is shown; `flight` is the camera's framing flight, which continues a building and never begins one, since a
 * Fit or a step toward a file is a camera move, not a building.
 */
export interface BuildingWork {
  readonly work: boolean;
  readonly flight: boolean;
}

/** The building after a look at the map's work at `now`. */
export function nextBuilding(previous: Building, { work, flight }: BuildingWork, now: number): Building {
  if (work || flight && previous.since !== null) return previous.since !== null && previous.quietSince === null ? previous : { since: previous.since ?? now, quietSince: null };
  if (previous.since === null) return previous;
  const quietSince = previous.quietSince ?? now;
  if (now - quietSince >= BUILDING_HOLD) return NOT_BUILDING;
  return quietSince === previous.quietSince ? previous : { since: previous.since, quietSince };
}

/** Whether the map is building, and whether it has built long enough to say so: no sign for a quick update. */
export function buildingPhase(building: Building, now: number): "idle" | "begun" | "shown" {
  if (building.since === null) return "idle";
  return now - building.since >= BUILDING_SIGN_DELAY ? "shown" : "begun";
}

/**
 * What a pointer may begin on a node of the map, a sphere, a name, a shell, a bubble or an action: a hover only when the
 * map is not building and the pointer has moved since building last began; a press whenever the map is not building,
 * since a press is the pointer's own act. A press while building is dropped, never kept for later.
 */
export function nodePointer({ building, movedSinceBuilding }: { building: boolean; movedSinceBuilding: boolean }): { hover: boolean; press: boolean } {
  return { hover: !building && movedSinceBuilding, press: !building };
}
