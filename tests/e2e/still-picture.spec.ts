import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import {
  LOCAL_MAP,
  MEMBRANE_MAP,
  backEnabled,
  boxOf,
  cardBoxes,
  centerDistance,
  chainTable,
  consumersOf,
  displayNames,
  expandedTable,
  factsInScope,
  forceGraphUrl,
  gesture,
  legibleNames,
  loadGraph,
  localMapUrl,
  membraneBrowseUrl,
  membranePinAllUrl,
  readPicture,
  runTour,
  scoreboardTable,
  scoreChurn,
  scoreExpanded,
  scoreHiddenAmongDrawn,
  scoreHops,
  scoreLegibility,
  scoreOcclusion,
  scoreRoutes,
  scoreText,
  symbolCounts,
  type ChainJourney,
  type ChurnScore,
  type Fact,
  type Journey,
  type Scoreboard,
  type ViewReading
} from "./still-picture";
import type { ExplorerGraphPayload } from "../../packages/explorer/src/shared/types";

/**
 * The still-picture deck, played over the shipped bundles.
 *
 * Each test puts one view in the state the deck names, at the deck's frame,
 * and takes the measures: the six of the first deck and the nine of the
 * expanded one. The numbers go to `reports/still-picture/` as tables and as
 * JSON, to be read against the predictions in
 * `AI-Agent-Workspace/Probes/2026-10-01/still-picture-deck.md`. The
 * assertions are only the rules the workspace already holds: no label
 * collisions, no cut-off text, no wire that changes shape under a pan, and
 * the Local Map's wires in their gutters. Everything else is reported.
 */

interface Run {
  bundle: string;
  base: string;
  /** Which scope set: the five files that broke both views, or a chain of four across four folders. */
  scopeName: "five files" | "chain";
  /** The files whose references among themselves are the facts in scope. */
  scope: string[];
  /** The file the Local Map and the Force Graph open on. */
  subject: string;
  /** The question the journey answers: which files use `symbol` of `file`. */
  journey?: { file: string; symbol: string };
  /** A uses B uses C uses D; the journey asks how A reaches D. */
  chain?: string[];
}

const FIVE_REPOSITORY = [
  "packages/engine/src/live-docs/graph.ts",
  "packages/engine/src/live-docs/document.ts",
  "packages/engine/src/live-docs/graphFiles.ts",
  "packages/explorer/src/shared/staticExplorerData.ts",
  "packages/explorer/src/shared/staticBuilder.ts"
];

const CHAIN_REPOSITORY = [
  "packages/explorer/src/client/index.ts",
  "packages/explorer/src/client/persistence/compressed-url-state.ts",
  "packages/explorer/src/client/views/pin-state.ts",
  "packages/explorer/src/client/views/symbolAnchors.ts"
];

const FIVE_ESTATE = [
  "Contracts/IPaymentService.cs",
  "PaymentService/PaymentService.cs",
  "Gateway/Wcf/HubProxy.cs",
  "Hub/PaymentHub.cs",
  "Portal/Services/GatewayClient.cs"
];

const CHAIN_ESTATE = ["Portal/Services/GatewayClient.cs", "Gateway/Controllers/PaymentsController.cs", "Gateway/Wcf/HubProxy.cs", "Contracts/IPaymentHub.cs"];

const RUNS: Run[] = [
  { bundle: "repository", base: "/", scopeName: "five files", scope: FIVE_REPOSITORY, subject: FIVE_REPOSITORY[0], journey: { file: FIVE_REPOSITORY[0], symbol: "GraphFile" } },
  { bundle: "repository", base: "/", scopeName: "chain", scope: CHAIN_REPOSITORY, subject: CHAIN_REPOSITORY[0], chain: CHAIN_REPOSITORY },
  { bundle: "estate", base: "/samples/estate/", scopeName: "five files", scope: FIVE_ESTATE, subject: FIVE_ESTATE[1], journey: { file: FIVE_ESTATE[0], symbol: "IPaymentService" } },
  { bundle: "estate", base: "/samples/estate/", scopeName: "chain", scope: CHAIN_ESTATE, subject: CHAIN_ESTATE[0], chain: CHAIN_ESTATE }
];

const FORCE_GRAPH: ViewReading = {
  wires: "#view-graph .no-such-wire",
  card: "#view-graph .no-such-card",
  row: ".no-such-row",
  rowLabel: ".no-such-label",
  name: ".no-such-name",
  camera: "#graph-svg",
  pannable: "#graph-svg",
  sourceIs: "consumer",
  text: []
};

const REPORT_DIR = path.resolve(__dirname, "../../reports/still-picture");

const VIEW_ORDER = ["Local Map", "Membrane Map", "Rings", "Force Graph"];

const nameOf = (id: string): string => id.split("/").pop() ?? id;

/**
 * Writes one view's row into the scoreboard on disk, merged by bundle, scope, view and state, and regenerates the
 * tables. Each test writes its own rows because a failed test ends its worker, and with it any rows held in memory.
 */
function recordBoard(board: Scoreboard): void {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const jsonFile = path.join(REPORT_DIR, "scoreboard.json");
  const kept: Scoreboard[] = fs.existsSync(jsonFile) ? (JSON.parse(fs.readFileSync(jsonFile, "utf8")) as Scoreboard[]) : [];
  const same = (row: Scoreboard): boolean => row.bundle === board.bundle && (row.scopeName ?? "five files") === board.scopeName && row.view === board.view && row.state === board.state;
  const boards = [...kept.filter(row => !same(row)), board];
  const order = (row: Scoreboard): number =>
    RUNS.findIndex(run => run.bundle === row.bundle && run.scopeName === (row.scopeName ?? "five files")) * 100 + VIEW_ORDER.indexOf(row.view) * 10 + (row.state.startsWith("path") ? 1 : 0);
  boards.sort((a, b) => order(a) - order(b));
  fs.writeFileSync(jsonFile, JSON.stringify(boards, null, 2), "utf8");
  const sections = RUNS.map(run => {
    const rows = boards.filter(row => row.bundle === run.bundle && (row.scopeName ?? "five files") === run.scopeName);
    if (rows.length === 0) return "";
    const notes = rows.flatMap(row => [
      `- ${row.view}, ${row.state}: measured ${row.measuredAt}`,
      ...row.notes.map(note => `- ${row.view}: ${note}`),
      ...(row.journey ? [`- ${row.view} journey, ${row.journey.question}: answer ${row.journey.answer.join(", ") || "(none)"}; ${row.journey.notes.join("; ")}`] : []),
      ...(row.chain ? [`- ${row.view} chain journey, ${row.chain.question}: ${row.chain.notes.join("; ")}`] : []),
      ...(row.tour && row.tour.notes.length > 0 ? [`- ${row.view} tour: ${row.tour.notes.join("; ")}`] : []),
      ...(row.text.collisions + row.text.cutOffs > 0 ? [`- ${row.view} text faults:\n\n\`\`\`text\n${row.text.faults}\n\`\`\``] : [])
    ]);
    const chain = rows.some(row => row.chain) ? `\n\n${chainTable(rows)}` : "";
    return `## ${run.bundle}, ${run.scopeName}\n\n${scoreboardTable(rows)}\n\n${expandedTable(rows)}${chain}\n\n${notes.join("\n")}\n`;
  });
  const header = "# Still-picture scoreboard\n\nAt 1600 by 1000 CSS pixels; each row says when it was measured. The deck that defines each column is `AI-Agent-Workspace/Probes/2026-10-01/still-picture-deck.md`.\n\n";
  fs.writeFileSync(path.join(REPORT_DIR, "scoreboard.md"), header + sections.filter(Boolean).join("\n"), "utf8");
}

/** A picture of the page as it is now, beside the scoreboard, named by bundle, scope, view and moment. */
const shot = async (page: Page, run: Run, view: string, moment: string): Promise<void> => {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const scope = run.scopeName === "chain" ? "-chain" : "";
  await page.screenshot({ path: path.join(REPORT_DIR, `${run.bundle}${scope}-${view.toLowerCase().replace(/ /gu, "-")}-${moment}.png`) });
};

const settleLocalMap = async (page: Page, file: string): Promise<void> => {
  await page.waitForSelector(`#map-container .node-card.local-focus[data-id="${file}"]`, { timeout: 20_000 });
  await page.waitForSelector("#map-connections .connection-path", { timeout: 10_000 });
  await page.waitForTimeout(700);
};

const settleMembranePins = async (page: Page): Promise<void> => {
  await page.waitForSelector(".pin-active-root", { timeout: 20_000 });
  await page.waitForSelector("#membrane-container .membrane-connection", { timeout: 10_000 });
  await page.waitForTimeout(1300);
};

const settleMembraneBrowse = async (page: Page, file: string): Promise<void> => {
  await page.waitForSelector(".membrane-browse-root", { timeout: 20_000 });
  await page.waitForSelector(`#membrane-container .membrane-card[data-id="${file}"]`, { timeout: 10_000 });
  await page.waitForTimeout(900);
};

/** What the deck reads from one picture without moving the camera: tests 1, 2, 3, 7 to 13. */
interface Still {
  legibility: Scoreboard["legibility"];
  picture: Scoreboard["picture"];
  occlusion: Scoreboard["occlusion"];
  text: Scoreboard["text"];
  expanded: Scoreboard["expanded"];
  hiddenAmongDrawn: Scoreboard["hiddenAmongDrawn"];
}

async function stillMeasures(page: Page, view: ViewReading, graph: ExplorerGraphPayload, facts: Fact[], names: Record<string, Record<string, string>>): Promise<Still> {
  const picture = await readPicture(page, view, names);
  return {
    legibility: scoreLegibility(facts, picture),
    picture: { scale: picture.scale, smallestLabelPx: picture.smallestLabelPx, cardsTotal: picture.cardsTotal, cardsInFrame: picture.cardsInFrame, cardsPartlyInFrame: picture.cardsPartlyInFrame, wires: picture.wires.length },
    occlusion: scoreOcclusion(picture),
    text: await scoreText(page, view),
    expanded: scoreExpanded(picture, symbolCounts(graph)),
    hiddenAmongDrawn: scoreHiddenAmongDrawn(graph, picture)
  };
}

/** A click on a control outside the frame, such as the pathfinder toolbar: one gesture, no pan. */
async function press(page: Page, selector: string): Promise<{ gestures: number; targetPx: number }> {
  const box = await boxOf(page, selector);
  if (!box) throw new Error(`${selector} has no box to click`);
  await page.click(selector);
  return { gestures: 1, targetPx: Math.round(Math.min(box.width, box.height)) };
}

/** Counts gestures and keeps the smallest target across a journey's moves. */
class Moves {
  gestures = 0;
  smallest: number | null = null;
  take(move: { gestures: number; targetPx: number }): void {
    this.gestures += move.gestures;
    this.smallest = this.smallest === null ? move.targetPx : Math.min(this.smallest, move.targetPx);
  }
  typed(): void {
    this.gestures += 1;
  }
}

/** Click the subject's symbol row, read which consumers light up and what moved, then unpin. */
async function localMapJourney(page: Page, run: Run, graph: ExplorerGraphPayload): Promise<{ journey: Journey; churn: ChurnScore }> {
  const { file, symbol } = run.journey!;
  const answer = consumersOf(graph, file, symbol);
  await page.goto(localMapUrl(run.base, file));
  await settleLocalMap(page, file);
  const subject = `#map-container .local-column.center .node-card[data-id="${file}"]`;
  // A symbol row is `display: contents`, so the label is the thing a pointer can hit; its click reaches the row.
  const row = `${subject} .symbol-row[data-symbol="${symbol}"] .symbol-label`;
  const start = await boxOf(page, subject);
  const before = await cardBoxes(page, LOCAL_MAP);
  const backBefore = await backEnabled(page);
  await shot(page, run, "Local Map", "journey-start");
  const move = await gesture(page, LOCAL_MAP, row);
  await page.waitForTimeout(600);
  const after = await boxOf(page, subject);
  const churn = scoreChurn(before, await cardBoxes(page, LOCAL_MAP));
  await shot(page, run, "Local Map", "journey-answer");
  const answerLegible = await legibleNames(page, LOCAL_MAP, answer);
  const highlighted = await page.evaluate(
    (ids) => ids.filter(id => [...document.querySelectorAll<HTMLElement>("#map-container .node-card.card-highlighted")].some(card => card.dataset.id === id)).length,
    answer
  );
  const historyEntry = (await backEnabled(page)) && !backBefore;
  await gesture(page, LOCAL_MAP, row);
  await page.waitForTimeout(600);
  const returned = await boxOf(page, subject);
  await shot(page, run, "Local Map", "journey-return");
  return {
    journey: {
      question: `which files use ${symbol} of ${file}`,
      answer,
      gestures: move.gestures,
      smallestTargetPx: move.targetPx,
      subjectMovedPx: centerDistance(start, after),
      answerLegible,
      historyEntry,
      returnErrorPx: centerDistance(start, returned),
      notes: [`${highlighted} of ${answer.length} answer cards highlighted by the pin`, "return move: the same row clicked again"]
    },
    churn
  };
}

/** From A selected, ask the pathfinder for the path to D, then read the path picture; Clear is the return move. */
async function localMapChainJourney(page: Page, run: Run, graph: ExplorerGraphPayload, facts: Fact[], names: Record<string, Record<string, string>>): Promise<{ journey: ChainJourney; pathRow: Scoreboard }> {
  const chain = run.chain!;
  const a = chain[0];
  const d = chain[chain.length - 1];
  const byId = new Map(graph.nodes.map(node => [node.id, node]));
  await page.goto(localMapUrl(run.base, a));
  await settleLocalMap(page, a);
  const subject = `#map-container .node-card[data-id="${a}"]`;
  const start = await boxOf(page, subject);
  const backBefore = await backEnabled(page);
  const moves = new Moves();
  const pick = async (input: "from" | "to", file: string): Promise<void> => {
    moves.take(await press(page, `#pathfind-${input}`));
    await page.keyboard.type(byId.get(file)?.name ?? nameOf(file));
    moves.typed();
    await page.waitForSelector(`#pathfind-${input}-results .pathfind-result`, { timeout: 5_000 });
    const index = await page.evaluate(
      ({ input, file, relative }) => [...document.querySelectorAll<HTMLElement>(`#pathfind-${input}-results .pathfind-result`)].findIndex(el => {
        const text = el.querySelector(".pathfind-result-path")?.textContent?.trim();
        return text === file || text === relative;
      }),
      { input, file, relative: byId.get(file)?.codeRelativePath ?? file }
    );
    if (index < 0) throw new Error(`${file} is not among the pathfinder's results for its name`);
    moves.take(await press(page, `#pathfind-${input}-results .pathfind-result[data-index="${index}"]`));
  };
  await pick("from", a);
  await pick("to", d);
  moves.take(await press(page, "#pathfind-go"));
  await page.waitForSelector("#view-map.has-path, #pathfind-status a", { timeout: 10_000 });
  // The Local Map draws a path only in its reading direction, what offers left of what uses it.
  // Asked the other way round it offers the reverse question as a link; taking it is one more gesture.
  const offered = await page.locator("#pathfind-status a").count();
  if (offered > 0) {
    moves.take(await press(page, "#pathfind-status a"));
  }
  await page.waitForSelector("#view-map.has-path", { timeout: 10_000 });
  await page.waitForSelector("#map-connections .connection-path", { timeout: 10_000 });
  await page.waitForTimeout(1200);
  await shot(page, run, "Local Map", "chain-path");
  const after = await boxOf(page, subject);
  const picture = await readPicture(page, LOCAL_MAP, names);
  const hops = scoreHops(graph, chain, picture);
  // The pathfinder draws a shortest path of its own choosing; when it is not the deck's chain, say which it drew and how it reads.
  // The strip lists the path provider first; the deck's chain is listed dependent first, so it is read backwards to compare and to score.
  const drawn = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("#pathfind-path .pathfind-path-hop-name")].map(el => el.title));
  const drawnChain = [...drawn].reverse();
  const drawnNote = drawnChain.join(" ") === chain.join(" ")
    ? "the map drew the deck's chain"
    : `the map drew ${drawn.join(" to ")}, another shortest path, of whose ${drawnChain.length - 1} hops ${scoreHops(graph, drawnChain, picture).legible} are legible; the chain's own hops are scored above`;
  const namesLegible = await legibleNames(page, LOCAL_MAP, chain);
  const historyEntry = (await backEnabled(page)) && !backBefore;
  const pathRow: Scoreboard = {
    measuredAt: new Date().toISOString(),
    bundle: run.bundle,
    scopeName: run.scopeName,
    view: "Local Map",
    state: `path ${nameOf(a)} to ${nameOf(d)}`,
    scope: { files: run.scope.length, facts: facts.length },
    legibility: scoreLegibility(facts, picture),
    picture: { scale: picture.scale, smallestLabelPx: picture.smallestLabelPx, cardsTotal: picture.cardsTotal, cardsInFrame: picture.cardsInFrame, cardsPartlyInFrame: picture.cardsPartlyInFrame, wires: picture.wires.length },
    occlusion: scoreOcclusion(picture),
    text: await scoreText(page, LOCAL_MAP),
    routes: null,
    journey: null,
    expanded: scoreExpanded(picture, symbolCounts(graph)),
    hiddenAmongDrawn: scoreHiddenAmongDrawn(graph, picture),
    churn: null,
    tour: null,
    chain: null,
    notes: ["the Local Map's multi-file state, reached through the pathfinder; the chain journey on the row above ends here"]
  };
  moves.take(await press(page, "#pathfind-clear"));
  await page.waitForTimeout(900);
  const returned = await boxOf(page, subject);
  await shot(page, run, "Local Map", "chain-return");
  return {
    journey: {
      question: `how does ${nameOf(a)} reach ${nameOf(d)}`,
      path: chain,
      gestures: moves.gestures - 1,
      smallestTargetPx: moves.smallest,
      subjectMovedPx: centerDistance(start, after),
      hops: hops.hops,
      hopsLegible: hops.legible,
      namesLegible,
      historyEntry,
      returnErrorPx: centerDistance(start, returned),
      notes: [
        "through the pathfinder: click FROM, type, pick, click TO, type, pick, Find Path",
        offered > 0 ? "asked with the dependent first, the map offered the reverse question and one click took it" : "asked in the map's reading direction",
        drawnNote,
        "return move: Clear, not counted among the gestures"
      ]
    },
    pathRow
  };
}

/** From the folder view, open the subject's card if it is closed, pin the symbol, read the consumers and what moved, then unpin. */
async function membraneJourney(page: Page, run: Run, graph: ExplorerGraphPayload): Promise<{ journey: Journey; churn: ChurnScore }> {
  const { file, symbol } = run.journey!;
  const answer = consumersOf(graph, file, symbol);
  await page.goto(membraneBrowseUrl(run.base, file));
  await settleMembraneBrowse(page, file);
  const card = `#membrane-container .membrane-card[data-id="${file}"]`;
  const label = `${card} .membrane-card__symbol-row[data-symbol="${symbol}"] .membrane-card__symbol-label`;
  const notes: string[] = [];
  const moves = new Moves();
  const backBefore = await backEnabled(page);
  await shot(page, run, "Membrane Map", "journey-start");
  if ((await page.locator(`${card}.membrane-card--collapsed`).count()) > 0) {
    moves.take(await gesture(page, MEMBRANE_MAP, card));
    await page.waitForTimeout(900);
    notes.push("the card opened first: a closed card shows no symbol rows");
  }
  const start = await boxOf(page, card);
  const before = await cardBoxes(page, MEMBRANE_MAP);
  moves.take(await gesture(page, MEMBRANE_MAP, label));
  await settleMembranePins(page);
  const after = await boxOf(page, card);
  const churn = scoreChurn(before, await cardBoxes(page, MEMBRANE_MAP));
  await shot(page, run, "Membrane Map", "journey-answer");
  const answerLegible = await legibleNames(page, MEMBRANE_MAP, answer);
  const historyEntry = (await backEnabled(page)) && !backBefore;
  await gesture(page, MEMBRANE_MAP, label);
  await page.waitForTimeout(1300);
  const returned = await boxOf(page, card);
  await shot(page, run, "Membrane Map", "journey-return");
  notes.push("return move: the same symbol label clicked again, which empties the pins and returns to the folder");
  return {
    journey: {
      question: `which files use ${symbol} of ${file}`,
      answer,
      gestures: moves.gestures,
      smallestTargetPx: moves.smallest,
      subjectMovedPx: centerDistance(start, after),
      answerLegible,
      historyEntry,
      returnErrorPx: centerDistance(start, returned),
      notes
    },
    churn
  };
}

/**
 * From A's folder, pin all of A, then of B as it appears, then of C, so that D arrives: the Membrane's own way to
 * walk a chain. The pin-active header's back control is the return move.
 */
async function membraneChainJourney(page: Page, run: Run, graph: ExplorerGraphPayload, names: Record<string, Record<string, string>>): Promise<ChainJourney> {
  const chain = run.chain!;
  const a = chain[0];
  await page.goto(membraneBrowseUrl(run.base, a));
  await settleMembraneBrowse(page, a);
  const card = (id: string): string => `#membrane-container .membrane-card[data-id="${id}"]`;
  const start = await boxOf(page, card(a));
  const backBefore = await backEnabled(page);
  const moves = new Moves();
  const notes: string[] = [];
  for (const id of chain.slice(0, -1)) {
    if ((await page.locator(card(id)).count()) === 0) {
      notes.push(`${nameOf(id)} had no card to pin from, so the walk stopped there`);
      break;
    }
    moves.take(await gesture(page, MEMBRANE_MAP, `${card(id)} [title="Pin all symbols"]`));
    await settleMembranePins(page);
  }
  await shot(page, run, "Membrane Map", "chain-answer");
  const after = await boxOf(page, card(a));
  const picture = await readPicture(page, MEMBRANE_MAP, names);
  const hops = scoreHops(graph, chain, picture);
  const namesLegible = await legibleNames(page, MEMBRANE_MAP, chain);
  const historyEntry = (await backEnabled(page)) && !backBefore;
  // The return move: the header's back control, or its keyboard twin when the layout has carried the header off screen.
  let returnMove = "the pin-active header's back control";
  try {
    await page.click(".pin-active-header__back", { timeout: 3_000 });
  } catch {
    await page.keyboard.press("Escape");
    returnMove = "Escape, because the header's back control sat outside the viewport";
  }
  await page.waitForTimeout(1300);
  const returned = await boxOf(page, card(a));
  await shot(page, run, "Membrane Map", "chain-return");
  notes.push("pin all on each file of the chain in turn, each pin bringing the next file's card into the picture", `return move: ${returnMove}, not counted among the gestures`);
  return {
    question: `how does ${nameOf(a)} reach ${nameOf(chain[chain.length - 1])}`,
    path: chain,
    gestures: moves.gestures,
    smallestTargetPx: moves.smallest,
    subjectMovedPx: centerDistance(start, after),
    hops: hops.hops,
    hopsLegible: hops.legible,
    namesLegible,
    historyEntry,
    returnErrorPx: centerDistance(start, returned),
    notes
  };
}

for (const run of RUNS) {
  test.describe(`still pictures of the ${run.bundle}, ${run.scopeName}`, () => {
    test.use({ viewport: { width: 1600, height: 1000 } });
    // One test takes every measure of one view: a tour, six pans and a journey, so it needs more than the suite's half minute.
    test.describe.configure({ timeout: 180_000 });

    test("Local Map", async ({ page }) => {
      const graph = await loadGraph(page, run.base);
      const facts = factsInScope(graph, run.scope);
      const names = displayNames(graph, graph.nodes.map(node => node.id));

      await page.goto(localMapUrl(run.base, run.subject));
      await settleLocalMap(page, run.subject);
      await shot(page, run, "Local Map", "state");
      const still = await stillMeasures(page, LOCAL_MAP, graph, facts, names);
      const tour = await runTour(page, LOCAL_MAP, facts, names);
      const routes = await scoreRoutes(page, LOCAL_MAP);
      let journey: Journey | null = null;
      let churn: ChurnScore | null = null;
      let chain: ChainJourney | null = null;
      if (run.journey) ({ journey, churn } = await localMapJourney(page, run, graph));
      if (run.chain) {
        const walked = await localMapChainJourney(page, run, graph, facts, names);
        chain = walked.journey;
        recordBoard(walked.pathRow);
      }

      recordBoard({
        measuredAt: new Date().toISOString(),
        bundle: run.bundle,
        scopeName: run.scopeName,
        view: "Local Map",
        state: `${nameOf(run.subject)} selected`,
        scope: { files: run.scope.length, facts: facts.length },
        ...still,
        routes,
        journey,
        churn,
        tour,
        chain,
        notes: ["the unpinned starting picture shows the selected file's neighborhood; independent branches have a separate journey regression"]
      });

      expect(still.text!.collisions, still.text!.faults).toBe(0);
      expect(still.text!.cutOffs, still.text!.faults).toBe(0);
      expect(routes.changed, routes.examples.join("\n")).toBe(0);
      expect(still.occlusion!.occludedWires, "the Local Map keeps its wires in the gutters between columns").toBe(0);
    });

    test("Membrane Map", async ({ page }) => {
      const graph = await loadGraph(page, run.base);
      const facts = factsInScope(graph, run.scope);
      const names = displayNames(graph, graph.nodes.map(node => node.id));

      await page.goto(membranePinAllUrl(graph, run.base, run.scope));
      await settleMembranePins(page);
      await shot(page, run, "Membrane Map", "state");
      const still = await stillMeasures(page, MEMBRANE_MAP, graph, facts, names);
      const tour = await runTour(page, MEMBRANE_MAP, facts, names);
      const routes = await scoreRoutes(page, MEMBRANE_MAP);
      let journey: Journey | null = null;
      let churn: ChurnScore | null = null;
      let chain: ChainJourney | null = null;
      if (run.journey) ({ journey, churn } = await membraneJourney(page, run, graph));
      if (run.chain) chain = await membraneChainJourney(page, run, graph, names);

      recordBoard({
        measuredAt: new Date().toISOString(),
        bundle: run.bundle,
        scopeName: run.scopeName,
        view: "Membrane Map",
        state: `all symbols of ${run.scope.length} files pinned, default camera`,
        scope: { files: run.scope.length, facts: facts.length },
        ...still,
        routes,
        journey,
        churn,
        tour,
        chain,
        notes: ["occlusion is reported, not asserted"]
      });

      expect(still.text!.collisions, still.text!.faults).toBe(0);
      expect(still.text!.cutOffs, still.text!.faults).toBe(0);
      expect(routes.changed, routes.examples.join("\n")).toBe(0);
    });

    test("Force Graph", async ({ page }) => {
      const graph = await loadGraph(page, run.base);
      const facts = factsInScope(graph, run.scope);

      await page.goto(forceGraphUrl(run.base, run.subject));
      await page.waitForSelector("#graph-svg canvas", { timeout: 20_000 });
      await page.waitForTimeout(1500);
      await shot(page, run, "Force Graph", "state");
      const text = await scoreText(page, FORCE_GRAPH);
      const drawn = await page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>("#graph-svg canvas");
        return canvas ? { width: canvas.width, height: canvas.height } : null;
      });

      recordBoard({
        measuredAt: new Date().toISOString(),
        bundle: run.bundle,
        scopeName: run.scopeName,
        view: "Force Graph",
        state: `${nameOf(run.subject)} in the address`,
        scope: { files: run.scope.length, facts: facts.length },
        legibility: { facts: facts.length, legible: 0, inFrame: 0, drawn: 0, notDrawn: facts.length, offFrame: 0, covered: 0, small: 0 },
        picture: null,
        occlusion: null,
        text,
        routes: null,
        journey: null,
        expanded: null,
        hiddenAmongDrawn: null,
        churn: null,
        tour: null,
        chain: null,
        notes: [
          "played by the view's rules, not by pixels: names appear on hover only and no symbol is drawn, so no fact is legible in a still picture",
          "the lines live in WebGL with no DOM to read; occlusion, routes and the expanded measures are not measurable here",
          "the journey is not scriptable: the view offers no way to locate a file, the standing defect the owner confirmed",
          drawn ? `canvas ${drawn.width} by ${drawn.height}` : "no canvas"
        ]
      });

      expect(drawn, "the Force Graph drew a canvas").not.toBeNull();
    });
  });
}
