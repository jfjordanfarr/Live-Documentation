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
    const electronVersion = await readElectronVersion(vscodeExecutablePath);
    console.log(`[integration] Resolved Electron version: ${electronVersion}`);
    console.log(`[integration] Forcing better-sqlite3 rebuild for Electron (ignoring SKIP_NATIVE_REBUILD)`);
    // Always perform a deterministic rebuild for Electron to ensure ABI compatibility.
    console.log(`[integration] Initiating better-sqlite3 rebuild for Electron ${electronVersion}...`);
    rebuildNativeModules(repoRoot, electronVersion);
    console.log(`[integration] Rebuild completed for Electron ${electronVersion}.`);

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

async function readElectronVersion(vscodeExecutablePath: string): Promise<string> {
  // Try reading from VS Code's application package (may not always include electron info in built dist)
  try {
    const appPackagePath = path.resolve(
      path.dirname(vscodeExecutablePath),
      "resources",
      "app",
      "package.json"
    );
    const packageJsonRaw = await fs.promises.readFile(appPackagePath, "utf8");
    const packageJson = JSON.parse(packageJsonRaw) as { devDependencies?: Record<string, string>; dependencies?: Record<string, string> };
    const fromDeps = packageJson.devDependencies?.electron ?? packageJson.dependencies?.electron;
    if (fromDeps) {
      return fromDeps.replace(/^\^/, "");
    }
  } catch {
    // fall through to CLI parse
  }

  // Fallback: use Code CLI --version output, which includes an 'Electron X.Y.Z' line
  const cliPath = resolveVSCodeCliPath(vscodeExecutablePath);
  const result = spawnSync(cliPath, ["--version"], { stdio: "pipe" });
  const out = (result.stdout?.toString() ?? "") + (result.stderr?.toString() ?? "");
  // Emit a short preview for troubleshooting
  const preview = out.split(/\r?\n/).slice(0, 5).join(" | ");
  console.log(`[integration] VS Code --version output (preview): ${preview}`);
  const match = out.split(/\r?\n/).map(l => l.trim()).find(l => /^Electron\s+\d+\.\d+\.\d+/.test(l));
  if (!match) {
    throw new Error("Unable to determine Electron version from VS Code CLI --version output");
  }
  return match.replace(/^Electron\s+/, "").trim();
}

function rebuildNativeModules(repoRoot: string, electronVersion: string): void {
  const scriptPath = path.join(repoRoot, "scripts", "rebuild-better-sqlite3.mjs");

  console.log(
    `Rebuilding better-sqlite3 for Electron ${electronVersion} via ${path.relative(repoRoot, scriptPath)} ` +
      "(override with SKIP_NATIVE_REBUILD=1 to skip)."
  );

  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: repoRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      BETTER_SQLITE3_REBUILD_FORCE: "1",
      VSCODE_ELECTRON_VERSION: electronVersion
    }
  });

  if (result.status !== 0) {
    const detail = result.error ? ` (${result.error.message})` : "";
    throw new Error(
      `better-sqlite3 rebuild script failed with exit code ${result.status ?? "unknown"}${detail}`
    );
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

function resolveVSCodeCliPath(vscodeExecutablePath: string): string {
  const base = path.dirname(vscodeExecutablePath);
  if (process.platform === "win32") {
    return path.join(base, "bin", "code.cmd");
  }
  if (process.platform === "darwin") {
    return path.join(base, "..", "..", "MacOS", "Electron");
  }
  return path.join(base, "bin", "code");
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
