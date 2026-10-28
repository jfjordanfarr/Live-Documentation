import { forceSimulation } from "d3-force-3d";
import { describe, expect, it, vi } from "vitest";

import { MOTION, QUIET_TICKS, STILL_FRACTION, UNFOLDED_FRACTION } from "./forceGraphLayout";
import { diagonalOf, SpatialField, SpatialMotion, type FieldReading, type FieldSettings, type FieldSpring } from "./forceGraphPhysics";

const SETTINGS: FieldSettings = { charge: 60, chargeRange: 0, approximation: 0, gravity: 0.01, collisionGap: 5, collisionStiffness: 3, tether: 0 };
const UP = (): { x: number; y: number; z: number } => ({ x: 0, y: 0, z: 1 });

/** A small field of five spheres: a chain, a branch and one overlapping pair, at fixed irregular places. */
function scene(settings: FieldSettings = SETTINGS): { field: SpatialField; x: Float64Array } {
  const radii = Float64Array.from([4, 6, 5, 4, 8]);
  const springs: FieldSpring[] = [
    { a: 0, b: 1, rest: 40, strength: 0.25 }, { a: 1, b: 2, rest: 55, strength: 0.125 },
    { a: 1, b: 3, rest: 30, strength: 0.25 }, { a: 3, b: 4, rest: 70, strength: 0.5 }
  ];
  const x = Float64Array.from([0, 0, 0, 31, 12, -7, 80, -20, 15, 22, 40, 9, 26, 44, 5]);
  return { field: new SpatialField(radii, springs, settings, UP), x };
}

const energyAt = (field: SpatialField, x: Float64Array, anchor?: Float64Array): number => field.forces(x, new Float64Array(x.length), anchor).energy;

describe("the 3D picture's field", () => {
  it("pushes every sphere down the slope of its energy, overlaps, a bounded reach and the tether included", () => {
    for (const settings of [SETTINGS, { ...SETTINGS, chargeRange: 50 }, { ...SETTINGS, gravity: 0, charge: 0 }, { ...SETTINGS, tether: 0.02 }]) {
      const { field, x } = scene(settings);
      const anchor = x.map((value, k) => value + 7 * Math.sin(k + 1));
      const force = new Float64Array(x.length);
      const reading = field.forces(x, force, anchor);
      expect(reading.overlaps).toBe(1);
      const h = 1e-6;
      for (let k = 0; k < x.length; k++) {
        const plus = Float64Array.from(x), minus = Float64Array.from(x);
        plus[k] += h; minus[k] -= h;
        const slope = (energyAt(field, plus, anchor) - energyAt(field, minus, anchor)) / (2 * h);
        expect(force[k]).toBeCloseTo(-slope, 4);
      }
    }
  });

  it("pulls and pushes equally and oppositely: no net force or turn without gravity, whatever the arrangement", () => {
    const { field, x } = scene({ ...SETTINGS, gravity: 0 });
    const force = new Float64Array(x.length);
    field.forces(x, force);
    const net = [0, 0, 0], turn = [0, 0, 0];
    for (let i = 0; i < x.length; i += 3) {
      for (let k = 0; k < 3; k++) net[k] += force[i + k];
      turn[0] += x[i + 1] * force[i + 2] - x[i + 2] * force[i + 1];
      turn[1] += x[i + 2] * force[i] - x[i] * force[i + 2];
      turn[2] += x[i] * force[i + 1] - x[i + 1] * force[i];
    }
    for (const value of [...net, ...turn]) expect(Math.abs(value)).toBeLessThan(1e-9);
  });

  it("separates two spheres that stand exactly together, by the direction given, with finite forces", () => {
    const field = new SpatialField(Float64Array.from([4, 4]), [{ a: 0, b: 1, rest: 20, strength: 0.25 }], SETTINGS, UP);
    const force = new Float64Array(6);
    field.forces(new Float64Array(6), force);
    expect(force.every(Number.isFinite)).toBe(true);
    // Sphere 0 goes the given way and sphere 1 the other: the spring and the repulsion agree on the direction.
    expect(force[2]).toBeGreaterThan(0);
    expect(force[5]).toBeCloseTo(-force[2], 9);
  });

  it("refuses constants it cannot honour", () => {
    expect(() => new SpatialField(Float64Array.from([0]), [], SETTINGS, UP)).toThrow("positive radius");
    expect(() => new SpatialField(Float64Array.from([1]), [], { ...SETTINGS, gravity: -1 }, UP)).toThrow("nonnegative");
    expect(() => new SpatialField(Float64Array.from([1]), [], { ...SETTINGS, tether: -0.01 }, UP)).toThrow("nonnegative");
    expect(() => new SpatialField(Float64Array.from([1, 1]), [{ a: 0, b: 1, rest: 0, strength: 1 }], SETTINGS, UP)).toThrow("rest length");
  });

  it("bounds local spring, repulsion, collision and held-tether stiffness in the force reading", () => {
    const field = new SpatialField(Float64Array.from([4, 4]), [{ a: 0, b: 1, rest: 20, strength: .5 }],
      { ...SETTINGS, gravity: .025, tether: .02, chargeRange: 30 }, UP);
    const reading = (distance: number, held = false): number => {
      const x = Float64Array.from([0, 0, 0, distance, 0, 0]);
      return field.forces(x, new Float64Array(6), held ? x : undefined).stiffness;
    };
    expect(reading(20)).toBeCloseTo(.5 + 2 * 60 / 400 + .025, 12);
    expect(reading(20, true)).toBeCloseTo(reading(20) + .02, 12);
    expect(reading(10)).toBeCloseTo(.5 + 2 * (60 / 100 + 3) + .025, 12);
    expect(reading(.5)).toBeCloseTo(.5 + 2 * 3 + .025, 12); // Capped repulsion has no positive radial curvature.
    expect(reading(40)).toBeCloseTo(.5 + .025, 12); // Beyond the repulsion's reach and the collision clearance.
  });

  it("refuses non-finite coordinates, anchors and force arithmetic", () => {
    const { field, x } = scene();
    const invalid = x.slice(); invalid[2] = NaN;
    expect(() => field.forces(invalid, new Float64Array(x.length))).toThrow("finite positions");
    expect(() => field.forces(x, new Float64Array(x.length), invalid)).toThrow("finite positions and anchors");
    const overflowing = new SpatialField(Float64Array.from([1, 1]), [{ a: 0, b: 1, rest: 20, strength: 1e308 }], SETTINGS, UP);
    expect(() => overflowing.forces(Float64Array.from([0, 0, 0, 1e100, 0, 0]), new Float64Array(6))).toThrow("non-finite forces");
  });
});

describe("the damped motion through it", () => {
  it("preserves one full Verlet step exactly when no subdivision is needed", () => {
    const { field, x } = scene({ ...SETTINGS, charge: 0, collisionStiffness: 0 });
    const h = .5, strength = .75, decay = Math.exp(-.2 * h / 2);
    const expected = x.slice(), velocity = Float64Array.from(x.map((_value, i) => Math.sin(i)));
    const force = new Float64Array(x.length);
    const motion = new SpatialMotion(field, x, { step: h, drag: .2 }, velocity.slice());
    field.forces(expected, force);
    let moveMax = 0;
    for (let i = 0; i < expected.length; i += 3) {
      for (let k = i; k < i + 3; k++) {
        velocity[k] = decay * velocity[k] + h * strength * force[k] / 2;
        expected[k] += h * velocity[k];
      }
      moveMax = Math.max(moveMax, h * Math.hypot(velocity[i], velocity[i + 1], velocity[i + 2]));
    }
    field.forces(expected, force);
    for (let k = 0; k < velocity.length; k++) velocity[k] = decay * (velocity[k] + h * strength * force[k] / 2);
    const calls = vi.spyOn(field, "forces");
    expect(motion.tick(strength).moveMax).toBe(moveMax);
    expect(calls).toHaveBeenCalledTimes(1);
    expect(x).toEqual(expected);
    expect(motion.velocity).toEqual(velocity);
  });

  it("resolves a large Structure star at ordinary spring strength without changing its forces or drag", () => {
    // Each leaf has one containment edge, so degree normalization gives the hub all 192 springs at strength .25.
    // Its radial mode is too stiff for the old .5 step: h²·(.25/2)·193 = 6.03125, beyond Verlet's limit of four.
    const leaves = 192;
    const springs = Array.from({ length: leaves }, (_, i) => ({ a: 0, b: i + 1, rest: 80, strength: .25 }));
    const field = new SpatialField(new Float64Array(leaves + 1).fill(1), springs,
      { ...SETTINGS, charge: 0, gravity: 0, collisionStiffness: 0 }, UP);
    const x = Float64Array.from([1, 0, 0, ...Array.from({ length: leaves }, () => [80, 0, 0]).flat()]);
    const velocity = new Float64Array(x.length);
    for (let i = 0; i < x.length; i += 3) velocity[i + 1] = 10; // Shared translation has no spring force.
    const motion = new SpatialMotion(field, x, { step: .5, drag: .2 }, velocity);
    const calls = vi.spyOn(field, "forces");
    motion.tick(1);
    expect(calls.mock.calls.length).toBeGreaterThan(1);
    for (let i = 0; i < x.length; i += 3) expect(velocity[i + 1]).toBeCloseTo(10 * Math.exp(-.2 * .5), 12);
    calls.mockRestore();
    let last = motion.tick(1);
    for (let tick = 0; tick < 1200 && last.moveMax > 1e-6; tick++) last = motion.tick(1);
    expect(x.every(Number.isFinite)).toBe(true);
    expect(last.moveMax).toBeLessThan(1e-6);
    const force = new Float64Array(x.length);
    field.forces(x, force);
    expect(Math.max(...force.map(Math.abs))).toBeLessThan(1e-5);
    expect(x[3] - x[0]).toBeCloseTo(80, 6);
  });

  it("retries a step that enters a stiff collision and keeps fixed spheres fixed through every substep", () => {
    const field = new SpatialField(Float64Array.from([4, 4]), [],
      { ...SETTINGS, charge: 0, gravity: 0, collisionGap: 0, collisionStiffness: 30 }, UP);
    const x = Float64Array.from([-5, 0, 0, 5, 0, 0]);
    const motion = new SpatialMotion(field, x, { step: .5, drag: .2 }, Float64Array.from([0, 0, 0, -10, 0, 0]));
    expect(motion.current.stiffness).toBe(0);
    const calls = vi.spyOn(field, "forces");
    const reading = motion.tick(1, new Set([0]));
    expect(calls.mock.calls.length).toBeGreaterThan(2);
    expect([...x.slice(0, 3)]).toEqual([-5, 0, 0]);
    expect([...motion.velocity.slice(0, 3)]).toEqual([0, 0, 0]);
    expect(x[3]).toBeGreaterThan(x[0]);
    expect(Number.isFinite(reading.moveMax)).toBe(true);
    expect(reading.moveMax).toBeCloseTo(Math.abs(x[3] - 5), 12);
  });

  it("counts travel through stiff oscillations, not just an endpoint or the last short substep", () => {
    const field = new SpatialField(Float64Array.from([1]), [], { ...SETTINGS, gravity: 400, charge: 0 }, UP);
    const x = Float64Array.from([1, 0, 0]);
    const motion = new SpatialMotion(field, x, { step: .5, drag: .2 });
    const reading = motion.tick(1);
    expect(reading.moveMax).toBeGreaterThan(3);
    expect(reading.moveMax).toBeGreaterThan(Math.abs(x[0] - 1));
  });

  it("fails explicitly when initial or later motion is non-finite, before it can appear still", () => {
    const { field, x } = scene();
    const velocity = new Float64Array(x.length); velocity[0] = NaN;
    expect(() => new SpatialMotion(field, x, { step: .5, drag: .2 }, velocity)).toThrow("finite velocities");
    const motion = new SpatialMotion(field, x, { step: .5, drag: .2 });
    motion.velocity[0] = Infinity;
    expect(() => motion.tick(1)).toThrow("finite positions and velocities");
    motion.velocity[0] = 0; x[0] = NaN;
    expect(() => motion.tick(1)).toThrow("finite positions and velocities");
    expect(() => diagonalOf(x)).toThrow("finite positions");
  });

  it("loses energy every tick and comes to rest where the forces balance", () => {
    const { field, x } = scene();
    const motion = new SpatialMotion(field, x, { step: 0.5, drag: 0.2 });
    let total = Infinity, last = motion.tick(1);
    for (let tick = 0; tick < 6000; tick++) {
      last = motion.tick(1);
      let kinetic = 0;
      for (const v of motion.velocity) kinetic += v * v / 2;
      // Verlet conserves a shadow of the energy, not the energy itself; the drag still removes it tick by tick.
      expect(last.energy + kinetic).toBeLessThan(total + 1e-6);
      total = last.energy + kinetic;
    }
    expect(last.moveMax).toBeLessThan(1e-6);
    const force = new Float64Array(x.length);
    field.forces(x, force);
    expect(Math.max(...force.map(Math.abs))).toBeLessThan(1e-5);
  });

  it("keeps a tick's energy tied to its sampled positions and anchor when read after later motion", () => {
    const { field, x } = scene({ ...SETTINGS, tether: .05 });
    const motion = new SpatialMotion(field, x, { step: .5, drag: .2 });
    const first = motion.tick(1);
    const expected = energyAt(field, x.slice(), motion.anchor.slice());
    for (let i = 0; i < 30; i++) motion.tick(1);
    motion.anchorHere();
    expect(first.energy).toBe(expected);
    expect(first.energy).not.toBe(motion.current.energy);
    expect(first.energy).toBe(expected);
  });

  it("comes to rest at a lower strength too, where the forces balance, moving less at first", () => {
    // A lower strength takes a gentler path; a field with several balanced arrangements may settle into another of them.
    const { field, x } = scene();
    const motion = new SpatialMotion(field, x, { step: 0.5, drag: 0.2 });
    for (let tick = 0; tick < 24000; tick++) motion.tick(0.25);
    const force = new Float64Array(x.length);
    field.forces(x, force);
    expect(Math.max(...force.map(Math.abs))).toBeLessThan(1e-5);
    const start = scene().x;
    const early = (strength: number): number => new SpatialMotion(field, Float64Array.from(start), { step: 0.5, drag: 0.2 }).tick(strength).moveMax;
    expect(early(0.25)).toBeLessThan(early(1));
    expect(early(0)).toBe(0);
  });

  it("holds a fixed sphere where the hand puts it, with no velocity, while the others answer it", () => {
    const { field, x } = scene();
    const motion = new SpatialMotion(field, x, { step: 0.5, drag: 0.2 });
    const held = new Set([4]);
    for (let tick = 0; tick < 200; tick++) {
      x[12] = 26 + tick; x[13] = 44; x[14] = 5;
      motion.refresh();
      motion.tick(1, held);
      expect([x[12], x[13], x[14]]).toEqual([26 + tick, 44, 5]);
      expect([motion.velocity[12], motion.velocity[13], motion.velocity[14]]).toEqual([0, 0, 0]);
    }
    // Sphere 3 is sprung to the held one, so it has followed it along x.
    expect(x[9]).toBeGreaterThan(22 + 100);
  });

  it("lets two spheres that only repel part for ever, and a tether brings them to rest where its pull meets the push", () => {
    // Nothing holds two lone spheres apart but each other: the shape of a file attached to nothing, drifting on (2026-10-21).
    const free = new SpatialField(Float64Array.from([4, 4]), [], { ...SETTINGS, gravity: 0 }, UP);
    const x = Float64Array.from([-50, 0, 0, 50, 0, 0]);
    const loose = new SpatialMotion(free, Float64Array.from(x), { step: 0.5, drag: 0.2 });
    for (let tick = 0; tick < 4000; tick++) loose.tick(1);
    expect(loose.tick(1).moveMax).toBeGreaterThan(1e-3);
    const held = new SpatialMotion(new SpatialField(Float64Array.from([4, 4]), [], { ...SETTINGS, gravity: 0, tether: 0.01 }, UP), Float64Array.from(x), { step: 0.5, drag: 0.2 });
    for (let tick = 0; tick < 4000; tick++) held.tick(1);
    expect(held.tick(1).moveMax).toBeLessThan(1e-9);
    // At rest each sphere's push, charge over their distance, equals the tether's pull over its way from the anchor.
    const out = held.positions[3] - 50, distance = held.positions[3] - held.positions[0];
    expect(SETTINGS.charge / distance).toBeCloseTo(0.01 * out, 6);
    expect(out).toBeGreaterThan(0);
  });

  it("holds to where the motion began until let go, and to where the spheres stand when anchored again", () => {
    const { field, x } = scene({ ...SETTINGS, tether: 0.05 });
    const start = Float64Array.from(x);
    const motion = new SpatialMotion(field, x, { step: 0.5, drag: 0.2 });
    expect(motion.holding).toBe(true);
    expect([...motion.anchor]).toEqual([...start]);
    for (let tick = 0; tick < 50; tick++) motion.tick(1);
    expect([...motion.anchor]).toEqual([...start]);
    motion.release();
    expect(motion.holding).toBe(false);
    // Let go, the field is the tether's own without it: the energy no longer counts the way from the anchor.
    expect(motion.current.energy).toBeCloseTo(field.forces(x, new Float64Array(x.length)).energy, 9);
    motion.anchorHere();
    expect(motion.holding).toBe(true);
    expect([...motion.anchor]).toEqual([...x]);
    expect(motion.current.energy).toBeCloseTo(field.forces(x, new Float64Array(x.length), x).energy, 9);
  });

  it("measures the picture's size as its box's diagonal", () => {
    expect(diagonalOf(Float64Array.from([0, 0, 0, 3, 4, 12]))).toBe(13);
    expect(diagonalOf(new Float64Array(0))).toBe(0);
  });
});

/** A generator of numbers in [0, 1) from a seed, the same on every machine. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 2 ** 32; };
}

/** A direction for spheres at one point that differs from pair to pair, as the layout's seeded one does. */
const PARTING = (low: number, high: number): { x: number; y: number; z: number } => {
  const x = Math.sin(low + 2 * high), y = Math.cos(3 * low + high), z = 0.25, length = Math.hypot(x, y, z);
  return { x: x / length, y: y / length, z: z / length };
};

/** The repulsion alone, the one force the approximation changes. */
const REPULSION: FieldSettings = { charge: 60, chargeRange: 0, gravity: 0, collisionGap: 0, collisionStiffness: 0, tether: 0, approximation: 0 };

/** Spheres scattered uniformly through a cube, with symbol-like radii. */
function cube(count: number, seed: number, side: number): { x: Float64Array; radii: Float64Array } {
  const next = seeded(seed);
  return {
    x: Float64Array.from({ length: 3 * count }, () => (next() - 0.5) * side),
    radii: Float64Array.from({ length: count }, () => 4 * Math.cbrt(1 + Math.floor(next() * 20)))
  };
}

/** A tree of springs over the spheres: each after the first to one before it, as a picture's references might hang. */
function hanging(count: number, seed: number): FieldSpring[] {
  const next = seeded(seed);
  return Array.from({ length: count - 1 }, (_, i) => ({ a: i + 1, b: Math.floor(next() * (i + 1)), rest: 40, strength: 0.25 }));
}

/** One evaluation of a field at these positions: its forces and its reading. */
function forcesOf(field: SpatialField, x: Float64Array, anchor?: Float64Array): { force: Float64Array; reading: FieldReading } {
  const force = new Float64Array(x.length);
  return { force, reading: field.forces(x, force, anchor) };
}

/** The error of some forces against the exact ones, over the exact ones, as a root of summed squares. */
function relativeRms(approximate: Float64Array, exact: Float64Array): number {
  let error = 0, scale = 0;
  for (let k = 0; k < exact.length; k++) { error += (approximate[k] - exact[k]) ** 2; scale += exact[k] ** 2; }
  return Math.sqrt(error / scale);
}

/** The greatest difference between two sets of forces, over the greatest force. */
const worstShare = (approximate: Float64Array, exact: Float64Array): number =>
  Math.max(...exact.map((value, k) => Math.abs(approximate[k] - value))) / Math.max(...exact.map(Math.abs));

describe("the approximated repulsion, summed through an octree (2026-10-28)", () => {
  it("is the sum over every pair at approximation zero, as a sum by hand gives it", () => {
    const { x, radii } = cube(300, 2, 400);
    const { force } = forcesOf(new SpatialField(radii, [], REPULSION, PARTING), x);
    const byHand = new Float64Array(x.length);
    for (let i = 0; i < radii.length; i++) for (let j = 0; j < radii.length; j++) {
      if (i === j) continue;
      const dx = x[3 * i] - x[3 * j], dy = x[3 * i + 1] - x[3 * j + 1], dz = x[3 * i + 2] - x[3 * j + 2], r = Math.hypot(dx, dy, dz);
      const push = REPULSION.charge / (r < 1 ? r : r * r);
      byHand[3 * i] += push * dx; byHand[3 * i + 1] += push * dy; byHand[3 * i + 2] += push * dz;
    }
    expect(worstShare(force, byHand)).toBeLessThan(1e-12);
  });

  it("walks the tree to the exact loop's forces, overlaps, stiffness and energy when it opens every cell", () => {
    const { x, radii } = cube(2000, 3, 700);
    // A crowd at one point, which only the parting direction can separate.
    for (const body of [7, 8, 9, 1999]) x.set(x.subarray(0, 3), 3 * body);
    const anchor = x.map((value, k) => value + 5 * Math.sin(k));
    for (const chargeRange of [0, 150]) {
      const settings = { ...SETTINGS, chargeRange, tether: 0.02 }, springs = hanging(2000, 4);
      const exact = forcesOf(new SpatialField(radii, springs, settings, PARTING), x, anchor);
      const walked = forcesOf(new SpatialField(radii, springs, { ...settings, approximation: 1e-9 }, PARTING), x, anchor);
      expect(worstShare(walked.force, exact.force)).toBeLessThan(1e-9);
      expect(walked.reading.overlaps).toBe(exact.reading.overlaps);
      expect(walked.reading.overlaps).toBeGreaterThan(100);
      expect(walked.reading.worstOverlap).toBe(exact.reading.worstOverlap);
      expect(Math.abs(walked.reading.stiffness / exact.reading.stiffness - 1)).toBeLessThan(1e-9);
      expect(Math.abs(walked.reading.energy / exact.reading.energy - 1)).toBeLessThan(1e-9);
    }
  });

  it("finds every overlap exactly at any approximation, and without repulsion gives the exact loop's forces to the last digit", () => {
    const { x, radii } = cube(1500, 5, 300);
    radii[42] = 70; // One sphere far larger than the rest, as the T3 bundle has.
    for (const body of [100, 101]) x.set(x.subarray(3 * 99, 3 * 100), 3 * body);
    const springs = hanging(1500, 6);
    for (const approximation of [0.5, 1.2]) {
      const exact = forcesOf(new SpatialField(radii, springs, SETTINGS, PARTING), x);
      const approximate = forcesOf(new SpatialField(radii, springs, { ...SETTINGS, approximation }, PARTING), x);
      expect(approximate.reading.overlaps).toBe(exact.reading.overlaps);
      expect(approximate.reading.overlaps).toBeGreaterThan(1000);
      expect(approximate.reading.worstOverlap).toBe(exact.reading.worstOverlap);
      const still = { ...SETTINGS, charge: 0 };
      const exactAlone = forcesOf(new SpatialField(radii, springs, still, PARTING), x);
      const treeAlone = forcesOf(new SpatialField(radii, springs, { ...still, approximation }, PARTING), x);
      expect(treeAlone.force).toEqual(exactAlone.force);
      expect(treeAlone.reading.stiffness).toBe(exactAlone.reading.stiffness);
      expect(treeAlone.reading.energy).toBe(exactAlone.reading.energy);
    }
  });

  it("approximates the repulsion within the error measured for it, and less as the approximation falls", () => {
    // Measured on this cloud on 2026-10-28, the root of the summed squared errors over the forces' own: 0.0024 at a
    // quarter, 0.0122 at a half, 0.0517 at one; and the stiffness read 0.10% under the exact field's at a half, the far
    // cells taken whole counting as their spheres at their centres. Each bound allows a tenth more, room for a change of
    // rounding and none for a change of method.
    const { x, radii } = cube(2000, 1, 600);
    const exactReading = forcesOf(new SpatialField(radii, [], REPULSION, PARTING), x), exact = exactReading.force;
    const halfStiffness = forcesOf(new SpatialField(radii, [], { ...REPULSION, approximation: 0.5 }, PARTING), x).reading.stiffness;
    expect(Math.abs(halfStiffness / exactReading.reading.stiffness - 1)).toBeLessThan(0.00115);
    const errorAt = (approximation: number): number => relativeRms(forcesOf(new SpatialField(radii, [], { ...REPULSION, approximation }, PARTING), x).force, exact);
    const [quarter, half, one] = [0.25, 0.5, 1].map(errorAt);
    expect(quarter).toBeLessThan(0.0026);
    expect(half).toBeLessThan(0.0134);
    expect(one).toBeLessThan(0.057);
    expect(quarter).toBeLessThan(half);
    expect(half).toBeLessThan(one);
  });

  it("pushes only nearly equally and oppositely: the net force is a small share of the forces, where exactly it is none", () => {
    // Measured 2026-10-28 on this cloud: the net force 0.000177 of the summed magnitudes at a half, against 5e-17 exactly.
    const { x, radii } = cube(2000, 1, 600);
    const netShare = (force: Float64Array): number => {
      const net = [0, 0, 0];
      let total = 0;
      for (let i = 0; i < force.length; i += 3) {
        for (let k = 0; k < 3; k++) net[k] += force[i + k];
        total += Math.hypot(force[i], force[i + 1], force[i + 2]);
      }
      return Math.hypot(...net) / total;
    };
    expect(netShare(forcesOf(new SpatialField(radii, [], REPULSION, PARTING), x).force)).toBeLessThan(1e-12);
    const approximate = netShare(forcesOf(new SpatialField(radii, [], { ...REPULSION, approximation: 0.5 }, PARTING), x).force);
    expect(approximate).toBeGreaterThan(0);
    expect(approximate).toBeLessThan(0.0002);
  });

  it("never pushes a sphere with itself, however coarse the approximation", () => {
    // A clump of sixteen and one sphere a hundred units off: the cell that holds them all is narrower than its distance
    // from the lone sphere's place to its centre of charge, so at a coarse approximation the lone sphere would take it
    // whole, itself among its spheres, and be pushed 12.9 percent harder than the clump pushes it (measured 2026-10-28).
    // Opened because it holds the sphere, it leaves the clump taken whole from a hundred units: 2e-7 from the exact sum.
    const clump = Array.from({ length: 16 }, (_, i) => [50 + 0.4 * Math.sin(i), 50 + 0.4 * Math.cos(2 * i), 50 + 0.4 * Math.sin(3 * i)]);
    const x = Float64Array.from([...clump.flat(), 150, 50, 50]), radii = new Float64Array(17).fill(1);
    const exact = forcesOf(new SpatialField(radii, [], REPULSION, PARTING), x).force;
    const coarse = forcesOf(new SpatialField(radii, [], { ...REPULSION, approximation: 1.5 }, PARTING), x).force;
    expect(worstShare(coarse, exact)).toBeLessThan(1e-3);
  });

  it("cuts the repulsion at a bounded reach sphere by sphere, as the exact loop does", () => {
    // Measured 2026-10-28: 0.0132 at a half with the reach at 120, against the exact loop with the same reach.
    const { x, radii } = cube(2000, 1, 600);
    const bounded = { ...REPULSION, chargeRange: 120 };
    const exact = forcesOf(new SpatialField(radii, [], bounded, PARTING), x).force;
    expect(relativeRms(forcesOf(new SpatialField(radii, [], { ...bounded, approximation: 1e-9 }, PARTING), x).force, exact)).toBeLessThan(1e-12);
    expect(relativeRms(forcesOf(new SpatialField(radii, [], { ...bounded, approximation: 0.5 }, PARTING), x).force, exact)).toBeLessThan(0.0145);
    // Unbounded, the far spheres would push too: the cut is really made.
    expect(relativeRms(forcesOf(new SpatialField(radii, [], REPULSION, PARTING), x).force, exact)).toBeGreaterThan(0.1);
  });

  it("agrees with the exact loop where there is little or nothing to approximate: one sphere, two, all at one point, a line", () => {
    const settings = { ...SETTINGS, tether: 0.01 };
    const scenes: Array<{ x: Float64Array; radii: Float64Array }> = [
      { x: Float64Array.from([3, -4, 5]), radii: Float64Array.from([4]) },
      { x: Float64Array.from([0, 0, 0, 9, 1, -2]), radii: Float64Array.from([4, 6]) },
      { x: Float64Array.from({ length: 150 }, (_, k) => [2, -1, 0.5][k % 3]), radii: new Float64Array(50).fill(4) },
      { x: Float64Array.from({ length: 1500 }, (_, k) => k % 3 === 0 ? (k / 3) * 3 - 750 : k % 3 === 1 ? 4 : -2), radii: new Float64Array(500).fill(2) }
    ];
    for (const { x, radii } of scenes) {
      const anchor = x.map(value => value + 1);
      const exact = forcesOf(new SpatialField(radii, [], settings, PARTING), x, anchor);
      for (const approximation of [1e-9, 0.7]) {
        const approximate = forcesOf(new SpatialField(radii, [], { ...settings, approximation }, PARTING), x, anchor);
        expect(approximate.force.every(Number.isFinite)).toBe(true);
        expect(approximate.reading.overlaps).toBe(exact.reading.overlaps);
        // Up to sixteen spheres share one leaf and are summed one by one, and a crowd at one point is taken whole only from
        // outside it, where that is exact. The line at 0.7 is approximated: 0.0264 measured on 2026-10-28, a tenth more allowed.
        if (approximation < 1e-6 || radii.length <= 50) expect(worstShare(approximate.force, exact.force)).toBeLessThan(1e-9);
        else expect(relativeRms(approximate.force, exact.force)).toBeLessThan(0.029);
      }
    }
  });

  it("parts a crowd at one point inside a larger cloud as the exact loop parts it", () => {
    const { x, radii } = cube(1000, 8, 500);
    const crowd = [10, 11, 12, 13, 14];
    for (const body of crowd) x.set([25, -40, 12], 3 * body);
    const exact = forcesOf(new SpatialField(radii, [], REPULSION, PARTING), x).force;
    const approximate = forcesOf(new SpatialField(radii, [], { ...REPULSION, approximation: 0.7 }, PARTING), x).force;
    expect(approximate.every(Number.isFinite)).toBe(true);
    // Within the crowd each pair pushes with the full charge along its parting direction, far more than the rest of
    // the cloud, so each member's force is the exact one's but for the far spheres' small share.
    for (const body of crowd) {
      const own = Math.hypot(exact[3 * body], exact[3 * body + 1], exact[3 * body + 2]);
      const error = Math.hypot(approximate[3 * body] - exact[3 * body], approximate[3 * body + 1] - exact[3 * body + 1], approximate[3 * body + 2] - exact[3 * body + 2]);
      expect(error / own).toBeLessThan(0.05);
    }
  });

  it("refuses an approximation that is not a finite, nonnegative number", () => {
    for (const approximation of [NaN, Infinity, -0.1]) {
      expect(() => new SpatialField(Float64Array.from([1]), [], { ...SETTINGS, approximation }, UP)).toThrow("nonnegative");
    }
  });
});

describe("one evaluation in steps (2026-10-28)", () => {
  it("sums the same numbers in steps as in one call, however the spheres are divided, exactly and through the tree", () => {
    const { x, radii } = cube(900, 11, 350);
    const anchor = x.map((value, k) => value - 3 * Math.cos(k));
    for (const approximation of [0, 0.6]) {
      const field = new SpatialField(radii, hanging(900, 12), { ...SETTINGS, approximation, tether: 0.02 }, PARTING);
      const whole = forcesOf(field, x, anchor);
      for (const sizes of [[900], [1, 899], [17, 300, 0, 583], [450, 450]]) {
        const force = new Float64Array(x.length), evaluation = field.begin(x, force, anchor);
        let from = 0;
        for (const size of sizes) { evaluation.step(from, from + size); from += size; }
        const reading = evaluation.finish();
        expect(force).toEqual(whole.force);
        expect([reading.stiffness, reading.overlaps, reading.worstOverlap, reading.energy]).toEqual([whole.reading.stiffness, whole.reading.overlaps, whole.reading.worstOverlap, whole.reading.energy]);
      }
    }
  });

  it("reads a past reading's energy in the middle of an evaluation without disturbing it", () => {
    // The energy of a reading is evaluated when it is first read, in scratch of its own, so that a frame that reads it
    // between two steps of the next evaluation leaves that evaluation's tree and sums as they were.
    const { x, radii } = cube(600, 14, 300);
    for (const approximation of [0, 0.5]) {
      const field = new SpatialField(radii, hanging(600, 15), { ...SETTINGS, approximation }, PARTING);
      const earlier = field.forces(x.map(value => value * 1.1), new Float64Array(x.length));
      const whole = forcesOf(field, x);
      const force = new Float64Array(x.length), evaluation = field.begin(x, force);
      evaluation.step(0, 300);
      expect(Number.isFinite(earlier.energy)).toBe(true);
      evaluation.step(300, 600);
      const reading = evaluation.finish();
      expect(force).toEqual(whole.force);
      expect([reading.stiffness, reading.overlaps, reading.worstOverlap]).toEqual([whole.reading.stiffness, whole.reading.overlaps, whole.reading.worstOverlap]);
    }
  });

  it("refuses a step out of order, a finish before every sphere, and an evaluation a later one has displaced", () => {
    const { field, x } = scene({ ...SETTINGS, approximation: 0.5 });
    const evaluation = field.begin(x, new Float64Array(x.length));
    expect(() => evaluation.step(1, 3)).toThrow("begins at sphere 0");
    evaluation.step(0, 2);
    expect(() => evaluation.step(2, 6)).toThrow("ends at 5");
    expect(() => evaluation.finish()).toThrow("every sphere");
    field.forces(x, new Float64Array(x.length));
    expect(() => evaluation.step(2, 5)).toThrow("later evaluation");
  });
});

describe("the motion through an approximated field (2026-10-28)", () => {
  /** Spheres where D3 seats a first picture, a spiral ball of radius ten times the cube root of each one's place. */
  const seat = (count: number): Float64Array => {
    const nodes: Array<{ x?: number; y?: number; z?: number }> = Array.from({ length: count }, () => ({}));
    forceSimulation(nodes, 3).stop();
    return Float64Array.from(nodes.flatMap(node => [node.x!, node.y!, node.z!]));
  };

  /** Ease as the page eases a first picture: free until it calms, then held where it stands, ticking until still. */
  const ease = (field: SpatialField, start: Float64Array, most: number): { ticks: number; still: boolean; held: number; last: number; worstRise: number } => {
    const x = Float64Array.from(start), motion = new SpatialMotion(field, x, MOTION);
    motion.release();
    const total = (energy: number): number => energy + motion.velocity.reduce((sum, v) => sum + v * v / 2, 0);
    let holding = false, quiet = 0, ticks = 0, held = NaN, last = NaN, worstRise = 0;
    while (ticks < most && quiet < QUIET_TICKS) {
      const tick = motion.tick(1);
      ticks++;
      const diagonal = diagonalOf(x);
      if (!holding) {
        if (tick.moveMax <= UNFOLDED_FRACTION * diagonal) { motion.anchorHere(); holding = true; held = last = total(motion.current.energy); }
        continue;
      }
      const now = total(tick.energy);
      worstRise = Math.max(worstRise, (now - last) / Math.abs(last));
      last = now;
      quiet = tick.moveMax <= STILL_FRACTION * diagonal ? quiet + 1 : 0;
    }
    expect(x.every(Number.isFinite) && motion.velocity.every(Number.isFinite)).toBe(true);
    return { ticks, still: quiet >= QUIET_TICKS, held, last, worstRise };
  };

  it("eases clouds and chains until still, finite and losing energy, in about the exact field's ticks", () => {
    // Measured 2026-10-28 at a half, held then still: 325, 444, 330 and 462 ticks against the exact field's 314, 450, 335
    // and 477, the held energy falling in each while one tick could raise it by at most 2.8e-5 of itself, where the exact
    // field's never rose. The bounds allow a quarter more ticks and twice that rise. Larger settings rest less surely: at
    // 0.7 one of 36 such scenes, and at 0.9 three of the four pictures of this repository and the estate, never came to
    // rest (AI-Agent-Workspace/Probes/2026-10-28/approximation/README.md).
    const settings = { ...SETTINGS, tether: 0.02 }, count = 200;
    for (const seed of [3, 4]) {
      const next = seeded(seed), radii = Float64Array.from({ length: count }, () => 4 * Math.cbrt(1 + Math.floor(next() * 20)));
      const start = seat(count);
      for (const springs of [hanging(count, 10 + seed), Array.from({ length: count - 1 }, (_, i) => ({ a: i, b: i + 1, rest: 30, strength: 0.5 }))]) {
        const exact = ease(new SpatialField(radii, springs, settings, PARTING), start, 3000);
        const approximate = ease(new SpatialField(radii, springs, { ...settings, approximation: 0.5 }, PARTING), start, 3000);
        expect(exact.still && approximate.still).toBe(true);
        expect(approximate.ticks).toBeLessThan(1.25 * exact.ticks);
        expect(approximate.last).toBeLessThan(approximate.held);
        expect(approximate.worstRise).toBeLessThan(5e-5);
        expect(exact.worstRise).toBeLessThan(1e-9);
      }
    }
  }, 60_000);
});
