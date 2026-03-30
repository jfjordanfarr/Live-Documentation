import { Page } from "@playwright/test";

// ─── Containment violation types ─────────────────────────────────────────────

export interface ContainmentViolation {
  cardId: string;
  membraneId: string;
  overflow: { top: number; right: number; bottom: number; left: number };
}

// ─── Navigation helpers ──────────────────────────────────────────────────────

/** Navigate to the Membrane Map view and wait for the treemap to render. */
export async function goToMembraneMap(page: Page): Promise<void> {
  await page.goto("/");
  await page.waitForSelector("text=nodes", { timeout: 10_000 });
  await page.locator('.nav-item[data-view="membrane"]').click();
  await page.waitForSelector(".membrane-browse-root, .pin-active-root", {
    timeout: 10_000,
  });
}

/** Click a collapsed membrane tile by its data-id to expand/focus it. */
export async function expandDirectory(
  page: Page,
  dirId: string,
): Promise<void> {
  const tile = page.locator(`.membrane--collapsed[data-id="${dirId}"]`);
  await tile.waitFor({ state: "visible", timeout: 5_000 });
  await tile.click();
  await page.waitForTimeout(500);
}

/** Click the pin-all button on a card identified by data-id. */
export async function pinAllOnCard(
  page: Page,
  nodeId: string,
): Promise<void> {
  const card = page.locator(`.membrane-card[data-id="${nodeId}"]`);
  await card.waitFor({ state: "visible", timeout: 5_000 });
  await card.locator('[title="Pin all symbols"]').click();
  await page.waitForTimeout(600);
}

// ─── Measurement helpers ─────────────────────────────────────────────────────

/**
 * Bounding-box containment check for all cards within their parent membranes.
 * Returns violations where a card extends beyond its membrane by > tolerancePx.
 */
export async function findContainmentViolations(
  page: Page,
  tolerancePx = 2,
): Promise<ContainmentViolation[]> {
  return page.evaluate((tolerance) => {
    const violations: Array<{
      cardId: string;
      membraneId: string;
      overflow: { top: number; right: number; bottom: number; left: number };
    }> = [];

    // ── Browse Mode ──
    const membranes =
      document.querySelectorAll<HTMLElement>(".membrane[data-id]");
    for (const membrane of membranes) {
      const membraneRect = membrane.getBoundingClientRect();
      const membraneId = membrane.dataset.id ?? "(unknown)";
      if (membraneRect.width === 0 || membraneRect.height === 0) continue;

      const cards = membrane.querySelectorAll<HTMLElement>(
        ":scope > .membrane__content .membrane-card[data-id], " +
          ":scope > .membrane__content .membrane-leaf[data-id], " +
          ":scope > .membrane__card-grid .membrane-card[data-id]",
      );

      for (const card of cards) {
        const cardRect = card.getBoundingClientRect();
        const cardId = card.dataset.id ?? "(unknown)";
        if (cardRect.width === 0 || cardRect.height === 0) continue;

        const overflow = {
          top: Math.max(0, membraneRect.top - cardRect.top),
          right: Math.max(0, cardRect.right - membraneRect.right),
          bottom: Math.max(0, cardRect.bottom - membraneRect.bottom),
          left: Math.max(0, membraneRect.left - cardRect.left),
        };

        if (
          overflow.top > tolerance ||
          overflow.right > tolerance ||
          overflow.bottom > tolerance ||
          overflow.left > tolerance
        ) {
          violations.push({ cardId, membraneId, overflow });
        }
      }
    }

    // ── Pin-Active Mode ──
    const bands =
      document.querySelectorAll<HTMLElement>(".pa-band-membrane[data-id]");
    for (const band of bands) {
      const bandRect = band.getBoundingClientRect();
      const bandId = band.dataset.id ?? "(unknown)";
      if (bandRect.width === 0 || bandRect.height === 0) continue;

      const cards =
        band.querySelectorAll<HTMLElement>(".pin-active-card[data-id]");
      for (const card of cards) {
        const closestBand = card.closest(".pa-band-membrane[data-id]");
        if (closestBand !== band) continue;

        const cardRect = card.getBoundingClientRect();
        const cardId = card.dataset.id ?? "(unknown)";
        if (cardRect.width === 0 || cardRect.height === 0) continue;

        const overflow = {
          top: Math.max(0, bandRect.top - cardRect.top),
          right: Math.max(0, cardRect.right - bandRect.right),
          bottom: Math.max(0, cardRect.bottom - bandRect.bottom),
          left: Math.max(0, bandRect.left - cardRect.left),
        };

        if (
          overflow.top > tolerance ||
          overflow.right > tolerance ||
          overflow.bottom > tolerance ||
          overflow.left > tolerance
        ) {
          violations.push({ cardId, membraneId: bandId, overflow });
        }
      }
    }

    return violations;
  }, tolerancePx);
}

/** Format containment violations into a readable string. */
export function formatViolations(violations: ContainmentViolation[]): string {
  return violations
    .map(
      (v) =>
        `  Card "${v.cardId}" overflows membrane "${v.membraneId}" by ` +
        `T:${v.overflow.top.toFixed(1)} R:${v.overflow.right.toFixed(1)} ` +
        `B:${v.overflow.bottom.toFixed(1)} L:${v.overflow.left.toFixed(1)}px`,
    )
    .join("\n");
}

/**
 * Measure font-size of text elements inside membranes.
 * Returns a map from selector description to computed font-size in px.
 */
export async function measureFontSizes(
  page: Page,
  selector: string,
): Promise<number[]> {
  return page.evaluate((sel) => {
    const els = document.querySelectorAll<HTMLElement>(sel);
    return Array.from(els)
      .map((el) => parseFloat(getComputedStyle(el).fontSize))
      .filter((n) => !isNaN(n) && n > 0);
  }, selector);
}

/**
 * Get computed opacity for all elements matching a selector.
 * Returns an array of { id, opacity } objects.
 */
export async function measureOpacities(
  page: Page,
  selector: string,
): Promise<Array<{ id: string; opacity: number }>> {
  return page.evaluate((sel) => {
    const els = document.querySelectorAll<HTMLElement>(sel);
    return Array.from(els).map((el) => ({
      id: el.dataset.id || el.dataset.symbol || el.textContent?.trim().slice(0, 40) || "(unknown)",
      opacity: parseFloat(getComputedStyle(el).opacity),
    }));
  }, selector);
}

/**
 * Count elements matching a selector.
 */
export async function countElements(
  page: Page,
  selector: string,
): Promise<number> {
  return page.evaluate(
    (sel) => document.querySelectorAll(sel).length,
    selector,
  );
}

/**
 * Get the bounding rect of the first element matching a selector.
 */
export async function getRect(
  page: Page,
  selector: string,
): Promise<DOMRect | null> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, right: r.right, bottom: r.bottom, left: r.left } as DOMRect;
  }, selector);
}
