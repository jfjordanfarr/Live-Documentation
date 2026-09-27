import * as assert from "node:assert";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { describe, it } from "vitest";

import { generateLiveDocs } from "../../../packages/generator/src/generator";
import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  LIVE_DOCUMENTATION_FILE_EXTENSION,
  normalizeLiveDocumentationConfig
} from "../../../packages/shared/src/config/liveDocumentationConfig";

const DEFAULT_LIVE_DOC_ROOT = DEFAULT_LIVE_DOCUMENTATION_CONFIG.root;
const DEFAULT_LIVE_DOC_LAYER = DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer;

describe("Live Docs evidence bridge", () => {
  const LIVE_DOC_EXTENSION_PATTERN = LIVE_DOCUMENTATION_FILE_EXTENSION.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

  async function withTempWorkspace(
    callback: (workspaceRoot: string) => Promise<void>
  ): Promise<void> {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "live-docs-evidence-"));
    try {
      await callback(workspaceRoot);
    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  }

  it("populates observed evidence and targets from coverage manifests", async () => {
    await withTempWorkspace(async (workspaceRoot) => {
      const implementationDir = path.join(workspaceRoot, "packages", "app", "src");
      await fs.mkdir(implementationDir, { recursive: true });
      const implementationFile = path.join(implementationDir, "example.ts");
      await fs.writeFile(
        implementationFile,
        [
          "export function greet(name: string): string {",
          "  return `Hello, ${name}!`;",
          "}",
          "",
          "export const GREETING = \"Hello\";"
        ].join("\n"),
        "utf8"
      );

      const testsDir = path.join(workspaceRoot, "tests", "app");
      await fs.mkdir(testsDir, { recursive: true });
      const testFile = path.join(testsDir, "example.test.ts");
      await fs.writeFile(
        testFile,
        [
          "import { describe, expect, it } from \"vitest\";",
          "import { greet } from \"../../packages/app/src/example\";",
          "",
          "describe('greet', () => {",
          "  it('returns greeting', () => {",
          "    expect(greet('World')).toBe('Hello, World!');",
          "  });",
          "});"
        ].join("\n"),
        "utf8"
      );

      const fixturesDir = path.join(testsDir, "fixtures");
      await fs.mkdir(fixturesDir, { recursive: true });
      const fixtureFile = path.join(fixturesDir, "greeting.json");
      await fs.writeFile(fixtureFile, JSON.stringify({ greeting: "Hello" }), "utf8");

      const coverageDir = path.join(workspaceRoot, "coverage");
      await fs.mkdir(path.join(coverageDir, "live-docs"), { recursive: true });

      const coverageSummaryPath = path.join(coverageDir, "coverage-summary.json");
      const coverageSummary = {
        total: {
          lines: { total: 2, covered: 2 },
          statements: { total: 2, covered: 2 },
          functions: { total: 1, covered: 1 },
          branches: { total: 0, covered: 0 }
        },
        [implementationFile]: {
          lines: { total: 2, covered: 2 },
          statements: { total: 2, covered: 2 },
          functions: { total: 1, covered: 1 },
          branches: { total: 0, covered: 0 }
        }
      };
      await fs.writeFile(coverageSummaryPath, JSON.stringify(coverageSummary, null, 2), "utf8");

      const manifestPath = path.join(coverageDir, "live-docs", "targets.json");
      const manifest = {
        version: 1,
        suites: [
          {
            suite: "Vitest",
            kind: "unit",
            tests: [
              {
                path: "tests/app/example.test.ts",
                targets: ["packages/app/src/example.ts"],
                fixtures: ["tests/app/fixtures/greeting.json"]
              }
            ]
          }
        ]
      };
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

      const config = normalizeLiveDocumentationConfig({
        ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
        glob: ["packages/**/*.ts", "tests/**/*.ts"]
      });

      await generateLiveDocs({
        workspaceRoot,
        config,
        changedOnly: false,
        dryRun: false
      });

      const implementationDoc = path.join(
        workspaceRoot,
        DEFAULT_LIVE_DOC_ROOT,
        DEFAULT_LIVE_DOC_LAYER,
        "packages",
        "app",
        "src",
        `example.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`
      );
      const implementationContent = await fs.readFile(implementationDoc, "utf8");
      assert.match(
        implementationContent,
        new RegExp(
          `Observed Evidence[\\s\\S]*Vitest[\\s\\S]*tests/app/example\\.test\\.ts${LIVE_DOC_EXTENSION_PATTERN}`
        )
      );
      assert.doesNotMatch(implementationContent, /_No automated evidence found_/);

      const testDoc = path.join(
        workspaceRoot,
        DEFAULT_LIVE_DOC_ROOT,
        DEFAULT_LIVE_DOC_LAYER,
        "tests",
        "app",
        `example.test.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`
      );
      const testContent = await fs.readFile(testDoc, "utf8");
      assert.match(
        testContent,
        new RegExp(
          `## Generated[\\s\\S]*Targets[\\s\\S]*#### Vitest[\\s\\S]*- packages/app/src: \\[example\\.ts\\]\\(.+packages/app/src/example\\.ts${LIVE_DOC_EXTENSION_PATTERN}\\)`
        )
      );
      assert.match(testContent, /Supporting Fixtures[\s\S]*tests\/app\/fixtures\/greeting\.json/);
    });
  });

  it("emits default supporting fixtures block when no fixtures are recorded", async () => {
    await withTempWorkspace(async (workspaceRoot) => {
      const implementationDir = path.join(workspaceRoot, "packages", "app", "src");
      await fs.mkdir(implementationDir, { recursive: true });
      await fs.writeFile(
        path.join(implementationDir, "example.ts"),
        [
          "export function value(): number {",
          "  return 42;",
          "}",
          ""
        ].join("\n"),
        "utf8"
      );

      const testsDir = path.join(workspaceRoot, "tests", "app");
      await fs.mkdir(testsDir, { recursive: true });
      await fs.writeFile(
        path.join(testsDir, "example.test.ts"),
        [
          "import { describe, expect, it } from \"vitest\";",
          "import { value } from \"../../packages/app/src/example\";",
          "",
          "describe('value', () => {",
          "  it('returns 42', () => {",
          "    expect(value()).toBe(42);",
          "  });",
          "});"
        ].join("\n"),
        "utf8"
      );

      const coverageDir = path.join(workspaceRoot, "coverage", "live-docs");
      await fs.mkdir(coverageDir, { recursive: true });
      await fs.writeFile(
        path.join(coverageDir, "targets.json"),
        JSON.stringify(
          {
            version: 1,
            suites: [
              {
                suite: "Vitest",
                kind: "unit",
                tests: [
                  {
                    path: "tests/app/example.test.ts",
                    targets: ["packages/app/src/example.ts"],
                    fixtures: []
                  }
                ]
              }
            ]
          },
          null,
          2
        ),
        "utf8"
      );

      const config = normalizeLiveDocumentationConfig({
        ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
        glob: ["packages/**/*.ts", "tests/**/*.ts"]
      });

      await generateLiveDocs({
        workspaceRoot,
        config,
        changedOnly: false,
        dryRun: false
      });

      const testDoc = path.join(
        workspaceRoot,
        DEFAULT_LIVE_DOC_ROOT,
        DEFAULT_LIVE_DOC_LAYER,
        "tests",
        "app",
        `example.test.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`
      );
      const testContent = await fs.readFile(testDoc, "utf8");
      assert.match(testContent, /Supporting Fixtures[\s\S]*_No supporting fixtures documented yet_/);
    });
  });

  it("omits observed evidence when no coverage or waivers are present", async () => {
    await withTempWorkspace(async (workspaceRoot) => {
      const implementationDir = path.join(workspaceRoot, "packages", "app", "src");
      await fs.mkdir(implementationDir, { recursive: true });
      const implementationFile = path.join(implementationDir, "lonely.ts");
      await fs.writeFile(
        implementationFile,
        [
          "export function lonely(): string {",
          "  return 'lonely';",
          "}",
          ""
        ].join("\n"),
        "utf8"
      );

      const config = normalizeLiveDocumentationConfig({
        ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
        glob: ["packages/**/*.ts"]
      });

      await generateLiveDocs({
        workspaceRoot,
        config,
        changedOnly: false,
        dryRun: false
      });

      const implementationDoc = path.join(
        workspaceRoot,
        DEFAULT_LIVE_DOC_ROOT,
        DEFAULT_LIVE_DOC_LAYER,
        "packages",
        "app",
        "src",
        `lonely.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`
      );
      const implementationContent = await fs.readFile(implementationDoc, "utf8");
      assert.ok(!implementationContent.includes("<!-- LIVE-DOC:BEGIN Observed Evidence -->"));
    });
  });

  it("records waiver-only evidence with explanatory comment", async () => {
    await withTempWorkspace(async (workspaceRoot) => {
      const implementationDir = path.join(workspaceRoot, "packages", "app", "src");
      await fs.mkdir(implementationDir, { recursive: true });
      const implementationFile = path.join(implementationDir, "waived.ts");
      await fs.writeFile(
        implementationFile,
        [
          "export const needsTests = true;"
        ].join("\n"),
        "utf8"
      );

      const dataDir = path.join(workspaceRoot, "data", "live-docs");
      await fs.mkdir(dataDir, { recursive: true });
      const waiversPath = path.join(dataDir, "evidence-waivers.json");
      await fs.writeFile(
        waiversPath,
        JSON.stringify(
          {
            version: 1,
            waivers: [
              {
                sourcePath: "packages/app/src/waived.ts",
                reason: "Pending integration test",
                suite: "Manual Review"
              }
            ]
          },
          null,
          2
        ),
        "utf8"
      );

      const config = normalizeLiveDocumentationConfig({
        ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
        glob: ["packages/**/*.ts"]
      });

      await generateLiveDocs({
        workspaceRoot,
        config,
        changedOnly: false,
        dryRun: false
      });

      const implementationDoc = path.join(
        workspaceRoot,
        DEFAULT_LIVE_DOC_ROOT,
        DEFAULT_LIVE_DOC_LAYER,
        "packages",
        "app",
        "src",
        `waived.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`
      );
      const implementationContent = await fs.readFile(implementationDoc, "utf8");
      assert.match(implementationContent, /<!-- LIVE-DOC:BEGIN Observed Evidence -->/);
      assert.match(implementationContent, /<!-- evidence-waived: Pending integration test -->/);
      assert.match(implementationContent, /_No automated evidence found_/);
      assert.match(implementationContent, /Waiver: Pending integration test/);
    });
  });
});
