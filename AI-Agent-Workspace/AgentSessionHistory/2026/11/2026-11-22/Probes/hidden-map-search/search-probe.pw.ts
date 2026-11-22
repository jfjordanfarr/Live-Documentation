import { test, type Page } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";

import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { localRetainUrl } from "./still-picture";

// A temporary probe (2026-11-22): the hidden-map case's search, read second by second. Not a test.
const FILES = process.env.PROBE_FILES ? process.env.PROBE_FILES.split(",") : [
  "packages/engine/src/live-docs/graph.ts",
  "packages/engine/src/live-docs/document.ts",
  "packages/engine/src/live-docs/graphFiles.ts",
  "packages/explorer/src/shared/staticExplorerData.ts",
  "packages/explorer/src/shared/staticBuilder.ts"
];
const BASE = process.env.PROBE_BASE ?? "/";
const STARTS = Number(process.env.PROBE_STARTS ?? 80);
test.use({ viewport: { width: 1600, height: 1000 } });

const OUT = process.env.PROBE_OUT ?? "/tmp/probe.json";
const SWITCH = process.env.PROBE_SWITCH !== "0";
const ARRIVAL = process.env.PROBE_ARRIVAL ?? "reading";

const sample = (page: Page) => page.evaluate(() => {
  const map = document.querySelector<HTMLElement>("#map-container")!;
  const root = map.querySelector<HTMLElement>(".local-placed");
  const d = root?.dataset ?? {} as DOMStringMap;
  return {
    t: Math.round(performance.now()),
    camera: map.dataset.camera ?? "", arrival: map.dataset.arrival ?? "", moving: d.moving ?? "", status: d.searchStatus ?? "",
    tried: Number(d.searchTried || 0), alignmentTried: Number(d.searchAlignmentTried || 0), cycleTried: Number(d.searchCycleTried || 0),
    next: Number(d.searchNext || 0), adopted: Number(d.searchAdopted || 0), alignmentAdopted: Number(d.searchAlignmentAdopted || 0),
    cards: map.querySelectorAll(".node-card").length, wires: document.querySelectorAll("#map-connections .connection-path").length,
    shown: !!document.querySelector("#view-map.active"), transform: (document.querySelector<HTMLElement>("#map-viewport")?.style.transform ?? "")
  };
});

const ALL_CS = "Contracts/IPaymentHub.cs,Contracts/IPaymentService.cs,Contracts/PaymentQuery.cs,Contracts/PaymentRequest.cs,Contracts/PaymentResult.cs,Gateway/Controllers/PaymentsController.cs,Gateway/GatewaySettings.cs,Gateway/Wcf/HubProxy.cs,Hub/PaymentHub.cs,Hub/ServiceRouting.cs,PaymentService/Data/Payment.cs,PaymentService/Data/PaymentsContext.cs,PaymentService/Data/PostPaymentRow.cs,PaymentService/PaymentService.cs,Portal/App_Code/Globals.cs,Portal/Controllers/PaymentsController.cs,Portal/Models/PaymentRequestModel.cs,Portal/Models/PaymentResultModel.cs,Portal/Pages/Default.aspx.cs,Portal/Services/GatewayClient.cs".split(",");
const RUNS = BASE.includes("estate")
  ? [{ name: "8-80", files: FILES, starts: 80 }, { name: "8-300", files: FILES, starts: 300 }, { name: "all-80", files: ALL_CS, starts: 80 }, { name: "all-300", files: ALL_CS, starts: 300 }]
  : [{ name: "", files: FILES, starts: STARTS }];
for (const run of RUNS) test(`probe ${run.name}`, async ({ page }) => {
  test.setTimeout(240_000);
  const tuning: Record<string, unknown> = { orderStarts: 0, searchStarts: run.starts, searchPatience: run.starts, moveMs: 0 };
  if (ARRIVAL !== "default") tuning.arrival = ARRIVAL;
  if (process.env.PROBE_WIRE) tuning.wireAnswers = process.env.PROBE_WIRE;
  await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: tuning } }) });
  // Long tasks, for the time each idle step costs.
  await page.addInitScript(() => {
    (window as unknown as { __long: number[] }).__long = [];
    new PerformanceObserver(list => { for (const e of list.getEntries()) (window as unknown as { __long: number[] }).__long.push(Math.round(e.duration)); }).observe({ type: "longtask", buffered: true });
  });
  if (process.env.PROBE_DATA) {
    const body = readFileSync(process.env.PROBE_DATA);
    await page.route("**/explorer-data.json", route => route.fulfill({ status: 200, contentType: "application/json", body }));
  }
  const t0 = Date.now();
  await page.goto(localRetainUrl(BASE, run.files));
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 15_000 });
  const rows: Array<Record<string, unknown>> = [];
  const push = async (phase: string) => rows.push({ phase, wall: Date.now() - t0, ...(await sample(page)) });
  await push("drawn");
  if (SWITCH) {
    await page.click('.nav-item[data-view="sources"]');
    await push("away");
    await page.waitForTimeout(800);
    await push("later");
    await page.click('.nav-item[data-view="map"]');
    await push("back");
  }
  let lastTried = -1, still = 0;
  for (let i = 0; i < 200; i++) {
    await page.waitForTimeout(BASE.includes("estate") ? 250 : 1000);
    await push("after");
    const last = rows[rows.length - 1] as { status: string; tried: number; alignmentTried: number; cycleTried: number; camera: string; moving: string };
    const sum = last.tried + last.alignmentTried + last.cycleTried;
    if (last.status !== "running" && last.camera !== "moving" && last.moving !== "true") { still++; if (still >= 3) break; } else still = 0;
    if (sum === lastTried && last.status === "running") { /* stalled? keep sampling */ }
    lastTried = sum;
  }
  const long = await page.evaluate(() => (window as unknown as { __long: number[] }).__long);
  writeFileSync(run.name ? OUT.replace(".json", `-${run.name}.json`) : OUT, JSON.stringify({ rows, long }, null, 1));
});
