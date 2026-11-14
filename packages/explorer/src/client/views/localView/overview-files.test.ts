import { describe, expect, it } from "vitest";

import { filesNameScale, heldIndex, overviewFilesShown, rowsFrame } from "./overview-files";

describe("files only at the overview look (the trial of 2026-11-13)", () => {
  const files = { zoomLooks: "three", cardText: "slot", overviewFiles: "files" } as const;

  it("draws files only at the overview look, with the choice made and the three looks drawn, and nowhere else", () => {
    expect(overviewFilesShown(files, "overview")).toBe(true);
    expect(overviewFilesShown(files, "connections")).toBe(false);
    expect(overviewFilesShown(files, "reading")).toBe(false);
    // The default keeps the cards' size; the ladder and growing cards have no overview look of their own.
    expect(overviewFilesShown({ ...files, overviewFiles: "keep" }, "overview")).toBe(false);
    expect(overviewFilesShown({ ...files, zoomLooks: "stepped" }, "overview")).toBe(false);
    expect(overviewFilesShown({ ...files, cardText: "grow" }, "overview")).toBe(false);
  });

  it("holds the element under the pointer, else the one nearest the frame's centre, never one with no box", () => {
    const boxes = [
      { left: 0, top: 0, width: 100, height: 50 },
      { left: 400, top: 300, width: 100, height: 50 },
      { left: 440, top: 310, width: 0, height: 0 },
      { left: 200, top: 100, width: 100, height: 50 }
    ];
    const centre = { x: 450, y: 325 };
    expect(heldIndex(boxes, { x: 250, y: 120 }, centre)).toBe(3);
    // A pointer over no box, or none at all, holds the box nearest the centre; the empty box at the centre is not drawn.
    expect(heldIndex(boxes, { x: 900, y: 900 }, centre)).toBe(1);
    expect(heldIndex(boxes, null, centre)).toBe(1);
    expect(heldIndex(boxes, null, { x: 0, y: 0 })).toBe(0);
    expect(heldIndex([], null, centre)).toBe(-1);
  });

  it("holds a compact card's name at the overview's size unless a segment would not fit across, never below the connections look's", () => {
    // A room of 300 across holds an 80-wide segment at the overview's 3.6.
    expect(filesNameScale(300, 80)).toBe(3.6);
    // A 100-wide segment fits only up to 3.0, rounded down to the thousandth.
    expect(filesNameScale(300, 100)).toBe(3);
    expect(filesNameScale(301, 90)).toBe(3.344);
    // A segment too wide even at the connections look's 2.2 stays at 2.2 and breaks as it must.
    expect(filesNameScale(100, 90)).toBe(2.2);
    // Nothing measured keeps the overview's size.
    expect(filesNameScale(300, 0)).toBe(3.6);
    expect(filesNameScale(0, 50)).toBe(3.6);
  });

  it("has Fit frame the picture with its rows from either layout, so that a second press changes nothing", () => {
    const content = { left: 10, top: 20, width: 1800, height: 780, right: 1810, bottom: 800 };
    // The compact picture shown, 801 tall, where its rows' picture is 1748: the frame grows by the difference, downwards.
    const framed = rowsFrame(content, { width: 1849, height: 801 }, { width: 1849, height: 1748 });
    expect(framed).toEqual({ left: 10, top: 20, width: 1800, height: 1727, right: 1810, bottom: 1747 });
    // Shown with its rows, or with no rows' size known, the content is framed as it is.
    expect(rowsFrame(content, { width: 1849, height: 1748 }, null)).toBe(content);
    // A compact picture is never framed smaller than it stands.
    expect(rowsFrame(content, { width: 1849, height: 801 }, { width: 1800, height: 700 })).toEqual(content);
  });
});
