import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const folder = path.resolve(__dirname, "..", ".devcontainer");
const variant = path.join(folder, "wsl2-graphics-card");

/** Reads a devcontainer.json, which allows comments, with TypeScript's own reader of such files. */
function configuration(file: string): Record<string, unknown> {
  const parsed = ts.parseConfigFileTextToJson(file, readFileSync(file, "utf8"));
  expect(parsed.error, `${file} parses`).toBeUndefined();
  return parsed.config as Record<string, unknown>;
}

describe("the devcontainer with the host's graphics card", () => {
  it("is the ordinary devcontainer plus its name and the run arguments that pass the card in", () => {
    const { name: ordinaryName, ...ordinary } = configuration(path.join(folder, "devcontainer.json"));
    const { name: variantName, runArgs, ...withCard } = configuration(path.join(variant, "devcontainer.json"));
    expect(withCard).toEqual(ordinary);
    expect(variantName).not.toEqual(ordinaryName);
    expect(runArgs).toEqual(["--device=/dev/dxg", "--volume=/usr/lib/wsl:/usr/lib/wsl:ro"]);
  });

  it("pins the same feature versions", () => {
    expect(readFileSync(path.join(variant, "devcontainer-lock.json"), "utf8")).toBe(readFileSync(path.join(folder, "devcontainer-lock.json"), "utf8"));
  });
});
