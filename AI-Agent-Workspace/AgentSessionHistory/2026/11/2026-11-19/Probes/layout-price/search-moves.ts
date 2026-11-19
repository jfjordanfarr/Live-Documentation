/**
 * The continuing search on a captured scope, walked headless as the layout lab's `refine` walks it, recording every move:
 * the price's terms before and after, how many cards moved and how far, and every outline that changed.
 *
 *   npx tsx --tsconfig ./tsconfig.base.json <this file> <capture.json> <bundle/scope|capture> <searchStarts> <patience> <free|anchored|joins|joins-slots> [out.json] [orderStarts] [price] [dump dir]
 *
 * `capture` as the scope reads the scope from a capture taken by `capture-addresses.ts`. `price` is `today` (the page's,
 * the default) or a candidate of `candidates.ts` (`A`, `B:<rate>`), which judges the first picture's starts and every
 * trial. With a dump directory, the first picture, the picture after every move and the end are written there as
 * geometry for `draw.ts`.
 *
 * `free` lays every trial out as the page did before 2026-11-19, its ties where the solver met them; `anchored` lays
 * every trial out with the shown picture's tops choosing among placements of equal cost; `joins` the levellings alone;
 * `joins-slots` the levellings alone, their lanes' slots drawn to the shown picture's as well as their cards.
 */
import * as fs from "node:fs";

import { alignmentCandidates } from "../../../../../../../packages/explorer/src/client/views/localView/branch-alignments";
import { pictureScore, signalsOf, type StartCosts } from "../../../../../../../packages/explorer/src/client/views/localView/branch-restarts";
import { beginSearch, judgeAlignment, judgeStart, nextTrialKind } from "../../../../../../../packages/explorer/src/client/views/localView/branch-search";
import { rowItemsOf } from "../../../../../../../packages/explorer/src/client/views/localView/branch-scene";
import { rankingTerms } from "../../../../../../../packages/explorer/src/client/views/localView/cycle-trials";
import { readCaptureFile } from "../../../../../../../scripts/layout-lab/capture";
import { baselineConfig } from "../../../../../../../scripts/layout-lab/evaluate";
import { findScope, loadBundleGraph } from "../../../../../../../scripts/layout-lab/scopes";
import { candidateExtra, emptyOutline } from "./candidates";
import { geometryOf } from "./draw";
import { Lean, type Picture } from "./lean";

type Evaluation = Picture;

const [captureFile, scopeKey, startsArg, patienceArg, mode, outFile, orderStartsArg, priceArg = "today", dumpDir] = process.argv.slice(2);
if (!["free", "anchored", "joins", "joins-slots"].includes(mode)) throw new Error("The mode is free, anchored, joins or joins-slots.");

async function main(): Promise<void> {
  const capture = await readCaptureFile(captureFile);
  const run = scopeKey === "capture" ? { bundle: capture.bundle, base: capture.base, scopeName: capture.scopeName, scope: capture.files, subject: capture.subject } as ReturnType<typeof findScope> : findScope(scopeKey);
  const graph = await loadBundleGraph(run);
  // The starts before the first picture: the visitor's two by default, none in the browser suite's eighty-order setting.
  const config = { ...baselineConfig(), ...(orderStartsArg ? { orderStarts: Number(orderStartsArg) } : null) };
  const churn = 100;
  const costs: StartCosts = { crossing: config.crossingCost, height: config.heightCost, width: config.widthCost, churn, evenness: config.membraneEvenness, levelness: config.rowLevelness, steps: config.membraneSimplicity };
  const t0 = performance.now();
  const lean = new Lean(capture, graph, run, config);
  // A veto judges by today's price and lets its charge only refuse: the search's own price is today's.
  const veto = priceArg.startsWith("Cveto:") ? candidateExtra(priceArg, config.membraneSimplicity) : null;
  const extra = veto ? candidateExtra("today", config.membraneSimplicity) : candidateExtra(priceArg, config.membraneSimplicity);
  const initial = lean.first(config.orderSweeps, config.orderStarts, extra);
  const dump = (name: string, picture: Picture): void => { if (dumpDir) { fs.mkdirSync(dumpDir, { recursive: true }); fs.writeFileSync(`${dumpDir}/${name}.json`, JSON.stringify(geometryOf(picture))); } };
  dump("first", initial);
  const from = Math.max(0, Math.floor(config.orderStarts)) + 1;
  const to = from - 1 + Number(startsArg);
  const priceOf = (e: Evaluation): number => pictureScore(signalsOf(e.branches, e.scene, null), { ...costs, churn: 0 }, config.returnCost, e.scene, e.branches) + extra(e);
  let state = beginSearch({ from, to, patience: Number(patienceArg) }, priceOf(initial));
  let shown = initial;
  let alignments = alignmentCandidates(shown.scene);
  let alignmentIndex = 0, alignmentTried = 0, seedsTried = 0;
  let preferAlignment = true;
  const moves: Move[] = [];
  // Every trial's price, churn aside, in the order tried: two modes that price every trial alike list the same numbers.
  const trialPrices: number[] = [];
  // Every trial: its kind, the order's seed or the levelling's last join, its price churn aside, and whether it was taken.
  const trials: Array<[string, string, number, boolean]> = [];
  // The trials a veto refused that today's price would have taken, by their place in `trials`.
  const vetoed: number[] = [];
  const terms = (e: Evaluation): Record<string, number> => {
    const s = signalsOf(e.branches, e.scene, null);
    return {
      vertical: s.vertical, crossings: s.crossings, height: s.height, width: s.width, unevenness: s.unevenness, steps: s.steps, unlevel: s.unlevel,
      ranking: rankingTerms(e.scene, e.branches, config.returnCost),
      boxHeights: e.scene.boxes.reduce((sum, box) => sum + box.segments.reduce((t, seg) => t + seg.bottom - seg.top, 0), 0),
      emptyOutline: emptyOutline(e.scene),
      ...candidateTerms(e)
    };
  };
  for (;;) {
    const kind = nextTrialKind(state, alignmentIndex < alignments.length, preferAlignment);
    if (!kind || kind === "cycle") break;
    preferAlignment = kind === "seed";
    const seed = state.next;
    const alignment = kind === "alignment" ? alignments[alignmentIndex] : null;
    const anchor = mode === "anchored" || (mode === "joins" && kind === "alignment") ? shown.scene.tops
      : mode === "joins-slots" && kind === "alignment" ? shown.scene.placement.top : undefined;
    const candidate: Picture = kind === "alignment" ? { branches: shown.branches, scene: lean.place(shown.branches, alignments[alignmentIndex++], anchor), start: shown.start }
      : lean.seed(seed, anchor);
    if (kind === "alignment") alignmentTried++; else seedsTried++;
    const signals = signalsOf(candidate.branches, candidate.scene, shown.scene.tops);
    const score = pictureScore(signals, costs, config.returnCost, candidate.scene, candidate.branches) + extra(candidate);
    const base = pictureScore(signals, { ...costs, churn: 0 }, config.returnCost, candidate.scene, candidate.branches) + extra(candidate);
    let judged = (kind === "alignment" ? judgeAlignment : judgeStart)(state, score, base);
    if (judged.adopt && veto && score + veto(candidate) >= state.shown + veto(shown)) {
      judged = (kind === "alignment" ? judgeAlignment : judgeStart)(state, Infinity, base);
      vetoed.push(trials.length);
    }
    const before = state.shown;
    trialPrices.push(base);
    trials.push([kind, kind === "seed" ? `seed ${seed}` : JSON.stringify(alignment?.[alignment.length - 1]), base, judged.adopt]);
    state = judged.state;
    if (!judged.adopt) continue;
    const moved: Array<[string, number]> = [];
    for (const [id, top] of candidate.scene.tops) {
      const was = shown.scene.tops.get(id);
      if (was !== undefined && was !== top) moved.push([id, top - was]);
    }
    const segs = (e: Evaluation) => new Map(e.scene.boxes.filter(b => b.kind === "directory").map(b => [b.key, b.segments]));
    const a = segs(shown), b = segs(candidate);
    const outlines: Array<[string, number]> = [];
    for (const [key, segments] of b) {
      const old = a.get(key);
      let far = 0, changed = false;
      segments.forEach((seg, i) => {
        const o = old?.[i];
        if (!o || o.top !== seg.top || o.bottom !== seg.bottom) { changed = true; far = Math.max(far, o ? Math.max(Math.abs(o.top - seg.top), Math.abs(o.bottom - seg.bottom)) : Infinity); }
      });
      if (changed) outlines.push([key, far]);
    }
    moves.push({
      move: moves.length + 1, kind, seed: kind === "seed" ? seed : null, alignment: alignment?.[alignment.length - 1] ?? null, trial: alignmentTried + seedsTried,
      before, after: base, delta: base - before, termsBefore: terms(shown), termsAfter: terms(candidate),
      cardsMoved: moved.length, farthest: Math.max(0, ...moved.map(([, d]) => Math.abs(d))), moved, outlines,
      // A lane's slot is where its lines run: a slot moved is a line drawn differently.
      slotsMoved: [...candidate.scene.placement.top].filter(([id, top]) => !candidate.scene.tops.has(id) && shown.scene.placement.top.get(id) !== top).length
    });
    shown = candidate;
    dump(`move-${moves.length}`, shown);
    alignments = alignmentCandidates(shown.scene);
    alignmentIndex = 0;
  }
  dump("end", shown);
  // Offered at the end: the levellings another run took at the moves named (OFFER_FROM, OFFER_MOVES), each matched among
  // the end picture's own candidates by its last join and priced as this run prices a trial.
  const offers: string[] = [];
  if (process.env.OFFER_FROM && process.env.OFFER_MOVES) {
    const other = JSON.parse(fs.readFileSync(process.env.OFFER_FROM, "utf8")) as { moveList: Array<{ move: number; alignment: { band: string; edge: string; fromColumn: number; toColumn: number } | null }> };
    for (const number of process.env.OFFER_MOVES.split(",").map(Number)) {
      const want = other.moveList[number - 1]?.alignment;
      const same = (a: { band: string; edge: string; fromColumn: number; toColumn: number }): boolean => !!want && a.band === want.band && a.edge === want.edge && a.fromColumn === want.fromColumn && a.toColumn === want.toColumn;
      const near = (a: { band: string; edge: string; fromColumn: number; toColumn: number }): boolean => !!want && a.band === want.band && a.edge === want.edge && a.fromColumn <= want.toColumn && want.fromColumn <= a.toColumn;
      const candidates = alignmentCandidates(shown.scene);
      const found = candidates.find(c => same(c[c.length - 1])) ?? candidates.find(c => near(c[c.length - 1]));
      if (!found) { offers.push(`move ${number} (${JSON.stringify(want)}): no levelling of that edge is offered by the end picture`); continue; }
      const anchor = mode === "joins-slots" ? shown.scene.placement.top : mode === "joins" || mode === "anchored" ? shown.scene.tops : undefined;
      const trial: Picture = { branches: shown.branches, scene: lean.place(shown.branches, found, anchor), start: shown.start };
      const price = pictureScore(signalsOf(trial.branches, trial.scene, shown.scene.tops), costs, config.returnCost, trial.scene, trial.branches) + extra(trial);
      const charged = veto ? price + veto(trial) - veto(shown) : price;
      offers.push(`move ${number} (${JSON.stringify(found[found.length - 1])}${same(found[found.length - 1]) ? "" : `, the nearest offered to ${JSON.stringify(want)}`}): priced ${price - state.shown >= 0 ? "+" : ""}${Math.round((charged - state.shown) * 10) / 10} against the end, so ${charged < state.shown ? "taken" : "refused"}`);
      dump(`offer-${number}`, trial);
    }
  }
  const result = {
    scope: scopeKey, mode, price: priceArg, searchStarts: Number(startsArg), patience: Number(patienceArg), seedsTried, alignmentTried, moves: moves.length, first: priceOf(initial), end: state.shown,
    ms: performance.now() - t0, finalTops: Object.fromEntries(shown.scene.tops), trialPrices, trials, vetoed, offers, moveList: moves
  };
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 1));
  for (const offer of offers) console.log(`  offered ${offer}`);
  if (veto) console.log(`  vetoed: ${vetoed.length} trials today's price would have taken`);
  console.log(`${scopeKey} ${mode} ${priceArg} starts ${startsArg} patience ${patienceArg}: seeds ${seedsTried}, joins ${alignmentTried}, moves ${moves.length}, first ${result.first}, end ${result.end}, ${Math.round(result.ms)} ms`);
  for (const m of moves) {
    const watch = m.moved.filter(([id]) => /compose\.test\.ts$/u.test(id)).map(([, d]) => d);
    const changed = Object.keys(m.termsAfter).filter(k => m.termsAfter[k] !== m.termsBefore[k]).map(k => `${k} ${m.termsAfter[k] - m.termsBefore[k] > 0 ? "+" : ""}${m.termsAfter[k] - m.termsBefore[k]}`).join(", ");
    console.log(`  move ${m.move} ${m.kind}${m.seed ? " " + m.seed : ""}: ${m.after} (${m.delta}), cards moved ${m.cardsMoved}, farthest ${m.farthest}${watch.length ? `, compose.test.ts ${watch[0]}` : ""}; ${changed}`);
  }
}

/**
 * What candidate A of the price's mends would read from a picture, on every drawn directory: the outline's steps and
 * their pixels counted only between neighbouring columns that both hold the directory's own cards. (A measure of the
 * ground an outline encloses beyond its contents was tried here and dropped: it miscounted where nested outlines grow
 * together. Where no card moves, the outlines' added height, `boxHeights`, is that ground exactly.)
 */
function candidateTerms(e: Evaluation): Record<string, number> {
  const { scene } = e;
  let cardSteps = 0, cardUnevenness = 0;
  for (const box of scene.boxes) {
    if (box.kind !== "directory") continue;
    const own = rowItemsOf(box);
    const holds = (column: number): boolean => own.some(id => scene.items.get(id)?.column === column);
    for (let i = 1; i < box.segments.length; i++) {
      const a = box.segments[i - 1], b = box.segments[i];
      if (!holds(a.column) || !holds(b.column)) continue;
      const top = Math.abs(a.top - b.top), bottom = Math.abs(a.bottom - b.bottom);
      cardUnevenness += top + bottom;
      cardSteps += Number(top !== 0) + Number(bottom !== 0);
    }
  }
  return { cardSteps, cardUnevenness };
}

interface Move {
  move: number; kind: string; seed: number | null; alignment: unknown; trial: number; before: number; after: number; delta: number;
  termsBefore: Record<string, number>; termsAfter: Record<string, number>; cardsMoved: number; farthest: number; moved: Array<[string, number]>; outlines: Array<[string, number]>; slotsMoved: number;
}

main().catch(error => { console.error(error); process.exit(1); });
