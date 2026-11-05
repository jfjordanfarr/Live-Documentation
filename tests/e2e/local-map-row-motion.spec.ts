import { expect, test } from "@playwright/test";

import { localMapSettled } from "./still-picture";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";

const SUBJECT = "tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs";

interface RowFrame { moving: boolean; order: string[]; overlaps: number; exposed: number }

test.use({ viewport: { width: 900, height: 700 } });

for (const searching of [false, true]) {
  test(`expanded symbol text stays separate ${searching ? "while the search changes row order" : "with the search disabled"}`, async ({ page }) => {
    await page.addInitScript(({ key, version, searching, subject }) => {
      localStorage.setItem(key, JSON.stringify({ version, tuning: { localMap: { searchStarts: searching ? 32 : 0, moveMs: 1500 } } }));
      const frames: RowFrame[] = [];
      (window as unknown as { rowFrames: RowFrame[] }).rowFrames = frames;
      const opaque = (row: HTMLElement): boolean => {
        const solid = (color: string): boolean => color.startsWith("rgb(") || (color.startsWith("rgba(") && Number(color.slice(color.lastIndexOf(",") + 1, -1)) === 1);
        const surface = getComputedStyle(row, "::before");
        return solid(getComputedStyle(row).backgroundColor) || (surface.content !== "none" && solid(surface.backgroundColor));
      };
      const sample = (): void => {
        const card = document.querySelector<HTMLElement>(`.node-card[data-id="${subject}"]`);
        if (card) {
          const rows = [...card.querySelectorAll<HTMLElement>(".symbol-row:not(.branch-symbol-hidden)")];
          let overlaps = 0, exposed = 0;
          for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
            const text = (row: HTMLElement): DOMRect[] => [...row.querySelectorAll<HTMLElement>(".symbol-label-wrapper, .local-reading-block:not([hidden])")]
              .map(element => element.getBoundingClientRect()).filter(rect => rect.width && rect.height);
            for (const a of text(rows[i])) for (const b of text(rows[j])) {
              const left = Math.max(0, a.left, b.left), right = Math.min(innerWidth, a.right, b.right);
              const top = Math.max(0, a.top, b.top), bottom = Math.min(innerHeight, a.bottom, b.bottom);
              if (right - left <= 1 || bottom - top <= 1) continue;
              // A row can pass in front of another, but text from both must never paint through one another.
              const front = document.elementFromPoint((left + right) / 2, (top + bottom) / 2)?.closest<HTMLElement>(".symbol-row");
              if (front !== rows[i] && front !== rows[j]) continue;
              overlaps++;
              if (!opaque(front)) exposed++;
            }
          }
          frames.push({ moving: !!document.querySelector(".local-placed[data-moving]"), order: rows.map(row => row.dataset.symbol!), overlaps, exposed });
        }
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    }, { key: PERSISTED_UI_KEY, version: PERSISTED_UI_VERSION, searching, subject: SUBJECT });
    await page.goto(`/?view=local&node=${SUBJECT}`);
    await page.locator(`.node-card[data-id="${SUBJECT}"] .local-reading-block:visible`).first().waitFor();
    await localMapSettled(page);
    await page.waitForTimeout(400);
    const frames = await page.evaluate(() => (window as unknown as { rowFrames: RowFrame[] }).rowFrames);
    expect(frames.length).toBeGreaterThan(5);
    expect(frames.every(frame => frame.exposed === 0), "crossing explanations have an opaque foreground surface").toBe(true);
    if (searching) {
      expect(new Set(frames.map(frame => frame.order.join("|"))).size, "the fixture actually changes symbol order").toBeGreaterThan(1);
      expect(frames.filter(frame => frame.moving && frame.overlaps > 0).length, "the test observes the crossing, not only the settled picture").toBeGreaterThan(2);
    } else {
      expect(frames.every(frame => frame.overlaps === 0), "the stationary expanded rows do not overlap").toBe(true);
    }
    const remnants = await page.locator(`.node-card[data-id="${SUBJECT}"]`).evaluate(card => ({
      surfaces: card.querySelectorAll(".local-row-moving").length,
      transforms: [...card.querySelectorAll<HTMLElement>(".symbol-row, .symbol-row > *")].filter(element => element.style.transform).length
    }));
    expect(remnants).toEqual({ surfaces: 0, transforms: 0 });
  });
}
