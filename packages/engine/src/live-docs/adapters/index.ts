import path from "node:path";

import type { SourceAnalysisResult, WorkspaceSymbolIndex } from "../core";
import { aspNetMarkupAdapter } from "./aspnet";
import { cAdapter } from "./c";
import { cargoAdapter } from "./cargo";
import { csharpAdapter } from "./csharp";
import { cssAdapter } from "./css";
import { dotnetConfigAdapter } from "./dotnetConfig";
import { goAdapter } from "./go";
import { goModAdapter } from "./gomod";
import { htmlAdapter } from "./html";
import { javaAdapter } from "./java";
import { jsonAdapter } from "./json";
import { pomAdapter } from "./pom";
import { powershellAdapter } from "./powershell";
import { projectAdapter } from "./project";
import { pyprojectAdapter } from "./pyproject";
import { pythonAdapter } from "./python";
import { rubyAdapter } from "./ruby";
import { rustAdapter } from "./rust";
import { sqlAdapter } from "./sql";

/**
 * Set of workspace-relative file paths for cross-file reference resolution.
 *
 * @remarks
 * Used by adapters like JSON to resolve string values to known workspace files
 * without filesystem crawling. The index is built by the discovery phase before
 * analysis begins.
 */
export type WorkspaceFileIndex = Set<string>;

/**
 * Contract for a language-specific source analyser.
 *
 * Each adapter declares the files it handles, by extension or by exact name,
 * and provides an `analyze` method that extracts public symbols,
 * dependencies, and other structured metadata from a single source file. The
 * adapter registry ({@link analyzeWithLanguageAdapters}) dispatches to the
 * first adapter whose `fileNames` include the file's name, and otherwise to
 * the first whose `extensions` include its extension.
 */
export interface LanguageAdapter {
  /** Short identifier for this adapter (e.g. `"csharp"`, `"python"`). */
  readonly id: string;
  /** Lowercase file extensions this adapter handles, including the dot (e.g. `[".cs"]`). */
  readonly extensions: readonly string[];
  /**
   * Exact file names this adapter handles (e.g. `["Cargo.toml"]`), for a file
   * known by its name rather than its extension: a manifest whose extension
   * (`.toml`, `.xml`, `.mod`) would claim every file of that format.
   */
  readonly fileNames?: readonly string[];
  analyze(input: {
    absolutePath: string;
    workspaceRoot: string;
    /**
     * Optional index of workspace file paths for cross-file reference resolution.
     * Adapters that need to resolve string references (like JSON) use this to
     * validate targets without filesystem crawling.
     */
    fileIndex?: WorkspaceFileIndex;
    /**
     * The workspace symbol index, present on the main pass and absent while
     * the index itself is being built. An adapter that matches a call to the
     * file serving it, by route, address, procedure or table, looks here.
     */
    symbolIndex?: WorkspaceSymbolIndex;
  }): Promise<SourceAnalysisResult | null>;
}

/** Every language adapter, in the order they are asked: the first whose file names include a file's name reads it, else the first whose extensions include its extension. */
export const LANGUAGE_ADAPTERS: readonly LanguageAdapter[] = [
  cAdapter,
  cargoAdapter,
  csharpAdapter,
  aspNetMarkupAdapter,
  cssAdapter,
  dotnetConfigAdapter,
  goAdapter,
  goModAdapter,
  htmlAdapter,
  javaAdapter,
  jsonAdapter,
  pomAdapter,
  powershellAdapter,
  projectAdapter,
  pyprojectAdapter,
  pythonAdapter,
  rubyAdapter,
  rustAdapter,
  sqlAdapter
];

/**
 * Attempts to analyse a source file using the configured language adapters.
 *
 * @param options.absolutePath - Absolute path to the source file under inspection.
 * @param options.workspaceRoot - Workspace root, forwarded to adapters that need relative paths.
 * @param options.fileIndex - Optional set of workspace file paths for cross-file resolution.
 *
 * @returns Analyzer output when an adapter reads the file by its name or its extension, otherwise `null`.
 */
export async function analyzeWithLanguageAdapters(options: {
  absolutePath: string;
  workspaceRoot: string;
  fileIndex?: WorkspaceFileIndex;
  symbolIndex?: WorkspaceSymbolIndex;
}): Promise<SourceAnalysisResult | null> {
  const fileName = path.basename(options.absolutePath);
  const extension = path.extname(fileName).toLowerCase();
  const adapter = LANGUAGE_ADAPTERS.find((candidate) => candidate.fileNames?.includes(fileName))
    ?? (extension ? LANGUAGE_ADAPTERS.find((candidate) => candidate.extensions.includes(extension)) : undefined);
  return adapter ? adapter.analyze(options) : null;
}
