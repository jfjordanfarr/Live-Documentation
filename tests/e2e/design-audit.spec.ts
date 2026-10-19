import { expect, test, type Page } from "@playwright/test";

import { textBoxes, truncations } from "./design-audit";

/** A browser fixture for the audit itself: no Explorer bundle or CSS is involved. */
const HTML = `
  <style>
    body { font: 20px/24px Arial, sans-serif; }
    .case { margin: 20px; }
    #own-width, #scaled-width { display: block; width: 80px; overflow: hidden; white-space: nowrap; }
    #parent-width, #scrollport { width: 80px; overflow: hidden; }
    #parent-width .child, #scrollport .child { width: 520px; white-space: nowrap; }
    #fully-clipped-parent { width: 80px; height: 24px; overflow: hidden; position: relative; }
    #fully-clipped-parent .child { position: absolute; left: 100px; top: 0; width: 120px; white-space: nowrap; }
    #scrollport { overflow: auto; }
    #own-height { width: 180px; height: 20px; overflow: hidden; }
    #parent-height { width: 180px; height: 20px; overflow: hidden; }
    #parent-height .child { width: 180px; height: 60px; }
    #wrapped { width: 150px; overflow: hidden; transform: scale(.75); transform-origin: left top; }
    #scaled-width { transform: scale(.5); transform-origin: left top; }
    #faded { opacity: .1; width: 80px; overflow: hidden; white-space: nowrap; }
    #closed-container, #expanded-container, #nested-faded, #nested-visible { width: 120px; overflow: hidden; white-space: nowrap; }
    #closed-container details, #expanded-container details { width: 520px; }
    #nested-faded .outer, #nested-visible .outer { opacity: .5; }
    #nested-faded .inner { opacity: .3; }
    #nested-visible .inner { opacity: .5; }
    #pan-frame { width: 80px; height: 24px; overflow: hidden; }
    #pan-frame .child { width: 520px; white-space: nowrap; transform: translateX(-40px); }
    #nested-y-outer, #inner-y-outer, #orthogonal-outer { width: 180px; height: 48px; overflow: hidden; }
    #cut-y-outer { width: 180px; height: 28px; overflow: hidden; }
    #nested-y-scroll, #cut-y-scroll, #inner-y-scroll, #orthogonal-scroll { width: 180px; height: 48px; overflow-x: hidden; overflow-y: auto; }
    .y-entry { height: 24px; line-height: 24px; }
    #inner-y-cut { height: 12px; overflow: hidden; }
    #orthogonal-outer, #orthogonal-scroll { width: 80px; }
    #orthogonal-scroll .wide { width: 320px; white-space: nowrap; }
    #nested-x-outer { width: 48px; height: 28px; overflow: hidden; }
    #cut-x-outer { width: 28px; height: 28px; overflow: hidden; }
    #nested-x-scroll, #cut-x-scroll { width: 48px; height: 28px; overflow-x: auto; overflow-y: hidden; white-space: nowrap; }
    .x-entry { display: inline-block; width: 48px; height: 24px; }
  </style>
  <div class="case"><div id="own-width">A long line clipped by its own width</div></div>
  <div class="case"><div id="parent-width"><div class="child">A line fitting the child but clipped by its parent</div></div></div>
  <div class="case"><div id="fully-clipped-parent"><div class="child">Outside</div></div></div>
  <div class="case"><div id="own-height"><span>first line</span><br><span>second line</span></div></div>
  <div class="case"><div id="parent-height"><div class="child"><span>first line</span><br><span>second line</span></div></div></div>
  <div class="case"><div id="wrapped">These words wrap onto another line within their own box.</div></div>
  <div class="case"><div id="scaled-width">A long scaled line clipped by its own width</div></div>
  <div class="case"><div id="scrollport"><div class="child">A long line that a reader can reach by scrolling</div></div></div>
  <div class="case"><div class="view-container" id="pan-frame"><div class="child">A long line that a reader can reach by panning</div></div></div>
  <div class="case"><div id="nested-y-outer"><div id="nested-y-scroll"><div class="y-entry">Visible row</div><div class="y-entry">Second row</div><div class="y-entry offscreen">Third row</div><div class="y-entry offscreen">Fourth row</div></div></div></div>
  <div class="case"><div id="cut-y-outer"><div id="cut-y-scroll"><div class="y-entry">First row</div><div class="y-entry exposed">Exposed row</div><div class="y-entry">Offscreen row</div></div></div></div>
  <div class="case"><div id="inner-y-outer"><div id="inner-y-scroll"><div id="inner-y-cut">Inner cut</div><div class="y-entry">Second row</div><div class="y-entry">Third row</div></div></div></div>
  <div class="case"><div id="orthogonal-outer"><div id="orthogonal-scroll"><div class="y-entry wide">A long line clipped across the scroll direction</div><div class="y-entry">Second row</div><div class="y-entry">Third row</div></div></div></div>
  <div class="case"><div id="nested-x-outer"><div id="nested-x-scroll"><span class="x-entry">one</span><span class="x-entry offscreen">two</span><span class="x-entry offscreen">last</span></div></div></div>
  <div class="case"><div id="cut-x-outer"><div id="cut-x-scroll"><span class="x-entry exposed">wide</span><span class="x-entry">next</span></div></div></div>
  <div class="case"><div id="display-none" style="display:none;width:80px;overflow:hidden;white-space:nowrap">Hidden by display</div></div>
  <div class="case"><div id="visibility-hidden" style="visibility:hidden;width:80px;overflow:hidden;white-space:nowrap">Hidden by visibility</div></div>
  <div class="case"><div id="faded">Faded below the audit's visibility floor</div></div>
  <div class="case"><details><summary>Closed group</summary><div id="closed-details" style="width:80px;overflow:hidden;white-space:nowrap">Hidden under closed details</div></details></div>
  <div class="case"><div id="closed-container"><details><summary>Closed</summary><div>Hidden detail text much wider than the selected container</div></details></div></div>
  <div class="case"><div id="expanded-container"><details open><summary>Expanded</summary><div>Visible detail text much wider than the selected container</div></details></div></div>
  <div class="case"><div id="nested-faded"><span class="outer"><span class="inner">Combined opacity hides this very long line of text</span></span></div></div>
  <div class="case"><div id="nested-visible"><span class="outer"><span class="inner">Combined opacity leaves this very long line visible</span></span></div></div>
`;

test.beforeEach(async ({ page }) => { await page.setContent(HTML); });

/** The actual rendered text fragments and the element/parent bounds, independent of the audit's verdict. */
async function geometry(page: Page, selector: string) {
  return page.evaluate(sel => {
    const node = document.querySelector<HTMLElement>(sel)!;
    const own = node.getBoundingClientRect(), parent = node.parentElement!.getBoundingClientRect();
    const rects: Array<{ left: number; right: number; top: number; bottom: number }> = [];
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    for (let text = walker.nextNode(); text; text = walker.nextNode()) {
      if (!(text.textContent ?? "").trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(text);
      for (const rect of range.getClientRects()) rects.push({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom });
    }
    return { own: { left: own.left, right: own.right, top: own.top, bottom: own.bottom },
      parent: { left: parent.left, right: parent.right, top: parent.top, bottom: parent.bottom }, rects };
  }, selector);
}

test("finds a line clipped by its own width", async ({ page }) => {
  const selector = "#own-width";
  await expect(page.locator(selector)).toHaveCount(1);
  expect(await textBoxes(page, [selector])).not.toHaveLength(0);
  const { own, rects } = await geometry(page, selector);
  expect(rects[0].right).toBeGreaterThan(own.right + 100);
  const faults = await truncations(page, [selector]);
  expect(faults).toHaveLength(1);
  expect(faults[0].hidden).toBeGreaterThan(100);
});

test("finds text that fits its child but is clipped by a narrower parent", async ({ page }) => {
  const selector = "#parent-width .child";
  await expect(page.locator(selector)).toHaveCount(1);
  expect(await textBoxes(page, [selector])).not.toHaveLength(0);
  const { own, parent, rects } = await geometry(page, selector);
  expect(rects[0].right).toBeLessThan(own.right);
  expect(rects[0].right).toBeGreaterThan(parent.right + 100);
  const faults = await truncations(page, [selector]);
  expect(faults).toHaveLength(1);
  expect(faults[0].hidden).toBeGreaterThan(100);
});

test("does not waive a selected label wholly clipped by its parent", async ({ page }) => {
  const selector = "#fully-clipped-parent .child";
  await expect(page.locator(selector)).toHaveCount(1);
  expect(await textBoxes(page, [selector])).not.toHaveLength(0);
  const { own, parent, rects } = await geometry(page, selector);
  expect(rects[0].right).toBeLessThan(own.right);
  expect(rects[0].left).toBeGreaterThan(parent.right + 10);
  expect((await truncations(page, [selector])).length).toBe(1);
});

test("finds lines clipped vertically by their own box or a parent", async ({ page }) => {
  for (const selector of ["#own-height", "#parent-height .child"]) {
    await expect(page.locator(selector)).toHaveCount(1);
    expect(await textBoxes(page, [selector])).not.toHaveLength(0);
    const { own, parent, rects } = await geometry(page, selector);
    expect(rects).toHaveLength(2);
    expect(rects[1].bottom).toBeGreaterThan((selector === "#own-height" ? own : parent).bottom + 10);
    const faults = await truncations(page, [selector]);
    expect(faults, selector).toHaveLength(1);
    expect(faults[0].hidden).toBeGreaterThan(10);
  }
});

test("allows complete wrapping and measures scaled clipping in screen pixels", async ({ page }) => {
  await expect(page.locator("#wrapped")).toContainText("wrap onto another line");
  const wrapped = await geometry(page, "#wrapped");
  expect(wrapped.rects.length).toBeGreaterThan(1);
  expect(await truncations(page, ["#wrapped"])).toEqual([]);
  const scaled = await geometry(page, "#scaled-width");
  expect(scaled.rects[0].right).toBeGreaterThan(scaled.own.right + 20);
  const faults = await truncations(page, ["#scaled-width"]);
  expect(faults).toHaveLength(1);
  expect(faults[0].hidden).toBeGreaterThan(20);
});

test("leaves scrollports, panning frames and deliberately hidden content out of the audit", async ({ page }) => {
  const scroll = await geometry(page, "#scrollport .child");
  expect(scroll.rects[0].right).toBeGreaterThan(scroll.parent.right + 100);
  const pan = await geometry(page, "#pan-frame .child");
  expect(pan.rects[0].right).toBeGreaterThan(pan.parent.right + 100);
  for (const selector of ["#scrollport", "#scrollport .child", "#pan-frame .child", "#display-none", "#visibility-hidden", "#faded", "#closed-details"]) {
    await expect(page.locator(selector)).toHaveCount(1);
    expect(await truncations(page, [selector]), selector).toEqual([]);
  }
});

test("a selected container ignores its closed details body but audits the same body when expanded", async ({ page }) => {
  for (const selector of ["#closed-container", "#expanded-container"]) {
    await expect(page.locator(selector)).toHaveCount(1);
    const { own, rects } = await geometry(page, selector);
    expect(rects.some(rect => rect.right > own.right + 100), selector).toBe(true);
  }
  expect(await truncations(page, ["#closed-container"])).toEqual([]);
  expect(await truncations(page, ["#expanded-container"])).toHaveLength(1);
});

test("nested descendant opacity uses the same cumulative visibility floor as ancestors", async ({ page }) => {
  for (const selector of ["#nested-faded", "#nested-visible"]) {
    await expect(page.locator(selector)).toHaveCount(1);
    const { own, rects } = await geometry(page, selector);
    expect(rects[0].right, selector).toBeGreaterThan(own.right + 100);
  }
  expect(await truncations(page, ["#nested-faded"])).toEqual([]);
  expect(await truncations(page, ["#nested-visible"])).toHaveLength(1);
});

test("a vertical scrollport limits outer clipping checks to its exposed rows", async ({ page }) => {
  const offscreen = await geometry(page, "#nested-y-scroll .offscreen");
  const outerBottom = await page.locator("#nested-y-outer").evaluate(node => node.getBoundingClientRect().bottom);
  expect(offscreen.rects[0].top).toBeGreaterThanOrEqual(outerBottom);
  expect(await truncations(page, ["#nested-y-scroll", "#nested-y-scroll .offscreen"])).toEqual([]);

  const exposed = await geometry(page, "#cut-y-scroll .exposed");
  const cutBottom = await page.locator("#cut-y-outer").evaluate(node => node.getBoundingClientRect().bottom);
  expect(exposed.rects[0].top).toBeLessThan(cutBottom);
  expect(exposed.rects[0].bottom).toBeGreaterThan(cutBottom + 10);
  const cut = await truncations(page, ["#cut-y-scroll .exposed"]);
  expect(cut).toHaveLength(1);
  expect(cut[0].hidden).toBeGreaterThan(10);
});

test("a horizontal scrollport limits outer clipping checks to its exposed columns", async ({ page }) => {
  const offscreen = await geometry(page, "#nested-x-scroll .offscreen");
  const outerRight = await page.locator("#nested-x-outer").evaluate(node => node.getBoundingClientRect().right);
  expect(offscreen.rects[0].left).toBeGreaterThanOrEqual(outerRight);
  expect(await truncations(page, ["#nested-x-scroll", "#nested-x-scroll .offscreen"])).toEqual([]);

  const exposed = await geometry(page, "#cut-x-scroll .exposed");
  const cutRight = await page.locator("#cut-x-outer").evaluate(node => node.getBoundingClientRect().right);
  expect(exposed.rects[0].left).toBeLessThan(cutRight);
  expect(exposed.rects[0].right).toBeGreaterThan(cutRight + 5);
  const cut = await truncations(page, ["#cut-x-scroll .exposed"]);
  expect(cut).toHaveLength(1);
  expect(cut[0].hidden).toBeGreaterThan(5);
});

test("inner and orthogonal clipping remain faults inside a scroll frame", async ({ page }) => {
  const inner = await geometry(page, "#inner-y-cut");
  expect(inner.rects[0].bottom).toBeGreaterThan(inner.own.bottom + 5);
  expect(await truncations(page, ["#inner-y-cut"])).toHaveLength(1);

  const orthogonal = await geometry(page, "#orthogonal-scroll .wide");
  expect(orthogonal.rects[0].right).toBeGreaterThan(orthogonal.parent.right + 100);
  expect(await truncations(page, ["#orthogonal-scroll .wide"])).toHaveLength(1);
});
