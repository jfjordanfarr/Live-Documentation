/**
 * Pure host-driven Live Documentation generator core.
 *
 * @remarks
 * Written 2026-11-24 for Steps 7 & 8 of the road to one engine for a page and a command line
 * (`.mdmd/layer-3/engine-and-hosts.mdmd.md`, section 6). Runs the full generation pipeline over an explicit
 * {@link FileHost} without importing Node's disk host, grammar loader, or git subprocess wrappers:
 * - grammars are registered from `host.grammars` when supplied;
 * - git ignore listings and `--changed` status come from `host.git` when supplied, otherwise falling back cleanly
 *   to the root `.gitignore` (through `leaveOut.ts`) or an explicit `options.leaveOut` list;
 * - ancestor scan checks come from `host.scansAbove` when supplied; when absent or returning `undefined` (as in a
 *   browser page), the run warns once rather than guessing.
 *
 * Node callers use `generateLiveDocs` in `generator.ts`, which supplies Node's default hosts and delegates here.
 *
 * @module
 */
import * as fs from "node:fs/promises";
import path from "node:path";

import {
  hasReader,
  type LiveDocumentationConfig,
  noReaderHandles,
  normalizeLiveDocumentationConfig
} from "@live-documentation/engine/config/liveDocumentationConfig";
import type { WorkspaceFileIndex } from "@live-documentation/engine/live-docs/adapters";
import { setGrammarHost } from "@live-documentation/engine/live-docs/adapters/treeSitter";
import { BINARY_SNIFF_BYTES, hasMeaningfulAuthoredContent, isBinaryContent, resolveArchetype } from "@live-documentation/engine/live-docs/archetype";
import {
  composeCitedBy,
  composeDependencies,
  composeEntries,
  composeReExports,
  composeSymbolBlocks,
  computePublicSymbolHeadingInfo
} from "@live-documentation/engine/live-docs/compose";
import type {
  SourceAnalysisResult,
  WorkspaceEntryIndex,
  WorkspaceSymbolIndex,
  WorkspaceTestIndex
} from "@live-documentation/engine/live-docs/coreTypes";
import {
  buildWorkspaceIndexes,
  discoverDocumentsWithHost,
  discoverTargetFilesWithHost,
  discoverWorkspaceTargetFilesWithHost,
  inWorkspaceOrder
} from "@live-documentation/engine/live-docs/discoveryCore";
import {
  DEFAULT_AUTHORED_BLOCK,
  LiveDocSyntaxError,
  UNREAD_AUTHORED_BLOCK,
  authoredBlockOf,
  parseLiveDoc,
  renderLiveDoc,
  type LiveDoc
} from "@live-documentation/engine/live-docs/document";
import { readLiveDocGraph, writeLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import { markProcess } from "@live-documentation/engine/live-docs/processMark";
import { citingDocuments, isMarkdownDocument, type DocumentText } from "@live-documentation/engine/live-docs/relatedDocs";
import { analyzeSourceFile as defaultAnalyzeSourceFile } from "@live-documentation/engine/live-docs/sourceAnalysis";
import { leaveOut, type LeaveOutInput } from "@live-documentation/engine/tooling/leaveOut";
import { normalizeWorkspacePath, toWorkspaceRelativePath } from "@live-documentation/engine/tooling/pathUtils";
import { readSourceReading, throwIfMachineFailure, type SourceTextReading } from "@live-documentation/engine/tooling/sourceText";
import { type FileHost, type WorkspaceReads, workspaceReads } from "@live-documentation/engine/tooling/workspaceFiles";
import { workspaceListing } from "@live-documentation/engine/tooling/workspaceListing";
import { walkWorkspace } from "@live-documentation/engine/tooling/workspaceWalk";

/** Options for the Node-defaulted generator entry point (`generateLiveDocs`). */
export interface GenerateLiveDocsOptions {
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
  /**
   * What the scan reads the workspace's files and lists its folders through: the disk, by Node, unless another host is
   * handed, as the check that the engine runs in a page hands one over the folder a person picked (2026-11-22).
   */
  host?: FileHost;
  /**
   * Optional explicit leave-out pattern list (the owner's one list). When provided, it decides folder pruning and file
   * filtering directly on the host listing, bypassing git ignore rules.
   */
  leaveOut?: LeaveOutInput;
}

/** Options for {@link runLiveDocs}: requires an explicit {@link FileHost} and pulls in no Node defaults. */
export interface RunLiveDocsOptions extends Omit<GenerateLiveDocsOptions, "host"> {
  /** The host supplying file reads, folder listings, and optional grammars, git, and ancestor scan ports. */
  host: FileHost;
  /** Optional source analyzer hook (defaults to `analyzeSourceFile` from `sourceAnalysis.ts`). */
  analyze?: typeof defaultAnalyzeSourceFile;
}

/** Logger interface accepted by the Live Documentation generator. */
export interface LiveDocGeneratorLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

/**
 * Summary returned by {@link runLiveDocs} and `generateLiveDocs` after processing all target files.
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
  /**
   * The files the run could not map, by source path, with the reason and the error itself, whose stack the command
   * prints under `--stack`: skipped, while the run went on (2026-11-19).
   */
  failed: Array<{ sourcePath: string; reason: string; error: unknown }>;
  /** Which files a rule other than UTF-8 read, and which were not read as text at all, by the one reading step. */
  readings: SourceReadings;
  /** What the readers said they left undrawn, a reason at a time in the order first met, each subject as `<source path>: <subject>`. */
  notices: Array<{ reason: string; subjects: string[] }>;
}

/** The files the one reading step read as UTF-16 or as Windows-1252, and those it did not read as text, by source path. */
export interface SourceReadings {
  utf16: string[];
  windows1252: string[];
  unread: Array<{ sourcePath: string; reason: string }>;
}

/** How a target file's Live Doc changed during a run. */
export type LiveDocWriteKind = "created" | "updated" | "unchanged" | "skipped";

/** Per-file outcome record emitted by the generator. */
export interface LiveDocWriteRecord {
  sourcePath: string;
  docPath: string;
  change: LiveDocWriteKind;
}

/** This tool's configuration file, whose presence makes a folder a scan of its own. */
const CONFIGURATION_FILE = ".live-docs.config.json";

/**
 * What makes a folder a scan of its own, by names alone: a docs root (`<root>/<baseLayer>`) or a configuration file of
 * this tool in it, named once for the search above the workspace and the search below it ({@link scansWithin}).
 */
export function scanMarkers(config: Pick<LiveDocumentationConfig, "root" | "baseLayer">): { docsRoot: string; configurationFile: string } {
  return { docsRoot: normalizeWorkspacePath(path.join(config.root, config.baseLayer)), configurationFile: CONFIGURATION_FILE };
}

const DEFAULT_LOGGER: LiveDocGeneratorLogger = {
  info: (message) => console.log(`[live-docs] ${message}`),
  warn: (message) => console.warn(`[live-docs] ${message}`),
  error: (message) => console.error(`[live-docs] ${message}`)
};

/**
 * Pure host-driven Live Documentation generation pipeline: discovers files through `options.host`, analyses each for
 * public symbols and dependencies, renders deterministic markdown docs, prunes stale docs, and derives the graph index.
 */
export async function runLiveDocs(
  options: RunLiveDocsOptions
): Promise<LiveDocGeneratorResult> {
  const logger = options.logger ?? DEFAULT_LOGGER;
  const normalizedConfig = normalizeLiveDocumentationConfig(options.config);
  const workspaceRoot = path.resolve(options.workspaceRoot);
  const now = options.now ?? (() => new Date());
  const analyzeSource = options.analyze ?? defaultAnalyzeSourceFile;

  const includeSet = new Set<string>((options.include ?? []).map((entry) => normalizeWorkspacePath(entry)));
  const host = options.host;
  if (host.grammars) {
    setGrammarHost(host.grammars);
  }
  const reads = workspaceReads(host, BINARY_SNIFF_BYTES);

  // A scan never lies inside another scan: say so when this one would, either way round, and write the docs all the
  // same, for the generator warns and the estate reader refuses (the World Map's first ticket, 2026-10-09). A host
  // that cannot inspect folders above the workspace (a browser page) answers `undefined`, and the run says so once
  // without guessing (`.mdmd/layer-3/engine-and-hosts.mdmd.md`, section 4).
  const outerScans = host.scansAbove ? await host.scansAbove(workspaceRoot, normalizedConfig) : undefined;
  if (outerScans === undefined) {
    logger.warn("Whether this folder lies inside another scan cannot be seen from a page.");
  } else {
    for (const outer of outerScans) {
      logger.warn(`This folder lies inside the scan at ${outer}. Its docs are written all the same, but a scan never lies inside another: a board that names both reads only the scan at ${outer}.`);
    }
  }
  for (const inner of await scansWithin(workspaceRoot, normalizedConfig, host, options.leaveOut)) {
    logger.warn(`A scan lies inside this folder at ${inner}. This folder's docs are written all the same, but a scan never lies inside another: a board that names both reads only the scan of this folder.`);
  }

  const { files: workspaceFiles, isLeftOut } = await discoverWorkspaceTargetFilesWithHost({
    workspaceRoot,
    config: normalizedConfig,
    include: new Set(),
    changedOnly: false,
    host,
    reads,
    leaveOut: options.leaveOut,
    warn: (message) => logger.warn(message)
  });
  const includedFiles = includeSet.size > 0
    ? await discoverTargetFilesWithHost({ workspaceRoot, config: normalizedConfig, include: includeSet, changedOnly: false, host, reads, leaveOut: options.leaveOut, warn: (message) => logger.warn(message) })
    : workspaceFiles;
  // An explicit include may name a source outside the configured globs. It is
  // still part of the workspace context for this run, but only included files
  // are rendered.
  const allTargetFiles = includeSet.size > 0
    ? inWorkspaceOrder([...new Set([...workspaceFiles, ...includedFiles])].map((file) => ({ file, relative: normalizeWorkspacePath(path.relative(workspaceRoot, file)) }))).map(({ file }) => file)
    : workspaceFiles;
  let changedPaths: Set<string> | undefined;
  if (options.changedOnly) {
    if (!host.git) {
      throw new Error(`Cannot use --changed in ${workspaceRoot}: this host has no Git access.`);
    }
    changedPaths = await host.git.changedFiles(workspaceRoot);
  }

  // Resolution requires every discovered file, even when only a few are regenerated. The index also answers each
  // path's archetype under this run's configuration, so that a reader telling a test from working code reads the
  // workspace's overrides and sample roots, as the docs' `Archetype` lines do (2026-11-19, the PowerShell probe), and,
  // once the first pass has gathered them, the readers' facts of which files exist for the tests (2026-11-21).
  // It also carries the run's reads (`workspaceFiles.ts`): every reader, every table a reader builds from many files,
  // the binary test and the count of how each file was decoded take a file's bytes from one read of the run, through
  // the host (2026-11-22; before, each file was read three to five times).
  const gathered: { tests?: WorkspaceTestIndex } = {};
  // And it answers a reader's probes, what lies at a path and what a folder holds, from the listing of the kept files
  // alone, so that no reader sees a file the scan leaves out (2026-11-22, `workspaceListing.ts`), and whether an
  // unresolved path was deliberately left out by the scan's rules (`isLeftOut`, 2026-11-24).
  const keptPaths = allTargetFiles.map((absPath) => normalizeWorkspacePath(path.relative(workspaceRoot, absPath)));
  const fileIndex: WorkspaceFileIndex = Object.assign(
    new Set(keptPaths),
    { archetypeOf: (file: string) => resolveArchetype(file, normalizedConfig, false, gathered.tests), isLeftOut },
    reads,
    workspaceListing(workspaceRoot, keptPaths)
  );
  logger.info(`Built file index with ${fileIndex.size} workspace paths`);

  // Build the workspace-wide indexes: symbols for type links and manifests for entries.
  const liveDocsRoot = normalizeWorkspacePath(
    path.join(normalizedConfig.root, normalizedConfig.baseLayer)
  );
  const { symbols: symbolIndex, entries: entryIndex, tests, unmapped: unindexed } = await buildWorkspaceIndexes({
    targetFiles: allTargetFiles,
    workspaceRoot,
    liveDocsRoot,
    docExtension: normalizedConfig.extension,
    fileIndex
  });
  gathered.tests = tests;
  logger.info(`Built symbol index with ${symbolIndex.size} unique symbol names and an entry index with ${entryIndex.size} declared files`);

  // The documents that cite each file, for the `Cited By` sections, read from every markdown document discovery finds
  // whatever subset this run renders, so that a section says the same whichever run wrote it.
  const citedByIndex = normalizedConfig.citedBy
    ? citingDocuments(await readMarkdownDocuments(workspaceRoot, normalizedConfig, host, reads, options.leaveOut, (message) => logger.warn(message)), fileIndex, normalizedConfig, normalizedConfig.bundleExclude)
    : new Map<string, string[]>();
  if (normalizedConfig.citedBy) {
    logger.info(`Read the documents' links: ${[...citedByIndex.values()].reduce((sum, documents) => sum + documents.length, 0)} citations of ${citedByIndex.size} files`);
  }

  const targetFiles = changedPaths
    ? includedFiles.filter((absolute) => changedPaths.has(normalizeWorkspacePath(path.relative(workspaceRoot, absolute))))
    : includedFiles;

  const results: LiveDocWriteRecord[] = [];
  const failed: Array<{ sourcePath: string; reason: string; error: unknown }> = [];
  const readings: SourceReadings = { utf16: [], windows1252: [], unread: [] };
  const notices = new Map<string, string[]>();
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
    const relativeSourcePath = toWorkspaceRelativePath(absoluteSourcePath, workspaceRoot);

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
    // A file that cannot be mapped, because it cannot be read or because the doc written for it is one the grammar's
    // own reader refuses, is skipped and named by its source path, and the run goes on (2026-11-19).
    try {
      // A file whose reading threw in the index pass is one this run could not map, though it reads here.
      if (unindexed.has(absoluteSourcePath)) throw unindexed.get(absoluteSourcePath);
      // Which rule of the one reading step reads the file's text, counted for the run's last lines, where a reader reads it;
      // read before its first bytes, so that the binary test takes its bytes from that read and asks the host nothing more.
      if (hasReader(normalizedSourcePath)) {
        noteReading(readings, normalizedSourcePath, await readSourceReading(absoluteSourcePath, fileIndex));
      }
      const archetype = resolveArchetype(normalizedSourcePath, normalizedConfig, isBinaryContent(await reads.headOf(absoluteSourcePath, BINARY_SNIFF_BYTES)), tests);

      const analysis = await analyzeSource(absoluteSourcePath, workspaceRoot, fileIndex, symbolIndex);
      // What the reader says it left undrawn, counted a reason across files for the run's last lines; never written into the doc.
      for (const notice of analysis.notices ?? []) {
        const subjects = notices.get(notice.reason);
        if (subjects === undefined) notices.set(notice.reason, [`${normalizedSourcePath}: ${notice.subject}`]);
        else subjects.push(`${normalizedSourcePath}: ${notice.subject}`);
      }

      const docPaths = resolveLiveDocPaths(
        workspaceRoot,
        normalizedConfig,
        normalizedSourcePath,
        docExtension
      );
      const existingContent = await readFileIfExists(docPaths.absolute);
      const existing = readExisting(existingContent, noReaderHandles(normalizedSourcePath) ? UNREAD_AUTHORED_BLOCK : DEFAULT_AUTHORED_BLOCK);
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
        citedBy: citedByIndex.get(normalizedSourcePath) ?? [],
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

      // Read back by the grammar's own reader before it is written: a doc the reader refuses would stop every later read.
      try {
        parseLiveDoc(rendered);
      } catch (error) {
        throw error instanceof LiveDocSyntaxError ? new Error(`Live Documentation wrote a doc for it that its own reader refuses: ${error.message}`, { cause: error }) : error;
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
    } catch (error) {
      // Whatever was thrown, a stack run short among it, a process that lives across generations may have read the file
      // where a fresh one would not, or the other way round (`processMark.ts`).
      markProcess("unmapped");
      failed.push({ sourcePath: normalizedSourcePath, reason: error instanceof Error ? error.message : String(error), error });
      const docAbsolutePath = resolveLiveDocPaths(workspaceRoot, normalizedConfig, normalizedSourcePath, docExtension).absolute;
      // Where no stale doc is kept for its words (the history's scratch tree), no doc written on another day stands in
      // for a file this run could not map; a person's workspace keeps it, for its words, and the command says so.
      if (options.keepAuthoredStaleDocs === false && !options.dryRun) await removeDocOfUnmapped(docAbsolutePath);
      else await removeRefusedDoc(docAbsolutePath, options.dryRun ?? false);
    }
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
      host,
      logger
    });
  }

  let index: string | undefined;
  if (!options.dryRun) {
    index = await writeLiveDocGraph(await readLiveDocGraph({ workspaceRoot, config: normalizedConfig, host }), workspaceRoot);
    logger.info(`Wrote the graph index to ${index}`);
  }

  return {
    processed: targetFiles.length,
    written,
    skipped,
    files: results,
    deleted: deletedFiles.length,
    deletedFiles,
    index,
    failed,
    readings,
    notices: [...notices].map(([reason, subjects]) => ({ reason, subjects }))
  };
}

/** Counts which rule read a file's text: the files read as UTF-16 or as Windows-1252, and those not read as text at all. */
function noteReading(readings: SourceReadings, sourcePath: string, reading: SourceTextReading): void {
  if (reading.encoding === "unread") {
    readings.unread.push({ sourcePath, reason: reading.reason });
  } else if (reading.encoding === "windows-1252") {
    readings.windows1252.push(sourcePath);
  } else if (reading.encoding.startsWith("utf-16")) {
    readings.utf16.push(sourcePath);
  }
}

/**
 * Removes the doc of a file this run could not map when the grammar's reader refuses it and it holds no words of a
 * person's: the leftover of an earlier run that stopped on that file, which would otherwise stop the index's read.
 * A doc the reader reads, or one that holds authored words, is left as it is.
 */
async function removeRefusedDoc(docAbsolutePath: string, dryRun: boolean): Promise<void> {
  // A doc path longer than the disk holds holds no doc: the file is named as one that could not be mapped, and the run
  // goes on (until 2026-11-20 this read's failure stopped the whole run).
  const text = await readFileIfExists(docAbsolutePath).catch((error: unknown) => {
    if ((error as NodeJS.ErrnoException).code === "ENAMETOOLONG") return undefined;
    throw error;
  });
  if (text === undefined || dryRun) {
    return;
  }
  try {
    parseLiveDoc(text);
  } catch (error) {
    if (error instanceof LiveDocSyntaxError && !hasMeaningfulAuthoredContent(authoredBlockOf(text))) {
      await fs.rm(docAbsolutePath, { force: true });
    }
  }
}

/**
 * Removes the doc of a file this run could not map, where no stale doc is kept for its words: a doc written on another
 * day must not stand in for it. A doc path longer than the disk holds holds no doc, so there is nothing to remove.
 */
async function removeDocOfUnmapped(docAbsolutePath: string): Promise<void> {
  try {
    await fs.rm(docAbsolutePath, { force: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENAMETOOLONG") throw error;
  }
}

/** The workspace's markdown documents with their text, as discovery finds them; another kind of document has no markdown links. */
async function readMarkdownDocuments(
  workspaceRoot: string,
  config: LiveDocumentationConfig,
  host: FileHost,
  reads: WorkspaceReads,
  leaveOutInput: LeaveOutInput | undefined,
  warn: (message: string) => void
): Promise<DocumentText[]> {
  const documents = (await discoverDocumentsWithHost({ workspaceRoot, config, host, reads, leaveOut: leaveOutInput, warn })).filter(isMarkdownDocument);
  return Promise.all(documents.map(async (relative) => ({ path: relative, text: await fs.readFile(path.join(workspaceRoot, relative), "utf8") })));
}

/** The folders below the workspace that are scans of their own, as workspace-relative paths. */
async function scansWithin(
  workspaceRoot: string,
  config: LiveDocumentationConfig,
  host: FileHost,
  leaveOutInput?: LeaveOutInput
): Promise<string[]> {
  const { docsRoot, configurationFile } = scanMarkers(config);
  const rootFolder = normalizeWorkspacePath(config.root);
  const decider = leaveOutInput ? leaveOut({ ...leaveOutInput, ownOutput: [...(leaveOutInput.ownOutput ?? []), rootFolder] }) : undefined;
  const prunedFolders = decider ? undefined : host.git?.ignores(workspaceRoot)?.folders;
  const matches: string[] = [];

  const visit = async (relativeFolder: string): Promise<void> => {
    const absoluteFolder = relativeFolder === "" ? workspaceRoot : path.join(workspaceRoot, relativeFolder);
    let entries;
    try {
      entries = await host.entries(absoluteFolder);
    } catch {
      return;
    }
    if (relativeFolder !== "" && entries.files.includes(configurationFile)) {
      matches.push(`${relativeFolder}/${configurationFile}`);
    }
    for (const folder of entries.folders) {
      if (folder === "node_modules" || folder === ".git") continue;
      const childRelative = relativeFolder === "" ? folder : `${relativeFolder}/${folder}`;
      if (childRelative === rootFolder || childRelative.startsWith(`${rootFolder}/`)) continue;
      if (decider?.folder(childRelative).prunable || prunedFolders?.has(childRelative)) continue;
      if (childRelative.endsWith(`/${docsRoot}`)) {
        matches.push(childRelative);
      }
      await visit(childRelative);
    }
  };

  if (!prunedFolders?.has("")) {
    await visit("");
  }
  if (matches.length === 0) return [];
  // What git ignores is never part of the map (the owner, 2026-10-19), so a docs root or a configuration there, as in
  // another agent's worktree, makes no scan; without git, every one counts.
  const ignored = decider ? null : (host.git?.ignored(workspaceRoot, matches) ?? null);
  const folders = new Set<string>();
  for (const relative of matches) {
    const isDocsMarker = relative.endsWith(`/${docsRoot}`);
    if (decider ? !(isDocsMarker ? decider.folder(relative).kept : decider.file(relative).kept) : ignored?.has(relative)) {
      continue;
    }
    const folder = isDocsMarker ? relative.slice(0, -docsRoot.length).replace(/\/$/u, "") : path.posix.dirname(relative);
    if (folder !== "" && folder !== ".") {
      folders.add(folder);
    }
  }
  return [...folders].sort();
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
  host: FileHost;
  logger: LiveDocGeneratorLogger;
}): Promise<string[]> {
  const baseLayerRoot = path.resolve(args.workspaceRoot, args.config.root, args.config.baseLayer);
  const exists = await directoryExists(baseLayerRoot);
  if (!exists) {
    return [];
  }

  const walked = await walkWorkspace({ workspaceRoot: baseLayerRoot, host: args.host });
  if (walked.unreadable.length > 0) {
    throw walked.unreadable[0].error;
  }
  const files = walked.files
    .filter((entry) => entry.relative.endsWith(args.config.extension))
    .map((entry) => entry.absolute)
    .sort();

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

/**
 * Whether the generated-doc directory exists before pruning it. A probe that fails for a cause of the machine's is not
 * a folder that is gone: the run stops with it, so that no pruning is skipped or done on a guess (since 2026-11-20).
 */
async function directoryExists(candidate: string): Promise<boolean> {
  try {
    const stats = await fs.stat(candidate);
    return stats.isDirectory();
  } catch (error) {
    throwIfMachineFailure(error);
    return false;
  }
}

/**
 * Removes empty folders left by a deleted doc, stopping before the docs root, or at a folder that is gone, holds
 * something or cannot be read or removed. A failure of any kind, the machine's among them, leaves the folder: this is
 * tidying, no doc and no fact is read from an empty folder, and a run stopped here would pass on a plain second try
 * with nothing mended, since the stale doc is already gone and its folder never visited again; on Windows a folder
 * another program holds (`EBUSY`, `EPERM`) is an ordinary thing to meet (the root's ruling, 2026-11-20).
 */
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

/** Composes the generated parts of a doc from its source analysis and the documents that cite it: the Entry lines and the sections. */
function composeGenerated(params: {
  analysis: SourceAnalysisResult;
  docAbsolutePath: string;
  workspaceRoot: string;
  sourceRelativePath: string;
  liveDocsRootAbsolute: string;
  docExtension: string;
  symbolIndex?: WorkspaceSymbolIndex;
  entryIndex: WorkspaceEntryIndex;
  /** The workspace-relative paths of the documents whose links name the file. */
  citedBy: readonly string[];
  config: LiveDocumentationConfig;
}): Pick<LiveDoc, "entries" | "symbols" | "dependencies" | "citedBy" | "reExports"> {
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
    liveDocsRootAbsolute: params.liveDocsRootAbsolute,
    dependencies: params.analysis.dependencies
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
    headings,
    docDir,
    liveDocsRootAbsolute: params.liveDocsRootAbsolute,
    docExtension: params.docExtension,
    symbolIndex: params.symbolIndex
  });

  const citedBy = composeCitedBy({ documents: params.citedBy, docDir, workspaceRoot: params.workspaceRoot });

  return {
    entries,
    symbols,
    dependencies,
    ...(citedBy.length > 0 ? { citedBy } : {}),
    ...(reExports.length > 0 ? { reExports } : {})
  };
}

/**
 * What a run keeps of the doc already on disk: its authored block and its timestamp.
 *
 * A doc the grammar refuses, written before the grammar or by hand, still keeps
 * both; everything generated is replaced on this run anyway. A new doc starts
 * with `fresh`: the pending placeholders, or for a file no reader handles the
 * note saying so. The note is written once, when the doc is made, and is the
 * author's to keep or revise from then on.
 */
function readExisting(text: string | undefined, fresh: string): { authored: string; generatedAt?: string } {
  if (!text) {
    return { authored: fresh };
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

  // A doc checked out with CRLF line endings, as Git for Windows does by default, saved with CR alone, or given a
  // byte-order mark, as Windows PowerShell 5.1 gives any file that passes through it, is the doc written with LF and no
  // mark: the reader reads them alike, so neither a check nor a run calls it changed or rewrites it for those alone. A
  // doc the generator writes is written with LF and no mark.
  return existingContent.replace(/^\ufeff/u, "").replace(/\r\n?/gu, "\n") === rendered ? "unchanged" : "updated";
}
