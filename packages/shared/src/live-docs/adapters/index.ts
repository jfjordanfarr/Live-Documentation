import path from "node:path";

import type { SourceAnalysisResult } from "../core";
import { aspNetMarkupAdapter } from "./aspnet";
import { cAdapter } from "./c";
import { csharpAdapter } from "./csharp";
import { cssAdapter } from "./css";
import { goAdapter } from "./go";
import { htmlAdapter } from "./html";
import { javaAdapter } from "./java";
import { jsonAdapter } from "./json";
import { powershellAdapter } from "./powershell";
import { pythonAdapter } from "./python";
import { rubyAdapter } from "./ruby";
import { rustAdapter } from "./rust";

/**
 * Set of workspace-relative file paths for cross-file reference resolution.
 *
 * @remarks
 * Used by adapters like JSON to resolve string values to known workspace files
 * without filesystem crawling. The index is built by the discovery phase before
 * analysis begins.
 */
export type WorkspaceFileIndex = Set<string>;

export interface LanguageAdapter {
  readonly id: string;
  readonly extensions: readonly string[];
  analyze(input: {
    absolutePath: string;
    workspaceRoot: string;
    /**
     * Optional index of workspace file paths for cross-file reference resolution.
     * Adapters that need to resolve string references (like JSON) use this to
     * validate targets without filesystem crawling.
     */
    fileIndex?: WorkspaceFileIndex;
  }): Promise<SourceAnalysisResult | null>;
}

const ADAPTERS: readonly LanguageAdapter[] = [
  cAdapter,
  csharpAdapter,
  aspNetMarkupAdapter,
  cssAdapter,
  goAdapter,
  htmlAdapter,
  javaAdapter,
  jsonAdapter,
  powershellAdapter,
  pythonAdapter,
  rubyAdapter,
  rustAdapter
];

/**
 * Attempts to analyse a source file using the configured language adapters.
 *
 * @param options.absolutePath - Absolute path to the source file under inspection.
 * @param options.workspaceRoot - Workspace root, forwarded to adapters that need relative paths.
 * @param options.fileIndex - Optional set of workspace file paths for cross-file resolution.
 *
 * @returns Analyzer output when an adapter understands the file extension, otherwise `null`.
 */
export async function analyzeWithLanguageAdapters(options: {
  absolutePath: string;
  workspaceRoot: string;
  fileIndex?: WorkspaceFileIndex;
}): Promise<SourceAnalysisResult | null> {
  const extension = path.extname(options.absolutePath).toLowerCase();
  if (!extension) {
    return null;
  }

  for (const adapter of ADAPTERS) {
    if (adapter.extensions.includes(extension)) {
      return adapter.analyze(options);
    }
  }

  return null;
}
