import { describe, expect, it } from "vitest";

import { closeDirectory, directoryState, NO_OPEN_DIRECTORIES, openDirectory, under } from "./directory-state";

describe("the opened directories", () => {
  it("opens a directory once and closes it with everything opened under it", () => {
    const one = openDirectory(NO_OPEN_DIRECTORIES, "a");
    expect([...one]).toEqual(["a"]);
    expect(openDirectory(one, "a")).toBe(one);
    const three = openDirectory(openDirectory(one, "a/b"), "c");
    expect([...closeDirectory(three, "a")].sort()).toEqual(["c"]);
    expect(closeDirectory(three, "x")).toBe(three);
    expect([...closeDirectory(three, "a/b")].sort()).toEqual(["a", "c"]);
  });

  it("tells a path under a directory from one beside it, and puts everything under the scan root", () => {
    expect(under("a/b/c.ts", "a/b")).toBe(true);
    expect(under("a/b", "a/b")).toBe(true);
    expect(under("a/bc/d.ts", "a/b")).toBe(false);
    expect(under("x.ts", "")).toBe(true);
  });

  it("is open when opened, encasing when a party file or an opened directory stands under it, else closed", () => {
    const opened = new Set(["a/b"]);
    const party = ["c/d.ts"];
    expect(directoryState("a/b", opened, party)).toBe("open");
    expect(directoryState("a", opened, party)).toBe("encasing");
    expect(directoryState("c", opened, party)).toBe("encasing");
    expect(directoryState("c/d", opened, party)).toBe("closed");
    expect(directoryState("e", opened, party)).toBe("closed");
    expect(directoryState("", opened, [])).toBe("encasing");
  });
});
