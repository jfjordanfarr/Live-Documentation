import { test, expect } from "@playwright/test";
import { compressToEncodedURIComponent } from "lz-string";

/**
 * Membrane Map — Pin-Active Visual Stability
 *
 * Dev Day 86: Catches temporal layout bugs in which SVG connector lines
 * draw between symbol-pin anchors before the pin-active cards have
 * finished settling into their final DOM positions.
 *
 * Method: navigate to a deterministic pin-active URL for a well-connected
 * node, wait for layout to settle, read the layout's geometry: every
 * card's box, every pin's box, every wire's path data and the camera.
 * Then reload the exact same URL, wait the same way, read it again. The
 * two readings must be identical to the last digit — a connector drawn
 * before its card settles produces different path data on one of the two
 * loads, which is exactly the race this guards.
 *
 * Until 2026-10-01 the test compared two PNG screenshots byte for byte.
 * Four full-suite runs went 52/53, 52/53, 53/54 and 54/54 on the same
 * code, and decoding the differing pairs found 5 to 32 pixels at the
 * sidebar checkbox edges or at pin rims, differing by 1 to 6 of 255,
 * with every card and wire in the same place: the rasterizer's noise, not
 * the layout's. A check that fails on raster noise cannot say whether the
 * layout raced, so the check now reads the geometry the raster is made
 * from. The screenshots are still taken and attached when they differ, as
 * evidence, not as the verdict.
 *
 * The node chosen (`liveDocumentationConfig.ts`) has 12 exported symbols
 * and >10 inbound importers, producing a dense pin-active layout with
 * multiple SVG connection paths.
 */

/** Build a compressed Membrane state URL with the given payload fields. */
function buildStateUrl(payload: Record<string, unknown>): string {
  const compressed = compressToEncodedURIComponent(
    JSON.stringify({ v: 1, w: "membrane", ...payload }),
  );
  return `/?s=${compressed}`;
}

/**
 * Wait for the pin-active layout to visually settle.
 *
 * Polls the DOM until .pin-active-root exists AND at least one
 * .pin-active-card is rendered, then waits an additional fixed
 * interval for SVG connection-path layout to finish.
 */
async function waitForPinActiveSettle(page: import("@playwright/test").Page): Promise<void> {
  // Wait for the pin-active root container
  await page.waitForSelector(".pin-active-root", { timeout: 15_000 });

  // Wait for at least one rendered card
  await page.waitForSelector(".pin-active-card[data-id]", { timeout: 10_000 });

  // Wait for SVG focal overlay connections (if any connections are drawn)
  await page.waitForTimeout(300);
  await page.waitForSelector(
    ".membrane-focal-svg, .pin-active-card .membrane-card__symbol-row",
    { timeout: 10_000 },
  );

  // Allow the final connection-drawing animation frame to flush
  await page.waitForTimeout(800);
}

/** The layout as numbers: each card's and pin's box, each wire's path data, and the camera, in document order. */
async function readLayoutGeometry(page: import("@playwright/test").Page): Promise<{
  camera: string;
  cards: Array<[string, number, number, number, number]>;
  pins: Array<[string, string, string, number, number, number, number]>;
  wires: Array<[string, string, string, string, string]>;
}> {
  return page.evaluate(() => {
    const box = (el: Element): [number, number, number, number] => {
      const r = el.getBoundingClientRect();
      return [r.x, r.y, r.width, r.height];
    };
    const camera = getComputedStyle(document.querySelector("#membrane-container")!).transform;
    const cards = [...document.querySelectorAll<HTMLElement>(".pin-active-card[data-id]")].map(
      (card): [string, number, number, number, number] => [card.dataset.id!, ...box(card)],
    );
    const pins = [...document.querySelectorAll<HTMLElement>(".pin-active-card .membrane-focal-pin")].map(
      (pin): [string, string, string, number, number, number, number] => {
        const row = pin.closest<HTMLElement>("[data-node-id][data-symbol]");
        const side = pin.classList.contains("membrane-focal-pin--outbound") ? "out" : "in";
        return [row?.dataset.nodeId ?? "", row?.dataset.symbol ?? "", side, ...box(pin)];
      },
    );
    const wires = [...document.querySelectorAll<SVGElement>(".membrane-focal-svg .membrane-connection")].map(
      (wire): [string, string, string, string, string] => {
        const data = (wire as unknown as HTMLElement).dataset;
        return [data.sourceId ?? "", data.sourceSymbol ?? "", data.targetId ?? "", data.targetSymbol ?? "", wire.getAttribute("d") ?? wire.getAttribute("points") ?? ""];
      },
    );
    return { camera, cards, pins, wires };
  });
}

test.describe("Membrane Map — Pin-Active Visual Stability", () => {
  test("pin-active layout is pixel-stable across page reload", async ({
    page,
  }, testInfo) => {
    // Seed a pin-active state for liveDocumentationConfig.ts
    // using __internals__ (the catch-all pin symbol) plus a few named symbols
    const targetNode = "packages/engine/src/config/liveDocumentationConfig.ts";
    const stateUrl = buildStateUrl({
      p: [
        { n: targetNode, s: "__internals__" },
        { n: targetNode, s: "LiveDocumentationConfig" },
        { n: targetNode, s: "normalizeLiveDocumentationConfig" },
        { n: targetNode, s: "DEFAULT_LIVE_DOCUMENTATION_CONFIG" },
        { n: targetNode, s: "LIVE_DOCUMENTATION_FILE_EXTENSION" },
        { n: targetNode, s: "LIVE_DOCUMENTATION_DEFAULT_ROOT" },
      ],
    });

    // ── First render ─────────────────────────────────────────────
    await page.goto(stateUrl);
    await waitForPinActiveSettle(page);

    const geometry1 = await readLayoutGeometry(page);
    const screenshot1 = await page.screenshot({ type: "png" });

    // ── Reload and second render ─────────────────────────────────
    await page.reload();
    await waitForPinActiveSettle(page);

    const geometry2 = await readLayoutGeometry(page);
    const screenshot2 = await page.screenshot({ type: "png" });

    if (!screenshot1.equals(screenshot2)) {
      await testInfo.attach("before-reload", {
        body: screenshot1,
        contentType: "image/png",
      });
      await testInfo.attach("after-reload", {
        body: screenshot2,
        contentType: "image/png",
      });
    }

    // ── Compare the geometry ─────────────────────────────────────
    // The layout is deterministic in CSS pixels, so every number must
    // come back the same to the last digit. A wire measured before its
    // card settled differs in its path data; a card that landed
    // elsewhere differs in its box. Nothing is rounded.
    expect(geometry1.cards.length, "the layout rendered cards").toBeGreaterThan(0);
    expect(geometry1.wires.length, "the layout drew wires").toBeGreaterThan(0);
    expect(geometry2.camera, "the camera is the same after reload").toBe(geometry1.camera);
    expect(geometry2.cards, "every card is in the same place after reload").toEqual(geometry1.cards);
    expect(geometry2.pins, "every pin is in the same place after reload").toEqual(geometry1.pins);
    expect(geometry2.wires, "every wire has the same path after reload (connectors may be drawing before cards settle)").toEqual(geometry1.wires);
  });

  test("pin-active SVG connections are present after settling", async ({
    page,
  }) => {
    const targetNode = "packages/engine/src/config/liveDocumentationConfig.ts";
    const stateUrl = buildStateUrl({
      p: [
        { n: targetNode, s: "__internals__" },
        { n: targetNode, s: "LiveDocumentationConfig" },
        { n: targetNode, s: "normalizeLiveDocumentationConfig" },
        { n: targetNode, s: "DEFAULT_LIVE_DOCUMENTATION_CONFIG" },
      ],
    });

    await page.goto(stateUrl);
    await waitForPinActiveSettle(page);

    // The focal overlay SVG should exist and contain connection paths
    // between pinned symbols (liveDocumentationConfig.ts has many importers)
    const svgPathCount = await page.evaluate(() => {
      const svg = document.querySelector(".membrane-focal-svg");
      if (!svg) return 0;
      return svg.querySelectorAll("path").length;
    });

    expect(
      svgPathCount,
      "A densely-connected pinned node should produce SVG connection paths in the focal overlay",
    ).toBeGreaterThan(0);

    // All connection paths should have a non-zero bounding box
    // (catches the case where paths are drawn but invisible)
    const allPathsVisible = await page.evaluate(() => {
      const svg = document.querySelector(".membrane-focal-svg");
      if (!svg) return false;
      const paths = svg.querySelectorAll<SVGPathElement>("path");
      for (const path of paths) {
        const bbox = path.getBBox();
        if (bbox.width === 0 && bbox.height === 0) return false;
      }
      return true;
    });

    expect(
      allPathsVisible,
      "All SVG connection paths should have a non-zero bounding box",
    ).toBe(true);
  });
});
