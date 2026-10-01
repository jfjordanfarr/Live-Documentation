import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import {
  LOCAL_MAP,
  MEMBRANE_MAP,
  backEnabled,
  boxOf,
  centerDistance,
  consumersOf,
  displayNames,
  factsInScope,
  forceGraphUrl,
  gesture,
  legibleNames,
  loadGraph,
  localMapUrl,
  membraneBrowseUrl,
  membranePinAllUrl,
  readPicture,
  scoreboardTable,
  scoreLegibility,
  scoreOcclusion,
  scoreRoutes,
  scoreText,
  type Journey,
  type Scoreboard,
  type ViewReading
} from "./still-picture";
import type { ExplorerGraphPayload } from "../../packages/explorer/src/shared/types";

/**
 * The still-picture deck, played over the shipped bundles.
 *
 * Each test puts one view in the state the deck names, at the deck's frame,
 * and takes the six measures. The numbers go to `reports/still-picture/` as a
 * table and as JSON, to be read against the predictions in
 * `AI-Agent-Workspace/Probes/2026-10-01/still-picture-deck.md`. The
 * assertions are only the rules the workspace already holds: no label
 * collisions, no cut-off text, no wire that changes shape under a pan, and
 * the Local Map's wires in their gutters. Everything else is reported.
 */

interface Run {
  bundle: string;
  base: string;
  /** The files whose references among themselves are the facts in scope. */
  scope: string[];
  /** The file the Local Map and the Force Graph open on. */
  subject: string;
  /** The question the journey answers: which files use `symbol` of `file`. */
  journey: { file: string; symbol: string };
}

const RUNS: Run[] = [
  {
    bundle: "repository",
    base: "/",
    scope: [
      "packages/engine/src/live-docs/graph.ts",
      "packages/engine/src/live-docs/document.ts",
      "packages/engine/src/live-docs/graphFiles.ts",
      "packages/explorer/src/shared/staticExplorerData.ts",
      "packages/explorer/src/shared/staticBuilder.ts"
    ],
    subject: "packages/engine/src/live-docs/graph.ts",
    journey: { file: "packages/engine/src/live-docs/graph.ts", symbol: "GraphFile" }
  },
  {
    bundle: "estate",
    base: "/samples/estate/",
    scope: [
      "Contracts/IPaymentService.cs",
      "PaymentService/PaymentService.cs",
      "Gateway/Wcf/HubProxy.cs",
      "Hub/PaymentHub.cs",
      "Portal/Services/GatewayClient.cs"
    ],
    subject: "PaymentService/PaymentService.cs",
    journey: { file: "Contracts/IPaymentService.cs", symbol: "IPaymentService" }
  }
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

/**
 * Writes one view's row into the scoreboard on disk, merged by bundle and view, and regenerates the table. Each test
 * writes its own row because a failed test ends its worker, and with it any rows held in memory.
 */
function recordBoard(board: Scoreboard): void {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const jsonFile = path.join(REPORT_DIR, "scoreboard.json");
  const kept: Scoreboard[] = fs.existsSync(jsonFile) ? (JSON.parse(fs.readFileSync(jsonFile, "utf8")) as Scoreboard[]) : [];
  const boards = [...kept.filter(row => !(row.bundle === board.bundle && row.view === board.view)), board];
  const order = (row: Scoreboard): number => RUNS.findIndex(run => run.bundle === row.bundle) * 10 + ["Local Map", "Membrane Map", "Force Graph"].indexOf(row.view);
  boards.sort((a, b) => order(a) - order(b));
  fs.writeFileSync(jsonFile, JSON.stringify(boards, null, 2), "utf8");
  const sections = [...new Set(boards.map(row => row.bundle))].map(bundle => {
    const rows = boards.filter(row => row.bundle === bundle);
    const notes = rows.flatMap(row => [
      `- ${row.view}: measured ${row.measuredAt}`,
      ...row.notes.map(note => `- ${row.view}: ${note}`),
      ...(row.journey ? [`- ${row.view} journey, ${row.journey.question}: answer ${row.journey.answer.join(", ") || "(none)"}; ${row.journey.notes.join("; ")}`] : []),
      ...(row.text.collisions + row.text.cutOffs > 0 ? [`- ${row.view} text faults:\n\n\`\`\`text\n${row.text.faults}\n\`\`\``] : [])
    ]);
    return `## ${bundle}\n\n${scoreboardTable(rows)}\n\n${notes.join("\n")}\n`;
  });
  const header = "# Still-picture scoreboard\n\nAt 1600 by 1000 CSS pixels; each row says when it was measured. The deck that defines each column is `AI-Agent-Workspace/Probes/2026-10-01/still-picture-deck.md`.\n\n";
  fs.writeFileSync(path.join(REPORT_DIR, "scoreboard.md"), header + sections.join("\n"), "utf8");
}

/** A picture of the page as it is now, beside the scoreboard, named by bundle, view and moment. */
const shot = async (page: Page, run: Run, view: string, moment: string): Promise<void> => {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(REPORT_DIR, `${run.bundle}-${view.toLowerCase().replace(/ /gu, "-")}-${moment}.png`) });
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

/** Click the subject's symbol row, read which consumers light up, then unpin. */
async function localMapJourney(page: Page, run: Run, graph: ExplorerGraphPayload): Promise<Journey> {
  const { file, symbol } = run.journey;
  const answer = consumersOf(graph, file, symbol);
  await page.goto(localMapUrl(run.base, file));
  await settleLocalMap(page, file);
  const subject = `#map-container .local-column.center .node-card[data-id="${file}"]`;
  // A symbol row is `display: contents`, so the label is the thing a pointer can hit; its click reaches the row.
  const row = `${subject} .symbol-row[data-symbol="${symbol}"] .symbol-label`;
  const start = await boxOf(page, subject);
  const backBefore = await backEnabled(page);
  await shot(page, run, "Local Map", "journey-start");
  const move = await gesture(page, LOCAL_MAP, row);
  await page.waitForTimeout(600);
  const after = await boxOf(page, subject);
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
    question: `which files use ${symbol} of ${file}`,
    answer,
    gestures: move.gestures,
    smallestTargetPx: move.targetPx,
    subjectMovedPx: centerDistance(start, after),
    answerLegible,
    historyEntry,
    returnErrorPx: centerDistance(start, returned),
    notes: [`${highlighted} of ${answer.length} answer cards highlighted by the pin`, "return move: the same row clicked again"]
  };
}

/** From the folder view, open the subject's card if it is closed, pin the symbol, read the consumers, then unpin. */
async function membraneJourney(page: Page, run: Run, graph: ExplorerGraphPayload): Promise<Journey> {
  const { file, symbol } = run.journey;
  const answer = consumersOf(graph, file, symbol);
  await page.goto(membraneBrowseUrl(run.base, file));
  await settleMembraneBrowse(page, file);
  const card = `#membrane-container .membrane-card[data-id="${file}"]`;
  const label = `${card} .membrane-card__symbol-row[data-symbol="${symbol}"] .membrane-card__symbol-label`;
  const notes: string[] = [];
  let gestures = 0;
  let smallest: number | null = null;
  const take = (move: { gestures: number; targetPx: number }): void => {
    gestures += move.gestures;
    smallest = smallest === null ? move.targetPx : Math.min(smallest, move.targetPx);
  };
  const backBefore = await backEnabled(page);
  await shot(page, run, "Membrane Map", "journey-start");
  if ((await page.locator(`${card}.membrane-card--collapsed`).count()) > 0) {
    take(await gesture(page, MEMBRANE_MAP, card));
    await page.waitForTimeout(900);
    notes.push("the card opened first: a closed card shows no symbol rows");
  }
  const start = await boxOf(page, card);
  take(await gesture(page, MEMBRANE_MAP, label));
  await settleMembranePins(page);
  const after = await boxOf(page, card);
  await shot(page, run, "Membrane Map", "journey-answer");
  const answerLegible = await legibleNames(page, MEMBRANE_MAP, answer);
  const historyEntry = (await backEnabled(page)) && !backBefore;
  await gesture(page, MEMBRANE_MAP, label);
  await page.waitForTimeout(1300);
  const returned = await boxOf(page, card);
  await shot(page, run, "Membrane Map", "journey-return");
  notes.push("return move: the same symbol label clicked again, which empties the pins and returns to the folder");
  return {
    question: `which files use ${symbol} of ${file}`,
    answer,
    gestures,
    smallestTargetPx: smallest,
    subjectMovedPx: centerDistance(start, after),
    answerLegible,
    historyEntry,
    returnErrorPx: centerDistance(start, returned),
    notes
  };
}

for (const run of RUNS) {
  test.describe(`still pictures of the ${run.bundle}`, () => {
    test.use({ viewport: { width: 1600, height: 1000 } });

    test("Local Map", async ({ page }) => {
      const graph = await loadGraph(page, run.base);
      const facts = factsInScope(graph, run.scope);
      const names = displayNames(graph, graph.nodes.map(node => node.id));

      await page.goto(localMapUrl(run.base, run.subject));
      await settleLocalMap(page, run.subject);
      await shot(page, run, "Local Map", "state");
      const picture = await readPicture(page, LOCAL_MAP, names);
      const legibility = scoreLegibility(facts, picture);
      const occlusion = scoreOcclusion(picture);
      const text = await scoreText(page, LOCAL_MAP);
      const routes = await scoreRoutes(page, LOCAL_MAP);
      const journey = await localMapJourney(page, run, graph);

      recordBoard({
        measuredAt: new Date().toISOString(),
        bundle: run.bundle,
        view: "Local Map",
        state: `${run.subject.split("/").pop()} selected`,
        scope: { files: run.scope.length, facts: facts.length },
        legibility,
        picture: { scale: picture.scale, smallestLabelPx: picture.smallestLabelPx, cardsTotal: picture.cardsTotal, cardsInFrame: picture.cardsInFrame, cardsPartlyInFrame: picture.cardsPartlyInFrame, wires: picture.wires.length },
        occlusion,
        text,
        routes,
        journey,
        notes: ["facts drawn are those touching the selected file; the view has no state for a set of files"]
      });

      expect(text.collisions, text.faults).toBe(0);
      expect(text.cutOffs, text.faults).toBe(0);
      expect(routes.changed, routes.examples.join("\n")).toBe(0);
      expect(occlusion.occludedWires, "the Local Map keeps its wires in the gutters between columns").toBe(0);
    });

    test("Membrane Map", async ({ page }) => {
      const graph = await loadGraph(page, run.base);
      const facts = factsInScope(graph, run.scope);
      const names = displayNames(graph, graph.nodes.map(node => node.id));

      await page.goto(membranePinAllUrl(graph, run.base, run.scope));
      await settleMembranePins(page);
      await shot(page, run, "Membrane Map", "state");
      const picture = await readPicture(page, MEMBRANE_MAP, names);
      const legibility = scoreLegibility(facts, picture);
      const occlusion = scoreOcclusion(picture);
      const text = await scoreText(page, MEMBRANE_MAP);
      const routes = await scoreRoutes(page, MEMBRANE_MAP);
      const journey = await membraneJourney(page, run, graph);

      recordBoard({
        measuredAt: new Date().toISOString(),
        bundle: run.bundle,
        view: "Membrane Map",
        state: `all symbols of ${run.scope.length} files pinned, default camera`,
        scope: { files: run.scope.length, facts: facts.length },
        legibility,
        picture: { scale: picture.scale, smallestLabelPx: picture.smallestLabelPx, cardsTotal: picture.cardsTotal, cardsInFrame: picture.cardsInFrame, cardsPartlyInFrame: picture.cardsPartlyInFrame, wires: picture.wires.length },
        occlusion,
        text,
        routes,
        journey,
        notes: ["occlusion is reported, not asserted, until the owner reads the first scoreboard"]
      });

      expect(text.collisions, text.faults).toBe(0);
      expect(text.cutOffs, text.faults).toBe(0);
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
        view: "Force Graph",
        state: `${run.subject.split("/").pop()} in the address`,
        scope: { files: run.scope.length, facts: facts.length },
        legibility: { facts: facts.length, legible: 0, inFrame: 0, drawn: 0, notDrawn: facts.length, offFrame: 0, covered: 0, small: 0 },
        picture: null,
        occlusion: null,
        text,
        routes: null,
        journey: null,
        notes: [
          "played by the view's rules, not by pixels: names appear on hover only and no symbol is drawn, so no fact is legible in a still picture",
          "the lines live in WebGL with no DOM to read; occlusion and routes are not measurable here",
          "the journey is not scriptable: the view offers no way to locate a file, the standing defect the owner confirmed",
          drawn ? `canvas ${drawn.width} by ${drawn.height}` : "no canvas"
        ]
      });

      expect(drawn, "the Force Graph drew a canvas").not.toBeNull();
    });
  });
}
