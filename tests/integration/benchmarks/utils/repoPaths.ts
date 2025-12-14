import { existsSync, readFileSync } from "node:fs";
import * as path from "node:path";

let cachedRoot: string | undefined;

const REPO_NAMES = new Set(["live-documentation"]);

export function getRepoRoot(startDir: string = __dirname): string {
  if (cachedRoot) {
    return cachedRoot;
  }

  let current = path.resolve(startDir);
  const { root } = path.parse(current);

  // Walk up until we locate the workspace package.json so tests stay stable
  // regardless of where VS Code's integration harness sets the cwd.
  while (true) {
    if (looksLikeRepoRoot(current)) {
      cachedRoot = current;
      return current;
    }
    if (current === root) {
      throw new Error(`Unable to determine repository root from ${startDir}`);
    }
    current = path.dirname(current);
  }
}

export function resolveRepoPath(...segments: string[]): string {
  return path.resolve(getRepoRoot(), ...segments);
}

function looksLikeRepoRoot(candidate: string): boolean {
  const manifestPath = path.join(candidate, "package.json");
  if (!existsSync(manifestPath)) {
    return false;
  }

  const extensionPackage = path.join(candidate, "packages", "extension", "package.json");
  if (!existsSync(extensionPackage)) {
    return false;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      name?: string;
      workspaces?: unknown;
    };

    if (manifest.name && REPO_NAMES.has(manifest.name)) {
      return true;
    }

    if (Array.isArray(manifest.workspaces)) {
      return (manifest.workspaces as unknown[]).some(entry => {
        return typeof entry === "string" && entry.startsWith("packages/");
      });
    }
  } catch {
    // ignore malformed package manifests and continue walking up
  }

  return false;
}
