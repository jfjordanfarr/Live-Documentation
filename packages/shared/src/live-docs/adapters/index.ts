import path from "node:path";

import type { SourceAnalysisResult } from "../core";
import { aspNetMarkupAdapter } from "./aspnet";
import { cAdapter } from "./c";
import { csharpAdapter } from "./csharp";
import { cssAdapter } from "./css";
import { htmlAdapter } from "./html";
import { javaAdapter } from "./java";
import { powershellAdapter } from "./powershell";
import { pythonAdapter } from "./python";
import { rubyAdapter } from "./ruby";
import { rustAdapter } from "./rust";

export interface LanguageAdapter {
  readonly id: string;
  readonly extensions: readonly string[];
  analyze(input: { absolutePath: string; workspaceRoot: string }): Promise<SourceAnalysisResult | null>;
}

const ADAPTERS: readonly LanguageAdapter[] = [
  cAdapter,
  csharpAdapter,
  aspNetMarkupAdapter,
  cssAdapter,
  htmlAdapter,
  javaAdapter,
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
 *
 * @returns Analyzer output when an adapter understands the file extension, otherwise `null`.
 */
export async function analyzeWithLanguageAdapters(options: {
  absolutePath: string;
  workspaceRoot: string;
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
