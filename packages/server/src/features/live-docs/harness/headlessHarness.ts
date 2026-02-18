import * as fs from "node:fs/promises";
import * as os from "node:os";
import path from "node:path";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  normalizeLiveDocumentationConfig,
  type LiveDocumentationConfig,
  type LiveDocumentationConfigInput
} from "@live-documentation/shared/config/liveDocumentationConfig";

import type { HeadlessHarnessScenario } from "./scenarios";
import type { LiveDocGeneratorResult } from "../generator";
import { generateLiveDocs } from "../generator";
import type { SystemLiveDocGeneratorResult } from "../system/generator";
import { generateSystemLiveDocs } from "../system/generator";

/** Logger interface for headless harness output (info required, warn optional). */
export interface HeadlessHarnessLogger {
  info(message: string): void;
  warn?(message: string): void;
}

const DEFAULT_LOGGER: HeadlessHarnessLogger = {
  info: (message) => console.log(`[headless] ${message}`),
  warn: (message) => console.warn(`[headless] ${message}`)
};

/** Options controlling a single headless harness run. */
export interface HeadlessHarnessRunOptions {
  scenario: HeadlessHarnessScenario;
  repoRoot: string;
  outputRoot: string;
  workspaceOverride?: string;
  keepWorkspace?: boolean;
  emitContainerSpec?: boolean;
  skipSystem?: boolean;
  dryRun?: boolean;
  logger?: HeadlessHarnessLogger;
  now?: () => Date;
}

/** Outcome of a headless harness run, including paths and generator results. */
export interface HeadlessHarnessRunResult {
  scenario: HeadlessHarnessScenario;
  workspaceRoot: string;
  outputDir: string;
  reportPath: string;
  containerSpecPath?: string;
  generator: LiveDocGeneratorResult;
  system?: SystemLiveDocGeneratorResult;
}

interface PreparedWorkspace {
  workspaceRoot: string;
  cleanup(): Promise<void>;
}

/**
 * Executes a headless Live Docs generation scenario end-to-end.
 *
 * Prepares a workspace from the scenario fixture, runs the Stage-0
 * generator and (optionally) the System-layer generator, writes a
 * JSON report, and cleans up unless `keepWorkspace` is set.
 */
export async function runHeadlessHarness(options: HeadlessHarnessRunOptions): Promise<HeadlessHarnessRunResult> {
  const logger = options.logger ?? DEFAULT_LOGGER;
  const timestamp = (options.now ?? (() => new Date()))().toISOString();

  const scenario = options.scenario;
  const workspacePrep = await prepareWorkspace({
    scenario,
    repoRoot: options.repoRoot,
    override: options.workspaceOverride,
    logger
  });
  let workspaceRoot = workspacePrep.workspaceRoot;

  try {
    const normalizedConfig = buildConfig({
      scenario,
      overrides: scenario.config,
      logger
    });

    logger.info(`Running scenario '${scenario.name}' against ${workspaceRoot}`);
    const generator = await generateLiveDocs({
      workspaceRoot,
      config: normalizedConfig,
      dryRun: options.dryRun,
      include: scenario.include
    });

    const system = options.skipSystem
      ? undefined
      : await generateSystemLiveDocs({
          workspaceRoot,
          config: normalizedConfig,
          dryRun: options.dryRun,
          outputDir: path.join(workspaceRoot, ".headless-system"),
          cleanOutputDir: true
        });

    const outputDir = await materializeOutputDir(options.outputRoot, scenario.name, timestamp);
    const reportPath = path.join(outputDir, "report.json");
    const liveDocsRoot = path.resolve(
      workspaceRoot,
      normalizedConfig.root,
      normalizedConfig.baseLayer
    );

    const report = {
      scenario: scenario.name,
      description: scenario.description,
      workspaceRoot,
      liveDocsRoot,
      processed: generator.processed,
      written: generator.written,
      skipped: generator.skipped,
      deleted: generator.deleted,
      outputDir,
      timestamp,
      system: system
        ? {
            processed: system.processed,
            written: system.written,
            skipped: system.skipped,
            deleted: system.deleted
          }
        : undefined
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
    logger.info(`Scenario '${scenario.name}' wrote ${reportPath}`);

    let containerSpecPath: string | undefined;
    if (options.emitContainerSpec) {
      containerSpecPath = await writeContainerSpec({
        scenario,
        repoRoot: options.repoRoot,
        outputDir,
        timestamp
      });
      logger.info(`Scenario '${scenario.name}' container spec → ${containerSpecPath}`);
    }

    return {
      scenario,
      workspaceRoot,
      outputDir,
      reportPath,
      containerSpecPath,
      generator,
      system
    };
  } finally {
    if (!options.keepWorkspace && !options.workspaceOverride) {
      await workspacePrep.cleanup();
      logger.info(`Removed temp workspace for '${scenario.name}'`);
    } else {
      workspaceRoot = workspacePrep.workspaceRoot;
    }
  }
}

function buildConfig(args: {
  scenario: HeadlessHarnessScenario;
  overrides?: Partial<LiveDocumentationConfigInput>;
  logger: HeadlessHarnessLogger;
}): LiveDocumentationConfig {
  const globs = args.scenario.glob.length
    ? [...args.scenario.glob]
    : [...DEFAULT_LIVE_DOCUMENTATION_CONFIG.glob];
  const configInput: LiveDocumentationConfigInput = {
    ...args.overrides,
    glob: globs
  };
  args.logger.info(`Resolved globs for '${args.scenario.name}': ${globs.join(", ")}`);
  return normalizeLiveDocumentationConfig(configInput);
}

async function prepareWorkspace(args: {
  scenario: HeadlessHarnessScenario;
  repoRoot: string;
  override?: string;
  logger: HeadlessHarnessLogger;
}): Promise<PreparedWorkspace> {
  if (args.override) {
    const absoluteOverride = path.resolve(args.override);
    args.logger.info(`Using provided workspace override ${absoluteOverride}`);
    return {
      workspaceRoot: absoluteOverride,
      cleanup: async () => {}
    };
  }

  const fixtureAbsolute = path.resolve(args.repoRoot, args.scenario.fixturePath);
  const tempParent = await fs.mkdtemp(path.join(os.tmpdir(), `headless-${args.scenario.name}-`));
  const workspaceRoot = path.join(tempParent, path.basename(fixtureAbsolute));
  await fs.cp(fixtureAbsolute, workspaceRoot, { recursive: true });
  args.logger.info(`Copied fixture ${fixtureAbsolute} → ${workspaceRoot}`);
  return {
    workspaceRoot,
    cleanup: async () => {
      await fs.rm(tempParent, { recursive: true, force: true });
    }
  };
}

async function materializeOutputDir(outputRoot: string, scenario: string, timestamp: string): Promise<string> {
  const safeTimestamp = timestamp.replace(/[:.]/g, "-");
  const candidate = path.resolve(outputRoot, scenario, safeTimestamp);
  await fs.mkdir(candidate, { recursive: true });
  return candidate;
}

interface ContainerSpec {
  image: string;
  workdir: string;
  command: string[];
  env?: Record<string, string>;
  volumes: Array<{ hostPath: string; containerPath: string }>;
  description: string;
}

async function writeContainerSpec(args: {
  scenario: HeadlessHarnessScenario;
  repoRoot: string;
  outputDir: string;
  timestamp: string;
}): Promise<string> {
  const spec: ContainerSpec = {
    image: "node:22-bookworm",
    workdir: "/workspace",
    description:
      "Runs the Live Docs headless harness inside a container with the repository mounted at /workspace.",
    command: [
      "npm",
      "run",
      "live-docs:headless",
      "--",
      "--scenario",
      args.scenario.name,
      "--output",
      "/workspace/AI-Agent-Workspace/tmp/headless-harness",
      "--keep-workspace"
    ],
    env: {
      LIVE_DOCS_HEADLESS_TIMESTAMP: args.timestamp
    },
    volumes: [
      {
        hostPath: args.repoRoot,
        containerPath: "/workspace"
      }
    ]
  };

  const specPath = path.join(args.outputDir, "container-spec.json");
  await fs.writeFile(specPath, JSON.stringify(spec, null, 2), "utf8");
  return specPath;
}
