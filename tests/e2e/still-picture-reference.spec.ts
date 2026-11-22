import { test, expect, type Page } from "@playwright/test";

import { pathAddress } from "./search-bar";
import { LOCAL_MAP, displayNames, loadGraph, localMapSettled, localRetainUrl, readPicture } from "./still-picture";
import { readPictureReference } from "./still-picture-reference";

/**
 * The still-picture instrument against itself as it stood until 2026-11-22. That day its reading of a large retained
 * picture had outgrown the minute a case gave it, and the reading was changed to ask each sample's questions of the
 * few boxes that can hold it; a faster reading is worth nothing if it reads otherwise, so the old one is kept, word
 * for word, and the two must agree to the last digit of every number on the same page: every wire's samples, counts,
 * lengths and points, every card, the frame and the scale.
 *
 * On the estate sample, where the old reading is quick: a retained picture, whose wires pass directories, lanes and
 * other cards, and a path. The large picture of this repository is compared by the probe that measured the change
 * (`AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/instrument-and-look-cost/`).
 */
const BASE = "/samples/estate/";

async function bothReadings(page: Page, along: boolean): Promise<{ now: string; reference: string; wires: number; samples: number }> {
  const graph = await loadGraph(page, BASE);
  const names = displayNames(graph, graph.nodes.map(node => node.id));
  const reference = await readPictureReference(page, LOCAL_MAP, names, along);
  const now = await readPicture(page, LOCAL_MAP, names, along);
  return { now: JSON.stringify(now), reference: JSON.stringify(reference), wires: now.wires.length, samples: now.wires.reduce((sum, wire) => sum + wire.points.length / 2, 0) };
}

test.use({ viewport: { width: 1600, height: 1000 } });

test("a retained picture reads the same as the instrument read it, to the number, with its samples and without", async ({ page }) => {
  await page.goto(localRetainUrl(BASE, ["PaymentService/PaymentService.cs", "Portal/Services/GatewayClient.cs", "Hub/App.config", "Gateway/Wcf/HubProxy.cs"]));
  await page.waitForSelector("#map-container .branch-mode");
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
  await localMapSettled(page);
  await page.waitForTimeout(600);
  const sampled = await bothReadings(page, true);
  // The picture is one that asks every question: many wires, thousands of samples.
  expect(sampled.wires).toBeGreaterThan(20);
  expect(sampled.samples).toBeGreaterThan(2000);
  expect(sampled.now).toBe(sampled.reference);
  const unsampled = await bothReadings(page, false);
  expect(unsampled.samples).toBe(0);
  expect(unsampled.now).toBe(unsampled.reference);
});

test("a path reads the same as the instrument read it, to the number", async ({ page }) => {
  await page.goto(pathAddress(BASE, "Database/SqlServer/dbo.Payment.sql", { kind: "file", nodeId: "Portal/Pages/Default.aspx" }));
  await page.waitForSelector("#view-map.has-path");
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
  await localMapSettled(page);
  await page.waitForTimeout(600);
  const sampled = await bothReadings(page, true);
  expect(sampled.wires).toBeGreaterThan(8);
  expect(sampled.now).toBe(sampled.reference);
});
