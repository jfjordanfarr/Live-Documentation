/**
 * Judgments: pure functions over readings of the settled 2D Local Map, the top layer of the scenario suite.
 *
 * Each judgment states one promise in plain words and returns a verdict listing every place the reading breaks it, so
 * that one scenario reports every promise it broke rather than the first. None touches the browser; each has a unit
 * test with a hand-made reading it must reject (`judgments.test.ts`).
 *
 * Judgments are ranked by what they need, and each sits as high as it will go:
 * - a floor, which a scenario declares so that the laws cannot pass on an empty page;
 * - a law, which needs nothing but the reading;
 * - a relation, between two readings of one run;
 * - an oracle fact, against an independent truth (the compiler's edges for the Rosetta programs);
 * - a baseline, a recorded measurement, one-sided and re-approved by hand. This first slice has none.
 *
 * A promise that does not apply to a reading (no directory drawn, no subject chosen) says so as "not applicable"
 * rather than passing, so that a table can tell coverage from silence.
 */

import { framePadding } from "../../../packages/explorer/src/client/views/localView/layout-measure";
import { flowOf } from "../still-picture-geometry";

import type { Box, CardRead, Reading, WireRead } from "./reading";

export type Rank = "floor" | "law" | "relation" | "oracle" | "baseline";

export interface Verdict {
  judgment: string;
  rank: Rank;
  /** Kept, broken, or not applicable to this reading. */
  outcome: "kept" | "broken" | "n/a";
  /** Every place the promise is broken, in words; for "n/a", why it does not apply. */
  findings: string[];
}

const verdict = (judgment: string, rank: Rank, findings: string[], applicable = true, why = ""): Verdict =>
  applicable
    ? { judgment, rank, outcome: findings.length === 0 ? "kept" : "broken", findings }
    : { judgment, rank, outcome: "n/a", findings: why ? [why] : [] };

const right = (box: Box): number => box.x + box.width;
const bottom = (box: Box): number => box.y + box.height;
const short = (id: string): string => id.slice(id.lastIndexOf("/") + 1);
const px = (value: number): string => `${Math.round(value * 10) / 10} px`;

/** The wires that are routes between two cards, the ones the reading-direction laws speak of. */
const routes = (reading: Reading): WireRead[] => reading.wires.filter(wire => wire.kind === "route" && wire.points.length >= 2);

// ─── Floors ───────────────────────────────────────────────────────────────

/** What a scenario must at least show before its laws mean anything. */
export interface Floor {
  /** Files that must be drawn as cards. */
  drawn?: string[];
  /** The file that must be the map's subject. */
  subject?: string;
  /** Files that must be drawn pinned. */
  pinned?: string[];
  minCards?: number;
  minWires?: number;
  /** The scenario's references skip columns, so the map must reserve lanes for them. */
  lanes?: boolean;
  /** A picture is drawn at all, for a scenario whose picture may be closed directories rather than cards. */
  picture?: boolean;
}

export function judgeFloor(reading: Reading, floor: Floor): Verdict {
  const findings: string[] = [];
  const ids = new Set(reading.cards.map(card => card.id));
  for (const file of floor.drawn ?? []) if (!ids.has(file)) findings.push(`${file} is not drawn`);
  if (floor.subject !== undefined && !reading.cards.some(card => card.subject && card.id === floor.subject)) findings.push(`${floor.subject} is not the subject`);
  for (const file of floor.pinned ?? []) if (!reading.cards.some(card => card.id === file && card.pinned)) findings.push(`${file} is not drawn pinned`);
  if (floor.minCards !== undefined && reading.cards.length < floor.minCards) findings.push(`${reading.cards.length} cards drawn, fewer than ${floor.minCards}`);
  const wires = reading.wires.filter(wire => wire.kind === "route" || wire.kind === "stub").length;
  if (floor.minWires !== undefined && wires < floor.minWires) findings.push(`${wires} wires drawn, fewer than ${floor.minWires}`);
  if (floor.lanes && reading.lanes.length === 0) findings.push("no lane is reserved, though the scenario's references skip columns");
  if (floor.picture && (!reading.picture || reading.picture.width < 1 || reading.picture.height < 1)) findings.push("no picture is drawn");
  if (reading.textBoxes === 0) findings.push("the audit read no text at all");
  return verdict("the scenario's floor is drawn", "floor", findings);
}

// ─── Laws ─────────────────────────────────────────────────────────────────

/**
 * No name or line collides with another, and at reading size none is cut off. Farther out the map holds names to their
 * room and cuts them at their end by design (the card ladder's looks), so there only collisions are judged here.
 */
export function textWhole(reading: Reading): Verdict {
  const atReading = reading.look === null || reading.look === "reading";
  const findings = reading.textFaults.filter(fault => fault.kind === "collision" || atReading).map(fault => (fault.kind === "collision"
    ? `"${fault.text}" collides with "${fault.other ?? ""}" over ${Math.round(fault.amount)} px²`
    : `"${fault.text}" is cut off by ${px(fault.amount)}`));
  return verdict("no text collides or is cut off", "law", findings, reading.textBoxes > 0, "no text was read");
}

/** Every card stands inside its own directory's outline, clear of its edge by the outline's padding. */
export function cardsInsideDirectories(reading: Reading): Verdict {
  const findings: string[] = [];
  const byName = new Map(reading.directories.map(directory => [directory.directory, directory]));
  let judged = 0;
  for (const card of reading.cards) {
    if (card.directory === null) continue;
    const directory = byName.get(card.directory);
    if (!directory) { findings.push(`${short(card.id)} stands in ${card.directory || "the root"}, which publishes no outline`); continue; }
    judged += 1;
    const segment = directory.segments.find(s => card.box.x >= s.box.x - 1 && right(card.box) <= right(s.box) + 1);
    if (!segment) { findings.push(`${short(card.id)} lies across the columns of ${card.directory || "the root"}`); continue; }
    const inset = directory.insetPx;
    if (card.box.y < segment.box.y + inset - 1) findings.push(`${short(card.id)} rises ${px(segment.box.y + inset - card.box.y)} above the inside of ${card.directory}`);
    if (bottom(card.box) > bottom(segment.box) - inset + 1) findings.push(`${short(card.id)} falls ${px(bottom(card.box) - bottom(segment.box) + inset)} below the inside of ${card.directory}`);
  }
  return verdict("every card stands inside its directory", "law", findings, judged > 0 || findings.length > 0, "no card stands in a published directory");
}

/** Each directory is one connected shape: its segments run column after column, each meeting the next. */
export function directoriesConnected(reading: Reading): Verdict {
  const findings: string[] = [];
  const drawn = reading.directories.filter(directory => directory.drawn);
  for (const directory of drawn) {
    if (directory.segments.length === 0) findings.push(`${directory.directory} has an outline but no segment`);
    for (let i = 1; i < directory.segments.length; i += 1) {
      const a = directory.segments[i - 1], b = directory.segments[i];
      if (b.column !== a.column + 1) findings.push(`${directory.directory} skips from column ${a.column} to ${b.column}`);
      const meet = Math.min(bottom(a.box), bottom(b.box)) - Math.max(a.box.y, b.box.y);
      if (meet <= 0) findings.push(`${directory.directory} breaks between columns ${a.column} and ${b.column}`);
    }
  }
  return verdict("each directory is one connected shape", "law", findings, drawn.length > 0, "no directory outline is drawn");
}

/** Two directories of one parent never overlap in a column they share. */
export function siblingsApart(reading: Reading): Verdict {
  const findings: string[] = [];
  const drawn = reading.directories.filter(directory => directory.drawn);
  let pairs = 0;
  for (const a of drawn) for (const b of drawn) {
    if (a.directory >= b.directory || a.parent !== b.parent) continue;
    pairs += 1;
    for (const sa of a.segments) {
      const sb = b.segments.find(s => s.column === sa.column);
      if (!sb) continue;
      const apart = bottom(sa.box) <= sb.box.y || bottom(sb.box) <= sa.box.y;
      if (!apart) findings.push(`${a.directory} and ${b.directory} overlap in column ${sa.column}`);
    }
  }
  return verdict("sibling directories never overlap", "law", findings, pairs > 0, "no two sibling directories are drawn");
}

/** How far from a card's edge an end or a dot may stand and still be on that edge, in screen pixels. */
export const EDGE_TOLERANCE_PX = 12;

/** The card of a file nearest a point; a file may be drawn on more than one card. */
function nearestCard(cards: readonly CardRead[], file: string, x: number, y: number): CardRead | null {
  let best: CardRead | null = null, gap = Infinity;
  for (const card of cards) {
    if (card.id !== file) continue;
    const d = Math.hypot(Math.max(0, card.box.x - x, x - right(card.box)), Math.max(0, card.box.y - y, y - bottom(card.box)));
    if (d < gap) { gap = d; best = card; }
  }
  return best;
}

/**
 * Uses enter on the left and offerings leave on the right: every route leaves its provider's card from the card's
 * right half and reaches its consumer's card in its left half, and every dot stands in the half its side names. The
 * dots stand at the ends of their rows, inside the card's padding (2026-11-18, read on the Rosetta samples), so the
 * law is the side, not the edge.
 */
export function usesLeftOfferingsRight(reading: Reading): Verdict {
  const findings: string[] = [];
  const tolerance = Math.max(4, EDGE_TOLERANCE_PX * Math.min(1, reading.scale));
  const centre = (card: CardRead): number => card.box.x + card.box.width / 2;
  const lines = routes(reading);
  for (const wire of lines) {
    const providerPoint = wire.providerEnd === 0 ? wire.points[0] : wire.points[wire.points.length - 1];
    const consumerPoint = wire.providerEnd === 0 ? wire.points[wire.points.length - 1] : wire.points[0];
    const provider = nearestCard(reading.cards, wire.provider, ...providerPoint);
    const consumer = nearestCard(reading.cards, wire.consumer, ...consumerPoint);
    if (provider && (providerPoint[0] < centre(provider) || providerPoint[0] > right(provider.box) + tolerance)) findings.push(`${short(wire.provider)} offers ${short(wire.consumer)} from outside its right half`);
    if (consumer && (consumerPoint[0] > centre(consumer) || consumerPoint[0] < consumer.box.x - tolerance)) findings.push(`${short(wire.consumer)} takes ${short(wire.provider)} outside its left half`);
  }
  for (const anchor of reading.anchors) {
    const card = nearestCard(reading.cards, anchor.file, anchor.x, anchor.y);
    if (!card) continue;
    const wrong = anchor.side === "inbound" ? anchor.x > centre(card) : anchor.x < centre(card);
    if (wrong) findings.push(`the ${anchor.side === "inbound" ? "using" : "offering"} dot of ${anchor.symbol} on ${short(anchor.file)} stands in the ${anchor.side === "inbound" ? "right" : "left"} half`);
  }
  return verdict("uses enter on the left and offerings leave on the right", "law", findings, lines.length + reading.anchors.length > 0, "no route or dot is drawn");
}

/** Every route reads forward, from what offers on the left to what uses on the right; a cycle's feedback is a stub. */
export function routesForward(reading: Reading): Verdict {
  const lines = routes(reading);
  const findings = lines.filter(wire => flowOf(wire.points, wire.providerEnd).backward).map(wire => `${short(wire.provider)} to ${short(wire.consumer)} runs backward`);
  return verdict("every route reads forward", "law", findings, lines.length > 0, "no route is drawn");
}

/** No route passes over a card it does not end at. */
export function noRouteAcrossACard(reading: Reading): Verdict {
  const lines = routes(reading);
  const findings = lines.filter(wire => wire.occludedSamples > 0).map(wire => `${short(wire.provider)} to ${short(wire.consumer)} crosses another card (${wire.occludedSamples} samples)`);
  return verdict("no route crosses a card it does not end at", "law", findings, lines.length > 0, "no route is drawn");
}

/** No lane lies in a directory that holds neither end of the wires through it. */
export function lanesAtHome(reading: Reading): Verdict {
  const findings = reading.wires.filter(wire => wire.foreignLaneSamples > 0).map(wire => `${short(wire.provider)} to ${short(wire.consumer)} runs in a lane inside a directory holding neither end (${wire.foreignLaneSamples} samples)`);
  return verdict("no lane lies in a stranger's directory", "law", findings, reading.lanes.length > 0, "no lane is reserved");
}

/** Nothing is drawn over the top of the picture: no route rises above the highest card or lane. */
export function nothingOverTheTop(reading: Reading): Verdict {
  const tops = [...reading.cards.map(card => card.box.y), ...reading.lanes.map(lane => lane.box.y)];
  const lines = routes(reading);
  if (tops.length === 0 || lines.length === 0) return verdict("no route rises above the picture", "law", [], false, "no card or route is drawn");
  const top = Math.min(...tops);
  const findings = lines.flatMap(wire => {
    const highest = Math.min(...wire.points.map(point => point[1]));
    return highest < top - 1 ? [`${short(wire.provider)} to ${short(wire.consumer)} rises ${px(top - highest)} above the picture`] : [];
  });
  return verdict("no route rises above the picture", "law", findings);
}

/**
 * A picture with no subject is framed whole, on each axis: centred when it overflows the frame by no more than two
 * paddings, otherwise its near edge at the padding, like a page. The rule and its paddings are the map's own (the
 * owner's choices of 2026-10-30, `frameWhole` in the layout measure).
 */
export function framedWhole(reading: Reading): Verdict {
  const subject = reading.cards.some(card => card.subject);
  if (subject || !reading.picture) return verdict("a picture with no subject is framed whole", "law", [], false, subject ? "the map has a subject" : "no picture is drawn");
  const { frame, picture } = reading;
  const padding = framePadding({ width: frame.width, height: frame.height });
  const findings: string[] = [];
  const axis = (name: string, near: number, far: number, frameNear: number, frameFar: number, pad: number): void => {
    const overflow = (far - near) - (frameFar - frameNear);
    if (overflow <= 2 * pad) {
      const off = (near - frameNear) - (frameFar - far);
      if (Math.abs(off) >= 2) findings.push(`the picture is ${px(Math.abs(off) / 2)} off centre ${name}`);
    } else if (Math.abs(near - (frameNear + pad)) >= 1.5) {
      findings.push(`the picture is wider than the frame ${name} but does not start at its padding (${px(near - frameNear)} where ${px(pad)} is the rule)`);
    }
  };
  axis("across", picture.x, right(picture), frame.x, right(frame), padding.horizontal);
  axis("down", picture.y, bottom(picture), frame.y, bottom(frame), padding.vertical);
  return verdict("a picture with no subject is framed whole", "law", findings);
}

/** The signs at the frame's edges are honest: a sign stands at exactly the edges the picture continues past. */
export function edgeSignsHonest(reading: Reading): Verdict {
  const { frame, picture, edgeSigns } = reading;
  const past = picture
    ? { above: picture.y < frame.y - 1, below: bottom(picture) > bottom(frame) + 1, left: picture.x < frame.x - 1, right: right(picture) > right(frame) + 1 }
    : { above: false, below: false, left: false, right: false };
  // Within a pixel either way the map's own rounding decides, and both answers are honest.
  const near = picture
    ? { above: Math.abs(picture.y - frame.y) <= 1, below: Math.abs(bottom(picture) - bottom(frame)) <= 1, left: Math.abs(picture.x - frame.x) <= 1, right: Math.abs(right(picture) - right(frame)) <= 1 }
    : { above: false, below: false, left: false, right: false };
  const findings: string[] = [];
  for (const edge of ["above", "below", "left", "right"] as const) {
    if (near[edge] || edgeSigns[edge] === past[edge]) continue;
    findings.push(past[edge] ? `the picture continues ${edge === "above" || edge === "below" ? edge : `to the ${edge}`} with no sign` : `a sign says more ${edge === "above" || edge === "below" ? edge : `to the ${edge}`}, where the picture ends inside the frame`);
  }
  return verdict("the frame's edge signs are honest", "law", findings);
}

/** The subject's card stands whole inside the frame. */
export function subjectInFrame(reading: Reading): Verdict {
  const subject = reading.cards.find(card => card.subject);
  if (!subject) return verdict("the subject stands inside the frame", "law", [], false, "the map has no subject");
  const { frame } = reading, box = subject.box;
  const inside = box.x >= frame.x - 1 && right(box) <= right(frame) + 1 && box.y >= frame.y - 1 && bottom(box) <= bottom(frame) + 1;
  return verdict("the subject stands inside the frame", "law", inside ? [] : [`${short(subject.id)} reaches outside the frame`]);
}

/** At rest no wire glows, and every route is drawn at one strength: the map fades the irrelevant and boosts nothing. */
export function wiresPlainAtRest(reading: Reading): Verdict {
  const findings = reading.wires.filter(wire => wire.filter !== "none").map(wire => `${short(wire.provider)} to ${short(wire.consumer)} glows (${wire.filter})`);
  const strengths = [...new Set(routes(reading).map(wire => Math.round(wire.opacity * 100) / 100))];
  if (strengths.length > 1) findings.push(`routes at rest are drawn at ${strengths.length} strengths: ${strengths.join(", ")}`);
  return verdict("no wire glows, and every route is drawn at one strength", "law", findings, reading.wires.length > 0, "no wire is drawn");
}

/** WCAG's least contrast for small text, which every name and line on a card meets. */
export const SMALL_TEXT_CONTRAST = 4.5;
/** How much more contrast a symbol's name has than the prose that describes it: names lead (2026-11-15). */
export const NAME_LEADS_PROSE = 1.5;
/** The least contrast at which an outline is seen against the map's surface. */
export const OUTLINE_SEEN = 1.5;

/**
 * A card's text stands in three tones, each legible: the file's name leads or equals a symbol's name, and a symbol's
 * name leads the prose that describes it.
 */
export function textTones(reading: Reading): Verdict {
  const { fileName, symbolName, prose } = reading.tone;
  if (fileName === null || symbolName === null) return verdict("a card's names lead its prose, each legible", "law", [], false, "no subject card with a symbol is drawn");
  const findings: string[] = [];
  const legible = (name: string, ratio: number | null): void => { if (ratio !== null && ratio < SMALL_TEXT_CONTRAST) findings.push(`${name} stands at ${ratio.toFixed(2)}:1, under ${SMALL_TEXT_CONTRAST}:1`); };
  legible("the file's name", fileName);
  legible("a symbol's name", symbolName);
  legible("the prose", prose);
  if (fileName < symbolName) findings.push(`the file's name (${fileName.toFixed(2)}:1) is fainter than a symbol's (${symbolName.toFixed(2)}:1)`);
  if (prose !== null && symbolName / prose < NAME_LEADS_PROSE) findings.push(`a symbol's name leads its prose by ${(symbolName / prose).toFixed(2)} times, under ${NAME_LEADS_PROSE}`);
  return verdict("a card's names lead its prose, each legible", "law", findings);
}

/** An opened directory's outline is seen, is no stronger than a card's border, and is no filled box. */
export function outlineIsGround(reading: Reading): Verdict {
  const { outline, cardBorder, outlineFillAlpha } = reading.tone;
  if (outline === null) return verdict("a directory's outline is ground, not figure", "law", [], false, "no directory outline is drawn");
  const findings: string[] = [];
  if (outline < OUTLINE_SEEN) findings.push(`the outline stands at ${outline.toFixed(2)}:1, under ${OUTLINE_SEEN}:1, and is not seen`);
  if (cardBorder !== null && outline > cardBorder) findings.push(`the outline (${outline.toFixed(2)}:1) is stronger than a card's border (${cardBorder.toFixed(2)}:1)`);
  if (outlineFillAlpha !== null && outlineFillAlpha >= 0.05) findings.push(`the outline is filled at alpha ${outlineFillAlpha.toFixed(2)}`);
  return verdict("a directory's outline is ground, not figure", "law", findings);
}

/** The page logged no error and asked nothing of another site. */
export function pageHealthy(reading: Reading): Verdict {
  return verdict("no error and no request to another site", "law", [
    ...reading.consoleErrors.map(error => `the console says: ${error.slice(0, 200)}`),
    ...reading.offSiteRequests.map(url => `the page asked ${url}`)
  ]);
}

/** Every law, in the order a report lists them. */
export const LAWS: ReadonlyArray<(reading: Reading) => Verdict> = [
  pageHealthy,
  textWhole,
  cardsInsideDirectories,
  directoriesConnected,
  siblingsApart,
  usesLeftOfferingsRight,
  routesForward,
  noRouteAcrossACard,
  lanesAtHome,
  nothingOverTheTop,
  framedWhole,
  edgeSignsHonest,
  subjectInFrame,
  wiresPlainAtRest,
  textTones,
  outlineIsGround
];

// ─── Relations ────────────────────────────────────────────────────────────

/** Two readings of one scenario agree within a pixel: the same cards in the same places, the same wires, the same signs. */
export function samePicture(name: string, before: Reading, after: Reading, tolerancePx = 1): Verdict {
  const findings: string[] = [];
  if (before.address !== after.address) findings.push(`the address changed from ${before.address} to ${after.address}`);
  if (before.look !== after.look) findings.push(`the look changed from ${before.look ?? "none"} to ${after.look ?? "none"}`);
  const boxes = (reading: Reading): Map<string, Box[]> => {
    const map = new Map<string, Box[]>();
    for (const card of reading.cards) map.set(card.id, [...(map.get(card.id) ?? []), card.box]);
    return map;
  };
  const a = boxes(before), b = boxes(after);
  for (const id of new Set([...a.keys(), ...b.keys()])) {
    const was = a.get(id) ?? [], is = b.get(id) ?? [];
    if (was.length !== is.length) { findings.push(`${short(id)} is drawn ${was.length} times before and ${is.length} after`); continue; }
    was.forEach((box, i) => {
      const moved = Math.max(Math.abs(box.x - is[i].x), Math.abs(box.y - is[i].y), Math.abs(box.width - is[i].width), Math.abs(box.height - is[i].height));
      if (moved > tolerancePx) findings.push(`${short(id)} moved or resized by ${px(moved)}`);
    });
  }
  const count = (reading: Reading): Map<string, number> => {
    const map = new Map<string, number>();
    for (const wire of reading.wires) map.set(`${wire.kind} ${wire.key}`, (map.get(`${wire.kind} ${wire.key}`) ?? 0) + 1);
    return map;
  };
  const wa = count(before), wb = count(after);
  for (const key of new Set([...wa.keys(), ...wb.keys()])) {
    if ((wa.get(key) ?? 0) !== (wb.get(key) ?? 0)) findings.push(`${key.split(" ")[0]} ${key.split(" ")[1].split("|").slice(0, 2).map(short).join(" to ")}: ${wa.get(key) ?? 0} before, ${wb.get(key) ?? 0} after`);
  }
  for (const edge of ["above", "below", "left", "right"] as const) {
    if (before.edgeSigns[edge] !== after.edgeSigns[edge]) findings.push(`the sign ${edge} changed`);
  }
  return verdict(name, "relation", findings);
}

// ─── Oracle facts ─────────────────────────────────────────────────────────

/** One reference an independent oracle knows, file to file: the consumer uses the provider. */
export interface OracleEdge {
  consumer: string;
  provider: string;
}

/**
 * The files wired to the subject are exactly the files the oracle says it uses or is used by: every oracle edge with
 * one end at the subject is drawn as a route or a stub, and no wire at the subject joins a pair the oracle does not
 * know. Judged file to file, since an oracle's symbols are named in its own scheme.
 */
export function wiresMatchOracle(reading: Reading, subject: string, oracle: { edges: readonly OracleEdge[]; documents: readonly string[] } | null): Verdict {
  return wiresAgainst(reading, subject, oracle?.edges ?? null, "the subject's wires are the compiler's edges", "oracle", "the compiler", oracle ? new Set(oracle.documents) : null);
}

/**
 * The same comparison against the references the bundle itself carries, the data the picture was drawn from: a
 * relation between the picture and its data, not an oracle, since a defect that reached the data would pass it. It
 * catches a drawing that drops or invents a wire.
 */
export function wiresMatchData(reading: Reading, subject: string, references: readonly OracleEdge[]): Verdict {
  return wiresAgainst(reading, subject, references, "the subject's wires are the references its data records", "relation", "the data");
}

/**
 * `known`, when given, is the files the source can speak of: a drawn wire to a file outside them (a JSON file that
 * names the subject, which no compiler indexes) is neither confirmed nor denied, as the oracle comparison counts it.
 */
function wiresAgainst(reading: Reading, subject: string, edges: readonly OracleEdge[] | null, name: string, rank: Rank, source: string, known: ReadonlySet<string> | null = null): Verdict {
  if (edges === null) return verdict(name, rank, [], false, `this map has no record in ${source}`);
  if (!reading.cards.some(card => card.id === subject)) return verdict(name, rank, [`${subject} is not drawn`]);
  const pair = (edge: OracleEdge): string => `${edge.consumer} uses ${edge.provider}`;
  const touches = (edge: OracleEdge): boolean => edge.consumer !== edge.provider && (edge.consumer === subject || edge.provider === subject);
  const speaksOf = (edge: OracleEdge): boolean => known === null || (known.has(edge.consumer) && known.has(edge.provider));
  const expected = new Set(edges.filter(touches).map(pair));
  const drawn = new Set(reading.wires.filter(wire => (wire.kind === "route" || wire.kind === "stub") && touches(wire) && speaksOf(wire)).map(pair));
  const findings = [
    ...[...expected].filter(edge => !drawn.has(edge)).map(edge => `missing: ${edge}`),
    ...[...drawn].filter(edge => !expected.has(edge)).map(edge => `not in ${source}: ${edge}`)
  ];
  return verdict(name, rank, findings);
}
