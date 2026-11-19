/**
 * What PowerShell's parser says, read under the rules the PowerShell adapter
 * keeps: which files each file loads, which file each call reaches, which
 * scripts are libraries rather than programs, and which functions a module
 * manifest offers from which file.
 *
 * The parser supplies every fact (`powershell-ast.ps1`): the functions each
 * file defines and where, the commands it calls, what it dot-sources, imports
 * and runs, with the files PowerShell itself would find, and the statements at
 * its own level. The rules are the design measured on 2026-11-19 against a
 * reading of sampled wires; they are written here again, over the parser's
 * record, and share no code with the adapter, which reads the same facts
 * from its grammar.
 */
import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "@live-documentation/engine/config/liveDocumentationConfig";
import { SHIPPED_COMMANDS } from "@live-documentation/engine/live-docs/adapters/powershell.builtins";
import { resolveArchetype } from "@live-documentation/engine/live-docs/archetype";

import { isDataFileFacts, type PowerShellAst, type PowerShellDataFileFacts, type PowerShellScriptFacts } from "./powershell-edges";

/** A load of one file by another, by kind: what a manifest names loads with the manifest's module. */
export interface ParserLoad {
  kind: "dot" | "import" | "run" | "manifest";
  to:   string;
}

/** Keys of which one makes a `.psd1`'s table a module manifest's. */
const MANIFEST_KEYS = ["rootmodule", "moduletoprocess", "moduleversion", "functionstoexport"];

/** Commands that only set up a scope, which a library may hold at its own level. */
const SCOPE_SETUP = new Set([
  "set-strictmode", "export-modulemember", "set-alias", "new-alias", "import-module", "ipmo", "add-type", "update-typedata", "update-formatdata",
  "register-argumentcompleter"
]);

/** Whether a file is a test, by the archetype the product's naming conventions give it, without a workspace's configuration. */
export function isTestFile(file: string): boolean {
  return resolveArchetype(file, DEFAULT_LIVE_DOCUMENTATION_CONFIG) === "test";
}

/** A function's name as callers write it: without a scope prefix, case-folded. */
export function callName(name: string): string {
  return name.replace(/^(?:script|global|local|private):/i, "").toLowerCase();
}

/** The keys of a data file's table, case-folded. */
function tableKeys(facts: PowerShellDataFileFacts): string[] {
  return facts.data && typeof facts.data === "object" && !Array.isArray(facts.data) ? Object.keys(facts.data).map((key) => key.toLowerCase()) : [];
}

/** Whether a `.psd1` is a module manifest, by its table as `Import-PowerShellDataFile` read it. */
export function isManifest(facts: PowerShellDataFileFacts): boolean {
  return tableKeys(facts).some((key) => MANIFEST_KEYS.includes(key));
}

/** Every load the parser's record names a file for: dot-sources, module imports, `using module`, `#requires`, loops' listings, scripts run by path, a manifest's entries. */
export function parserLoads(file: string, facts: PowerShellAst["files"][string]): ParserLoad[] {
  const loads: ParserLoad[] = [];
  const add = (kind: ParserLoad["kind"], to: string | null): void => {
    if (to && to !== file) loads.push({ kind, to });
  };
  if (isDataFileFacts(facts)) {
    if (isManifest(facts)) for (const reference of facts.references) add("manifest", reference.resolved);
    return loads;
  }
  for (const command of facts.importModules) for (const name of command.names) add("import", name.resolved);
  for (const using of facts.usingStatements) if (using.kind === "Module") add("import", using.resolved);
  for (const module of facts.requiredModules) add("import", module.resolved);
  for (const dotSource of facts.dotSources) add("dot", dotSource.resolved);
  for (const load of facts.loads) for (const to of load.resolved) add(load.kind, to);
  return loads;
}

/** The names a script's commands call: names written out, not paths, not module-qualified, without a scope prefix, case-folded. */
export function parserCalls(facts: PowerShellScriptFacts): string[] {
  const names = new Set<string>();
  for (const invocation of facts.invocations) {
    const name = invocation.name;
    if (!name || /[\\/]|\.(?:ps1|psm1|psd1|exe|cmd|bat)$/i.test(name)) continue;
    names.add(callName(name));
  }
  return Array.from(names);
}

/**
 * Whether a script's own level only defines functions, filters, workflows
 * and classes, and otherwise only sets up its scope: dot-sources, scope-setting
 * commands and assignments that call nothing. Such a script does nothing when
 * run; it is there to be dot-sourced.
 */
export function isLibraryByParser(facts: PowerShellScriptFacts): boolean {
  let defines = false;
  for (const statement of facts.statements) {
    if (statement.kind === "function" || statement.kind === "type") {
      defines = true;
      continue;
    }
    if (statement.kind === "dotSource") continue;
    if (statement.kind === "command" && statement.command && SCOPE_SETUP.has(statement.command.toLowerCase())) continue;
    if (statement.kind === "assignment" && !statement.invokes) continue;
    return false;
  }
  return defines;
}

/** The workspace the parser's record describes, with what loading reaches worked out once. */
export class ParserWorkspace {
  private readonly loads   = new Map<string, ParserLoad[]>();
  private readonly members = new Map<string, Set<string>>();
  private readonly reach   = new Map<string, Set<string>>();
  private modules?: Map<string, string[]>;
  /** By call name: each file that defines the function at its own level, with the name as written there. */
  readonly definers = new Map<string, Array<{ file: string; name: string }>>();

  constructor(readonly ast: PowerShellAst) {
    for (const [file, facts] of Object.entries(ast.files)) {
      this.loads.set(file, parserLoads(file, facts));
      if (isDataFileFacts(facts)) continue;
      const seen = new Set<string>();
      for (const fn of facts.functions) {
        const name = callName(fn.name);
        if (fn.member || !fn.fileScope || seen.has(name)) continue;
        seen.add(name);
        this.definers.set(name, [...(this.definers.get(name) ?? []), { file, name: fn.name }]);
      }
    }
  }

  private isRoot(file: string): boolean {
    const facts = this.ast.files[file];
    return facts !== undefined && (isDataFileFacts(facts) ? isManifest(facts) : /\.psm1$/i.test(file));
  }

  /** A module's files: its root, what a manifest root names, and what they dot-source, followed. */
  membersOf(root: string): Set<string> {
    let members = this.members.get(root);
    if (!members) {
      members = new Set([root]);
      const pending = [root];
      while (pending.length > 0) {
        const at = pending.pop()!;
        for (const load of this.loads.get(at) ?? []) {
          if ((load.kind === "dot" || (load.kind === "manifest" && at === root)) && !members.has(load.to)) {
            members.add(load.to);
            pending.push(load.to);
          }
        }
      }
      this.members.set(root, members);
    }
    return members;
  }

  private modulesOf(file: string): string[] {
    if (!this.modules) {
      this.modules = new Map();
      for (const root of Object.keys(this.ast.files).filter((candidate) => this.isRoot(candidate))) {
        for (const member of this.membersOf(root)) this.modules.set(member, [...(this.modules.get(member) ?? []), root]);
      }
    }
    return this.modules.get(file) ?? [];
  }

  private reached(key: string, start: Iterable<string>): Set<string> {
    let reached = this.reach.get(key);
    if (!reached) {
      reached = new Set(start);
      const pending = Array.from(reached);
      while (pending.length > 0) {
        const at = pending.pop()!;
        for (const load of this.loads.get(at) ?? []) {
          if (load.kind === "run") continue;
          for (const to of load.kind === "import" && this.isRoot(load.to) ? this.membersOf(load.to) : [load.to]) {
            if (!reached.has(to)) {
              reached.add(to);
              pending.push(to);
            }
          }
        }
      }
      this.reach.set(key, reached);
    }
    return reached;
  }

  /** Whether a file's loading, or its modules' loading, reaches another file. */
  loadsFile(file: string, other: string): boolean {
    return this.reached(`file|${file}`, [file]).has(other) || this.modulesOf(file).some((root) => this.reached(`module|${root}`, this.membersOf(root)).has(other));
  }

  /**
   * The files a script's calls reach, each with the functions called, under
   * "loaded, else unique": a name the script defines itself is its own; else
   * the one defining file its loading reaches; if several, none; if none, the
   * only file that defines the name, unless PowerShell itself ships a command
   * of that name; and from a script that is not a test, that last reach
   * passes over every test file.
   */
  wiresOf(file: string): Map<string, Set<string>> {
    const facts = this.ast.files[file];
    const wires = new Map<string, Set<string>>();
    if (!facts || isDataFileFacts(facts)) return wires;
    const own = new Set(facts.functions.filter((fn) => !fn.member).map((fn) => callName(fn.name)));
    const test = isTestFile(file);
    for (const name of parserCalls(facts)) {
      if (own.has(name)) continue;
      const definers = (this.definers.get(name) ?? []).filter((definer) => definer.file !== file);
      if (definers.length === 0) continue;
      const loaded = definers.filter((definer) => this.loadsFile(file, definer.file));
      const reach  = test ? definers : definers.filter((definer) => !isTestFile(definer.file));
      const chosen = loaded.length === 1 ? loaded[0] : loaded.length === 0 && reach.length === 1 && !SHIPPED_COMMANDS.has(name) ? reach[0] : undefined;
      if (chosen) wires.set(chosen.file, new Set([...(wires.get(chosen.file) ?? []), chosen.name]));
    }
    return wires;
  }

  /** The functions a manifest's `FunctionsToExport` offers, each from the one file of its module that defines it at its own level. */
  offeredBy(file: string): Array<{ name: string; from: string }> {
    const facts = this.ast.files[file];
    if (!facts || !isDataFileFacts(facts) || !isManifest(facts) || !facts.data || typeof facts.data !== "object") return [];
    const entry   = Object.entries(facts.data as Record<string, unknown>).find(([key]) => key.toLowerCase() === "functionstoexport")?.[1];
    const names   = (Array.isArray(entry) ? entry : [entry]).filter((name): name is string => typeof name === "string" && name.length > 0 && !/[*?[]/.test(name));
    const members = this.membersOf(file);
    return names.flatMap((name) => {
      const origins = (this.definers.get(callName(name)) ?? []).filter((definer) => members.has(definer.file));
      return origins.length === 1 ? [{ name: origins[0].name, from: origins[0].file }] : [];
    });
  }
}
