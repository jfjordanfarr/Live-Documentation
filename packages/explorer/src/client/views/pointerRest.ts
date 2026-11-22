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

/** A box on the screen, in the page's pixels. */
export interface RestBox {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/** Pixels of slack about the way from a thing to the panel of its words: a hand does not travel a ruled line. */
export const WAY_SLACK = 10;

/**
 * Whether a pointer at `at` is on its way from the point where a thing's words were asked for (`from`) to the panel
 * that shows them, or on the panel: inside the smallest convex shape that holds the panel and the point, each widened
 * by `slack`. Words shown for a rested pointer must be *hoverable* (WCAG 2.1, 1.4.13 Content on Hover or Focus): the
 * pointer can be moved onto them without their going, so the gap between the thing and its panel may not drop them
 * (the owner, 2026-11-22, of a wire's words: "the ability to mouse into those popovers so I can copy some text out").
 * It is the one grace in the rule that words go at once when the pointer is on something else, and it is a place, not
 * a delay: a pointer that leaves this shape is on something else.
 */
export function onTheWay(at: RestPoint, from: RestPoint, panel: RestBox, slack = WAY_SLACK): boolean {
  const corners = (box: RestBox): RestPoint[] => [{ x: box.left, y: box.top }, { x: box.right, y: box.top }, { x: box.right, y: box.bottom }, { x: box.left, y: box.bottom }];
  const points = [
    ...corners({ left: from.x - slack, top: from.y - slack, right: from.x + slack, bottom: from.y + slack }),
    ...corners({ left: panel.left - slack, top: panel.top - slack, right: panel.right + slack, bottom: panel.bottom + slack })
  ].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o: RestPoint, a: RestPoint, b: RestPoint): number => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  // The convex hull, by Andrew's monotone chain: the lower chain left to right, then the upper chain back.
  const hull: RestPoint[] = [];
  for (const pass of [points, [...points].reverse()]) {
    const start = hull.length;
    for (const point of pass) {
      while (hull.length - start >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) hull.pop();
      hull.push(point);
    }
    hull.pop();
  }
  // Inside when the pointer lies on one side of every edge, the hull's corners taken in one turning.
  return hull.every((corner, index) => cross(corner, hull[(index + 1) % hull.length], at) >= 0);
}

/** When the pointer will have rested on what it is on, if it keeps still; null when it is on nothing. */
export function restsAt(rest: PointerRest): number | null {
  return rest.on !== null && rest.since !== null ? rest.since + REST_DWELL : null;
}
