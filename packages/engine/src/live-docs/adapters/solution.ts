/**
 * Visual Studio solutions (`.sln`, and the XML `.slnx`): the projects a
 * solution gathers.
 *
 * A solution's dependencies are the projects it names, linked to their project
 * files, found in any case as Windows reads them (see `dotnetPaths`), or kept
 * by the project's name when the file is not in the scan, as a project
 * reference is. Solution folders group projects in Visual Studio's tree and
 * name no file, so they are not read. Configurations, platforms and the items
 * a solution folder lists are not dependencies.
 */
import path from "node:path";

import { compareText } from "../../tooling/compareText";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import { readSourceText } from "../../tooling/sourceText";
import type { DependencyEntry, SourceAnalysisResult } from "../core";
import { folderOf, joinWorkspacePath, workspaceFile } from "./dotnetPaths";
import type { LanguageAdapter } from "./index";
import { projectStem, referencedProjectName } from "./project";

/** `Project("{type}") = "Name", "Path", "{guid}"`, one line of a `.sln` file. */
const SLN_PROJECT = /^\s*Project\s*\(\s*"\{([0-9A-Fa-f-]+)\}"\s*\)\s*=\s*"([^"]*)"\s*,\s*"([^"]*)"/gmu;
/** `<Project Path="…">` in a `.slnx` file. */
const SLNX_PROJECT = /<Project\b[^>]*?\bPath\s*=\s*"([^"]+)"/giu;
/** The project type of a solution folder. */
const SOLUTION_FOLDER = "2150e333-8fdc-42a3-9474-1a3956d46de8";

/** The paths of the projects a solution names, as written, solution folders left out. */
export function solutionProjects(content: string, extension: string): string[] {
  if (extension === ".slnx") return Array.from(content.matchAll(SLNX_PROJECT), (match) => match[1]);
  return Array.from(content.matchAll(SLN_PROJECT))
    .filter((match) => match[1].toLowerCase() !== SOLUTION_FOLDER)
    .map((match) => match[3]);
}

/** Language adapter for Visual Studio solutions: the projects a solution names, as dependencies. */
export const solutionAdapter: LanguageAdapter = {
  id:         "dotnet-solution",
  extensions: [".sln", ".slnx"],
  async analyze({ absolutePath, workspaceRoot, fileIndex, symbolIndex }): Promise<SourceAnalysisResult | null> {
    const content  = await readSourceText(absolutePath);
    const thisFile = normalizeWorkspacePath(path.relative(workspaceRoot, absolutePath));
    const projects = new Map<string, DependencyEntry>();
    for (const written of solutionProjects(content, path.extname(absolutePath).toLowerCase())) {
      const referenced = workspaceFile(joinWorkspacePath(folderOf(thisFile), written), fileIndex);
      if (referenced) {
        projects.set(referenced, { specifier: referenced, resolvedPath: referenced, symbols: [referencedProjectName(referenced, symbolIndex)], kind: "import" });
      } else {
        const name = projectStem(written.replace(/[\\/]+$/u, ""));
        if (name) projects.set(name, { specifier: name, symbols: [], kind: "import" });
      }
    }
    return {
      symbols:      [],
      dependencies: Array.from(projects.values()).sort((left, right) => compareText(left.specifier, right.specifier))
    };
  }
};
