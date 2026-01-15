import { downloadAndUnzipVSCode, runTests } from "@vscode/test-electron";
import { spawnSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

function findRepoRoot(startDir: string): string {
  let current = startDir;
  const { root } = path.parse(current);

  while (current !== root) {
    if (fs.existsSync(path.join(current, "package.json"))) {
      return current;
    }

    current = path.dirname(current);
  }

  throw new Error("Unable to locate repository root");
}

async function main(): Promise<void> {
  try {
    const repoRoot = findRepoRoot(__dirname);
    const extensionDevelopmentPath = path.join(repoRoot, "packages", "extension");
    const extensionTestsPath = path.resolve(__dirname, "suite", "index");
    const integrationWorkspace = path.join(
      repoRoot,
      "tests",
      "integration",
      "fixtures",
      "simple-workspace"
    );
    const { workspacePath, cleanup } = await prepareIntegrationWorkspace(integrationWorkspace);

    if (process.env.SKIP_EXTENSION_BUILD !== "1") {
      buildWorkspace(repoRoot);
    }

    const vscodeExecutablePath = await downloadAndUnzipVSCode({ version: process.env.VSCODE_VERSION ?? "stable" });

    if (!process.env.LINK_AWARE_PROVIDER_MODE) {
      process.env.LINK_AWARE_PROVIDER_MODE = "local-only";
    }

    if (!process.env.LINK_AWARE_OLLAMA_MODEL && process.env.OLLAMA_MODEL) {
      process.env.LINK_AWARE_OLLAMA_MODEL = process.env.OLLAMA_MODEL;
    }

    if (!process.env.LINK_AWARE_OLLAMA_TRACE_DIR) {
      process.env.LINK_AWARE_OLLAMA_TRACE_DIR = path.join(
        repoRoot,
        "AI-Agent-Workspace",
        "ollama-traces"
      );
    }

    try {
      await runTests({
        vscodeExecutablePath,
        extensionDevelopmentPath,
        extensionTestsPath,
        launchArgs: [workspacePath, "--disable-extensions"]
      });
    } finally {
      await cleanup();
    }
  } catch (error) {
    console.error("Failed to run extension tests", error);
    process.exit(1);
  }
}

void main();

function buildWorkspace(repoRoot: string): void {
  console.log("Building extension and language server bundles...");
  const npmInvocation = resolveNpmInvocation();
  const result = spawnSync(npmInvocation.command, [...npmInvocation.args, "run", "build"], {
    cwd: repoRoot,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    const detail = result.error ? ` (${result.error.message})` : "";
    throw new Error(`npm run build failed with exit code ${result.status ?? "unknown"}${detail}`);
  }
}

function resolveNpmInvocation(): { command: string; args: string[] } {
  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath && npmExecPath.endsWith("npm-cli.js") && fs.existsSync(npmExecPath)) {
    return {
      command: process.execPath,
      args: [npmExecPath]
    };
  }

  return {
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    args: []
  };
}

async function prepareIntegrationWorkspace(
  sourceWorkspace: string
): Promise<{ workspacePath: string; cleanup: () => Promise<void> }> {
  const tempRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), "link-aware-tests-"));
  const workspacePath = path.join(tempRoot, path.basename(sourceWorkspace));
  await fs.promises.cp(sourceWorkspace, workspacePath, { recursive: true });

  return {
    workspacePath,
    cleanup: async () => {
      if (process.env.LINK_AWARE_KEEP_WORKSPACE === "1") {
        console.log(`[integration] Preserving workspace at ${workspacePath}`);
        return;
      }
      await fs.promises.rm(tempRoot, { recursive: true, force: true });
    }
  };
}
