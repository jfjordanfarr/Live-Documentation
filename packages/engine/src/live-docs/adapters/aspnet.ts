import path from "node:path";

import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import { readSourceText, throwIfMachineFailure } from "../../tooling/sourceText";
import type { DependencyEntry, SourceAnalysisResult } from "../core";
import type { SourceNotice } from "../coreTypes";
import { folderOf, isProjectFile, joinWorkspacePath, lookUpWorkspaceFile, nearestProjectFolder, workspaceFile } from "./dotnetPaths";
import { extractElementIds } from "./html";
import type { LanguageAdapter, WorkspaceFileIndex } from "./index";
import { projectKind, projectSdk } from "./project";

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
    // Each `notices` says why each path left unlinked has no link, for the run to count at its end.
    const razor = extension === ".cshtml" || extension === ".razor";
    const scripts = await resolveScriptDependencies(withoutMarkupComments(content, razor), razor, thisFile, workspaceRoot, fileIndex);
    const directives = await resolveDirectiveDependencies(content, thisFile, extension, workspaceRoot, fileIndex);
    const dependencies: DependencyEntry[] = [
      ...scripts.dependencies,
      ...directives.dependencies
    ];
    const notices = [...scripts.notices, ...directives.notices];

    if (razor) {
      const codeBehind = workspaceFile(`${thisFile}.cs`, fileIndex);
      if (codeBehind) dependencies.push(fileDependency(codeBehind));
    }

    const result: SourceAnalysisResult = {
      symbols: extractElementIds(content).map((id) => ({ name: id, kind: "variable", exportType: "named" })),
      dependencies: dedupeDependencies(dependencies)
    };
    if (notices.length > 0) result.notices = notices;
    return result;
  }
};

/**
 * The markup with every comment written over in spaces, its line breaks kept, so that positions keep: an HTML comment
 * (`<!-- … -->`, which no browser runs a script inside, a conditional comment's content among them since Internet
 * Explorer 10), and the comment the server removes before anything is sent, Web Forms' `<%-- … --%>` or Razor's
 * `@* … *@`. An HTML comment ends at the first `-->`, or at once when it is `<!-->` or `<!--->`, as HTML parses it, so
 * the content a downlevel-revealed conditional comment (`<!--[if !IE]><!--> … <!--<![endif]-->`) leaves outside every
 * comment is kept.
 */
export function withoutMarkupComments(text: string, razor: boolean): string {
  const server = razor ? { open: "@*", close: "*@" } : { open: "<%--", close: "--%>" };
  let result = "";
  let at = 0;
  for (;;) {
    const html = text.indexOf("<!--", at);
    const own  = text.indexOf(server.open, at);
    if (html === -1 && own === -1) return result + text.slice(at);
    const isHtml = own === -1 || (html !== -1 && html < own);
    const start  = isHtml ? html : own;
    let until: number;
    if (isHtml) {
      const rest = text.slice(start + 4, start + 6);
      const abrupt = rest.startsWith(">") ? start + 5 : rest === "->" ? start + 6 : undefined;
      const close = text.indexOf("-->", start + 4);
      until = abrupt ?? (close === -1 ? text.length : close + 3);
    } else {
      const close = text.indexOf(server.close, start + server.open.length);
      until = close === -1 ? text.length : close + server.close.length;
    }
    result += text.slice(at, start) + text.slice(start, until).replace(/[^\r\n]/gu, " ");
    at = until;
  }
}

function fileDependency(file: string): DependencyEntry {
  return { specifier: file, resolvedPath: file, symbols: [], kind: "import" };
}

/** Razor code in an attribute's value: `@` followed by a name, a parenthesis or a brace. */
const RAZOR_CODE = /@[\p{L}_({]/u;

/** An address with a scheme or a host of its own (`https://…`, `//cdn…`): served from elsewhere, never a file here. */
const REMOTE_ADDRESS = /^(?:[a-z][a-z\d+.-]*:)?\/\//iu;

/**
 * The files a markup file's `<script src>` names, by the directives' rule
 * (`resolveDirectivePath`): relative to the markup's folder, `~/` from the web
 * application that holds the file, and no link from the site's root, each path
 * without a link said with its reason. A query or fragment names no file, so
 * `dnn.js?ver=<%= … %>` is `dnn.js`. A remote address is not read, nor a path
 * the page computes as it runs (a server expression or Razor's), which the
 * markup does not write; no constant one, `<%= ResolveUrl("~/…") %>`, was found
 * in DNN's or mojoPortal's markup on 2026-11-21.
 */
async function resolveScriptDependencies(
  content: string,
  razor: boolean,
  thisFile: string,
  workspaceRoot: string,
  fileIndex: WorkspaceFileIndex | undefined
): Promise<{ dependencies: DependencyEntry[]; notices: SourceNotice[] }> {
  const dependencies: DependencyEntry[] = [];
  const notices: SourceNotice[] = [];
  for (const match of content.matchAll(SCRIPT_SRC_PATTERN)) {
    const written = match[1]?.trim();
    if (!written || REMOTE_ADDRESS.test(written)) continue;
    const bare = written.replace(/\\/gu, "/").replace(/[?#].*$/su, "");
    // Razor's code starts at `@` followed by a name or a parenthesis, anywhere in the value: `summernote-@(language).js`.
    if (!bare || bare.includes("<%") || (razor ? RAZOR_CODE.test(bare) : bare.startsWith("@"))) continue;

    // A script named without an extension is its `.js` file when there is one.
    const asScript = path.extname(bare) ? undefined : await resolveDirectivePath(`${bare}.js`, thisFile, workspaceRoot, fileIndex);
    const resolved = asScript && "file" in asScript ? asScript : await resolveDirectivePath(bare, thisFile, workspaceRoot, fileIndex);
    if ("file" in resolved) {
      dependencies.push(fileDependency(resolved.file));
    } else {
      dependencies.push({ specifier: written, symbols: [], kind: "import" });
      // The generator names the file before each subject, so the subject is the path as written.
      notices.push({ reason: resolved.reason, subject: written });
    }
  }
  return { dependencies, notices };
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
 *
 * An ASP.NET Core application serves its web root instead, `wwwroot` by
 * default (Microsoft's "Static files in ASP.NET Core"), and `~/` names it: so
 * the root of a web project whose project file names the SDK
 * `Microsoft.NET.Sdk.Web` and that has a `wwwroot` beside it is that folder.
 * A view of such a project reads `~/` and `/` from its own web root alone,
 * since it is the application; a module or plugin project's view reads `~/`
 * from the web roots of the applications it may be deployed into, as above.
 */
export async function resolveDirectivePath(
  written: string,
  thisFile: string,
  workspaceRoot: string,
  fileIndex: WorkspaceFileIndex | undefined
): Promise<DirectivePath> {
  const slashed = written.replace(/\\/gu, "/");
  const ownProject = fileIndex ? nearestProjectFolder(thisFile, fileIndex) : undefined;
  const applications = fileIndex ? await webApplications(workspaceRoot, fileIndex) : new Map<string, WebApplication>();
  const own = ownProject === undefined ? undefined : applications.get(ownProject);
  if (own?.core && (slashed.startsWith("/") || slashed.startsWith("~/"))) {
    const lookup = lookUpWorkspaceFile(joinWorkspacePath(own.root, slashed.replace(/^~?\//u, "")), fileIndex);
    return "file" in lookup ? lookup : { reason: "ambiguous" in lookup ? DIRECTIVE_REASONS.caseTwins : DIRECTIVE_REASONS.none };
  }
  if (slashed.startsWith("/")) return { reason: DIRECTIVE_REASONS.siteRoot };
  if (!slashed.startsWith("~/")) {
    const lookup = lookUpWorkspaceFile(joinWorkspacePath(folderOf(thisFile), slashed), fileIndex);
    return "file" in lookup ? lookup : { reason: "ambiguous" in lookup ? DIRECTIVE_REASONS.caseTwins : DIRECTIVE_REASONS.none };
  }
  if (!fileIndex) return { reason: DIRECTIVE_REASONS.none };
  const fromRoot = slashed.slice(2);
  const roots = new Set(Array.from(applications.values(), (application) => application.root));
  if (ownProject !== undefined) roots.add(own?.root ?? ownProject);
  const holders: string[] = [];
  for (const root of roots) {
    const lookup = lookUpWorkspaceFile(joinWorkspacePath(root, fromRoot), fileIndex);
    if ("file" in lookup) holders.push(lookup.file);
  }
  if (holders.length === 1) return { file: holders[0] };
  return { reason: holders.length > 1 ? DIRECTIVE_REASONS.several : DIRECTIVE_REASONS.none };
}

/** A web application project: whether it is an ASP.NET Core one, and the folder it serves `~/` from. */
interface WebApplication {
  core: boolean;
  root: string;
}

const webApplicationsCache = new WeakMap<WorkspaceFileIndex, Promise<Map<string, WebApplication>>>();

/** The workspace's web application projects, by folder. */
function webApplications(workspaceRoot: string, fileIndex: WorkspaceFileIndex): Promise<Map<string, WebApplication>> {
  let pending = webApplicationsCache.get(fileIndex);
  if (!pending) {
    pending = (async () => {
      // The folders that hold a `wwwroot`, read once from the index: what is beside a project file is a fact of the files.
      const webRoots = new Set<string>();
      for (const file of fileIndex) {
        const at = `/${file}`.toLowerCase().lastIndexOf("/wwwroot/");
        if (at !== -1) webRoots.add(file.slice(0, Math.max(at - 1, 0)));
      }
      const applications = new Map<string, WebApplication>();
      for (const file of Array.from(fileIndex).filter(isProjectFile).sort()) {
        try {
          const text = await readSourceText(path.join(workspaceRoot, file));
          if (projectKind(text) !== "web") continue;
          const folder = folderOf(file);
          const core = projectSdk(text).toLowerCase() === "microsoft.net.sdk.web" && webRoots.has(folder);
          applications.set(folder, { core, root: core ? joinWorkspacePath(folder, "wwwroot") ?? folder : folder });
        } catch (error) {
          // A failure of the machine's is thrown on, to the generator's catch, which names it; a project file that
          // cannot be read for a cause of its own says nothing about what it builds.
          throwIfMachineFailure(error);
        }
      }
      return applications;
    })();
    webApplicationsCache.set(fileIndex, pending);
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
