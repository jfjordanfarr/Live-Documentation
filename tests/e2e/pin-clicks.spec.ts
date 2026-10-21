import { expect, test, type Page } from "@playwright/test";

import { localMapSettled, panIntoView } from "./still-picture";
import { decompressSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";

/**
 * Direct Pin controls retain what they name while body/label clicks inspect (the owner's accepted grammar,
 * 2026-10-19, Turn 24). A neighbour's symbol remains one pin with the subject drawn whole; whole-file and symbol pins
 * retain the narrow/add/release/fallback rule of 2026-10-15. Centre changes the subject without pinning; inspection
 * and double-clicks leave the working set alone; the Knowledge Sources journey still reaches a far symbol in five
 * explicit actions; and a finger drags the 2D map. The earlier click-only journey is in the probe record
 * `AI-Agent-Workspace/Probes/2026-10-14/pin-clicks/`.
 */
const ROSETTA = "tests/integration/programs/typescript/rosetta/src";
const MAIN = `${ROSETTA}/main.ts`;
const MODELS = `${ROSETTA}/models.ts`;
const BRANCHES = "packages/explorer/src/client/views/localView/branches.ts";
const GATEWAY_CLIENT = "Portal/Services/GatewayClient.cs";
const PAYMENT_RESULT = "Portal/Models/PaymentResultModel.cs";

test.use({ viewport: { width: 1600, height: 1000 } });

/** The pins the address carries, as file#symbol. */
const pins = (page: Page): string[] => {
  const s = new URL(page.url()).searchParams.get("s");
  return s ? decompressSnapshot(s).pinSet.entries.map(pin => `${pin.nodeId}#${pin.symbol}`) : [];
};
const subject = (page: Page): Promise<string | null> => page.locator("#context-name").textContent();
const card = (page: Page, id: string) => page.locator(`#map-container .node-card[data-id="${id}"]`);
const row = (page: Page, id: string, symbol: string) => card(page, id).locator(`.symbol-row[data-symbol="${symbol}"] .symbol-label-wrapper`);
const symbolPin = (page: Page, id: string, symbol: string) => row(page, id, symbol).locator(".local-symbol-pin");

test("a neighbour's direct symbol Pin retains only that symbol; the subject stays, drawn whole", async ({ page }) => {
  await page.goto(`/?view=local&node=${MAIN}`);
  await localMapSettled(page);
  expect(pins(page)).toEqual([]);
  await panIntoView(page, card(page, MODELS));
  await symbolPin(page, MODELS, "Report").click();
  await localMapSettled(page);
  expect(pins(page)).toEqual([`${MODELS}#Report`]);
  expect(await subject(page)).toBe(MAIN);
  await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
  await expect(symbolPin(page, MODELS, "Report")).toHaveAttribute("aria-pressed", "true");
  await expect(row(page, MAIN, "main"), "the subject's own rows stay disclosed").toBeVisible();
  expect(await page.locator(`#map-connections .connection-path[data-source-id="${MAIN}"]`).count(), "and its wires drawn").toBeGreaterThan(0);
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/);
});

test("a file's direct Pin retains it whole; symbol pins narrow, add, release, and the last one released leaves it whole", async ({ page }) => {
  await page.goto(`/?view=local&node=${MAIN}`);
  await localMapSettled(page);
  await panIntoView(page, card(page, MODELS));
  await card(page, MODELS).locator(".local-file-pin").click();
  await localMapSettled(page);
  expect(pins(page)).toEqual([`${MODELS}#*`]);
  await symbolPin(page, MODELS, "Report").click();
  await localMapSettled(page);
  expect(pins(page), "narrowed to the symbol pressed").toEqual([`${MODELS}#Report`]);
  await expect(symbolPin(page, MODELS, "Report")).toHaveAttribute("aria-pressed", "true");
  // The narrowed card folds its other rows away; the reveal shows them without pinning, and then one is added
  await card(page, MODELS).getByRole("button", { name: /^\+\d+ symbols?$/ }).click();
  await localMapSettled(page);
  expect(pins(page), "the reveal pins nothing").toEqual([`${MODELS}#Report`]);
  await expect(symbolPin(page, MODELS, "Record")).toHaveAttribute("aria-pressed", "false");
  await symbolPin(page, MODELS, "Record").click();
  await localMapSettled(page);
  expect(pins(page), "the next symbol added").toEqual([`${MODELS}#Report`, `${MODELS}#Record`]);
  await symbolPin(page, MODELS, "Report").click();
  await localMapSettled(page);
  expect(pins(page), "a pressed symbol released").toEqual([`${MODELS}#Record`]);
  await symbolPin(page, MODELS, "Record").click();
  await localMapSettled(page);
  expect(pins(page), "the last symbol released leaves the file pinned whole").toEqual([`${MODELS}#*`]);
  expect(await subject(page), "no pin moved the subject").toBe(MAIN);
  await expect(card(page, MODELS).locator(".local-file-close")).toHaveCount(1);
});

test("Centre makes a neighbour the subject without a pin; double-clicking another file only inspects it", async ({ page }) => {
  await page.goto(`/?view=local&node=${MAIN}`);
  await localMapSettled(page);
  await expect(card(page, MAIN).getByRole("button", { name: "Centre on main.ts", exact: true }), "the subject's card has no recentre control").toHaveCount(0);
  await panIntoView(page, card(page, MODELS));
  await card(page, MODELS).getByRole("button", { name: "Centre on models.ts", exact: true }).click();
  await localMapSettled(page);
  expect(await subject(page)).toBe(MODELS);
  expect(pins(page)).toEqual([]);
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/);
  await expect(card(page, MODELS).getByRole("button", { name: "Centre on models.ts", exact: true })).toHaveCount(0);
  await expect(card(page, MAIN).getByRole("button", { name: "Centre on main.ts", exact: true })).toHaveCount(1);
  // Centred on models.ts, the picture has carried main.ts past the frame's edge; a person pans to it.
  await panIntoView(page, card(page, MAIN));
  await card(page, MAIN).locator(".node-title").dblclick();
  await localMapSettled(page);
  expect(pins(page), "inspection never adds a pin").toEqual([]);
  expect(await subject(page), "and nothing recentres").toBe(MODELS);
  await expect(page.locator("#detail-panel")).toHaveClass(/visible/);
  await expect(page.locator("#detail-title")).toHaveText("main.ts");
});

for (const gesture of [
  { name: "symbol label", selector: ".symbol-label", inspectsType: false },
  { name: "return type badge", selector: ".type-badge-return", inspectsType: true }
] as const) {
  test(`double-clicking an estate ${gesture.name} keeps the source as subject`, async ({ page }) => {
    await page.goto(`/samples/estate/?view=local&node=${encodeURIComponent(GATEWAY_CLIENT)}`);
    await localMapSettled(page);
    await expect(page.locator("#map-container .node-card.local-focus")).toHaveAttribute("data-id", GATEWAY_CLIENT);

    const labelWrapper = row(page, GATEWAY_CLIENT, "GetPaymentAsync");
    await panIntoView(page, labelWrapper);
    const target = labelWrapper.locator(gesture.selector);
    if (gesture.inspectsType) await expect(target).toHaveAttribute("data-target-id", PAYMENT_RESULT);
    await target.dblclick();
    await localMapSettled(page);

    await expect(page.locator("#map-container .node-card.local-focus"), "a pin or inspection must not move the subject").toHaveAttribute("data-id", GATEWAY_CLIENT);
    expect(pins(page), "neither inspection click pins its source or target").toEqual([]);
    await expect(page.locator(".pin-tray-toggle")).toHaveText("0 pins");
    await expect(page.locator("#detail-panel")).toHaveClass(/visible/u);
    await expect(page.locator("#context-name"), "context continues to name the map subject").toHaveText(GATEWAY_CLIENT);
    if (gesture.inspectsType) {
      await expect(page.locator("#detail-title")).toHaveText("PaymentResultModel.cs");
    } else {
      await expect(page.locator("#detail-title")).toHaveText("GatewayClient.cs");
      const snapshot = decompressSnapshot(new URL(page.url()).searchParams.get("s")!);
      expect(snapshot.inspection).toEqual({ kind: "file", nodeId: GATEWAY_CLIENT, symbol: "GetPaymentAsync" });
    }
  });
}

test("from Knowledge Sources, one symbol of a far file is one pin in five clicks", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Knowledge Sources", exact: true }).click();
  const listed = page.locator("#view-sources").getByText("branches.ts", { exact: true }).first();
  // The panel folds its groups; each closed one above the file is clicked open
  await listed.evaluate(element => {
    for (let group = element.closest("details"); group; group = group.parentElement?.closest("details") ?? null) {
      if (!group.open) group.querySelector("summary")?.click();
    }
  });
  await listed.scrollIntoViewIfNeeded();
  await listed.click();
  await page.getByRole("button", { name: "Centre on branches.ts", exact: true }).click();
  await localMapSettled(page);
  expect(await subject(page)).toBe(BRANCHES);
  expect(pins(page)).toEqual([]);
  const first = card(page, BRANCHES).locator(".symbol-row:not(.internals-row)").first();
  const symbol = await first.getAttribute("data-symbol");
  await first.locator(".local-symbol-pin").click();
  await localMapSettled(page);
  expect(pins(page)).toEqual([`${BRANCHES}#${symbol}`]);
});

test("a finger drags the 2D map", async ({ page }) => {
  await page.goto(`/?view=local&node=${MAIN}`);
  await localMapSettled(page);
  const viewport = page.locator("#map-viewport");
  const transform = () => page.locator("#map-container").evaluate(element => (element.parentElement as HTMLElement).style.transform);
  const before = await transform();
  const touch = (type: string, x: number, y: number) => viewport.dispatchEvent(type, { pointerId: 7, pointerType: "touch", isPrimary: true, button: 0, buttons: 1, clientX: x, clientY: y, bubbles: true });
  await touch("pointerdown", 900, 700);
  await touch("pointermove", 960, 740);
  await touch("pointermove", 1020, 780);
  await touch("pointerup", 1020, 780);
  await page.waitForTimeout(300);
  const after = await transform();
  expect(after).not.toBe(before);
  const shift = (value: string): number[] => (value.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/) ?? []).slice(1, 3).map(Number);
  const [dx, dy] = [shift(after)[0] - shift(before)[0], shift(after)[1] - shift(before)[1]];
  expect(dx, "the map followed the finger right").toBeGreaterThan(100);
  expect(dy, "and down").toBeGreaterThan(60);
  expect(pins(page)).toEqual([]);
});
