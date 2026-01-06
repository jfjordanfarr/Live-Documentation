import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import { describe, expect, it, beforeEach, afterEach } from "vitest";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  LIVE_DOCUMENTATION_FILE_EXTENSION,
  normalizeLiveDocumentationConfig
} from "@live-documentation/shared/config/liveDocumentationConfig";

import { generateSystemLiveDocs } from "./generator";

const DEFAULT_LIVE_DOC_ROOT = DEFAULT_LIVE_DOCUMENTATION_CONFIG.root;
const DEFAULT_LIVE_DOC_LAYER = DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer;

describe("generateSystemLiveDocs", () => {
  let workspaceRoot: string;

  const withExtension = (relativePath: string): string =>
    `${relativePath}${LIVE_DOCUMENTATION_FILE_EXTENSION}`;

  const stage0DocPath = (...segments: string[]): string => {
    if (segments.length === 0) {
      throw new Error("stage0DocPath requires at least one segment");
    }
    const parts = segments.slice(0, -1);
    const last = segments[segments.length - 1];
    return path.join(
      workspaceRoot,
      DEFAULT_LIVE_DOC_ROOT,
      DEFAULT_LIVE_DOC_LAYER,
      ...parts,
      `${last}${LIVE_DOCUMENTATION_FILE_EXTENSION}`
    );
  };

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "system-live-docs-"));
    await fs.mkdir(path.join(workspaceRoot, DEFAULT_LIVE_DOC_ROOT, DEFAULT_LIVE_DOC_LAYER, "packages", "server", "src", "features", "live-docs", "generation"), { recursive: true });
    await fs.mkdir(path.join(workspaceRoot, DEFAULT_LIVE_DOC_ROOT, DEFAULT_LIVE_DOC_LAYER, "scripts", "live-docs"), { recursive: true });
    await fs.mkdir(path.join(workspaceRoot, DEFAULT_LIVE_DOC_ROOT, DEFAULT_LIVE_DOC_LAYER, "tests", "live-docs"), { recursive: true });
    await fs.mkdir(path.join(workspaceRoot, "data", "live-docs"), { recursive: true });

    await writeStage0Doc(
      stage0DocPath(
        "packages",
        "server",
        "src",
        "features",
        "live-docs",
        "generator.ts"
      ),
      {
        codePath: "packages/server/src/features/live-docs/generator.ts",
        liveDocId: "LD-implementation-packages-server-src-features-live-docs-generator-ts",
        dependencies: [withExtension("../../../../shared/src/live-docs/core.ts")],
        publicSymbols: ["generateLiveDocs"],
        extraDependencies: ["node:fs"]
      }
    );

    await writeStage0Doc(
      stage0DocPath(
        "packages",
        "shared",
        "src",
        "live-docs",
        "core.ts"
      ),
      {
        codePath: "packages/shared/src/live-docs/core.ts",
        liveDocId: "LD-implementation-packages-shared-src-live-docs-core-ts",
        dependencies: [],
        publicSymbols: ["analyze"],
        extraDependencies: []
      }
    );

    await writeStage0Doc(
      stage0DocPath("scripts", "live-docs", "generate.ts"),
      {
        codePath: "scripts/live-docs/generate.ts",
        liveDocId: "LD-implementation-scripts-live-docs-generate-ts",
        dependencies: [withExtension("../../packages/server/src/features/live-docs/generator.ts")],
        publicSymbols: ["main"],
        extraDependencies: []
      }
    );

    await writeStage0Doc(
      stage0DocPath("scripts", "live-docs", "run-all.ts"),
      {
        codePath: "scripts/live-docs/run-all.ts",
        liveDocId: "LD-implementation-scripts-live-docs-run-all-ts",
        dependencies: [
          withExtension("./generate.ts"),
          withExtension("../../packages/server/src/features/live-docs/generator.ts")
        ],
        publicSymbols: ["main"],
        extraDependencies: []
      }
    );

    await writeStage0Doc(
      stage0DocPath("tests", "live-docs", "run-all.test.ts"),
      {
        codePath: "tests/live-docs/run-all.test.ts",
        liveDocId: "LD-test-tests-live-docs-run-all-test-ts",
        dependencies: [withExtension("../../scripts/live-docs/run-all.ts")],
        publicSymbols: ["shouldRun"],
        archetype: "test",
        extraDependencies: []
      }
    );

    const manifestPath = path.join(workspaceRoot, "data", "live-docs", "targets.json");
    const manifestPayload = {
      version: 1,
      suites: [
        {
          suite: "Sample",
          kind: "unit",
          tests: [
            {
              path: "tests/live-docs/run-all.test.ts",
              targets: [
                "scripts/live-docs/run-all.ts",
                "packages/server/src/features/live-docs/generator.ts"
              ],
              fixtures: []
            },
            {
              path: "packages/extension/src/commands/analyzeWithAI.test.ts",
              targets: [
                "scripts/live-docs/run-all.ts"
              ],
              fixtures: []
            }
          ]
        }
      ]
    };
    await fs.writeFile(manifestPath, JSON.stringify(manifestPayload, null, 2), "utf8");
  });

  afterEach(async () => {
    if (workspaceRoot) {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("emits Layer 3 docs with component, interaction, workflow, and testing topology", async () => {
    const config = normalizeLiveDocumentationConfig({
      ...DEFAULT_LIVE_DOCUMENTATION_CONFIG
    });

    const result = await generateSystemLiveDocs({
      workspaceRoot,
      config,
      dryRun: false
    });

    expect(result.processed).toBeGreaterThan(0);
    expect(result.deleted).toBe(0);
    expect(result.deletedFiles).toHaveLength(0);

    const componentRecord = result.files.find(
      (record) => record.archetype === "component" && record.id.includes("packagesserversrcfeatureslivedocs")
    );
    expect(componentRecord).toBeDefined();
    const componentDocPath = path.join(workspaceRoot, componentRecord!.docPath);
    const componentDoc = await fs.readFile(componentDocPath, "utf8");
    expect(componentDoc).toContain(`# ${componentRecord!.id} – Live Docs Component`);
    expect(componentDoc).toContain("- Layer: 3");
    expect(componentDoc).toContain("- Archetype: component");
    expect(componentDoc).not.toContain("Code Path:");
    expect(componentDoc).toContain("### Components");
    expect(componentDoc).toContain("packages/server/src/features/live-docs/generator.ts");
    expect(componentDoc).toContain("```mermaid\ngraph TD");

    const interactionRecord = result.files.find(
      (record) => record.archetype === "interaction" && record.id.includes("generatets")
    );
    expect(interactionRecord).toBeDefined();
    const interactionDoc = await fs.readFile(path.join(workspaceRoot, interactionRecord!.docPath), "utf8");
  expect(interactionDoc).toMatch(new RegExp(`# ${interactionRecord!.id} – Generate(\\.ts)? Interaction`));
  expect(interactionDoc).toContain("scripts/live-docs/generate.ts");
  expect(interactionDoc).toContain("packages/server/src/features/live-docs/generator.ts");

    const workflowRecord = result.files.find(
      (record) => record.archetype === "workflow" && record.id.includes("runallts")
    );
    expect(workflowRecord).toBeDefined();
    const workflowDoc = await fs.readFile(path.join(workspaceRoot, workflowRecord!.docPath), "utf8");
  expect(workflowDoc).toMatch(new RegExp(`# ${workflowRecord!.id} – Run All(\\.ts)? Workflow`));
    expect(workflowDoc).toContain("click");

    const testingRecord = result.files.find((record) => record.archetype === "testing");
    expect(testingRecord).toBeDefined();
    const testingDoc = await fs.readFile(path.join(workspaceRoot, testingRecord!.docPath), "utf8");
    expect(testingDoc).toContain("# TEST-live-docs-coverage – Live Docs Coverage");
    expect(testingDoc).toContain("tests/live-docs/run-all.test.ts");
    expect(testingDoc).toContain("scripts/live-docs/run-all.ts");
    expect(testingDoc).toContain("Extension Suites (1)");
  });
});

interface Stage0DocOptions {
  codePath: string;
  liveDocId: string;
  dependencies: string[];
  publicSymbols: string[];
  archetype?: string;
  extraDependencies: string[];
}

async function writeStage0Doc(targetPath: string, options: Stage0DocOptions): Promise<void> {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  const dependencyLines = options.dependencies
    .map((entry) => `- [link](${entry})`)
    .concat(options.extraDependencies.map((entry) => `- \`${entry}\``));

  const symbolLines = options.publicSymbols.map((symbol) => [
    `#### \`${symbol}\``,
    "- Type: function"
  ].join("\n"));

  const doc = [
    `# ${options.codePath}`,
    "",
    "## Metadata",
    "- Layer: 4",
    `- Archetype: ${options.archetype ?? "implementation"}`,
    `- Code Path: ${options.codePath}`,
    `- Live Doc ID: ${options.liveDocId}`,
    "",
    "## Authored",
    "### Purpose",
    "Pending",
    "",
    "### Notes",
    "Pending",
    "",
    "## Generated",
    "<!-- LIVE-DOC:BEGIN Public Symbols -->",
    "### Public Symbols",
    ...symbolLines,
    "<!-- LIVE-DOC:END Public Symbols -->",
    "",
    "<!-- LIVE-DOC:BEGIN Dependencies -->",
    "### Dependencies",
    ...dependencyLines,
    "<!-- LIVE-DOC:END Dependencies -->"
  ].join("\n");

  await fs.writeFile(targetPath, doc, "utf8");
}