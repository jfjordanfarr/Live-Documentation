import { test, expect, type Page } from "@playwright/test";

import { describeRetained, retainedItems, retainedKey } from "../../packages/explorer/src/client/views/retained-state";
import { AA_SMALL_TEXT, backdrop, contrastRatio, parseColour } from "./contrast";
import { choose, currentSnapshot, newestKey, pathAddress } from "./search-bar";
import { LOCAL_MAP, boxOf, centerDistance, displayNames, loadGraph, localMapSettled, panIntoView, readPicture, scoreExpanded, symbolCounts } from "./still-picture";

/**
 * The Local Map's path mode draws a path only in the map's reading direction:
 * what offers stands left of what uses it, every wire leaves a blue pin and
 * enters a green one (the owner's rule of 2025-12-18, which still governs the
 * drawing). Until 2026-11-22 a path asked the other way round drew nothing and
 * offered the reverse question as a link; since the owner's word of that day
 * it is answered whichever way it runs, drawn the same and told as asked: the
 * bar keeps the two ends as given and the report names the files from the end
 * asked from, saying of each that it uses the next. A path is
 * asked through the search bar (2026-10-14): the newest pin is where it starts,
 * the destination field, shown once anything is pinned, is where it ends, and
 * clearing the destination returns to the exploration.
 *
 * Over the estate sample, whose chain GatewayClient.cs -> PaymentsController.cs
 * -> HubProxy.cs -> IPaymentHub.cs runs from the file that depends to the
 * file depended on.
 */
const BASE = "/samples/estate/";
const DEPENDENT = "Portal/Services/GatewayClient.cs";
const DEPENDENCY = "Contracts/IPaymentHub.cs";
const FRAME = { width: 1600, height: 1000 };
const ROUTE = ["IPaymentHub.cs", "HubProxy.cs", "PaymentsController.cs", "GatewayClient.cs"];
/** The same route told from the file that depends, as it is when asked from that end: each file uses the next. */
const TOLD = [...ROUTE].reverse();

test.use({ viewport: FRAME });

async function openLocalMap(page: Page, file: string): Promise<void> {
  await page.goto(`${BASE}?view=local&node=${encodeURIComponent(file)}`);
  await page.waitForSelector(`#map-container .node-card[data-id="${file}"]`);
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
  await page.waitForTimeout(600);
}

/** Each wire's two ends in screen coordinates with the pin nearest to each, so the grammar can be read off the picture. */
async function wireEnds(page: Page): Promise<Array<{ startPin: string; endPin: string; startX: number; endX: number }>> {
  return page.evaluate(() => {
    const svg = document.querySelector<SVGSVGElement>("#map-connections svg");
    const ctm = svg?.getScreenCTM();
    const pins = [...document.querySelectorAll<HTMLElement>("#map-container .symbol-anchor")].map(pin => {
      const box = pin.getBoundingClientRect();
      return { cls: pin.className, x: box.left + box.width / 2, y: box.top + box.height / 2 };
    });
    const nearest = (x: number, y: number): string => {
      let best = { cls: "none", d: Infinity };
      for (const pin of pins) {
        const d = Math.hypot(pin.x - x, pin.y - y);
        if (d < best.d) best = { cls: pin.cls, d };
      }
      return best.d <= 12 ? best.cls : `none within 12 px (${Math.round(best.d)})`;
    };
    return [...document.querySelectorAll<SVGPathElement>("#map-connections path.connection-path")].map(path => {
      const toScreen = (p: DOMPoint): { x: number; y: number } =>
        ctm ? { x: ctm.a * p.x + ctm.c * p.y + ctm.e, y: ctm.b * p.x + ctm.d * p.y + ctm.f } : { x: p.x, y: p.y };
      const start = toScreen(path.getPointAtLength(0));
      const end = toScreen(path.getPointAtLength(path.getTotalLength()));
      return { startPin: nearest(start.x, start.y), endPin: nearest(end.x, end.y), startX: start.x, endX: end.x };
    });
  });
}

const pathFiles = (page: Page): Promise<string[]> =>
  page.locator("#map-container .path-node").evaluateAll(columns => columns
    .sort((a, b) => Number((a as HTMLElement).dataset.column) - Number((b as HTMLElement).dataset.column))
    .map(column => column.querySelector<HTMLElement>(".node-card")!.dataset.id!));

/** The answer must be visible and readable, including when it has no success strip beneath it. */
async function readablePathStatus(page: Page): Promise<void> {
  const status = page.locator("#pathfind-status");
  await expect(status).toBeVisible();
  await expect(status).toBeInViewport({ ratio: 1 });
  // The page gives the computed colours; the shared helper judges them, over the browser's white canvas like every
  // other contrast check (this spec had assumed a black one, found 2026-11-05).
  const text = await status.evaluate(element => [element, ...element.querySelectorAll("a")].map(part => {
    const layers: string[] = [];
    for (let layer: Element | null = part; layer; layer = layer.parentElement) layers.unshift(getComputedStyle(layer).backgroundColor);
    const style = getComputedStyle(part);
    return { fontSize: parseFloat(style.fontSize), colour: style.color, layers };
  }));
  for (const part of text) {
    expect(part.fontSize, "path answers use the readable body/control scale").toBeGreaterThanOrEqual(13);
    expect(contrastRatio(parseColour(part.colour), backdrop(part.layers)), "the answer and reverse link have readable contrast against their actual backgrounds").toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  }
}

for (const perspective of ["2d", "3d"] as const) {
  test(`path answers and recovery work by keyboard in ${perspective}, survive inspection, representation changes and reload`, async ({ page }) => {
    await page.goto(pathAddress(BASE, DEPENDENT, { kind: "file", nodeId: DEPENDENCY }, DEPENDENT, { perspective }));
    const surface = perspective === "2d" ? "#view-map" : "#view-graph";
    await expect(page.locator(surface)).toHaveClass(/active/u);
    // Asked from the file that depends: answered at once, in both representations, and told from that file. Until
    // 2026-11-22 this address was refused ("IPaymentHub.cs reaches GatewayClient.cs through 4 files") with the reverse
    // question as a link, the second Tab stop of the report, which pinned the other end and exchanged the two.
    await expect(page.locator("#pathfind-status")).toHaveText("Path found: 4 files");
    await readablePathStatus(page);
    await expect(page.locator("#pathfind-status a")).toHaveCount(0);
    await expect(page.locator("#pathfind-path .pathfind-path-hop-name")).toHaveText(TOLD);
    const question = currentSnapshot(page);
    expect(question.pinSet.entries, "nothing is pinned to answer").toEqual([{ nodeId: DEPENDENT, symbol: "*" }]);
    expect(question.destination, "the two ends stay as given").toEqual({ kind: "file", nodeId: DEPENDENCY });

    // These are actual Tab stops in the visible report, outside either inactive surface.
    await page.locator("#search-destination").focus();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Clear the path", exact: true })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: `Inspect path file 1 of 4: ${DEPENDENT}`, exact: true })).toBeFocused();
    await page.keyboard.press("Tab");
    const hop = page.getByRole("button", { name: "Inspect path file 2 of 4: Gateway/Controllers/PaymentsController.cs", exact: true });
    await expect(hop).toBeFocused();
    await expect(hop).toBeInViewport({ ratio: 1 });
    await page.keyboard.press("Enter");
    await expect(page.locator("#detail-panel.visible")).toContainText("Gateway/Controllers/PaymentsController.cs");
    expect(currentSnapshot(page)).toMatchObject({
      selectedNodeId: question.selectedNodeId, pinSet: question.pinSet, destination: question.destination,
      inspection: { kind: "file", nodeId: "Gateway/Controllers/PaymentsController.cs" }
    });

    const other = perspective === "2d" ? "3D" : "2D";
    await page.getByRole("button", { name: other, exact: true }).click();
    await expect(page.getByRole("button", { name: other, exact: true })).toBeEnabled();
    await expect(page.locator("#pathfind-status")).toHaveText("Path found: 4 files");
    await expect(page.locator("#pathfind-path .pathfind-path-hop-name")).toHaveText(TOLD);
    expect(currentSnapshot(page)).toMatchObject({ selectedNodeId: question.selectedNodeId, pinSet: question.pinSet, destination: question.destination });
    await page.reload();
    await expect(page.locator(other === "3D" ? "#view-graph" : "#view-map")).toHaveClass(/active/u);
    await expect(page.locator("#pathfind-status")).toHaveText("Path found: 4 files");
    await expect(page.locator("#detail-panel.visible")).toContainText("Gateway/Controllers/PaymentsController.cs");
    expect(currentSnapshot(page)).toMatchObject({ selectedNodeId: question.selectedNodeId, pinSet: question.pinSet, destination: question.destination });
    await page.keyboard.press("Escape");
    await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);

    await page.locator("#search-destination").focus();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Clear the path", exact: true })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#path-report")).toBeHidden();
    await expect(page.locator("#search-destination")).toBeFocused();
    expect(currentSnapshot(page)).toMatchObject({ selectedNodeId: question.selectedNodeId, pinSet: question.pinSet, destination: null });

    // A disconnected query still has a visible answer, with no reverse link or old success strip.
    await choose(page, "destination", "Portal.csproj", { file: "Portal/Portal.csproj" });
    await expect(page.locator("#pathfind-status")).toContainText("No path either way");
    await readablePathStatus(page);
    await expect(page.locator("#pathfind-status a")).toHaveCount(0);
    await expect(page.locator("#pathfind-path")).toBeHidden();
    await page.locator("#search-destination").focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Space");
    await expect(page.locator("#path-report")).toBeHidden();
    await expect(page.locator("#search-destination")).toBeFocused();
    expect(currentSnapshot(page).pinSet).toEqual(question.pinSet);
  });
}

test("a shared 3D question survives other views and their reloads, and global destination queries arrive in Local Map", async ({ page }) => {
  await page.goto(pathAddress(BASE, DEPENDENCY, { kind: "file", nodeId: DEPENDENT }, DEPENDENCY, { perspective: "3d" }));
  await expect(page.locator("#pathfind-status")).toHaveText("Path found: 4 files");
  const question = currentSnapshot(page);
  for (const [name, surface] of [["World Map", "#view-world"], ["Knowledge Sources", "#view-sources"]]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator(surface)).toHaveClass(/active/u);
    await expect(page.locator("#path-report")).toBeHidden();
    const shared = page.url();
    await page.goto(shared);
    await expect(page.locator(surface)).toHaveClass(/active/u);
    await expect(page.locator("#path-report")).toBeHidden();
    expect(currentSnapshot(page)).toMatchObject({ pinSet: question.pinSet, destination: question.destination, selectedNodeId: question.selectedNodeId });
    await page.getByRole("button", { name: "Local Map", exact: true }).click();
    await expect(page.locator("#view-graph")).toHaveClass(/active/u);
    await expect(page.locator("#pathfind-status")).toHaveText("Path found: 4 files");
    await readablePathStatus(page);
  }

  await page.getByRole("button", { name: "World Map", exact: true }).click();
  await choose(page, "destination", "Portal.csproj", { file: "Portal/Portal.csproj" });
  await expect(page.locator("#view-graph")).toHaveClass(/active/u);
  await expect(page.locator("#pathfind-status")).toContainText("No path either way");
  await readablePathStatus(page);
  await page.reload();
  await expect(page.locator("#pathfind-status")).toContainText("No path either way");
  await readablePathStatus(page);
  expect(currentSnapshot(page).destination).toEqual({ kind: "file", nodeId: "Portal/Portal.csproj" });

  await page.getByRole("button", { name: "Knowledge Sources", exact: true }).click();
  await choose(page, "destination", "GatewayClient", { file: DEPENDENT });
  await expect(page.locator("#view-graph")).toHaveClass(/active/u);
  await expect(page.locator("#pathfind-status")).toHaveText("Path found: 4 files");
  await readablePathStatus(page);
});

for (const [base, file] of [["/", "packages/explorer/src/client/index.ts"], [BASE, DEPENDENT]]) {
  test(`a direct file link starts in the directory-aware layout: ${base}`, async ({ page }) => {
    await page.goto(`${base}?view=local&node=${encodeURIComponent(file)}`);
    await expect(page.locator("#map-container .local-placed")).toBeVisible();
    const subject = page.locator(`#map-container .node-card[data-id="${file}"]`);
    await expect(subject).toBeVisible();
    expect(await subject.locator("xpath=ancestor::*[contains(@class,'local-directory-band')]").count()).toBeGreaterThan(0);
    const ids = () => page.locator("#map-container .node-card").evaluateAll(cards => cards.map(card => (card as HTMLElement).dataset.id).sort());
    const before = await ids();
    expect(before.length).toBeGreaterThan(2);
    await expect(page.locator(".pin-tray-toggle")).toHaveText("0 pins");
    await subject.locator(".local-file-pin").click();
    expect(await ids(), "retaining the selected file does not switch to a different neighborhood renderer").toEqual(before);
    await expect(page.locator("#map-container .local-placed")).toBeVisible();
  });
}

test.describe("Local Map path mode", () => {
  // Until 2026-11-22: "asked with the dependent first, it draws nothing and offers the reverse; the reverse pins the
  // destination and draws blue to green". The drawing's assertions are those it made after taking the offer.
  test("asked with the dependent first, it is answered at once: drawn blue to green, told from the dependent; clearing returns to the exploration", async ({ page }) => {
    await openLocalMap(page, DEPENDENT);
    const subject = `#map-container .node-card[data-id="${DEPENDENT}"]`;
    await expect(page.locator("#search-destination-field")).toBeHidden();

    // Choosing the subject in the bar pins it, and the destination field appears
    await choose(page, "subject", "GatewayClient", { file: DEPENDENT });
    await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
    await expect(page.locator("#search-subject")).toHaveValue("GatewayClient.cs");
    await expect(page.locator("#search-destination-field")).toBeVisible();
    await page.waitForTimeout(400);
    const start = await boxOf(page, subject);
    const wiresBefore = await page.locator("#map-connections .connection-path").count();
    expect(wiresBefore).toBeGreaterThan(0);

    await choose(page, "destination", "IPaymentHub", { file: DEPENDENCY });
    await page.waitForSelector("#view-map.has-path");
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
    await localMapSettled(page);
    await page.waitForTimeout(400);

    // Answered: no refusal, no link, nothing pinned to answer, and the two ends as the person gave them
    const status = page.locator("#pathfind-status");
    await expect(status).toHaveText("Path found: 4 files");
    await expect(page.locator("#pathfind-status a")).toHaveCount(0);
    expect(currentSnapshot(page).destination, "the question asked rides the address").toEqual({ kind: "file", nodeId: DEPENDENCY });
    expect(newestKey(currentSnapshot(page))).toBe(retainedKey({ kind: "pin", pin: { nodeId: DEPENDENT, symbol: "*" } }));
    await expect(page.locator("#search-subject")).toHaveValue("GatewayClient.cs");
    await expect(page.locator("#search-destination")).toHaveValue("IPaymentHub.cs");
    await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
    // Drawn as the map reads, what offers first; told as asked, each file using the next
    expect(await pathFiles(page)).toEqual([DEPENDENCY, "Gateway/Wcf/HubProxy.cs", "Gateway/Controllers/PaymentsController.cs", DEPENDENT]);
    await expect(page.locator(".path-mode.local-placed")).toBeVisible();
    expect(await page.locator("#map-container .local-membrane").count()).toBeGreaterThan(0);
    const strip = await page.locator("#pathfind-path .pathfind-path-hop-name").allTextContents();
    expect(strip).toEqual(TOLD);
    expect(await page.locator("#pathfind-path .pathfind-path-relation").allTextContents()).toEqual(["uses", "uses", "uses"]);
    // The file asked from is in the frame, though it stands at the drawing's right end
    const asked = await boxOf(page, subject);
    expect(asked).not.toBeNull();
    expect(asked!.x).toBeGreaterThanOrEqual(260);
    expect(asked!.x + asked!.width).toBeLessThanOrEqual(FRAME.width);

    // Every wire leaves a blue (offers) pin and enters a green (uses) pin, left to right
    const ends = await wireEnds(page);
    expect(ends.length).toBeGreaterThanOrEqual(3);
    for (const wire of ends) {
      expect(wire.startPin, "a wire leaves an offering pin").toMatch(/symbol-anchor.*outbound/);
      expect(wire.endPin, "a wire enters a using pin").toMatch(/symbol-anchor.*inbound/);
      expect(wire.endX, "a wire runs left to right").toBeGreaterThan(wire.startX + 24);
    }
    // and the instrument reads the same: every drawn wire flows, none runs backward
    const graph = await loadGraph(page, BASE);
    const picture = await readPicture(page, LOCAL_MAP, displayNames(graph, graph.nodes.map(node => node.id)));
    const flow = scoreExpanded(picture, symbolCounts(graph)).flow;
    expect(flow.backward).toBe(0);
    expect(flow.flowing).toBe(flow.drawn);

    // Clearing the destination returns to the exploration as it was: the one pin kept, the question gone from the
    // address, the subject where it stood (until 2026-11-22 the reverse question had pinned the other end and made
    // it the subject, so two pins and the other file were asserted here)
    await page.click("#search-destination-clear");
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
    await page.waitForTimeout(800);
    await expect(page.locator("#view-map")).not.toHaveClass(/has-path/);
    await expect(status).toBeHidden();
    expect(currentSnapshot(page).destination).toBeNull();
    await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
    await expect(page.locator("#search-destination")).toHaveValue("");
    await expect(page.locator(subject)).toBeVisible();
    expect(currentSnapshot(page).selectedNodeId, "the subject is still the file asked from").toBe(DEPENDENT);
    expect(centerDistance(start, await boxOf(page, subject)), "clearing returns the picture to where it stood").toBeLessThanOrEqual(1);
  });

  // The owner's own telling runs page first: "the consumer payment portal talks to its API, to the WCF router …, to the
  // databases". Until 2026-11-22 this question was refused, since the page uses and the table offers.
  test("asked page first, the estate's route from Default.aspx to dbo.Payment.sql is answered: drawn as the map reads, told as asked", async ({ page }) => {
    const PAGE = "Portal/Pages/Default.aspx";
    const TABLE = "Database/SqlServer/dbo.Payment.sql";
    await page.goto(pathAddress(BASE, PAGE, { kind: "file", nodeId: TABLE }));
    await expect(page.locator("#view-map")).toHaveClass(/has-path/u);
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
    await localMapSettled(page);

    // Answered, with no refusal and no link to another question.
    const status = page.locator("#pathfind-status");
    await expect(status).toHaveText(/^Path found: 12 files/u);
    await expect(status).not.toContainText("No path");
    await expect(page.locator("#pathfind-status a")).toHaveCount(0);

    // The telling follows the asking: the bar keeps the two ends as given, and the report names the files from the
    // end asked from to the end asked for, saying of each that it uses the next.
    await expect(page.locator("#search-subject")).toHaveValue("Default.aspx");
    await expect(page.locator("#search-destination")).toHaveValue("dbo.Payment.sql");
    const told = await page.locator("#pathfind-path .pathfind-path-hop").evaluateAll(hops => hops.map(hop => hop.getAttribute("title")!));
    expect(told).toHaveLength(12);
    expect(told[0]).toBe(PAGE);
    expect(told.at(-1)).toBe(TABLE);
    expect(await page.locator("#pathfind-path .pathfind-path-relation").allTextContents()).toEqual(Array.from({ length: 11 }, () => "uses"));
    await expect(page.locator("#pathfind-path")).toHaveAttribute("aria-label", "Path files, each uses the next");

    // The drawing does not change: what offers stands before what uses it, the table at the left and the page at the
    // right, every wire leaving an offering pin and entering a using pin, left to right, none reaching backwards.
    const drawn = await pathFiles(page);
    expect(drawn).toEqual([...told].reverse());
    const ends = await wireEnds(page);
    expect(ends.length).toBeGreaterThanOrEqual(11);
    for (const wire of ends) {
      expect(wire.startPin, "a wire leaves an offering pin").toMatch(/symbol-anchor.*outbound/);
      expect(wire.endPin, "a wire enters a using pin").toMatch(/symbol-anchor.*inbound/);
      expect(wire.endX, "a wire runs left to right").toBeGreaterThan(wire.startX + 24);
    }

    // The address is the question as asked, and nothing was pinned to answer it.
    const asked = currentSnapshot(page);
    expect(asked.pinSet.entries).toEqual([{ nodeId: PAGE, symbol: "*" }]);
    expect(asked.destination).toEqual({ kind: "file", nodeId: TABLE });
    expect(asked.selectedNodeId).toBe(PAGE);
  });

  test("asked in the map's direction, it draws at once, and a path from the address draws the same", async ({ page }) => {
    await openLocalMap(page, DEPENDENCY);
    await choose(page, "subject", "IPaymentHub", { file: DEPENDENCY });
    await choose(page, "destination", "GatewayClient", { file: DEPENDENT });
    await page.waitForSelector("#view-map.has-path");
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
    await page.waitForTimeout(800);
    await expect(page.locator("#pathfind-status")).toHaveText("Path found: 4 files");
    expect(await page.locator("#pathfind-status a").count()).toBe(0);
    // Asked as the map draws, the telling is the drawing's own order, and each file is used by the next: said in
    // words between the names (until 2026-11-22 a bare arrow stood there, which this case did not read).
    await expect(page.locator("#pathfind-path .pathfind-path-hop-name")).toHaveText(ROUTE);
    expect(await page.locator("#pathfind-path .pathfind-path-relation").allTextContents()).toEqual(["is used by", "is used by", "is used by"]);
    await expect(page.locator("#pathfind-path")).toHaveAttribute("aria-label", "Path files, each is used by the next");
    const drawn = await wireEnds(page);
    expect(drawn.length).toBeGreaterThanOrEqual(3);

    await page.goto(pathAddress(BASE, DEPENDENCY, { kind: "file", nodeId: DEPENDENT }));
    await page.waitForSelector("#view-map.has-path");
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
    await page.waitForTimeout(800);
    expect(await pathFiles(page)).toEqual([DEPENDENCY, "Gateway/Wcf/HubProxy.cs", "Gateway/Controllers/PaymentsController.cs", DEPENDENT]);
    await expect(page.locator(".path-mode.local-placed")).toBeVisible();
    expect(await page.locator("#map-container .local-membrane").count()).toBeGreaterThan(0);
    expect((await wireEnds(page)).length).toBe(drawn.length);
    await expect(page.locator("#search-subject")).toHaveValue("IPaymentHub.cs");
    await expect(page.locator("#search-destination")).toHaveValue("GatewayClient.cs");
  });

  // Until 2026-11-22: "a direct dependency asked the wrong way round is offered, …": each of the two answers was the
  // refusal's words with the reverse as a link, and taking the directory's link opened Contracts as the newest pin.
  test("a direct dependency asked from the file that depends is answered, two files that do not connect get no path either way, and a directory is an end of a path too", async ({ page }) => {
    await openLocalMap(page, DEPENDENT);
    await choose(page, "subject", "GatewayClient", { file: DEPENDENT });
    await choose(page, "destination", "PaymentRequestModel", { file: "Portal/Models/PaymentRequestModel.cs" });
    await page.waitForSelector("#view-map.has-path");
    // GatewayClient.cs depends on PaymentRequestModel.cs: drawn with the model first, told from the client
    await expect(page.locator("#pathfind-status")).toHaveText("Path found: 2 files");
    await expect(page.locator("#pathfind-path .pathfind-path-hop-name")).toHaveText(["GatewayClient.cs", "PaymentRequestModel.cs"]);
    await choose(page, "destination", "Default.aspx.cs", { file: "Portal/Pages/Default.aspx.cs" });
    await page.waitForSelector("#pathfind-status.error");
    await expect(page.locator("#pathfind-status")).toContainText("No path either way");
    await expect(page.locator("#view-map")).not.toHaveClass(/has-path/);

    // A directory as the end stands for any file inside it: GatewayClient.cs depends on files of Contracts, and the
    // nearest file of the directory answers, closer than IPaymentHub.cs alone (4 files)
    await choose(page, "destination", "Contracts", { directory: "Contracts" });
    await page.waitForSelector("#view-map.has-path");
    await page.waitForTimeout(800);
    await expect(page.locator("#pathfind-status a")).toHaveCount(0);
    const found = (await page.locator("#pathfind-status").textContent())!.match(/^Path found: (\d+) files$/u)!;
    const hops = Number(found[1]);
    expect(hops, "the nearest file of the directory is nearer than IPaymentHub.cs").toBeLessThan(4);
    expect(currentSnapshot(page).destination).toEqual({ kind: "directory", directory: "Contracts" });
    const drawn = await pathFiles(page);
    expect(drawn).toHaveLength(hops);
    expect(drawn[0].startsWith("Contracts/"), "the drawing leaves from a file of the directory, which offers").toBe(true);
    expect(drawn.at(-1)).toBe(DEPENDENT);
    expect(currentSnapshot(page).openDirectories.has("Contracts"), "nothing is opened or pinned to answer").toBe(false);
    await expect(page.locator("#search-subject")).toHaveValue("GatewayClient.cs");
    await expect(page.locator("#search-destination")).toHaveValue("Contracts");
  });

  // Until 2026-11-22 a row a path reached only against the drawing said "N files, the other way", the refusal foretold.
  test("the destination field offers only what a path from the newest pin reaches, says how far, and folds the rest", async ({ page }) => {
    await openLocalMap(page, DEPENDENT);
    await choose(page, "subject", "GatewayClient", { file: DEPENDENT });
    const field = page.locator("#search-destination");
    const results = page.locator("#search-destination-results");
    await expect(field).toHaveAttribute("placeholder", "Path to…");
    /** The offered file rows' paths and words, and the fold's words if it stands. */
    const offered = async (typed: string): Promise<{ rows: Array<[string, string]>; fold: string | null }> => {
      await page.keyboard.press("Escape");
      await page.click("#search-destination");
      await page.keyboard.type(typed);
      await page.waitForSelector("#search-destination-results .search-row");
      return results.evaluate(element => ({
        rows: [...element.querySelectorAll(".search-row--file:not(.is-apart)")].map(row =>
          [row.querySelector(".search-row-context")!.textContent!, row.querySelector(".search-row-badge")?.textContent ?? ""] as [string, string]),
        fold: element.querySelector(".search-row--apart")?.textContent ?? null
      }));
    };

    // Both controllers connect: the Portal's depends on GatewayClient.cs, and GatewayClient.cs on the Gateway's
    const controllers = await offered("PaymentsController");
    expect(controllers.rows).toEqual([
      ["Gateway/Controllers/PaymentsController.cs", "2 files"],
      ["Portal/Controllers/PaymentsController.cs", "2 files"]
    ]);
    expect(controllers.fold).toBeNull();
    expect((await offered("IPaymentHub")).rows).toEqual([[DEPENDENCY, "4 files"]]);

    // A directory offered by name says what its nearest file says: Contracts answers in three files
    await page.keyboard.press("Escape");
    await page.click("#search-destination");
    await page.keyboard.type("Contracts");
    await expect(results.locator('.search-row--directory:has(.search-row-name:text-is("Contracts")) .search-row-badge')).toHaveText("3 files");

    // The project file matches "Payment" by name but no path joins it to the pin (it is of the group Estate.sln and the
    // projects it names make, read since 2026-11-21), as with files matched by a symbol alone, the pin's own file among
    // them: folded under a count, and under the fold once opened, each marked
    const payment = await offered("Payment");
    expect(payment.rows.length).toBeGreaterThan(2);
    for (const [, words] of payment.rows) expect(words).toMatch(/^\d+ files$/u);
    expect(payment.rows.map(([file]) => file)).not.toContain("PaymentService/PaymentService.csproj");
    expect(payment.fold).toMatch(/^\d+ more files match, but no path connects them$/u);
    await expect(results.locator(".search-row.is-apart")).toHaveCount(0);
    await results.locator(".search-row--apart").click();
    const apart = results.locator(".search-row--file.is-apart");
    expect(await apart.count()).toBe(Number(payment.fold!.match(/^(\d+)/u)![1]));
    const apartRows = await apart.evaluateAll(rows => rows.map(row =>
      [row.querySelector(".search-row-context")!.textContent, row.querySelector(".search-row-badge")!.textContent]));
    expect(apartRows).toContainEqual(["PaymentService/PaymentService.csproj", "no path"]);
    expect(apartRows).toContainEqual([DEPENDENT, "no path"]);
    for (const [, words] of apartRows) expect(words).toBe("no path");

    // A file under the fold can still be asked, and the answer is the honest one
    await page.keyboard.press("Escape");
    await choose(page, "destination", "Portal.csproj", { file: "Portal/Portal.csproj" });
    await page.waitForSelector("#pathfind-status.error");
    await expect(page.locator("#pathfind-status")).toContainText("No path either way");

    // A pin nothing connects to says so, and every match is under the fold. None of the estate's files stands alone
    // since its solution is read (Portal.csproj, which did, is named by Estate.sln), so the pin is the C# Rosetta
    // program's project file, which references no project and which no solution names.
    await page.goto("/samples/rosetta/csharp/?view=local&node=src%2FApp%2FMain.cs");
    await page.waitForSelector('#map-container .node-card[data-id="src/App/Main.cs"]');
    await choose(page, "subject", "Rosetta.csproj", { file: "Rosetta.csproj" });
    await expect(field).toHaveAttribute("placeholder", "Nothing connects to Rosetta.csproj");
    const alone = await offered("Processor");
    expect(alone.rows).toEqual([]);
    expect(alone.fold).toMatch(/^\d+ files match, but no path connects them$/u);
  });

  test("the subject field follows the newest pin, and a new subject chosen in the bar asks the path again from it", async ({ page }) => {
    await page.goto(pathAddress(BASE, DEPENDENCY, { kind: "file", nodeId: DEPENDENT }, DEPENDENT));
    await page.locator("#view-map.has-path").waitFor();
    await expect(page.locator("#pathfind-status")).toHaveText("Path found: 4 files");
    await expect(page.locator("#search-subject")).toHaveValue("IPaymentHub.cs");
    await choose(page, "subject", "HubProxy", { file: "Gateway/Wcf/HubProxy.cs" });
    await page.waitForTimeout(800);
    await expect(page.locator("#pathfind-status")).toHaveText("Path found: 3 files");
    expect(await pathFiles(page)).toEqual(["Gateway/Wcf/HubProxy.cs", "Gateway/Controllers/PaymentsController.cs", DEPENDENT]);
    await expect(page.locator("#search-subject")).toHaveValue("HubProxy.cs");
    await expect(page.locator(".pin-tray-toggle")).toHaveText("2 pins");
    expect(currentSnapshot(page).destination).toEqual({ kind: "file", nodeId: DEPENDENT });
  });
});

test("pinning a path symbol opens branches, clears the old path status and keeps the clicked row in place", async ({ page }) => {
  await page.goto(pathAddress(BASE, DEPENDENCY, { kind: "file", nodeId: DEPENDENT }, DEPENDENT));
  await page.locator("#view-map.has-path").waitFor();
  await page.waitForTimeout(800);
  const label = page.locator(".path-origin .symbol-row:not(.internals-row) .symbol-label-wrapper").first();
  const before = (await label.boundingBox())!;
  const symbol = await label.evaluate(element => element.parentElement!.dataset.symbol!);
  await label.locator(".local-symbol-pin").click();
  await expect(page.locator("#view-map")).not.toHaveClass(/has-path/);
  await expect(page.locator("#pathfind-status")).toBeHidden();
  await expect(page.locator(".branch-mode")).toBeVisible();
  await page.waitForTimeout(100);
  const after = (await page.locator(`.node-card[data-id="${DEPENDENCY}"] .symbol-row[data-symbol="${symbol}"] .symbol-label-wrapper`).boundingBox())!;
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeLessThan(1);
  expect(currentSnapshot(page).destination, "leaving the path by the picture forgets the question").toBeNull();
  await expect(page.locator("#search-destination")).toHaveValue("");
  // The origin was pinned whole, so the click narrowed its pin to the symbol clicked (2026-10-15); the field shows it, the newest
  const snapshot = currentSnapshot(page);
  const newest = retainedItems({ pins: snapshot.pinSet, openDirectories: snapshot.openDirectories, retentionOrder: snapshot.retentionOrder }).at(-1)!;
  expect(newest.kind === "pin" && newest.pin.nodeId).toBe(DEPENDENCY);
  expect(newest.kind === "pin" && newest.pin.symbol).toBe(symbol);
  expect(snapshot.pinSet.entries.filter(pin => pin.nodeId === DEPENDENCY)).toEqual([{ nodeId: DEPENDENCY, symbol }]);
  await expect(page.locator("#search-subject"), "the field follows the newest pin").toHaveValue(describeRetained(newest, id => id.split("/").pop()).name);
});

test("Open on an already retained directory leaves the path and discloses its contents without changing pins", async ({ page }) => {
  await page.goto(pathAddress(BASE, DEPENDENCY, { kind: "file", nodeId: DEPENDENT }, DEPENDENT, {
    openDirectories: new Set(["Contracts"]),
    retentionOrder: [
      retainedKey({ kind: "directory", directory: "Contracts" }),
      retainedKey({ kind: "pin", pin: { nodeId: DEPENDENCY, symbol: "*" } })
    ]
  }));
  await expect(page.locator("#view-map")).toHaveClass(/has-path/);
  await localMapSettled(page);
  const before = currentSnapshot(page);
  const directory = page.locator('.local-directory-label[data-directory="Contracts"]');
  const open = directory.locator(".local-directory-open");
  await expect(open).toBeVisible();
  await expect(page.locator('.node-card[data-id="Contracts/Contracts.csproj"]')).toHaveCount(0);
  await panIntoView(page, open);
  await open.click();
  await localMapSettled(page);
  await expect(page.locator("#view-map")).not.toHaveClass(/has-path/);
  await expect(page.locator("#pathfind-status")).toBeHidden();
  await expect(directory.locator(".local-directory-close")).toBeVisible();
  await expect(page.locator('.node-card[data-id="Contracts/Contracts.csproj"]')).toHaveCount(1);
  expect(currentSnapshot(page)).toMatchObject({
    selectedNodeId: before.selectedNodeId,
    pinSet: before.pinSet,
    openDirectories: before.openDirectories,
    destination: null
  });
});
