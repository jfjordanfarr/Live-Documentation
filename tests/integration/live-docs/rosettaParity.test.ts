/**
 * Rosetta Parity Test
 *
 * Exercises `generateLiveDocs` against all 8 Rosetta Stone fixtures (one per
 * supported language) and validates cross-language structural parity.
 *
 * Phase 1 of LD-208: Rosetta Parity Enforcement.
 *
 * **What this tests (and why no other test does)**
 *
 * The AST accuracy benchmarks compare `expected.json` (SCIP oracle) against
 * `inferred.json` (our adapters). That tests the dependency *detection* layer.
 * `polyglot-fixtures.test.ts` runs `generateLiveDocs` against 2 language-specific
 * fixtures. Neither exercises all 8 languages, and neither compares results
 * *across* languages.
 *
 * This test runs the full Live Documentation pipeline for each Rosetta fixture
 * and then compares the generated markdown **across languages**, asserting:
 *
 * 1. All source files receive a Live Doc  (file coverage)
 * 2. Public Symbols sections contain expected canonical symbol names
 * 3. Dependencies sections resolve the canonical topology
 * 4. Leaf/foundation node invariants hold (helpers has no deps, types has no deps)
 * 5. Cross-language consensus — if 6+/8 languages agree, outliers are flagged
 *
 * Created: 2026-03-11 (Dev Day 77, LD-208 Phase 1)
 */
import * as assert from "node:assert";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

const { generateLiveDocs } = require(
  path.join(
    __dirname,
    "../../../../packages/server/dist/features/live-docs/generator"
  )
) as typeof import("../../../packages/server/dist/features/live-docs/generator");

const {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  LIVE_DOCUMENTATION_FILE_EXTENSION,
  normalizeLiveDocumentationConfig
} = require(
  path.join(
    __dirname,
    "../../../../packages/shared/dist/config/liveDocumentationConfig"
  )
) as typeof import("../../../packages/shared/dist/config/liveDocumentationConfig");

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FIXTURE_ROOT = path.resolve(__dirname, "../../benchmarks/fixtures");

const DEFAULT_LIVE_DOC_ROOT = DEFAULT_LIVE_DOCUMENTATION_CONFIG.root;
const DEFAULT_LIVE_DOC_LAYER = DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer;

/**
 * Per-language Rosetta fixture configurations.
 *
 * `glob` patterns are relative to the fixture root treated as workspace root.
 * Each fixture has a `sourceDir` beneath which the canonical source files live.
 */
interface RosettaFixtureConfig {
  language: string;
  fixturePath: string;
  sourceDir: string;
  glob: string[];
}

const ROSETTA_FIXTURES: RosettaFixtureConfig[] = [
  {
    language: "typescript",
    fixturePath: "typescript/rosetta",
    sourceDir: "src",
    glob: ["src/**/*.ts"]
  },
  {
    language: "java",
    fixturePath: "java/rosetta",
    sourceDir: "src",
    glob: ["src/**/*.java"]
  },
  {
    language: "csharp",
    fixturePath: "csharp/rosetta",
    sourceDir: "src",
    glob: ["src/**/*.cs"]
  },
  {
    language: "python",
    fixturePath: "python/rosetta",
    sourceDir: "src",
    glob: ["src/**/*.py"]
  },
  {
    language: "rust",
    fixturePath: "rust/rosetta",
    sourceDir: "src",
    glob: ["src/**/*.rs"]
  },
  {
    language: "go",
    fixturePath: "go/rosetta",
    sourceDir: "src",
    glob: ["src/**/*.go"]
  },
  {
    language: "c",
    fixturePath: "c/rosetta",
    sourceDir: "src",
    glob: ["src/**/*.c", "src/**/*.h"]
  },
  {
    language: "ruby",
    fixturePath: "ruby/rosetta",
    sourceDir: "lib",
    glob: ["lib/**/*.rb", "spec/**/*.rb"]
  }
];

// ---------------------------------------------------------------------------
// Canonical program topology (from rosetta-manifest.json)
// ---------------------------------------------------------------------------

/** Canonical node identifiers shared across all 8 Rosetta implementations. */
type CanonicalNodeId =
  | "main"
  | "processor"
  | "models"
  | "types"
  | "helpers"
  | "helpers_test"
  | "processor_test"
  | "pipeline_test";

/**
 * The 12 canonical production + test edges that every Rosetta fixture must
 * express in its generated Live Documentation dependency sections.
 *
 * Derived from the TypeScript reference implementation and validated against
 * all 8 SCIP/oracle ground-truth expected.json files.
 *
 * Note: additional language-specific edges (Rust mod-system, Go same-package
 * test imports) are logged but not penalised — they represent real compiler
 * semantics, not adapter defects.
 */
const CANONICAL_EDGES: ReadonlyArray<{ from: CanonicalNodeId; to: CanonicalNodeId }> = [
  // Production edges
  { from: "main", to: "processor" },
  { from: "main", to: "models" },
  { from: "processor", to: "models" },
  { from: "processor", to: "types" },
  { from: "processor", to: "helpers" },
  { from: "models", to: "types" },
  // Test → production edges
  { from: "helpers_test", to: "helpers" },
  { from: "processor_test", to: "processor" },
  { from: "processor_test", to: "models" },
  { from: "pipeline_test", to: "processor" },
  { from: "pipeline_test", to: "models" },
  { from: "pipeline_test", to: "types" }
];

/** Nodes that must have no outgoing dependencies to other Rosetta nodes. */
const LEAF_NODES: ReadonlySet<CanonicalNodeId> = new Set(["helpers"]);
const FOUNDATION_NODES: ReadonlySet<CanonicalNodeId> = new Set(["types"]);

/**
 * Root symbol substrings that should appear in the Public Symbols section
 * of the named node's Live Doc. Case-insensitive substring matching.
 *
 * Drawn from rosetta-manifest.json `canonicalProgram.edges[].via`.
 */
const CANONICAL_SYMBOLS: ReadonlyMap<CanonicalNodeId, readonly string[]> = new Map([
  ["helpers", ["format", "sum", "average"]],
  ["processor", ["run", "summarize"]],
  ["models", ["record", "report"]],
  ["types", ["status", "entry", "processorconfig"]]
]);

// ---------------------------------------------------------------------------
// Per-fixture result structure
// ---------------------------------------------------------------------------

interface LiveDocExtract {
  /** Workspace-relative source path */
  sourcePath: string;
  /** Full content of the generated Live Doc */
  content: string;
  /** Text between the LIVE-DOC:BEGIN Public Symbols and LIVE-DOC:END Public Symbols markers */
  publicSymbolsSection: string;
  /** Text between the LIVE-DOC:BEGIN Dependencies and LIVE-DOC:END Dependencies markers */
  dependenciesSection: string;
}

interface FixtureResult {
  language: string;
  config: RosettaFixtureConfig;
  processed: number;
  liveDocs: Map<string, LiveDocExtract>;
  /** Sources classified to canonical node IDs */
  nodeMap: Map<CanonicalNodeId, LiveDocExtract[]>;
  /** Detected canonical edges (from → to) */
  detectedEdges: Set<string>;
  /** Edges detected that are not in the canonical set */
  extraEdges: Set<string>;
  /** Error if generation failed entirely */
  error?: string;
}

// ---------------------------------------------------------------------------
// Classification helpers
// ---------------------------------------------------------------------------

/** Test file patterns matching rosetta-manifest.json's test node globs. */
const TEST_PATTERNS = [
  /\.test\./i,
  /test_/i,
  /Test\./,
  /Tests\./,
  /_test\./,
  /_spec\./
];

function isTestFile(filePath: string): boolean {
  const basename = path.basename(filePath);
  return TEST_PATTERNS.some(p => p.test(basename));
}

/**
 * Classify a file path into a canonical node ID.
 *
 * Uses basename and directory components to identify the logical role,
 * handling each language's naming conventions:
 * - TypeScript: `processor.ts`, `helpers.test.ts`
 * - Java: `src/com/rosetta/processor/Processor.java`
 * - C#: `src/Processor/Processor.cs`
 * - Go: `src/processor/processor.go`
 * - Python: `test_helpers.py`, `core_types.py`
 * - C: `processor.c`, `processor.h`, `test_pipeline.c`
 * - Ruby: `lib/processor.rb`, `spec/helpers_spec.rb`
 * - Rust: `processor.rs`, `helpers_test.rs`
 */
function classifyFile(filePath: string): CanonicalNodeId | null {
  const basename = path.basename(filePath).toLowerCase();
  const dir = path.dirname(filePath).toLowerCase();
  const parts = filePath.toLowerCase().split(/[/\\]/);

  // Classify test files first
  if (isTestFile(filePath) || parts.some(p => p === "spec")) {
    if (containsKeyword(parts, basename, "helper")) return "helpers_test";
    if (containsKeyword(parts, basename, "processor")) return "processor_test";
    if (containsKeyword(parts, basename, "pipeline")) return "pipeline_test";
    return null;
  }

  // Production files — use immediate parent directory as primary signal for
  // multi-file languages (Java, C#, Go), falling back to basename for flat
  // layouts (TypeScript, Python, Rust, Ruby).
  //
  // IMPORTANT: check directory first for ambiguous basenames. E.g.,
  // "types/ProcessorConfig.java" lives in the types directory but its
  // basename contains "processor".
  const immediateDir = parts.length >= 2 ? parts[parts.length - 2] : "";
  const dirClassification = classifyByKeyword(immediateDir);
  if (dirClassification) return dirClassification;

  // Fall back to basename classification for flat layouts
  const basenameClassification = classifyByKeyword(basename);
  if (basenameClassification) return basenameClassification;

  // Last resort: scan all path segments
  for (const part of parts) {
    const partClassification = classifyByKeyword(part);
    if (partClassification) return partClassification;
  }

  return null;
}

/**
 * Map a single path segment or filename to a canonical node ID by keyword.
 * Returns null if no unambiguous match is found.
 *
 * Order matters: "main" is checked first because it's unambiguous, then other
 * production roles. "type" is checked last as it's a common substring.
 */
function classifyByKeyword(segment: string): CanonicalNodeId | null {
  if (segment.includes("main")) return "main";
  if (segment.includes("helper")) return "helpers";
  if (segment.includes("model")) return "models";
  if (segment.includes("type")) return "types";
  // "processor" checked last — only match if no other keyword matched
  // (avoids ProcessorConfig.java in types/ being misclassified)
  if (segment.includes("processor")) return "processor";
  return null;
}

/**
 * Check if any path segment or the basename contains the given keyword.
 * Matches substrings — "ModelFactory" contains "model", "core_types" contains "type".
 */
function containsKeyword(parts: string[], basename: string, keyword: string): boolean {
  return basename.includes(keyword) || parts.some(p => p.includes(keyword));
}

/**
 * Classify a dotted namespace segment to a canonical node ID using exact matching.
 *
 * Unlike `classifyByKeyword` (which uses substring matching for file paths),
 * this requires an exact match (or known alias) to avoid false positives with
 * standard library names like "ctype" matching "type".
 */
function classifyNamespaceSegment(segment: string): CanonicalNodeId | null {
  const lower = segment.toLowerCase();
  if (lower === "main" || lower === "app") return "main";
  if (lower === "helpers" || lower === "helper") return "helpers";
  if (lower === "models" || lower === "model") return "models";
  if (lower === "types" || lower === "type") return "types";
  if (lower === "processor") return "processor";
  return null;
}

// ---------------------------------------------------------------------------
// Markdown section extraction
// ---------------------------------------------------------------------------

function extractSection(content: string, sectionName: string): string {
  const beginMarker = `<!-- LIVE-DOC:BEGIN ${sectionName} -->`;
  const endMarker = `<!-- LIVE-DOC:END ${sectionName} -->`;
  const beginIdx = content.indexOf(beginMarker);
  const endIdx = content.indexOf(endMarker);
  if (beginIdx === -1 || endIdx === -1 || endIdx <= beginIdx) {
    return "";
  }
  return content.slice(beginIdx + beginMarker.length, endIdx).trim();
}

/**
 * Parse dependency targets from a Dependencies section.
 *
 * Handles two rendering forms:
 *
 * 1. **Resolved links** (TypeScript, Java, Go, Python, Rust, Ruby, C):
 *    `- [\`models.Record\`](../models.ts.md#symbol-record)`
 *    → extract relative path, classify to canonical node.
 *
 * 2. **Unresolved namespace/module refs** (C# namespace imports):
 *    `- \`Rosetta.Models\``
 *    → split on '.', classify each segment to canonical node.
 */
function extractDependencyTargets(
  depsSection: string,
  sourceDir: string
): Set<CanonicalNodeId> {
  const targets = new Set<CanonicalNodeId>();

  // Phase 1: Extract resolved markdown link targets
  const linkRegex = /\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(depsSection)) !== null) {
    const linkTarget = match[1].split("#")[0];
    const nodeId = classifyFile(linkTarget);
    if (nodeId) {
      targets.add(nodeId);
    }
  }

  // Phase 2: Extract unresolved dependency names (backtick-only entries without links)
  // Matches list items like "- `Rosetta.Models`" that have NO markdown link
  const unresolvedRegex = /^- `([^`]+)`$/gm;
  while ((match = unresolvedRegex.exec(depsSection)) !== null) {
    const depName = match[1];
    // Split dotted namespace (e.g., "Rosetta.Models") and classify each segment.
    // Use exact matching to avoid false positives (e.g., "ctype.h" ≠ "types").
    const segments = depName.split(".");
    for (const segment of segments) {
      const nodeId = classifyNamespaceSegment(segment);
      if (nodeId) {
        targets.add(nodeId);
        break; // One match per dependency line is sufficient
      }
    }
  }

  return targets;
}

// ---------------------------------------------------------------------------
// Core generation + extraction
// ---------------------------------------------------------------------------

async function generateAndExtract(fixtureConfig: RosettaFixtureConfig): Promise<FixtureResult> {
  const result: FixtureResult = {
    language: fixtureConfig.language,
    config: fixtureConfig,
    processed: 0,
    liveDocs: new Map(),
    nodeMap: new Map(),
    detectedEdges: new Set(),
    extraEdges: new Set()
  };

  const workspaceRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), `rosetta-parity-${fixtureConfig.language}-`)
  );

  try {
    const fixtureSource = path.join(FIXTURE_ROOT, fixtureConfig.fixturePath);
    await fs.cp(fixtureSource, workspaceRoot, { recursive: true });

    const config = normalizeLiveDocumentationConfig({
      ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
      glob: fixtureConfig.glob
    });

    const genResult = await generateLiveDocs({
      workspaceRoot,
      config,
      changedOnly: false,
      dryRun: false,
      now: () => new Date("2026-01-01T00:00:00.000Z")
    });

    result.processed = genResult.processed;

    // Read all generated Live Docs
    // docPath is workspace-relative; resolve against workspaceRoot
    for (const record of genResult.files) {
      if (record.change === "skipped") continue;
      const absoluteDocPath = path.resolve(workspaceRoot, record.docPath);
      const content = await fs.readFile(absoluteDocPath, "utf8");
      const extract: LiveDocExtract = {
        sourcePath: record.sourcePath,
        content,
        publicSymbolsSection: extractSection(content, "Public Symbols"),
        dependenciesSection: extractSection(content, "Dependencies")
      };
      result.liveDocs.set(record.sourcePath, extract);

      // Classify and index by canonical node
      const nodeId = classifyFile(record.sourcePath);
      if (nodeId) {
        const existing = result.nodeMap.get(nodeId) ?? [];
        existing.push(extract);
        result.nodeMap.set(nodeId, existing);
      }
    }

    // Build edge set from dependency sections
    for (const [nodeId, docs] of result.nodeMap) {
      for (const doc of docs) {
        const targets = extractDependencyTargets(
          doc.dependenciesSection,
          fixtureConfig.sourceDir
        );
        for (const target of targets) {
          const edgeKey = `${nodeId}→${target}`;
          const isCanonical = CANONICAL_EDGES.some(
            e => e.from === nodeId && e.to === target
          );
          if (isCanonical) {
            result.detectedEdges.add(edgeKey);
          } else {
            result.extraEdges.add(edgeKey);
          }
        }
      }
    }
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
  } finally {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Diagnostic formatting
// ---------------------------------------------------------------------------

function formatComparisonMatrix(results: FixtureResult[]): string {
  const lines: string[] = [];
  const canonicalEdgeKeys = CANONICAL_EDGES.map(e => `${e.from}→${e.to}`);

  lines.push("## Rosetta Parity Comparison Matrix");
  lines.push("");

  // Header
  const languages = results.map(r => r.language);
  lines.push(`| Edge | ${languages.join(" | ")} |`);
  lines.push(`| --- | ${languages.map(() => "---").join(" | ")} |`);

  for (const edgeKey of canonicalEdgeKeys) {
    const cells = results.map(r => (r.detectedEdges.has(edgeKey) ? "✅" : "❌"));
    lines.push(`| ${edgeKey} | ${cells.join(" | ")} |`);
  }

  lines.push("");
  lines.push("## Extras (language-specific, non-canonical edges)");
  lines.push("");
  for (const r of results) {
    if (r.extraEdges.size > 0) {
      lines.push(`### ${r.language}`);
      for (const edge of r.extraEdges) {
        lines.push(`- ${edge}`);
      }
      lines.push("");
    }
  }

  lines.push("## Node Coverage");
  lines.push("");
  const allNodeIds: CanonicalNodeId[] = [
    "main", "processor", "models", "types", "helpers",
    "helpers_test", "processor_test", "pipeline_test"
  ];
  lines.push(`| Node | ${languages.join(" | ")} |`);
  lines.push(`| --- | ${languages.map(() => "---").join(" | ")} |`);
  for (const nodeId of allNodeIds) {
    const cells = results.map(r => {
      const docs = r.nodeMap.get(nodeId);
      return docs && docs.length > 0 ? `${docs.length} file(s)` : "❌";
    });
    lines.push(`| ${nodeId} | ${cells.join(" | ")} |`);
  }

  lines.push("");
  lines.push("## Symbol Presence");
  lines.push("");
  for (const [nodeId, expectedSymbols] of CANONICAL_SYMBOLS) {
    lines.push(`### ${nodeId}`);
    lines.push(`| Symbol | ${languages.join(" | ")} |`);
    lines.push(`| --- | ${languages.map(() => "---").join(" | ")} |`);
    for (const sym of expectedSymbols) {
      const cells = results.map(r => {
        const docs = r.nodeMap.get(nodeId);
        if (!docs || docs.length === 0) return "❌";
        const found = docs.some(d =>
          d.publicSymbolsSection.toLowerCase().includes(sym.toLowerCase())
        );
        return found ? "✅" : "❌";
      });
      lines.push(`| ${sym} | ${cells.join(" | ")} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

suite("Rosetta Parity: cross-language Live Documentation generation", () => {
  const GENERATION_TIMEOUT = 120_000; // 2 minutes for all 8 fixtures
  let allResults: FixtureResult[] = [];

  suiteSetup(async function () {
    this.timeout(GENERATION_TIMEOUT);

    // Generate Live Docs for all 8 fixtures sequentially
    // (sequential to avoid file system contention and to isolate failures)
    for (const fixtureConfig of ROSETTA_FIXTURES) {
      const result = await generateAndExtract(fixtureConfig);
      allResults.push(result);
    }

    // Write diagnostic matrix to tmp for inspection
    const matrix = formatComparisonMatrix(allResults);
    const tmpOutput = path.resolve(
      __dirname,
      "../../../../AI-Agent-Workspace/tmp/rosetta-parity-matrix.md"
    );
    await fs.mkdir(path.dirname(tmpOutput), { recursive: true });
    await fs.writeFile(tmpOutput, matrix, "utf8");
  });

  test("all 8 fixtures generate without errors", function () {
    const failures = allResults.filter(r => r.error);
    if (failures.length > 0) {
      const details = failures.map(r => `${r.language}: ${r.error}`).join("\n");
      assert.fail(`Generation failed for ${failures.length} fixture(s):\n${details}`);
    }
  });

  test("all 8 fixtures process at least one source file", function () {
    for (const result of allResults) {
      assert.ok(
        result.processed > 0,
        `${result.language}: processed 0 files`
      );
    }
  });

  test("all 8 canonical node roles are covered in each fixture", function () {
    const allNodeIds: CanonicalNodeId[] = [
      "main", "processor", "models", "types", "helpers",
      "helpers_test", "processor_test", "pipeline_test"
    ];

    const failures: string[] = [];
    for (const result of allResults) {
      if (result.error) continue;
      for (const nodeId of allNodeIds) {
        if (!result.nodeMap.has(nodeId) || result.nodeMap.get(nodeId)!.length === 0) {
          failures.push(`${result.language}: missing node "${nodeId}"`);
        }
      }
    }

    if (failures.length > 0) {
      assert.fail(`Node coverage gaps:\n${failures.join("\n")}`);
    }
  });

  test("leaf nodes (helpers) have no outgoing production dependencies", function () {
    const violations: string[] = [];
    for (const result of allResults) {
      if (result.error) continue;
      for (const nodeId of LEAF_NODES) {
        const docs = result.nodeMap.get(nodeId);
        if (!docs) continue;
        for (const doc of docs) {
          const targets = extractDependencyTargets(doc.dependenciesSection, result.config.sourceDir);
          // Filter out self-references and test nodes
          const productionTargets = [...targets].filter(
            t => !LEAF_NODES.has(t) && !t.endsWith("_test") && t !== nodeId
          );
          if (productionTargets.length > 0) {
            violations.push(
              `${result.language}: ${nodeId} has outgoing deps to [${productionTargets.join(", ")}]`
            );
          }
        }
      }
    }

    if (violations.length > 0) {
      assert.fail(`Leaf node violations:\n${violations.join("\n")}`);
    }
  });

  test("foundation nodes (types) have no outgoing production dependencies", function () {
    const violations: string[] = [];
    for (const result of allResults) {
      if (result.error) continue;
      for (const nodeId of FOUNDATION_NODES) {
        const docs = result.nodeMap.get(nodeId);
        if (!docs) continue;
        for (const doc of docs) {
          const targets = extractDependencyTargets(doc.dependenciesSection, result.config.sourceDir);
          const productionTargets = [...targets].filter(
            t => !FOUNDATION_NODES.has(t) && !t.endsWith("_test") && t !== nodeId
          );
          if (productionTargets.length > 0) {
            violations.push(
              `${result.language}: ${nodeId} has outgoing deps to [${productionTargets.join(", ")}]`
            );
          }
        }
      }
    }

    if (violations.length > 0) {
      assert.fail(`Foundation node violations:\n${violations.join("\n")}`);
    }
  });

  test("canonical edges are detected with cross-language consensus (≥6/8)", function () {
    const CONSENSUS_THRESHOLD = 6;
    const canonicalEdgeKeys = CANONICAL_EDGES.map(e => `${e.from}→${e.to}`);
    const failures: string[] = [];

    for (const edgeKey of canonicalEdgeKeys) {
      const detected = allResults.filter(
        r => !r.error && r.detectedEdges.has(edgeKey)
      );
      if (detected.length < CONSENSUS_THRESHOLD) {
        const missing = allResults
          .filter(r => !r.error && !r.detectedEdges.has(edgeKey))
          .map(r => r.language);
        failures.push(
          `${edgeKey}: detected in ${detected.length}/${allResults.length} ` +
          `(missing: ${missing.join(", ")})`
        );
      }
    }

    if (failures.length > 0) {
      assert.fail(
        `Canonical edges below consensus threshold (${CONSENSUS_THRESHOLD}/8):\n${failures.join("\n")}`
      );
    }
  });

  test("canonical symbol names appear in Public Symbols sections", function () {
    const CONSENSUS_THRESHOLD = 6;
    const failures: string[] = [];

    for (const [nodeId, expectedSymbols] of CANONICAL_SYMBOLS) {
      for (const sym of expectedSymbols) {
        const detected = allResults.filter(r => {
          if (r.error) return false;
          const docs = r.nodeMap.get(nodeId);
          if (!docs || docs.length === 0) return false;
          return docs.some(d =>
            d.publicSymbolsSection.toLowerCase().includes(sym.toLowerCase())
          );
        });

        if (detected.length < CONSENSUS_THRESHOLD) {
          const missing = allResults
            .filter(r => {
              if (r.error) return true;
              const docs = r.nodeMap.get(nodeId);
              if (!docs || docs.length === 0) return true;
              return !docs.some(d =>
                d.publicSymbolsSection.toLowerCase().includes(sym.toLowerCase())
              );
            })
            .map(r => r.language);
          failures.push(
            `${nodeId}.${sym}: found in ${detected.length}/${allResults.length} ` +
            `(missing: ${missing.join(", ")})`
          );
        }
      }
    }

    if (failures.length > 0) {
      assert.fail(
        `Symbol presence below consensus threshold (${CONSENSUS_THRESHOLD}/8):\n${failures.join("\n")}`
      );
    }
  });
});
