import { test, expect, type Page } from "@playwright/test";

import { pathAddress } from "./search-bar";
import { LOCAL_MAP, arriveAtReadingSize, displayNames, loadGraph, localMapSettled, localMapUrl, localRetainUrl, readPicture, scoreOcclusion, type PictureReading } from "./still-picture";
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

/**
 * A made fault, since no picture the suite draws has one: a card that is neither end of a wire, stood across it.
 * Since 2026-11-22 every wire has a band along its route, an undrawn stroke that takes the pointer, in a layer above
 * the cards; the reading asked the page for its topmost element at each of a wire's samples and was handed the wire's
 * own band at 5,914 of 5,976 of them, so that it could not see a card across a wire and "no wire crosses a card it
 * does not end at" could not fail. A returning connection's lace takes the pointer itself, and had hidden a card
 * under it the same way since it was made. Stands the card, at once, across the first of the wires the selector names
 * that has a point in the frame on open ground, and says which wire and card, or why each was refused.
 */
async function standACardAcross(page: Page, wires: string, clear: number): Promise<{ ends: string[]; card: string; bandThere: boolean; refused: string[] }> {
  return page.evaluate(({ wires, clear }) => {
    const frame = document.querySelector("#main")!.getBoundingClientRect();
    const k = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a;
    const cards = [...document.querySelectorAll<HTMLElement>("#map-container .node-card")];
    const refused: string[] = [];
    for (const wire of document.querySelectorAll<SVGGeometryElement>(wires)) {
      const { sourceId, targetId } = (wire as unknown as HTMLElement).dataset;
      if (!sourceId || !targetId || sourceId === targetId || getComputedStyle(wire).display === "none") continue;
      // A point of the wire inside the frame and on open ground, clear of every card as the picture stands; the
      // picture at reading size is larger than the frame, so it is seldom the wire's middle by length.
      const length = wire.getTotalLength(), ctm = wire.getScreenCTM()!;
      const boxes = cards.map(each => each.getBoundingClientRect());
      let middle: DOMPoint | null = null;
      for (let at = Math.min(40, length / 4); at < length && !middle; at += Math.min(24, length / 8)) {
        const point = wire.getPointAtLength(at).matrixTransform(ctm);
        const inFrame = point.x > frame.left + 160 && point.x < frame.right - 160 && point.y > frame.top + 160 && point.y < frame.bottom - 160;
        if (inFrame && !boxes.some(box => point.x > box.left - clear && point.x < box.right + clear && point.y > box.top - clear && point.y < box.bottom + clear)) middle = point;
      }
      if (!middle) { refused.push(`${sourceId} to ${targetId}: no point in the frame on open ground`); continue; }
      const card = cards.find(each => each.dataset.id !== sourceId && each.dataset.id !== targetId);
      if (!card) continue;
      const box = card.getBoundingClientRect();
      // Stood there at once: a card's own move is eased, and the reading is taken now.
      card.style.transition = "none";
      card.style.transform = `translate(${(middle.x - (box.left + box.right) / 2) / k}px, ${(middle.y - (box.top + box.bottom) / 2) / k}px)`;
      const there = document.elementsFromPoint(middle.x, middle.y);
      // The made input is what it says: of the map's own things under the wires' layer, the card is the topmost there.
      const under = there.find(element => !element.closest("#map-connections"));
      if (under?.closest(".node-card") !== card) {
        const now = card.getBoundingClientRect();
        refused.push(`${card.dataset.id} stood at ${Math.round(now.left)}, ${Math.round(now.top)} for a point at ${Math.round(middle.x)}, ${Math.round(middle.y)}; under the wires there: ${under ? `${under.tagName}.${under.getAttribute("class") ?? ""}` : "nothing"}`);
        card.style.transform = "";
        continue;
      }
      return { ends: [sourceId, targetId], card: card.dataset.id!, bandThere: there.some(element => element.matches("#map-connections .wire-band")), refused };
    }
    return { ends: [] as string[], card: "", bandThere: false, refused };
  }, { wires, clear });
}

/** Both readings see the made card across the made wire (its laces alone, where the wire is a returning connection), and agree to the number. */
async function expectBothSee(page: Page, made: { ends: string[]; card: string }, laces: boolean): Promise<void> {
  const graph = await loadGraph(page, BASE);
  const names = displayNames(graph, graph.nodes.map(node => node.id));
  const reference = await readPictureReference(page, LOCAL_MAP, names);
  const now = await readPicture(page, LOCAL_MAP, names);
  const covered = (reading: PictureReading): number => reading.wires
    .filter(wire => wire.stub === laces && made.ends.includes(wire.consumer) && made.ends.includes(wire.provider))
    .reduce((sum, wire) => sum + wire.occludedSamples, 0);
  expect(covered(now), `the instrument sees ${made.card} across the wire`).toBeGreaterThan(0);
  expect(covered(reference), `the reading as it was sees ${made.card} across the wire`).toBeGreaterThan(0);
  expect(scoreOcclusion(now).occludedWires).toBeGreaterThan(0);
  expect(JSON.stringify(now)).toBe(JSON.stringify(reference));
}

test("a card stood across a wire's middle is read as covering it, the wire's own band running there", async ({ page }) => {
  // At reading size, where a stretch of a wire and a whole card fit the frame together; the arrival is not this case's subject.
  await arriveAtReadingSize(page);
  await page.goto(localRetainUrl(BASE, ["PaymentService/PaymentService.cs", "Portal/Services/GatewayClient.cs", "Hub/App.config", "Gateway/Wcf/HubProxy.cs"]));
  await page.waitForSelector("#map-container .branch-mode");
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
  await localMapSettled(page);
  await page.waitForTimeout(600);
  const made = await standACardAcross(page, "#map-connections path.connection-path:not(.bundle-run)", 16);
  expect(made.card, `a route with a point in the frame, and a card that is neither of its ends: ${made.refused.join("; ")}`).not.toBe("");
  expect(made.bandThere, "the wire's band runs where the card now stands").toBe(true);
  await expectBothSee(page, made, false);
});

test("a card stood across a returning connection's lace is read as covering it, the lace taking the pointer there", async ({ page }) => {
  await arriveAtReadingSize(page);
  // The estate's payment service as a link opens it: the picture of the deck's that draws returning connections.
  await page.goto(localMapUrl(BASE, "PaymentService/PaymentService.cs"));
  await page.waitForSelector("#map-connections .connection-path.returning", { state: "attached" });
  await localMapSettled(page);
  await page.waitForTimeout(600);
  const made = await standACardAcross(page, "#map-connections .connection-path.returning", 0);
  expect(made.card, `a lace with a point in the frame clear of the cards, and a card that is neither of its ends: ${made.refused.join("; ")}`).not.toBe("");
  await expectBothSee(page, made, true);
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
