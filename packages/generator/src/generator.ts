import { glob } from "glob";
import * as fs from "node:fs/promises";
import path from "node:path";

import {
  type LiveDocumentationConfig,
  normalizeLiveDocumentationConfig
} from "@live-documentation/shared/config/liveDocumentationConfig";
import {
  analyzeSourceFile,
  buildWorkspaceSymbolIndex,
  cleanupEmptyParents,
  directoryExists,
  discoverTargetFiles,
  hasMeaningfulAuthoredContent,
  computePublicSymbolHeadingInfo,
  composeDependencies,
  composeReExports,
  composeSymbolBlocks,
  resolveArchetype,
  type SourceAnalysisResult,
  type WorkspaceFileIndex,
  type WorkspaceSymbolIndex
} from "@live-documentation/shared/live-docs/core";
import {
  LiveDocSyntaxError,
  authoredBlockOf,
  parseLiveDoc,
  renderLiveDoc,
  type LiveDoc
} from "@live-documentation/shared/live-docs/document";
import { readLiveDocGraph, writeLiveDocGraph } from "@live-documentation/shared/live-docs/graphFiles";
import {
  normalizeWorkspacePath,
  toWorkspaceFileUri,
  toWorkspaceRelativePath
} from "@live-documentation/shared/tooling/pathUtils";

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

/**
 * Summary returned by {@link generateLiveDocs} after processing all target files.
 *
 * The caller uses `written` and `deleted` counts for progress reporting, while
 * the `files` array gives per-file detail for dry-run previews and CI checks.
 */
export interface LiveDocGeneratorResult {
  processed: number;
  written: number;
  skipped: number;
  files: LiveDocWriteRecord[];
  deleted: number;
  deletedFiles: string[];
  /** Workspace-relative path of the graph index written after the run; absent on a dry run. */
  index?: string;
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

/**
 * Entry point for the Live Documentation generation pipeline.
 *
 * Discovers all workspace files matching the configured globs, analyses each for
 * public symbols and dependencies, and renders deterministic markdown docs under
 * the configured base layer directory. A doc is rewritten only when its generated
 * content changed, and only then does its `Generated At` line move. After a run
 * that writes, the graph index is derived from every doc on disk and written to
 * `<root>/index.json`.
 *
 * Supports `--dry-run` (no writes), `--changed` (process only git-dirty files),
 * and `--include` (explicit file subset) modes. Stale Live Docs whose source
 * files no longer exist are pruned automatically (unless `changedOnly` is set).
 *
 * Created 2025-11-09; extended with symbol index (2026-01-14), JSON adapter
 * (2026-01-28), and cross-platform hash fix (2026-02-03).
 *
 * @param options - Generation configuration including workspace root, config overrides, and logger.
 */
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

    const analysis = await analyzeSourceFile(absoluteSourcePath, workspaceRoot, fileIndex);

    const docPaths = resolveLiveDocPaths(
      workspaceRoot,
      normalizedConfig,
      normalizedSourcePath,
      docExtension
    );
    generatedDocPaths.add(docPaths.relative);
    const existingContent = await readFileIfExists(docPaths.absolute);
    const existing = readExisting(existingContent);
    const timestampNow = now().toISOString();
    const initialGeneratedAt = existing.generatedAt ?? timestampNow;

    const generated = composeGenerated({
      analysis,
      docAbsolutePath: docPaths.absolute,
      workspaceRoot,
      sourceRelativePath: normalizedSourcePath,
      liveDocsRootAbsolute,
      docExtension,
      symbolIndex
    });

    const renderDocument = (generatedAt: string): string =>
      renderLiveDoc({
        codePath: normalizedSourcePath,
        layer: 4,
        archetype,
        generatedAt,
        authored: existing.authored,
        ...generated
      });

    let rendered = renderDocument(initialGeneratedAt);
    let change = classifyChange(existingContent, rendered);

    if (change !== "unchanged" && existing.generatedAt) {
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

  let index: string | undefined;
  if (!options.dryRun) {
    index = await writeLiveDocGraph(await readLiveDocGraph({ workspaceRoot, config: normalizedConfig }), workspaceRoot);
    logger.info(`Wrote the graph index to ${index}`);
  }

  return {
    processed: targetFiles.length,
    written,
    skipped,
    files: results,
    deleted: deletedFiles.length,
    deletedFiles,
    index
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
    if (hasMeaningfulAuthoredContent(authoredBlockOf(content))) {
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

/** Composes the generated sections of a doc from its source analysis. */
function composeGenerated(params: {
  analysis: SourceAnalysisResult;
  docAbsolutePath: string;
  workspaceRoot: string;
  sourceRelativePath: string;
  liveDocsRootAbsolute: string;
  docExtension: string;
  symbolIndex?: WorkspaceSymbolIndex;
}): Pick<LiveDoc, "symbols" | "dependencies" | "reExports"> {
  const docDir = path.dirname(params.docAbsolutePath);
  const sourceAbsolute = path.resolve(params.workspaceRoot, params.sourceRelativePath);
  const headings = computePublicSymbolHeadingInfo(params.analysis.symbols);

  const symbols = composeSymbolBlocks({
    headings,
    docDir,
    sourceAbsolute,
    sourceRelativePath: params.sourceRelativePath,
    symbolIndex: params.symbolIndex,
    liveDocsRootAbsolute: params.liveDocsRootAbsolute
  });

  const dependencies = composeDependencies({
    analysis: params.analysis,
    docDir,
    liveDocsRootAbsolute: params.liveDocsRootAbsolute,
    docExtension: params.docExtension,
    headings,
    symbolIndex: params.symbolIndex
  });

  const reExports = composeReExports({
    reExports: params.analysis.reExportedSymbols ?? [],
    docDir,
    liveDocsRootAbsolute: params.liveDocsRootAbsolute,
    docExtension: params.docExtension
  });

  return reExports.length > 0 ? { symbols, dependencies, reExports } : { symbols, dependencies };
}

/**
 * What a run keeps of the doc already on disk: its authored block and its timestamp.
 *
 * A doc the grammar refuses, written before the grammar or by hand, still keeps
 * both; everything generated is replaced on this run anyway.
 */
function readExisting(text: string | undefined): { authored: string; generatedAt?: string } {
  if (!text) {
    return { authored: authoredBlockOf(undefined) };
  }
  try {
    const doc = parseLiveDoc(text);
    return { authored: doc.authored, generatedAt: doc.generatedAt };
  } catch (error) {
    if (!(error instanceof LiveDocSyntaxError)) {
      throw error;
    }
    const generatedAt = /^- Generated At:\s*(.+)$/mu.exec(text)?.[1].trim();
    return { authored: authoredBlockOf(text), generatedAt: generatedAt || undefined };
  }
}

function classifyChange(existingContent: string | undefined, rendered: string): LiveDocWriteKind {
  if (!existingContent) {
    return "created";
  }

  return existingContent === rendered ? "unchanged" : "updated";
}
