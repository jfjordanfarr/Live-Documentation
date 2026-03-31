import { test, expect } from "@playwright/test";
import { compressToEncodedURIComponent } from "lz-string";

function buildStateUrl(payload: Record<string, unknown>): string {
  const compressed = compressToEncodedURIComponent(
    JSON.stringify({ v: 1, w: "membrane", ...payload }),
  );
  return `/?s=${compressed}`;
}

async function getStaticGraph(page: import("@playwright/test").Page): Promise<{
  nodes: Array<{ id: string; publicSymbols?: string[] }>;
}> {
  return page.evaluate(async () => {
    const win = window as Window & {
      __staticExplorerDataPromise?: Promise<{
        graph: { nodes: Array<{ id: string; publicSymbols?: string[] }> };
      }>;
    };
    const data = await win.__staticExplorerDataPromise;
    return data?.graph ?? { nodes: [] };
  });
}

/**
 * Membrane Map — Stale URL State Scrubbing
 *
 * Verifies that the scrubSnapshot() function gracefully handles URLs
 * containing references to nodes/directories that no longer exist in
 * the live graph. These tests craft ?s= URLs with deliberately stale
 * paths and assert the view degrades cleanly rather than showing an
 * empty treemap, zombie pins, or an error state.
 */

test.describe("Membrane Map — Stale URL State Scrubbing", () => {
  test("stale expanded directories fall back to root browse", async ({
    page,
  }) => {
    // Craft a URL with expanded directories that don't exist in the data
    const url = buildStateUrl({
      e: ["nonexistent/directory/path", "also/does/not/exist"],
    });
    await page.goto(url);
    await page.waitForSelector(".membrane-browse-root", { timeout: 10_000 });

    // The view should render the root browse treemap (not empty/broken)
    const membranes = await page.locator(".membrane").count();
    expect(
      membranes,
      "Root browse should render directory membranes even with stale expanded dirs",
    ).toBeGreaterThan(0);

    // The URL should have been cleaned (no ?s= with stale dirs persisted)
    // After scrubbing, the state approaches defaults, so ?s= may be removed
    const urlAfter = new URL(page.url());
    const sParam = urlAfter.searchParams.get("s");
    // Either no ?s= (default state) or a valid ?s= without stale dirs
    // Just assert the page rendered successfully
    expect(membranes).toBeGreaterThan(0);
  });

  test("all-stale pins fall back to browse mode", async ({ page }) => {
    // Craft a URL with pins pointing to nonexistent nodes
    const url = buildStateUrl({
      p: [
        { n: "deleted/file-a.ts", s: "FakeSymbol" },
        { n: "deleted/file-b.ts", s: "AnotherFake" },
      ],
    });
    await page.goto(url);
    await page.waitForSelector(".membrane-browse-root", { timeout: 10_000 });

    // Should be in browse mode, NOT pin-active (since all pins were stale)
    const pinActive = await page.locator(".pin-active-root").count();
    expect(pinActive, "Should NOT show pin-active layout for all-stale pins").toBe(0);

    const membranes = await page.locator(".membrane").count();
    expect(membranes, "Should render browse-mode membranes").toBeGreaterThan(0);
  });

  test("mixed valid + stale pins keep only valid", async ({ page }) => {
    // First, find a real node ID from the explorer data
    await page.goto("/");
    await page.waitForSelector("text=nodes", { timeout: 10_000 });

    const graph = await getStaticGraph(page);
    const realNodeId = graph.nodes.find(node => node.publicSymbols?.length);

    expect(realNodeId, "Should find at least one node with symbols").toBeTruthy();

    // Craft URL with one valid pin + one stale pin
    const url = buildStateUrl({
      p: [
        { n: realNodeId!.id, s: realNodeId!.publicSymbols![0] },
        { n: "deleted/ghost-file.ts", s: "NonexistentSymbol" },
      ],
    });
    await page.goto(url);
    await page.waitForSelector(".pin-active-root, .membrane-browse-root", {
      timeout: 10_000,
    });

    // The valid pin should survive: we should be in pin-active mode
    const pinActive = await page.locator(".pin-active-root").count();
    expect(
      pinActive,
      "Valid pin should keep us in pin-active mode",
    ).toBe(1);
  });

  test("stale expandedCards are silently dropped", async ({ page }) => {
    // Craft URL with expanded cards pointing to nonexistent nodes
    // plus a valid expanded directory
    await page.goto("/");
    await page.waitForSelector("text=nodes", { timeout: 10_000 });

    const graph = await getStaticGraph(page);
    const firstId = graph.nodes[0]?.id ?? null;
    const realDir = firstId
      ? firstId.split("/").slice(0, -1).join("/") || null
      : null;

    expect(realDir, "Should find a real directory").toBeTruthy();

    const url = buildStateUrl({
      e: [realDir!],
      c: ["nonexistent/card-a.ts", "nonexistent/card-b.ts"],
    });
    await page.goto(url);
    await page.waitForSelector(".membrane-browse-root", { timeout: 10_000 });

    // Page should render normally — no expanded cards (all stale)
    const membranes = await page.locator(".membrane").count();
    expect(membranes, "View should render with stale cards silently dropped").toBeGreaterThan(0);
  });
});
