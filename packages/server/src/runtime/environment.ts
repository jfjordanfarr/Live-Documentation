// Live Documentation: .mdmd/layer-4/language-server-runtime/languageServerRuntime.mdmd.md#source-breadcrumbs
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { InitializeParams } from "vscode-languageserver/node";

import { ExtensionSettings } from "../features/settings/providerGuard";

export function resolveDatabasePath(params: InitializeParams, settings: ExtensionSettings): string {
  if (settings.storagePath) {
    return path.join(settings.storagePath, "live-documentation.db");
  }

  const workspaceFolder = params.workspaceFolders?.[0]?.uri;
  if (workspaceFolder) {
    const folderPath = fileUriToPath(workspaceFolder);
    return path.join(folderPath, ".live-documentation", "live-documentation.db");
  }

  return path.join(os.tmpdir(), "live-documentation", "live-documentation.db");
}

export function resolveWorkspaceRoot(params: InitializeParams): string | undefined {
  if (params.workspaceFolders?.length) {
    return fileUriToPath(params.workspaceFolders[0].uri);
  }

  if (typeof params.rootUri === "string") {
    return fileUriToPath(params.rootUri);
  }

  if (typeof params.rootPath === "string") {
    return path.resolve(params.rootPath);
  }

  return undefined;
}

export function fileUriToPath(candidate: string): string {
  try {
    if (candidate.startsWith("file://")) {
      try {
        return fileURLToPath(candidate);
      } catch {
        const parsed = new URL(candidate);
        const pathname = decodeURIComponent(parsed.pathname ?? "");
        if (pathname) {
          return path.resolve(pathname);
        }
      }
    }
  } catch {
    // fall through to path resolution
  }

  return path.resolve(candidate);
}

export function ensureDirectory(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function describeError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
}
