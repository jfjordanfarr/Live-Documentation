import { describe, expect, it } from "vitest";

import { bodyChanges, deletionHomes, dims, emphasizedSkin, emphasizedSphere, emphasizedUnits, emphasizedWireAlpha, glows, pairKey, type ShownUnit } from "./forceGraphEmphasis";

describe("how a commit's changed files stand out", () => {
  it("makes a changed sphere white immediately, including at the frontier, and restores its base colour in the next changed set", () => {
    expect(emphasizedSphere("#0091ff", 1, true, "glow")).toBe("rgba(255, 255, 255, 1.000)");
    expect(emphasizedSphere("#0091ff", 0.4, true, "glow")).toBe("rgba(255, 255, 255, 1.000)");
    expect(emphasizedSphere("#0091ff", 1, false, "glow")).toBe("rgba(0, 145, 255, 1.000)");
    expect(emphasizedSphere("#0091ff", 0.4, false, "glow")).toBe("rgba(0, 145, 255, 0.400)");
    expect(() => emphasizedSphere("blue", 1, true, "glow")).toThrow(/#rrggbb/);
  });

  it("keeps an optionally dimmed background steady and changes only the event's participants", () => {
    expect(emphasizedSphere("#0091ff", 1, false, "dim")).toBe("rgba(0, 145, 255, 0.200)");
    expect(emphasizedSphere("#0091ff", 0.4, false, "dim")).toBe("rgba(0, 145, 255, 0.080)");
    expect(emphasizedSphere("#0091ff", 1, true, "dim")).toBe("rgba(0, 145, 255, 1.000)");
    expect(emphasizedSphere("#0091ff", 1, true, "both")).toBe("rgba(255, 255, 255, 1.000)");
    expect(emphasizedSphere("#0091ff", 1, false, "both")).toBe("rgba(0, 145, 255, 0.200)");
    expect(emphasizedSphere("#0091ff", 0.4, true, "none")).toBe("rgba(0, 145, 255, 0.400)");
  });

  it("makes a changed wire more visible for its commit and leaves the others at their chosen background level", () => {
    expect(emphasizedWireAlpha(0.3, true, "glow")).toBeCloseTo(0.85);
    expect(emphasizedWireAlpha(0.3, false, "glow")).toBe(0.3);
    expect(emphasizedWireAlpha(0.3, false, "dim")).toBeCloseTo(0.06);
    expect(emphasizedWireAlpha(0.3, true, "none")).toBe(0.3);
    expect(glows("both") && dims("both")).toBe(true);
    expect(glows("dim") || dims("glow") || glows("none")).toBe(false);
  });

  it("keys a pair the same whichever end is named first", () => {
    expect(pairKey("b", "a")).toBe(pairKey("a", "b"));
    expect(pairKey("a", "b")).not.toBe(pairKey("a", "c"));
  });
});

describe("how a commit's changes show inside a wrapper's skin", () => {
  // The bubble of `a`: a file of its own; an open bubble `a/b` of two dots; a veiled bubble `a/c` whose files are not drawn;
  // and an open bubble `a/e` with a dot and a veiled bubble `a/e/f` inside it.
  type Unit = ShownUnit & { color?: string; lit?: boolean; alpha?: number };
  const blue = "#0091ff";
  const units: Unit[] = [
    { id: "a/x.ts", kind: "file", depth: 0, color: blue },
    { id: "a/b", kind: "directory", depth: 0 },
    { id: "a/b/y.ts", kind: "file", depth: 1, parent: "a/b", color: blue },
    { id: "a/b/z.ts", kind: "file", depth: 1, parent: "a/b", color: blue },
    { id: "a/c", kind: "directory", depth: 0 },
    { id: "a/e", kind: "directory", depth: 0 },
    { id: "a/e/u.ts", kind: "file", depth: 1, parent: "a/e", color: blue },
    { id: "a/e/f", kind: "directory", depth: 1, parent: "a/e" }
  ];
  const members = new Set(["a/x.ts", "a/b/y.ts", "a/b/z.ts", "a/c/w.ts", "a/c/d/v.ts", "a/e/u.ts", "a/e/f/t.ts", "a/e/f/s.ts"]);
  const seed = "dir:a";
  const of = (shown: Unit[], id: string): Unit => shown.find(unit => unit.id === id)!;

  it("lights a changed file's dot white and whole, as a changed sphere, and leaves the open bubble around it unlit", () => {
    const changes = bodyChanges(units, members, seed, ["a/b/y.ts"], []);
    expect([...changes.lit]).toEqual(["a/b/y.ts"]);
    expect([...changes.holding]).toEqual(["a/b"]);
    expect(changes.skin).toBe(false);
    expect(changes.holds).toBe(true);
    const glowing = emphasizedUnits(units, changes, "glow");
    expect(of(glowing, "a/b/y.ts").color).toBe(emphasizedSphere(blue, 1, true, "glow"));
    expect(of(glowing, "a/b/y.ts").color).toBe("rgba(255, 255, 255, 1.000)");
    expect(of(glowing, "a/b/z.ts").color).toBe("rgba(0, 145, 255, 1.000)");
    expect(of(glowing, "a/b").lit).toBe(false);
    expect(glowing.filter(unit => unit.kind === "directory").every(unit => unit.alpha === 1)).toBe(true);
    expect(emphasizedSkin(changes, "glow")).toEqual({ lit: false, alpha: 1 });
  });

  it("dims the unchanged dots as unchanged spheres dim, and the bubbles and skins holding nothing of the step with them", () => {
    const changes = bodyChanges(units, members, seed, ["a/b/y.ts"], []);
    const dimmed = emphasizedUnits(units, changes, "dim");
    expect(of(dimmed, "a/b/y.ts").color).toBe(emphasizedSphere(blue, 1, true, "dim"));
    expect(of(dimmed, "a/b/y.ts").color).toBe("rgba(0, 145, 255, 1.000)");
    expect(of(dimmed, "a/b/z.ts").color).toBe(emphasizedSphere(blue, 1, false, "dim"));
    expect(of(dimmed, "a/b/z.ts").color).toBe("rgba(0, 145, 255, 0.200)");
    expect(of(dimmed, "a/b").alpha).toBe(1);
    expect(of(dimmed, "a/c").alpha).toBeCloseTo(0.2);
    expect(of(dimmed, "a/e/f").alpha).toBeCloseTo(0.2);
    expect(dimmed.some(unit => unit.lit)).toBe(false);
    expect(emphasizedSkin(changes, "dim")).toEqual({ lit: false, alpha: 1 });
    const both = emphasizedUnits(units, changes, "both");
    expect(of(both, "a/b/y.ts").color).toBe("rgba(255, 255, 255, 1.000)");
    expect(of(both, "a/b/z.ts").color).toBe("rgba(0, 145, 255, 0.200)");
    // A body the step does not touch dims whole, its skin with it.
    const untouched = bodyChanges(units, members, seed, ["elsewhere/q.ts"], []);
    expect(untouched.holds).toBe(false);
    expect(emphasizedSkin(untouched, "dim").alpha).toBeCloseTo(0.2);
    expect(emphasizedSkin(untouched, "both")).toEqual({ lit: false, alpha: emphasizedSkin(untouched, "dim").alpha });
    expect(emphasizedUnits(units, untouched, "dim").filter(unit => unit.kind === "directory").every(unit => Math.abs(unit.alpha! - 0.2) < 1e-9)).toBe(true);
  });

  it("lights the innermost drawn bubble of a change not drawn as a dot: a veiled bubble, one inside an open bubble, a veiled body", () => {
    const veiled = bodyChanges(units, members, seed, ["a/c/d/v.ts"], []);
    expect([...veiled.lit]).toEqual(["a/c"]);
    expect(of(emphasizedUnits(units, veiled, "glow"), "a/c").lit).toBe(true);
    // Under dim alone nothing glows, and the bubble holding the change keeps its alpha.
    expect(of(emphasizedUnits(units, veiled, "dim"), "a/c")).toMatchObject({ lit: false, alpha: 1 });
    const nested = bodyChanges(units, members, seed, ["a/e/f/t.ts"], []);
    expect([...nested.lit]).toEqual(["a/e/f"]);
    expect([...nested.holding].sort()).toEqual(["a/e", "a/e/f"]);
    const glowing = emphasizedUnits(units, nested, "glow");
    expect(of(glowing, "a/e/f").lit).toBe(true);
    expect(of(glowing, "a/e").lit).toBe(false);
    expect(of(emphasizedUnits(units, nested, "dim"), "a/e").alpha).toBe(1);
    // A body none of whose files are drawn shows one veiled bubble, which is lit for a change anywhere in it.
    const veil: Unit[] = [{ id: seed, kind: "directory", depth: -1 }];
    const whole = bodyChanges(veil, members, seed, ["a/b/y.ts"], []);
    expect([...whole.lit]).toEqual([seed]);
    expect(whole.skin).toBe(false);
    expect(emphasizedUnits(veil, whole, "both")[0]).toMatchObject({ lit: true, alpha: 1 });
  });

  it("shows a deleted file in the innermost drawn bubble of its directory, or in the skin where none is drawn", () => {
    const inOpen = bodyChanges(units, members, seed, [], ["a/b/gone.ts"]);
    expect([...inOpen.lit]).toEqual(["a/b"]);
    expect(of(emphasizedUnits(units, inOpen, "glow"), "a/b").lit).toBe(true);
    expect(bodyChanges(units, members, seed, [], ["a/c/d/gone.ts"]).lit).toEqual(new Set(["a/c"]));
    const inSkin = bodyChanges(units, members, seed, [], ["a/gone.ts"]);
    expect(inSkin.lit.size).toBe(0);
    expect(inSkin.skin).toBe(true);
    expect(emphasizedSkin(inSkin, "glow")).toEqual({ lit: true, alpha: 1 });
    expect(emphasizedSkin(inSkin, "dim")).toEqual({ lit: false, alpha: 1 });
  });

  it("lights the skin itself where the look draws nothing within it", () => {
    const clouded = bodyChanges([], members, seed, ["a/b/y.ts"], []);
    expect(clouded.skin).toBe(true);
    expect(emphasizedSkin(clouded, "both")).toEqual({ lit: true, alpha: 1 });
  });

  it("lights nothing for a file the body does not hold, nor for a wrapped group's seed, drawn as a sphere of its own", () => {
    const groupUnits: Unit[] = [{ id: "g/one.ts", kind: "file", depth: 0, color: blue }, { id: "g/two.ts", kind: "file", depth: 0, color: blue }];
    const members = new Set(["g/seed.ts", "g/one.ts", "g/two.ts"]);
    expect(bodyChanges(groupUnits, members, "g/seed.ts", ["h/other.ts"], [])).toEqual({ lit: new Set(), holding: new Set(), skin: false, holds: false });
    // The seed's change is its sphere's to show; the body holds it, so that its skin keeps its alpha where the mode dims.
    const seeded = bodyChanges(groupUnits, members, "g/seed.ts", ["g/seed.ts"], []);
    expect(seeded).toEqual({ lit: new Set(), holding: new Set(), skin: false, holds: true });
    expect(emphasizedSkin(seeded, "both")).toEqual({ lit: false, alpha: 1 });
    expect(emphasizedUnits(groupUnits, seeded, "dim").map(unit => unit.color)).toEqual(["rgba(0, 145, 255, 0.200)", "rgba(0, 145, 255, 0.200)"]);
  });

  it("changes no colour, alpha or light without a mode, and none without a change", () => {
    const changes = bodyChanges(units, members, seed, ["a/b/y.ts", "a/c/w.ts"], ["a/gone.ts"]);
    const plain = emphasizedUnits(units, changes, "none");
    expect(plain.filter(unit => unit.kind === "file").every(unit => unit.color === "rgba(0, 145, 255, 1.000)")).toBe(true);
    expect(plain.filter(unit => unit.kind === "directory").every(unit => !unit.lit && unit.alpha === 1)).toBe(true);
    expect(emphasizedSkin(changes, "none")).toEqual({ lit: false, alpha: 1 });
    const nothing = bodyChanges(units, members, seed, [], []);
    expect(emphasizedUnits(units, nothing, "glow").some(unit => unit.lit || unit.color === "rgba(255, 255, 255, 1.000)")).toBe(false);
    expect(emphasizedSkin(nothing, "glow")).toEqual({ lit: false, alpha: 1 });
  });

  it("gives each deleted file to the body of the deepest drawn directory holding it, and none where that is a hub's sphere", () => {
    const homes = new Map<string, string | null>([["", null], ["a", "dir:a"], ["a/b/c", "dir:a/b/c"], ["p", null], ["s", "shell:s"]]);
    const shown = deletionHomes(["a/x.ts", "a/b/c/d/y.ts", "a/b/z.ts", "p/q/r.ts", "top.ts", "s/t/u.ts"], homes);
    expect(Object.fromEntries(shown)).toEqual({ "dir:a": ["a/x.ts", "a/b/z.ts"], "dir:a/b/c": ["a/b/c/d/y.ts"], "shell:s": ["s/t/u.ts"] });
    // With no directory drawn above it, a deleted file is shown nowhere.
    expect(deletionHomes(["q/r.ts"], new Map([["a", "dir:a"]])).size).toBe(0);
  });
});
