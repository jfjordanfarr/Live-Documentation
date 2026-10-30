import { expect, test, type Page } from "@playwright/test";

import { clearStroke, observeGraph, renderedLinks, renderedNodes } from "./force-graph-observation";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { seamBefore } from "../../packages/explorer/src/client/views/localView/word-seams";

/**
 * Labels and controls (the October 23 review's findings 8, 11, 14 and 16; built 2026-10-30): a name wraps only at a
 * seam of its own, a count stays with its unit and agrees with it, the toolbar's buttons stand in groups parted by
 * rules with one choice on in each, the navigation's three views each carry an icon and the application's name is
 * whole, the 3D canvas carries no hint, and the wire tooltip stands clear of every name.
 */
test.use({ viewport: { width: 1280, height: 800 } });

const generator = "packages/generator/src/generator.ts";
const NAMES = ".node-title, .node-path, .symbol-label, .local-directory-name, .local-directory-closed__name";

/** Cap the cards at 150 px so that long names must wrap, and the picture shows where they do. */
async function narrowCards(page: Page): Promise<void> {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY,
    value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { cardMaxWidth: 150 } } })
  });
}

interface DrawnName {
  text: string;
  /** The index of every line's first character after the first line, read from the characters' own boxes. */
  starts: number[];
  /** Each segment between soft breaks, and whether it is wider than the box that holds it, where a break inside it is the last resort. */
  segments: Array<{ start: number; end: number; over: boolean }>;
}

/** Each drawn name's lines and segments. */
async function drawnNames(page: Page, selector: string): Promise<DrawnName[]> {
  return page.evaluate(selector => {
    const result: DrawnName[] = [];
    for (const element of document.querySelectorAll<HTMLElement>(selector)) {
      const text = element.textContent ?? "";
      if (!text.trim() || !element.getClientRects().length) continue;
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      const starts: number[] = [], segments: DrawnName["segments"] = [];
      let index = 0, lastTop: number | null = null;
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const data = node.textContent ?? "", parent = node.parentElement!, style = getComputedStyle(parent);
        const limit = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        range.selectNodeContents(node);
        const width = [...range.getClientRects()].reduce((sum, box) => sum + box.width, 0);
        segments.push({ start: index, end: index + data.length, over: width > limit + 0.5 });
        for (let i = 0; i < data.length; i++) {
          range.setStart(node, i); range.setEnd(node, i + 1);
          const box = range.getBoundingClientRect();
          if (box.width || box.height) {
            if (lastTop !== null && box.top > lastTop + box.height / 2) starts.push(index);
            lastTop = box.top;
          }
          index++;
        }
      }
      result.push({ text, starts, segments });
    }
    return result;
  }, selector);
}

test("a name wraps only at its seams, and a count stays with its unit and agrees with it", async ({ page }) => {
  await narrowCards(page);
  await page.goto(`/?view=local&node=${generator}`);
  await page.locator(".local-placed").waitFor();
  const names = await drawnNames(page, NAMES);
  const wrapped = names.filter(name => name.starts.length);
  expect(wrapped.length, "names that wrap in 150 px cards").toBeGreaterThanOrEqual(3);
  let atSeams = 0;
  for (const { text, starts, segments } of wrapped) {
    for (const start of starts) {
      // A segment wider than its box breaks where it must, the stylesheet's last resort; every other break is at a seam.
      const inside = segments.find(segment => segment.start < start && start < segment.end);
      if (inside?.over) continue;
      expect(seamBefore(text, start), `${JSON.stringify(text)} breaks before index ${start}: ${JSON.stringify(text.slice(start))}`).toBe(true);
      atSeams++;
    }
  }
  expect(atSeams, "breaks at seams").toBeGreaterThanOrEqual(3);
  // A count and its unit are one word, the unit agreeing with the count, the reveal "+1 symbol" for one.
  // Every count the cards and the directory labels say, read as written: a number joined to its unit by a no-break
  // space, the unit agreeing with the number; the tests row's bare "+10" names no unit and is not one.
  const texts = await page.locator(".local-disclosure, .local-directory-more, .local-directory-closed__count").evaluateAll(elements => elements.map(element => element.textContent ?? ""));
  const counts = texts.filter(text => /\d/u.test(text) && /[a-z]/u.test(text));
  expect(counts.length, `count phrases among ${JSON.stringify(texts)}`).toBeGreaterThan(0);
  expect(counts.some(text => /^\+\d+\u00a0symbols?$/u.test(text)), "a symbol reveal").toBe(true);
  for (const phrase of counts) {
    for (const part of phrase.replace(/^\+/u, "").split(", ")) {
      const match = /^(\d+)\u00a0([a-z]+)/u.exec(part);
      expect(match, `${phrase}: a number joined to its unit`).not.toBeNull();
      const [, count, unit] = match!;
      expect(unit, phrase).toMatch(/^(symbols?|files?|director(y|ies)|references?|connections?)$/u);
      expect(unit.endsWith("s"), `${phrase}: a count of ${count} takes the plural`).toBe(Number(count) !== 1);
    }
  }
});

test("the toolbar's groups each have one choice on, parted by rules, and the 3D canvas carries no hint", async ({ page }) => {
  await page.goto("/samples/estate/?view=local&mode=3d&node=Portal/Services/GatewayClient.cs");
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25000 });
  const groups = page.locator(".perspective-controls .perspective-group:visible");
  await expect(groups).toHaveCount(4); // The estate carries no history.
  const facts = await groups.evaluateAll(elements => elements.map(element => ({
    buttons: [...element.querySelectorAll("button:not([hidden])")].map(button => button.getAttribute("aria-label") ?? button.textContent?.trim()),
    pressed: element.querySelectorAll('button[aria-pressed="true"]').length,
    rule: getComputedStyle(element).borderLeftWidth
  })));
  expect(facts.map(group => group.buttons)).toEqual([["Fit current scope"], ["Compact", "Relaxed", "Layout tuning"], ["2D", "3D"], ["Connections", "Structure"]]);
  expect(facts.map(group => group.pressed)).toEqual([0, 1, 1, 1]);
  expect(facts.map(group => group.rule)).toEqual(["0px", "1px", "1px", "1px"]);
  await expect(page.locator(".scene-nav-info")).toHaveCount(0);
  // In 2D the fit's group and the 3D layout's go with their buttons, and no rule is left standing alone.
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator(".local-placed")).toBeVisible();
  await expect(groups).toHaveCount(2);
  expect(await groups.first().evaluate(element => getComputedStyle(element).borderLeftWidth)).toBe("0px");
});

test("every view in the navigation has an icon, and the application's name is whole", async ({ page }) => {
  await page.goto(`/?view=local&node=${generator}`);
  await page.locator(".local-placed").waitFor();
  await expect(page.locator(".nav-item svg.nav-icon")).toHaveCount(3);
  const title = page.locator(".sidebar-title");
  await expect(title).toHaveText("Live Docs Explorer");
  const box = await title.evaluate(element => ({ fits: element.scrollWidth <= element.clientWidth + 1, overflow: getComputedStyle(element).overflow }));
  expect(box).toEqual({ fits: true, overflow: "visible" });
});

test("the wire tooltip stands clear of every name", async ({ page }) => {
  test.setTimeout(60_000);
  await observeGraph(page);
  await page.goto("/samples/estate/?view=local&mode=3d&node=Portal/Services/GatewayClient.cs");
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25000 });
  await page.mouse.move(5, 5);
  const nodes = await renderedNodes(page);
  const links = (await renderedLinks(page)).filter(link => link.visible && link.flow !== 2);
  const stroke = await clearStroke(page, nodes, links);
  expect(stroke, "a stroke clear of the spheres and the labels").toBeDefined();
  await page.mouse.move(stroke!.x, stroke!.y);
  const tooltip = page.locator(".spatial-wire-tooltip");
  await expect(tooltip).toBeVisible({ timeout: 5_000 });
  await expect.poll(async () => {
    const box = (await tooltip.boundingBox())!;
    const labels = await page.locator(".force-graph-label, .force-graph-focus").evaluateAll(elements => elements.map(element => element.getBoundingClientRect().toJSON() as DOMRect));
    return labels.filter(label => label.width && label.height && label.left < box.x + box.width && label.right > box.x && label.top < box.y + box.height && label.bottom > box.y).length;
  }, { message: "names under the tooltip" }).toBe(0);
});
