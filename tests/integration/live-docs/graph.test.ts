import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import { readLiveDocGraph } from "../../../packages/engine/src/live-docs/graphFiles";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const config = normalizeLiveDocumentationConfig(
  JSON.parse(fs.readFileSync(path.join(repoRoot, ".live-docs.config.json"), "utf8"))
);

/**
 * The graph of this repository, derived from its committed docs. What the
 * generator writes to `<root>/index.json` is this, serialized.
 */
describe("the graph of this repository", () => {
  it("resolves every link a doc writes to a file in the graph, and mirrors every edge inbound", async () => {
    const graph = await readLiveDocGraph({ workspaceRoot: repoRoot, config });
    const files = Object.values(graph.files);
    expect(files.length).toBeGreaterThan(0);

    const dangling = files.flatMap((file) =>
      file.edges.filter((edge) => edge.link && !edge.to).map((edge) => `${file.codePath}: ${edge.link}`)
    );
    expect(dangling).toEqual([]);

    for (const file of files) {
      for (const to of file.outbound) {
        expect(graph.files[to].inbound).toContain(file.codePath);
      }
      for (const from of file.inbound) {
        expect(graph.files[from].outbound).toContain(file.codePath);
      }
    }
  });
});
