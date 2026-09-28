/**
 * Openings: what a file serves across a process boundary, and the matching of
 * a call to the file that serves it.
 *
 * @remarks
 * A route a controller serves, an address a service listens on, a procedure or
 * a table a database script declares: each is a public symbol of the file that
 * declares it, and the symbol's kind says which. Another file calls the opening
 * by its name in a string, and this module finds the declaring file in the
 * workspace symbol index. The edge that results was observed from a contract
 * (a name both sides carry) or from configuration (an address both sides
 * carry), never from source, and it says so through its basis.
 *
 * @module
 */

import type { ResolvedSymbolLocation, WorkspaceSymbolIndex } from "./coreTypes";

// ============================================================================
// Kinds
// ============================================================================

/** The kind of a symbol that is a route a file serves. */
export const ROUTE_KIND = "route";
/** The kind of a symbol that is an address a service listens on. */
export const ADDRESS_KIND = "address";
/** The kinds of symbols a database script declares. */
export const SQL_OBJECT_KINDS: ReadonlySet<string> = new Set(["procedure", "table", "view", "sql-function"]);

const HTTP_METHODS: ReadonlySet<string> = new Set(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]);

// ============================================================================
// Routes
// ============================================================================

/** A route as a call names it or a controller serves it: the method, when known, and the path's segments. */
export interface RoutePattern {
  method?: string;
  /** Path segments: `{name}` is a parameter, `{*}` a catch-all, and `{}` a segment the caller computes. */
  segments: string[];
}

/**
 * The segments of a route template, without its scheme and host, leading `~/`
 * or `/`, query string, parameter constraints or optional marks.
 */
export function routeSegments(template: string): string[] {
  let text = template.trim();
  text = text.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]*/iu, "");
  text = text.replace(/\?(?![^{]*\})[\s\S]*$/u, "").replace(/#.*$/u, "");
  text = text.replace(/^~\//u, "").replace(/^\/+/u, "");
  return text
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      if (segment.startsWith("{") && segment.endsWith("}")) {
        const inner = segment.slice(1, -1);
        if (inner.startsWith("*")) {
          return "{*}";
        }
        return `{${inner.replace(/[:?=].*$/u, "")}}`;
      }
      return segment;
    });
}

/** True when the text looks like an HTTP method. */
export function isHttpMethod(text: string | undefined): text is string {
  return text !== undefined && HTTP_METHODS.has(text.toUpperCase());
}

/** The name of a route symbol: the method, when known, then the normalised path. */
export function routeSymbolName(method: string | undefined, template: string): string {
  const path = routeSegments(template).join("/");
  return isHttpMethod(method) ? `${method.toUpperCase()} ${path}` : path;
}

/** Reads a route symbol's name back into a pattern. */
export function parseRouteSymbol(name: string): RoutePattern {
  const space = name.indexOf(" ");
  const first = space === -1 ? "" : name.slice(0, space);
  if (isHttpMethod(first)) {
    return { method: first.toUpperCase(), segments: routeSegments(name.slice(space + 1)) };
  }
  return { segments: routeSegments(name) };
}

/** True when a call names the served route: the same method when both are known, then segment by segment. */
export function routesMatch(call: RoutePattern, served: RoutePattern): boolean {
  if (call.method && served.method && call.method !== served.method) {
    return false;
  }
  const catchAll = served.segments[served.segments.length - 1] === "{*}";
  const fixed = catchAll ? served.segments.length - 1 : served.segments.length;
  if (catchAll ? call.segments.length < fixed : call.segments.length !== fixed) {
    return false;
  }
  for (let index = 0; index < fixed; index += 1) {
    const servedSegment = served.segments[index];
    const callSegment = call.segments[index];
    if (servedSegment.startsWith("{")) {
      continue;
    }
    if (callSegment.startsWith("{") || servedSegment.toLowerCase() !== callSegment.toLowerCase()) {
      return false;
    }
  }
  return true;
}

/** A route some file serves, as the symbol index records it. */
export interface ServedRoute {
  name: string;
  pattern: RoutePattern;
  location: ResolvedSymbolLocation;
}

const routeCache = new WeakMap<WorkspaceSymbolIndex, ServedRoute[]>();

/** Every route symbol of the workspace, read once per index. */
export function servedRoutes(index: WorkspaceSymbolIndex): ServedRoute[] {
  let routes = routeCache.get(index);
  if (!routes) {
    routes = [];
    for (const [name, locations] of index) {
      for (const location of locations) {
        if (location.kind === ROUTE_KIND) {
          routes.push({ name, pattern: parseRouteSymbol(name), location });
        }
      }
    }
    routeCache.set(index, routes);
  }
  return routes;
}

/** The served routes a call matches, in index order. */
export function matchRoute(call: RoutePattern, index: WorkspaceSymbolIndex): ServedRoute[] {
  return servedRoutes(index).filter((route) => routesMatch(call, route.pattern));
}

// ============================================================================
// Home: the system a file belongs to
// ============================================================================

const MANIFEST = /(^|\/)(?:[^/]+\.(?:csproj|vbproj|fsproj)|package\.json|pom\.xml|build\.gradle(?:\.kts)?|go\.mod|Cargo\.toml|pyproject\.toml|Gemfile)$/u;

const manifestDirectoriesCache = new WeakMap<object, Set<string>>();

function manifestDirectories(fileIndex: Iterable<string> & object): Set<string> {
  let directories = manifestDirectoriesCache.get(fileIndex);
  if (!directories) {
    directories = new Set();
    for (const file of fileIndex) {
      if (MANIFEST.test(file)) {
        directories.add(dirname(file));
      }
    }
    manifestDirectoriesCache.set(fileIndex, directories);
  }
  return directories;
}

function dirname(file: string): string {
  const slash = file.lastIndexOf("/");
  return slash === -1 ? "" : file.slice(0, slash);
}

/**
 * The system a file belongs to: the directory of the nearest manifest above it
 * among the workspace's files, or the workspace root when there is none.
 */
export function homeOf(sourcePath: string, fileIndex: (Iterable<string> & object) | undefined): string {
  if (!fileIndex) {
    return "";
  }
  const directories = manifestDirectories(fileIndex);
  let directory = dirname(sourcePath);
  for (;;) {
    if (directories.has(directory)) {
      return directory;
    }
    if (directory === "") {
      return "";
    }
    directory = dirname(directory);
  }
}

/**
 * Chooses among the files that serve a called route.
 *
 * @remarks
 * A browser script calls its own site, so a server at home wins when there is
 * one; a server's HTTP client calls other systems, so a server away from home
 * wins. When only one side serves the route, that side is the answer, and
 * several servers on the chosen side are all kept, since the files alone
 * cannot say which one answers.
 */
export function chooseServers(matches: ServedRoute[], caller: string, fileIndex: (Iterable<string> & object) | undefined, prefersHome: boolean): ServedRoute[] {
  const home = homeOf(caller, fileIndex);
  const atHome = matches.filter((route) => homeOf(route.location.sourcePath, fileIndex) === home);
  const away = matches.filter((route) => !atHome.includes(route));
  const preferred = prefersHome ? atHome : away;
  return preferred.length > 0 ? preferred : (prefersHome ? away : atHome);
}

// ============================================================================
// Database objects
// ============================================================================

/** An object a database script declares or names: its last two name parts, lowercased, and whether a linked server carries it. */
export interface SqlObjectName {
  parts: string[];
  linked: boolean;
}

const SQL_IDENTIFIER = String.raw`(?:\[[^\]]+\]|"[^"]+"|[A-Za-z_][\w$#]*)`;
const SQL_NAME = String.raw`${SQL_IDENTIFIER}(?:\.(?:${SQL_IDENTIFIER})?){0,3}`;
const SQL_DECLARATION = new RegExp(String.raw`\bCREATE\s+(?:OR\s+(?:ALTER|REPLACE)\s+)?(PROCEDURE|PROC|TABLE|VIEW|FUNCTION)\s+(${SQL_NAME})`, "giu");
const SQL_REFERENCE = new RegExp(String.raw`\b(EXECUTE|EXEC|INSERT\s+INTO|DELETE\s+FROM|UPDATE|FROM|JOIN|MERGE\s+INTO|TRUNCATE\s+TABLE|ALTER\s+TABLE)\s+(${SQL_NAME})`, "giu");
const SQL_KEYWORDS_AFTER_FROM: ReadonlySet<string> = new Set(["select", "where", "values", "set", "into", "as", "on", "with"]);

/** Reads a written object name: brackets and quotes off, server and database qualifiers off, case folded. */
export function sqlObjectName(raw: string): SqlObjectName {
  const parts = raw.split(".").map((part) => part.replace(/^\[|\]$/gu, "").replace(/^"|"$/gu, "").trim());
  const linked = parts.length === 4 || (parts.length >= 3 && parts.slice(1, -1).some((part) => part === ""));
  const named = parts.filter((part) => part !== "");
  return { parts: (named.length > 2 ? named.slice(-2) : named).map((part) => part.toLowerCase()), linked };
}

/** The name of a database object as written, brackets and quotes off. */
export function sqlDeclaredName(raw: string): string {
  return raw.split(".").map((part) => part.replace(/^\[|\]$/gu, "").replace(/^"|"$/gu, "").trim()).join(".");
}

/** The kind of a `CREATE` statement, as a symbol kind. A SQL function is `sql-function`, so that it is never mistaken for a function of a source language. */
function sqlKind(keyword: string): string {
  const lower = keyword.toLowerCase();
  return lower === "proc" ? "procedure" : lower === "function" ? "sql-function" : lower;
}

/** SQL text without its comments and string literals, positions kept. */
export function stripSql(text: string): string {
  return text.replace(/--[^\n]*|\/\*[\s\S]*?\*\/|'(?:[^']|'')*'/gu, (match) => " ".repeat(match.length));
}

/** One object a script declares. */
export interface SqlDeclaration {
  kind: string;
  name: string;
  line: number;
}

/** Every object a script creates. */
export function sqlDeclarations(text: string): SqlDeclaration[] {
  const stripped = stripSql(text);
  const declarations: SqlDeclaration[] = [];
  for (const match of stripped.matchAll(SQL_DECLARATION)) {
    declarations.push({ kind: sqlKind(match[1]), name: sqlDeclaredName(match[2]), line: lineOf(stripped, match.index ?? 0) });
  }
  return declarations;
}

/** One object a script or a query names. */
export interface SqlReference {
  verb: string;
  name: SqlObjectName;
  /** The name as written, brackets and quotes off. */
  raw: string;
}

/** Every object the text names after a verb that reads, writes, calls or alters it. */
export function sqlReferences(text: string): SqlReference[] {
  const references: SqlReference[] = [];
  for (const match of stripSql(text).matchAll(SQL_REFERENCE)) {
    const raw = sqlDeclaredName(match[2]);
    const first = raw.split(".")[0].toLowerCase();
    if (SQL_KEYWORDS_AFTER_FROM.has(first)) {
      continue;
    }
    references.push({ verb: match[1].replace(/\s+/gu, " ").toUpperCase(), name: sqlObjectName(match[2]), raw });
  }
  return references;
}

function lineOf(text: string, index: number): number {
  let line = 1;
  for (let position = 0; position < index; position += 1) {
    if (text.charCodeAt(position) === 10) {
      line += 1;
    }
  }
  return line;
}

/** A database object some script declares, as the symbol index records it. */
export interface DeclaredSqlObject {
  name: string;
  parts: string[];
  location: ResolvedSymbolLocation;
}

const sqlObjectCache = new WeakMap<WorkspaceSymbolIndex, DeclaredSqlObject[]>();

/** Every procedure, table, view and function symbol of the workspace, read once per index. */
export function declaredSqlObjects(index: WorkspaceSymbolIndex): DeclaredSqlObject[] {
  let objects = sqlObjectCache.get(index);
  if (!objects) {
    objects = [];
    for (const [name, locations] of index) {
      for (const location of locations) {
        if (SQL_OBJECT_KINDS.has(location.kind)) {
          objects.push({ name, parts: sqlObjectName(name).parts, location });
        }
      }
    }
    sqlObjectCache.set(index, objects);
  }
  return objects;
}

/** The declared objects a name matches: schema and object when both are written, the object alone otherwise. */
export function matchSqlObject(name: SqlObjectName, index: WorkspaceSymbolIndex): DeclaredSqlObject[] {
  return declaredSqlObjects(index).filter((object) => {
    if (name.parts.length >= 2) {
      return object.parts.length === 2 && object.parts[0] === name.parts[0] && object.parts[1] === name.parts[1];
    }
    return object.parts[object.parts.length - 1] === name.parts[0];
  });
}
