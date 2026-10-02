import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import { generateLiveDocs } from "@live-documentation/generator/generator";

it("keeps sample roles and connects a catalog through its nested compiler JSON to real source files", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sample-metadata-"));
  const files: Record<string, string> = {
    "tests/samples/catalog.json": JSON.stringify({ variants: [{ entryPoint: "demo/src/main.ts", compilerEdges: "demo/expected/compiler-edges.json" }] }),
    "tests/samples/demo/src/main.ts": 'import { value } from "./value"; export const answer = value;',
    "tests/samples/demo/src/value.ts": "export const value = 42;",
    "tests/samples/demo/src/value.test.ts": 'import { value } from "./value"; export const observed = value;',
    "tests/samples/demo/expected/compiler-edges.json": JSON.stringify({
      documents: ["../src/main.ts", "../src/value.ts", "../src/value.test.ts"],
      edges: [{ from: "../src/main.ts", to: "../src/value.ts", symbols: ["opaque compiler identifier"] }]
    })
  };
  try {
    for (const [name, content] of Object.entries(files)) {
      const target = path.join(root, name);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content);
    }
    const config = normalizeLiveDocumentationConfig({ glob: ["**/*.ts", "**/*.json"], sampleRoots: ["tests/samples"] });
    await generateLiveDocs({ workspaceRoot: root, config, logger: { info: () => undefined, warn: () => undefined, error: message => { throw new Error(message); } } });
    const graph = await readLiveDocGraph({ workspaceRoot: root, config });
    expect(graph.files["tests/samples/demo/src/main.ts"].archetype).toBe("implementation");
    expect(graph.files["tests/samples/demo/src/value.test.ts"].archetype).toBe("test");
    expect(graph.files["tests/samples/catalog.json"].archetype).toBe("asset");
    expect(graph.files["tests/samples/demo/expected/compiler-edges.json"].archetype).toBe("asset");
    expect(graph.files["tests/samples/catalog.json"].outbound).toEqual([
      "tests/samples/demo/expected/compiler-edges.json", "tests/samples/demo/src/main.ts"
    ]);
    expect(graph.files["tests/samples/demo/expected/compiler-edges.json"].outbound).toEqual([
      "tests/samples/demo/src/main.ts", "tests/samples/demo/src/value.test.ts", "tests/samples/demo/src/value.ts"
    ]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
