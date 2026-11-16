import { expect, test, type Browser, type Page } from "@playwright/test";

import { overlapsAmong, textBoxes } from "./design-audit";
import { LOCAL_MAP, localMapSettled } from "./still-picture";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";

/**
 * The Descriptions Zoomed Out trial (2026-11-13): with "First line, where the name leaves room", the connections look
 * keeps the first line of a description shown at reading size under a name that takes one line there, held at the
 * look's size and cut with an ellipsis; a name on two lines keeps its room, no box changes, the overview look is as it
 * was, and nothing collides. Under this machine's font lines and Segoe UI's.
 *
 * And the two forms the owner asked to see (2026-11-15: "the only reason it doesn't look quite as good in these
 * screenshots is because the symbol name itself is willing to wrap onto a new line"): with "First line always", every
 * described row keeps its line and its name holds to one, cut at its end or in its middle at a seam where it does not
 * fit, the whole name still the row's text, label and tooltip; a row whose description is folded keeps its lines; the
 * file's own line stands under its name where its Purpose is on and the header holds it; and no box and no row's place
 * moves between Hidden and any value.
 */

const SEGOE_LINES = ["400", "700"].map(weight => `@font-face { font-family: "Segoe UI"; font-weight: ${weight}; src: local("DejaVu Sans${weight === "700" ? " Bold" : ""}"); ascent-override: 107.9%; descent-override: 25.1%; line-gap-override: 0%; }`).join(" ");
const SUBJECT = "scripts/doc-tools/documentationLinks.ts";

async function still(page: Page): Promise<void> {
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await localMapSettled(page);
  await page.waitForTimeout(500);
}

type Choice = "hidden" | "first-line" | "line-end" | "line-middle";

/**
 * The subject with some of its reading choices made, its Purpose folded or some symbols' descriptions folded, in a link
 * that says the choice too: a link that carries a state shows the defaults for what it does not say, whatever the browser
 * remembers.
 */
const withReading = (reading: { nodeId: string; symbol?: string; open: boolean }[], choice: Choice): string =>
  `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: SUBJECT, reading,
    ...(choice === "hidden" ? {} : { layout: { localMap: { descriptionsZoomedOut: choice } } }) })}`;

async function visit(browser: Browser, choice: Choice, lines: "fallback" | "segoe", presses: number, address = `/?view=local&node=${SUBJECT}`) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    // Zoomed Out Fully is chosen as "Cards keep their size", so that the case of the overview look reads rows: files only,
    // its default since 2026-11-15, lays none out there.
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, descriptionsZoomedOut: choice, overviewFiles: "keep" } } })
  });
  if (lines === "segoe") await context.addInitScript(css => {
    const add = (): void => { const style = document.createElement("style"); style.textContent = css; document.documentElement.appendChild(style); };
    if (document.documentElement) add(); else document.addEventListener("readystatechange", add, { once: true });
  }, SEGOE_LINES);
  const page = await context.newPage();
  await page.goto(address);
  await page.locator(`.node-card[data-id="${SUBJECT}"]`).waitFor({ timeout: 60_000 });
  await still(page);
  for (let press = 0; press < presses; press += 1) {
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await still(page);
  }
  await page.mouse.move(5, 895);
  return { context, page };
}

/** The subject card's box and, for each of its rows, its name's drawn top, its kept line's text if drawn, and its lines. */
async function reading(page: Page) {
  return page.evaluate(subject => {
    const card = document.querySelector<HTMLElement>(`.node-card[data-id="${subject}"]`)!;
    const box = card.getBoundingClientRect();
    const rows = [...card.querySelectorAll<HTMLElement>(".symbol-row:not(.internals-row)")].filter(row => row.offsetParent !== null || row.getClientRects().length).map(row => {
      const name = row.querySelector<HTMLElement>(".symbol-label-text")!.getBoundingClientRect();
      const kept = row.querySelector<HTMLElement>(".local-row-kept");
      const drawn = kept && getComputedStyle(kept).display !== "none" ? kept : null;
      const keptRect = drawn?.getBoundingClientRect();
      return {
        symbol: row.dataset.symbol ?? "",
        nameTop: Number(name.top.toFixed(1)),
        nameHeight: name.height,
        lines: Number(getComputedStyle(row).getPropertyValue("--row-lines-connections")) || 1,
        described: !row.classList.contains("local-row-short") && !!kept?.textContent,
        kept: drawn ? { text: drawn.textContent ?? "", top: keptRect!.top, bottom: keptRect!.bottom, height: keptRect!.height, cut: drawn.scrollWidth > drawn.clientWidth + 1, nameBottom: name.bottom } : null
      };
    });
    return { box: [box.x, box.y, box.width, box.height].map(value => Number(value.toFixed(1))), rows };
  }, SUBJECT);
}

for (const lines of ["fallback", "segoe"] as const) {
  test(`three presses out a described name on one line keeps its description's first line, and nothing else changes (${lines})`, async ({ browser }) => {
    test.setTimeout(180_000);
    const off = await visit(browser, "hidden", lines, 3);
    await expect(off.page.locator("#map-container")).toHaveAttribute("data-lod", "far");
    const before = await reading(off.page);
    expect(before.rows.every(row => row.kept === null)).toBe(true);
    await off.context.close();

    const on = await visit(browser, "first-line", lines, 3);
    const after = await reading(on.page);
    // No box changes.
    expect(after.box).toEqual(before.box);
    const kept = after.rows.filter(row => row.kept);
    expect(kept.length).toBeGreaterThan(0);
    for (const row of after.rows) {
      // Only a described row whose name takes one line keeps a line, and every such row does where the card holds it.
      if (row.kept) {
        expect(row.described, row.symbol).toBe(true);
        expect(row.lines, row.symbol).toBe(1);
        // Under its name, at the name's held size: a line as tall as the name's.
        expect(row.kept.top).toBeGreaterThanOrEqual(row.kept.nameBottom - 1);
        expect(row.kept.height).toBeGreaterThan(row.nameHeight * 0.9);
        expect(row.kept.text.length).toBeGreaterThan(10);
      } else if (row.lines > 1) expect(row.kept).toBeNull();
    }
    // A name on two lines keeps its room: the same lines off and on.
    expect(after.rows.map(row => row.lines)).toEqual(before.rows.map(row => row.lines));
    // Long descriptions are cut with an ellipsis rather than wrapped.
    expect(kept.some(row => row.kept!.cut)).toBe(true);
    // Nothing collides: the kept lines are read with the map's text.
    const boxes = await textBoxes(on.page, [...LOCAL_MAP.text, "#view-map .local-row-kept"]);
    expect(overlapsAmong(boxes)).toEqual([]);
    await on.context.close();
  });
}

test("the overview look is as it was with the first line kept", async ({ browser }) => {
  test.setTimeout(180_000);
  const off = await visit(browser, "hidden", "fallback", 7);
  await expect(off.page.locator("#map-container")).toHaveAttribute("data-lod", "overview");
  const before = await reading(off.page);
  await off.context.close();
  const on = await visit(browser, "first-line", "fallback", 7);
  const after = await reading(on.page);
  expect(after).toEqual(before);
  expect(after.rows.every(row => row.kept === null)).toBe(true);
  await on.context.close();
});

/**
 * The picture three presses out as the layout made it and as the look draws the subject's names: every card's box and
 * every row's place in the map's own units; and for each of the subject's rows its name (the text's own characters, what
 * is drawn of it, its lines, whether anything of it is clipped unsaid, the button's label and tooltip), its kept line,
 * and the file's own line.
 */
const picture = (page: Page) => page.evaluate(subject => {
  const root = document.querySelector("#map-container .local-placed")!;
  const offsetIn = (element: HTMLElement, stop: Element): { x: number; y: number } => {
    let x = 0, y = 0;
    for (let at: HTMLElement | null = element; at && at !== stop; at = at.offsetParent as HTMLElement | null) { x += at.offsetLeft; y += at.offsetTop; }
    return { x, y };
  };
  const cards = Object.fromEntries([...document.querySelectorAll<HTMLElement>("#map-container .node-card")].map(card => {
    const at = offsetIn(card, root);
    return [card.dataset.id!, { box: `${at.x},${at.y} ${card.offsetWidth}x${card.offsetHeight}`,
      rows: [...card.querySelectorAll<HTMLElement>(".symbol-row")].filter(row => row.offsetParent).map(row => `${row.dataset.symbol} ${row.offsetTop} ${row.offsetHeight}`) }];
  }));
  const wires = [...document.querySelectorAll<SVGElement>("#map-connections .connection-path")].filter(path => getComputedStyle(path).display !== "none")
    .map(path => `${[...path.classList].sort().join(".")} ${path.dataset.targetId}#${path.dataset.targetSymbol} -> ${path.dataset.sourceId}#${path.dataset.sourceSymbol}`).sort();
  const card = document.querySelector<HTMLElement>(`.node-card[data-id="${subject}"]`)!;
  const canvas = document.createElement("canvas").getContext("2d")!;
  const shownLine = (element: HTMLElement | null) => {
    if (!element || getComputedStyle(element).display === "none") return null;
    const rect = element.getBoundingClientRect();
    return { text: element.textContent ?? "", top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, cut: element.scrollWidth > element.clientWidth + 1,
      ellipsis: getComputedStyle(element).textOverflow, colour: getComputedStyle(element).color };
  };
  const rows = [...card.querySelectorAll<HTMLElement>(".symbol-row:not(.internals-row)")].filter(row => row.offsetParent).map(row => {
    const text = row.querySelector<HTMLElement>(".symbol-label-text")!, label = row.querySelector<HTMLElement>(".symbol-label")!, style = getComputedStyle(text);
    const rect = text.getBoundingClientRect(), drawn = text.dataset.nameCut ?? null;
    canvas.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return {
      symbol: row.dataset.symbol ?? "", characters: text.textContent ?? "", drawn, cutClass: row.classList.contains("local-name-cut"),
      // What is drawn of a cut name, as wide as the text's own font draws it, against the room its box has.
      drawnWidth: drawn ? canvas.measureText(drawn).width : null, room: text.clientWidth,
      // The audit's own word on a name's seams, independent of the code under test: before a capital that follows a small
      // letter or a digit, and after a dot, a hyphen or an underscore. The least a middle cut at seams could draw is the
      // name's first piece and its last about the ellipsis: where the name has a piece between them, its width.
      seams: (() => {
        const name = text.textContent ?? "", seams: number[] = [];
        for (let at = 1; at < name.length; at += 1) if ((/[A-Z]/u.test(name[at]) && /[a-z0-9]/u.test(name[at - 1])) || /[._-]/u.test(name[at - 1])) seams.push(at);
        return { at: seams, leastMiddle: seams.length > 1 ? canvas.measureText(`${name.slice(0, seams[0])}…${name.slice(seams[seams.length - 1])}`).width : null };
      })(),
      painted: style.webkitTextFillColor, lines: Number(getComputedStyle(row).getPropertyValue("--row-lines-connections")) || 1,
      clipped: text.scrollWidth > text.clientWidth + 1 || text.scrollHeight > text.clientHeight + 1,
      label: label.getAttribute("aria-label") ?? "", title: label.getAttribute("title"), colour: style.color,
      // The row's head as drawn: its name, its More, its dots and its kept line.
      head: (() => {
        const parts = [...row.querySelectorAll<HTMLElement>(".symbol-label-text, .local-symbol-more, .symbol-anchor.dot, .local-row-kept")]
          .filter(part => getComputedStyle(part).display !== "none" && getComputedStyle(part).visibility === "visible" && part.getBoundingClientRect().height > 0).map(part => part.getBoundingClientRect());
        return { top: Math.min(...parts.map(part => part.top)), bottom: Math.max(...parts.map(part => part.bottom)) };
      })(),
      nameTop: rect.top, nameBottom: rect.bottom, described: !row.classList.contains("local-row-short") && !!row.querySelector(".local-row-kept")?.textContent,
      kept: shownLine(row.querySelector<HTMLElement>(".local-row-kept"))
    };
  });
  const heldName = card.querySelector<HTMLElement>(".local-file-name-held")!.getBoundingClientRect();
  return { cards, wires, rows, file: { line: shownLine(card.querySelector<HTMLElement>(":scope > .local-file-kept")), short: card.dataset.fileKeptShort ?? "", nameBottom: heldName.bottom,
    firstRowTop: rows[0]?.nameTop ?? Infinity, cardRight: card.getBoundingClientRect().right } };
}, SUBJECT);

for (const lines of ["fallback", "segoe"] as const) for (const choice of ["line-end", "line-middle"] as const) {
  test(`three presses out every described row keeps its line and its name holds to one, ${choice === "line-end" ? "cut at its end" : "cut in its middle at a seam"} (${lines})`, async ({ browser }) => {
    test.setTimeout(240_000);
    const off = await visit(browser, "hidden", lines, 3);
    const before = await picture(off.page);
    expect(before.rows.every(row => row.kept === null && row.drawn === null)).toBe(true);
    expect(before.rows.filter(row => row.lines > 1).length, "hidden, some names of this card take two lines").toBeGreaterThan(3);
    await off.context.close();

    const on = await visit(browser, choice, lines, 3);
    await expect(on.page.locator("#map-container")).toHaveAttribute("data-look", "connections");
    const after = await picture(on.page);
    // No card's box and no row's place moves, and the same wires are drawn.
    expect(after.cards).toEqual(before.cards);
    expect(after.wires).toEqual(before.wires);
    const described = after.rows.filter(row => row.described);
    expect(described.length).toBeGreaterThan(5);
    for (const row of after.rows) {
      const where = row.symbol;
      // The whole name stays the row's own text, its button's label, and its tooltip where the drawing is cut.
      expect.soft(row.characters, where).toBe(row.symbol);
      expect.soft(row.label, where).toContain(row.symbol);
      if (!row.described) {
        // A row whose description is absent keeps today's name and no line.
        expect.soft(row.kept, `${where}: no line without a description`).toBeNull();
        expect.soft(row.drawn, where).toBeNull();
        continue;
      }
      expect.soft(row.kept, `${where}: a described row keeps its line`).not.toBeNull();
      expect.soft(row.lines, `${where}: its name holds to one line`).toBe(1);
      if (row.kept) {
        expect.soft(row.kept.top, `${where}: the line stands under the name`).toBeGreaterThanOrEqual(row.nameBottom - 1);
        expect.soft(row.kept.text.length, where).toBeGreaterThan(10);
        expect.soft(row.kept.ellipsis, `${where}: a long line is cut with an ellipsis`).toBe("ellipsis");
        // Prose's tone, quieter than the name's.
        expect.soft(row.kept.colour, `${where}: the line is prose`).not.toBe(row.colour);
      }
      if (row.drawn === null) {
        // A name that fits is untouched: painted as it is, and nothing of it clipped.
        expect.soft(row.cutClass, where).toBe(false);
        expect.soft(row.clipped, `${where}: a name that is not cut is whole`).toBe(false);
        expect.soft(row.title, where).toBeNull();
        continue;
      }
      expect.soft(row.cutClass, where).toBe(true);
      expect.soft(row.title, `${where}: the tooltip says the whole name`).toBe(row.symbol);
      expect.soft(row.drawn, `${where}: a cut is said with an ellipsis`).toContain("…");
      expect.soft(row.drawnWidth!, `${where}: what is drawn fits the name's room`).toBeLessThanOrEqual(row.room + 0.5);
      expect.soft(row.painted, `${where}: the text under the drawing is not painted`).toMatch(/rgba\(0, 0, 0, 0\)|transparent/u);
      const [start, end] = row.drawn.split("…");
      expect.soft(row.symbol.startsWith(start), `${where}: its start is the name's`).toBe(true);
      if (choice === "line-end") expect.soft(end, `${where}: cut at its end`).toBe("");
      else if (end) {
        // Cut in its middle: its end is the name's, and both pieces end at a seam of the name.
        expect.soft(row.symbol.endsWith(end), `${where}: its end is the name's`).toBe(true);
        expect.soft(row.seams.at, `${where}: its start ends at a seam`).toContain(start.length);
        expect.soft(row.seams.at, `${where}: its end starts at a seam`).toContain(row.symbol.length - end.length);
      } else {
        // Cut at its end though the middle was asked: only where its first and last pieces do not fit together at a seam.
        expect.soft(row.seams.leastMiddle === null || row.seams.leastMiddle > row.room + 0.5, `${where}: no cut at its seams fits its room`).toBe(true);
      }
    }
    expect(after.rows.filter(row => row.drawn !== null).length, "some names of this card are cut").toBeGreaterThan(3);
    if (choice === "line-middle") expect(after.rows.filter(row => row.drawn?.split("…")[1]).length, "most are cut in their middle").toBeGreaterThan(5);
    // Nothing collides: the kept lines and the file's line are read with the map's text.
    const boxes = await textBoxes(on.page, [...LOCAL_MAP.text, "#view-map .local-row-kept", "#view-map .local-file-kept"]);
    expect(overlapsAmong(boxes)).toEqual([]);
    await on.context.close();
  });
}

test("the file's own line stands under its name where its Purpose is on and the header holds it, and nowhere else", async ({ browser }) => {
  test.setTimeout(240_000);
  // Hidden: none.
  const off = await visit(browser, "hidden", "segoe", 3);
  expect((await picture(off.page)).file.line).toBeNull();
  await off.context.close();
  // Any value that keeps lines, the Purpose shown at reading size: the line, under the held name and above the first row.
  for (const choice of ["first-line", "line-end", "line-middle"] as const) {
    const on = await visit(browser, choice, "segoe", 3);
    const { file } = await picture(on.page);
    expect(file.line, choice).not.toBeNull();
    expect(file.line!.text.length).toBeGreaterThan(10);
    expect(file.line!.top, `${choice}: under the file's name`).toBeGreaterThanOrEqual(file.nameBottom - 1);
    expect(file.line!.bottom, `${choice}: above the first row's name`).toBeLessThanOrEqual(file.firstRowTop + 1);
    expect(file.line!.right, `${choice}: inside the card`).toBeLessThanOrEqual(file.cardRight);
    expect(file.line!.ellipsis).toBe("ellipsis");
    await on.context.close();
  }
  // The file's book folded: its Purpose and its symbols' descriptions are folded with it, so this card keeps no line, the
  // file's or a row's, though the choice keeps lines; the cards beside it, their books on, keep theirs.
  const folded = await visit(browser, "line-end", "segoe", 3, withReading([{ nodeId: SUBJECT, open: false }], "line-end"));
  const without = await picture(folded.page);
  expect(without.file.line, "no line for a folded Purpose").toBeNull();
  expect(without.rows.filter(row => row.kept).length, "no row of a folded card keeps a line").toBe(0);
  const beside = `#map-container .node-card:not([data-id="${SUBJECT}"])`;
  expect(await folded.page.locator(`${beside}.local-file-kept-on`).count(), "the cards beside it keep their files' lines").toBeGreaterThan(0);
  expect(await folded.page.locator(`${beside} .symbol-row.local-row-kept-on`).count(), "and their rows' lines").toBeGreaterThan(0);
  await folded.context.close();
});

test("with half the descriptions folded, every described row keeps its line, a folded row has none and its name is not cut in drawing, and the heads stand at even gaps", async ({ browser }) => {
  test.setTimeout(240_000);
  const folds = ["DEFAULT_RULES", "DocumentationLinkEnforcementResult", "DocumentationDocumentAnchors", "formatDocumentationLinkComment", "DocumentationTargetMap"];
  const address = (choice: Choice): string => withReading(folds.map(symbol => ({ nodeId: SUBJECT, symbol, open: false })), choice);
  const off = await visit(browser, "hidden", "segoe", 3, address("hidden"));
  const before = await picture(off.page);
  await off.context.close();
  const on = await visit(browser, "line-middle", "segoe", 3, address("line-middle"));
  const after = await picture(on.page);
  expect(after.cards).toEqual(before.cards);
  for (const row of after.rows) {
    if (folds.includes(row.symbol)) {
      expect.soft(row.described, row.symbol).toBe(false);
      expect.soft(row.kept, `${row.symbol}: folded, no line`).toBeNull();
      expect.soft(row.drawn, `${row.symbol}: folded, its name as it was`).toBeNull();
      // Its name keeps its lines where the card has the room, and never has more than without the choice.
      expect.soft(row.lines, row.symbol).toBeLessThanOrEqual(before.rows.find(each => each.symbol === row.symbol)!.lines);
    } else if (row.described) expect.soft(row.kept, `${row.symbol}: described, its line kept`).not.toBeNull();
  }
  // A described row keeps its line before a folded row keeps its name's second: here the card is short of holding both
  // for every row, and one folded name at most gives a line up.
  const gaveUp = after.rows.filter(row => folds.includes(row.symbol) && row.lines < before.rows.find(each => each.symbol === row.symbol)!.lines);
  expect(gaveUp.length, `folded names that gave up a line: ${gaveUp.map(row => row.symbol).join(", ")}`).toBeLessThanOrEqual(1);
  expect(after.rows.filter(row => folds.includes(row.symbol)).length, "the folded rows are this card's").toBe(folds.length);
  // Every row of this card is described at reading size, so every row but the folded keeps a line.
  expect(after.rows.filter(row => row.kept !== null).length, "every row but the folded keeps a line").toBe(after.rows.length - folds.length);
  // The heads, a name with its More and dots and its kept line where it has one, stand at even gaps, as zoom-looks.spec.ts
  // reads them without a kept line: the space from one head's foot to the next head's top is the same down the card.
  const heads = after.rows.map(row => row.head).sort((a, b) => a.top - b.top);
  const gaps = heads.slice(1).map((head, index) => head.top - heads[index].bottom);
  expect(Math.max(...gaps) - Math.min(...gaps), `gaps ${gaps.map(gap => gap.toFixed(1)).join(" ")}`).toBeLessThan(2);
  await on.context.close();
});
