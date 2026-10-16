/**
 * PowerShell's own parser as the oracle for the PowerShell adapter.
 *
 * `powershell-ast.ps1`, beside this module, reads every PowerShell file of a
 * fixture's working copy with `System.Management.Automation.Language.Parser`
 * and prints what the parser says about each: its functions with their help,
 * what it publishes, its dot-sources, its `Import-Module` and
 * `Export-ModuleMember` commands as PowerShell's static binder binds them, its
 * `using` statements, the modules its `#requires` names, its parse errors, and
 * a `.psd1`'s table. That record is kept whole beside the compiler edges as
 * `expected/powershell-ast.json`, and the file-to-file edges are drawn from it:
 * a dot-source, a module import, a `using module`, a `#requires` path or a
 * manifest's module or script entry that names a file of the fixture.
 *
 * `pwsh` is needed only here, at development time; the adapter reads the
 * grammar and the comparison reads the committed record.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import type { OracleEdge, OracleEdges, OracleProject } from "./scip-edges";

/** An error the parser reported, at its line and column; an error reading a data file has neither. */
export interface PowerShellParseError {
  line:    number | null;
  column:  number | null;
  id:      string;
  message: string;
}

/** A parameter's help, under the key the help gives (upper-cased by PowerShell) and the spelling the function declares. */
export interface PowerShellParameterHelp {
  key:         string;
  name:        string;
  description: string | null;
}

/** A function's comment-based help, every field as `GetHelpContent` returns it, untrimmed. */
export interface PowerShellHelp {
  synopsis:              string | null;
  description:           string | null;
  parameters:            PowerShellParameterHelp[];
  notes:                 string | null;
  examples:              string[];
  inputs:                string[];
  outputs:               string[];
  links:                 string[];
  component:             string | null;
  role:                  string | null;
  functionality:         string | null;
  forwardHelpTargetName: string | null;
  forwardHelpCategory:   string | null;
  remoteHelpRunspace:    string | null;
  externalHelp:          string | null;
}

/** A `FunctionDefinitionAst`: a function, filter or workflow, or the body of a class's constructor or method (`member`). */
export interface PowerShellFunction {
  name:       string;
  keyword:    "function" | "filter" | "workflow";
  member:     boolean;
  line:       number;
  column:     number;
  /** The parameters it declares, in its header or its `param()` block, as spelled there. */
  parameters: string[];
  help:       PowerShellHelp | null;
}

/** A `TypeDefinitionAst`: a class, an enum or an interface, at the line and column its extent starts. */
export interface PowerShellTypeDefinition {
  name:   string;
  kind:   "class" | "enum" | "interface";
  line:   number;
  column: number;
}

/** What the static binder bound to one parameter: the argument's text, and its strings when every part of it is a string written out. */
export interface PowerShellBoundArgument {
  text:   string | null;
  values: string[] | null;
}

/** A command as PowerShell's static binder reads it. */
export interface PowerShellCommand {
  line:          number;
  column:        number;
  text:          string;
  parameters:    Record<string, PowerShellBoundArgument>;
  bindingErrors: Array<{ parameter: string; message: string }>;
}

/** An `Import-Module`, by whatever name it was called, with each module it names and the file a path among them resolves to. */
export interface PowerShellImportModule extends PowerShellCommand {
  command: string;
  names:   Array<{ name: string | null; text: string; resolved: string | null }>;
}

/** A dot-source: its target when the text is a string, and the file it resolves to. */
export interface PowerShellDotSource {
  line:     number;
  column:   number;
  text:     string;
  target:   string | null;
  resolved: string | null;
}

/** A `using` statement of any kind; a `using module` path resolves to a file. */
export interface PowerShellUsingStatement {
  line:     number;
  column:   number;
  text:     string;
  kind:     string;
  name:     string | null;
  resolved: string | null;
}

/** A module a `#requires -Modules` names. */
export interface PowerShellRequiredModule {
  name:            string;
  version:         string | null;
  requiredVersion: string | null;
  maximumVersion:  string | null;
  guid:            string | null;
  resolved:        string | null;
}

/** What the parser says about a `.ps1` or `.psm1`. */
export interface PowerShellScriptFacts {
  parseErrors:         PowerShellParseError[];
  functions:           PowerShellFunction[];
  /** The functions a reader of the file sees: all but a class's members, narrowed by `Export-ModuleMember -Function` when the file calls it with every pattern written out. */
  published:           string[];
  types:               PowerShellTypeDefinition[];
  exportModuleMembers: PowerShellCommand[];
  dotSources:          PowerShellDotSource[];
  importModules:       PowerShellImportModule[];
  usingStatements:     PowerShellUsingStatement[];
  requiredModules:     PowerShellRequiredModule[];
}

/** A module or script a manifest's table names: under which key, by what name, at what version when a module specification writes one, and the file it resolves to. */
export interface PowerShellManifestReference {
  key:      string;
  value:    string;
  version:  string | null;
  resolved: string | null;
}

/** What `Import-PowerShellDataFile` says about a `.psd1`: its table, and the modules and scripts a manifest's table names. */
export interface PowerShellDataFileFacts {
  parseErrors: PowerShellParseError[];
  data:        unknown;
  references:  PowerShellManifestReference[];
}

/** What the parser says about one file: a script's or module's facts, or a data file's. */
export type PowerShellFileFacts = PowerShellScriptFacts | PowerShellDataFileFacts;

/** The parser's record of a fixture, file by file, in fixture-relative coordinates. */
export interface PowerShellAst {
  tool:  string;
  files: Record<string, PowerShellFileFacts>;
}

/** The extensions PowerShell reads: scripts, modules and data files. */
export const POWERSHELL_EXTENSIONS = [".ps1", ".psm1", ".psd1"];

const EMITTER = path.join(__dirname, "powershell-ast.ps1");

/** Whether the facts are a `.psd1`'s, which carry its table rather than a script's commands. */
export function isDataFileFacts(facts: PowerShellFileFacts): facts is PowerShellDataFileFacts {
  return "data" in facts;
}

/** Runs the parser over the named files of a working copy; `pwsh` must be on the path. */
export function parsePowerShellFixture(workDir: string, files: string[]): PowerShellAst {
  const run = spawnSync("pwsh", ["-NoLogo", "-NoProfile", "-NonInteractive", "-File", EMITTER, "-Root", workDir], {
    input:     files.join("\n"),
    encoding:  "utf8",
    maxBuffer: 256 * 1024 * 1024
  });
  if (run.error) {
    throw new Error(`pwsh could not be run: ${run.error.message}`);
  }
  if (run.status !== 0) {
    throw new Error(`pwsh exited with ${run.status}:\n${run.stderr}`);
  }
  const printed = JSON.parse(run.stdout) as { version: string; files: Record<string, PowerShellFileFacts> };
  return { tool: `pwsh ${printed.version}`, files: printed.files };
}

/** Every reference of a file that resolves to a file of the fixture, with the text that makes it. */
function referencesOf(facts: PowerShellFileFacts): Array<{ to: string; evidence: string }> {
  if (isDataFileFacts(facts)) {
    return facts.references.flatMap((reference) => (reference.resolved ? [{ to: reference.resolved, evidence: `${reference.key} = '${reference.value}'` }] : []));
  }
  return [
    ...facts.dotSources.flatMap((dotSource) => (dotSource.resolved ? [{ to: dotSource.resolved, evidence: dotSource.text }] : [])),
    ...facts.importModules.flatMap((command) => command.names.flatMap((name) => (name.resolved ? [{ to: name.resolved, evidence: command.text }] : []))),
    ...facts.usingStatements.flatMap((using) => (using.resolved ? [{ to: using.resolved, evidence: using.text }] : [])),
    ...facts.requiredModules.flatMap((module) => (module.resolved ? [{ to: module.resolved, evidence: `#requires -Modules ${module.name}` }] : []))
  ];
}

/**
 * The file-to-file edges of the parser's record, each carried by the text
 * that makes it, in place of the symbols a compiler's index would give. A
 * file that names itself makes no edge.
 */
export function edgesFromPowerShellAst(ast: PowerShellAst, projects: OracleProject[]): OracleEdges {
  const documents = Object.keys(ast.files).sort();
  const edges     = new Map<string, OracleEdge>();
  for (const from of documents) {
    for (const { to, evidence } of referencesOf(ast.files[from])) {
      if (to === from) continue;
      const key  = `${from}|${to}`;
      const edge = edges.get(key) ?? { from, to, symbols: [] };
      if (!edge.symbols.includes(evidence)) edge.symbols.push(evidence);
      edges.set(key, edge);
    }
  }
  return {
    tool:      ast.tool,
    projects,
    documents,
    outside:   [],
    edges:     Array.from(edges.values()).sort((left, right) => left.from.localeCompare(right.from) || left.to.localeCompare(right.to)),
    ambiguous: []
  };
}

/** Moves every location of the record, the files' keys and every resolved path, from one directory's coordinates to another's. */
export function rebasePowerShellAst(ast: PowerShellAst, move: (value: string) => string): PowerShellAst {
  const resolved = (value: string | null): string | null => (value === null ? null : move(value));
  const files: Record<string, PowerShellFileFacts> = {};
  for (const [file, facts] of Object.entries(ast.files)) {
    files[move(file)] = isDataFileFacts(facts)
      ? { ...facts, references: facts.references.map((reference) => ({ ...reference, resolved: resolved(reference.resolved) })) }
      : {
          ...facts,
          dotSources:      facts.dotSources.map((dotSource) => ({ ...dotSource, resolved: resolved(dotSource.resolved) })),
          importModules:   facts.importModules.map((command) => ({ ...command, names: command.names.map((name) => ({ ...name, resolved: resolved(name.resolved) })) })),
          usingStatements: facts.usingStatements.map((using) => ({ ...using, resolved: resolved(using.resolved) })),
          requiredModules: facts.requiredModules.map((module) => ({ ...module, resolved: resolved(module.resolved) }))
        };
  }
  return { ...ast, files };
}
