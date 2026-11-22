import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import { LINKS_SECTION, readDocumentationReference } from "../../../packages/engine/src/live-docs/document";
import { readLiveDocGraph } from "../../../packages/engine/src/live-docs/graphFiles";
import { getNeighbors, reachability, searchGraph } from "../../../packages/engine/src/live-docs/pathfind";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const config = normalizeLiveDocumentationConfig(
  JSON.parse(fs.readFileSync(path.join(repoRoot, ".live-docs.config.json"), "utf8"))
);

/**
 * The graph of this repository, derived from its committed docs. What the
 * generator writes to `<root>/index.json` is this, serialized.
 */
describe("the graph of this repository", () => {
  it("holds the docs of hidden files, which a glob skips unless told to look", async () => {
    // Found on 2026-10-16: the generator wrote the docs of `.vscode/settings.json`, `.devcontainer/devcontainer.json`
    // and `.live-docs.config.json`, and the graph, the lint and the bundle read 719 docs of 722, since the doc
    // enumerators globbed without `dot`. Every reader of the docs folder lets hidden path segments through now.
    const graph = await readLiveDocGraph({ workspaceRoot: repoRoot, config });
    for (const hidden of [".vscode/settings.json", ".devcontainer/devcontainer.json", ".live-docs.config.json"]) {
      expect(graph.files[hidden], hidden).toBeDefined();
    }
  });

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

  it("resolves every documentation reference a doc links to a file in the graph, and mirrors each in the target's documentedBy", async () => {
    const graph = await readLiveDocGraph({ workspaceRoot: repoRoot, config });
    const files = Object.values(graph.files);
    const linked = files.flatMap((file) => file.symbols.flatMap((symbol) => symbol.sections.filter((section) => section.title === LINKS_SECTION)
      .flatMap((section) => section.body.map(readDocumentationReference).filter((reference) => reference?.link !== undefined && !/^[a-z]+:\/\//iu.test(reference.link))
        .map((reference) => `${file.codePath}: ${reference!.link}`))));
    expect(linked.length).toBeGreaterThan(0);
    expect(files.flatMap((file) => (file.documentation ?? []).map((reference) => `${file.codePath}: ${reference.link}`)).sort()).toEqual(linked.sort());
    for (const file of files) {
      for (const reference of file.documentation ?? []) {
        if (reference.to !== file.codePath) expect(graph.files[reference.to].documentedBy).toContain(file.codePath);
      }
    }
  });
});

/**
 * Root's design of 2026-11-22 for the owner's word of 2026-11-21, held: an author's documentation reference is drawn as
 * a relation of its own kind and followed by nothing that answers what the code uses. `Documented.cs` of the C# names
 * sample uses nothing in its code and names six other files in its comments.
 */
describe("an author's word in the graph of this repository", () => {
  const sample = "tests/integration/programs/csharp/names/App";
  const documented = `${sample}/Documented.cs`;
  const named = ["Base.cs", "Derived.cs", "Helper.cs", "HelperOfT.cs", "Runner.Text.cs", "Runner.cs"].map((file) => `${sample}/${file}`);

  it("holds the six files Documented.cs names, and each says it is named there", async () => {
    const graph = await readLiveDocGraph({ workspaceRoot: repoRoot, config });
    expect([...new Set((graph.files[documented].documentation ?? []).map((reference) => reference.to))].sort()).toEqual(named);
    for (const file of named) expect(graph.files[file].documentedBy).toContain(documented);
  });

  it("makes nothing it names reachable through it, and runs no path through it", async () => {
    const graph = await readLiveDocGraph({ workspaceRoot: repoRoot, config });
    expect(reachability(graph, [documented]).reached).toEqual([]);
    expect(getNeighbors(graph, documented, "outbound")).toEqual([]);
    expect(getNeighbors(graph, documented, "inbound")).toEqual([]);
    for (const file of named) {
      expect(searchGraph(graph, documented, file, "outbound", Infinity).path, file).toBeUndefined();
      expect(getNeighbors(graph, file, "inbound"), file).not.toContain(documented);
    }
  });

  it("still reports a class named only in a comment as one nothing uses", async () => {
    const graph = await readLiveDocGraph({ workspaceRoot: repoRoot, config });
    // `Lib.Helper<T>` is named by Documented.cs alone among the program's files (the compiler's kept record, a JSON
    // file, names its path, which is not the program's code): no C# file uses it, and no path from one reaches it.
    const helperOfT = `${sample}/HelperOfT.cs`;
    const csharp = Object.keys(graph.files).filter((file) => file.startsWith(`${sample}/`) && file.endsWith(".cs") && file !== helperOfT);
    expect(graph.files[helperOfT].inbound.filter((file) => file.endsWith(".cs"))).toEqual([]);
    expect(reachability(graph, csharp).reached.map((file) => file.codePath)).not.toContain(helperOfT);
  });
});
