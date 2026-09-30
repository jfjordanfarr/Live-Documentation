import { describe, expect, it } from "vitest";

import { entryFor, type HistoryWrite } from "./history";

const move: HistoryWrite = {
  fromPlace: "a",
  toPlace: "b",
  sameUrl: false,
  armed: true,
  restoring: false,
  joining: false
};

describe("entryFor", () => {
  it("adds an entry for a move to another place once the person has touched the page", () => {
    expect(entryFor(move)).toBe("push");
  });

  it("rewrites the entry when the place is the same, as for a pin, a card or a pan", () => {
    expect(entryFor({ ...move, toPlace: "a" })).toBe("replace");
  });

  it("does nothing when the address is unchanged", () => {
    expect(entryFor({ ...move, sameUrl: true })).toBe("none");
  });

  it("never adds an entry while the page starts up or restores an entry", () => {
    expect(entryFor({ ...move, armed: false })).toBe("replace");
    expect(entryFor({ ...move, restoring: true })).toBe("replace");
  });

  it("joins a write made in the same task as a new entry to it, so one click is one step back", () => {
    expect(entryFor({ ...move, joining: true })).toBe("replace");
  });
});
