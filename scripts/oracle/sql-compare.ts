#!/usr/bin/env node
/**
 * Grades the SQL reader against Microsoft's T-SQL parser.
 *
 * ScriptDom (through `sql-scriptdom.cs`) reads every `.sql` file of a folder,
 * or a fixture's kept record is read; the SQL adapter reads the same files
 * the way the generator has it read them, a first pass for the symbols and a
 * second with the symbol index those make. The two are then set side by side:
 *
 *   objects     what each file creates in the script itself, by kind and name,
 *               against the adapter's symbols; and of those found, whether the
 *               line is the CREATE's;
 *   references  what each file uses, as the dependency lines a Live Doc
 *               carries: a link to each file that creates a used object, with
 *               the object's name, or the name kept as written when nothing in
 *               the folder creates it, against the adapter's dependencies.
 *
 * What the grading counts as a use, and what it sets aside, is stated here
 * and nowhere else, and is the same for both sides:
 *
 *   - a use is an object executed, read from, inserted into, updated, deleted
 *     from, merged into, truncated, altered as a table, altered as a
 *     procedure, function, view or trigger, called as a function, read as a
 *     table-valued function, or referenced by a foreign key;
 *   - a string the script executes (`EXEC('…')`, `sp_executesql N'…'`,
 *     `OPENQUERY(server, '…')`) is read when every part of it is written out,
 *     as the parser reads it: what it creates is the script's when the string
 *     runs in the script itself, not in a module's body, and not on a linked
 *     server; what it uses is the script's use, on the linked server when it
 *     runs on one (`server..schema.name`). A string with a computed part is
 *     counted and not read;
 *   - an object the script creates and later alters (the "stub, then ALTER"
 *     idiom of an idempotent script) stands at its last ALTER, where its
 *     body is; an ALTER of what the script does not create is a use;
 *   - a name the statement itself defines is no object: a common table
 *     expression, a name standing for a table source of the statement's own
 *     FROM, a temporary table (`#name`);
 *   - SQL Server's own objects are no object of the folder: a name in the
 *     `sys` or `INFORMATION_SCHEMA` schema, and a call of one of the `xml`
 *     type's methods (`value`, `query`, `exist`, `nodes`, `modify`) on a
 *     column, as a call or as a table-valued function, which the parser itself
 *     cannot tell from a function of that name;
 *   - a used name is bound as T-SQL binds it, by the order Microsoft documents,
 *     the parser giving where the name stands and the documentation what it
 *     binds to (ScriptDom parses a name into its parts and says which module
 *     holds it, and binds nothing):
 *       * a name that writes its schema is that schema's object;
 *       * a one-part name in a batch binds by the user's default schema, then
 *         `dbo`: "When database objects are referenced by using a one-part
 *         name, SQL Server first looks in the user's default schema. If the
 *         object is not found there, SQL Server looks next in the dbo schema.
 *         If the object is not in the dbo schema, an error is returned."
 *         (Microsoft Learn, "Ownership and user-schema separation in SQL
 *         Server", the dbo schema);
 *       * a one-part name inside a procedure, function, view or trigger binds
 *         by that module's schema instead of the user's: "If the nonqualified
 *         procedure name appears inside the body of another procedure
 *         definition, the schema that contains this other procedure is
 *         searched next", after `sys` and before `dbo` (Microsoft Learn,
 *         "Execute a stored procedure", user-defined stored procedures); and,
 *         for every object a module names, "Active default schema is schema of
 *         the SQL module if entity referenced by a statement (except DDL,
 *         dynamic SQL, a.k.a. EXECUTE statements, or intrinsic such as
 *         object_id()) inside a procedure, function or view. Otherwise, active
 *         default schema is current user's default schema." (Microsoft's SQL
 *         Server programmability team, "Name resolution, default schema,
 *         implicit schema Part I", 2006, archived on Microsoft Learn). So a
 *         one-part name a module's DDL names (TRUNCATE TABLE, ALTER TABLE, a
 *         foreign key: "Data Definition Language (DDL) statements", Microsoft
 *         Learn, "Transact-SQL statements"), or a string the module executes
 *         names, binds by the user's default schema. A DML trigger takes the
 *         schema of its table when its own name writes none: "DML triggers are
 *         scoped to the schema of the table or view on which they're created"
 *         (Microsoft Learn, "CREATE TRIGGER", schema_name). A one-part name
 *         that neither schema holds binds to nothing, however many other
 *         schemas hold one;
 *       * `database..name` omits only the schema, whose default is a user's in
 *         that database, never the module's: "For object references outside
 *         SQL modules, or DDL, dynamic SQL inside SQL modules, current user's
 *         default schema in the specified database is used. Otherwise, the
 *         module schema owner's default schema in the specified database is
 *         used." ("Part III" of the same series); and "SQL
 *         Server first looks for DBZ.UserB.TableY. If there is no table with
 *         this name, SQL Server then looks for a table DBZ.dbo.TableY."
 *         (SQL Server 2008 Books Online, "Object Visibility and Qualification
 *         Rules"). It is read as the three-part `database.<default>.name`,
 *         and a three-part name, like a two-part one, is matched by its
 *         schema and name to the folder's objects, the database not being
 *         one the text ties to a folder;
 *       * the user's default schema is no fact of the text. The grading takes
 *         `dbo`, which "By default, users created with the CREATE USER
 *         Transact-SQL command have dbo as their default schema" (the
 *         ownership page again) makes the default, so a one-part name outside
 *         a module binds to `dbo` alone; and an object created without a
 *         written schema, in its creator's default schema, is the one a name
 *         used without a written schema binds to at `dbo`, and no name that
 *         writes a schema binds to it;
 *       * a name on a linked server is matched by schema and name, and by
 *         nothing when it omits the schema, which the linked login's default
 *         on the remote server decides; its link is marked as reached through
 *         the linked server, as the adapter marks it a contract;
 *   - a name a file uses that binds to what it creates itself, at either
 *     scope, makes no line, as the adapter writes none;
 *   - the other ways a statement names an object (a drop, a grant, a type, a
 *     sequence, a synonym's target, a trigger's or an index's table,
 *     SELECT … INTO) are counted and not graded: the reader does not claim
 *     them.
 *
 * Files the parser cannot read are listed and not graded; objects they create
 * are in neither side's index. It prints figures and lists and exits 0: the
 * list is the measurement.
 *
 * Usage:
 *   npm run oracle:sql -- <folder> [--only <prefix>] [--sample <n> --seed <s>] [--json]
 *   npm run oracle:sql -- <fixture> --write [--only <prefix>]   keep the record as expected/sql-scriptdom.json
 */
import * as fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { sqlAdapter } from "@live-documentation/engine/live-docs/adapters/sql";
import type { DependencyEntry, PublicSymbolEntry } from "@live-documentation/engine/live-docs/core";
import type { WorkspaceSymbolIndex } from "@live-documentation/engine/live-docs/coreTypes";

import { listFixtureFiles } from "./fixture";
import {
  parseSqlFiles,
  readScriptDomRecord,
  writeScriptDomRecord,
  type ScriptDomCreate,
  type ScriptDomDynamic,
  type ScriptDomHow,
  type ScriptDomModule,
  type ScriptDomName,
  type ScriptDomRecord,
  type ScriptDomReference
} from "./sql-scriptdom";

/** The ways of naming an object the grading counts as a use. */
export const GRADED_HOWS: ReadonlySet<ScriptDomHow> = new Set([
  "execute", "select", "insert", "update", "delete", "merge", "truncate", "alter-table", "alter", "call", "table-function", "foreign-key"
]);

/** A file's facts with the strings it executes written out read into them: creates with where they take effect, and references with lines of the file. */
interface ReadFacts {
  creates:    Array<ScriptDomCreate & { effective: "script" | "module" | "server" }>;
  references: ScriptDomReference[];
  /** The ALTERs of a procedure, function, view or trigger that the script itself runs, with their lines. */
  alters:     ScriptDomReference[];
}

/** The parser's facts of a file, and of every string it executes that is written out in full and parsed, nested strings included. */
export function readFacts(facts: { creates: ScriptDomCreate[]; references: ScriptDomReference[]; dynamic: ScriptDomDynamic[] }): ReadFacts {
  const read: ReadFacts = {
    creates:    facts.creates.map((create) => ({ ...create, effective: create.scope })),
    references: [...facts.references],
    alters:     facts.references.filter((reference) => reference.how === "alter")
  };
  const walk = (dynamic: ScriptDomDynamic, outer: "script" | "module", server: string | undefined): void => {
    if (!dynamic.literal || (dynamic.parseErrors?.length ?? 0) > 0) return;
    const scope = outer === "module" || dynamic.scope === "module" ? "module" : "script";
    const on    = dynamic.server ?? server;
    for (const create of dynamic.creates ?? []) read.creates.push({ ...create, effective: on ? "server" : scope === "module" || create.scope === "module" ? "module" : "script" });
    for (const reference of dynamic.references ?? []) {
      read.references.push(on && !reference.name.server ? { ...reference, name: { ...reference.name, server: on } } : reference);
      if (reference.how === "alter" && scope === "script" && !on) read.alters.push(reference);
    }
    for (const nested of dynamic.nested ?? []) walk(nested, scope, on);
  };
  for (const dynamic of facts.dynamic) walk(dynamic, "script", undefined);
  return read;
}

const SYSTEM_SCHEMAS = new Set(["sys", "information_schema"]);
const XML_METHODS    = new Set(["value", "query", "exist", "nodes", "modify"]);

/** The symbol kind the adapter gives each kind of object the parser says a script creates; a kind it has none for is absent. */
const ADAPTER_KIND: Partial<Record<ScriptDomCreate["kind"], string>> = { procedure: "procedure", function: "sql-function", view: "view", table: "table" };

// ============================================================================
// Names
// ============================================================================

/**
 * One name part as the product writes it in a symbol or a kept name: bare, or
 * in brackets when it holds what would split it or misread it (a dot, a
 * bracket, a double quote, a space at either end). Written here from the
 * product's documented form, not imported from it.
 */
export function writtenPart(part: string): string {
  return /[.[\]"]/u.test(part) || part !== part.trim() ? `[${part.replace(/\]/gu, "]]")}]` : part;
}

/** A parser's name in the product's written form: the parts written, from the first one present, a missing inner part empty. */
export function writtenName(name: ScriptDomName): string {
  const parts = [name.server, name.database, name.schema, name.name];
  const first = parts.findIndex((part) => part !== undefined);
  return parts.slice(first).map((part) => (part === undefined ? "" : writtenPart(part))).join(".");
}

/** Reads a name the product wrote back into its parts: dots outside brackets split it, brackets come off and `]]` is `]`. */
export function partsOfWritten(written: string): string[] {
  const parts: string[] = [];
  let current = "";
  for (let index = 0; index < written.length; index += 1) {
    const char = written[index];
    if (char === "[") {
      const close = closingBracket(written, index);
      current += written.slice(index + 1, close).replace(/\]\]/gu, "]");
      index = close;
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

function closingBracket(text: string, open: number): number {
  for (let index = open + 1; index < text.length; index += 1) {
    if (text[index] !== "]") continue;
    if (text[index + 1] === "]") { index += 1; continue; }
    return index;
  }
  return text.length;
}

/** A whole written name, case folded, for comparing kept names. */
function foldedWritten(parts: string[]): string {
  return parts.map((part) => writtenPart(part).toLowerCase()).join(".");
}

function partsOf(name: ScriptDomName): string[] {
  return partsOfWritten(writtenName(name));
}

// ============================================================================
// Expectations from the parser
// ============================================================================

interface CreatedObject {
  file:  string;
  kind:  ScriptDomCreate["kind"];
  name:  string;
  parts: string[];
  /** The parser's name, by whose schema and name a use binds to the object. */
  named: ScriptDomName;
  line:  number;
}

/** Whether a used name is SQL Server's own: a system schema, or an `xml` method on a column. */
export function isSqlServerOwn(reference: Pick<ScriptDomReference, "how" | "name">): boolean {
  if (reference.name.schema !== undefined && SYSTEM_SCHEMAS.has(reference.name.schema.toLowerCase())) return true;
  return (reference.how === "call" || reference.how === "table-function") && XML_METHODS.has(reference.name.name.toLowerCase());
}

/** The default schema the text never gives, taken as the one a user is created with. */
const DEFAULT_SCHEMA = "dbo";

/** The ways of naming an object that are DDL, which bind by the user's default schema even inside a module. */
const DDL_HOWS: ReadonlySet<ScriptDomHow> = new Set(["truncate", "alter-table", "foreign-key", "alter", "drop", "index-on", "trigger-on"]);

/** The schema a module's one-part names bind by: its own, or a trigger's table's when the trigger's name writes none. */
function moduleSchema(module: ScriptDomModule): string | undefined {
  return module.name.schema ?? (module.kind === "trigger" ? module.on?.schema : undefined);
}

/**
 * The schemas, in the order T-SQL searches them, in which a used name may bind, each case folded; a schema not written
 * is the default one. None when the name is on a linked server and omits its schema.
 */
export function searchedSchemas(reference: Pick<ScriptDomReference, "how" | "name" | "module">): string[] {
  const { name } = reference;
  if (name.schema !== undefined) return [name.schema.toLowerCase()];
  if (name.server !== undefined) return [];
  const inModule = name.database === undefined && reference.module !== undefined && !DDL_HOWS.has(reference.how);
  const first    = (inModule ? moduleSchema(reference.module!) : undefined) ?? DEFAULT_SCHEMA;
  return Array.from(new Set([first.toLowerCase(), DEFAULT_SCHEMA]));
}

/**
 * The objects a used name binds to: those of its name in the first schema searched that holds one. An object created
 * without a written schema is in its creator's default schema, bound only by a use that writes none either.
 */
export function bindName<Created extends { named: ScriptDomName }>(reference: Pick<ScriptDomReference, "how" | "name" | "module">, created: Created[]): Created[] {
  const name    = reference.name.name.toLowerCase();
  const written = reference.name.schema !== undefined;
  const same    = created.filter((object) => object.named.name.toLowerCase() === name && (written ? object.named.schema !== undefined : true));
  for (const schema of searchedSchemas(reference)) {
    const found = same.filter((object) => (object.named.schema ?? DEFAULT_SCHEMA).toLowerCase() === schema);
    if (found.length > 0) return found;
  }
  return [];
}

/** A dependency line as the comparison holds it: a link, `-> file :: object`, marked when reached through a linked server, or a kept name, `= name`. */
type Line = string;

function linkLine(file: string, object: string, linked = false): Line {
  return `-> ${file} :: ${foldedWritten(partsOfWritten(object))}${linked ? " (linked)" : ""}`;
}

function keptLine(parts: string[]): Line {
  return `= ${foldedWritten(parts)}`;
}

interface Expected {
  objects:    CreatedObject[];
  /** File by file, each expected line with the hows that make it. */
  lines:      Map<string, Map<Line, Set<ScriptDomHow>>>;
  setAside:   Record<string, number>;
  ungraded:   Record<string, { count: number; ofObjectsHere: number }>;
  moduleCreates: CreatedObject[];
  temporaryCreates: number;
}

/** The objects every graded file creates, and the lines and counts of the files reported, which are all of them unless a sample is drawn. */
function expectations(record: ScriptDomRecord, graded: string[], reported: ReadonlySet<string>): Expected {
  const objects: CreatedObject[] = [];
  const moduleCreates: CreatedObject[] = [];
  let temporaryCreates = 0;
  const read = new Map(graded.map((file) => [file, readFacts(record.files[file])]));
  for (const file of graded) {
    const facts = read.get(file)!;
    for (const create of facts.creates) {
      if (create.name.name.startsWith("#")) { if (reported.has(file)) temporaryCreates += 1; continue; }
      const parts   = partsOf(create.name);
      const altered = facts.alters.filter((alter) => bindName(alter, [{ named: create.name }]).length > 0 && alter.line > create.line).map((alter) => alter.line);
      const object  = { file, kind: create.kind, name: writtenName(create.name), parts, named: create.name, line: Math.max(create.line, ...altered) };
      (create.effective === "script" ? objects : moduleCreates).push(object);
    }
  }
  const byName = new Map<string, CreatedObject[]>();
  for (const object of objects) {
    const name = object.named.name.toLowerCase();
    byName.set(name, [...(byName.get(name) ?? []), object]);
  }
  const candidates  = (reference: ScriptDomReference): CreatedObject[] => byName.get(reference.name.name.toLowerCase()) ?? [];
  const createdHere = (reference: ScriptDomReference): boolean => bindName(reference, candidates(reference)).length > 0;

  const lines    = new Map<string, Map<Line, Set<ScriptDomHow>>>();
  const setAside: Record<string, number> = {};
  const ungraded: Record<string, { count: number; ofObjectsHere: number }> = {};
  const count = (bucket: string) => { setAside[bucket] = (setAside[bucket] ?? 0) + 1; };
  for (const file of graded.filter((candidate) => reported.has(candidate))) {
    const facts = read.get(file)!;
    const own   = facts.creates.map((create): CreatedObject => ({ file, kind: create.kind, name: writtenName(create.name), parts: partsOf(create.name), named: create.name, line: create.line }));
    const mine  = new Map<Line, Set<ScriptDomHow>>();
    for (const reference of facts.references) {
      const parts = partsOf(reference.name);
      if (!GRADED_HOWS.has(reference.how)) {
        const entry = ungraded[reference.how] ?? { count: 0, ofObjectsHere: 0 };
        entry.count += 1;
        if (!reference.standsFor && createdHere(reference)) entry.ofObjectsHere += 1;
        ungraded[reference.how] = entry;
        continue;
      }
      if (reference.standsFor) { count(reference.standsFor); continue; }
      if (isSqlServerOwn(reference)) { count("SQL Server's own"); continue; }
      const bound   = bindName(reference, [...candidates(reference), ...own]);
      const targets = bound.filter((object) => object.file !== file);
      const made: Line[] = targets.length > 0
        ? targets.map((object) => linkLine(object.file, object.name, reference.name.server !== undefined))
        : bound.length > 0 ? [] : [keptLine(parts)];
      if (made.length === 0) { count("the file's own"); continue; }
      for (const line of made) {
        const hows = mine.get(line) ?? new Set<ScriptDomHow>();
        hows.add(reference.how);
        mine.set(line, hows);
      }
    }
    lines.set(file, mine);
  }
  return { objects, lines, setAside, ungraded, moduleCreates, temporaryCreates };
}

// ============================================================================
// The adapter's reading
// ============================================================================

interface AdapterReading {
  symbols:      Map<string, PublicSymbolEntry[]>;
  dependencies: Map<string, DependencyEntry[]>;
}

async function readWithAdapter(root: string, files: string[]): Promise<AdapterReading> {
  const symbols = new Map<string, PublicSymbolEntry[]>();
  for (const file of files) {
    const result = await sqlAdapter.analyze({ absolutePath: path.join(root, file), workspaceRoot: root });
    symbols.set(file, result?.symbols ?? []);
  }
  const symbolIndex: WorkspaceSymbolIndex = new Map();
  for (const [file, entries] of symbols) {
    for (const symbol of entries) {
      const locations = symbolIndex.get(symbol.name) ?? [];
      locations.push({ liveDocPath: `${file}.md`, sourcePath: file, anchor: "", kind: symbol.kind });
      symbolIndex.set(symbol.name, locations);
    }
  }
  const dependencies = new Map<string, DependencyEntry[]>();
  for (const file of files) {
    const result = await sqlAdapter.analyze({ absolutePath: path.join(root, file), workspaceRoot: root, symbolIndex });
    dependencies.set(file, result?.dependencies ?? []);
  }
  return { symbols, dependencies };
}

function adapterLines(dependencies: DependencyEntry[]): Set<Line> {
  const lines = new Set<Line>();
  for (const dependency of dependencies) {
    if (dependency.resolvedPath) {
      for (const symbol of dependency.symbols) lines.add(linkLine(dependency.resolvedPath, symbol, dependency.basis === "contract"));
    } else {
      lines.add(keptLine(partsOfWritten(dependency.specifier)));
    }
  }
  return lines;
}

// ============================================================================
// The comparison
// ============================================================================

/** What the comparison found. */
export interface SqlReport {
  folder:      string;
  tool:        string;
  files:       { read: number; graded: number; parseErrors: Array<{ file: string; line: number; message: string }>; sample?: string[] };
  objects: {
    expected: number;
    found:    number;
    linesRight: number;
    byKind:   Record<string, { expected: number; found: number; linesRight: number }>;
    missing:  Array<{ file: string; kind: string; name: string; line: number }>;
    invented: Array<{ file: string; kind: string; name: string; line: number }>;
    wrongLines: Array<{ file: string; name: string; line: number; adapterLine: number }>;
    createdInBodies: number;
    createdInBodiesAsSymbols: number;
    temporaryCreates: number;
  };
  references: {
    expected: number;
    right:    number;
    missing:  Array<{ file: string; line: Line; hows: string[] }>;
    invented: Array<{ file: string; line: Line }>;
    byHow:    Record<string, { expected: number; right: number }>;
    links:    { expected: number; right: number };
    kept:     { expected: number; right: number };
    setAside: Record<string, number>;
    ungraded: Record<string, { count: number; ofObjectsHere: number }>;
  };
  dynamic: {
    byHow:     Record<string, number>;
    naming:    number;
    namingHere: number;
    examples:  Array<{ file: string; line: number; how: string; names: string[]; creates: string[]; text: string }>;
  };
}

/** A small seeded generator, so that a draw can be repeated: mulberry32. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Draws `count` of the files, in a Fisher–Yates shuffle of their sorted list by the seed, returned sorted. */
export function drawSample(files: string[], count: number, seed: number): string[] {
  const shuffled = [...files].sort();
  const random   = seeded(seed);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled.slice(0, count).sort();
}

function namesInDynamic(dynamic: ScriptDomDynamic): { used: ScriptDomReference[]; creates: string[] } {
  return {
    used:    (dynamic.references ?? []).filter((reference) => GRADED_HOWS.has(reference.how) && !reference.standsFor),
    creates: (dynamic.creates ?? []).map((create) => `${create.kind} ${writtenName(create.name)}`)
  };
}

/** Sets the adapter's reading of the graded files beside the parser's record. */
export async function compareSql(root: string, record: ScriptDomRecord, options: { sample?: string[] } = {}): Promise<SqlReport> {
  const read        = Object.keys(record.files).sort();
  const parseErrors = read.filter((file) => record.files[file].parseErrors.length > 0).map((file) => ({ file, line: record.files[file].parseErrors[0].line, message: record.files[file].parseErrors[0].message }));
  const graded      = read.filter((file) => record.files[file].parseErrors.length === 0);
  const reported    = options.sample ?? graded;
  const inReport    = new Set(reported);
  const expected    = expectations(record, graded, inReport);
  const adapter     = await readWithAdapter(root, graded);

  // Objects.
  const byKind: SqlReport["objects"]["byKind"] = {};
  const missing: SqlReport["objects"]["missing"] = [];
  const wrongLines: SqlReport["objects"]["wrongLines"] = [];
  let found = 0;
  let linesRight = 0;
  const matched = new Map<string, Set<PublicSymbolEntry>>();
  for (const object of expected.objects.filter((candidate) => inReport.has(candidate.file))) {
    const bucket = byKind[object.kind] ?? { expected: 0, found: 0, linesRight: 0 };
    bucket.expected += 1;
    byKind[object.kind] = bucket;
    const used   = matched.get(object.file) ?? new Set<PublicSymbolEntry>();
    const symbol = (adapter.symbols.get(object.file) ?? []).find((candidate) =>
      !used.has(candidate) && candidate.kind === ADAPTER_KIND[object.kind] && foldedWritten(partsOfWritten(candidate.name)) === foldedWritten(object.parts));
    if (!symbol) {
      missing.push({ file: object.file, kind: object.kind, name: object.name, line: object.line });
      continue;
    }
    used.add(symbol);
    matched.set(object.file, used);
    found += 1;
    bucket.found += 1;
    if (symbol.location?.line === object.line) {
      linesRight += 1;
      bucket.linesRight += 1;
    } else {
      wrongLines.push({ file: object.file, name: object.name, line: object.line, adapterLine: symbol.location?.line ?? 0 });
    }
  }
  const invented: SqlReport["objects"]["invented"] = [];
  for (const file of reported) {
    const used = matched.get(file) ?? new Set<PublicSymbolEntry>();
    for (const symbol of adapter.symbols.get(file) ?? []) {
      if (!used.has(symbol)) invented.push({ file, kind: symbol.kind, name: symbol.name, line: symbol.location?.line ?? 0 });
    }
  }
  const inBodies = expected.moduleCreates.filter((object) => inReport.has(object.file));
  const inBodiesAsSymbols = inBodies.filter((object) => invented.some((symbol) => symbol.file === object.file && foldedWritten(partsOfWritten(symbol.name)) === foldedWritten(object.parts))).length;

  // References.
  const byHow: SqlReport["references"]["byHow"] = {};
  const missingLines: SqlReport["references"]["missing"] = [];
  const inventedLines: SqlReport["references"]["invented"] = [];
  let expectedCount = 0;
  let right = 0;
  const links = { expected: 0, right: 0 };
  const kept  = { expected: 0, right: 0 };
  for (const file of reported) {
    const wanted = expected.lines.get(file) ?? new Map<Line, Set<ScriptDomHow>>();
    const actual = adapterLines(adapter.dependencies.get(file) ?? []);
    for (const [line, hows] of wanted) {
      const isRight = actual.has(line);
      expectedCount += 1;
      const kind = line.startsWith("->") ? links : kept;
      kind.expected += 1;
      if (isRight) { right += 1; kind.right += 1; } else { missingLines.push({ file, line, hows: Array.from(hows).sort() }); }
      for (const how of hows) {
        const bucket = byHow[how] ?? { expected: 0, right: 0 };
        bucket.expected += 1;
        if (isRight) bucket.right += 1;
        byHow[how] = bucket;
      }
    }
    for (const line of actual) {
      if (!wanted.has(line)) inventedLines.push({ file, line });
    }
  }

  // Dynamic SQL.
  const dynamicByHow: Record<string, number> = {};
  const examples: SqlReport["dynamic"]["examples"] = [];
  let naming = 0;
  let namingHere = 0;
  const tally = (file: string, dynamic: ScriptDomDynamic): void => {
    const label = `${dynamic.how}${!dynamic.literal ? " (computed)" : (dynamic.parseErrors?.length ?? 0) > 0 ? " (written out, not parsed)" : " (written out)"}`;
    dynamicByHow[label] = (dynamicByHow[label] ?? 0) + 1;
    for (const nested of dynamic.nested ?? []) tally(file, nested);
    if (!dynamic.literal) return;
    const { used, creates } = namesInDynamic(dynamic);
    if (used.length === 0 && creates.length === 0) return;
    naming += 1;
    if (used.some((reference) => bindName(reference, expected.objects).length > 0)) namingHere += 1;
    examples.push({ file, line: dynamic.line, how: dynamic.how, names: used.map((reference) => writtenName(reference.name)), creates, text: (dynamic.text ?? "").replace(/\s+/gu, " ").trim().slice(0, 160) });
  };
  for (const file of reported) {
    for (const dynamic of record.files[file].dynamic) tally(file, dynamic);
  }

  return {
    folder: root,
    tool:   record.tool,
    files:  { read: read.length, graded: graded.length, parseErrors, ...(options.sample ? { sample: options.sample } : {}) },
    objects: {
      expected: expected.objects.filter((object) => inReport.has(object.file)).length,
      found,
      linesRight,
      byKind,
      missing,
      invented,
      wrongLines,
      createdInBodies: inBodies.length,
      createdInBodiesAsSymbols: inBodiesAsSymbols,
      temporaryCreates: expected.temporaryCreates
    },
    references: { expected: expectedCount, right, missing: missingLines, invented: inventedLines, byHow, links, kept, setAside: expected.setAside, ungraded: expected.ungraded },
    dynamic: { byHow: dynamicByHow, naming, namingHere, examples }
  };
}

function printReport(report: SqlReport, detail: boolean): void {
  const lines: string[] = [];
  const { objects, references } = report;
  lines.push(`SQL reader against ${report.tool}`);
  lines.push(`Folder: ${report.folder}`);
  lines.push(`Files: ${report.files.read} read by the parser, ${report.files.graded} graded, ${report.files.parseErrors.length} it could not parse${report.files.sample ? `; reporting a sample of ${report.files.sample.length}` : ""}`);
  lines.push("");
  lines.push(`Objects created by the scripts: ${objects.expected} expected, ${objects.found} found, ${objects.missing.length} missing, ${objects.invented.length} invented`);
  lines.push(`Lines: ${objects.linesRight} of ${objects.found} found objects at the CREATE's line`);
  for (const [kind, bucket] of Object.entries(objects.byKind).sort()) lines.push(`  ${kind.padEnd(10)} ${bucket.expected} expected, ${bucket.found} found, ${bucket.linesRight} at the right line`);
  lines.push(`Created inside a procedure's, function's or trigger's body: ${objects.createdInBodies}, of which the adapter makes ${objects.createdInBodiesAsSymbols} symbols (counted among the invented)`);
  lines.push("");
  lines.push(`Dependency lines: ${references.expected} expected, ${references.right} right, ${references.missing.length} missing, ${references.invented.length} invented`);
  lines.push(`  links to a file  ${references.links.right} of ${references.links.expected}`);
  lines.push(`  names kept       ${references.kept.right} of ${references.kept.expected}`);
  for (const [how, bucket] of Object.entries(references.byHow).sort()) lines.push(`  by ${how.padEnd(15)} ${bucket.right} of ${bucket.expected}`);
  lines.push(`Set aside: ${Object.entries(references.setAside).sort().map(([what, count]) => `${what} ${count}`).join(", ")}`);
  lines.push(`Not graded: ${Object.entries(references.ungraded).sort().map(([how, entry]) => `${how} ${entry.count} (${entry.ofObjectsHere} of objects created here)`).join(", ")}`);
  lines.push("");
  lines.push(`Executed strings: ${Object.entries(report.dynamic.byHow).sort().map(([how, count]) => `${how} ${count}`).join(", ")}`);
  lines.push(`  written out and naming or creating an object: ${report.dynamic.naming}; naming an object created in the folder: ${report.dynamic.namingHere}`);

  if (detail) {
    const section = (title: string, items: string[]) => {
      if (items.length === 0) return;
      lines.push("");
      lines.push(`${title} (${items.length}):`);
      for (const item of items) lines.push(`  ${item}`);
    };
    section("Files the parser could not read", report.files.parseErrors.map((error) => `${error.file}:${error.line} ${error.message}`));
    section("Objects missing", objects.missing.map((object) => `${object.file}:${object.line} ${object.kind} ${object.name}`));
    section("Objects invented", objects.invented.map((object) => `${object.file}:${object.line} ${object.kind} ${JSON.stringify(object.name)}`));
    section("Lines wrong", objects.wrongLines.map((object) => `${object.file} ${object.name}: ${object.line}, the adapter says ${object.adapterLine}`));
    section("Dependency lines missing", references.missing.map((entry) => `${entry.file}: ${entry.line}  (${entry.hows.join(", ")})`));
    section("Dependency lines invented", references.invented.map((entry) => `${entry.file}: ${entry.line}`));
    section("Executed strings that name an object", report.dynamic.examples.map((example) => `${example.file}:${example.line} ${example.how} ${[...example.creates, ...example.names].join(", ")} | ${example.text}`));
  }
  console.log(lines.join("\n"));
}

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

async function main(): Promise<void> {
  const args   = process.argv.slice(2);
  const folder = args.find((arg, index) => !arg.startsWith("--") && !["--only", "--sample", "--seed"].includes(args[index - 1] ?? ""));
  if (!folder || args.includes("--help") || args.includes("-h")) {
    console.log("Usage: npm run oracle:sql -- <folder> [--only <prefix>] [--sample <n> --seed <s>] [--write] [--json] [--detail]");
    process.exit(folder ? 0 : 1);
  }
  const root    = path.resolve(folder);
  const only    = option(args, "--only");
  const kept    = path.join(root, "expected", "sql-scriptdom.json");
  const files   = listFixtureFiles(root).filter((file) => file.toLowerCase().endsWith(".sql") && (!only || file.startsWith(only)));
  const record  = args.includes("--write") || !fs.existsSync(kept) ? parseSqlFiles(root, files) : readScriptDomRecord(kept, root)!;
  if (args.includes("--write")) {
    writeScriptDomRecord(kept, root, record);
    console.log(`wrote ${path.relative(process.cwd(), kept)} (${Object.keys(record.files).length} files)`);
  }
  const sampleSize = option(args, "--sample");
  const graded     = Object.keys(record.files).filter((file) => record.files[file].parseErrors.length === 0);
  const sample     = sampleSize ? drawSample(graded, Number(sampleSize), Number(option(args, "--seed") ?? "1119")) : undefined;
  const report     = await compareSql(root, record, sample ? { sample } : {});
  if (args.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report, args.includes("--detail") || sample !== undefined);
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exit(1);
  });
}
