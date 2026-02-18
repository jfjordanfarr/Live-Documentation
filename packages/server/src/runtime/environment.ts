// Live Documentation: .mdmd/layer-4/language-server-runtime/languageServerRuntime.mdmd.md#source-breadcrumbs
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { InitializeParams } from "vscode-languageserver/node";

/**
 * Extracts the workspace root directory from LSP initialization params.
 *
 * Checks, in order: `workspaceFolders[0]`, `rootUri`, `rootPath`.
 * Returns `undefined` when none of those are available (e.g. untitled workspace).
 *
 * @param params - LSP `InitializeParams` received during the handshake.
 */
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

/**
 * Converts a `file://` URI or plain filesystem path to an absolute path.
 *
 * Handles both proper `file://` URIs and bare paths, ensuring callers always
 * receive a resolved absolute path regardless of the input format.
 *
 * @param candidate - A `file://` URI string or a filesystem path.
 */
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
