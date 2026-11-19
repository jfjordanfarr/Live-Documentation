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
/** The kinds of the symbol a project file publishes: what the project builds. */
export const PROJECT_KINDS: ReadonlySet<string> = new Set(["library", "program", "web"]);
/** The kind of the symbol a package manifest publishes. */
export const PACKAGE_KIND = "package";
/** The kinds that mark a doc as a manifest's, whose external dependencies are what a thing stands on. */
export const MANIFEST_KINDS: ReadonlySet<string> = new Set([...PROJECT_KINDS, PACKAGE_KIND]);
/** The kinds of symbols that are openings: a file that serves one is an entry, since its caller is outside the scan. */
export const OPENING_KINDS: ReadonlySet<string> = new Set([ROUTE_KIND, ADDRESS_KIND, ...SQL_OBJECT_KINDS]);

const MANIFEST_NAMES: ReadonlySet<string> = new Set(["package.json", "pom.xml", "build.gradle", "build.gradle.kts", "go.mod", "Cargo.toml", "pyproject.toml", "Gemfile"]);
const PROJECT_FILE = /\.(?:csproj|vbproj|fsproj)$/iu;

/**
 * True for a package manifest, by its name: a .NET project file,
 * `package.json`, `pom.xml`, a Gradle build, `go.mod`, `Cargo.toml`,
 * `pyproject.toml` or a `Gemfile`. Its folder is a system's home, and a tool
 * reads it.
 */
function isManifestFile(sourcePath: string): boolean {
  const normalized = sourcePath.replace(/\\/g, "/");
  const name = normalized.slice(normalized.lastIndexOf("/") + 1);
  return MANIFEST_NAMES.has(name) || PROJECT_FILE.test(name);
}

const TOOLING_FILE = /^(?:packages\.config|tsconfig(?:\.[^/]+)?\.json|web\.config|app\.config|[^/]+\.config\.(?:[cm]?[jt]s|json))$/iu;

/**
 * The files an editor or a development container reads, by the documented places they live: `.vscode/settings.json`,
 * `.vscode/tasks.json`, `.devcontainer/devcontainer.json`, `.devcontainer.json`, and a second configuration one folder
 * down, `.devcontainer/<name>/devcontainer.json`, which is the Dev Containers specification's third place and no deeper.
 */
const TOOLING_PATH = /(?:^|\/)(?:\.vscode\/[^/]+\.json|\.devcontainer\/(?:[^/]+\/)?devcontainer\.json|\.devcontainer\.json)$/iu;

/**
 * True when a file is one a tool reads and no file imports: by its name, a
 * package manifest ({@link isManifestFile}, whether or not it names a package, so
 * that a workspace's root `Cargo.toml` is one too), a compiler's or a runner's
 * configuration (`tsconfig.json`, `tsconfig.base.json`,
 * `vitest.config.ts`, `playwright.config.ts`), a .NET configuration
 * (`Web.config`, `App.config`) or package list (`packages.config`); by its
 * place, an editor's or a development container's configuration
 * (`.vscode/*.json`, `.devcontainer/devcontainer.json`, and since 2026-11-17 a
 * second configuration in a folder beside it), which discovery reads
 * since 2026-10-16 and nothing else names. Such a file is an entry by the
 * `tooling` reason, and a command that names one names an input, not the file
 * it runs.
 */
export function isToolingFile(sourcePath: string): boolean {
  const normalized = sourcePath.replace(/\\/g, "/");
  return isManifestFile(normalized) || TOOLING_FILE.test(normalized.slice(normalized.lastIndexOf("/") + 1)) || TOOLING_PATH.test(normalized);
}

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

const manifestDirectoriesCache = new WeakMap<object, Set<string>>();

function manifestDirectories(fileIndex: Iterable<string> & object): Set<string> {
  let directories = manifestDirectoriesCache.get(fileIndex);
  if (!directories) {
    directories = new Set();
    for (const file of fileIndex) {
      if (isManifestFile(file)) {
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

/** The parts of a written name, split at the dots outside its quoted names, each quoted name unquoted. */
export function sqlNameParts(written: string): string[] {
  const parts: string[] = [];
  let current = "";
  for (let index = 0; index < written.length; index += 1) {
    const char = written[index];
    if (char === "[" || char === "\"") {
      const close = char === "[" ? "]" : "\"";
      let end = index + 1;
      while (end < written.length && !(written[end] === close && written[end + 1] !== close)) end += written[end] === close ? 2 : 1;
      current += written.slice(index + 1, end).split(close + close).join(close);
      index = end;
    } else if (char === ".") {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts;
}

/**
 * A name's parts written as one name: joined by dots, a part bare unless it
 * holds what would split it or misread it (a dot, a bracket, a double quote,
 * a space at either end), which is then quoted in brackets. So
 * `tests.[test it doesn't fail]` is written `tests.test it doesn't fail`, and
 * `[test fn.sums]` keeps its brackets, and {@link sqlNameParts} reads either
 * back into the same parts.
 */
export function sqlWrittenName(parts: string[]): string {
  return parts.map((part) => (/[.[\]"]/u.test(part) || part !== part.trim() ? `[${part.replace(/\]/gu, "]]")}]` : part)).join(".");
}

/** Reads a written object name: quotes off, server and database qualifiers off, case folded. */
export function sqlObjectName(raw: string): SqlObjectName {
  const parts = sqlNameParts(raw);
  const linked = parts.length === 4 || (parts.length >= 3 && parts.slice(1, -1).some((part) => part === ""));
  return { parts: parts.slice(-2).filter((part) => part !== "").map((part) => part.toLowerCase()), linked };
}

/** The kind of a `CREATE` statement, as a symbol kind. A SQL function is `sql-function`, so that it is never mistaken for a function of a source language. */
function sqlKind(keyword: string): string {
  const lower = keyword.toLowerCase();
  return lower === "proc" ? "procedure" : lower === "function" ? "sql-function" : lower;
}

/**
 * The words T-SQL reserves (Microsoft's "Reserved Keywords (Transact-SQL)"):
 * none of them is a name unless it is quoted, so one written bare where a
 * name could stand is the statement going on, as `EXECUTE AS`, `UPDATE
 * STATISTICS` or `FROM OPENQUERY(…)`. Data types are not among them. The list
 * is T-SQL's; Oracle reserves most of the same words.
 */
const SQL_RESERVED: ReadonlySet<string> = new Set(`
  ADD ALL ALTER AND ANY AS ASC AUTHORIZATION BACKUP BEGIN BETWEEN BREAK BROWSE BULK BY CASCADE CASE CHECK CHECKPOINT
  CLOSE CLUSTERED COALESCE COLLATE COLUMN COMMIT COMPUTE CONSTRAINT CONTAINS CONTAINSTABLE CONTINUE CONVERT CREATE CROSS
  CURRENT CURRENT_DATE CURRENT_TIME CURRENT_TIMESTAMP CURRENT_USER CURSOR DATABASE DBCC DEALLOCATE DECLARE DEFAULT DELETE
  DENY DESC DISK DISTINCT DISTRIBUTED DOUBLE DROP DUMP ELSE END ERRLVL ESCAPE EXCEPT EXEC EXECUTE EXISTS EXIT EXTERNAL
  FETCH FILE FILLFACTOR FOR FOREIGN FREETEXT FREETEXTTABLE FROM FULL FUNCTION GOTO GRANT GROUP HAVING HOLDLOCK IDENTITY
  IDENTITY_INSERT IDENTITYCOL IF IN INDEX INNER INSERT INTERSECT INTO IS JOIN KEY KILL LEFT LIKE LINENO LOAD MERGE
  NATIONAL NOCHECK NONCLUSTERED NOT NULL NULLIF OF OFF OFFSETS ON OPEN OPENDATASOURCE OPENQUERY OPENROWSET OPENXML OPTION
  OR ORDER OUTER OVER PERCENT PIVOT PLAN PRECISION PRIMARY PRINT PROC PROCEDURE PUBLIC RAISERROR READ READTEXT
  RECONFIGURE REFERENCES REPLICATION RESTORE RESTRICT RETURN REVERT REVOKE RIGHT ROLLBACK ROWCOUNT ROWGUIDCOL RULE SAVE
  SCHEMA SECURITYAUDIT SELECT SEMANTICKEYPHRASETABLE SEMANTICSIMILARITYDETAILSTABLE SEMANTICSIMILARITYTABLE SESSION_USER
  SET SETUSER SHUTDOWN SOME STATISTICS SYSTEM_USER TABLE TABLESAMPLE TEXTSIZE THEN TO TOP TRAN TRANSACTION TRIGGER
  TRUNCATE TRY_CONVERT TSEQUAL UNION UNIQUE UNPIVOT UPDATE UPDATETEXT USE USER VALUES VARYING VIEW WAITFOR WHEN WHERE
  WHILE WITH WRITETEXT
`.trim().split(/\s+/u));

/** The words that begin a statement, where a statement left without its `;` ends. */
const SQL_STATEMENT_STARTS: ReadonlySet<string> = new Set([
  "SELECT", "INSERT", "UPDATE", "DELETE", "MERGE", "EXEC", "EXECUTE", "DECLARE", "SET", "IF", "ELSE", "WHILE", "BEGIN", "END", "RETURN",
  "PRINT", "RAISERROR", "THROW", "CREATE", "ALTER", "DROP", "TRUNCATE", "WITH", "COMMIT", "ROLLBACK", "OPEN", "FETCH", "CLOSE",
  "DEALLOCATE", "GOTO", "WAITFOR", "USE", "GRANT", "DENY", "REVOKE"
]);

/**
 * The schemas that hold the database engine's own catalog: SQL Server's
 * `sys` and `INFORMATION_SCHEMA` (the SQL standard's, which MySQL and
 * PostgreSQL keep too), and Oracle's `SYS`. Nothing of a workspace lives in
 * them, so a name in one is the engine's, never an object to link or keep.
 */
const SQL_SYSTEM_SCHEMAS: ReadonlySet<string> = new Set(["sys", "information_schema"]);

/**
 * SQL Server's built-in table-valued functions that T-SQL does not reserve,
 * read as a one-part name called in a `FROM` or a `JOIN`; the rowset
 * functions it does reserve (`OPENQUERY`, `OPENROWSET`, `OPENXML`,
 * `OPENDATASOURCE`) are never names already.
 */
const SQL_BUILT_IN_TABLE_FUNCTIONS: ReadonlySet<string> = new Set(["openjson", "string_split", "generate_series"]);

/**
 * The methods of SQL Server's `xml` type. `r.Lines.value('…', 'int')` calls
 * one on a column, and reads, as text, like a function `value` in a schema
 * `Lines`; such a call is the column's method, not an object.
 */
const SQL_XML_METHODS: ReadonlySet<string> = new Set(["value", "query", "exist", "nodes", "modify"]);

/**
 * The words after which a name followed by a parenthesis is the thing the
 * statement names, not a call: `ON dbo.T (column)` of an index or a grant,
 * `INTO dbo.T (column)` of an `OUTPUT` or `SELECT`, `ALTER FUNCTION dbo.f (@p)`,
 * an event session's `ADD EVENT sqlserver.rpc_completed (…)` and `ADD TARGET
 * package0.ring_buffer (…)`.
 */
const SQL_WORDS_BEFORE_A_NAMED_THING: readonly string[] = ["ON", "INTO", "FUNCTION", "PROCEDURE", "PROC", "TRIGGER", "VIEW", "TABLE", "TYPE", "INDEX", "EVENT", "TARGET"];

/** The kinds of `CREATE` a script's symbols are made from. */
const SQL_DECLARED_KINDS: ReadonlySet<string> = new Set(["PROCEDURE", "PROC", "TABLE", "VIEW", "FUNCTION"]);

/**
 * The kinds of module whose body is statements. In T-SQL each must be the
 * only statement of its batch, so its body runs to the batch's end, and a
 * table created after it in the batch is created when the module runs, not by
 * the script.
 */
const SQL_MODULES_WITH_BODIES: ReadonlySet<string> = new Set(["PROCEDURE", "PROC", "FUNCTION", "TRIGGER"]);

/** The kinds of module an `ALTER` redefines; the `ALTER` uses the module, and where the script itself creates it, stands for its definition. */
const SQL_ALTERED_MODULES: readonly string[] = ["PROCEDURE", "PROC", "FUNCTION", "VIEW", "TRIGGER"];

/** The kinds of `CREATE` whose name a `FROM` may follow that is no table source: `CREATE TYPE x FROM INT`, `CREATE USER x FROM LOGIN y`. */
const SQL_KINDS_WITH_FROM: ReadonlySet<string> = new Set(["TYPE", "USER", "LOGIN", "CERTIFICATE", "ASSEMBLY", "KEY"]);

/** One token of SQL text. */
interface SqlToken {
  /** A bare word, a quoted name, an `@` variable, a string, a number, one character of punctuation, or the end of a batch. */
  kind: "word" | "name" | "variable" | "string" | "number" | "symbol" | "batch";
  /** A word or a quoted name as the database reads it, unquoted; a symbol's characters. */
  value: string;
  /** The line it begins on and the line it ends on. */
  line: number;
  end: number;
}

/** The index just past a quoted run that opens at `open` and closes with `close`, a doubled `close` standing for one; the text's end when it never closes. */
function quotedEnd(text: string, open: number, close: string): number {
  for (let index = open + 1; index < text.length; index += 1) {
    if (text[index] !== close) continue;
    if (text[index + 1] === close) { index += 1; continue; }
    return index + 1;
  }
  return text.length;
}

/** What a quoted run opening at `open` holds: the text between its quotes, each doubled `close` one. */
function unquoted(text: string, open: number, close: string): string {
  const end = quotedEnd(text, open, close);
  return text.slice(open + 1, end === text.length && text[end - 1] !== close ? end : end - 1).split(close + close).join(close);
}

/** The index just past a block comment opening at `open`. T-SQL's block comments nest, so a comment that holds another ends where the outer one closes; Oracle's do not nest. */
function blockCommentEnd(text: string, open: number): number {
  let depth = 0;
  for (let index = open; index < text.length - 1; index += 1) {
    if (text[index] === "/" && text[index + 1] === "*") { depth += 1; index += 1; }
    else if (text[index] === "*" && text[index + 1] === "/") { depth -= 1; index += 1; if (depth === 0) return index + 1; }
  }
  return text.length;
}

const SQL_WORD_START = /[\p{L}_#]/u;
const SQL_WORD_PART = /[\p{L}\p{N}_@$#]/u;

/** Whether the character code is a letter, `_` or `#`, which can begin a word: ASCII by its code, the rest by Unicode's letters. */
function startsWord(code: number): boolean {
  return (code >= 97 && code <= 122) || (code >= 65 && code <= 90) || code === 95 || code === 35 || (code > 127 && SQL_WORD_START.test(String.fromCharCode(code)));
}

/** Whether the character code can continue a word: a letter, a digit, `_`, `@`, `$` or `#`. */
function continuesWord(code: number): boolean {
  return (code >= 97 && code <= 122) || (code >= 65 && code <= 90) || (code >= 48 && code <= 57) || code === 95 || code === 64 || code === 36 || code === 35
    || (code > 127 && SQL_WORD_PART.test(String.fromCharCode(code)));
}

/** Whether the character code is white space. */
function isSpace(code: number): boolean {
  return code === 32 || (code >= 9 && code <= 13) || (code > 127 && /\s/u.test(String.fromCharCode(code)));
}

/**
 * SQL text as tokens. Comments are dropped, a string is one token whatever it
 * holds, and a name quoted in T-SQL's brackets (`]]` standing for `]`) or in
 * double quotes (`""` standing for `"`), as `QUOTED_IDENTIFIER`, on by default
 * in SQL Server's tools, reads them, is one token whose value is the name
 * itself: it can hold any character, an apostrophe, a dot or a line break. A
 * string or comment left open runs to the end of the text. Each token carries
 * the lines it spans, counted in the text as it stands, where a line ends at
 * a line feed, a carriage return and line feed, or a carriage return alone, as
 * editors and SQL Server's own parser count them. A `GO` alone on its
 * line, T-SQL's batch separator, and a `/` alone on its line, Oracle's, end a
 * batch.
 */
function sqlTokens(text: string): SqlToken[] {
  const tokens: SqlToken[] = [];
  let index = 0;
  let line  = 1;
  const advance = (to: number) => {
    for (; index < to; index += 1) {
      const code = text.charCodeAt(index);
      if (code === 10 || (code === 13 && text.charCodeAt(index + 1) !== 10)) line += 1;
    }
  };
  const take = (kind: SqlToken["kind"], to: number, value: string) => {
    const start = line;
    advance(to);
    tokens.push({ kind, value, line: start, end: line });
  };
  while (index < text.length) {
    const code = text.charCodeAt(index);
    if (isSpace(code)) { advance(index + 1); continue; }
    const char = text[index];
    const next = text[index + 1];
    if (char === "-" && next === "-") {
      let end = index;
      while (end < text.length && text[end] !== "\n" && text[end] !== "\r") end += 1;
      advance(end);
      continue;
    }
    if (char === "/" && next === "*") { advance(blockCommentEnd(text, index)); continue; }
    if (char === "'" || ((char === "N" || char === "n") && next === "'")) {
      const open = char === "'" ? index : index + 1;
      take("string", quotedEnd(text, open, "'"), unquoted(text, open, "'"));
      continue;
    }
    if (char === "[" || char === "\"") {
      const close = char === "[" ? "]" : "\"";
      take("name", quotedEnd(text, index, close), unquoted(text, index, close));
      continue;
    }
    if (char === "@" || startsWord(code)) {
      let end = index + 1;
      while (end < text.length && continuesWord(text.charCodeAt(end))) end += 1;
      take(char === "@" ? "variable" : "word", end, text.slice(index, end));
      continue;
    }
    if (code >= 48 && code <= 57) {
      let end = index + 1;
      while (end < text.length && (continuesWord(text.charCodeAt(end)) || text[end] === ".")) end += 1;
      take("number", end, text.slice(index, end));
      continue;
    }
    take("symbol", index + (char === ":" && next === ":" ? 2 : 1), char === ":" && next === ":" ? "::" : char);
  }
  return tokens.map((token, position) => {
    const alone = (position === 0 || tokens[position - 1].end < token.line);
    const after = tokens[position + 1];
    const endsLine = !after || after.line > token.end || (after.kind === "number" && (!tokens[position + 2] || tokens[position + 2].line > after.end));
    const separator = (token.kind === "word" && token.value.toUpperCase() === "GO") || (token.kind === "symbol" && token.value === "/");
    return separator && alone && endsLine ? { ...token, kind: "batch" } : token;
  });
}

/** True for a token that is a name, quoted or bare; a bare word T-SQL reserves is none. */
function isNameToken(token: SqlToken | undefined): token is SqlToken {
  return token !== undefined && (token.kind === "name" || (token.kind === "word" && !SQL_RESERVED.has(token.value.toUpperCase())));
}

function isWord(token: SqlToken | undefined, ...words: string[]): boolean {
  return token !== undefined && token.kind === "word" && words.includes(token.value.toUpperCase());
}

function isSymbol(token: SqlToken | undefined, symbol: string): boolean {
  return token !== undefined && token.kind === "symbol" && token.value === symbol;
}

/** A dotted name starting at `start`: up to four parts, a part left empty between two dots (`server..schema.name`). */
function readName(tokens: SqlToken[], start: number): { parts: string[]; end: number } | undefined {
  if (!isNameToken(tokens[start])) return undefined;
  const parts = [tokens[start].value];
  let end = start + 1;
  while (parts.length < 4 && isSymbol(tokens[end], ".")) {
    const part = tokens[end + 1];
    if (part && (part.kind === "word" || part.kind === "name")) {
      parts.push(part.value);
      end += 2;
    } else {
      parts.push("");
      end += 1;
    }
  }
  return { parts, end };
}

/**
 * A call of a function by a name of two or more parts, `schema.function(…)`,
 * starting at `start`: T-SQL calls a scalar function of a schema only by such
 * a name, so a call by one part (`CONVERT(…)`, `COUNT(…)`) is the engine's
 * own. A name that continues another (`).value(`, `@x.value(`, `OBJECT::x`)
 * or that a word before it makes the thing named is no call.
 */
function readCall(tokens: SqlToken[], start: number): { parts: string[]; end: number } | undefined {
  const previous = tokens[start - 1];
  if (isSymbol(previous, ".") || isSymbol(previous, "::") || previous?.kind === "variable" || isWord(previous, ...SQL_WORDS_BEFORE_A_NAMED_THING)) return undefined;
  const name = readName(tokens, start);
  return name && name.parts.length >= 2 && isSymbol(tokens[name.end], "(") ? name : undefined;
}

/** The index just past the parenthesised group opening at `open`. */
function groupEnd(tokens: SqlToken[], open: number): number {
  let depth = 0;
  for (let index = open; index < tokens.length; index += 1) {
    if (isSymbol(tokens[index], "(")) depth += 1;
    else if (isSymbol(tokens[index], ")") && (depth -= 1) === 0) return index + 1;
  }
  return tokens.length;
}

/** The batches of a script's tokens, split where a batch ends. */
function sqlBatches(tokens: SqlToken[]): SqlToken[][] {
  const batches: SqlToken[][] = [[]];
  for (const token of tokens) {
    if (token.kind === "batch") batches.push([]);
    else batches[batches.length - 1].push(token);
  }
  return batches;
}

/**
 * The names a batch's common table expressions are given: `WITH name [(columns)] AS (…)`, and each `, name AS (…)` after it.
 * A name is read as the expression's anywhere in the batch, T-SQL scoping it to its one statement.
 */
function commonTableExpressions(tokens: SqlToken[]): Set<string> {
  const names = new Set<string>();
  for (let index = 0; index < tokens.length; index += 1) {
    if (!isWord(tokens[index], "WITH")) continue;
    let at = index + 1;
    for (;;) {
      if (!isNameToken(tokens[at])) break;
      let after = at + 1;
      if (isSymbol(tokens[after], "(")) after = groupEnd(tokens, after);
      if (!isWord(tokens[after], "AS") || !isSymbol(tokens[after + 1], "(")) break;
      names.add(tokens[at].value.toLowerCase());
      at = groupEnd(tokens, after + 1);
      if (!isSymbol(tokens[at], ",")) break;
      at += 1;
    }
  }
  return names;
}

/** A table source of a `FROM`, a `JOIN`, an `APPLY` or a `USING`: a table's name (none for a table variable), where its name starts and ends, and its alias. */
interface TableSource {
  parts?: string[];
  start: number;
  after: number;
  alias?: string;
}

/**
 * The table sources read from `start`, after a `FROM`, a `JOIN`, an `APPLY`
 * or a `USING`: one, or after a `FROM` each of a comma list (`FROM Users u,
 * Roles r`). A source may stand in parentheses (`LEFT JOIN (dbo.T t JOIN …)`),
 * be a table variable, take arguments (a table-valued function), an alias with
 * its column names, and table hints (`WITH (NOLOCK)`, or the older `(NOLOCK)`).
 */
function tableSources(tokens: SqlToken[], start: number, list: boolean): TableSource[] {
  const sources: TableSource[] = [];
  let at = start;
  for (;;) {
    while (isSymbol(tokens[at], "(")) at += 1;
    const variable = tokens[at]?.kind === "variable";
    const name = variable ? undefined : readName(tokens, at);
    if (!variable && !name) break;
    const source: TableSource = { parts: name?.parts, start: at, after: name ? name.end : at + 1 };
    let end = source.after;
    if (isSymbol(tokens[end], "(")) end = groupEnd(tokens, end);
    if (isWord(tokens[end], "AS")) end += 1;
    if (isNameToken(tokens[end])) {
      source.alias = tokens[end].value;
      end += 1;
      if (isSymbol(tokens[end], "(")) end = groupEnd(tokens, end);
    }
    if (isWord(tokens[end], "WITH") && isSymbol(tokens[end + 1], "(")) end = groupEnd(tokens, end + 1);
    sources.push(source);
    if (!list || !isSymbol(tokens[end], ",")) break;
    at = end + 1;
  }
  return sources;
}

/**
 * The names the table sources of a statement's own `FROM` are known by, read
 * from `start` to where the statement ends: each table's last part, or its
 * alias, a table variable's alias among them (`FROM @Jobs Jobs`). An `UPDATE`
 * or a `DELETE` whose target is one of these names updates that table source,
 * so the target is no object of its own.
 */
function statementSources(tokens: SqlToken[], start: number): Set<string> {
  const names = new Set<string>();
  let depth = 0;
  let setSeen = false;
  for (let index = start; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (isSymbol(token, "(")) depth += 1;
    else if (isSymbol(token, ")")) depth -= 1;
    else if (isSymbol(token, ";") && depth === 0) break;
    else if (token.kind === "word" && depth === 0) {
      const word = token.value.toUpperCase();
      if (word === "SET" && !setSeen) { setSeen = true; continue; }
      if (SQL_STATEMENT_STARTS.has(word)) break;
    }
    if (!isWord(token, "FROM", "JOIN")) continue;
    for (const source of tableSources(tokens, index + 1, isWord(token, "FROM"))) {
      if (source.parts) names.add(source.parts[source.parts.length - 1].toLowerCase());
      if (source.alias) names.add(source.alias.toLowerCase());
    }
  }
  return names;
}

/** One object a script declares. */
export interface SqlDeclaration {
  kind: string;
  name: string;
  line: number;
  /** True for a table a procedure's, function's or trigger's body creates when that runs: no object the script itself creates. */
  inBody: boolean;
}

/** One object a script or a query names. */
export interface SqlReference {
  verb: string;
  name: SqlObjectName;
  /** The name as written, each part unquoted, written back by {@link sqlWrittenName}. */
  raw: string;
}

/**
 * What a script creates and what it names, read from its tokens batch by
 * batch: what it executes (`EXEC @rc = name` too; PL/SQL's `EXECUTE
 * IMMEDIATE` executes a string, which is not read), reads (`FROM`, `JOIN`,
 * `APPLY`, a `MERGE`'s `USING`), writes (`INSERT`, `UPDATE`, `DELETE`,
 * `MERGE`, with or without `INTO` and `FROM`), truncates or alters, what a
 * foreign key `REFERENCES`, and every function it calls by a name of two or
 * more parts. A name is no object of the database, and makes no reference,
 * when it is a temporary table (`#name`), a common table expression of its
 * batch, a cursor a `FETCH … FROM` reads, a service a `BEGIN DIALOG … FROM`
 * names, as an `UPDATE`'s or a `DELETE`'s target a table source of the
 * statement's own `FROM`, or the engine's own: a name in a system schema, a
 * built-in table function, or a method of the `xml` type.
 */
export function readSql(text: string): { declarations: SqlDeclaration[]; references: SqlReference[] } {
  const read: SqlReading = { declarations: [], references: [], alters: new Map() };
  readSqlText(text, { offset: 0, inBody: false }, read);
  for (const declaration of read.declarations) {
    const altered = read.alters.get(sqlObjectName(declaration.name).parts.join("."));
    if (!declaration.inBody && altered !== undefined && altered > declaration.line) declaration.line = altered;
  }
  return { declarations: read.declarations, references: read.references };
}

/** What a reading gathers: declarations, references, and the last line at which the script itself alters each object. */
interface SqlReading {
  declarations: SqlDeclaration[];
  references: SqlReference[];
  alters: Map<string, number>;
}

/**
 * Where a text is read from: the number of lines before it in the file,
 * whether it runs inside a module's body, and the linked server it runs on
 * when an `OPENQUERY` or an `EXEC (…) AT` sends it to one.
 */
interface SqlPlace {
  offset: number;
  inBody: boolean;
  server?: string;
}

/** The literal text of an executed string written out in full: string tokens joined by `+` from `start` up to `end`; undefined when any part is computed. */
function literalText(tokens: SqlToken[], start: number, end: number): { text: string; line: number } | undefined {
  const parts: string[] = [];
  for (let index = start; index < end; index += 2) {
    if (tokens[index]?.kind !== "string") return undefined;
    parts.push(tokens[index].value);
    if (index + 1 < end && !isSymbol(tokens[index + 1], "+")) return undefined;
  }
  return parts.length > 0 ? { text: parts.join(""), line: tokens[start].line } : undefined;
}

/** A name's parts on a linked server: the server first, then the database, schema and object in their places, an empty place for one not written. */
function onServer(server: string, parts: string[]): string[] {
  return parts.length >= 4 ? parts : [server, ...Array<string>(3 - parts.length).fill(""), ...parts];
}

function readSqlText(text: string, place: SqlPlace, into: SqlReading): void {
  const { declarations, references } = into;
  for (const tokens of sqlBatches(sqlTokens(text))) {
    const expressions = commonTableExpressions(tokens);
    /** Where a table source's name starts that a comma list has read already, so that no later token reads it as a call. */
    const read = new Set<number>();
    let inBody = false;
    const refer = (verb: string, parts: string[], at: number, target: boolean): void => {
      const last = parts[parts.length - 1];
      if (last.startsWith("#")) return;
      if (parts.length >= 2 && SQL_SYSTEM_SCHEMAS.has(parts[parts.length - 2].toLowerCase())) return;
      if (parts.length === 1 && SQL_BUILT_IN_TABLE_FUNCTIONS.has(last.toLowerCase()) && isSymbol(tokens[at], "(")) return;
      if (parts.length >= 2 && SQL_XML_METHODS.has(last.toLowerCase()) && isSymbol(tokens[at], "(")) return;
      if (parts.length === 1 && expressions.has(last.toLowerCase())) return;
      if (target && parts.length === 1 && statementSources(tokens, at).has(last.toLowerCase())) return;
      const raw = sqlWrittenName(place.server ? onServer(place.server, parts) : parts);
      references.push({ verb, name: sqlObjectName(raw), raw });
    };
    /** Reads an executed string's text, which runs where the statement that executes it runs, or on the server named. */
    const execute = (literal: { text: string; line: number }, server?: string): void => {
      readSqlText(literal.text, { offset: place.offset + literal.line - 1, inBody: place.inBody || inBody, server: server ?? place.server }, into);
    };
    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index];
      if (token.kind !== "word" && token.kind !== "name") continue;
      const word = token.kind === "word" ? token.value.toUpperCase() : "";
      const previous = tokens[index - 1];

      if (word === "CREATE") {
        let at = index + 1;
        if (isWord(tokens[at], "OR") && isWord(tokens[at + 1], "ALTER", "REPLACE")) at += 2;
        if (isWord(tokens[at], "ASYMMETRIC", "SYMMETRIC")) at += 1;
        const kind = tokens[at]?.kind === "word" ? tokens[at].value.toUpperCase() : "";
        const name = readName(tokens, at + 1);
        if (!name) continue;
        if (SQL_DECLARED_KINDS.has(kind) && !name.parts[name.parts.length - 1].startsWith("#") && !place.server) {
          declarations.push({ kind: sqlKind(kind), name: sqlWrittenName(name.parts), line: token.line + place.offset, inBody: place.inBody || (kind === "TABLE" && inBody) });
        }
        if (SQL_MODULES_WITH_BODIES.has(kind)) inBody = true;
        index = SQL_KINDS_WITH_FROM.has(kind) && isWord(tokens[name.end], "FROM") ? name.end : name.end - 1;
        continue;
      }
      if (word === "ALTER" && isWord(tokens[index + 1], ...SQL_ALTERED_MODULES)) {
        if (!isWord(tokens[index + 1], "VIEW")) inBody = true;
        const name = readName(tokens, index + 2);
        if (!name) continue;
        refer("ALTER", name.parts, name.end, false);
        if (!place.inBody && !place.server) into.alters.set(sqlObjectName(sqlWrittenName(name.parts)).parts.join("."), token.line + place.offset);
        index = name.end - 1;
        continue;
      }
      if (word === "OPENQUERY" && isSymbol(tokens[index + 1], "(") && isNameToken(tokens[index + 2]) && isSymbol(tokens[index + 3], ",")) {
        const literal = literalText(tokens, index + 4, groupEnd(tokens, index + 1) - 1);
        if (literal) execute(literal, tokens[index + 2].value);
        continue;
      }

      let verb: string | undefined;
      let at = index + 1;
      let target = false;
      if (word === "FROM" && tokens.slice(Math.max(0, index - 3), index).some((before) => isWord(before, "FETCH"))) {
        continue;
      } else if (word === "FROM" && previous?.kind === "variable" && isWord(tokens[index - 2], "DIALOG", "CONVERSATION")) {
        continue;
      } else if ((word === "EXEC" || word === "EXECUTE") && isSymbol(tokens[at], "(")) {
        const close = groupEnd(tokens, at);
        const literal = literalText(tokens, at + 1, close - 1);
        const server = isWord(tokens[close], "AT") && isNameToken(tokens[close + 1]) ? tokens[close + 1].value : undefined;
        if (literal) execute(literal, server);
        index = close - 1;
        continue;
      } else if (word === "EXEC" || word === "EXECUTE") {
        verb = isWord(tokens[at], "IMMEDIATE") ? undefined : word;
        if (tokens[at]?.kind === "variable" && isSymbol(tokens[at + 1], "=")) at += 2;
        const name = verb ? readName(tokens, at) : undefined;
        if (name && name.parts[name.parts.length - 1].toLowerCase() === "sp_executesql") {
          let statement = name.end;
          if (tokens[statement]?.kind === "variable" && isSymbol(tokens[statement + 1], "=")) statement += 2;
          const literal = isSymbol(tokens[statement + 1], "+") ? undefined : literalText(tokens, statement, statement + 1);
          if (literal) execute(literal);
        }
      } else if (word === "FROM" || word === "JOIN" || word === "APPLY" || (word === "USING" && !isWord(tokens[at + 1], "INDEX"))) {
        const sources = tableSources(tokens, at, word === "FROM");
        for (const source of sources) {
          if (source.parts) refer(word, source.parts, source.after, false);
          read.add(source.start);
        }
        if (sources.length > 0) index = sources[0].after - 1;
        continue;
      } else if (word === "REFERENCES") {
        verb = word;
      } else if (word === "UPDATE" && !isWord(previous, "ON")) {
        verb = word;
        target = true;
      } else if (word === "INSERT" || word === "MERGE") {
        verb = isWord(tokens[at], "INTO") ? `${word} INTO` : word;
        at += verb === word ? 0 : 1;
      } else if (word === "DELETE" && !isWord(previous, "ON")) {
        verb = isWord(tokens[at], "FROM") ? "DELETE FROM" : word;
        at += verb === word ? 0 : 1;
        target = true;
      } else if ((word === "TRUNCATE" || word === "ALTER") && isWord(tokens[at], "TABLE")) {
        verb = `${word} TABLE`;
        at += 1;
      }
      if (verb) {
        const name = readName(tokens, at);
        if (!name) continue;
        refer(verb, name.parts, name.end, target);
        index = name.end - 1;
        continue;
      }

      const call = read.has(index) ? undefined : readCall(tokens, index);
      if (!call) continue;
      refer("CALL", call.parts, call.end, false);
      index = call.end - 1;
    }
  }
}

/** Every object a script creates. */
export function sqlDeclarations(text: string): SqlDeclaration[] {
  return readSql(text).declarations;
}

/** Every object the text names after a verb that reads, writes, calls or alters it. */
export function sqlReferences(text: string): SqlReference[] {
  return readSql(text).references;
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

/** True when a written name names the declared object: schema and object when both are written, the object alone otherwise. */
export function sqlNameMatches(name: SqlObjectName, declared: SqlObjectName): boolean {
  if (name.parts.length >= 2) {
    return declared.parts.length === 2 && declared.parts[0] === name.parts[0] && declared.parts[1] === name.parts[1];
  }
  return declared.parts[declared.parts.length - 1] === name.parts[0];
}

/** The declared objects a name matches, by {@link sqlNameMatches}. */
export function matchSqlObject(name: SqlObjectName, index: WorkspaceSymbolIndex): DeclaredSqlObject[] {
  let byName = sqlObjectsByNameCache.get(index);
  if (!byName) {
    byName = new Map();
    for (const object of declaredSqlObjects(index)) {
      const last = object.parts[object.parts.length - 1];
      byName.set(last, [...(byName.get(last) ?? []), object]);
    }
    sqlObjectsByNameCache.set(index, byName);
  }
  return (byName.get(name.parts[name.parts.length - 1]) ?? []).filter((object) => sqlNameMatches(name, { parts: object.parts, linked: false }));
}

/** The declared objects by the last part of their name, so that a name is matched only against those it could match; read once per index. */
const sqlObjectsByNameCache = new WeakMap<WorkspaceSymbolIndex, Map<string, DeclaredSqlObject[]>>();
