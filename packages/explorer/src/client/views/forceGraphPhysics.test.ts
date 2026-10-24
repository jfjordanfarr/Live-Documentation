import { describe, expect, it, vi } from "vitest";

import { diagonalOf, SpatialField, SpatialMotion, type FieldSettings, type FieldSpring } from "./forceGraphPhysics";

const SETTINGS: FieldSettings = { charge: 60, chargeRange: 0, gravity: 0.01, collisionGap: 5, collisionStiffness: 3, tether: 0 };
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
