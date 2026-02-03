import { glob } from "glob";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import path from "node:path";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  type LiveDocumentationArchetype,
  type LiveDocumentationConfig,
  normalizeLiveDocumentationConfig
} from "@live-documentation/shared/config/liveDocumentationConfig";
import {
  analyzeSourceFile,
  buildWorkspaceSymbolIndex,
  cleanupEmptyParents,
  collectDependencies,
  collectExportedSymbols,
  directoryExists,
  discoverTargetFiles,
  formatRelativePathFromDoc,
  hasMeaningfulAuthoredContent,
  inferScriptKind,
  computePublicSymbolHeadingInfo,
  renderDependencyLines,
  renderReExportedAnchorLines,
  renderPublicSymbolLines,
  resolveArchetype,
  type SourceAnalysisResult,
  type WorkspaceFileIndex,
  type WorkspaceSymbolIndex
} from "@live-documentation/shared/live-docs/core";
import {
  composeLiveDocId,
  extractAuthoredBlock,
  renderLiveDocMarkdown,
  type LiveDocRenderSection
} from "@live-documentation/shared/live-docs/markdown";
import type {
  LiveDocGeneratorProvenance,
  LiveDocMetadata,
  LiveDocProvenance
} from "@live-documentation/shared/live-docs/schema";
import {
  normalizeWorkspacePath,
  toWorkspaceFileUri,
  toWorkspaceRelativePath
} from "@live-documentation/shared/tooling/pathUtils";

import {
  loadEvidenceSnapshot,
  type CoverageSummary,
  type EvidenceSnapshot,
  type ImplementationEvidenceItem,
  type TestEvidenceItem
} from "./evidenceBridge";

interface GenerateLiveDocsOptions {
  workspaceRoot: string;
  config?: LiveDocumentationConfig;
  dryRun?: boolean;
  changedOnly?: boolean;
  include?: string[];
  logger?: LiveDocGeneratorLogger;
  now?: () => Date;
}

interface LiveDocGeneratorLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface LiveDocGeneratorResult {
  processed: number;
  written: number;
  skipped: number;
  files: LiveDocWriteRecord[];
  deleted: number;
  deletedFiles: string[];
}

type LiveDocWriteKind = "created" | "updated" | "unchanged" | "skipped";

interface LiveDocWriteRecord {
  sourcePath: string;
  docPath: string;
  change: LiveDocWriteKind;
}

const DEFAULT_LOGGER: LiveDocGeneratorLogger = {
  info: (message) => console.log(`[live-docs] ${message}`),
  warn: (message) => console.warn(`[live-docs] ${message}`),
  error: (message) => console.error(`[live-docs] ${message}`)
};

export async function generateLiveDocs(
  options: GenerateLiveDocsOptions
): Promise<LiveDocGeneratorResult> {
  const logger = options.logger ?? DEFAULT_LOGGER;
  const normalizedConfig = normalizeLiveDocumentationConfig(options.config);
  const workspaceRoot = path.resolve(options.workspaceRoot);
  const now = options.now ?? (() => new Date());

  const includeSet = new Set<string>((options.include ?? []).map((entry) => normalizeWorkspacePath(entry)));

  const targetFiles = await discoverTargetFiles({
    workspaceRoot,
    config: normalizedConfig,
    include: includeSet,
    changedOnly: options.changedOnly ?? false
  });

  if (targetFiles.length === 0) {
    logger.info("No source files matched Live Documentation globs.");
    return {
      processed: 0,
      written: 0,
      skipped: 0,
      files: [],
      deleted: 0,
      deletedFiles: []
    };
  }

  const evidenceSnapshot = await loadEvidenceSnapshot({
    workspaceRoot,
    logger
  });

  // Build workspace file index for cross-file reference resolution (e.g., JSON adapters)
  const fileIndex: WorkspaceFileIndex = new Set(
    targetFiles.map((absPath) =>
      normalizeWorkspacePath(path.relative(workspaceRoot, absPath))
    )
  );
  logger.info(`Built file index with ${fileIndex.size} workspace paths`);

  // Build workspace-wide symbol index for cross-Live-Doc type reference resolution
  const liveDocsRoot = normalizeWorkspacePath(
    path.join(normalizedConfig.root, normalizedConfig.baseLayer)
  );
  const symbolIndex = await buildWorkspaceSymbolIndex({
    targetFiles,
    workspaceRoot,
    liveDocsRoot,
    docExtension: normalizedConfig.extension,
    fileIndex
  });
  logger.info(`Built symbol index with ${symbolIndex.size} unique symbol names`);

  const results: LiveDocWriteRecord[] = [];
  let written = 0;
  let skipped = 0;
  const generatedDocPaths = new Set<string>();

  const liveDocsRootAbsolute = path.resolve(
    workspaceRoot,
    normalizedConfig.root,
    normalizedConfig.baseLayer
  );
  const docExtension = normalizedConfig.extension;

  for (const absoluteSourcePath of targetFiles) {
    const relativeSourcePath = toWorkspaceRelativePath(
      toWorkspaceFileUri(workspaceRoot, absoluteSourcePath),
      workspaceRoot
    );

    if (!relativeSourcePath) {
      logger.warn(`Skipping ${absoluteSourcePath} (outside workspace)`);
      results.push({
        sourcePath: absoluteSourcePath,
        docPath: "",
        change: "skipped"
      });
      skipped += 1;
      continue;
    }

    const normalizedSourcePath = normalizeWorkspacePath(relativeSourcePath);
    const archetype = resolveArchetype(normalizedSourcePath, normalizedConfig);
    const liveDocId = composeLiveDocId(archetype, normalizedSourcePath);
    const title = normalizedSourcePath;

    const metadataBase: LiveDocMetadata = {
      layer: 4,
      archetype,
      sourcePath: normalizedSourcePath,
      liveDocId
    };

    const analysis = await analyzeSourceFile(absoluteSourcePath, workspaceRoot, fileIndex);

    const docPaths = resolveLiveDocPaths(
      workspaceRoot,
      normalizedConfig,
      normalizedSourcePath,
      docExtension
    );
    generatedDocPaths.add(docPaths.relative);
    const existingContent = await readFileIfExists(docPaths.absolute);
    const authoredBlock = extractAuthoredBlock(existingContent);
    const previousGeneratedAt = extractGeneratedAt(existingContent);
    const timestampNow = now().toISOString();
    const initialGeneratedAt = previousGeneratedAt ?? timestampNow;

    const sections = buildGeneratedSections({
      analysis,
      archetype,
      docAbsolutePath: docPaths.absolute,
      workspaceRoot,
      sourceRelativePath: normalizedSourcePath,
      evidenceSnapshot,
      liveDocsRootAbsolute,
      docExtension,
      symbolIndex
    });

    const renderDocument = (generatedAt: string): string => {
      const provenance = composeProvenance({
        toolVersion: process.env.LIVE_DOCS_GENERATOR_VERSION ?? "0.1.0",
        generatedAt,
        // Use relative path for hashing to ensure cross-platform consistency
        // (Windows vs Linux paths would produce different hashes)
        sourceRelativePath: normalizedSourcePath,
        analysis
      });

      const metadata: LiveDocMetadata = {
        ...metadataBase,
        generatedAt,
        provenance
      };

      return renderLiveDocMarkdown({
        title,
        metadata,
        authoredBlock,
        sections,
        provenance
      });
    };

    let rendered = renderDocument(initialGeneratedAt);
    let change = classifyChange(existingContent, rendered);

    if (change !== "unchanged" && previousGeneratedAt) {
      if (timestampNow !== initialGeneratedAt) {
        rendered = renderDocument(timestampNow);
        change = classifyChange(existingContent, rendered);
      }
    }

    results.push({
      sourcePath: normalizedSourcePath,
      docPath: docPaths.relative,
      change
    });

    if (change === "unchanged") {
      skipped += 1;
      continue;
    }

    if (options.dryRun) {
      written += 1;
      continue;
    }

    await fs.mkdir(path.dirname(docPaths.absolute), { recursive: true });
    await fs.writeFile(docPaths.absolute, rendered, "utf8");
    written += 1;
  }

  let deletedFiles: string[] = [];
  const shouldPrune = includeSet.size === 0 && !(options.changedOnly ?? false);
  if (shouldPrune) {
    deletedFiles = await pruneStaleLiveDocs({
      workspaceRoot,
      config: normalizedConfig,
      preservedDocPaths: generatedDocPaths,
      dryRun: options.dryRun ?? false,
      logger
    });
  }

  return {
    processed: targetFiles.length,
    written,
    skipped,
    files: results,
    deleted: deletedFiles.length,
    deletedFiles
  };
}


function resolveLiveDocPaths(
  workspaceRoot: string,
  config: LiveDocumentationConfig,
  sourcePath: string,
  extension: string
): { absolute: string; relative: string } {
  const docRelative = path.join(
    config.root,
    config.baseLayer,
    `${sourcePath}${extension}`
  );
  const absolute = path.resolve(workspaceRoot, docRelative);
  return {
    absolute,
    relative: normalizeWorkspacePath(docRelative)
  };
}

async function pruneStaleLiveDocs(args: {
  workspaceRoot: string;
  config: LiveDocumentationConfig;
  preservedDocPaths: Set<string>;
  dryRun: boolean;
  logger: LiveDocGeneratorLogger;
}): Promise<string[]> {
  const baseLayerRoot = path.resolve(args.workspaceRoot, args.config.root, args.config.baseLayer);
  const exists = await directoryExists(baseLayerRoot);
  if (!exists) {
    return [];
  }

  const files = await glob(`**/*${args.config.extension}`, {
    cwd: baseLayerRoot,
    absolute: true,
    nodir: true,
    dot: false,
    windowsPathsNoEscape: true
  });

  files.sort();

  const removed: string[] = [];

  for (const absolute of files) {
    const workspaceRelative = normalizeWorkspacePath(path.relative(args.workspaceRoot, absolute));
    if (args.preservedDocPaths.has(workspaceRelative)) {
      continue;
    }

    const content = await fs.readFile(absolute, "utf8");
    const authoredBlock = extractAuthoredBlock(content);
    if (hasMeaningfulAuthoredContent(authoredBlock)) {
      args.logger.info(`Preserving ${workspaceRelative} (authored content detected)`);
      continue;
    }

    removed.push(workspaceRelative);

    if (args.dryRun) {
      args.logger.info(`(dry-run) Would delete stale Live Doc ${workspaceRelative}`);
      continue;
    }

    await fs.rm(absolute, { force: true });
    await cleanupEmptyParents(path.dirname(absolute), baseLayerRoot);
    args.logger.info(`Deleted stale Live Doc ${workspaceRelative}`);
  }

  return removed;
}

async function readFileIfExists(filePath: string): Promise<string | undefined> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

function buildGeneratedSections(params: {
  analysis: SourceAnalysisResult;
  archetype: LiveDocumentationArchetype;
  docAbsolutePath: string;
  workspaceRoot: string;
  sourceRelativePath: string;
  evidenceSnapshot: EvidenceSnapshot;
  liveDocsRootAbsolute: string;
  docExtension: string;
  symbolIndex?: WorkspaceSymbolIndex;
}): LiveDocRenderSection[] {
  const docDir = path.dirname(params.docAbsolutePath);
  const sourceAbsolute = path.resolve(params.workspaceRoot, params.sourceRelativePath);
  const headings = computePublicSymbolHeadingInfo(params.analysis.symbols);

  const symbolLines = renderPublicSymbolLines({
    analysis: params.analysis,
    docDir,
    sourceAbsolute,
    workspaceRoot: params.workspaceRoot,
    sourceRelativePath: params.sourceRelativePath,
    headings,
    symbolIndex: params.symbolIndex,
    liveDocsRootAbsolute: params.liveDocsRootAbsolute
  });

  const dependencyLines = renderDependencyLines({
    analysis: params.analysis,
    docDir,
    workspaceRoot: params.workspaceRoot,
    liveDocsRootAbsolute: params.liveDocsRootAbsolute,
    docExtension: params.docExtension,
    headings,
    symbolIndex: params.symbolIndex
  });

  const sections: LiveDocRenderSection[] = [
    {
      name: "Public Symbols",
      lines: symbolLines.length ? symbolLines : ["_No public symbols detected_"]
    },
    {
      name: "Dependencies",
      lines: dependencyLines.length ? dependencyLines : ["_No dependencies documented yet_"]
    }
  ];

  if (params.archetype === "implementation") {
    const implementationEvidence = params.evidenceSnapshot.implementationEvidence.get(
      params.sourceRelativePath
    );
    const observedEvidenceLines = renderObservedEvidenceLines({
      implementationEvidence,
      docDir,
      liveDocsRootAbsolute: params.liveDocsRootAbsolute,
      docExtension: params.docExtension
    });

    if (observedEvidenceLines.length > 0) {
      sections.push({
        name: "Observed Evidence",
        lines: observedEvidenceLines
      });
    }
  }

  if (params.archetype === "test") {
    const testEvidence = params.evidenceSnapshot.testEvidence.get(params.sourceRelativePath);
    const targetLines = renderTargetLines({
      testEvidence,
      docDir,
      liveDocsRootAbsolute: params.liveDocsRootAbsolute,
      docExtension: params.docExtension
    });
    const fixtureLines = renderFixtureLines({
      testEvidence,
      docDir,
      workspaceRoot: params.workspaceRoot
    });

    sections.push({
      name: "Targets",
      lines: targetLines.length ? targetLines : ["_No targets documented yet_"]
    });

    sections.push({
      name: "Supporting Fixtures",
      lines: fixtureLines.length ? fixtureLines : ["_No supporting fixtures documented yet_"]
    });
  }

  const reExportAnchorLines = renderReExportedAnchorLines({
    reExports: params.analysis.reExportedSymbols ?? [],
    docDir,
    liveDocsRootAbsolute: params.liveDocsRootAbsolute,
    docExtension: params.docExtension
  });

  if (reExportAnchorLines.length > 0) {
    sections.push({
      name: "Re-Exported Symbol Anchors",
      lines: reExportAnchorLines
    });
  }

  return sections;
}


function renderObservedEvidenceLines(params: {
  implementationEvidence?: ImplementationEvidenceItem[];
  docDir: string;
  liveDocsRootAbsolute: string;
  docExtension: string;
}): string[] {
  const evidence = params.implementationEvidence;
  if (!evidence || evidence.length === 0) {
    return [];
  }

  const lines: string[] = [];
  const hasAutomatedEvidence = evidence.some((entry) => Boolean(entry.testPath) || Boolean(entry.summary));
  const waiverNotes = Array.from(
    new Set(
      evidence
        .filter((entry) => !entry.testPath && !entry.summary && entry.notes?.trim())
        .map((entry) => entry.notes!.trim())
    )
  );

  if (!hasAutomatedEvidence && waiverNotes.length > 0) {
    lines.push(`<!-- evidence-waived: ${waiverNotes.join(" | ")} -->`);
    lines.push("_No automated evidence found_");
  }

  const groups = new Map<string, { suite: string; entries: ImplementationEvidenceItem[] }>();
  for (const entry of evidence) {
    const suite = entry.suite?.trim() || "Evidence";
    const key = `${suite}||${entry.kind}`;
    const bucket = groups.get(key);
    if (bucket) {
      bucket.entries.push(entry);
    } else {
      groups.set(key, { suite, entries: [entry] });
    }
  }

  const sortedGroupKeys = Array.from(groups.keys()).sort((left, right) => {
    const [leftSuite] = left.split("||");
    const [rightSuite] = right.split("||");
    const suiteComparison = leftSuite.localeCompare(rightSuite);
    if (suiteComparison !== 0) {
      return suiteComparison;
    }
    return left.localeCompare(right);
  });

  const sectionLines: string[] = [];
  for (const key of sortedGroupKeys) {
    const group = groups.get(key)!;
    const entries: string[] = [];

    const tests = group.entries
      .filter((entry) => Boolean(entry.testPath))
      .sort((a, b) => (a.testPath ?? "").localeCompare(b.testPath ?? ""));
    const seenTests = new Set<string>();
    for (const entry of tests) {
      const testPath = entry.testPath!;
      if (seenTests.has(testPath)) {
        continue;
      }
      seenTests.add(testPath);
      const testDocAbsolute = path.resolve(
        params.liveDocsRootAbsolute,
        `${testPath}${params.docExtension}`
      );
      const relativeDocPath = formatRelativePathFromDoc(params.docDir, testDocAbsolute);
      entries.push(`- [${formatTargetLabel(testPath)}](${relativeDocPath})`);
    }

    const coverageEntries = group.entries.filter((entry) => !entry.testPath && entry.summary);
    const seenCoverage = new Set<string>();
    for (const entry of coverageEntries) {
      const summary = entry.summary;
      if (!summary) {
        continue;
      }
      const summarySignature = JSON.stringify(summary);
      if (seenCoverage.has(summarySignature)) {
        continue;
      }
      seenCoverage.add(summarySignature);
      entries.push(`- Coverage: ${formatCoverageSummary(summary)}`);
    }

    const waiverEntries = group.entries.filter(
      (entry) => !entry.testPath && !entry.summary && entry.notes?.trim()
    );
    const seenWaivers = new Set<string>();
    for (const entry of waiverEntries) {
      const note = entry.notes!.trim();
      if (!note || seenWaivers.has(note)) {
        continue;
      }
      seenWaivers.add(note);
      entries.push(`- Waiver: ${note}`);
    }

    if (entries.length === 0) {
      continue;
    }

    if (sectionLines.length > 0) {
      sectionLines.push("");
    }
    sectionLines.push(`#### ${group.suite}`);
    sectionLines.push(...entries);
  }

  if (sectionLines.length === 0) {
    return lines;
  }

  if (lines.length > 0) {
    lines.push("");
  }
  lines.push(...sectionLines);
  return lines;
}

function renderTargetLines(params: {
  testEvidence?: TestEvidenceItem;
  docDir: string;
  liveDocsRootAbsolute: string;
  docExtension: string;
}): string[] {
  const evidence = params.testEvidence;
  if (!evidence || evidence.targets.length === 0) {
    return [];
  }

  const seen = new Set<string>();
  const grouped = new Map<string, Array<{ label: string; link: string }>>();

  for (const target of evidence.targets) {
    if (seen.has(target)) {
      continue;
    }
    seen.add(target);

    const docAbsolute = path.resolve(
      params.liveDocsRootAbsolute,
      `${target}${params.docExtension}`
    );
    const relative = formatRelativePathFromDoc(params.docDir, docAbsolute);
    const directory = path.dirname(target);
    const bucket = grouped.get(directory) ?? [];
    bucket.push({
      label: formatTargetLabel(target),
      link: relative
    });
    grouped.set(directory, bucket);
  }

  const lines: string[] = [];
  if (evidence.suite.trim().length > 0) {
    lines.push(`#### ${evidence.suite}`);
  }

  const sortedDirectories = Array.from(grouped.keys()).sort();
  for (const directory of sortedDirectories) {
    const entries = grouped.get(directory)!;
    entries.sort((left, right) => left.label.localeCompare(right.label));
    const linkFragments = entries.map((entry) => `[${entry.label}](${entry.link})`);
    const chunks = chunkArray(linkFragments, 6);

    if (chunks.length === 0) {
      continue;
    }

    const directoryLabel = directory === "." ? "." : directory;
    lines.push(`- ${directoryLabel}: ${chunks[0].join(", ")}`);
    for (let index = 1; index < chunks.length; index += 1) {
      lines.push(`  ${chunks[index].join(", ")}`);
    }
  }

  return lines;
}

function formatTargetLabel(targetPath: string): string {
  const baseName = path.basename(targetPath);
  const lower = baseName.toLowerCase();
  if (lower === "index.ts" || lower === "index.tsx") {
    const parent = path.basename(path.dirname(targetPath));
    return `${parent}/${baseName}`;
  }
  return baseName;
}

function chunkArray<T>(source: T[], size: number): T[][] {
  if (size <= 0) {
    return [source.slice()];
  }
  const result: T[][] = [];
  for (let index = 0; index < source.length; index += size) {
    result.push(source.slice(index, index + size));
  }
  return result;
}

function formatCoverageSummary(summary: CoverageSummary): string {
  const parts: string[] = [];

  const append = (label: string, ratio?: { covered?: number; total?: number; percent?: number }) => {
    if (!ratio) {
      return;
    }
    const covered = typeof ratio.covered === "number" ? ratio.covered : 0;
    const total = typeof ratio.total === "number" ? ratio.total : 0;
    const percentValue = typeof ratio.percent === "number"
      ? ratio.percent
      : total === 0
        ? 0
        : (covered / total) * 100;
    const roundedPercent = Number.isFinite(percentValue)
      ? Math.round(percentValue * 10) / 10
      : 0;
    const percentLabel = Number.isInteger(roundedPercent)
      ? `${roundedPercent}%`
      : `${roundedPercent.toFixed(1)}%`;
    parts.push(`${label} ${percentLabel} (${covered}/${total})`);
  };

  append("lines", summary.lines);
  append("statements", summary.statements);
  append("functions", summary.functions);
  append("branches", summary.branches);

  return parts.length > 0 ? parts.join(", ") : "coverage summary unavailable";
}

function renderFixtureLines(params: {
  testEvidence?: TestEvidenceItem;
  docDir: string;
  workspaceRoot: string;
}): string[] {
  const evidence = params.testEvidence;
  if (!evidence || evidence.fixtures.length === 0) {
    return [];
  }
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const fixture of evidence.fixtures) {
    if (seen.has(fixture)) {
      continue;
    }
    seen.add(fixture);
    const absolute = path.resolve(params.workspaceRoot, fixture);
    const relative = formatRelativePathFromDoc(params.docDir, absolute);
    lines.push(`- ${evidence.suite} - [${fixture}](${relative})`);
  }
  return lines;
}

function extractGeneratedAt(existingContent?: string): string | undefined {
  if (!existingContent) {
    return undefined;
  }

  const match = existingContent.match(/^-\s+Generated At:\s*(.+)$/m);
  if (!match) {
    return undefined;
  }

  const value = match[1]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function composeProvenance(params: {
  toolVersion: string;
  generatedAt: string;
  sourceRelativePath: string;
  analysis: SourceAnalysisResult;
}): LiveDocProvenance {
  const hash = createHash("sha256")
    .update(params.sourceRelativePath)
    .update(JSON.stringify(params.analysis.symbols))
    .update(JSON.stringify(params.analysis.dependencies))
    .digest("hex")
    .slice(0, 16);

  const generator: LiveDocGeneratorProvenance = {
    tool: "live-docs-generator",
    version: params.toolVersion,
    generatedAt: params.generatedAt,
    inputHash: hash
  };

  return {
    generators: [generator]
  };
}

function classifyChange(existingContent: string | undefined, rendered: string): LiveDocWriteKind {
  if (!existingContent) {
    return "created";
  }

  return existingContent === rendered ? "unchanged" : "updated";
}

// Exported for unit testing
export const __testUtils = {
  collectExportedSymbols,
  collectDependencies,
  inferScriptKind,
  resolveArchetype,
  renderPublicSymbolLines
};

// Maintain backwards compatibility for callers that expect default config resolution
export function withDefaultConfig(config?: LiveDocumentationConfig): LiveDocumentationConfig {
  if (!config) {
    return { ...DEFAULT_LIVE_DOCUMENTATION_CONFIG };
  }
  return normalizeLiveDocumentationConfig(config);
}
