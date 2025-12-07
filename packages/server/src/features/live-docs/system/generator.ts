import { glob } from "glob";
import * as fs from "node:fs/promises";
import path from "node:path";

import {
  normalizeLiveDocumentationConfig,
  type LiveDocumentationConfig
} from "@live-documentation/shared/config/liveDocumentationConfig";
import type { CoActivationReport } from "@live-documentation/shared/live-docs/analysis/coActivation";
import {
  cleanupEmptyParents,
  directoryExists,
  hasMeaningfulAuthoredContent
} from "@live-documentation/shared/live-docs/core";
import {
  extractAuthoredBlock,
  renderLiveDocMarkdown,
  type LiveDocRenderSection
} from "@live-documentation/shared/live-docs/markdown";
import {
  normalizeLiveDocMetadata,
  type LiveDocMetadata,
  type LiveDocProvenance
} from "@live-documentation/shared/live-docs/schema";
import type { Stage0Doc } from "@live-documentation/shared/live-docs/types";
import { normalizeWorkspacePath } from "@live-documentation/shared/tooling/pathUtils";

import {
  DEFAULT_CO_ACTIVATION_RELATIVE_PATH,
  DEFAULT_LOGGER,
  LIVE_DOCS_SEGMENT,
  SUPPORTED_LAYER3_ARCHETYPES,
  SYSTEM_LAYER_NAME
} from "./constants";
import {
  buildComponentPlans,
  buildCoActivationPlans,
  buildInteractionPlans,
  buildTestingPlans,
  buildWorkflowPlans,
  isImplementationDoc
} from "./plans";
import {
  renderActivationSection,
  renderComponentsSection,
  renderPublicSymbolsSection,
  renderTopologySection
} from "./rendering";
import { buildStageSequence, extractRunAllStageDescriptors } from "./stageSequence";
import type {
  GeneratedSystemDocument,
  GenerateSystemLiveDocsOptions,
  SystemDocPlan,
  SystemGeneratorLogger,
  SystemLiveDocGeneratorResult,
  SystemLiveDocWriteRecord
} from "./types";
import {
  classifyChange,
  extractGeneratedAt,
  isCompiledArtifactPath,
  readIfExists,
  resolveOutputDirectory,
  resolveSystemDocPaths,
  stripCodePathLine,
  systemMetadataSourcePath
} from "./utils";
import { loadStage0Docs } from "../stage0/docLoader";
import { loadTargetManifest } from "../targets/manifest";

// ─────────────────────────────────────────────────────────────────────────────
// Re-exports for Public API
// ─────────────────────────────────────────────────────────────────────────────

export type {
  GeneratedSystemDocument,
  GenerateSystemLiveDocsOptions,
  SystemGeneratorLogger,
  SystemLiveDocGeneratorResult,
  SystemLiveDocWriteRecord
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Main Generator Entry Point
// ─────────────────────────────────────────────────────────────────────────────

export async function generateSystemLiveDocs(
  options: GenerateSystemLiveDocsOptions
): Promise<SystemLiveDocGeneratorResult> {
  const logger = options.logger ?? DEFAULT_LOGGER;
  const normalizedConfig = normalizeLiveDocumentationConfig(options.config);
  const workspaceRoot = path.resolve(options.workspaceRoot);
  const now = options.now ?? (() => new Date());
  const resolvedOutputDir = options.outputDir
    ? resolveOutputDirectory(workspaceRoot, options.outputDir)
    : undefined;

  if (resolvedOutputDir && options.cleanOutputDir && !options.dryRun) {
    await fs.rm(resolvedOutputDir, { recursive: true, force: true });
  }

  const allStage0Docs = await loadStage0Docs({ workspaceRoot, config: normalizedConfig, logger });
  if (allStage0Docs.length === 0) {
    logger.info("No Stage-0 Live Docs found; skipping System layer generation.");
    return emptyResult(resolvedOutputDir);
  }

  const liveDocsDocs = allStage0Docs.filter((doc) => doc.sourcePath.includes(LIVE_DOCS_SEGMENT));
  if (!liveDocsDocs.length) {
    logger.info("No Live Docs stage documents detected; relying on analytics-driven plans only.");
  }

  const manifest = await loadTargetManifest(workspaceRoot);
  const coActivation = await loadCoActivationReport({ workspaceRoot, logger });

  const plans = await buildSystemDocPlans({
    stage0Docs: liveDocsDocs,
    allStage0Docs,
    workspaceRoot,
    manifest,
    coActivation
  });

  if (!plans.length) {
    logger.info("No System layer plans computed; nothing to render.");
    return emptyResult(resolvedOutputDir);
  }

  plans.sort((left, right) => left.id.localeCompare(right.id));

  const docMap = new Map(allStage0Docs.map((doc) => [doc.sourcePath, doc] as const));

  logMissingImplementationPaths(liveDocsDocs, docMap, plans, logger);

  const results: SystemLiveDocWriteRecord[] = [];
  const documents: GeneratedSystemDocument[] = [];
  const generatedDocPaths = resolvedOutputDir ? undefined : new Set<string>();
  let written = 0;
  let skipped = 0;

  for (const plan of plans) {
    const docPaths = resolveSystemDocPaths({
      workspaceRoot,
      config: normalizedConfig,
      archetype: plan.archetype,
      slug: plan.slug,
      outputRoot: resolvedOutputDir
    });
    generatedDocPaths?.add(docPaths.relative);

    const existingContent = await readIfExists(docPaths.absolute);
    const { rendered, change } = renderPlanDocument({
      plan,
      docMap,
      docPaths,
      existingContent,
      now
    });

    const record: SystemLiveDocWriteRecord = {
      id: plan.id,
      archetype: plan.archetype,
      docPath: docPaths.relative,
      change
    };
    results.push(record);

    documents.push({
      id: plan.id,
      archetype: plan.archetype,
      relativePath: docPaths.relative,
      absolutePath: docPaths.absolute,
      content: rendered,
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

  const deletedFiles = resolvedOutputDir || options.dryRun
    ? []
    : await pruneStaleSystemDocs({
      workspaceRoot,
      config: normalizedConfig,
      preservedDocPaths: generatedDocPaths ?? new Set<string>(),
      dryRun: options.dryRun ?? false,
      logger
    });

  return {
    processed: plans.length,
    written,
    skipped,
    deleted: deletedFiles.length,
    files: results,
    deletedFiles,
    documents,
    outputDir: resolvedOutputDir
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan Building Orchestration
// ─────────────────────────────────────────────────────────────────────────────

async function buildSystemDocPlans(args: {
  stage0Docs: Stage0Doc[];
  allStage0Docs: Stage0Doc[];
  workspaceRoot: string;
  manifest?: Awaited<ReturnType<typeof loadTargetManifest>>;
  coActivation?: CoActivationReport;
}): Promise<SystemDocPlan[]> {
  const stage0PathSet = new Set(args.stage0Docs.map((doc) => doc.sourcePath));
  const allStage0PathSet = new Set(args.allStage0Docs.map((doc) => doc.sourcePath));
  const stageDescriptors = await extractRunAllStageDescriptors(args.workspaceRoot);
  const stageSequence = buildStageSequence(stageDescriptors, stage0PathSet);

  const plans: SystemDocPlan[] = [];

  const componentPlans = buildComponentPlans({
    stage0Docs: args.stage0Docs,
    stage0PathSet,
    stageSequence
  });
  plans.push(...componentPlans);

  const workflowPlans = buildWorkflowPlans({
    stage0Docs: args.stage0Docs,
    stage0PathSet,
    stageSequence
  });
  plans.push(...workflowPlans);

  const workflowSources = new Set<string>();
  for (const plan of workflowPlans) {
    if (plan.componentPaths.length) {
      workflowSources.add(plan.componentPaths[0]);
    }
  }

  const interactionPlans = buildInteractionPlans({
    stage0Docs: args.stage0Docs,
    stage0PathSet,
    skipSources: workflowSources,
    stageSequence
  });
  plans.push(...interactionPlans);

  const testingPlans = await buildTestingPlans({
    workspaceRoot: args.workspaceRoot,
    stage0Docs: args.stage0Docs,
    stage0PathSet,
    manifest: args.manifest
  });
  plans.push(...testingPlans);

  const integrationPlans = buildCoActivationPlans({
    stage0Docs: args.allStage0Docs,
    stage0PathSet: allStage0PathSet,
    coActivation: args.coActivation
  });
  plans.push(...integrationPlans);

  return plans.filter((plan) => SUPPORTED_LAYER3_ARCHETYPES.includes(plan.archetype));
}

// ─────────────────────────────────────────────────────────────────────────────
// Document Rendering
// ─────────────────────────────────────────────────────────────────────────────

function renderPlanDocument(args: {
  plan: SystemDocPlan;
  docMap: Map<string, Stage0Doc>;
  docPaths: { absolute: string; relative: string };
  existingContent: string | undefined;
  now: () => Date;
}): { rendered: string; change: "created" | "updated" | "unchanged" } {
  const { plan, docMap, docPaths, existingContent, now } = args;
  const authoredBlock = extractAuthoredBlock(existingContent);

  const componentsSection = renderComponentsSection({
    plan,
    stage0Docs: docMap,
    docDir: path.dirname(docPaths.absolute)
  });

  const topologySection = renderTopologySection({
    plan,
    stage0Docs: docMap,
    docDir: path.dirname(docPaths.absolute)
  });
  const activationSection = renderActivationSection({ plan });
  const publicSymbolsSection = renderPublicSymbolsSection({
    plan,
    stage0Docs: docMap
  });

  const sections: LiveDocRenderSection[] = [componentsSection];
  if (activationSection) {
    sections.push(activationSection);
  }
  if (publicSymbolsSection) {
    sections.push(publicSymbolsSection);
  }
  sections.push(topologySection);

  const title = `${plan.id} – ${plan.titleSuffix}`;
  const previousGeneratedAt = extractGeneratedAt(existingContent);
  const timestampNow = now().toISOString();
  const initialGeneratedAt = previousGeneratedAt ?? timestampNow;

  const renderDocument = (generatedAt: string): string => {
    const metadata: LiveDocMetadata = normalizeLiveDocMetadata({
      layer: 3,
      archetype: plan.archetype,
      sourcePath: systemMetadataSourcePath(plan.archetype, plan.slug),
      liveDocId: plan.id,
      generatedAt,
      provenance: buildProvenance(generatedAt)
    });

    const document = renderLiveDocMarkdown({
      title,
      metadata,
      authoredBlock,
      sections,
      provenance: metadata.provenance
    });

    return metadata.layer === 4 ? document : stripCodePathLine(document);
  };

  let rendered = renderDocument(initialGeneratedAt);
  let change = classifyChange(existingContent, rendered);

  if (change !== "unchanged" && previousGeneratedAt) {
    rendered = renderDocument(timestampNow);
    change = classifyChange(existingContent, rendered);
  }

  return { rendered, change };
}

function buildProvenance(generatedAt: string): LiveDocProvenance {
  return {
    generators: [
      {
        tool: "live-docs-system-generator",
        version: process.env.LIVE_DOCS_SYSTEM_GENERATOR_VERSION ?? "0.1.0",
        generatedAt
      }
    ]
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Co-Activation Report Loading
// ─────────────────────────────────────────────────────────────────────────────

async function loadCoActivationReport(args: {
  workspaceRoot: string;
  logger: SystemGeneratorLogger;
  reportPath?: string;
}): Promise<CoActivationReport | undefined> {
  const candidateInputs = [args.reportPath, process.env.LIVE_DOCS_CO_ACTIVATION_PATH, DEFAULT_CO_ACTIVATION_RELATIVE_PATH];
  const seen = new Set<string>();

  for (const candidate of candidateInputs) {
    const normalized = candidate?.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);

    const absolutePath = path.isAbsolute(normalized)
      ? normalized
      : path.resolve(args.workspaceRoot, normalized);

    try {
      const raw = await fs.readFile(absolutePath, "utf8");
      const parsed = JSON.parse(raw) as CoActivationReport;
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges) || !Array.isArray(parsed.clusters)) {
        args.logger.warn(`Co-activation report at ${absolutePath} is missing expected collections; ignoring.`);
        continue;
      }
      return parsed;
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError?.code === "ENOENT") {
        continue;
      }
      const reason = nodeError?.message ?? String(error);
      args.logger.warn(`Failed to load co-activation report at ${absolutePath}: ${reason}`);
    }
  }

  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stale Document Pruning
// ─────────────────────────────────────────────────────────────────────────────

async function pruneStaleSystemDocs(args: {
  workspaceRoot: string;
  config: LiveDocumentationConfig;
  preservedDocPaths: Set<string>;
  dryRun: boolean;
  logger: SystemGeneratorLogger;
}): Promise<string[]> {
  const systemRoot = path.resolve(args.workspaceRoot, args.config.root, SYSTEM_LAYER_NAME);
  const exists = await directoryExists(systemRoot);
  if (!exists) {
    return [];
  }

  const files = await glob(`**/*${args.config.extension}`, {
    cwd: systemRoot,
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
      args.logger.warn(`Preserving ${workspaceRelative} (authored content detected)`);
      continue;
    }

    removed.push(workspaceRelative);

    if (args.dryRun) {
      args.logger.info(`(dry-run) Would delete stale System Live Doc ${workspaceRelative}`);
      continue;
    }

    await fs.rm(absolute, { force: true });
    await cleanupEmptyParents(path.dirname(absolute), systemRoot);
    args.logger.info(`Deleted stale System Live Doc ${workspaceRelative}`);
  }

  return removed;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function emptyResult(outputDir?: string): SystemLiveDocGeneratorResult {
  return {
    processed: 0,
    written: 0,
    skipped: 0,
    deleted: 0,
    files: [],
    deletedFiles: [],
    documents: [],
    outputDir
  };
}

function logMissingImplementationPaths(
  liveDocsDocs: Stage0Doc[],
  docMap: Map<string, Stage0Doc>,
  plans: SystemDocPlan[],
  logger: SystemGeneratorLogger
): void {
  const referencedImplementationPaths = new Set<string>();
  for (const plan of plans) {
    for (const componentPath of plan.componentPaths) {
      const componentDoc = docMap.get(componentPath);
      if (componentDoc && isImplementationDoc(componentDoc)) {
        referencedImplementationPaths.add(componentPath);
      }
    }
  }

  const missingImplementationPaths = liveDocsDocs
    .filter((doc) => isImplementationDoc(doc) && !isCompiledArtifactPath(doc.sourcePath))
    .map((doc) => doc.sourcePath)
    .filter((sourcePath) => !referencedImplementationPaths.has(sourcePath));

  if (missingImplementationPaths.length > 0) {
    logger.warn(
      `Implementation Live Docs missing System coverage: ${missingImplementationPaths.join(", ")}`
    );
  }
}
