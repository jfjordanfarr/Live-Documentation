import { expect, test, type Page } from "@playwright/test";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import type { InspectionTarget } from "../../packages/explorer/src/client/types";

/**
 * The Explorer reads only its own site: "Tests proving that Live Documentation cannot and will not ever access the
 * internet." (the owner, 2025-12-14). Every request a page makes is watched, and one to any other site fails the test
 * and is aborted; so is any refusal by the page's Content-Security-Policy, since a page that tries is a defect even
 * when the policy stops it. The journeys walk each sample bundle's views, read docs that carry raw HTML, outside images
 * and links, and point the page's data and history elsewhere; one test shows the policy itself refusing what code in
 * the page might attempt. A link to another site is followed only when a person clicks it, which these tests never do.
 */

test.use({ viewport: { width: 1400, height: 900 } });

/** What a page asked of other sites, what of it reached the network, and what its policy refused. */
interface Watch {
  /** Every request to another site the page made, including one its policy stopped in the browser. */
  asked: string[];
  /** The requests that passed the browser's own checks and would have gone out; each is aborted here. */
  reached: string[];
  refusals(): Promise<string[]>;
}

/** Watches the page from before its first script: requests to other sites, and the policy's refusals. */
async function watch(page: Page): Promise<Watch> {
  const baseURL = test.info().project.use.baseURL;
  if (!baseURL) throw new Error("The network audit requires a configured baseURL.");
  const site = new URL(baseURL).origin;
  const asked: string[] = [];
  const reached: string[] = [];
  const elsewhere = (url: URL): boolean => url.protocol !== "data:" && url.protocol !== "blob:" && url.origin !== site;
  page.on("request", request => {
    if (elsewhere(new URL(request.url()))) asked.push(request.url());
  });
  await page.route(elsewhere, route => {
    reached.push(route.request().url());
    return route.abort("blockedbyclient");
  });
  await page.addInitScript(() => {
    const refusals: string[] = [];
    (window as unknown as { __refusals: string[] }).__refusals = refusals;
    document.addEventListener("securitypolicyviolation", event => {
      refusals.push(`${event.effectiveDirective} ${event.blockedURI}`);
    }, true);
  });
  return {
    asked,
    reached,
    refusals: () => page.evaluate(() => [...(window as unknown as { __refusals: string[] }).__refusals])
  };
}

/** The page asked nothing of another site, so neither the policy nor the network had anything to stop. */
async function expectNothingAsked(watched: Watch): Promise<void> {
  expect(watched.asked, "requests to another site").toEqual([]);
  expect(watched.reached, "requests that reached the network").toEqual([]);
  expect(await watched.refusals(), "the policy's refusals").toEqual([]);
}

async function started(page: Page): Promise<void> {
  await expect(page.locator("#stats-line")).not.toHaveText("Loading...");
  await expect(page.locator("#stats-line")).not.toHaveText(/^Error/u);
}

async function settled3d(page: Page): Promise<void> {
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 90_000 });
}

const address = (base: string, snapshot: Partial<typeof DEFAULT_SNAPSHOT>): string =>
  `${base}?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, ...snapshot })}`;

const reading = (base: string, inspection: InspectionTarget, selectedNodeId: string | null = null): string =>
  address(base, { view: "map", selectedNodeId, inspection });

/** Walks a bundle's views: Knowledge Sources, the World Map where it has a board, the Local Map in 2D and 3D, and a bundled doc in the reader. */
async function walk(page: Page, base: string, landing: string): Promise<void> {
  await page.goto(base);
  await started(page);
  await page.locator('.nav-item[data-view="sources"]').click();
  await expect(page.locator("#view-sources")).toBeVisible();
  const data = await (await page.request.get(`${base}explorer-data.json`)).json() as { board?: unknown; bundledMarkdown?: Record<string, string> };
  if (data.board) {
    await page.locator('.nav-item[data-view="world"]').click();
    await expect(page.locator("#world-root .world")).toBeVisible();
  }
  await page.goto(address(base, { view: "map", selectedNodeId: landing }));
  await started(page);
  await expect(page.locator(`#map-container .node-card[data-id="${landing}"]`)).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await settled3d(page);
  const doc = Object.keys(data.bundledMarkdown ?? {})[0];
  if (doc) {
    await page.goto(reading(base, { kind: "bundled-doc", path: doc }));
    await expect(page.locator("#detail-panel.visible #detail-title")).toContainText(doc.slice(doc.lastIndexOf("/") + 1));
  }
}

test("this repository's bundle asks nothing of another site in any view", async ({ page }) => {
  test.setTimeout(240_000);
  const watched = await watch(page);
  await walk(page, "/", "packages/explorer/src/client/markdown.ts");
  await expectNothingAsked(watched);
});

test("the estate sample's bundle asks nothing of another site in any view", async ({ page }) => {
  test.setTimeout(120_000);
  const watched = await watch(page);
  await walk(page, "/samples/estate/", "Portal/Services/GatewayClient.cs");
  await expectNothingAsked(watched);
});

test("the history sample's bundle asks nothing of another site, its history open", async ({ page }) => {
  test.setTimeout(120_000);
  const watched = await watch(page);
  await walk(page, "/samples/history/", "src/app/main.ts");
  const history = await (await page.request.get("/samples/history/explorer-history.json")).json() as { steps: Array<{ commit: { id: string; subject: string } }> };
  const step = history.steps[0].commit;
  await page.goto(address("/samples/history/", { view: "map", perspective: "3d", spatialLayout: "structure", selectedNodeId: "src/app/main.ts", commit: step.id }));
  await settled3d(page);
  await expect(page.locator(".history-scrubber")).toBeVisible();
  await expect(page.locator(".history-step-panel h2")).toHaveText(step.subject);
  await expectNothingAsked(watched);
});

/** Raw HTML, an outside image and links, as a doc from an unvetted repository might carry them. */
const HOSTILE = [
  `Raw <img src="https://example.com/raw.png" onerror="window.hostile = 'img'"> and <script>window.hostile = "script"</script>.`,
  `<iframe src="https://example.com/frame"></iframe>`,
  `<link rel="stylesheet" href="https://example.com/style.css"><style>@import url("https://example.com/import.css");</style>`,
  `![An outside image](https://example.com/image.png)`,
  `[An outside page](https://example.com/page), <https://example.com/auto> and [a script](javascript:window.hostile='link')`
].join("\n\n");

/** Serves the history sample with the hostile text in a file's authored section and in a bundled doc. */
async function serveHostile(page: Page, change: (data: Record<string, unknown>) => void = () => undefined): Promise<void> {
  await page.route("**/samples/history/explorer-data.json", async route => {
    const data = await (await route.fetch()).json() as {
      graph: { files: Record<string, { authored: string; archetype: string }> };
      bundledMarkdown: Record<string, string>;
    };
    data.graph.files["src/app/main.ts"].authored += `\n\n${HOSTILE}\n`;
    // An archetype is a doc's free text; a space in it would add the page's own classes to the badge.
    data.graph.files["src/app/main.ts"].archetype = "implementation visible loading-indicator";
    data.bundledMarkdown["docs/design.md"] += `\n\n${HOSTILE}\n`;
    change(data);
    await route.fulfill({ json: data });
  });
}

test("a doc's raw HTML, outside image and links are shown as text and links, and fetch nothing", async ({ page }) => {
  const watched = await watch(page);
  await serveHostile(page);
  const reader = page.locator("#detail-body");
  for (const inspection of [{ kind: "file", nodeId: "src/app/main.ts" }, { kind: "bundled-doc", path: "docs/design.md" }] as const) {
    await page.goto(reading("/samples/history/", inspection, "src/app/main.ts"));
    await started(page);
    await expect(reader).toContainText(`Raw <img src="https://example.com/raw.png" onerror="window.hostile = 'img'"> and <script>`);
    await expect(reader).toContainText(`<iframe src="https://example.com/frame"></iframe>`);
    expect(await reader.locator("img, script, iframe, link, style, object, embed").count()).toBe(0);
    await expect(reader.locator('a[href="https://example.com/image.png"]')).toHaveText("An outside image");
    await expect(reader.locator('a[href="https://example.com/page"]')).toHaveAttribute("rel", /noopener/u);
    await expect(reader.locator('a[href="https://example.com/auto"]')).toHaveText("https://example.com/auto");
    expect(await reader.locator('a[href^="javascript:"]').count()).toBe(0);
    expect(await page.evaluate(() => (window as unknown as { hostile?: string }).hostile)).toBeUndefined();
  }
  await page.goto(reading("/samples/history/", { kind: "file", nodeId: "src/app/main.ts" }, "src/app/main.ts"));
  await expect(page.locator("#detail-body .archetype-badge")).toHaveAttribute("class", "archetype-badge archetype-implementation-visible-loading-indicator");
  await expectNothingAsked(watched);
});

test("a history file's counts reach the step panel as numbers, never as markup", async ({ page }) => {
  const watched = await watch(page);
  const steps = (await (await page.request.get("/samples/history/explorer-history.json")).json() as { steps: Array<{ commit: { id: string }; delta: { resized?: unknown[][] } }> }).steps;
  const resizing = steps.findIndex(step => step.delta.resized?.length);
  await page.route("**/samples/history/explorer-history.json", async route => {
    const history = await (await route.fetch()).json() as { steps: typeof steps };
    history.steps[resizing].delta.resized![0][1] = `<b class="hostile">3</b>`;
    await route.fulfill({ json: history });
  });
  await page.goto(address("/samples/history/", { view: "map", perspective: "3d", spatialLayout: "structure", commit: steps[resizing].commit.id }));
  await settled3d(page);
  await expect(page.locator(".history-step-panel")).toContainText("Resized");
  expect(await page.locator(".history-step-panel .hostile").count()).toBe(0);
  await expectNothingAsked(watched);
});

const REFUSED = /^Error: The Explorer reads only from its own site, and https?:\/\/example\.com is not it\.$/u;

test("an address naming data on another site is refused before anything is asked of it", async ({ page }) => {
  const watched = await watch(page);
  for (const elsewhere of ["https://example.com/explorer-data.json", "//example.com/explorer-data.json"]) {
    await page.goto(`/samples/history/?data=${encodeURIComponent(elsewhere)}`);
    await expect(page.locator("#stats-line")).toHaveText(REFUSED);
  }
  await page.goto(`/samples/history/?data=${encodeURIComponent("/samples/estate/explorer-data.json")}`);
  await started(page);
  await expectNothingAsked(watched);
});

test("a bundle naming a history on another site is refused before anything is asked of it", async ({ page }) => {
  const watched = await watch(page);
  await serveHostile(page, data => { (data.history as { file: string }).file = "https://example.com/explorer-history.json"; });
  const history = await (await page.request.get("/samples/history/explorer-history.json")).json() as { base: { commit: { id: string } } };
  await page.goto(address("/samples/history/", { view: "map", perspective: "3d", selectedNodeId: "src/app/main.ts", commit: history.base.commit.id }));
  await expect(page.locator("#stats-line")).toHaveText(REFUSED);
  await expectNothingAsked(watched);
});

test("the page's policy refuses what code in the page might attempt", async ({ page }) => {
  const watched = await watch(page);
  await page.goto("/samples/history/");
  await started(page);
  await page.evaluate(() => {
    const image = document.createElement("img");
    image.src = "https://example.com/pixel.png";
    document.body.append(image);
    void fetch("https://example.com/data.json").catch(() => undefined);
    document.body.insertAdjacentHTML("beforeend", `<img src="./no-such-image.png" onerror="window.hostile = 'handler'">`);
    const script = document.createElement("script");
    script.textContent = "window.hostile = 'inline'";
    document.body.append(script);
  });
  await expect.poll(watched.refusals).toEqual(expect.arrayContaining([
    "img-src https://example.com/pixel.png",
    "connect-src https://example.com/data.json",
    "script-src-attr inline",
    "script-src-elem inline"
  ]));
  expect(watched.reached, "requests that reached the network").toEqual([]);
  expect(await page.evaluate(() => (window as unknown as { hostile?: string }).hostile)).toBeUndefined();
});
