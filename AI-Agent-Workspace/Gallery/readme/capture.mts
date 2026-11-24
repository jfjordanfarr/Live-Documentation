// Retakes the pictures the repository's README shows: one per language or framework, and the lead picture.
// From the repository root, on a built site (`npm run build`, `npm run e2e:bundles`), through the browser lane:
//   node scripts/browser-lane.mjs --label readme -- npx tsx AI-Agent-Workspace/Gallery/readme/capture.mts [site] [part of a picture's name]
// `site` is the built Explorer's folder (`dist/explorer`, the default) or the address of a preview already serving it
// (`http://127.0.0.1:8999`). Each picture is written beside this file, over the one before it, at 1,019 by 681: the
// map's own frame in a 1,280 by 800 window, without the sidebar, the search bar or the controls under the map. The run
// prints what it drew for each: the subject, the cards and wires on the map, the look, the camera's scale and any error
// the page reported. Look at every picture it takes; the Gallery's README says what each showed when last looked at.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { browserLaunchOptions } from "../../../tests/e2e/browser-launch";
import { arriveAtReadingSize, localMapStill } from "../../../tests/e2e/still-picture";

const here = path.dirname(fileURLToPath(import.meta.url));
const [siteArg = "dist/explorer", only] = process.argv.slice(2);

/** One picture: the Local Map of a file of a served map. `reading` holds the subject at reading size; without it the arrival is the one that ships. */
interface Shot { name: string; site: string; file: string; reading?: boolean }

const rosetta = (language: string): string => `/samples/rosetta/${language}/`;
const ESTATE = "/samples/estate/";
const POWERSHELL = "/samples/powershell/";
const TIDEPOOL = "/samples/tidepool/";

const all: Shot[] = [
  // The lead picture: one card read closely, on a sample's file, which does not change as this repository does.
  { name: "card-at-reading-size", site: rosetta("typescript"), file: "src/processor.ts", reading: true },
  // The Rosetta samples: one program in nine languages, the same file as the subject of each.
  { name: "typescript", site: rosetta("typescript"), file: "src/processor.ts" },
  { name: "csharp", site: rosetta("csharp"), file: "src/Processor/Processor.cs" },
  { name: "python", site: rosetta("python"), file: "src/processor.py" },
  { name: "java", site: rosetta("java"), file: "src/com/rosetta/processor/Processor.java" },
  { name: "go", site: rosetta("go"), file: "src/processor/processor.go" },
  { name: "rust", site: rosetta("rust"), file: "src/processor.rs" },
  // In C and C++ the header is what the other files use, so the header is the subject.
  { name: "c", site: rosetta("c"), file: "src/processor.h" },
  { name: "cpp", site: rosetta("cpp"), file: "src/processor.hpp" },
  { name: "ruby", site: rosetta("ruby"), file: "lib/processor.rb" },
  { name: "json", site: rosetta("c"), file: "compile_commands.json" },
  // The estate sample: a small .NET estate.
  { name: "javascript", site: ESTATE, file: "Portal/Scripts/portal.js" },
  { name: "aspnet-markup", site: ESTATE, file: "Portal/Pages/Default.aspx" },
  { name: "dotnet-configuration", site: ESTATE, file: "Hub/App.config" },
  { name: "sql", site: ESTATE, file: "Database/SqlServer/dbo.usp_PostPayment.sql" },
  { name: "solutions-and-manifests", site: ESTATE, file: "Estate.sln" },
  // Standalone rollout and tidepool samples, so no README row depends on this moving repository.
  { name: "powershell", site: POWERSHELL, file: "Invoke-Rollout.ps1" },
  { name: "html", site: TIDEPOOL, file: "index.html" },
  { name: "css", site: TIDEPOOL, file: "styles/main.css" }
];
const shots = all.filter(shot => !only || shot.name.includes(only));

// The site: a preview already serving it, or the built folder served from here for the length of the run.
let base = siteArg.replace(/\/$/, "");
let server: http.Server | undefined;
if (!/^https?:/.test(siteArg)) {
  const root = path.resolve(siteArg);
  if (!fs.existsSync(path.join(root, "index.html"))) throw new Error(`No built Explorer at ${root}: run npm run build and npm run e2e:bundles first`);
  const types: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".md": "text/markdown" };
  server = http.createServer((request, response) => {
    let file = path.join(root, decodeURIComponent(new URL(request.url ?? "/", "http://x").pathname));
    if (file.startsWith(root) && fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!file.startsWith(root) || !fs.existsSync(file)) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(response);
  });
  await new Promise<void>(resolve => server!.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
}

const browser = await chromium.launch(browserLaunchOptions());
const report: unknown[] = [];
for (const shot of shots) {
  // A fresh visitor each time: nothing remembered, the continuing search as shipped.
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  if (shot.reading) await arriveAtReadingSize(page, true);
  await page.goto(`${base}${shot.site}?view=local&node=${encodeURIComponent(shot.file)}`);
  await page.waitForSelector("#map-container .node-card.local-focus", { timeout: 30_000 });
  if (!shot.reading) {
    // The arrival that ships rests at reading size and then eases back to the neighbours: the map says so until it is
    // over. A picture on a timer catches it mid-ease.
    await page.waitForFunction(() => document.querySelector<HTMLElement>("#map-container")?.dataset.arrival !== undefined, undefined, { timeout: 5_000 }).catch(() => undefined);
    await page.waitForFunction(() => document.querySelector<HTMLElement>("#map-container")?.dataset.arrival === undefined, undefined, { timeout: 20_000 });
  }
  await localMapStill(page);
  await page.waitForTimeout(300);
  await localMapStill(page);
  const seen = await page.evaluate(() => {
    // No named function in here: the transpiler's helper for one does not exist in the page.
    const map = document.querySelector<HTMLElement>("#map-container")!;
    return {
      subject: document.querySelector<HTMLElement>("#map-container .node-card.local-focus")?.dataset.id,
      cards: document.querySelectorAll("#map-container .node-card").length,
      wires: document.querySelectorAll("#map-connections .connection-path").length,
      look: map.dataset.look,
      scale: Number(new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a.toFixed(3))
    };
  });
  await page.locator("#view-map").screenshot({ path: path.join(here, `${shot.name}.png`) });
  report.push({ name: shot.name, ...seen, errors });
  await context.close();
}
await browser.close();
server?.close();
console.log(JSON.stringify(report));
