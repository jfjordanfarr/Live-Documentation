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
 * node, wait for layout to settle, capture a pixel buffer.  Then reload
 * the exact same URL, wait the same way, capture again.  The two images
 * must match — any flaky connector-before-settle race will cause pixel
 * drift between the two captures.
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

test.describe("Membrane Map — Pin-Active Visual Stability", () => {
  test("pin-active layout is pixel-stable across page reload", async ({
    page,
  }) => {
    // Seed a pin-active state for liveDocumentationConfig.ts
    // using __internals__ (the catch-all pin symbol) plus a few named symbols
    const targetNode = "packages/shared/src/config/liveDocumentationConfig.ts";
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

    const screenshot1 = await page.screenshot({ type: "png" });

    // ── Reload and second render ─────────────────────────────────
    await page.reload();
    await waitForPinActiveSettle(page);

    const screenshot2 = await page.screenshot({ type: "png" });

    // ── Compare pixel buffers ────────────────────────────────────
    // Both buffers are PNG-encoded; Playwright's toMatchSnapshot
    // doesn't support comparing two runtime buffers, so we compare
    // the raw byte length first (different layouts produce different
    // PNG sizes) and then do a pixel-level diff via Buffer.compare.
    //
    // A strict byte-equality check catches even sub-pixel connector
    // drift: if an SVG path renders 1px differently due to a race,
    // the PNG stream will differ.
    expect(
      screenshot1.length,
      "Pixel buffer sizes should be identical across renders " +
        `(got ${screenshot1.length} vs ${screenshot2.length})`,
    ).toBe(screenshot2.length);

    // Byte-for-byte comparison
    const pixelDiff = Buffer.compare(screenshot1, screenshot2);
    expect(
      pixelDiff,
      "Pixel buffers should be byte-identical across page reload " +
        "(connector paths may be drawing before nodes settle)",
    ).toBe(0);
  });

  test("pin-active SVG connections are present after settling", async ({
    page,
  }) => {
    const targetNode = "packages/shared/src/config/liveDocumentationConfig.ts";
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
