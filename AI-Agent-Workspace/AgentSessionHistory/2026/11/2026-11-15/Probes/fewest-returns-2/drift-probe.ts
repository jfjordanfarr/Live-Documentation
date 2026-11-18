// Why the lab gives core.ts a returning-connections line the page does not draw, in powershell.ts's picture: the
// returning references at core.ts with their rows, beside what the page shows of those rows.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import { edgeKey, exploreBranches } from "../../../../packages/explorer/src/client/views/localView/branches";
import { addPin, EMPTY_PIN_SET } from "../../../../packages/explorer/src/client/views/pin-state";
import { explorerGraphOf } from "../../../../packages/explorer/src/shared/graph";
import { localRetainUrl } from "../../../../tests/e2e/still-picture";
import { localMapSettled } from "../../../../tests/e2e/still-picture";

const [dist, subject, card] = process.argv.slice(2);
const graph: any = explorerGraphOf(JSON.parse(fs.readFileSync(path.join(dist, "explorer-data.json"), "utf8")).graph);
const byId = new Map(graph.nodes.map((n: any) => [n.id, n]));
const pins = addPin(EMPTY_PIN_SET, subject, "*");
const exploration = exploreBranches(byId.get(subject) as any, graph, pins, () => true, { ranking: { returnCost: 1000 } });
const atCard = exploration.subgraph.links.filter(e => exploration.ranking.back.has(edgeKey(e)) && (e.sourceId === card || e.targetId === card));
console.log("returns at the card by the lab's ranking:");
for (const e of atCard) console.log(`  ${e.sourceId.split("/").pop()}#${e.sourceSymbol} uses ${e.targetId.split("/").pop()}#${e.targetSymbol}`);
console.log("relevant rows:", JSON.stringify([...(exploration.relevantSymbols.get(card) ?? [])]));
for (const e of atCard) {
  const other = e.sourceId === card ? e.targetId : e.sourceId;
  console.log(`relevant rows of ${other.split("/").pop()}:`, JSON.stringify([...(exploration.relevantSymbols.get(other) ?? [])]));
}

const ORIGIN = "http://lab.local";
const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
async function main(): Promise<void> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    await page.route(`${ORIGIN}/**`, async route => {
      let file = path.join(dist, decodeURIComponent(new URL(route.request().url()).pathname));
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
      if (!fs.existsSync(file)) { await route.fulfill({ status: 404, body: "" }); return; }
      await route.fulfill({ body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] ?? "application/octet-stream" });
    });
    await page.goto(`${ORIGIN}${localRetainUrl("/", [subject])}`);
    await page.waitForSelector("#map-container .local-placed", { timeout: 60_000 });
    await localMapSettled(page);
    const read = await page.evaluate(ids => ids.map(id => {
      const element = document.querySelector<HTMLElement>(`#map-container .node-card[data-id="${CSS.escape(id)}"]`);
      return { id, rows: [...(element?.querySelectorAll<HTMLElement>(".symbol-row") ?? [])].map(row => `${row.dataset.symbol}${row.classList.contains("branch-symbol-hidden") ? " (hidden)" : ""}`),
        note: element?.querySelector(".local-back-references")?.textContent ?? null };
    }), [card, ...new Set(atCard.map(e => (e.sourceId === card ? e.targetId : e.sourceId)))]);
    for (const r of read) console.log(JSON.stringify(r));
  } finally {
    await browser.close();
  }
}
void main();
