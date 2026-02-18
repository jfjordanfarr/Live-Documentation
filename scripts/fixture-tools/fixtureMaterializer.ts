import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import {
  BenchmarkFixtureDefinition,
  FixtureMaterialization,
  FixtureGitMaterialization
} from "./benchmark-manifest";

/** Paths and optional cleanup handle returned after fixture materialisation. */
export interface MaterializeResult {
  workspaceRoot: string;
  materialization: FixtureMaterialization | undefined;
  dispose?: () => Promise<void>;
}

/**
 * Materialises a benchmark fixture — either resolving a local workspace
 * path or cloning a remote git repository into a staging directory.
 */
export async function materializeFixture(
  repoRoot: string,
  fixture: BenchmarkFixtureDefinition,
  options: MaterializeOptions = {}
): Promise<MaterializeResult> {
  const materialization = fixture.materialization;
  const workspaceMode = options.workspaceMode ?? "persistent";

  if (!materialization || materialization.kind === "workspace") {
    const fallbackPath = fixture.path
      ? path.join(
          repoRoot,
          "tests",
          "integration",
          "benchmarks",
          "fixtures",
          fixture.path
        )
      : undefined;

    if (!fallbackPath) {
      throw new Error(`Fixture ${fixture.id} does not declare a workspace path.`);
    }

    return {
      workspaceRoot: fallbackPath,
      materialization
    };
  }

  if (materialization.kind !== "git") {
    throw new Error(`Unsupported materialization kind for fixture ${fixture.id}.`);
  }

  let stagingRoot: string;
  let dispose: (() => Promise<void>) | undefined;

  if (workspaceMode === "ephemeral") {
    stagingRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), `fixture-${sanitizeSegment(fixture.id)}-`)
    );
    dispose = async () => {
      await fs.rm(stagingRoot, { recursive: true, force: true });
    };
  } else {
    stagingRoot = path.join(
      repoRoot,
      "AI-Agent-Workspace",
      "tmp",
      "benchmarks",
      "vendor",
      sanitizeSegment(fixture.id)
    );
    await fs.mkdir(stagingRoot, { recursive: true });
  }

  const repoDir = path.join(stagingRoot, "repo");
  await ensureGitWorkspace(repoDir, materialization);

  const workspaceRoot = materialization.subdirectory
    ? path.join(repoDir, materialization.subdirectory)
    : repoDir;

  return {
    workspaceRoot,
    materialization,
    dispose
  };
}

async function ensureGitWorkspace(
  targetDir: string,
  spec: FixtureGitMaterialization
): Promise<void> {
  const remote = spec.remote ?? `https://github.com/${spec.repository}.git`;
  const gitDir = path.join(targetDir, ".git");
  const parentDir = path.dirname(targetDir);
  const checkoutTarget = spec.commit;

  await fs.mkdir(parentDir, { recursive: true });

  const repoExists = await pathExists(gitDir);
  if (!repoExists) {
    await runGit(
      ["clone", "--filter=blob:none", "--no-checkout", remote, targetDir],
      parentDir
    );
  } else {
    await runGit(["remote", "set-url", "origin", remote], targetDir);
  }

  await runGit(["fetch", "--force", "--tags", "origin"], targetDir);
  if (spec.ref) {
    await runGit(["fetch", "--force", "origin", spec.ref], targetDir);
  }
  await runGit(["fetch", "--force", "origin", checkoutTarget], targetDir);

  if (spec.sparsePaths && spec.sparsePaths.length > 0) {
    const sparseFile = path.join(targetDir, ".git", "info", "sparse-checkout");
    if (!(await pathExists(sparseFile))) {
      await runGit(["sparse-checkout", "init", "--cone"], targetDir);
    }
    await runGit(["sparse-checkout", "set", ...spec.sparsePaths], targetDir);
  }

  await runGit(["checkout", "--force", "--detach", checkoutTarget], targetDir);
  await runGit(["reset", "--hard", checkoutTarget], targetDir);
  await runGit(["clean", "-fdx"], targetDir);
}

async function runGit(args: string[], cwd: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn("git", args, {
      cwd,
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", code => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`git ${args.join(" ")} failed with exit code ${code ?? "null"}`));
    });
  });
}

async function pathExists(candidate: string): Promise<boolean> {
  try {
    await fs.access(candidate);
    return true;
  } catch {
    return false;
  }
}

function sanitizeSegment(segment: string): string {
  return segment.replace(/[^a-zA-Z0-9_.-]/g, "-");
}

/** Options controlling how a fixture workspace is materialised. */
export interface MaterializeOptions {
  workspaceMode?: WorkspaceMode;
}

type WorkspaceMode = "persistent" | "ephemeral";
