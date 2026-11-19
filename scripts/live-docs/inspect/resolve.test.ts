/**
 * How `inspect` finds the file a person names, held to how a person on
 * Windows names one: in any case, with backslashes, or by its doc's path.
 * The cold run of 2026-11-19 found `--from public/Get-DbaDbView.ps1` answered
 * and `--from PUBLIC/get-dbadbview.ps1` refused.
 */
import path from "node:path";
import { describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

import { UsageError } from "../cli";
import { resolveArtifactIdentifier, resolveSymbolReference } from "./resolve";

const workspaceRoot = path.resolve("/work/dbatools");
const config = normalizeLiveDocumentationConfig({});

/** A graph of the files named, each with its doc under the default root; nothing else of a graph is read here. */
function graphOf(...codePaths: string[]): LiveDocGraph {
  const files = Object.fromEntries(codePaths.map((codePath) => [codePath, { codePath, docPath: `.live-documentation/source/${codePath}.md` }]));
  return { files } as unknown as LiveDocGraph;
}

describe("resolveArtifactIdentifier", () => {
  const graph = graphOf("public/Get-DbaDbView.ps1", "private/Stop-Function.ps1");

  it("finds a file by its path as written, with backslashes, or by its doc", () => {
    expect(resolveArtifactIdentifier("public/Get-DbaDbView.ps1", workspaceRoot, config, graph)).toBe("public/Get-DbaDbView.ps1");
    expect(resolveArtifactIdentifier("public\\Get-DbaDbView.ps1", workspaceRoot, config, graph)).toBe("public/Get-DbaDbView.ps1");
    expect(resolveArtifactIdentifier(".live-documentation/source/public/Get-DbaDbView.ps1.md", workspaceRoot, config, graph)).toBe("public/Get-DbaDbView.ps1");
  });

  it("finds a file named in another case, by its path or its doc's", () => {
    expect(resolveArtifactIdentifier("PUBLIC/get-dbadbview.ps1", workspaceRoot, config, graph)).toBe("public/Get-DbaDbView.ps1");
    expect(resolveArtifactIdentifier("Private\\STOP-FUNCTION.PS1", workspaceRoot, config, graph)).toBe("private/Stop-Function.ps1");
    expect(resolveArtifactIdentifier(".Live-Documentation/Source/public/get-dbadbview.ps1.md", workspaceRoot, config, graph)).toBe("public/Get-DbaDbView.ps1");
    expect(resolveSymbolReference("public/get-dbadbview.ps1#Get-DbaDbView", workspaceRoot, config, graph)).toEqual({ codePath: "public/Get-DbaDbView.ps1", symbol: "Get-DbaDbView" });
  });

  it("prefers the file named exactly, and refuses a name two files answer to in different cases", () => {
    const twins = graphOf("src/Readme.ts", "src/readme.ts");
    expect(resolveArtifactIdentifier("src/readme.ts", workspaceRoot, config, twins)).toBe("src/readme.ts");
    expect(() => resolveArtifactIdentifier("src/README.ts", workspaceRoot, config, twins)).toThrow(UsageError);
    expect(() => resolveArtifactIdentifier("src/README.ts", workspaceRoot, config, twins)).toThrow("src/README.ts names 2 files that differ only in case: src/Readme.ts, src/readme.ts; give one as it is spelled.");
  });

  it("finds nothing for a file the graph does not hold", () => {
    expect(resolveArtifactIdentifier("public/Get-DbaDbViews.ps1", workspaceRoot, config, graph)).toBeUndefined();
  });
});
