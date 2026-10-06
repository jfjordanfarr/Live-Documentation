/**
 * The configurations a run tries: a grid over the levers' values, sampled
 * when it is large, with the baseline and each lever varied alone, so that
 * the report can say what each lever does by itself as well as what the
 * best combinations found were. Every run is reproducible from its seed.
 *
 * @module layout-lab/sweep
 */
import { LEVERS, type LabConfig } from "./evaluate";
import type { Signals } from "./signals";

/** A lever and the values a run tries for it. */
export interface LeverValues {
  lever: keyof LabConfig;
  values: Array<LabConfig[keyof LabConfig]>;
}

/** The first grid: the levers at the values the design has stood at and around them. */
export const DEFAULT_GRID =
  "rankingPull=0,0.5,1,2,5;rankingTie=fewest,right,left;orderSeed=none,1,2,3,4,5,6,7,8;orderStarts=0,4,8;orderSweeps=4,8;symbolOrder=layout,alphabetical,appearance;" +
  "columnGap=60,100,140;itemGap=16,24,32;bandGap=16,28,40;membraneNeck=40,60,90;membranePadding=8,12,18;cardMaxWidth=none,480,400,320,260";

/** `lever=a,b,c;lever=none,1..4`: lists, `none` for null, `a..b` for every integer between. */
export function parseGrid(spec: string): LeverValues[] {
  const levers: LeverValues[] = [];
  for (const part of spec.split(";").map(s => s.trim()).filter(Boolean)) {
    const [name, list] = part.split("=").map(s => s.trim());
    if (!LEVERS.includes(name as keyof LabConfig)) throw new Error(`No lever ${JSON.stringify(name)}; the levers are ${LEVERS.join(", ")}.`);
    const values: Array<LabConfig[keyof LabConfig]> = [];
    for (const token of (list ?? "").split(",").map(s => s.trim()).filter(Boolean)) {
      if (token === "none") values.push(null);
      else if (/^-?\d+\.\.-?\d+$/u.test(token)) { const [a, b] = token.split("..").map(Number); for (let v = a; v <= b; v++) values.push(v); }
      else if (/^-?\d+(\.\d+)?$/u.test(token)) values.push(Number(token));
      else values.push(token as LabConfig[keyof LabConfig]);
    }
    levers.push({ lever: name as keyof LabConfig, values });
  }
  return levers;
}

/** A configuration's identity: its levers' values in order. */
export const configKey = (config: LabConfig): string => JSON.stringify(LEVERS.map(lever => config[lever]));

/** A small deterministic generator (mulberry32). */
export function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Each lever varied alone from the baseline, in the grid's order. */
export function oneAtATime(baseline: LabConfig, grid: readonly LeverValues[]): Array<{ lever: keyof LabConfig; value: LabConfig[keyof LabConfig]; config: LabConfig }> {
  const out: Array<{ lever: keyof LabConfig; value: LabConfig[keyof LabConfig]; config: LabConfig }> = [];
  for (const { lever, values } of grid) {
    for (const value of values) {
      if (value === baseline[lever]) continue;
      out.push({ lever, value, config: { ...baseline, [lever]: value } });
    }
  }
  return out;
}

/** The whole grid when it is no larger than `limit`, else `limit` configurations drawn from it by the seed; the baseline is always first. */
export function configurations(baseline: LabConfig, grid: readonly LeverValues[], limit: number, seed: number): LabConfig[] {
  const size = grid.reduce((product, { values }) => product * Math.max(1, values.length), 1);
  const seen = new Set<string>([configKey(baseline)]);
  const out: LabConfig[] = [baseline];
  const push = (config: LabConfig): void => {
    const key = configKey(config);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(config);
  };
  if (size <= limit) {
    const walk = (index: number, config: LabConfig): void => {
      if (index === grid.length) { push(config); return; }
      const { lever, values } = grid[index];
      for (const value of values) walk(index + 1, { ...config, [lever]: value });
    };
    walk(0, baseline);
    return out;
  }
  const next = random(seed);
  let tries = 0;
  while (out.length < limit + 1 && tries < limit * 20) {
    tries++;
    const config = { ...baseline };
    for (const { lever, values } of grid) (config as Record<string, unknown>)[lever] = values[Math.floor(next() * values.length)];
    push(config);
  }
  return out;
}

/** Weights on the signals, each a fraction of the baseline's value per unit of weight. */
export type Weights = Partial<Record<"lengthPx" | "spots" | "foreignSamples" | "escapingSamples" | "pictureHeight" | "pictureWidth" | "backward" | "passages", number>>;

/** The owner's order of 2026-10-06: the length first, the membranes' concerns behind it. */
export const DEFAULT_WEIGHTS: Weights = { lengthPx: 1, spots: 0.3, foreignSamples: 0.2, escapingSamples: 0.1, pictureHeight: 0.1, backward: 0.5 };

/** Weights from `name=value,...`; the defaults when nothing is given. */
export function parseWeights(spec: string | undefined): Weights {
  if (!spec) return DEFAULT_WEIGHTS;
  const weights: Weights = {};
  for (const part of spec.split(",").map(s => s.trim()).filter(Boolean)) {
    const [name, value] = part.split("=");
    (weights as Record<string, number>)[name.trim()] = Number(value);
  }
  return weights;
}

const valueOf = (signals: Signals, name: keyof Weights): number => (name === "spots" ? signals.crossings.spots : signals[name]);

/** A configuration's score: the weighted sum of its signals as fractions of the baseline's; the baseline scores the sum of the weights. */
export function scoreOf(signals: Signals, baseline: Signals, weights: Weights): number {
  let score = 0;
  for (const [name, weight] of Object.entries(weights) as Array<[keyof Weights, number]>) {
    const value = valueOf(signals, name), base = valueOf(baseline, name);
    score += weight * (base > 0 ? value / base : value > 0 ? 2 : 1);
  }
  return score;
}

/** The configurations no other beats on both the length and the crossing spots. */
export function paretoFront<T extends { signals: Signals }>(rows: readonly T[]): T[] {
  return rows.filter(row => !rows.some(other => other !== row
    && other.signals.lengthPx <= row.signals.lengthPx && other.signals.crossings.spots <= row.signals.crossings.spots
    && (other.signals.lengthPx < row.signals.lengthPx || other.signals.crossings.spots < row.signals.crossings.spots)))
    .sort((a, b) => a.signals.lengthPx - b.signals.lengthPx);
}
