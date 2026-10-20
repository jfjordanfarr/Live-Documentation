import { glob } from "glob";
import * as fs from "node:fs/promises";
import path from "node:path";

import {
  type LiveDocumentationConfig,
  normalizeLiveDocumentationConfig
} from "@live-documentation/engine/config/liveDocumentationConfig";
import { analyzeSourceFile, BINARY_SNIFF_BYTES, buildWorkspaceIndexes, composeDependencies, composeEntries, composeReExports, composeSymbolBlocks, computePublicSymbolHeadingInfo, discoverTargetFiles, hasMeaningfulAuthoredContent, isBinaryContent, resolveArchetype, type SourceAnalysisResult, type WorkspaceEntryIndex, type WorkspaceFileIndex, type WorkspaceSymbolIndex } from "@live-documentation/engine/live-docs/core";
import {
  LiveDocSyntaxError,
  authoredBlockOf,
  parseLiveDoc,
  renderLiveDoc,
  type LiveDoc
} from "@live-documentation/engine/live-docs/document";
import { detectChangedFiles } from "@live-documentation/engine/live-docs/gitUtils";
import { readLiveDocGraph, writeLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import {
  normalizeWorkspacePath,
  toWorkspaceFileUri,
  toWorkspaceRelativePath
} from "@live-documentation/engine/tooling/pathUtils";

interface GenerateLiveDocsOptions {
  workspaceRoot: string;
  config?: LiveDocumentationConfig;
  dryRun?: boolean;
  changedOnly?: boolean;
  include?: string[];
  logger?: LiveDocGeneratorLogger;
  now?: () => Date;
  /**
   * Whether a stale doc, one whose source this run does not document, is kept when it holds authored words. True for
   * a person's workspace, so that no written words vanish unread; the history's lens passes false, since a past
   * commit's mirror kept in place must give exactly the files this run documents (2026-10-20).
   */
  keepAuthoredStaleDocs?: boolean;
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
 * Supports `--dry-run` (no writes), `--changed` (process git-dirty sources
 * against full workspace context), and `--include` (explicit file subset)
 * modes. Stale Live Docs whose sources no longer exist are pruned; a
 * changed-only run restricts pruning to changed source paths.
 *
 * Created 2025-11-09; extended with symbol index (2026-01-14), JSON adapter
 * (2026-01-28), cross-platform hash fix (2026-02-03) and the entry index
 * behind the `Entry` lines (2026-10-15).
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

  // A scan never lies inside another scan: say so when this one would, either way round.
  for (const outer of await scansAbove(workspaceRoot, normalizedConfig)) {
    logger.warn(`This folder lies inside a scan at ${outer}; a scan never lies inside another scan. Point at one of them.`);
  }
  for (const inner of await scansWithin(workspaceRoot, normalizedConfig)) {
    logger.warn(`A scan lies inside this folder at ${inner}; a scan never lies inside another scan. Point at one of them.`);
  }

  const workspaceFiles = await discoverTargetFiles({
    workspaceRoot,
    config: normalizedConfig,
    include: new Set(),
    changedOnly: false
  });
  const includedFiles = includeSet.size > 0
    ? await discoverTargetFiles({ workspaceRoot, config: normalizedConfig, include: includeSet, changedOnly: false })
    : workspaceFiles;
  // An explicit include may name a source outside the configured globs. It is
  // still part of the workspace context for this run, but only included files
  // are rendered.
  const allTargetFiles = includeSet.size > 0
    ? [...new Set([...workspaceFiles, ...includedFiles])].sort()
    : workspaceFiles;
  const changedPaths = options.changedOnly ? await detectChangedFiles(workspaceRoot) : undefined;

  // Resolution requires every discovered file, even when only a few are regenerated.
  const fileIndex: WorkspaceFileIndex = new Set(
    allTargetFiles.map((absPath) =>
      normalizeWorkspacePath(path.relative(workspaceRoot, absPath))
    )
  );
  logger.info(`Built file index with ${fileIndex.size} workspace paths`);

  // Build the workspace-wide indexes: symbols for type links and manifests for entries.
  const liveDocsRoot = normalizeWorkspacePath(
    path.join(normalizedConfig.root, normalizedConfig.baseLayer)
  );
  const { symbols: symbolIndex, entries: entryIndex } = await buildWorkspaceIndexes({
    targetFiles: allTargetFiles,
    workspaceRoot,
    liveDocsRoot,
    docExtension: normalizedConfig.extension,
    fileIndex
  });
  logger.info(`Built symbol index with ${symbolIndex.size} unique symbol names and an entry index with ${entryIndex.size} declared files`);

  const targetFiles = changedPaths
    ? includedFiles.filter((absolute) => changedPaths.has(normalizeWorkspacePath(path.relative(workspaceRoot, absolute))))
    : includedFiles;

  const results: LiveDocWriteRecord[] = [];
  let written = 0;
  let skipped = 0;
  const generatedDocPaths = new Set(allTargetFiles.map((absolute) =>
    resolveLiveDocPaths(workspaceRoot, normalizedConfig, normalizeWorkspacePath(path.relative(workspaceRoot, absolute)), normalizedConfig.extension).relative
  ));

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
    const archetype = resolveArchetype(normalizedSourcePath, normalizedConfig, isBinaryContent(await readFileHead(absoluteSourcePath, BINARY_SNIFF_BYTES)));

    const analysis = await analyzeSourceFile(absoluteSourcePath, workspaceRoot, fileIndex, symbolIndex);

    const docPaths = resolveLiveDocPaths(
      workspaceRoot,
      normalizedConfig,
      normalizedSourcePath,
      docExtension
    );
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
      symbolIndex,
      entryIndex,
      config: normalizedConfig
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
  const shouldPrune = includeSet.size === 0;
  if (shouldPrune) {
    deletedFiles = await pruneStaleLiveDocs({
      workspaceRoot,
      config: normalizedConfig,
      preservedDocPaths: generatedDocPaths,
      candidateSourcePaths: changedPaths,
      dryRun: options.dryRun ?? false,
      keepAuthored: options.keepAuthoredStaleDocs ?? true,
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

/** The ancestor folders that are scans of their own: a docs root or a configuration file of this tool above the workspace. */
async function scansAbove(workspaceRoot: string, config: LiveDocumentationConfig): Promise<string[]> {
  const found: string[] = [];
  let current = path.dirname(workspaceRoot);
  for (let depth = 0; depth < 64 && current !== path.dirname(current); depth += 1) {
    if (await isScan(current, config)) {
      found.push(current);
    }
    current = path.dirname(current);
  }
  return found;
}

/** The folders below the workspace that are scans of their own, as workspace-relative paths. */
async function scansWithin(workspaceRoot: string, config: LiveDocumentationConfig): Promise<string[]> {
  const docsRoot = normalizeWorkspacePath(path.join(config.root, config.baseLayer));
  const patterns = [`**/${docsRoot}`, "**/.live-docs.config.json"];
  const matches = await glob(patterns, { cwd: workspaceRoot, dot: true, ignore: ["**/node_modules/**", `${config.root}/**`], windowsPathsNoEscape: true });
  const folders = new Set<string>();
  for (const match of matches) {
    const relative = normalizeWorkspacePath(match);
    const folder = relative.endsWith(docsRoot) ? relative.slice(0, -docsRoot.length).replace(/\/$/u, "") : path.posix.dirname(relative);
    if (folder !== "" && folder !== ".") {
      folders.add(folder);
    }
  }
  return [...folders].sort();
}

async function isScan(folder: string, config: LiveDocumentationConfig): Promise<boolean> {
  for (const candidate of [path.join(folder, config.root, config.baseLayer), path.join(folder, ".live-docs.config.json")]) {
    try {
      await fs.stat(candidate);
      return true;
    } catch {
      // Not there.
    }
  }
  return false;
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
  candidateSourcePaths?: Set<string>;
  dryRun: boolean;
  keepAuthored: boolean;
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
    // A hidden file's doc lives under a hidden path segment (`.vscode/settings.json`), and is pruned like any other.
    dot: true,
    windowsPathsNoEscape: true
  });

  files.sort();

  const removed: string[] = [];

  for (const absolute of files) {
    const workspaceRelative = normalizeWorkspacePath(path.relative(args.workspaceRoot, absolute));
    if (args.candidateSourcePaths) {
      const sourcePath = normalizeWorkspacePath(path.relative(baseLayerRoot, absolute)).slice(0, -args.config.extension.length);
      if (!args.candidateSourcePaths.has(sourcePath)) continue;
    }
    if (args.preservedDocPaths.has(workspaceRelative)) {
      continue;
    }

    const content = await fs.readFile(absolute, "utf8");
    if (args.keepAuthored && hasMeaningfulAuthoredContent(authoredBlockOf(content))) {
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

/** Whether the generated-doc directory exists before pruning it. */
async function directoryExists(candidate: string): Promise<boolean> {
  try {
    const stats = await fs.stat(candidate);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/** Removes empty folders left by a deleted doc, stopping before the docs root. */
async function cleanupEmptyParents(startDir: string, stopDir: string): Promise<void> {
  const stop = path.resolve(stopDir);
  let current = path.resolve(startDir);

  while (current.startsWith(stop) && current !== stop) {
    try {
      const entries = await fs.readdir(current);
      if (entries.length > 0) {
        break;
      }
      await fs.rmdir(current);
      current = path.dirname(current);
    } catch {
      break;
    }
  }
}

/** The first `bytes` of a file, for the content's say on what the file is; fewer when the file is shorter. */
async function readFileHead(filePath: string, bytes: number): Promise<Uint8Array> {
  const handle = await fs.open(filePath, "r");
  try {
    const buffer = new Uint8Array(bytes);
    const { bytesRead } = await handle.read(buffer, 0, bytes, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
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

/** Composes the generated parts of a doc from its source analysis: the Entry lines and the three sections. */
function composeGenerated(params: {
  analysis: SourceAnalysisResult;
  docAbsolutePath: string;
  workspaceRoot: string;
  sourceRelativePath: string;
  liveDocsRootAbsolute: string;
  docExtension: string;
  symbolIndex?: WorkspaceSymbolIndex;
  entryIndex: WorkspaceEntryIndex;
  config: LiveDocumentationConfig;
}): Pick<LiveDoc, "entries" | "symbols" | "dependencies" | "reExports"> {
  const docDir = path.dirname(params.docAbsolutePath);
  const sourceAbsolute = path.resolve(params.workspaceRoot, params.sourceRelativePath);
  const headings = computePublicSymbolHeadingInfo(params.analysis.symbols);

  const entries = composeEntries({
    analysis: params.analysis,
    sourceRelativePath: params.sourceRelativePath,
    headings,
    declaredBy: params.entryIndex.get(params.sourceRelativePath) ?? [],
    config: params.config,
    docDir,
    liveDocsRootAbsolute: params.liveDocsRootAbsolute,
    docExtension: params.docExtension
  });

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
    docExtension: params.docExtension,
    symbolIndex: params.symbolIndex
  });

  return reExports.length > 0 ? { entries, symbols, dependencies, reExports } : { entries, symbols, dependencies };
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
