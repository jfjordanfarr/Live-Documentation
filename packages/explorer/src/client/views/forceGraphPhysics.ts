/**
 * The motion of the 3D Local Map, the same in the browser and headlessly: one conservative field of forces and a damped
 * motion through it, which eases at a constant strength and stops when the spheres are still, judged by their motion.
 *
 * The field is the picture's forces written as one energy: a spring on each pulling link toward its rest length, the
 * repulsion of every sphere on every other, a gravity toward the origin, an overlap penalty for spheres closer than their
 * clearance, and a tether pulling each sphere toward where it stood when the motion began. Its forces are the energy's slope, so every spring's pull is equal and opposite at its two ends
 * and is aimed along the line between them as they stand. D3's own spring, which this replaces, shares a pull unequally
 * by its ends' link counts and aims at where the spheres are about to be; a picture under it at a constant strength
 * never stops moving (the easing probe of 2026-10-19, `AI-Agent-Workspace/Probes/2026-10-19/easing/README.md`).
 *
 * The motion is damped velocity Verlet with fixed elapsed time and drag per tick, subdivided when the field is stiff:
 * no cooling schedule or velocity reset. The drag removes energy as time passes. The owner found
 * this motion "quite natural" in the probe (2026-10-19, Turn 12 of that session) and asked for an easing that stops when
 * the picture is still, "by its motion and not by a clock" (2026-10-18).
 *
 * The tether is what lets a large picture come to rest. Without it, a sphere attached to nothing, or a branch turning
 * about its joint, drifts in a direction no force holds, pushed sideways by the lumps of the rest, for thousands of ticks
 * on this repository; held to where it stood, it moves as far as the forces ask and stops (measured and chosen with the
 * owner, 2026-10-21, Turns 4 and 5 of that session). Its rest is not the field's own: a picture that moves again is let a
 * little further toward that, and the motion keeps a person's bearings by the same pull.
 */

/** One pulling link: the two spheres' indices, the rest length and the strength, as `forceGraphLayout.ts` rules them. */
export interface FieldSpring {
  a: number;
  b: number;
  rest: number;
  strength: number;
}

/** The field's constants, read from the tuning. */
export interface FieldSettings {
  /** The repulsion's magnitude: two spheres at distance r push apart with charge / r. */
  charge: number;
  /** How far the repulsion reaches; zero or less is unbounded. */
  chargeRange: number;
  /** The pull toward the origin per unit of distance. */
  gravity: number;
  /** The gap kept between two spheres' surfaces beyond their radii. */
  collisionGap: number;
  /** How hard two spheres closer than their clearance push apart, per unit of overlap. */
  collisionStiffness: number;
  /** The pull toward where each sphere stood when the motion began, per unit of distance; zero is none. */
  tether: number;
}

/** What one evaluation of the field found beside the forces. */
export interface FieldReading {
  energy: number;
  /** Upper bound on positive curvature at these positions, before the motion's strength; contacts may change it. */
  stiffness: number;
  /** How many pairs stand closer than their clearance. */
  overlaps: number;
  /** The largest such shortfall, in layout units. */
  worstOverlap: number;
}

/** A direction for two spheres that stand exactly together, the same on every machine (set by `forceGraphLayout.ts`). */
export type PairDirection = (low: number, high: number) => { x: number; y: number; z: number };

/**
 * The conservative field over spheres at fixed indices. Positions and forces are flat arrays, x, y, z per sphere. The
 * repulsion is summed over every pair exactly, which costs the square of the spheres: about 21 ms a tick at 1,120
 * spheres on the dev box in the probe, near what D3's approximation cost there, and exact, so that the forces are an
 * energy's slope and the picture can come to rest.
 */
export class SpatialField {
  private readonly springStiffness: Float64Array;
  private readonly pairStiffness: Float64Array;

  constructor(readonly radii: Float64Array, readonly springs: readonly FieldSpring[], readonly settings: FieldSettings, private readonly direction: PairDirection) {
    if (!radii.every(radius => Number.isFinite(radius) && radius > 0)) throw new Error("Every sphere needs a finite positive radius.");
    for (const value of [settings.charge, settings.gravity, settings.collisionGap, settings.collisionStiffness, settings.tether]) {
      if (!(Number.isFinite(value) && value >= 0)) throw new Error("The field's constants must be finite and nonnegative.");
    }
    for (const spring of springs) {
      if (!(spring.rest > 0 && Number.isFinite(spring.rest) && spring.strength >= 0 && Number.isFinite(spring.strength))) throw new Error("A spring needs a positive rest length and a nonnegative strength.");
    }
    this.springStiffness = new Float64Array(radii.length);
    for (const spring of springs) {
      // Each spring's radial stiffness is half its strength; the Laplacian's largest eigenvalue is bounded by twice
      // the greatest incident stiffness. Transverse spring curvature is smaller, possibly negative.
      this.springStiffness[spring.a] += spring.strength;
      this.springStiffness[spring.b] += spring.strength;
    }
    this.pairStiffness = new Float64Array(radii.length);
  }

  /** How many spheres the field holds. */
  get count(): number {
    return this.radii.length;
  }

  /** Write the forces at these positions into `out` and return the energy, with the overlaps found; the tether pulls toward `anchor`. */
  forces(x: Float64Array, out: Float64Array, anchor?: Float64Array): FieldReading {
    return this.evaluate(x, out, anchor, false);
  }

  private evaluate(x: Float64Array, out: Float64Array, anchor: Float64Array | undefined, measureEnergy: boolean): FieldReading {
    const n = this.count;
    if (x.length !== 3 * n || out.length !== 3 * n || (anchor && anchor.length !== 3 * n)) throw new Error("Positions, forces and anchors must hold three numbers per sphere.");
    if (!x.every(Number.isFinite) || (anchor && !anchor.every(Number.isFinite))) throw new Error("The spatial field needs finite positions and anchors.");
    out.fill(0);
    this.pairStiffness.set(this.springStiffness);
    let energy = 0, overlaps = 0, worstOverlap = 0;
    for (const spring of this.springs) {
      const a = 3 * spring.a, b = 3 * spring.b;
      let dx = x[b] - x[a], dy = x[b + 1] - x[a + 1], dz = x[b + 2] - x[a + 2];
      const r = Math.hypot(dx, dy, dz), stretch = r - spring.rest;
      if (measureEnergy) energy += spring.strength * stretch * stretch / 4;
      if (r === 0) {
        const low = Math.min(spring.a, spring.b), unit = this.direction(low, Math.max(spring.a, spring.b));
        const sign = spring.a === low ? -1 : 1;
        dx = sign * unit.x; dy = sign * unit.y; dz = sign * unit.z;
      }
      // Half the pull on each end, along the line between them: equal and opposite.
      const k = spring.strength * stretch / (2 * (r || 1));
      out[a] += k * dx; out[a + 1] += k * dy; out[a + 2] += k * dz;
      out[b] -= k * dx; out[b + 1] -= k * dy; out[b + 2] -= k * dz;
    }
    const { charge, collisionGap, collisionStiffness, gravity } = this.settings;
    const range = this.settings.chargeRange > 0 ? this.settings.chargeRange : Infinity;
    const range2 = range * range;
    // The repulsion's energy is -charge·ln r beyond one unit and linear inside it, so its force stays charge at most;
    // with a bounded reach it is offset to meet zero at the bound.
    const offset = Number.isFinite(range) && range > 1 ? charge * Math.log(range) : 0;
    let greatestStiffness = 0;
    for (let i = 0; i < n; i++) {
      const a = 3 * i, ax = x[a], ay = x[a + 1], az = x[a + 2], radius = this.radii[i];
      // Each pair visits this end in the same order; keep its sum in registers instead of writing the array each time.
      let fx = out[a], fy = out[a + 1], fz = out[a + 2];
      let stiffness = this.pairStiffness[i];
      for (let j = i + 1; j < n; j++) {
        const b = 3 * j;
        let dx = ax - x[b], dy = ay - x[b + 1], dz = az - x[b + 2];
        let r2 = dx * dx + dy * dy + dz * dz;
        if (r2 === 0) {
          const unit = this.direction(i, j);
          dx = unit.x * 1e-9; dy = unit.y * 1e-9; dz = unit.z * 1e-9; r2 = 1e-18;
        }
        const r = Math.sqrt(r2);
        let radialStiffness = 0;
        if (r2 < range2 && charge > 0) {
          if (measureEnergy) energy += range <= 1 ? charge * (range - r) : r >= 1 ? offset - charge * Math.log(r) : charge * (1 - r) + offset;
          const k = charge / (r < 1 ? r : r2);
          fx += k * dx; fy += k * dy; fz += k * dz;
          out[b] -= k * dx; out[b + 1] -= k * dy; out[b + 2] -= k * dz;
          // The capped force below one unit is constant radially; beyond it the positive radial curvature is q/r².
          // Transverse repulsion curvature is negative and cannot increase this upper bound.
          if (r >= 1) radialStiffness += charge / r2;
        }
        const clearance = radius + this.radii[j] + collisionGap;
        if (r < clearance && collisionStiffness > 0) {
          const shortfall = clearance - r;
          overlaps++;
          if (shortfall > worstOverlap) worstOverlap = shortfall;
          if (measureEnergy) energy += collisionStiffness * shortfall * shortfall / 2;
          const k = collisionStiffness * shortfall / r;
          fx += k * dx; fy += k * dy; fz += k * dz;
          out[b] -= k * dx; out[b + 1] -= k * dy; out[b + 2] -= k * dz;
          radialStiffness += collisionStiffness;
        }
        stiffness += 2 * radialStiffness;
        this.pairStiffness[j] += 2 * radialStiffness;
      }
      out[a] = fx; out[a + 1] = fy; out[a + 2] = fz;
      greatestStiffness = Math.max(greatestStiffness, stiffness);
    }
    if (gravity > 0) {
      for (let k = 0; k < x.length; k++) {
        if (measureEnergy) energy += gravity * x[k] * x[k] / 2;
        out[k] -= gravity * x[k];
      }
    }
    const tether = this.settings.tether;
    if (tether > 0 && anchor) {
      for (let k = 0; k < x.length; k++) {
        const pull = anchor[k] - x[k];
        if (measureEnergy) energy += tether * pull * pull / 2;
        out[k] += tether * pull;
      }
    }
    const stiffness = greatestStiffness + gravity + (anchor ? tether : 0);
    if (!out.every(Number.isFinite) || !Number.isFinite(stiffness)) throw new Error("The spatial field produced non-finite forces or stiffness.");
    if (measureEnergy) return { energy, stiffness, overlaps, worstOverlap };
    // The browser asks how far the picture moved, not for its potential energy. Retain the sampled positions so a
    // later energy read is still this reading, computed by the very same field evaluation and cached once.
    const positions = x.slice(), anchors = anchor?.slice();
    let measured: number | undefined;
    const readEnergy = (): number => measured ??= this.evaluate(positions, new Float64Array(out.length), anchors, true).energy;
    return { get energy() { return readEnergy(); }, stiffness, overlaps, worstOverlap };
  }
}

/** The motion's constants: the step of time per tick and the drag per unit of time. */
export interface MotionSettings {
  /** Elapsed time per tick, subdivided internally when the field is stiff. */
  step: number;
  drag: number;
}

/** How far one tick moved the spheres, beside the field's reading at the new positions. */
export interface MotionTick extends FieldReading {
  /** The greatest distance travelled by a free sphere across the tick's accepted substeps, in layout units. */
  moveMax: number;
}

/**
 * Damped velocity Verlet through a field at a constant strength: half a kick, a drift, the forces at the new place, half a
 * kick, with the drag applied as an exact decay in two halves around them. Each outer tick advances the same elapsed
 * time, split by the field's local positive-curvature bound; a substep whose endpoint is too stiff is retried smaller.
 * This is a local bound, not a global guarantee across the repulsion's hard range cutoff. A fixed sphere stays where it
 * is put and carries no velocity; the others feel it as usual. The strength scales the forces, so that a lower strength
 * eases the same field more gently; the picture still comes to rest where the forces balance, though a field with several
 * balanced arrangements may reach another of them by the gentler path. The tether holds each sphere to `anchor`, where it
 * stood when the motion began unless one is given, while `holding`; a picture unfolding from nothing is let go until it
 * has calmed, since where it was seeded is no place to hold it.
 */
export class SpatialMotion {
  readonly velocity: Float64Array;
  readonly anchor: Float64Array;
  private held = true;
  private readonly force: Float64Array;
  private readonly next: Float64Array;
  private readonly nextPositions: Float64Array;
  private readonly nextVelocity: Float64Array;
  private readonly moves: Float64Array;
  private readonly travelled: Float64Array;
  private reading: FieldReading;

  constructor(readonly field: SpatialField, readonly positions: Float64Array, readonly settings: MotionSettings, velocity?: Float64Array, anchor?: Float64Array) {
    if (!(settings.step > 0 && Number.isFinite(settings.step) && settings.drag >= 0 && Number.isFinite(settings.drag))) throw new Error("The motion needs a positive step and a nonnegative drag.");
    if (positions.length !== 3 * field.count) throw new Error("Positions must hold three numbers per sphere.");
    this.velocity = velocity ?? new Float64Array(positions.length);
    this.anchor = anchor ?? Float64Array.from(positions);
    if (this.velocity.length !== positions.length || this.anchor.length !== positions.length) throw new Error("Velocities and anchors must hold three numbers per sphere.");
    if (!this.velocity.every(Number.isFinite)) throw new Error("The spatial motion needs finite velocities.");
    this.force = new Float64Array(positions.length);
    this.next = new Float64Array(positions.length);
    this.nextPositions = new Float64Array(positions.length);
    this.nextVelocity = new Float64Array(positions.length);
    this.moves = new Float64Array(field.count);
    this.travelled = new Float64Array(field.count);
    this.reading = field.forces(positions, this.force, this.anchor);
  }

  /** Whether the tether holds the spheres to their anchors. */
  get holding(): boolean {
    return this.held;
  }

  /** The field's reading at the current positions. */
  get current(): FieldReading {
    return this.reading;
  }

  /** Read the forces again after the positions were changed from outside, by a hand or by the carry of a change. */
  refresh(): void {
    this.reading = this.field.forces(this.positions, this.force, this.held ? this.anchor : undefined);
  }

  /** Begin the motion again from where the spheres stand: the tether holds them here from now on. */
  anchorHere(): void {
    this.anchor.set(this.positions);
    this.held = true;
    this.refresh();
  }

  /** Let the tether go, so that the spheres unfold by the other forces alone until `anchorHere`. */
  release(): void {
    this.held = false;
    this.refresh();
  }

  /**
   * One tick at this strength. `fixed` names the spheres a hand holds, at the positions already written for them; a
   * caller that moved any sphere since the last tick calls `refresh` first.
   */
  tick(strength: number, fixed: ReadonlySet<number> = NO_FIXED): MotionTick {
    if (!(strength >= 0 && Number.isFinite(strength))) throw new Error("The strength must be finite and nonnegative.");
    const x = this.positions, v = this.velocity;
    if (!x.every(Number.isFinite) || !v.every(Number.isFinite)) throw new Error("The spatial motion needs finite positions and velocities.");
    let remaining = this.settings.step;
    this.travelled.fill(0);
    let moveMax = 0;
    // A linear Verlet mode is stable below h²·strength·stiffness = 4. Two leaves margin for the field's changing
    // local curvature. Read again after every accepted substep; a new contact can require an endpoint retry.
    const stepFor = (stiffness: number): number => strength > 0 && stiffness > 0 ? Math.sqrt(2 / (strength * stiffness)) : Infinity;
    while (remaining > 0) {
      const maximum = stepFor(this.reading.stiffness);
      // Leave five percent of a partial step for smoothly increasing curvature, avoiding a retry at every endpoint.
      // A whole remaining step that fits is unchanged; a new contact still has to pass the endpoint bound below.
      let h = remaining <= maximum ? remaining : .95 * maximum;
      for (;;) {
        if (!(h > 0) || remaining - h === remaining) throw new Error("The spatial motion cannot advance a finite step at this stiffness.");
        const decay = Math.exp(-this.settings.drag * h / 2);
        for (let i = 0; i < this.field.count; i++) {
          const a = 3 * i;
          const held = fixed.has(i);
          for (let k = a; k < a + 3; k++) {
            this.nextVelocity[k] = held ? 0 : decay * v[k] + h * strength * this.force[k] / 2;
            this.nextPositions[k] = held ? x[k] : x[k] + h * this.nextVelocity[k];
          }
          this.moves[i] = held ? 0 : h * Math.hypot(this.nextVelocity[a], this.nextVelocity[a + 1], this.nextVelocity[a + 2]);
        }
        const reading = this.field.forces(this.nextPositions, this.next, this.held ? this.anchor : undefined);
        const allowed = stepFor(reading.stiffness);
        if (h > allowed * (1 + 1e-12)) { h = .95 * allowed; continue; }
        for (let i = 0; i < this.field.count; i++) {
          const a = 3 * i;
          if (!fixed.has(i)) for (let k = a; k < a + 3; k++) this.nextVelocity[k] = decay * (this.nextVelocity[k] + h * strength * this.next[k] / 2);
          this.travelled[i] += this.moves[i];
          moveMax = Math.max(moveMax, this.travelled[i]);
        }
        if (!this.nextVelocity.every(Number.isFinite) || !Number.isFinite(moveMax)) throw new Error("The spatial motion produced non-finite velocities or travel.");
        x.set(this.nextPositions);
        v.set(this.nextVelocity);
        this.force.set(this.next);
        this.reading = reading;
        remaining -= h;
        break;
      }
    }
    const reading = this.reading;
    return { get energy() { return reading.energy; }, stiffness: reading.stiffness, overlaps: reading.overlaps, worstOverlap: reading.worstOverlap, moveMax };
  }
}

const NO_FIXED: ReadonlySet<number> = new Set();

/** The diagonal of the box around the spheres, the measure of the picture's size that stillness is judged against. */
export function diagonalOf(positions: Float64Array): number {
  if (!positions.length) return 0;
  if (!positions.every(Number.isFinite)) throw new Error("The spatial picture needs finite positions to measure its size.");
  const low = [Infinity, Infinity, Infinity], high = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      if (positions[i + k] < low[k]) low[k] = positions[i + k];
      if (positions[i + k] > high[k]) high[k] = positions[i + k];
    }
  }
  const diagonal = Math.hypot(high[0] - low[0], high[1] - low[1], high[2] - low[2]);
  if (!Number.isFinite(diagonal)) throw new Error("The spatial picture's size is not finite.");
  return diagonal;
}
