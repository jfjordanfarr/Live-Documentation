#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  GraphStore,
  compileRelationshipRules,
  compileSymbolProfiles,
  evaluateRelationshipCoverage,
  formatRelationshipDiagnostics,
  loadRelationshipRuleConfig,
  type ArtifactLayer,
  type KnowledgeArtifact,
  type LinkedArtifactSummary,
  type RelationshipCoverageDiagnostic,
  type RelationshipRuleWarning
} from "@live-documentation/shared";

import { snapshotWorkspace, DEFAULT_DB, DEFAULT_OUTPUT } from "./snapshot-workspace";
import {
  generateSymbolCorrectnessDiagnostics,
  type SymbolCorrectnessReport
} from "../../packages/server/src/features/diagnostics/symbolCorrectnessValidator";

interface ParsedArgs {
  helpRequested: boolean;
  jsonOutput: boolean;
  strictSymbols: boolean;
  dbPath?: string;
  workspace?: string;
}

interface ArtifactSummary {
  id: string;
  uri: string;
  layer: ArtifactLayer;
}

interface ExportedSymbol {
  name: string;
  kind?: string;
  isDefault?: boolean;
  isTypeOnly?: boolean;
}

interface SymbolCoverageGap {
  artifact: ArtifactSummary;
  symbol: ExportedSymbol;
}

interface SymbolCoverageTotals {
  total: number;
  documented: number;
  undocumented: number;
}

interface AuditReport {
  totals: {
    artifacts: number;
    code: number;
    documentation: number;
  };
  missingDocumentation: ArtifactSummary[];
  orphanDocuments: ArtifactSummary[];
  symbolCoverage: {
    totals: SymbolCoverageTotals;
    gaps: SymbolCoverageGap[];
  };
  orphanDocumentSymbols: DocumentSymbolOrphan[];
  relationshipRules?: RelationshipRuleAuditSummary;
  symbolProfiles?: SymbolProfileAuditSummary;
}

interface RelationshipRuleAuditSummary {
  diagnostics: RelationshipCoverageDiagnostic[];
  warnings: RelationshipRuleWarning[];
}

interface SymbolProfileAuditSummary {
  report: SymbolCorrectnessReport;
  warnings: RelationshipRuleWarning[];
}

interface DocumentSymbolOrphan {
  document: ArtifactSummary;
  symbol: string;
}

interface GroupedArtifacts {
  group: string;
  entries: ArtifactSummary[];
}

const EXIT_SUCCESS = 0;
const EXIT_INVALID_ARGS = 1;
const EXIT_MISSING_DB = 2;
const EXIT_COVERAGE_GAPS = 3;
const EXIT_UNCAUGHT_ERROR = 4;
const EXIT_SYMBOL_GAPS = 5;

const DOCUMENTATION_LAYERS: Set<ArtifactLayer> = new Set([
  "vision",
  "requirements",
  "architecture",
  "implementation"
]);

const KNOWN_ROOT_SEGMENTS = new Set([
  "packages",
  "tests",
  "scripts",
  ".mdmd",
  ".live-documentation",
  "specs",
  "data",
  "AI-Agent-Workspace"
]);

const CODE_ARTIFACT_IGNORE_PATTERNS: RegExp[] = [
  /\/tests\/integration\/benchmarks\/fixtures\//,
  /\/scripts\/fixture-tools\//,
  /\/tests\/integration\/fixtures\/webforms-appsettings\//
];

const DOCUMENT_ARTIFACT_IGNORE_PATTERNS: RegExp[] = [
  /\/\.live-documentation\/system\//,
  /\/tests\/integration\/benchmarks\/fixtures\//,
  /\/tests\/integration\/fixtures\//,
  /\/\.mdmd\/layer-4\/tests\/integration\/.*__fixtures__\//,
  /\/\.mdmd\/layer-4\/tests\/integration\/.*tsconfig\.json\.mdmd\.md$/,
  /\/\.mdmd\/layer-4\/scripts\/powershell\/emit-ast\.ps1\.mdmd\.md$/
];

interface SymbolCoverageIgnoreConfig {
  artifactGlobs: string[];
  barrelFilePatterns: string[];
}

interface CompiledGlobPattern {
  original: string;
  regex: RegExp;
}

interface AuditOptions {
  symbolIgnorePatterns: CompiledGlobPattern[];
  barrelFilePatterns: CompiledGlobPattern[];
}

const EMPTY_AUDIT_OPTIONS: AuditOptions = {
  symbolIgnorePatterns: [],
  barrelFilePatterns: []
};

async function ensureFreshSnapshot(parsed: ParsedArgs): Promise<void> {
  const workspaceRoot = parsed.workspace ? path.resolve(parsed.workspace) : process.cwd();
  const dbPath = path.resolve(workspaceRoot, parsed.dbPath ?? DEFAULT_DB);
  const outputPath = path.resolve(workspaceRoot, DEFAULT_OUTPUT);

  await snapshotWorkspace({
    workspaceRoot,
    dbPath,
    outputPath,
    quiet: true
  });
}

export function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    helpRequested: false,
    jsonOutput: false,
    strictSymbols: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    switch (current) {
      case "-h":
      case "--help": {
        parsed.helpRequested = true;
        break;
      }

      case "--json": {
        parsed.jsonOutput = true;
        break;
      }

      case "--strict-symbols": {
        parsed.strictSymbols = true;
        break;
      }

      case "--db": {
        parsed.dbPath = expectValue(argv, ++index, current);
        break;
      }

      case "--workspace": {
        parsed.workspace = expectValue(argv, ++index, current);
        break;
      }

      default: {
        if (current.startsWith("-")) {
          throw new Error(`Unrecognised option: ${current}`);
        }
      }
    }
  }

  return parsed;
}

function expectValue(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (!value || value.startsWith("-")) {
    throw new Error(`Option ${flag} requires a value.`);
  }
  return value;
}

function usage(): string {
  return (
    "Usage: npm run graph:audit -- [options]\n\n" +
    "Database discovery:\n" +
    "  --db <path>                   Explicit SQLite database path.\n" +
    "  --workspace <path>            Workspace root used to locate .link-aware-diagnostics storage.\n\n" +
    "Output controls:\n" +
    "  --json                       Emit raw JSON instead of formatted text.\n" +
    "  --strict-symbols             Treat undocumented exported symbols as fatal gaps.\n" +
    "  --help                       Display this help text.\n\n" +
    "Examples:\n" +
    "  npm run graph:audit -- --workspace .\n" +
    "  npm run graph:audit -- --db ../.link-aware-diagnostics/link-aware-diagnostics.db --json\n"
  );
}

function resolveReadablePath(uri: string): string {
  if (!uri.startsWith("file://")) {
    return uri;
  }

  const decoded = fileURLToPath(uri);
  const normalized = path.normalize(decoded);
  const segments = normalized.split(path.sep).filter(Boolean);

  const rootIndex = segments.findIndex(segment => KNOWN_ROOT_SEGMENTS.has(segment));
  if (rootIndex === -1) {
    return normalized;
  }

  return segments.slice(rootIndex).join("/");
}

function deriveGroupLabel(artifact: ArtifactSummary): string {
  const readable = resolveReadablePath(artifact.uri);
  const segments = readable.split("/");

  if (segments.length === 0) {
    return "(unknown)";
  }

  const root = segments[0];
  const secondary = segments[1];

  if (root === "packages" && secondary) {
    return `${root}/${secondary}`;
  }

  if (root === "tests" && secondary) {
    return `${root}/${secondary}`;
  }

  if ((root === ".mdmd" || root === ".live-documentation") && secondary) {
    return `${root}/${secondary}`;
  }

  return root;
}

function groupArtifacts(artifacts: ArtifactSummary[]): GroupedArtifacts[] {
  const buckets = new Map<string, ArtifactSummary[]>();

  for (const artifact of artifacts) {
    const label = deriveGroupLabel(artifact);
    const entries = buckets.get(label);
    if (entries) {
      entries.push(artifact);
    } else {
      buckets.set(label, [artifact]);
    }
  }

  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([group, entries]) => ({
      group,
      entries: entries.sort((left, right) => resolveReadablePath(left.uri).localeCompare(resolveReadablePath(right.uri)))
    }));
}

function resolveDatabasePath(options: ParsedArgs): string {
  if (options.dbPath) {
    return path.resolve(options.dbPath);
  }

  const workspace = options.workspace ? path.resolve(options.workspace) : process.cwd();
  return path.join(workspace, ".link-aware-diagnostics", "link-aware-diagnostics.db");
}

export function auditCoverage(
  store: GraphStore,
  options: AuditOptions = EMPTY_AUDIT_OPTIONS
): AuditReport {
  const artifacts = store.listArtifacts();
  const cache = new Map<string, LinkedArtifactSummary[]>();
  const docSymbolCache = new Map<string, Set<string>>();
  const docExportedSymbolCache = new Map<string, string[]>();

  function getNeighbors(id: string): LinkedArtifactSummary[] {
    let neighbors = cache.get(id);
    if (!neighbors) {
      neighbors = store.listLinkedArtifacts(id);
      cache.set(id, neighbors);
    }
    return neighbors;
  }

  const missingDocumentation: ArtifactSummary[] = [];
  const orphanDocuments: ArtifactSummary[] = [];
  const symbolGaps: SymbolCoverageGap[] = [];
  const docSymbolOrphans: DocumentSymbolOrphan[] = [];

  let codeCount = 0;
  let docCount = 0;
  let totalSymbols = 0;
  let documentedSymbols = 0;

  for (const artifact of artifacts) {
    if (artifact.layer === "code") {
      if (shouldIgnoreCodeArtifact(artifact.uri)) {
        continue;
      }

      codeCount += 1;
      const neighbors = getNeighbors(artifact.id);
      const hasDocLink = neighbors.some(neighbor => {
        if (neighbor.kind !== "documents") {
          return false;
        }
        return DOCUMENTATION_LAYERS.has(neighbor.artifact.layer as ArtifactLayer);
      });

      if (!hasDocLink) {
        missingDocumentation.push(toSummary(artifact));
      }

      const exportedSymbols = readExportedSymbols(artifact.metadata);
      const ignoreSymbols = shouldIgnoreSymbolCoverage(artifact, options.symbolIgnorePatterns);
      if (exportedSymbols.length && !ignoreSymbols) {
        const docNeighbors = neighbors.filter(neighbor => {
          if (neighbor.kind !== "documents") {
            return false;
          }

          return DOCUMENTATION_LAYERS.has(neighbor.artifact.layer as ArtifactLayer);
        });

  const referencedSymbols = collectReferencedSymbols(docNeighbors, docSymbolCache, docExportedSymbolCache);

        for (const symbol of exportedSymbols) {
          if (!symbol.name || symbol.name === "default") {
            continue;
          }

          totalSymbols += 1;
          if (referencedSymbols.has(symbol.name)) {
            documentedSymbols += 1;
          } else {
            symbolGaps.push({
              artifact: toSummary(artifact),
              symbol
            });
          }
        }
      }

      continue;
    }

    if (DOCUMENTATION_LAYERS.has(artifact.layer)) {
      if (shouldIgnoreDocumentArtifact(artifact.uri)) {
        continue;
      }

      docCount += 1;
      const neighbors = getNeighbors(artifact.id);
      const touchesCodeDirectly = neighbors.some(neighbor => {
        if (neighbor.kind !== "documents") {
          return false;
        }
        return neighbor.artifact.layer === "code";
      });

      let touchesCode = touchesCodeDirectly;
      if (!touchesCodeDirectly) {
        const implementationNeighbors = neighbors.filter(neighbor => {
          if (neighbor.kind !== "documents") {
            return false;
          }
          return neighbor.artifact.layer === "implementation";
        });

        touchesCode = implementationNeighbors.some(implementationNeighbor => {
          const implementationNeighborsNeighbors = getNeighbors(implementationNeighbor.artifact.id);
          return implementationNeighborsNeighbors.some(candidate => {
            if (candidate.kind !== "documents") {
              return false;
            }
            return candidate.artifact.layer === "code";
          });
        });
      }

      if (!touchesCode) {
        orphanDocuments.push(toSummary(artifact));
      }

      // Skip orphan symbol check for barrel file documents
      // Barrel files use `export *` which re-exports symbols from other files,
      // so the declared symbols in the Live Doc won't match declarations in the barrel file itself
      if (isBarrelFileDocument(artifact, options.barrelFilePatterns)) {
        continue;
      }

      const exportedSymbolsDeclared = readDocumentExportedSymbols(artifact.uri, docExportedSymbolCache);
      if (exportedSymbolsDeclared.length > 0) {
        const codeNeighbors = neighbors.filter(neighbor => {
          if (neighbor.kind !== "documents") {
            return false;
          }
          return neighbor.artifact.layer === "code";
        });

        const availableSymbols = new Set<string>();
        for (const neighbor of codeNeighbors) {
          const neighborSymbols = readExportedSymbols(neighbor.artifact.metadata);
          for (const symbol of neighborSymbols) {
            if (!symbol.name || symbol.name === "default") {
              continue;
            }
            availableSymbols.add(symbol.name);
          }
        }

        for (const declared of exportedSymbolsDeclared) {
          const candidate = declared.trim();
          if (!candidate || candidate === "default") {
            continue;
          }
          if (!availableSymbols.has(candidate)) {
            docSymbolOrphans.push({
              document: toSummary(artifact),
              symbol: candidate
            });
          }
        }
      }
    }
  }

  return {
    totals: {
      artifacts: artifacts.length,
      code: codeCount,
      documentation: docCount
    },
    missingDocumentation,
    orphanDocuments,
    symbolCoverage: {
      totals: {
        total: totalSymbols,
        documented: documentedSymbols,
        undocumented: Math.max(totalSymbols - documentedSymbols, 0)
      },
      gaps: symbolGaps
    },
    orphanDocumentSymbols: docSymbolOrphans
  };
}

function shouldIgnoreCodeArtifact(uri: string): boolean {
  return matchesAnyPattern(uri, CODE_ARTIFACT_IGNORE_PATTERNS);
}

function shouldIgnoreDocumentArtifact(uri: string): boolean {
  return matchesAnyPattern(uri, DOCUMENT_ARTIFACT_IGNORE_PATTERNS);
}

function matchesAnyPattern(uri: string, patterns: RegExp[]): boolean {
  if (!patterns.length) {
    return false;
  }
  return patterns.some(pattern => pattern.test(uri));
}

function isBarrelFileDocument(artifact: KnowledgeArtifact, barrelPatterns: CompiledGlobPattern[]): boolean {
  // A Live Doc for a barrel file will have a URI like:
  // .mdmd/layer-4/packages/foo/index.ts.mdmd.md
  // We check if the source code file (extracted from the doc path) matches barrel patterns
  if (!barrelPatterns.length) {
    return false;
  }
  
  // Extract the source file path from the Live Doc URI
  // Example: .mdmd/layer-4/packages/foo/index.ts.mdmd.md -> packages/foo/index.ts
  const match = artifact.uri.match(/\.mdmd\/layer-\d+\/(.+)\.mdmd\.md$/);
  if (!match) {
    return false;
  }
  
  const sourceFilePath = match[1];
  return barrelPatterns.some(pattern => pattern.regex.test(sourceFilePath));
}

function shouldIgnoreRelationshipDiagnostic(diagnostic: RelationshipCoverageDiagnostic): boolean {
  const normalized = (diagnostic.source ?? "").replace(/\\/g, "/").toLowerCase();
  return (
    normalized.includes(".mdmd/") ||
    normalized.includes("/.mdmd/") ||
    normalized.includes(".live-documentation/system/")
  );
}

function toSummary(artifact: KnowledgeArtifact): ArtifactSummary {
  return {
    id: artifact.id,
    uri: artifact.uri,
    layer: artifact.layer
  };
}

export function printReport(
  report: AuditReport,
  options: { json: boolean; strictSymbols: boolean }
): number {
  const { json, strictSymbols } = options;
  const ruleDiagnostics = report.relationshipRules?.diagnostics ?? [];
  const ruleWarnings = report.relationshipRules?.warnings ?? [];
  const hasRuleDiagnostics = ruleDiagnostics.length > 0;
  const profileWarnings = report.symbolProfiles?.warnings ?? [];
  const profileReport = report.symbolProfiles?.report;
  const profileSummaries = profileReport?.summaries ?? [];
  const profileViolations = profileReport?.violations ?? [];
  const enforceViolations = profileViolations.filter(violation => violation.mode === "enforce");
  const monitorViolations = profileViolations.filter(violation => violation.mode === "monitor");
  const hasProfileViolations = enforceViolations.length > 0;

  if (json) {
    console.log(JSON.stringify(report, null, 2));
    const hasDocGaps =
      report.missingDocumentation.length > 0 ||
      report.orphanDocuments.length > 0 ||
      hasRuleDiagnostics ||
      hasProfileViolations;
    const hasSymbolGaps = report.symbolCoverage.gaps.length > 0;
    const hasDocSymbolOrphans = report.orphanDocumentSymbols.length > 0;

    if (!hasDocGaps && !hasSymbolGaps && !hasDocSymbolOrphans) {
      return EXIT_SUCCESS;
    }

    if (hasDocSymbolOrphans || (strictSymbols && hasSymbolGaps)) {
      return EXIT_SYMBOL_GAPS;
    }

    if (!hasDocGaps) {
      return EXIT_SUCCESS;
    }

    return EXIT_COVERAGE_GAPS;
  }

  console.log("Graph coverage audit");
  console.log(`  Total artifacts: ${report.totals.artifacts}`);
  console.log(`  Code artifacts: ${report.totals.code}`);
  console.log(`  Documentation artifacts: ${report.totals.documentation}`);

  const hasDocGaps =
    report.missingDocumentation.length > 0 ||
    report.orphanDocuments.length > 0 ||
    hasRuleDiagnostics ||
    hasProfileViolations;
  const hasSymbolGaps = report.symbolCoverage.gaps.length > 0;
  const hasDocSymbolOrphans = report.orphanDocumentSymbols.length > 0;

  if (!hasDocGaps) {
    console.log("  ✔ No file-level documentation gaps detected");
  }

  if (report.missingDocumentation.length > 0) {
    console.log("\nCode artifacts missing documentation links:");
    const grouped = groupArtifacts(report.missingDocumentation);
    for (const { group, entries } of grouped) {
      console.log(`  ${group} (${entries.length})`);
      for (const artifact of entries) {
        console.log(`    - ${resolveReadablePath(artifact.uri)} (${artifact.id})`);
      }
    }
  }

  if (report.orphanDocuments.length > 0) {
    console.log("\nLayer 4 documents lacking code relationships:");
    const grouped = groupArtifacts(report.orphanDocuments);
    for (const { group, entries } of grouped) {
      console.log(`  ${group} (${entries.length})`);
      for (const artifact of entries) {
        console.log(`    - ${resolveReadablePath(artifact.uri)} (${artifact.id}) [${artifact.layer}]`);
      }
    }
  }

  const symbolTotals = report.symbolCoverage.totals;
  if (symbolTotals.total > 0) {
    const coveragePercentage = symbolTotals.total === 0 ? 100 : Math.round((symbolTotals.documented / symbolTotals.total) * 100);
    console.log("\nSymbol coverage preview:");
    console.log(
      `  Documented exports: ${symbolTotals.documented}/${symbolTotals.total} (${coveragePercentage}% coverage)`
    );
  }

  if (report.symbolCoverage.gaps.length > 0) {
    console.log("\nExports lacking MDMD symbol references:");
    const grouped = groupSymbolGaps(report.symbolCoverage.gaps);
    for (const { group, entries } of grouped) {
      console.log(`  ${group}`);
      for (const gap of entries) {
        const readable = resolveReadablePath(gap.artifact.uri);
        const kindLabel = gap.symbol.kind ? ` (${gap.symbol.kind})` : "";
        console.log(`    - ${readable} :: ${gap.symbol.name}${kindLabel}`);
      }
    }
  }

  if (report.orphanDocumentSymbols.length > 0) {
    console.log("\nDocument exported symbol references missing in code:");
    const grouped = groupDocumentSymbolOrphans(report.orphanDocumentSymbols);
    for (const entry of grouped) {
      const readable = resolveReadablePath(entry.document.uri);
      console.log(`  ${readable}`);
      for (const symbol of entry.symbols) {
        console.log(`    - ${symbol}`);
      }
    }
  }

  if (ruleWarnings.length > 0) {
    console.log("\nRelationship rule warnings:");
    for (const warning of ruleWarnings) {
      const { profileId } = warning as { profileId?: string };
      const prefixParts = [];
      if (profileId) {
        prefixParts.push(profileId);
      }
      if (warning.ruleId) {
        prefixParts.push(warning.ruleId);
      }
      const prefix = prefixParts.length > 0 ? `${prefixParts.join(" ")}: ` : "";
      console.log(`  - ${prefix}${warning.message}`);
    }
  }

  if (ruleDiagnostics.length > 0) {
    console.log("\nRelationship rule coverage gaps:");
    for (const diagnostic of ruleDiagnostics) {
      const label = diagnostic.label ? `${diagnostic.ruleId} (${diagnostic.label})` : diagnostic.ruleId;
      console.log(`  ${label}`);
      console.log(`    - ${diagnostic.source} :: ${diagnostic.hop} :: ${diagnostic.message}`);
    }
  }

  if (profileWarnings.length > 0) {
    console.log("\nSymbol correctness profile warnings:");
    for (const warning of profileWarnings) {
      const { profileId } = warning as { profileId?: string };
      const prefix = profileId ? `${profileId}: ` : "";
      console.log(`  - ${prefix}${warning.message}`);
    }
  }

  if (profileSummaries.length > 0) {
    console.log("\nSymbol correctness profile coverage:");
    for (const summary of profileSummaries) {
      const label = summary.profileLabel ? `${summary.profileId} (${summary.profileLabel})` : summary.profileId;
      const evaluated = summary.evaluated;
      const satisfied = summary.satisfied;
      const coveragePercentage = evaluated === 0 ? 100 : Math.round((satisfied / evaluated) * 100);
      const modeSuffix = summary.mode === "enforce" ? "" : ` [${summary.mode}]`;
      console.log(`  ${label}${modeSuffix}: ${satisfied}/${evaluated} artifacts satisfied (${coveragePercentage}% coverage)`);
    }
  }

  if (enforceViolations.length > 0) {
    console.log("\nSymbol correctness profile violations:");
    for (const violation of enforceViolations) {
      const label = violation.profileLabel ? `${violation.profileId} (${violation.profileLabel})` : violation.profileId;
      const readable = resolveReadablePath(violation.artifactUri);
      console.log(`  ${label} :: ${violation.requirementId}`);
      console.log(
        `    - ${readable} :: expected ≥${violation.expectedMinimum} ${violation.linkKind} (${violation.direction}), observed ${violation.observed}`
      );
      console.log(`    - ${violation.message}`);
    }
  }

  if (monitorViolations.length > 0) {
    console.log("\nSymbol correctness profile observations (monitoring):");
    for (const violation of monitorViolations) {
      const label = violation.profileLabel ? `${violation.profileId} (${violation.profileLabel})` : violation.profileId;
      const readable = resolveReadablePath(violation.artifactUri);
      console.log(`  ${label} :: ${violation.requirementId}`);
      console.log(
        `    - ${readable} :: expected ≥${violation.expectedMinimum} ${violation.linkKind} (${violation.direction}), observed ${violation.observed}`
      );
      console.log(`    - ${violation.message}`);
    }
  }

  if (!hasDocGaps && !hasDocSymbolOrphans && (!hasSymbolGaps || !strictSymbols)) {
    return EXIT_SUCCESS;
  }

  if (hasDocSymbolOrphans || (strictSymbols && hasSymbolGaps)) {
    return EXIT_SYMBOL_GAPS;
  }

  return EXIT_COVERAGE_GAPS;
}

export async function main(): Promise<void> {
  let parsed: ParsedArgs;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error((error as Error).message);
    console.error(usage());
    process.exit(EXIT_INVALID_ARGS);
    return;
  }

  if (parsed.helpRequested) {
    console.log(usage());
    process.exit(EXIT_SUCCESS);
    return;
  }

  try {
    await ensureFreshSnapshot(parsed);
  } catch (error) {
    console.error("Failed to refresh workspace graph snapshot before auditing coverage.");
    if (error instanceof Error) {
      console.error(error.stack ?? error.message);
    } else {
      console.error(String(error));
    }
    process.exit(EXIT_UNCAUGHT_ERROR);
    return;
  }

  const workspaceRoot = parsed.workspace ? path.resolve(parsed.workspace) : process.cwd();
  const ignoreConfig = loadSymbolCoverageIgnoreConfig(workspaceRoot);
  const compiledIgnores = compileGlobPatterns(ignoreConfig.artifactGlobs);
  const compiledBarrelPatterns = compileGlobPatterns(ignoreConfig.barrelFilePatterns);

  const dbPath = resolveDatabasePath(parsed);
  if (!fs.existsSync(dbPath)) {
    console.error(`Graph database not found at ${dbPath}.`);
    console.error("Run the extension or language server once to generate the SQLite cache, or pass --db.");
    process.exit(EXIT_MISSING_DB);
    return;
  }

  const store = new GraphStore({ dbPath });
  try {
    const report = auditCoverage(store, { 
      symbolIgnorePatterns: compiledIgnores,
      barrelFilePatterns: compiledBarrelPatterns
    });
    const ruleConfig = loadRelationshipRuleConfig(workspaceRoot);
    const compiledRules = compileRelationshipRules(ruleConfig.config, workspaceRoot);
    const ruleWarnings: RelationshipRuleWarning[] = [...ruleConfig.warnings, ...compiledRules.warnings];

    let diagnostics: RelationshipCoverageDiagnostic[] = [];
    if (compiledRules.rules.length > 0) {
      const coverage = evaluateRelationshipCoverage({
        store,
        compiled: compiledRules,
        workspaceRoot
      });
      diagnostics = formatRelationshipDiagnostics(coverage, workspaceRoot).filter(
        diagnostic => !shouldIgnoreRelationshipDiagnostic(diagnostic)
      );
    }

    report.relationshipRules = {
      diagnostics,
      warnings: ruleWarnings
    };

    const compiledProfiles = compileSymbolProfiles(ruleConfig.config, workspaceRoot);
    const profileReport: SymbolCorrectnessReport =
      compiledProfiles.profiles.length > 0
        ? generateSymbolCorrectnessDiagnostics({
            workspaceRoot,
            store,
            profiles: compiledProfiles.profiles,
            lookup: compiledProfiles.lookup
          })
        : { summaries: [], violations: [] };

    if (compiledProfiles.profiles.length > 0 || compiledProfiles.warnings.length > 0) {
      report.symbolProfiles = {
        report: profileReport,
        warnings: compiledProfiles.warnings
      };
    }

    const exitCode = printReport(report, { json: parsed.jsonOutput, strictSymbols: parsed.strictSymbols });
    process.exit(exitCode);
  } catch (error) {
    console.error("Failed to audit graph coverage.");
    if (error instanceof Error) {
      console.error(error.stack ?? error.message);
    } else {
      console.error(String(error));
    }
    process.exit(EXIT_UNCAUGHT_ERROR);
  } finally {
    store.close();
  }
}

main().catch(error => {
  console.error("Failed to audit graph coverage.");
  if (error instanceof Error) {
    console.error(error.stack ?? error.message);
  } else {
    console.error(String(error));
  }
  process.exit(EXIT_UNCAUGHT_ERROR);
});

function loadSymbolCoverageIgnoreConfig(workspaceRoot: string): SymbolCoverageIgnoreConfig {
  const configPath = path.join(workspaceRoot, "symbol-coverage.ignore.json");
  if (!fs.existsSync(configPath)) {
    return { artifactGlobs: [], barrelFilePatterns: [] };
  }

  try {
    const contents = fs.readFileSync(configPath, "utf8");
    const parsed = JSON.parse(contents) as Partial<SymbolCoverageIgnoreConfig>;
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Ignore config must be a JSON object");
    }

    const artifactGlobs = Array.isArray(parsed.artifactGlobs)
      ? parsed.artifactGlobs.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
      : [];

    const barrelFilePatterns = Array.isArray(parsed.barrelFilePatterns)
      ? parsed.barrelFilePatterns.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
      : [];

    return { artifactGlobs, barrelFilePatterns };
  } catch (error) {
    console.warn(
      `Failed to read symbol coverage ignore config at ${configPath}: ${error instanceof Error ? error.message : String(error)}.`
    );
    return { artifactGlobs: [], barrelFilePatterns: [] };
  }
}

function compileGlobPatterns(patterns: string[]): CompiledGlobPattern[] {
  return patterns.map(pattern => ({
    original: pattern,
    regex: globToRegExp(pattern)
  }));
}

function globToRegExp(glob: string): RegExp {
  let regex = "";
  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index];
    if (char === "*") {
      const next = glob[index + 1];
      if (next === "*") {
        regex += ".*";
        index += 1;
        continue;
      }
      regex += "[^/]*";
      continue;
    }

    if (char === "?") {
      regex += "[^/]";
      continue;
    }

    regex += escapeRegex(char);
  }

  return new RegExp(`^${regex}$`);
}

function escapeRegex(character: string): string {
  return character.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}

function shouldIgnoreSymbolCoverage(
  artifact: KnowledgeArtifact,
  patterns: CompiledGlobPattern[]
): boolean {
  if (patterns.length === 0) {
    return false;
  }

  const readable = resolveReadablePath(artifact.uri).replace(/\\/g, "/");
  return patterns.some(pattern => pattern.regex.test(readable));
}

function readExportedSymbols(metadata: Record<string, unknown> | undefined): ExportedSymbol[] {
  if (!metadata) {
    return [];
  }

  const candidate = (metadata as { exportedSymbols?: unknown }).exportedSymbols;
  if (!Array.isArray(candidate)) {
    return [];
  }

  const symbols: ExportedSymbol[] = [];
  for (const entry of candidate) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const name = (entry as { name?: unknown }).name;
    if (typeof name !== "string" || name.trim() === "") {
      continue;
    }

    const kind = typeof (entry as { kind?: unknown }).kind === "string" ? String((entry as { kind?: unknown }).kind) : undefined;
    const isDefault = Boolean((entry as { isDefault?: unknown }).isDefault);
    const isTypeOnly = Boolean((entry as { isTypeOnly?: unknown }).isTypeOnly);

    symbols.push({
      name,
      kind,
      isDefault,
      isTypeOnly
    });
  }

  return symbols;
}

function collectReferencedSymbols(
  neighbors: LinkedArtifactSummary[],
  cache: Map<string, Set<string>>,
  exportCache: Map<string, string[]>
): Set<string> {
  const aggregated = new Set<string>();

  for (const neighbor of neighbors) {
    const artifactId = neighbor.artifact.id;
    let symbols = cache.get(artifactId);
    if (!symbols) {
      symbols = readDocumentSymbolReferences(neighbor.artifact.metadata);
      if (symbols.size === 0) {
        symbols = new Set(readDocumentExportedSymbols(neighbor.artifact.uri, exportCache));
      }
      cache.set(artifactId, symbols);
    }

    for (const symbol of symbols) {
      aggregated.add(symbol);
    }
  }

  return aggregated;
}

function readDocumentSymbolReferences(metadata: Record<string, unknown> | undefined): Set<string> {
  if (!metadata) {
    return new Set();
  }

  const candidate = (metadata as { symbolReferences?: unknown }).symbolReferences;
  if (!Array.isArray(candidate)) {
    return new Set();
  }

  const references = new Set<string>();
  for (const entry of candidate) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const symbol = (entry as { symbol?: unknown }).symbol;
    if (typeof symbol === "string" && symbol.trim() !== "") {
      references.add(symbol.trim());
    }
  }

  return references;
}

function groupSymbolGaps(gaps: SymbolCoverageGap[]): GroupedSymbolGaps[] {
  const buckets = new Map<string, SymbolCoverageGap[]>();

  for (const gap of gaps) {
    const key = deriveGroupLabel(gap.artifact);
    const entry = buckets.get(key);
    if (entry) {
      entry.push(gap);
    } else {
      buckets.set(key, [gap]);
    }
  }

  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([group, entries]) => ({
      group,
      entries: entries.sort((left, right) => {
        const leftKey = `${resolveReadablePath(left.artifact.uri)}:${left.symbol.name}`;
        const rightKey = `${resolveReadablePath(right.artifact.uri)}:${right.symbol.name}`;
        return leftKey.localeCompare(rightKey);
      })
    }));
}

interface GroupedSymbolGaps {
  group: string;
  entries: SymbolCoverageGap[];
}

function readDocumentExportedSymbols(uri: string, cache: Map<string, string[]>): string[] {
  const cached = cache.get(uri);
  if (cached) {
    return cached;
  }

  if (!uri.startsWith("file://")) {
    cache.set(uri, []);
    return [];
  }

  let content: string;
  try {
    const filePath = fileURLToPath(uri);
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    cache.set(uri, []);
    return [];
  }

  const symbols = extractExportedSymbolsSection(content);
  cache.set(uri, symbols);
  return symbols;
}

function extractExportedSymbolsSection(content: string): string[] {
  const lines = content.split(/\r?\n/);
  const collected = new Set<string>();
  const sectionTitles = new Set(["exported symbols", "public symbols"]);
  const headingPattern = /^(#{1,6})\s+(.*)$/;

  let sectionLevel = 0;
  let inSection = false;

  for (const line of lines) {
    const headingMatch = line.match(headingPattern);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      const normalized = title.toLowerCase();

      if (sectionTitles.has(normalized)) {
        inSection = true;
        sectionLevel = level;
        continue;
      }

      if (inSection && level <= sectionLevel) {
        inSection = false;
      }

      if (inSection && level > sectionLevel) {
        const candidate = normalizeSymbolHeading(title);
        if (candidate && looksLikeSymbolIdentifier(candidate)) {
          collected.add(candidate);
        }
      }

      continue;
    }

    if (!inSection) {
      continue;
    }

  }

  for (const symbol of extractMetadataExports(lines)) {
    if (looksLikeSymbolIdentifier(symbol)) {
      collected.add(symbol);
    }
  }

  return [...collected];
}

function extractMetadataExports(lines: string[]): string[] {
  const headingPattern = /^(#{1,6})\s+(.*)$/;
  const bulletPattern = /^\s*-\s*(.+)$/;
  const exports = new Set<string>();
  let inMetadata = false;
  let metadataLevel = 0;

  for (const line of lines) {
    const headingMatch = line.match(headingPattern);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim().toLowerCase();

      if (!inMetadata && title === "metadata") {
        inMetadata = true;
        metadataLevel = level;
        continue;
      }

      if (inMetadata && level <= metadataLevel) {
        break;
      }

      continue;
    }

    if (!inMetadata) {
      continue;
    }

    const bulletMatch = line.match(bulletPattern);
    if (!bulletMatch) {
      continue;
    }

    const entry = bulletMatch[1].trim();
    const separatorIndex = entry.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const key = entry.slice(0, separatorIndex).trim().toLowerCase();
    if (key !== "exports") {
      continue;
    }

    const value = entry.slice(separatorIndex + 1).trim();
    if (!value) {
      continue;
    }

    for (const fragment of value.split(/[,;]/)) {
      const cleaned = fragment.replace(/`/g, "").replace(/\[/g, "").replace(/\]/g, "").trim();
      const candidate = normalizeSymbolHeading(cleaned);
      if (candidate) {
        exports.add(candidate);
      }
    }
  }

  return [...exports];
}

function looksLikeSymbolIdentifier(candidate: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*$/.test(candidate);
}

function normalizeSymbolHeading(raw: string): string {
  let candidate = raw.split(" – ")[0]?.trim() ?? "";
  if (!candidate) {
    return "";
  }

  candidate = candidate.replace(/\s*\{#.+?\}\s*$/, "").trim();

  const wrappers: Array<[string, string]> = [
    ["`", "`"],
    ["**", "**"],
    ["_", "_"],
    ["*", "*"]
  ];

  let stripped = true;
  while (stripped && candidate.length > 0) {
    stripped = false;
    for (const [start, end] of wrappers) {
      if (candidate.startsWith(start) && candidate.endsWith(end) && candidate.length >= start.length + end.length) {
        candidate = candidate.slice(start.length, candidate.length - end.length).trim();
        stripped = true;
      }
    }
  }

  return candidate;
}

function groupDocumentSymbolOrphans(entries: DocumentSymbolOrphan[]): Array<{ document: ArtifactSummary; symbols: string[] }> {
  const buckets = new Map<string, { summary: ArtifactSummary; symbols: Set<string> }>();

  for (const entry of entries) {
    const key = entry.document.id;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.symbols.add(entry.symbol);
    } else {
      buckets.set(key, {
        summary: entry.document,
        symbols: new Set([entry.symbol])
      });
    }
  }

  return [...buckets.values()]
    .sort((left, right) => resolveReadablePath(left.summary.uri).localeCompare(resolveReadablePath(right.summary.uri)))
    .map(entry => ({ document: entry.summary, symbols: [...entry.symbols].sort((a, b) => a.localeCompare(b)) }));
}
