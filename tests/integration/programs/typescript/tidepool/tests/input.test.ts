import { readCommand } from "../src/input";

describe("readCommand", () => {
  it("reads the space bar as feeding", () => {
    expect(readCommand(" ")).toEqual({ kind: "feed" });
  });

  it("ignores keys that mean nothing", () => {
    expect(readCommand("q")).toBeUndefined();
  });
});
