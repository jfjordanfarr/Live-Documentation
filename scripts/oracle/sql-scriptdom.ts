/**
 * Microsoft's T-SQL parser as the oracle for the SQL reader.
 *
 * `sql-scriptdom.cs`, beside this module, is a .NET file-based program that
 * reads every T-SQL file of a folder with ScriptDom
 * (`Microsoft.SqlServer.TransactSql.ScriptDom`, the parser SQL Server's own
 * tools use) and prints what the parser says about each: its errors, every
 * object it creates and where, every place a statement names a schema object
 * and how, and every string it executes. That record is the ground truth the
 * comparison in `sql-compare.ts` grades the reader against; nothing of the
 * reader is used to make it.
 *
 * The .NET SDK is needed only here, at development time, and NuGet on the
 * first run; a fixture keeps the record it wrote as `expected/sql-scriptdom.json`,
 * which the integration suite reads without .NET.
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import path from "node:path";

import { rebasePath } from "./files";

/** A schema object's name as the parser holds it, each part unquoted; a part not written is absent. */
export interface ScriptDomName {
  server?:   string;
  database?: string;
  schema?:   string;
  name:      string;
}

/** An error the parser reported. */
export interface ScriptDomParseError {
  line:    number;
  column:  number;
  message: string;
}

/** The kinds of object a CREATE makes, as the record names them. */
export type ScriptDomKind = "procedure" | "function" | "view" | "table" | "trigger" | "type" | "synonym" | "sequence";

/** A CREATE statement: what it makes, at the line and column of its first word, and whether the script itself runs it or a procedure's, function's or trigger's body does. */
export interface ScriptDomCreate {
  kind:   ScriptDomKind;
  name:   ScriptDomName;
  line:   number;
  column: number;
  scope:  "script" | "module";
}

/** How a statement names an object; `other` carries the parser's parent and property in `context`. */
export type ScriptDomHow =
  | "execute" | "select" | "insert" | "update" | "delete" | "merge" | "call" | "table-function" | "truncate" | "alter-table"
  | "alter" | "drop" | "foreign-key" | "grant" | "type" | "sequence" | "into" | "synonym-for" | "trigger-on" | "index-on" | "other";

/** A place a statement names a schema object. `standsFor` says when the statement decides the name is not an object of the database. */
export interface ScriptDomReference {
  how:        ScriptDomHow;
  name:       ScriptDomName;
  line:       number;
  column:     number;
  standsFor?: "cte" | "table source" | "temporary";
  context?:   string;
}

/** An `EXEC (…)` of a string, an `sp_executesql`, or an `EXEC @variable`; when the text is written out, what the parser reads in it. */
export interface ScriptDomDynamic {
  how:          "exec-string" | "sp_executesql" | "exec-variable" | "openquery";
  line:         number;
  column:       number;
  /** Whether the statement that executes the string runs in the script itself or in a module's body. */
  scope:        "script" | "module";
  literal:      boolean;
  text?:        string;
  /** The line of the file the text's first part starts on; the creates and references inside carry lines of the file. */
  textLine?:    number;
  /** The linked server an `OPENQUERY` or an `EXEC (…) AT` sends the text to. */
  server?:      string;
  parseErrors?: ScriptDomParseError[];
  creates?:     ScriptDomCreate[];
  references?:  ScriptDomReference[];
  /** The strings the text itself executes, read the same way. */
  nested?:      ScriptDomDynamic[];
}

/** What the parser says about one file. */
export interface ScriptDomFileFacts {
  parseErrors: ScriptDomParseError[];
  creates:     ScriptDomCreate[];
  references:  ScriptDomReference[];
  dynamic:     ScriptDomDynamic[];
}

/** The parser's record of a folder, file by file, in folder-relative coordinates. */
export interface ScriptDomRecord {
  tool:  string;
  files: Record<string, ScriptDomFileFacts>;
}

const EMITTER = path.join(__dirname, "sql-scriptdom.cs");

/** Runs the parser over the named files of a folder; `dotnet` must be on the path. */
export function parseSqlFiles(root: string, files: string[]): ScriptDomRecord {
  const run = spawnSync("dotnet", ["run", EMITTER, "--", root], {
    input:     files.join("\n"),
    encoding:  "utf8",
    maxBuffer: 1024 * 1024 * 1024,
    env:       { ...process.env, DOTNET_CLI_TELEMETRY_OPTOUT: "1", DOTNET_NOLOGO: "1" }
  });
  if (run.error) {
    throw new Error(`dotnet could not be run: ${run.error.message}`);
  }
  if (run.status !== 0) {
    throw new Error(`dotnet exited with ${run.status}:\n${run.stdout}\n${run.stderr}`);
  }
  return JSON.parse(run.stdout) as ScriptDomRecord;
}

/** Moves every file of the record from one directory's coordinates to another's. */
function rebase(record: ScriptDomRecord, fromDirectory: string, toDirectory: string): ScriptDomRecord {
  const files: Record<string, ScriptDomFileFacts> = {};
  for (const [file, facts] of Object.entries(record.files)) files[rebasePath(file, fromDirectory, toDirectory)] = facts;
  return { ...record, files };
}

/** Writes the record beside a fixture's other expectations, each file named relative to the record, as the other oracles' records are. */
export function writeScriptDomRecord(file: string, fixtureDirectory: string, record: ScriptDomRecord): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(rebase(record, fixtureDirectory, path.dirname(file)), null, 2)}\n`, "utf8");
}

/** Reads a record a fixture keeps into fixture-relative coordinates, or undefined when it keeps none. */
export function readScriptDomRecord(file: string, fixtureDirectory: string): ScriptDomRecord | undefined {
  if (!fs.existsSync(file)) return undefined;
  return rebase(JSON.parse(fs.readFileSync(file, "utf8")) as ScriptDomRecord, path.dirname(file), fixtureDirectory);
}
