import { describe, expect, it } from "vitest";

import { isMirrored, layoutEndAt, shownSpan, spanInLayout } from "./reading-direction";

describe("which way a 2D picture reads", () => {
  it("finds the layout's end toward a side of the page: its start at the left as laid out, at the right mirrored", () => {
    expect([layoutEndAt("left", false), layoutEndAt("right", false)]).toEqual(["start", "end"]);
    expect([layoutEndAt("left", true), layoutEndAt("right", true)]).toEqual(["end", "start"]);
  });

  it("is mirrored only when what uses stands first", () => {
    expect(isMirrored("offersFirst")).toBe(false);
    expect(isMirrored("usesFirst")).toBe(true);
    expect(isMirrored(undefined)).toBe(false);
  });

  it("reads a box as laid out by its offset from the origin over the camera's scale", () => {
    expect(spanInLayout({ left: 140, right: 340 }, 40, 0, 2, false)).toEqual({ start: 50, end: 150 });
  });

  it("reads a mirrored box as its reflection about the axis, start still before end", () => {
    // A card laid out from 50 to 150, drawn at scale 2 from an origin at 40 and reflected about the page's x = 100:
    // unmirrored it would span 140..340 on the page, so mirrored it spans 2·100 − 340 .. 2·100 − 140 = −140..60.
    const span = spanInLayout({ left: -140, right: 60 }, 40, 100, 2, true);
    expect(span).toEqual({ start: 50, end: 150 });
    expect(span.start).toBeLessThan(span.end);
  });

  it("gives every mirrored measurement the layout's own order: what offers is still before what uses", () => {
    // On a mirrored page the provider's card stands to the right of the consumer's.
    const provider = spanInLayout({ left: 700, right: 900 }, 0, 500, 1, true), consumer = spanInLayout({ left: 100, right: 300 }, 0, 500, 1, true);
    expect(provider.end).toBeLessThan(consumer.start);
  });

  it("shows a layout span where the page draws it, and the showing undoes the reading", () => {
    expect(shownSpan({ start: 50, end: 150 }, 100, false)).toEqual({ left: 50, right: 150 });
    expect(shownSpan({ start: 50, end: 150 }, 100, true)).toEqual({ left: 50, right: 150 });
    const shown = shownSpan({ start: 10, end: 90 }, 100, true);
    expect(shown).toEqual({ left: 110, right: 190 });
    expect(spanInLayout(shown, 0, 100, 1, true)).toEqual({ start: 10, end: 90 });
  });
});
