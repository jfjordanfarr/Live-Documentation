/**
 * Hover intent: when a pointer has rested on a thing (the owner, 2026-11-19: "What I don't want to have is an
 * application which is shooting random text at me every which way as I scroll my mouse across the screen").
 *
 * What a moving pointer touches may show at once that it can be pressed; its name, its words and the fading of the
 * rest wait until the pointer has rested on it for `REST_DWELL`, and go as soon as it is on something else. Every thing
 * waits afresh: a pointer that moves onto another thing starts again, so a rest on one thing lets the next show nothing
 * until the pointer rests again. A hand that drifts by less than `REST_TOLERANCE` from where the rest began is still
 * resting. Only the pointer's own movement starts a rest again: a picture that moves under a still pointer neither
 * starts it again nor ends it, and whatever stands under the pointer when the dwell is reached is rested on. What may
 * begin at all while the 3D map builds, and in the drift after it until the pointer moves, is `forceGraphBuilding.ts`'s
 * rule, not this one. Keyboard focus and a tap are deliberate and never pass through here.
 *
 * Pure: the views feed it what is under the pointer, where the pointer is and the time, and ask what is rested on.
 */

/**
 * Milliseconds a pointer must rest on a thing before its words show: 21 frames at sixty a second. Weighed on 2026-11-19
 * against 250 (15 frames) and 500 (30). A rest is a pointer held within `REST_TOLERANCE`, so no sweep rests, whatever
 * the dwell; the dwell decides whether a hand that hesitates on its way somewhere is shown words. At 250 a quarter
 * second's hesitation, as a hand turns, would be; at 500 a deliberate rest waits half a second, as long as a slow
 * tooltip. 350 stands between, the owner's "modestly long hover".
 */
export const REST_DWELL = 350;

/** Pixels a resting pointer may drift from where its rest began and still be resting. */
export const REST_TOLERANCE = 4;

/** A point on the screen, in the page's pixels. */
export interface RestPoint {
  readonly x: number;
  readonly y: number;
}

/**
 * The pointer's rest: the thing under it (`null` for nothing), where the pointer was last seen, and where and when the
 * pointer last came to a stop (`since` null before the pointer has been seen).
 */
export interface PointerRest {
  readonly on: string | null;
  readonly at: RestPoint | null;
  readonly anchor: RestPoint | null;
  readonly since: number | null;
}

/** No pointer seen. */
export const NO_REST: PointerRest = { on: null, at: null, anchor: null, since: null };

/**
 * The rest after a look at the pointer at `now`: `on` is what lies under it now, `at` where it stands. A look may come
 * from a pointer event or from a frame that redrew the picture under a pointer that stayed where it was.
 */
export function restAt(previous: PointerRest, on: string | null, at: RestPoint, now: number): PointerRest {
  const moved = previous.at === null || previous.at.x !== at.x || previous.at.y !== at.y;
  const begin = (): PointerRest => ({ on, at, anchor: at, since: now });
  if (previous.since === null || previous.anchor === null) return begin();
  // The pointer itself carried onto another thing: that thing waits afresh.
  if (moved && on !== previous.on) return begin();
  // A thing already rested on is kept while the pointer moves about on it.
  const rested = previous.on !== null && on === previous.on && now - previous.since >= REST_DWELL;
  if (moved && !rested && Math.hypot(at.x - previous.anchor.x, at.y - previous.anchor.y) > REST_TOLERANCE) return begin();
  return previous.on === on && previous.at === at ? previous : { ...previous, on, at };
}

/** The thing the pointer has rested on at `now`, if any. */
export function restedOn(rest: PointerRest, now: number): string | null {
  return rest.on !== null && rest.since !== null && now - rest.since >= REST_DWELL ? rest.on : null;
}

/** When the pointer will have rested on what it is on, if it keeps still; null when it is on nothing. */
export function restsAt(rest: PointerRest): number | null {
  return rest.on !== null && rest.since !== null ? rest.since + REST_DWELL : null;
}
