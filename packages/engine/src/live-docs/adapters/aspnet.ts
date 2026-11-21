import path from "node:path";

import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import { readSourceText, throwIfMachineFailure } from "../../tooling/sourceText";
import type { DependencyEntry, SourceAnalysisResult } from "../core";
import type { SourceNotice } from "../coreTypes";
import { folderOf, isProjectFile, joinWorkspacePath, lookUpWorkspaceFile, nearestProjectFolder, workspaceFile } from "./dotnetPaths";
import { extractElementIds } from "./html";
import type { LanguageAdapter, WorkspaceFileIndex } from "./index";
import { projectKind } from "./project";

const SCRIPT_SRC_PATTERN = /<script[^>]*?src\s*=\s*"([^"]+)"[^>]*?>/gi;
const SERVER_COMMENT = /<%--[\s\S]*?--%>/gu;
const DIRECTIVE = /<%@([\s\S]*?)%>/gu;
const DIRECTIVE_NAME = /^\s*([A-Za-z]+)\b(?!\s*=)/u;
const DIRECTIVE_ATTRIBUTE = /([A-Za-z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'%>]+))/gu;

/**
 * The directive a file's unnamed `<%@ … %>` stands for, by its extension, and
 * so the files this adapter reads: Web Forms pages, user controls and master
 * pages, HTTP handlers, ASMX web services, the application file and WCF
 * service files. Razor files have no directives of this kind.
 */
const DEFAULT_DIRECTIVE: Record<string, string> = {
  ".aspx":   "page",
  ".ascx":   "control",
  ".master": "master",
  ".ashx":   "webhandler",
  ".asmx":   "webservice",
  ".asax":   "application",
  ".svc":    "servicehost"
};

/**
 * The attributes of each directive that name a file, from Microsoft's
 * documentation of the ASP.NET and WCF directives. `Inherits`, `Class`,
 * `Service` and `TypeName` name a type rather than a file and are not read
 * here.
 */
const FILE_ATTRIBUTES: Record<string, readonly string[]> = {
  page:             ["codebehind", "codefile", "src", "masterpagefile"],
  control:          ["codebehind", "codefile", "src"],
  master:           ["codebehind", "codefile", "src", "masterpagefile"],
  application:      ["codebehind", "codefile", "src"],
  webhandler:       ["codebehind"],
  webservice:       ["codebehind"],
  servicehost:      ["codebehind"],
  register:         ["src"],
  reference:        ["page", "control", "virtualpath"],
  mastertype:       ["virtualpath"],
  previouspagetype: ["virtualpath"],
  assembly:         ["src"]
};

/**
 * Language adapter for ASP.NET markup: Web Forms pages (`.aspx`), user controls
 * (`.ascx`), master pages (`.master`), handlers (`.ashx`), web services
 * (`.asmx`), the application file (`.asax`), WCF service files (`.svc`) and
 * Razor (`.cshtml`, `.razor`). Its dependencies are the files its directives
 * name (code-behind, master page, registered user controls, referenced pages),
 * a Razor file's code-behind, and its `<script src>` references; its public
 * symbols are element ids, server controls and plain HTML alike.
 */
export const aspNetMarkupAdapter: LanguageAdapter = {
  id: "aspnet-markup",
  extensions: [".aspx", ".ascx", ".master", ".ashx", ".asmx", ".asax", ".svc", ".cshtml", ".razor"],
  async analyze({ absolutePath, workspaceRoot, fileIndex }): Promise<SourceAnalysisResult | null> {
    const content = await readSourceText(absolutePath);
    const thisFile = normalizeWorkspacePath(path.relative(workspaceRoot, absolutePath));
    const extension = path.extname(absolutePath).toLowerCase();
    // `directives.notices` says why each path left unlinked has no link, for the run to count at its end.
    const directives = await resolveDirectiveDependencies(content, thisFile, extension, workspaceRoot, fileIndex);
    const dependencies: DependencyEntry[] = [
      ...resolveScriptDependencies(content, thisFile, fileIndex),
      ...directives.dependencies
    ];

    if (extension === ".cshtml" || extension === ".razor") {
      const codeBehind = workspaceFile(`${thisFile}.cs`, fileIndex);
      if (codeBehind) dependencies.push(fileDependency(codeBehind));
    }

    const result: SourceAnalysisResult = {
      symbols: extractElementIds(content).map((id) => ({ name: id, kind: "variable", exportType: "named" })),
      dependencies: dedupeDependencies(dependencies)
    };
    if (directives.notices.length > 0) result.notices = directives.notices;
    return result;
  }
};

function fileDependency(file: string): DependencyEntry {
  return { specifier: file, resolvedPath: file, symbols: [], kind: "import" };
}

function resolveScriptDependencies(content: string, thisFile: string, fileIndex: WorkspaceFileIndex | undefined): DependencyEntry[] {
  const matches: DependencyEntry[] = [];
  let match: RegExpExecArray | null;

  while ((match = SCRIPT_SRC_PATTERN.exec(content)) !== null) {
    const rawSrc = match[1]?.trim();
    if (!rawSrc || rawSrc.startsWith("http://") || rawSrc.startsWith("https://")) {
      continue;
    }

    const normalised = rawSrc.replace(/\\/g, "/");
    const candidate = normalised.startsWith("~/")
      ? joinWorkspacePath("", normalised.slice(2))
      : normalised.startsWith("/")
        ? joinWorkspacePath("", normalised.slice(1))
        : joinWorkspacePath(folderOf(thisFile), normalised);
    if (candidate === undefined) continue;

    // A script named without an extension is its `.js` file when there is one.
    const resolved = (path.extname(candidate) ? undefined : workspaceFile(`${candidate}.js`, fileIndex))
      ?? workspaceFile(candidate, fileIndex);
    if (resolved) matches.push(fileDependency(resolved));
  }

  SCRIPT_SRC_PATTERN.lastIndex = 0;

  return matches;
}

/** One `<%@ … %>` directive: its name, lowercased, and its attributes by lowercased name. */
export interface Directive {
  name: string;
  attributes: Map<string, string>;
}

/** The directives of a markup file, by Microsoft's documented syntax; a directive with no name is the file type's own. Server-side comments are skipped. */
export function readDirectives(content: string, defaultName: string): Directive[] {
  const directives: Directive[] = [];
  for (const match of content.replace(SERVER_COMMENT, "").matchAll(DIRECTIVE)) {
    const body = match[1];
    const named = DIRECTIVE_NAME.exec(body);
    const attributes = new Map<string, string>();
    for (const attribute of (named ? body.slice(named[0].length) : body).matchAll(DIRECTIVE_ATTRIBUTE)) {
      attributes.set(attribute[1].toLowerCase(), attribute[2] ?? attribute[3] ?? attribute[4] ?? "");
    }
    directives.push({ name: named ? named[1].toLowerCase() : defaultName, attributes });
  }
  return directives;
}

async function resolveDirectiveDependencies(
  content: string,
  thisFile: string,
  extension: string,
  workspaceRoot: string,
  fileIndex: WorkspaceFileIndex | undefined
): Promise<{ dependencies: DependencyEntry[]; notices: SourceNotice[] }> {
  const dependencies: DependencyEntry[] = [];
  const notices: SourceNotice[] = [];
  const defaultName = DEFAULT_DIRECTIVE[extension];
  if (!defaultName) return { dependencies, notices };
  for (const directive of readDirectives(content, defaultName)) {
    for (const attribute of FILE_ATTRIBUTES[directive.name] ?? []) {
      const written = directive.attributes.get(attribute)?.trim();
      if (!written) continue;
      const resolved = await resolveDirectivePath(written, thisFile, workspaceRoot, fileIndex);
      if ("file" in resolved) {
        dependencies.push(fileDependency(resolved.file));
      } else {
        dependencies.push({ specifier: written, symbols: [], kind: "import" });
        // The generator names the file before each subject, so the subject is the path as written.
        notices.push({ reason: resolved.reason, subject: written });
      }
    }
  }
  return { dependencies, notices };
}

/** Why a directive's path has no link. */
export const DIRECTIVE_REASONS = {
  several:   "paths several projects hold, left unlinked",
  none:      "paths no file in the workspace holds, left unlinked",
  caseTwins: "paths two files match without regard to case, left unlinked",
  siteRoot:  "paths from the site's root, left unlinked"
} as const;

/** A directive's path, resolved to a workspace file or left unlinked for a reason. */
export type DirectivePath = { file: string } | { reason: string };

/**
 * The workspace file a directive's path names. A relative path is read from
 * the markup's own folder. `~/` is the root of the running web application,
 * which in a repository is a project's folder: the markup's own project (the
 * nearest folder above it with a project file), or a web project it is
 * deployed into, as a module or provider project is deployed into the web
 * application that hosts it. The path links to the one of these that holds a
 * file there. Where several hold it, the own project among them, there is no
 * link: a feature project may keep a copy of its host's master page only so
 * that it compiles, and which copy is served depends on how the build deploys
 * the project, which is not read here (mojoPortal's feature pages, measured on
 * November 19, 2026). Where none holds it there is no link either. A path from
 * the site's root (`/…`) names a deployed location no repository folder stands
 * for, and has no link.
 */
export async function resolveDirectivePath(
  written: string,
  thisFile: string,
  workspaceRoot: string,
  fileIndex: WorkspaceFileIndex | undefined
): Promise<DirectivePath> {
  const slashed = written.replace(/\\/gu, "/");
  if (slashed.startsWith("/")) return { reason: DIRECTIVE_REASONS.siteRoot };
  if (!slashed.startsWith("~/")) {
    const lookup = lookUpWorkspaceFile(joinWorkspacePath(folderOf(thisFile), slashed), fileIndex);
    return "file" in lookup ? lookup : { reason: "ambiguous" in lookup ? DIRECTIVE_REASONS.caseTwins : DIRECTIVE_REASONS.none };
  }
  if (!fileIndex) return { reason: DIRECTIVE_REASONS.none };
  const fromRoot = slashed.slice(2);
  const ownProject = nearestProjectFolder(thisFile, fileIndex);
  const roots = new Set(await webProjectFolders(workspaceRoot, fileIndex));
  if (ownProject !== undefined) roots.add(ownProject);
  const holders: string[] = [];
  for (const root of roots) {
    const lookup = lookUpWorkspaceFile(joinWorkspacePath(root, fromRoot), fileIndex);
    if ("file" in lookup) holders.push(lookup.file);
  }
  if (holders.length === 1) return { file: holders[0] };
  return { reason: holders.length > 1 ? DIRECTIVE_REASONS.several : DIRECTIVE_REASONS.none };
}

const webProjectFoldersCache = new WeakMap<WorkspaceFileIndex, Promise<string[]>>();

/** The folders of the workspace's web application projects. */
function webProjectFolders(workspaceRoot: string, fileIndex: WorkspaceFileIndex): Promise<string[]> {
  let pending = webProjectFoldersCache.get(fileIndex);
  if (!pending) {
    pending = (async () => {
      const folders = new Set<string>();
      for (const file of Array.from(fileIndex).filter(isProjectFile).sort()) {
        try {
          if (projectKind(await readSourceText(path.join(workspaceRoot, file))) === "web") folders.add(folderOf(file));
        } catch (error) {
          // A failure of the machine's is thrown on, to the generator's catch, which names it; a project file that
          // cannot be read for a cause of its own says nothing about what it builds.
          throwIfMachineFailure(error);
        }
      }
      return Array.from(folders).sort();
    })();
    webProjectFoldersCache.set(fileIndex, pending);
  }
  return pending;
}

function dedupeDependencies(entries: DependencyEntry[]): DependencyEntry[] {
  const seen = new Map<string, DependencyEntry>();
  for (const entry of entries) {
    if (!seen.has(entry.specifier)) {
      seen.set(entry.specifier, entry);
    }
  }
  return Array.from(seen.values());
}
