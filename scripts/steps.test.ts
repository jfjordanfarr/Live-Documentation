import { describe, expect, it, vi } from "vitest";

import { runStep } from "./steps.mjs";

/** A step that runs one line of JavaScript in a child node. */
const node = (script: string): [string, string[]] => [process.execPath, ["-e", script]];

/** Everything the runner prints while the capture stands. */
function capturePrinted(): { printed: () => string; restore: () => void } {
  const parts: string[] = [];
  const log = vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    parts.push(`${args.join(" ")}\n`);
  });
  const write = vi.spyOn(process.stdout, "write").mockImplementation(((chunk: string | Uint8Array) => {
    parts.push(chunk.toString());
    return true;
  }) as typeof process.stdout.write);
  return {
    printed: () => parts.join(""),
    restore: () => {
      log.mockRestore();
      write.mockRestore();
    }
  };
}

describe("runStep", () => {
  it("returns when the command exits clean and throws its label and exit code otherwise", () => {
    const capture = capturePrinted();
    try {
      expect(() => runStep("clean", ...node("process.exit(0)"))).not.toThrow();
      expect(() => runStep("broken", ...node("process.exit(2)"))).toThrow("broken failed with exit code 2");
    } finally {
      capture.restore();
    }
    expect(capture.printed()).toContain("=== clean ===");
  });
});
