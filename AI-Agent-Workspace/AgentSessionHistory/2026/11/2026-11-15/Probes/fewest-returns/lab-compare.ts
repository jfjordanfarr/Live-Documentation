// The layout lab's signals before and after the ranking's change, on the deck's standing scopes and on every file opened
// alone whose ranking changed: each scope captured once from the built page, laid out by the lab with the old ranking
// and the new, and each layout's drift from the page reported, so that the run on either build shows the lab agreeing
// with the page it was captured from.
import { chromium } from "@playwright/test";
import fs from "node:fs";

import { evaluate as evaluateBefore } from "./evaluate-base";
import { captureFromPage } from "../../../../scripts/layout-lab/capture";
import { baselineConfig, driftOf, evaluate as evaluateAfter } from "../../../../scripts/layout-lab/evaluate";
import { loadBundleGraph, ORIGIN, serveBundle, type ScopeRun } from "../../../../scripts/layout-lab/scopes";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../../../packages/explorer/src/client/persistence/local-storage";
import { DECK_SCOPES } from "../../../../tests/e2e/scopes";
import { localRetainUrl } from "../../../../tests/e2e/still-picture";

const [changedPath, label] = process.argv.slice(2);
const changed = fs.readFileSync(changedPath, "utf8").split("\n").flatMap(line => {
  const match = /\s(\S+)$/u.exec(line.trim());
  return match && line.includes("->") && !match[1].endsWith("/") ? [match[1]] : [];
});
const runs: ScopeRun[] = [...DECK_SCOPES, ...changed.map(file => ({ bundle: "repository" as const, base: "/", scopeName: file, scope: [file], subject: file }))];

const lines: string[] = ["| scope | backward refs | wires | length px | crossings | columns | width | height | placement | drift |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"];
async function main(): Promise<void> {
const browser = await chromium.launch();
try {
  for (const run of runs) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    try {
      await serveBundle(page);
      await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } }) });
      await page.goto(`${ORIGIN}${localRetainUrl(run.base, run.scope)}`);
      const capture = await captureFromPage(page, run);
      const graph = await loadBundleGraph(run);
      const b = evaluateBefore(capture, graph, run, baselineConfig()), a = evaluateAfter(capture, graph, run, baselineConfig());
      const refs = (evaluation: typeof a): number => evaluation.branches.subgraph.links.filter(edge => evaluation.branches.back.has(JSON.stringify([edge.sourceId, edge.targetId, edge.sourceSymbol, edge.targetSymbol, edge.kind]))).reduce((sum, edge) => sum + (edge.gathered ?? 1), 0);
      const pair = (x: number | string, y: number | string): string => (x === y ? `${x}` : `${x} → ${y}`);
      const drift = `before ${driftOf(capture, b).length}, after ${driftOf(capture, a).length}${capture.warnings.length ? `, ${capture.warnings.length} warnings` : ""}`;
      lines.push(`| ${run.bundle}/${run.scopeName} | ${pair(refs(b), refs(a))} | ${pair(b.signals.wires, a.signals.wires)} | ${pair(b.signals.lengthPx, a.signals.lengthPx)} | ${pair(b.signals.crossings.points, a.signals.crossings.points)} | ${pair(b.signals.columns, a.signals.columns)} | ${pair(b.signals.pictureWidth, a.signals.pictureWidth)} | ${pair(b.signals.pictureHeight, a.signals.pictureHeight)} | ${pair(b.signals.placementCost, a.signals.placementCost)} | ${drift} |`);
      console.log(lines[lines.length - 1]);
    } catch (error) {
      lines.push(`| ${run.bundle}/${run.scopeName} | error: ${String(error).slice(0, 120)} |`);
      console.log(lines[lines.length - 1]);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
fs.writeFileSync(`lab-${label}.md`, lines.join("\n") + "\n");
}
void main();
