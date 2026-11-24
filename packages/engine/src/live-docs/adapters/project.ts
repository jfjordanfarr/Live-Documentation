/**
 * .NET project files (`.csproj`, `.vbproj`, `.fsproj`): what a project stands on.
 *
 * The project is the file's one public symbol, and its kind says what the
 * project builds: a `library`, a `program`, or a `web` application. Its
 * dependencies are its project references, linked to the project files they
 * name, in any case as Windows reads them (see `dotnetPaths`), or kept as the
 * referenced project's name when the file lies outside the scan, does not
 * exist, or is one of two whose names differ only by case, so that a map of
 * several scans can match the name to the project that publishes it; its package references, external as
 * `name@version`; and its assembly references, external by name. Compiled
 * files are not listed: a system is a folder, and the folder already says
 * which files belong to it. The folder, and whether the project is a test
 * project, go to the first pass's test index (`tests`), by which a file of a
 * test project's folder is a test.
 */
import { compareText } from "../../tooling/compareText";
import path from "../../tooling/enginePath";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import { readSourceText } from "../../tooling/sourceText";
import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult, WorkspaceSymbolIndex } from "../core";
import { PROJECT_KINDS } from "../openings";
import { folderOf, joinWorkspacePath, workspaceFile } from "./dotnetPaths";
import { withoutXmlComments } from "./dotnetXml";
import type { LanguageAdapter } from "./index";

const PROJECT_REFERENCE  = /<ProjectReference\b[^>]*?\bInclude\s*=\s*"([^"]+)"/giu;
const PACKAGE_REFERENCE  = /<PackageReference\b([^>]*?)(?:\/>|>([\s\S]*?)<\/PackageReference>)/giu;
const ASSEMBLY_REFERENCE = /<Reference\b[^>]*?\bInclude\s*=\s*"([^",]+)/giu;
const OUTPUT_TYPE        = /<OutputType>\s*([^<]+?)\s*<\/OutputType>/iu;
const ASSEMBLY_NAME      = /<AssemblyName>\s*([^<]+?)\s*<\/AssemblyName>/iu;
const SDK                = /<Project\b[^>]*?\bSdk\s*=\s*"([^"]+)"/iu;
const PROJECT_TYPE_GUIDS = /<ProjectTypeGuids>([^<]*)<\/ProjectTypeGuids>/iu;
const VERSION_ELEMENT    = /<Version>\s*([^<]+?)\s*<\/Version>/iu;
const IS_TEST_PROJECT    = /<IsTestProject>\s*(true|false)\s*<\/IsTestProject>/iu;
/** The project type of an ASP.NET web application in a classic project file. */
const WEB_APPLICATION_GUID = "349c5851-65df-11da-9384-00065b846f21";

function attribute(fragment: string, name: string): string | undefined {
  return new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, "iu").exec(fragment)?.[1];
}

/** The SDK a project file's `Project` element names, or `""` for a project of the classic format, which names none. */
export function projectSdk(text: string): string {
  return SDK.exec(withoutXmlComments(text))?.[1] ?? "";
}

/** What the project builds, read from a project file's text, what its comments hold set aside. */
export function projectKind(text: string): string {
  const content = withoutXmlComments(text);
  const sdk = projectSdk(content);
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
    // An XML comment is no element (`dotnetXml.ts`): what a comment holds is no reference, kind or name.
    const content  = withoutXmlComments(await readSourceText(absolutePath, fileIndex));
    const thisFile = normalizeWorkspacePath(path.relative(workspaceRoot, absolutePath));
    const symbols: PublicSymbolEntry[] = [{ name: projectName(thisFile, content), kind: projectKind(content), location: { line: 1, character: 1 } }];

    const projects = new Map<string, DependencyEntry>();
    for (const match of content.matchAll(PROJECT_REFERENCE)) {
      const referenced = workspaceFile(joinWorkspacePath(folderOf(thisFile), match[1]), fileIndex);
      if (referenced) {
        projects.set(referenced, { specifier: referenced, resolvedPath: referenced, symbols: [referencedProjectName(referenced, symbolIndex)], kind: "import" });
      } else {
        const name = projectStem(match[1]);
        projects.set(name, { specifier: name, symbols: [], kind: "import" });
      }
    }

    const external = new Set<string>();
    let testSdk = false;
    for (const match of content.matchAll(PACKAGE_REFERENCE)) {
      const id      = attribute(match[1], "Include") ?? attribute(match[1], "Update");
      const version = attribute(match[1], "Version") ?? (match[2] ? VERSION_ELEMENT.exec(match[2])?.[1] : undefined);
      if (id) external.add(version ? `${id}@${version}` : id);
      if (id?.toLowerCase() === "microsoft.net.test.sdk") testSdk = true;
    }
    for (const match of content.matchAll(ASSEMBLY_REFERENCE)) {
      external.add(match[1].trim());
    }

    const dependencies = [
      ...Array.from(projects.values()).sort((left, right) => compareText(left.specifier, right.specifier)),
      ...Array.from(external).sort().map((specifier) => ({ specifier, symbols: [], kind: "import" as const }))
    ];
    return { symbols, dependencies, tests: { project: { folder: folderOf(thisFile), test: isTestProject(content, testSdk) } } };
  }
};

/**
 * True for a test project, the one `dotnet test` runs: it sets `IsTestProject`, which the props of
 * `Microsoft.NET.Test.Sdk` set (vstest's `Microsoft.TestPlatform.targets` skips any other), or its SDK is `MSTest.Sdk`;
 * a project that says `IsTestProject` false is none. A reference to a test framework alone (xunit without the SDK)
 * makes no test project (2026-11-21, the record `Probes/test-rules/`).
 */
function isTestProject(content: string, testSdk: boolean): boolean {
  const said = IS_TEST_PROJECT.exec(content)?.[1].toLowerCase();
  if (said !== undefined) return said === "true";
  return testSdk || /^MSTest\.Sdk(?:\/|$)/iu.test(projectSdk(content));
}

/** The name a project reference stands for when its file cannot be found: the file's stem. */
export function projectStem(include: string): string {
  return path.basename(include.replace(/\\/gu, "/")).replace(/\.[^.]+$/u, "");
}

/** The name the referenced project publishes, from the index when it is there, else the file's stem. */
export function referencedProjectName(projectFile: string, symbolIndex: WorkspaceSymbolIndex | undefined): string {
  if (symbolIndex) {
    for (const [name, locations] of symbolIndex) {
      if (locations.some((location) => location.sourcePath === projectFile && PROJECT_KINDS.has(location.kind))) return name;
    }
  }
  return path.basename(projectFile).replace(/\.[^.]+$/u, "");
}
