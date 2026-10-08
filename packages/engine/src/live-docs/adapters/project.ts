/**
 * .NET project files (`.csproj`, `.vbproj`, `.fsproj`): what a project stands on.
 *
 * The project is the file's one public symbol, and its kind says what the
 * project builds: a `library`, a `program`, or a `web` application. Its
 * dependencies are its project references, linked to the project files they
 * name; its package references, external as `name@version`; and its assembly
 * references, external by name. Compiled files are not listed: a system is a
 * folder, and the folder already says which files belong to it.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult, WorkspaceSymbolIndex } from "../core";
import { PROJECT_KINDS } from "../openings";
import type { LanguageAdapter, WorkspaceFileIndex } from "./index";

const PROJECT_REFERENCE  = /<ProjectReference\b[^>]*?\bInclude\s*=\s*"([^"]+)"/giu;
const PACKAGE_REFERENCE  = /<PackageReference\b([^>]*?)(?:\/>|>([\s\S]*?)<\/PackageReference>)/giu;
const ASSEMBLY_REFERENCE = /<Reference\b[^>]*?\bInclude\s*=\s*"([^",]+)/giu;
const OUTPUT_TYPE        = /<OutputType>\s*([^<]+?)\s*<\/OutputType>/iu;
const ASSEMBLY_NAME      = /<AssemblyName>\s*([^<]+?)\s*<\/AssemblyName>/iu;
const SDK                = /<Project\b[^>]*?\bSdk\s*=\s*"([^"]+)"/iu;
const PROJECT_TYPE_GUIDS = /<ProjectTypeGuids>([^<]*)<\/ProjectTypeGuids>/iu;
const VERSION_ELEMENT    = /<Version>\s*([^<]+?)\s*<\/Version>/iu;
/** The project type of an ASP.NET web application in a classic project file. */
const WEB_APPLICATION_GUID = "349c5851-65df-11da-9384-00065b846f21";

function attribute(fragment: string, name: string): string | undefined {
  return new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, "iu").exec(fragment)?.[1];
}

/** What the project builds. */
export function projectKind(content: string): string {
  const sdk = SDK.exec(content)?.[1] ?? "";
  if (/\.Web$/iu.test(sdk) || (PROJECT_TYPE_GUIDS.exec(content)?.[1] ?? "").toLowerCase().includes(WEB_APPLICATION_GUID)) {
    return "web";
  }
  const outputType = OUTPUT_TYPE.exec(content)?.[1].toLowerCase();
  return outputType === "exe" || outputType === "winexe" ? "program" : "library";
}

/** The name of the project a project file declares: its assembly name, or the file's stem. */
function projectName(projectFile: string, content: string): string {
  return ASSEMBLY_NAME.exec(content)?.[1] ?? path.basename(projectFile).replace(/\.[^.]+$/u, "");
}

/** Language adapter for .NET project files: the project as a symbol, and what it references as dependencies. */
export const projectAdapter: LanguageAdapter = {
  id:         "dotnet-project",
  extensions: [".csproj", ".vbproj", ".fsproj"],
  async analyze({ absolutePath, workspaceRoot, fileIndex, symbolIndex }): Promise<SourceAnalysisResult | null> {
    const content  = await fs.readFile(absolutePath, "utf8");
    const thisFile = normalizeWorkspacePath(path.relative(workspaceRoot, absolutePath));
    const symbols: PublicSymbolEntry[] = [{ name: projectName(thisFile, content), kind: projectKind(content), location: { line: 1, character: 1 } }];

    const projects: DependencyEntry[] = [];
    for (const match of content.matchAll(PROJECT_REFERENCE)) {
      const referenced = await resolveProjectReference(match[1], absolutePath, workspaceRoot, fileIndex);
      if (!referenced) continue;
      projects.push({ specifier: referenced, resolvedPath: referenced, symbols: [referencedProjectName(referenced, symbolIndex)], kind: "import" });
    }

    const external = new Set<string>();
    for (const match of content.matchAll(PACKAGE_REFERENCE)) {
      const id      = attribute(match[1], "Include") ?? attribute(match[1], "Update");
      const version = attribute(match[1], "Version") ?? (match[2] ? VERSION_ELEMENT.exec(match[2])?.[1] : undefined);
      if (id) external.add(version ? `${id}@${version}` : id);
    }
    for (const match of content.matchAll(ASSEMBLY_REFERENCE)) {
      external.add(match[1].trim());
    }

    const dependencies = [
      ...projects.sort((left, right) => left.specifier.localeCompare(right.specifier)),
      ...Array.from(external).sort().map((specifier) => ({ specifier, symbols: [], kind: "import" as const }))
    ];
    return { symbols, dependencies };
  }
};

/** The workspace-relative path of a referenced project file, when it exists. */
async function resolveProjectReference(include: string, projectFile: string, workspaceRoot: string, fileIndex: WorkspaceFileIndex | undefined): Promise<string | undefined> {
  const absolute = path.resolve(path.dirname(projectFile), include.replace(/\\/gu, "/"));
  const relative = normalizeWorkspacePath(path.relative(workspaceRoot, absolute));
  if (relative.startsWith("../")) return undefined;
  if (fileIndex?.has(relative)) return relative;
  try {
    return (await fs.stat(absolute)).isFile() ? relative : undefined;
  } catch {
    return undefined;
  }
}

/** The name the referenced project publishes, from the index when it is there, else the file's stem. */
function referencedProjectName(projectFile: string, symbolIndex: WorkspaceSymbolIndex | undefined): string {
  if (symbolIndex) {
    for (const [name, locations] of symbolIndex) {
      if (locations.some((location) => location.sourcePath === projectFile && PROJECT_KINDS.has(location.kind))) return name;
    }
  }
  return path.basename(projectFile).replace(/\.[^.]+$/u, "");
}
