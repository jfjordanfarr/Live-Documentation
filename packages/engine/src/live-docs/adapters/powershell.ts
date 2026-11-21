/**
 * PowerShell adapter: functions with their comment-based help, classes and
 * enums, what a module publishes, the files and modules a script or module
 * loads, and what a module manifest names, read with the engine's own build
 * of the tree-sitter PowerShell grammar (`grammars/powershell`).
 *
 * A file's symbols are the functions, filters and workflows it defines,
 * nested ones included, under the name as written (`script:Get-Thing` keeps
 * its scope), at the line and column of the keyword, and the classes and
 * enums it defines, at theirs. A class's constructors and methods are not
 * functions. A file that calls `Export-ModuleMember` publishes only the
 * functions its `-Function` patterns match, by PowerShell's wildcards and
 * without regard to case. One whose `Export-ModuleMember` the grammar could
 * not read in full, or names a pattern that is not written out (`-Function
 * $names`, a sub-expression), narrows nothing: a misreading shows private
 * functions rather than hiding public ones. Classes and enums are not
 * narrowed: a script reaches them through `using module`, which
 * `Export-ModuleMember` does not govern.
 *
 * Comment-based help is found where PowerShell looks for it: the comment
 * block immediately before the `function` keyword, with at most one blank
 * line between; then each comment block at the start of the body; then the
 * block before the closing brace. A block is help when every line outside a
 * section is blank and every section keyword is one PowerShell knows, and its
 * `.SYNOPSIS`, `.DESCRIPTION` and `.PARAMETER` sections become the summary,
 * remarks and parameters, each parameter under the spelling the function
 * declares. The other sections are read past.
 *
 * Dependencies are dot-sources, `Import-Module`'s module names, `using
 * module`, `#requires -Modules` and scripts run by their path, all imports. A
 * path is resolved to a file of the workspace when the text alone fixes it: a
 * string or a bare word written out, in which `$PSScriptRoot` stands for the
 * file's directory and against which a relative path is resolved, as if the
 * script ran from where it lies; a `Join-Path` of such; a variable the file
 * assigns once, at its own level, from such; or a loop that dot-sources each
 * file a `Get-ChildItem` of such a folder lists. A module path may name a
 * `.psm1`, a `.psd1`, or a directory holding the module of its name. Each name
 * in a path is found among the workspace's files as Windows finds it, without
 * regard to case. A module named rather than pathed, a path a string writes
 * with a variable no assignment fixes, and a path outside the workspace keep
 * their text as the specifier; a path built any other way is not read.
 *
 * A call to a function another file defines is a dependency on that file,
 * carrying the function's name, by the rule measured on 2026-11-19, "loaded,
 * else unique" ({@link calledFiles}): every PowerShell file of the workspace
 * is read once, for the functions it defines at its own level and what it
 * loads. A `.ps1` is the program's entry unless running it would do nothing,
 * its own level only defining things and setting up its scope; a module is
 * not.
 *
 * A `.psd1` whose table has a `RootModule` (or `ModuleToProcess`, its older
 * name), a `ModuleVersion` or a `FunctionsToExport` is a module manifest: the
 * module, named by the file's stem, is its one symbol; the modules and scripts
 * its root module, `NestedModules`, `ScriptsToProcess` and
 * `RequiredModules` name are its dependencies, each linked to the file it
 * names from the manifest's folder when the workspace holds it, and otherwise
 * kept by name, as `name@version` when a module specification writes a
 * `RequiredVersion` or a `ModuleVersion`; its root module is the file it
 * declares as a `module` entry; and each function its `FunctionsToExport`
 * names is offered from the one file of the module that defines it, as a
 * barrel re-exports. Any other `.psd1` is a data file, of which nothing is
 * read.
 *
 * A file's text is taken through the engine's one reading step
 * (`sourceText.ts`), the workspace's other PowerShell files' too. A
 * dot-source or import whose path the text does not fix, and no loop reads,
 * draws nothing and is said as a notice, as is a path built with `Join-Path`
 * or a variable that names no file of the workspace.
 *
 * The rules are measured against PowerShell's own parser, whose record of
 * each PowerShell fixture is `expected/powershell-ast.json`.
 */
import { createHash } from "node:crypto";
import path from "node:path";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "../../config/liveDocumentationConfig";
import { powershellSyntax } from "../../languages";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import { readSourceText, throwIfMachineFailure } from "../../tooling/sourceText";
import { resolveArchetype } from "../archetype";
import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult, SymbolDocumentation, SymbolDocumentationParameter } from "../core";
import type { DeclaredEntry, ReExportedSymbolInfo, SourceNotice } from "../coreTypes";
import type { LanguageAdapter, WorkspaceFileIndex } from "./index";
import { packageSymbols } from "./manifest";
import { SHIPPED_COMMANDS } from "./powershell.builtins";
import { readTree, type SyntaxNode } from "./treeSitter";

// ---------------------------------------------------------------------------
// Facts about one file
// ---------------------------------------------------------------------------

/** A comment outside any string, as PowerShell's tokenizer would give it. */
interface Comment {
  text:     string;
  start:    number;
  end:      number;
  startRow: number;
  endRow:   number;
}

/** A function as the file defines it, with the help PowerShell would find for it. */
interface FunctionFact {
  name:      string;
  line:      number;
  character: number;
  help?:     CommentHelp;
  /** The parameters it declares, in its header or its `param()` block, as spelled there. */
  declared:  string[];
  /** Whether it stands at the file's own level, inside no function and no script block, where whoever loads the file sees it. */
  fileScope: boolean;
}

/** A class or an enum as the file defines it. */
interface TypeFact {
  name:      string;
  kind:      "class" | "enum";
  line:      number;
  character: number;
}

/** A path or module name as written, `undefined` where the text is not a string written out. */
type Written = string | undefined;

/**
 * A folder a `Get-ChildItem` lists, as written, `$PSScriptRoot` standing for
 * the file's directory: a leaf may carry wildcards, and `-Filter`, `-Include`,
 * `-Exclude` and `-Recurse` narrow and widen it as written.
 */
interface Listing {
  path:     string;
  filter?:  string;
  include?: string[];
  exclude?: string[];
  recurse:  boolean;
}

/** A load whose path the text fixes only through `Join-Path` or a variable: drawn when it names a workspace file, and otherwise by its text as written, when there is one. */
interface ComputedLoad {
  kind:     "dot" | "import" | "run";
  path:     string;
  written?: string;
}

/** A variable other than `$PSScriptRoot` in a path as written, which only the file's own assignments can fix. */
const OTHER_VARIABLE = /\$(?!\{?PSScriptRoot\b)/i;

interface FileFacts {
  functions:     FunctionFact[];
  types:         TypeFact[];
  /** The `-Function` patterns of the file's `Export-ModuleMember` commands; undefined when it calls none, or one the grammar could not read in full or whose patterns are not all written out. */
  exports?:      string[];
  dotSources:    Written[];
  moduleImports: Written[];
  usingModules:  Written[];
  requires:      string[];
  /** Loads built with `Join-Path` or a variable, and scripts run by a path. */
  computed:      ComputedLoad[];
  /** Folders whose scripts a loop over `Get-ChildItem` dot-sources. */
  listings:      Listing[];
  /** Every command called by a name, case-folded, without a scope prefix. */
  calls:         string[];
  /** Whether the file's own level only defines things and sets up its scope, so that running it would do nothing. */
  library:       boolean;
  /** The dot-sources and imports whose path the text does not fix and no loop reads, each as `line N: <command>`, said as notices. */
  unfixed:       string[];
}

/** Whether a node lies inside a string; a comment found there is the grammar's misreading of the string's text, as a here-string's `#` lines are. */
function isInsideString(node: SyntaxNode): boolean {
  for (let current = node.parent; current; current = current.parent) {
    if (current.type.includes("string")) return true;
  }
  return false;
}

/** The statements of the tree the adapter reads, and its comments, in document order. */
interface Collected {
  functions: SyntaxNode[];
  types:     SyntaxNode[];
  commands:  SyntaxNode[];
  usings:    SyntaxNode[];
  comments:  Comment[];
}

function collect(root: SyntaxNode): Collected {
  const collected: Collected = { functions: [], types: [], commands: [], usings: [], comments: [] };
  const visit = (node: SyntaxNode): void => {
    switch (node.type) {
      case "function_statement":
        collected.functions.push(node);
        break;
      case "class_statement":
      case "enum_statement":
        collected.types.push(node);
        break;
      case "command":
        collected.commands.push(node);
        break;
      case "using_statement":
        collected.usings.push(node);
        return;
      case "comment":
        if (!isInsideString(node)) {
          // The grammar can end a line comment's node past the line's end; the token ends with its text.
          const text = node.text.replace(/\s+$/, "");
          collected.comments.push({ text, start: node.startIndex, end: node.startIndex + text.length, startRow: node.startPosition.row, endRow: node.startPosition.row + (text.match(/\n/g)?.length ?? 0) });
        }
        return;
      default:
        break;
    }
    for (const child of node.namedChildren) visit(child);
  };
  visit(root);
  return collected;
}

// ---------------------------------------------------------------------------
// Strings, values and arguments
// ---------------------------------------------------------------------------

/** The text a string literal holds, its quotes removed; a verbatim string's doubled quote is one. A variable in an expandable string is left as written. */
function stringValue(node: SyntaxNode): string {
  const literal = node.type === "string_literal" ? node.namedChildren[0] ?? node : node;
  const text    = literal.text;
  if (literal.type === "verbatim_string_characters") return text.slice(1, -1).replace(/''/g, "'");
  if (literal.type.includes("here_string")) return text.replace(/^@["'][^\n]*\n/, "").replace(/\r?\n["']@$/, "");
  return text.slice(1, -1);
}

/** What a backtick escape in an expandable string stands for; any other escaped character stands for itself. */
const ESCAPES: Record<string, string> = { "0": "\0", a: "\x07", b: "\b", e: "\x1b", f: "\f", n: "\n", r: "\r", t: "\t", v: "\v" };

/** The value of a string literal that holds no variable or sub-expression, its escapes read as PowerShell reads them; undefined for one that does. */
function constantString(node: SyntaxNode): string | undefined {
  const literal = node.namedChildren[0] ?? node;
  if (!literal.type.startsWith("expandable")) return stringValue(node);
  if (literal.namedChildren.some((child) => child.type === "variable" || child.type === "sub_expression")) return undefined;
  const text = literal.type === "expandable_string_literal" ? stringValue(node).replace(/""/g, "\"") : stringValue(node);
  return text.replace(/`(u\{[0-9a-fA-F]+\}|[\s\S])/g, (_, escaped: string) =>
    escaped.startsWith("u{") ? String.fromCodePoint(parseInt(escaped.slice(2, -1), 16)) : ESCAPES[escaped] ?? escaped);
}

/** A value written in the restricted language of a data file: a string, a list, or a table keyed without regard to case; undefined for anything a reading of the text cannot fix. */
type DataValue = string | DataValue[] | DataTable | undefined;
type DataTable = Map<string, DataValue>;

/** Expression nodes that hold one value and only pass it on. */
const PASS_THROUGH = new Set([
  "pipeline", "pipeline_chain", "logical_expression", "bitwise_expression", "comparison_expression", "additive_expression",
  "multiplicative_expression", "format_expression", "range_expression", "unary_expression", "parenthesized_expression"
]);

/** The value an expression writes out, as `Import-PowerShellDataFile` would read it. */
function dataValue(node: SyntaxNode): DataValue {
  const children = node.namedChildren.filter((child) => child.type !== "comment");
  switch (node.type) {
    case "string_literal":
      return constantString(node);
    case "integer_literal":
    case "real_literal":
      return node.text;
    case "array_literal_expression":
      return children.length === 1 ? dataValue(children[0]) : children.map(dataValue);
    case "array_expression":
      // `@()` gathers what each of its statements writes, a list's items one by one.
      return statementsOf(node.childForFieldName("statements")).flatMap((statement) => {
        const value = dataValue(statement);
        return Array.isArray(value) ? value : [value];
      });
    case "hash_literal_expression":
      return dataTable(node);
    default:
      return PASS_THROUGH.has(node.type) && children.length === 1 ? dataValue(children[0]) : undefined;
  }
}

/** The statements of a statement list, without its comments and empty statements. */
function statementsOf(list: SyntaxNode | null): SyntaxNode[] {
  return (list?.namedChildren ?? []).filter((child) => child.type !== "comment" && child.type !== "empty_statement");
}

/** A hashtable's entries, each key lower-cased, as PowerShell's hashtables compare keys without regard to case. */
function dataTable(node: SyntaxNode): DataTable {
  const table: DataTable = new Map();
  const body  = node.namedChildren.find((child) => child.type === "hash_literal_body");
  for (const entry of body?.namedChildren.filter((child) => child.type === "hash_entry") ?? []) {
    const [keyNode, valueNode] = entry.namedChildren.filter((child) => child.type !== "comment");
    const keyExpression = keyNode?.namedChildren[0];
    const key = keyExpression?.type === "simple_name" ? keyExpression.text : keyExpression ? dataValue(keyExpression) : undefined;
    if (typeof key === "string" && valueNode) table.set(key.toLowerCase(), dataValue(valueNode));
  }
  return table;
}

/**
 * The strings an argument holds, element by element, flattening a comma
 * list; an element that is not a string written out, such as a variable or a
 * sub-expression, is undefined. A bare word is its text, a variable at its
 * start included (`$PSScriptRoot\x.psm1`).
 */
function argumentStrings(node: SyntaxNode): Written[] {
  switch (node.type) {
    case "generic_token":
      return [node.text];
    case "string_literal":
      return [stringValue(node)];
    case "command_argument_list":
    case "array_literal_expression":
    case "unary_expression":
      return node.namedChildren.flatMap(argumentStrings);
    case "expression_with_unary_operator":
      return node.children[0]?.type === "," ? node.namedChildren.flatMap(argumentStrings) : [undefined];
    default:
      return [undefined];
  }
}

/** A parameter of a cmdlet, as `Get-Command` reports it. */
interface CmdletParameter {
  name:    string;
  aliases: string[];
  switch:  boolean;
}

/** The parameters of a cmdlet, and the names its positional arguments bind to, in order. */
interface CmdletSignature {
  positional: string[];
  parameters: CmdletParameter[];
}

const value = (name: string, ...aliases: string[]): CmdletParameter => ({ name, aliases, switch: false });
const flag  = (name: string, ...aliases: string[]): CmdletParameter => ({ name, aliases, switch: true });

/** The common parameters every cmdlet takes. */
const COMMON_PARAMETERS = [
  flag("Debug", "db"), value("ErrorAction", "ea"), value("ErrorVariable", "ev"), value("InformationAction", "infa"),
  value("InformationVariable", "iv"), value("OutBuffer", "ob"), value("OutVariable", "ov"), value("PipelineVariable", "pv"),
  value("ProgressAction", "proga"), flag("Verbose", "vb"), value("WarningAction", "wa"), value("WarningVariable", "wv")
];

/** `Import-Module` as PowerShell 7.5 declares it: a module is named by `-Name` or the first positional argument. */
const IMPORT_MODULE: CmdletSignature = {
  positional: ["Name"],
  parameters: [
    ...COMMON_PARAMETERS,
    value("Alias"), value("ArgumentList", "Args"), flag("AsCustomObject"), value("Assembly"), value("CimNamespace"), value("CimResourceUri"),
    value("CimSession"), value("Cmdlet"), flag("DisableNameChecking"), flag("Force"), value("FullyQualifiedName"), value("Function"), flag("Global"),
    value("MaximumVersion"), value("MinimumVersion", "Version"), value("ModuleInfo"), value("Name"), flag("NoClobber", "NoOverwrite"), flag("PassThru"),
    value("Prefix"), value("PSSession"), value("RequiredVersion"), value("Scope"), flag("SkipEditionCheck"), flag("UseWindowsPowerShell", "UseWinPS"),
    value("Variable")
  ]
};

/** `Export-ModuleMember` as PowerShell 7.5 declares it: functions are named by `-Function` or the first positional argument. */
const EXPORT_MODULE_MEMBER: CmdletSignature = {
  positional: ["Function"],
  parameters: [...COMMON_PARAMETERS, value("Alias"), value("Cmdlet"), value("Function"), value("Variable")]
};

/** The parameter a `-Name` token names: its name or an alias exactly, or a prefix of one name only, as PowerShell abbreviates. */
function resolveParameter(signature: CmdletSignature, token: string): CmdletParameter | undefined {
  const written = token.replace(/^-+/, "").replace(/:$/, "").toLowerCase();
  const exact   = signature.parameters.find((parameter) => parameter.name.toLowerCase() === written || parameter.aliases.some((alias) => alias.toLowerCase() === written));
  if (exact) return exact;
  const prefixed = signature.parameters.filter((parameter) => parameter.name.toLowerCase().startsWith(written));
  return prefixed.length === 1 ? prefixed[0] : undefined;
}

/** Node types among a command's elements that are not arguments. */
const NOT_ARGUMENTS = new Set(["command_argument_sep", "command_parameter", "redirection", "stop_parsing", "comment", "ERROR"]);

/**
 * The strings bound to each parameter of a command, as PowerShell's binder
 * would bind them: an argument after a parameter that takes a value, or
 * joined to one by a colon, is that parameter's; the other arguments fill, in
 * order, the positional parameters no argument names. A parameter the
 * signature does not know takes nothing.
 */
function bindArguments(command: SyntaxNode, signature: CmdletSignature): Map<string, Written[]> {
  return new Map(Array.from(bindNodes(command, signature), ([name, nodes]) => [name, nodes.flatMap(argumentStrings)]));
}

/** The argument nodes bound to each parameter of a command, by the binding {@link bindArguments} describes; a switch bound without a value has none. */
function bindNodes(command: SyntaxNode, signature: CmdletSignature): Map<string, SyntaxNode[]> {
  const bound   = new Map<string, SyntaxNode[]>();
  const bind    = (name: string, node: SyntaxNode): void => {
    bound.set(name, [...(bound.get(name) ?? []), node]);
  };
  const elements = command.childForFieldName("command_elements")?.children ?? [];
  const unnamed: SyntaxNode[] = [];
  let pending: CmdletParameter | undefined;
  for (let index = 0; index < elements.length; index += 1) {
    const element = elements[index];
    if (element.type === "command_parameter") {
      const parameter = resolveParameter(signature, element.text);
      const colon     = elements[index + 1]?.type === "command_argument_sep" && elements[index + 1].text === ":";
      pending = parameter && (colon || !parameter.switch) ? parameter : undefined;
      if (parameter?.switch && !colon && !bound.has(parameter.name)) bound.set(parameter.name, []);
      continue;
    }
    if (!element.isNamed || NOT_ARGUMENTS.has(element.type)) continue;
    if (pending) {
      bind(pending.name, element);
      pending = undefined;
    } else {
      unnamed.push(element);
    }
  }
  // Named arguments bind first; the rest take the positions left, as PowerShell's binder gives them.
  const named = new Set(bound.keys());
  const open  = signature.positional.filter((name) => !named.has(name));
  unnamed.forEach((element, position) => {
    if (open[position]) bind(open[position], element);
  });
  return bound;
}

/** The command a command node calls, lower-cased, without the module qualifier PowerShell's core cmdlets may carry. */
function commandName(command: SyntaxNode): string | undefined {
  const name = command.childForFieldName("command_name");
  if (name?.type !== "command_name") return undefined;
  return name.text.toLowerCase().replace(/^microsoft\.powershell\.core\\/, "");
}

/** Whether the grammar read the whole command: no error inside it, and none enclosing it. */
function readInFull(node: SyntaxNode): boolean {
  if (node.hasError) return false;
  for (let current = node.parent; current; current = current.parent) {
    if (current.type === "ERROR") return false;
  }
  return true;
}

/** The target of a dot-source: a string, a bare path, or a path that begins with a variable, as written. */
function dotSourceTarget(command: SyntaxNode): Written {
  const name   = command.childForFieldName("command_name");
  const target = name?.type === "command_name_expr" ? name.namedChildren[0] : name;
  switch (target?.type) {
    case "string_literal":
      return stringValue(target);
    case "command_name":
      return target.text;
    case "path_command_name":
      // `$file.FullName` is a property of a variable, not a path; only a run can read it, unless a loop says what the variable holds.
      return isMemberOfVariable(target) ? undefined : target.text;
    default:
      return undefined;
  }
}

/** Whether a dot-source runs a script block in the caller's scope, `. { … }`, which loads no file. */
function dotSourcesBlock(command: SyntaxNode): boolean {
  const name = command.childForFieldName("command_name");
  const target = name?.type === "command_name_expr" ? name.namedChildren[0] : name;
  return target !== undefined && target !== null && unwrapValue(target).type === "script_block_expression";
}

/** A command's text as a notice names it: its first line, its spaces folded, at most 80 characters. */
function briefly(text: string): string {
  const line = (text.split(/\r\n|\r|\n/u)[0] ?? "").replace(/\s+/gu, " ").trim();
  return line.length > 80 ? `${line.slice(0, 79)}…` : line;
}

/** Whether a path-like command name is a variable's property, `$file.FullName`, rather than a path that begins with a variable. */
function isMemberOfVariable(node: SyntaxNode): boolean {
  const [first, second] = node.namedChildren;
  return first?.type === "variable" && second !== undefined && /^\.\w+$/.test(second.text);
}

// ---------------------------------------------------------------------------
// Paths the text fixes: Join-Path, variables, folder listings
// ---------------------------------------------------------------------------

/** `Join-Path` as Windows PowerShell 5.1 and PowerShell 7 declare it: a parent, a child, and in 7 any further children, each positional in turn. */
const JOIN_PATH: CmdletSignature = {
  positional: ["Path", "ChildPath", ...Array.from({ length: 8 }, () => "AdditionalChildPath")],
  parameters: [...COMMON_PARAMETERS, value("Path", "PSPath"), value("ChildPath"), value("AdditionalChildPath"), flag("Resolve"), value("Credential")]
};

/** `Get-ChildItem` as both editions declare it: a path, then a filter, positionally. */
const GET_CHILD_ITEM: CmdletSignature = {
  positional: ["Path", "Filter"],
  parameters: [
    ...COMMON_PARAMETERS,
    value("Path"), value("LiteralPath", "PSPath", "LP"), value("Filter"), value("Include"), value("Exclude"), flag("Recurse", "s"), value("Depth"),
    flag("Force"), flag("Name"), value("Attributes", "af", "ad", "ah", "ap", "as"), flag("Directory", "dir"), flag("File"), flag("Hidden", "h"),
    flag("ReadOnly", "ar"), flag("System", "as"), flag("FollowSymlink")
  ]
};

/** The names `Get-ChildItem` answers to in Windows PowerShell 5.1, where scripts are written, and PowerShell 7. */
const GET_CHILD_ITEM_NAMES = new Set(["get-childitem", "microsoft.powershell.management\\get-childitem", "gci", "dir", "ls"]);

/** The names `ForEach-Object` answers to. */
const FOREACH_OBJECT_NAMES = new Set(["foreach-object", "microsoft.powershell.core\\foreach-object", "%", "foreach"]);

/** Node types that hold one value and only pass it on, from a pipeline down to the expression inside it. */
const VALUE_WRAPPERS = new Set([...PASS_THROUGH, "pipeline", "pipeline_chain", "array_literal_expression", "command_name_expr"]);

/**
 * What attributes stand before (`[SuppressMessageAttribute(...)]` then `$x`), as PowerShell's
 * AttributedExpressionAst holds it: such an attribute changes nothing assigned. A type constraint
 * (`[int]$x`) is a cast, which converts, and is left as it is.
 */
function attributedTarget(node: SyntaxNode): SyntaxNode {
  let current = node;
  for (;;) {
    const [only] = current.type === "expression_with_unary_operator" ? current.namedChildren : [current];
    if (only?.type !== "attributed_expression") return current;
    current = unwrapValue(only.namedChildren[only.namedChildren.length - 1]);
  }
}

/** The one node a chain of wrappers holds. */
function unwrapValue(node: SyntaxNode): SyntaxNode {
  let current = node;
  for (;;) {
    if (!VALUE_WRAPPERS.has(current.type)) return current;
    const children = current.namedChildren.filter((child) => child.type !== "comment");
    if (children.length !== 1) return current;
    current = children[0];
  }
}

/** A variable's name as PowerShell compares it: case-folded, without `$`, braces or a scope prefix. */
function variableName(text: string): string {
  return text.replace(/^[$@]\{?|\}$/g, "").replace(/^(?:script|global|local|private):/i, "").toLowerCase();
}

/**
 * Whether a node stands inside a function or a script block, which run in
 * scopes of their own, or inside text the grammar could not read, where it
 * cannot tell which: a test's stubs inside a block the grammar lost would
 * otherwise stand at the file's own level and draw every call of their names.
 */
function inNestedScope(node: SyntaxNode): boolean {
  for (let current = node.parent; current; current = current.parent) {
    if (current.type === "function_statement" || current.type === "script_block_expression" || current.type === "ERROR") return true;
  }
  return false;
}

/** A variable's one assignment: the value, the function or script block it stands in (none at the file's own level), and where it starts. */
interface Assignment {
  value:     SyntaxNode;
  container: SyntaxNode | null;
  start:     number;
}

/** The nearest function or script block a node stands in, which holds its scope; null at the file's own level. */
function scopeOf(node: SyntaxNode): SyntaxNode | null {
  for (let current = node.parent; current; current = current.parent) {
    if (current.type === "function_statement" || current.type === "script_block_expression") return current;
  }
  return null;
}

/**
 * The variables a file assigns exactly once, by a plain `=`, outside text the
 * grammar could not read: what each holds is fixed by the text wherever its
 * scope reaches after the assignment ({@link variablePath}). A variable
 * assigned anywhere else as well holds only what a run decides.
 */
function fileVariables(root: SyntaxNode): Map<string, Assignment> {
  const assignments = new Map<string, SyntaxNode[]>();
  const visit = (node: SyntaxNode): void => {
    if (node.type === "assignment_expression") {
      const left = node.namedChildren.find((child) => child.type === "left_assignment_expression");
      const target = left ? attributedTarget(unwrapValue(left.namedChildren[0] ?? left)) : undefined;
      if (target?.type === "variable") {
        const name = variableName(target.text);
        assignments.set(name, [...(assignments.get(name) ?? []), node]);
      }
    }
    for (const child of node.namedChildren) visit(child);
  };
  visit(root);
  const fixed = new Map<string, Assignment>();
  for (const [name, nodes] of assignments) {
    const [only] = nodes;
    const operator = only.namedChildren.find((child) => child.type === "assignement_operator")?.text;
    const value = only.childForFieldName("value");
    const unread = (() => {
      for (let current = only.parent; current; current = current.parent) if (current.type === "ERROR") return true;
      return false;
    })();
    if (nodes.length === 1 && operator === "=" && value && !unread) fixed.set(name, { value, container: scopeOf(only), start: only.startIndex });
  }
  return fixed;
}

/** What the paths of one file are read against: its variables fixed by the text, a loop's item while its written-out list is read, and the variables being read, so that a cycle reads as nothing. */
interface PathScope {
  variables: Map<string, Assignment>;
  items:     Map<string, string>;
  reading:   Set<string>;
}

/**
 * Whether a variable's one assignment fixes it where a node stands: before it in the text, in the function or script
 * block that holds the node or one enclosing it, or in a Pester setup block whose It blocks hold it ({@link pesterSetupReaches}).
 */
function assignedFor(assigned: Assignment, at: SyntaxNode): boolean {
  if (assigned.start >= at.startIndex) return false;
  const container = assigned.container;
  if (container === null || (container.startIndex <= at.startIndex && at.endIndex <= container.endIndex)) return !pesterRunBlockBetween(container, at);
  return pesterSetupReaches(container, at);
}

/**
 * Whether an `It` or `BeforeAll` block stands between a node and the scope a variable was assigned in. A variable
 * assigned at the file's own level reaches both under Pester 3.4.0 and 4.10.1 and neither under 5.9.1, and one
 * assigned in a `Describe`'s body reaches an `It` under 3 and 4 only (measured on each): true under one version and
 * false under another, it is not read there.
 */
function pesterRunBlockBetween(container: SyntaxNode | null, at: SyntaxNode): boolean {
  for (let current = scopeOf(at); current && current.id !== container?.id; current = scopeOf(current)) {
    const command = current.type === "script_block_expression" ? blockCommand(current) : null;
    const name = command ? calledName(command) : undefined;
    if (name === "it" || name === "beforeall") return true;
  }
  return false;
}

/** The command a script block is written as an argument of, `BeforeAll { … }` for its block; null when it is no command's. */
function blockCommand(block: SyntaxNode): SyntaxNode | null {
  for (let current = block.parent; current; current = current.parent) {
    if (current.type === "command") return current;
    if (current.type !== "unary_expression" && current.type !== "array_literal_expression" && current.type !== "command_elements") return null;
  }
  return null;
}

/**
 * Pester's setup: a variable assigned in a `BeforeAll` or `BeforeEach` block reaches the `It` blocks of the
 * `Describe` or `Context` that holds that block. Pester 3.4.0, which Windows PowerShell 5.1 ships, 4.10.1 and
 * 5.9.1 all run it so (measured on each). A `Describe`'s or `Context`'s own body, or the file's own level, reaches
 * an `It` under Pester 3 and 4 but not under 5, which runs them only to discover the tests; so they are not read so.
 */
function pesterSetupReaches(setup: SyntaxNode, at: SyntaxNode): boolean {
  const setupCommand = setup.type === "script_block_expression" ? blockCommand(setup) : null;
  const setupName = setupCommand ? calledName(setupCommand) : undefined;
  if (!setupCommand || (setupName !== "beforeall" && setupName !== "beforeeach")) return false;
  const group = scopeOf(setupCommand);
  const groupCommand = group?.type === "script_block_expression" ? blockCommand(group) : null;
  const groupName = groupCommand ? calledName(groupCommand) : undefined;
  if (!group || (groupName !== "describe" && groupName !== "context")) return false;
  if (at.startIndex < group.startIndex || group.endIndex < at.endIndex) return false;
  for (let current = scopeOf(at); current && current.id !== group.id; current = scopeOf(current)) {
    const command = current.type === "script_block_expression" ? blockCommand(current) : null;
    if (command && calledName(command) === "it") return true;
  }
  return false;
}

/** A variable's value as a path where a node stands: `$PSScriptRoot` as written, a loop's item, another variable by its one assignment. */
function variablePath(text: string, scope: PathScope, at: SyntaxNode): string | undefined {
  const name = variableName(text);
  if (name === "psscriptroot") return "$PSScriptRoot";
  const item = scope.items.get(name);
  if (item !== undefined) return item;
  const assigned = scope.variables.get(name);
  if (!assigned || !assignedFor(assigned, at) || scope.reading.has(name)) return undefined;
  scope.reading.add(name);
  try {
    return pathValue(assigned.value, scope);
  } finally {
    scope.reading.delete(name);
  }
}

/** A string's text with each variable in it put in place, or undefined when one is not fixed or the string holds a sub-expression. */
function expandedString(node: SyntaxNode, scope: PathScope): string | undefined {
  const literal = node.namedChildren[0] ?? node;
  if (!literal.type.startsWith("expandable") || literal.namedChildren.length === 0) return constantString(node);
  if (literal.namedChildren.some((child) => child.type !== "variable")) return undefined;
  const text = node.text;
  const open = literal.type.includes("here_string") ? text.indexOf("\n") + 1 : 1;
  let result = "";
  let at = node.startIndex + open;
  for (const variable of literal.namedChildren) {
    const value = variablePath(variable.text, scope, variable);
    if (value === undefined) return undefined;
    result += text.slice(at - node.startIndex, variable.startIndex - node.startIndex) + value;
    at = variable.endIndex;
  }
  const close = literal.type.includes("here_string") ? text.lastIndexOf("\n") : text.length - 1;
  return result + text.slice(at - node.startIndex, close);
}

/** A bare word's text with the variables at its start or inside it put in place: `$PSScriptRoot\lib\x.psm1`. */
function expandedWord(text: string, scope: PathScope, at: SyntaxNode): string | undefined {
  let fixed = true;
  const result = text.replace(/\$\{[^}]+\}|\$(?:(?:script|global|local|private):)?\w+/gi, (variable) => {
    const value = variablePath(variable, scope, at);
    if (value === undefined) fixed = false;
    return value ?? "";
  });
  return fixed ? result : undefined;
}

/**
 * The path an expression writes when the text alone fixes it: a string or a
 * bare word whose variables are `$PSScriptRoot` or variables the file assigns
 * once at its own level, or a `Join-Path` of such. `$PSScriptRoot` stays as
 * written, to be read as the file's directory. Anything else, a sub-expression,
 * a property, another command, is known only to a run.
 */
function pathValue(node: SyntaxNode, scope: PathScope): string | undefined {
  const inner = unwrapValue(node);
  switch (inner.type) {
    case "string_literal":
      return expandedString(inner, scope);
    case "generic_token":
    case "command_name":
      return expandedWord(inner.text, scope, inner);
    case "path_command_name":
      return isMemberOfVariable(inner) ? undefined : expandedWord(inner.text, scope, inner);
    case "variable":
      return variablePath(inner.text, scope, inner);
    case "command": {
      if (inner.namedChildren.some((child) => child.type === "command_invokation_operator")) return undefined;
      if (commandName(inner) === "split-path" || commandName(inner) === "microsoft.powershell.management\\split-path") return splitPathValue(inner, scope);
      if (commandName(inner) !== "join-path" && commandName(inner) !== "microsoft.powershell.management\\join-path") return undefined;
      const bound = bindNodes(inner, JOIN_PATH);
      const parts = [...(bound.get("Path") ?? []), ...(bound.get("ChildPath") ?? []), ...(bound.get("AdditionalChildPath") ?? [])];
      if ((bound.get("Path") ?? []).length !== 1 || (bound.get("ChildPath") ?? []).length !== 1) return undefined;
      const values = parts.map((part) => pathValue(part, scope));
      return values.every((part): part is string => part !== undefined) ? values.join("/") : undefined;
    }
    default:
      return undefined;
  }
}

/** `Split-Path` as both editions declare it: a path, positionally, and the part of it to give. */
const SPLIT_PATH: CmdletSignature = {
  positional: ["Path"],
  parameters: [
    ...COMMON_PARAMETERS, value("Path"), value("LiteralPath", "PSPath", "LP"), flag("Parent"), flag("Leaf"), flag("LeafBase"), flag("Extension"),
    flag("Qualifier"), flag("NoQualifier"), flag("IsAbsolute"), flag("Resolve"), value("Credential")
  ]
};

/** The script's own path, which `Split-Path` turns into its folder: `$PSCommandPath`, `$MyInvocation.MyCommand.Path` or `.Definition`. */
const OWN_PATH = /^\$(?:PSCommandPath|MyInvocation\.MyCommand\.(?:Path|Definition))$/i;

/**
 * The folder `Split-Path` gives, when it gives a folder of a path the text
 * fixes: of the script's own path, `$PSScriptRoot`, as Windows PowerShell 5.1
 * scripts find their neighbours (`$here = Split-Path -Parent
 * $MyInvocation.MyCommand.Path`); of another fixed path, its parent.
 */
function splitPathValue(command: SyntaxNode, scope: PathScope): string | undefined {
  const bound = bindNodes(command, SPLIT_PATH);
  if (["Leaf", "LeafBase", "Extension", "Qualifier", "NoQualifier", "IsAbsolute"].some((part) => bound.has(part))) return undefined;
  const written = bound.get("Path") ?? bound.get("LiteralPath");
  if (written?.length !== 1) return undefined;
  if (OWN_PATH.test(unwrapValue(written[0]).text.trim())) return "$PSScriptRoot";
  const path = pathValue(written[0], scope);
  return path === undefined ? undefined : `${path}/..`;
}

/** The strings of an argument written out, each a constant; undefined when any is not. */
function constantStrings(nodes: SyntaxNode[] | undefined): string[] | undefined {
  if (!nodes) return undefined;
  const strings = nodes.flatMap(argumentStrings);
  return strings.every((item): item is string => item !== undefined) ? strings : undefined;
}

/** What a `Get-ChildItem` command lists, when the text fixes its folder and every narrowing; undefined otherwise. */
function listingOf(command: SyntaxNode, scope: PathScope): Listing | undefined {
  const bound   = bindNodes(command, GET_CHILD_ITEM);
  const written = bound.get("Path") ?? bound.get("LiteralPath");
  if (written?.length !== 1 || bound.has("Name") || bound.has("Directory")) return undefined;
  const folder = pathValue(written[0], scope);
  if (folder === undefined) return undefined;
  const listing: Listing = { path: folder, recurse: bound.has("Recurse") };
  for (const key of ["Filter", "Include", "Exclude"] as const) {
    if (!bound.has(key)) continue;
    const strings = constantStrings(bound.get(key));
    if (!strings) return undefined;
    if (key === "Filter") {
      if (strings.length !== 1) return undefined;
      listing.filter = strings[0];
    } else {
      listing[key === "Include" ? "include" : "exclude"] = strings;
    }
  }
  return listing;
}

/**
 * The folders a loop's collection lists: a `Get-ChildItem` written in place,
 * a variable the file assigns once from one, or several of these joined by
 * `+`, a comma or `@()`. Undefined when any part is something else.
 */
function listingsOf(node: SyntaxNode, scope: PathScope): Listing[] | undefined {
  const inner = unwrapValue(node);
  const parts = (nodes: SyntaxNode[]): Listing[] | undefined => {
    const all: Listing[] = [];
    for (const part of nodes) {
      const listed = listingsOf(part, scope);
      if (!listed) return undefined;
      all.push(...listed);
    }
    return all;
  };
  switch (inner.type) {
    case "command": {
      if (inner.namedChildren.some((child) => child.type === "command_invokation_operator")) return undefined;
      const name = commandName(inner);
      if (!name || !GET_CHILD_ITEM_NAMES.has(name)) return undefined;
      const listing = listingOf(inner, scope);
      return listing ? [listing] : undefined;
    }
    case "variable": {
      const name = variableName(inner.text);
      const assigned = scope.variables.get(name);
      if (!assigned || !assignedFor(assigned, inner) || scope.reading.has(name)) return undefined;
      scope.reading.add(name);
      try {
        return listingsOf(assigned.value, scope);
      } finally {
        scope.reading.delete(name);
      }
    }
    case "array_expression":
      return parts(statementsOf(inner.childForFieldName("statements")));
    case "additive_expression":
      return inner.children.every((child) => child.isNamed || child.text === "+") ? parts(inner.namedChildren.filter((child) => child.type !== "comment")) : undefined;
    case "array_literal_expression":
      return parts(inner.namedChildren.filter((child) => child.type !== "comment"));
    default:
      return undefined;
  }
}

/** Whether a dot-source's target is the loop's item, `$item` or its `FullName`, so that it dot-sources each file the loop lists. */
function targetsItem(command: SyntaxNode, item: string): boolean {
  const name   = command.childForFieldName("command_name");
  const target = name?.type === "command_name_expr" ? unwrapValue(name) : name;
  if (target?.type === "variable") return variableName(target.text) === item;
  if (target?.type !== "path_command_name") return false;
  const [first, second, ...rest] = target.namedChildren;
  return first?.type === "variable" && variableName(first.text) === item && rest.length === 0 && /^\.FullName$/i.test(second?.text ?? "");
}

/** Whether a command is a dot-source: `. path`. */
function isDotSource(command: SyntaxNode): boolean {
  return command.namedChildren.some((child) => child.type === "command_invokation_operator" && child.text === ".");
}

/** The dot-sources inside a node that dot-source a loop's item. */
function itemDotSources(node: SyntaxNode, item: string): SyntaxNode[] {
  const found: SyntaxNode[] = [];
  const visit = (current: SyntaxNode): void => {
    if (current.type === "command" && isDotSource(current) && targetsItem(current, item)) found.push(current);
    for (const child of current.namedChildren) visit(child);
  };
  visit(node);
  return found;
}

/**
 * The folders whose scripts a file dot-sources in a loop: `foreach ($f in
 * <listing>) { . $f.FullName }`, or `<listing> | ForEach-Object { . $_.FullName }`,
 * where the listing is one {@link listingsOf} reads.
 */
function loopListings(root: SyntaxNode, scope: PathScope, looped: Set<number>): Listing[] {
  const listings: Listing[] = [];
  const read = (found: Listing[] | undefined, dotSources: SyntaxNode[]): void => {
    if (found === undefined) return;
    listings.push(...found);
    for (const command of dotSources) looped.add(command.startIndex);
  };
  const visit = (node: SyntaxNode): void => {
    if (node.type === "foreach_statement") {
      const item       = node.namedChildren.find((child) => child.type === "variable");
      const collection = node.namedChildren.find((child) => child.type === "pipeline");
      const body       = node.namedChildren.find((child) => child.type === "statement_block");
      const dotSources = item && body ? itemDotSources(body, variableName(item.text)) : [];
      if (collection && dotSources.length > 0) read(listingsOf(collection, scope), dotSources);
    }
    if (node.type === "pipeline_chain") {
      const stages = node.namedChildren.filter((child) => child.type === "command");
      stages.forEach((stage, index) => {
        const name = commandName(stage);
        if (index === 0 || !name || !FOREACH_OBJECT_NAMES.has(name)) return;
        const blocks = (stage.childForFieldName("command_elements")?.namedChildren ?? []).map(unwrapValue).filter((child) => child.type === "script_block_expression");
        if (blocks.length !== 1) return;
        const dotSources = [...itemDotSources(blocks[0], "_"), ...itemDotSources(blocks[0], "psitem")];
        if (dotSources.length === 0) return;
        read(listingsOf(stages[index - 1], scope), dotSources);
      });
    }
    for (const child of node.namedChildren) visit(child);
  };
  visit(root);
  return listings;
}

/**
 * The names a loop's collection writes out: a string, a list of strings, an
 * `@()` of such, or a variable assigned one, where its assignment fixes it.
 * Undefined when any part is something else.
 */
function literalItems(node: SyntaxNode, scope: PathScope): string[] | undefined {
  const inner = unwrapValue(node);
  const parts = (nodes: SyntaxNode[]): string[] | undefined => {
    const all: string[] = [];
    for (const part of nodes) {
      const items = literalItems(part, scope);
      if (!items) return undefined;
      all.push(...items);
    }
    return all;
  };
  switch (inner.type) {
    case "string_literal": {
      const literal = inner.namedChildren[0] ?? inner;
      const value = literal.type.startsWith("expandable") && literal.namedChildren.length > 0 ? undefined : constantString(inner);
      return value === undefined ? undefined : [value];
    }
    case "array_literal_expression":
      return parts(inner.namedChildren.filter((child) => child.type !== "comment"));
    case "array_expression":
      return parts(statementsOf(inner.childForFieldName("statements")));
    case "variable": {
      const name = variableName(inner.text);
      const assigned = scope.variables.get(name);
      if (!assigned || !assignedFor(assigned, inner) || scope.reading.has(name)) return undefined;
      scope.reading.add(name);
      try {
        return literalItems(assigned.value, scope);
      } finally {
        scope.reading.delete(name);
      }
    }
    default:
      return undefined;
  }
}

/** The loads a command makes whose paths the text fixes: a dot-source, a module import by a path, or a script run by its path. */
function fixedLoads(command: SyntaxNode, scope: PathScope): ComputedLoad[] {
  if (isDotSource(command)) {
    const target = command.childForFieldName("command_name");
    const value  = target ? pathValue(target, scope) : undefined;
    return value === undefined ? [] : [{ kind: "dot", path: value }];
  }
  const run = runPath(command, scope);
  if (run !== undefined) return [{ kind: "run", path: run }];
  const name = commandName(command);
  if (name !== "import-module" && name !== "ipmo") return [];
  return (bindNodes(command, IMPORT_MODULE).get("Name") ?? []).flatMap((node): ComputedLoad[] => {
    const value = pathValue(node, scope);
    return value !== undefined && isModulePath(value) ? [{ kind: "import", path: value }] : [];
  });
}

/** Every command a node holds. */
function commandsIn(node: SyntaxNode): SyntaxNode[] {
  const found: SyntaxNode[] = [];
  const visit = (current: SyntaxNode): void => {
    if (current.type === "command") found.push(current);
    for (const child of current.namedChildren) visit(child);
  };
  visit(node);
  return found;
}

/**
 * The loads of a loop over names the text writes out, read once for each
 * name with the loop's item standing for it: `foreach ($s in @('a.ps1',
 * 'b.ps1')) { . (Join-Path $PSScriptRoot $s) }`, or `'a.ps1', 'b.ps1' |
 * ForEach-Object { . "$PSScriptRoot\$_" }`.
 */
function listLoads(root: SyntaxNode, scope: PathScope, looped: Set<number>): ComputedLoad[] {
  const loads: ComputedLoad[] = [];
  const readEach = (items: string[], names: string[], body: SyntaxNode): void => {
    for (const item of items) {
      for (const name of names) scope.items.set(name, item);
      for (const command of commandsIn(body)) {
        const fixed = fixedLoads(command, scope);
        if (fixed.length > 0) looped.add(command.startIndex);
        loads.push(...fixed);
      }
      for (const name of names) scope.items.delete(name);
    }
  };
  const visit = (node: SyntaxNode): void => {
    if (node.type === "foreach_statement") {
      const item       = node.namedChildren.find((child) => child.type === "variable");
      const collection = node.namedChildren.find((child) => child.type === "pipeline");
      const body       = node.namedChildren.find((child) => child.type === "statement_block");
      const items      = collection ? literalItems(collection, scope) : undefined;
      if (item && body && items) readEach(items, [variableName(item.text)], body);
    }
    if (node.type === "pipeline_chain") {
      const stages = node.namedChildren.filter((child) => child.type !== "comment");
      stages.forEach((stage, index) => {
        const name = stage.type === "command" ? commandName(stage) : undefined;
        if (index === 0 || !name || !FOREACH_OBJECT_NAMES.has(name)) return;
        const blocks = (stage.childForFieldName("command_elements")?.namedChildren ?? []).map(unwrapValue).filter((child) => child.type === "script_block_expression");
        const items  = stages[index - 1].type === "command" ? undefined : literalItems(stages[index - 1], scope);
        if (blocks.length === 1 && items) readEach(items, ["_", "psitem"], blocks[0]);
      });
    }
    for (const child of node.namedChildren) visit(child);
  };
  visit(root);
  return loads;
}

// ---------------------------------------------------------------------------
// Programs and libraries
// ---------------------------------------------------------------------------

/** Commands that only set up a scope: what they do is undone or unseen when a script that does nothing else ends. */
const SCOPE_SETUP = new Set([
  "set-strictmode", "export-modulemember", "set-alias", "new-alias", "import-module", "ipmo", "add-type", "update-typedata", "update-formatdata",
  "register-argumentcompleter"
]);

/** Whether a node calls anything: a command or a method. */
function callsAnything(node: SyntaxNode): boolean {
  if (node.type === "command" || node.type === "invokation_expression") return true;
  return node.namedChildren.some(callsAnything);
}

/**
 * Whether a script's own level only defines functions, filters, workflows,
 * classes and enums, and otherwise only sets up its scope: dot-sources,
 * module imports, {@link SCOPE_SETUP} commands and assignments that call
 * nothing. Run, such a script would do nothing, since what it defines ends
 * with its scope; it is there to be dot-sourced. It must define something.
 */
function isLibrary(root: SyntaxNode): boolean {
  // Text the grammar could not read may run anything, so a file holding some at its own level is a program.
  if (root.namedChildren.some((child) => child.type === "ERROR")) return false;
  const list = root.namedChildren.find((child) => child.type === "statement_list") ?? null;
  let defines = false;
  for (const statement of statementsOf(list)) {
    switch (statement.type) {
      case "function_statement":
      case "class_statement":
      case "enum_statement":
        defines = true;
        continue;
      case "using_statement":
        continue;
      case "pipeline": {
        const chain    = statement.namedChildren.length === 1 ? statement.namedChildren[0] : undefined;
        const commands = chain?.type === "pipeline_chain" ? chain.namedChildren.filter((child) => child.type !== "comment") : [];
        const only     = commands.length === 1 ? commands[0] : undefined;
        if (only?.type === "command" && (isDotSource(only) || SCOPE_SETUP.has(commandName(only) ?? ""))) continue;
        const assignment = chain?.type === "assignment_expression" ? chain : statement.namedChildren.find((child) => child.type === "assignment_expression");
        if (assignment && !callsAnything(assignment)) continue;
        return false;
      }
      default:
        return false;
    }
  }
  return defines;
}

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

/** A command's name as a call: a bare word, or a string after `&` or `.`, that is not a path; undefined for a path or a value only a run knows. */
function calledName(command: SyntaxNode): string | undefined {
  const name = command.childForFieldName("command_name");
  let written: string | undefined;
  if (name?.type === "command_name") written = name.text;
  else if (name?.type === "command_name_expr") {
    // After `&` or `.`: a string, or a bare word, `. Stop-Function`, which calls the function in the caller's scope.
    const inner = unwrapValue(name);
    if (inner.type === "string_literal") written = constantString(inner);
    else if (inner.type === "path_command_name" && inner.namedChildren.every((child) => child.type === "path_command_name_token")) written = inner.text;
  }
  if (!written || /[\\/]|\.(?:ps1|psm1|psd1|exe|cmd|bat)$/i.test(written)) return undefined;
  return written.replace(/^(?:script|global|local|private):/i, "").toLowerCase();
}

/** The path a command runs a script by, when its name is one: `& ./x.ps1`, `& "$PSScriptRoot\x.ps1"`, `& (Join-Path …)`, `scripts\x.ps1`. */
function runPath(command: SyntaxNode, scope: PathScope): string | undefined {
  if (isDotSource(command)) return undefined;
  const name = command.childForFieldName("command_name");
  if (!name) return undefined;
  const inner = unwrapValue(name);
  if (inner.type === "command_name" && !/[\\/]|\.ps1$/i.test(inner.text)) return undefined;
  const written = pathValue(name, scope);
  return written !== undefined && /[\\/]|\.ps1$/i.test(written) ? written : undefined;
}

/** The module a `using module` statement names: a name or path, or the `ModuleName` of a module specification; null for a `using namespace` or `using assembly`. */
function usingModuleName(statement: SyntaxNode): Written | null {
  if (!statement.children.some((child) => child.type === "module")) return null;
  const argument = statement.namedChildren.find((child) => child.type !== "comment");
  switch (argument?.type) {
    case "generic_token":
      return argument.text;
    case "string_literal":
      return stringValue(argument);
    case "hash_literal_expression": {
      const name = dataTable(argument).get("modulename");
      return typeof name === "string" ? name : undefined;
    }
    default:
      return undefined;
  }
}

// ---------------------------------------------------------------------------
// #requires
// ---------------------------------------------------------------------------

/** The parameters `#requires` takes, among which `-Modules` is found by the same abbreviation rule as a cmdlet's. */
const REQUIRES: CmdletSignature = {
  positional: [],
  parameters: [value("Assembly"), value("Modules"), value("PSEdition"), value("PSSnapin"), flag("RunAsAdministrator"), value("ShellId"), value("Version")]
};

/** The tokens of a `#requires` line: parameters, commas, quoted strings, hashtables and bare words. */
function requiresTokens(text: string): string[] {
  const tokens: string[] = [];
  let index = 0;
  while (index < text.length) {
    const char = text[index];
    if (/\s/.test(char)) {
      index += 1;
    } else if (char === ",") {
      tokens.push(",");
      index += 1;
    } else if (char === "'" || char === "\"") {
      const close = text.indexOf(char, index + 1);
      const end   = close === -1 ? text.length : close + 1;
      tokens.push(text.slice(index, end));
      index = end;
    } else if (text.startsWith("@{", index)) {
      let depth = 0;
      let end   = index;
      for (; end < text.length; end += 1) {
        if (text[end] === "{") depth += 1;
        if (text[end] === "}" && --depth === 0) break;
      }
      tokens.push(text.slice(index, end + 1));
      index = end + 1;
    } else {
      const match = /^[^\s,]+/.exec(text.slice(index))![0];
      tokens.push(match);
      index += match.length;
    }
  }
  return tokens;
}

/** The module a `#requires -Modules` item names: a bare or quoted name, or a hashtable's `ModuleName`. */
function requiredModuleName(item: string): string | undefined {
  if (item.startsWith("@{")) {
    const match = /(?:^@\{|[;\s])\s*['"]?ModuleName['"]?\s*=\s*(?:'([^']*)'|"([^"]*)"|([^;}\s]+))/i.exec(item);
    return match ? match[1] ?? match[2] ?? match[3] : undefined;
  }
  return /^(['"])(.*)\1$/.exec(item)?.[2] ?? item;
}

/** The modules a comment names when it is a `#requires` line, which PowerShell honours anywhere in a file. */
function requiredModules(comment: string): string[] {
  const match = /^#requires\s+(.*)$/is.exec(comment);
  if (!match) return [];
  const tokens  = requiresTokens(match[1]);
  const modules: string[] = [];
  for (let index = 0; index < tokens.length; index += 1) {
    if (!tokens[index].startsWith("-") || resolveParameter(REQUIRES, tokens[index])?.name !== "Modules") continue;
    for (index += 1; index < tokens.length && !tokens[index].startsWith("-"); index += 1) {
      if (tokens[index] === ",") continue;
      const name = requiredModuleName(tokens[index]);
      if (name) modules.push(name);
    }
    index -= 1;
  }
  return modules;
}

// ---------------------------------------------------------------------------
// Comment-based help
// ---------------------------------------------------------------------------

interface CommentHelp {
  synopsis?:    string;
  description?: string;
  /** Each `.PARAMETER` section under the name it gives, upper-cased as PowerShell keys it; the first of a repeated name wins. */
  parameters:   Map<string, string>;
}

/** A help keyword line: `.KEYWORD`, optionally followed by an argument. */
const KEYWORD_LINE = /^\s*\.(\w+)(\s+(\S.*))?\s*$/;

/** Keywords that stand alone and open a section of the lines that follow. */
const SECTION_KEYWORDS = new Set(["SYNOPSIS", "DESCRIPTION", "NOTES", "LINK", "EXAMPLE", "INPUTS", "OUTPUTS", "COMPONENT", "ROLE", "FUNCTIONALITY"]);

/** Keywords that take an argument on their own line. */
const ARGUMENT_KEYWORDS = new Set(["PARAMETER", "FORWARDHELPTARGETNAME", "FORWARDHELPCATEGORY", "REMOTEHELPRUNSPACE", "EXTERNALHELP"]);

const isBlank = (text: string): boolean => /^\s*$/.test(text);

/** A comment's lines, as PowerShell collects them: a block comment without its `<#` and `#>`, a line comment without its leading `#`s. */
function commentLines(comment: string): string[] {
  if (comment.startsWith("<#")) return comment.slice(2, comment.endsWith("#>") ? -2 : undefined).split(/\r\n|\r|\n/);
  return [comment.replace(/^#+/, "")];
}

/**
 * The lines of a section, from the line after its keyword up to the next
 * keyword line: blank lines before its text are skipped, and each line loses
 * as much leading whitespace as the first line of text has. Returns the
 * section and the index of the last line it read.
 */
function readSection(lines: string[], keywordIndex: number): { text: string; last: number } {
  let text      = "";
  let capturing = false;
  let indent    = 0;
  let index     = keywordIndex + 1;
  for (; index < lines.length; index += 1) {
    const line = lines[index];
    if (!capturing && isBlank(line)) continue;
    if (KEYWORD_LINE.test(line)) break;
    if (!capturing) {
      indent    = /^[ \t\u00a0]*/.exec(line)![0].length;
      capturing = true;
    }
    let start = 0;
    while (start < line.length && start < indent && /[ \t\u00a0]/.test(line[start])) start += 1;
    text += `${line.slice(start)}\n`;
  }
  return { text, last: index - 1 };
}

/** A comment block read as help, or undefined when PowerShell would not take it for help. */
function parseHelp(block: Comment[]): CommentHelp | undefined {
  const lines = block.flatMap((comment) => commentLines(comment.text));
  const help: CommentHelp = { parameters: new Map() };
  let keywords = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const match = KEYWORD_LINE.exec(lines[index]);
    if (!match) {
      if (!isBlank(lines[index])) return undefined;
      continue;
    }
    const keyword  = match[1].toUpperCase();
    const argument = match[3];
    keywords += 1;
    if (argument !== undefined) {
      if (!ARGUMENT_KEYWORDS.has(keyword)) return undefined;
      if (keyword === "PARAMETER") {
        const section = readSection(lines, index);
        const name    = argument.toUpperCase().trim();
        if (!help.parameters.has(name)) help.parameters.set(name, section.text);
        index = section.last;
      }
      continue;
    }
    if (!SECTION_KEYWORDS.has(keyword)) return undefined;
    const section = readSection(lines, index);
    if (keyword === "SYNOPSIS") help.synopsis = section.text;
    if (keyword === "DESCRIPTION") help.description = section.text;
    index = section.last;
  }
  return keywords > 0 ? help : undefined;
}

/**
 * The comments immediately before `offset`, nearest last: only whitespace
 * between them and it, the nearest ending no earlier than `minEndRow`, and
 * each earlier one ending on the line before the next begins or later.
 */
function precedingBlock(comments: Comment[], source: string, offset: number, minEndRow: number): Comment[] {
  const block: Comment[] = [];
  let boundary = offset;
  let minRow   = minEndRow;
  for (let index = comments.length - 1; index >= 0; index -= 1) {
    const comment = comments[index];
    if (comment.end > boundary) continue;
    if (!isBlank(source.slice(comment.end, boundary)) || comment.endRow < minRow) break;
    block.unshift(comment);
    boundary = comment.start;
    minRow   = comment.startRow - 1;
  }
  return block;
}

/**
 * The comment blocks that open a body, in order: from `offset`, comments
 * separated only by whitespace, a block ending where a blank line or more
 * falls between two comments, and the run ending at anything that is not a
 * comment.
 */
function openingBlocks(comments: Comment[], source: string, offset: number): Comment[][] {
  const blocks: Comment[][] = [];
  let boundary = offset;
  let current: Comment[] = [];
  for (const comment of comments) {
    if (comment.start < boundary) continue;
    if (!isBlank(source.slice(boundary, comment.start))) break;
    const previous = current[current.length - 1];
    if (previous && comment.startRow > previous.endRow + 1) {
      blocks.push(current);
      current = [];
    }
    current.push(comment);
    boundary = comment.end;
  }
  if (current.length > 0) blocks.push(current);
  return blocks;
}

/** The help PowerShell finds for a function: before its keyword, then at the start of its body, then at its end. */
function helpOf(node: SyntaxNode, comments: Comment[], source: string): CommentHelp | undefined {
  const before = parseHelp(precedingBlock(comments, source, node.startIndex, node.startPosition.row - 2));
  if (before) return before;
  const open  = node.children.find((child) => child.type === "{");
  const close = [...node.children].reverse().find((child) => child.type === "}");
  if (!open || !close) return undefined;
  for (const block of openingBlocks(comments, source, open.endIndex)) {
    const help = parseHelp(block);
    if (help) return help;
  }
  return parseHelp(precedingBlock(comments, source, close.startIndex, 0));
}

/** The parameters a function declares in its header and in its body's `param()` block, without their `$`. */
function declaredParameters(node: SyntaxNode): string[] {
  const lists = node.namedChildren.flatMap((child) => {
    if (child.type === "function_parameter_declaration") return child.namedChildren.filter((list) => list.type === "parameter_list");
    if (child.type === "script_block") return child.namedChildren.filter((block) => block.type === "param_block").flatMap((block) => block.namedChildren.filter((list) => list.type === "parameter_list"));
    return [];
  });
  return lists.flatMap((list) => list.namedChildren
    .filter((parameter) => parameter.type === "script_parameter")
    .map((parameter) => parameter.namedChildren.find((part) => part.type === "variable")?.text.replace(/^\$\{?|\}$/g, "") ?? "")
    .filter((name) => name.length > 0));
}

// ---------------------------------------------------------------------------
// Reading a script or module
// ---------------------------------------------------------------------------

/** Reads one script or module. */
async function extractFacts(content: string): Promise<FileFacts> {
  return readTree("powershell", content, (root) => {
    const { functions, types, commands, usings, comments } = collect(root);
    const scope: PathScope = { variables: fileVariables(root), items: new Map(), reading: new Set() };
    // The commands whose loads a loop reads, once for each file it lists or each name it writes out.
    const looped = new Set<number>();
    const facts: FileFacts = {
      functions: [], types: [], dotSources: [], moduleImports: [], usingModules: [], requires: [], computed: [],
      listings: loopListings(root, scope, looped), calls: [], library: isLibrary(root), unfixed: []
    };
    const listed = listLoads(root, scope, looped);
    const unfixed = (command: SyntaxNode): void => {
      if (!looped.has(command.startIndex)) facts.unfixed.push(`line ${command.startPosition.row + 1}: ${briefly(command.text)}`);
    };
    for (const node of functions) {
      const name = node.namedChildren.find((child) => child.type === "function_name")?.text;
      if (!name) continue;
      facts.functions.push({
        name,
        line:      node.startPosition.row + 1,
        character: node.startPosition.column + 1,
        help:      helpOf(node, comments, content),
        declared:  declaredParameters(node),
        fileScope: !inNestedScope(node)
      });
    }
    for (const node of types) {
      const name = node.namedChildren.find((child) => child.type === "simple_name")?.text;
      if (!name) continue;
      facts.types.push({ name, kind: node.type === "enum_statement" ? "enum" : "class", line: node.startPosition.row + 1, character: node.startPosition.column + 1 });
    }

    const calls = new Set<string>();
    let exportsReadable = true;
    for (const command of commands) {
      const called = calledName(command);
      if (called) calls.add(called);
      if (isDotSource(command)) {
        const written = dotSourceTarget(command);
        const target  = command.childForFieldName("command_name");
        const value   = (written === undefined || OTHER_VARIABLE.test(written)) && target ? pathValue(target, scope) : undefined;
        if (value !== undefined) facts.computed.push({ kind: "dot", path: value, written });
        else if (written !== undefined) facts.dotSources.push(written);
        else if (!dotSourcesBlock(command)) unfixed(command);
        continue;
      }
      const run = runPath(command, scope);
      if (run !== undefined) facts.computed.push({ kind: "run", path: run });
      switch (commandName(command)) {
        case "import-module":
        case "ipmo":
          for (const node of bindNodes(command, IMPORT_MODULE).get("Name") ?? []) {
            const strings = argumentStrings(node);
            const value   = strings.some((item) => item === undefined || OTHER_VARIABLE.test(item)) ? pathValue(node, scope) : undefined;
            if (value !== undefined && isModulePath(value)) facts.computed.push({ kind: "import", path: value, written: strings.length === 1 ? strings[0] : undefined });
            else {
              facts.moduleImports.push(...strings.filter((item): item is string => item !== undefined));
              if (strings.includes(undefined)) unfixed(command);
            }
          }
          break;
        case "export-modulemember": {
          // A pattern that is not a string written out, such as a variable, is known only when the module runs, so the list narrows nothing.
          const bound    = bindArguments(command, EXPORT_MODULE_MEMBER).get("Function") ?? [];
          const patterns = bound.filter((pattern): pattern is string => pattern !== undefined);
          exportsReadable &&= readInFull(command) && patterns.length === bound.length;
          facts.exports = [...(facts.exports ?? []), ...patterns];
          break;
        }
        default:
          break;
      }
    }
    if (!exportsReadable) facts.exports = undefined;
    facts.calls = Array.from(calls);
    facts.computed.push(...listed);

    for (const statement of usings) {
      const name = usingModuleName(statement);
      if (name !== null) facts.usingModules.push(name);
    }
    for (const comment of comments) facts.requires.push(...requiredModules(comment.text));
    return facts;
  });
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

/** Each index's files by their case-folded paths, built once per index, which is built once per run. */
const foldedIndexes = new WeakMap<WorkspaceFileIndex, Map<string, string[]>>();

/** The workspace file a workspace-relative path names, as Windows finds it: spelled exactly, or else the only file whose path differs in case alone. */
function findFile(files: WorkspaceFileIndex, relative: string): string | undefined {
  if (files.has(relative)) return relative;
  let folded = foldedIndexes.get(files);
  if (!folded) {
    folded = new Map();
    for (const file of files) {
      const key = file.toLowerCase();
      folded.set(key, [...(folded.get(key) ?? []), file]);
    }
    foldedIndexes.set(files, folded);
  }
  const matches = folded.get(relative.toLowerCase());
  return matches?.length === 1 ? matches[0] : undefined;
}

/** `$PSScriptRoot` written either way, which stands for the directory of the file it is written in. */
const SCRIPT_ROOT = /\$\{PSScriptRoot\}|\$PSScriptRoot(?!\w)/gi;

/**
 * The workspace file a path names, from the workspace-relative directory it
 * is written in, when the text alone fixes it: `$PSScriptRoot` is that
 * directory, any other variable leaves it unknown, a relative path is taken
 * from it, and a rooted one (a drive, a share, a leading separator) lies
 * outside what the workspace can say. A module path may name a directory,
 * which holds the module of its name.
 */
function resolvePath(written: string, directory: string, files: WorkspaceFileIndex | undefined, module: boolean): string | undefined {
  if (!files) return undefined;
  const expanded = written.replace(SCRIPT_ROOT, ".").replace(/\\/g, "/");
  if (expanded.includes("$") || /^(?:[a-z]:|\/)/i.test(expanded)) return undefined;
  const relative = path.posix.normalize(path.posix.join(directory || ".", expanded)).replace(/\/$/, "");
  if (relative === "." || relative === ".." || relative.startsWith("../")) return undefined;
  const file = findFile(files, relative);
  if (file || !module) return file;
  const leaf = path.posix.basename(relative);
  return findFile(files, `${relative}/${leaf}.psd1`) ?? findFile(files, `${relative}/${leaf}.psm1`);
}

/** A module named by a path rather than by its name: the text holds a directory separator, as `$PSScriptRoot` gives it one. */
function isModulePath(written: string): boolean {
  return /[\\/]|\$\{PSScriptRoot\}|\$PSScriptRoot(?!\w)/i.test(written);
}

// ---------------------------------------------------------------------------
// Adapter output for a script or module
// ---------------------------------------------------------------------------

/** A PowerShell wildcard pattern as a case-insensitive expression: `*`, `?`, `[...]`, and a backtick that escapes. */
function wildcard(pattern: string): RegExp {
  let source = "";
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    if (char === "`" && index + 1 < pattern.length) {
      index += 1;
      source += pattern[index].replace(/[.*+?^${}()|[\]\\/-]/g, "\\$&");
    } else if (char === "*") {
      source += ".*";
    } else if (char === "?") {
      source += ".";
    } else if (char === "[") {
      const close = pattern.indexOf("]", index + 1);
      if (close === -1) {
        source += "\\[";
      } else {
        source += `[${pattern.slice(index + 1, close).replace(/[\\^]/g, "\\$&")}]`;
        index = close;
      }
    } else {
      source += char.replace(/[.*+?^${}()|[\]\\/-]/g, "\\$&");
    }
  }
  return new RegExp(`^${source}$`, "is");
}

function normalizeHelpText(text: string | undefined): string | undefined {
  const normalized = text?.replace(/\r?\n/g, "\n").trim();
  return normalized ? normalized : undefined;
}

/** The function's help as documentation, each parameter under the spelling the function declares. */
function toDocumentation(fact: FunctionFact): SymbolDocumentation | undefined {
  if (!fact.help) return undefined;
  const summary    = normalizeHelpText(fact.help.synopsis);
  const remarks    = normalizeHelpText(fact.help.description);
  const parameters = Array.from(fact.help.parameters, ([key, text]): SymbolDocumentationParameter => {
    const name        = fact.declared.find((declared) => declared.toUpperCase() === key) ?? key;
    const description = normalizeHelpText(text);
    return description ? { name, description } : { name };
  });
  if (!summary && !remarks && parameters.length === 0) return undefined;
  return {
    source:     "comment-help",
    summary,
    remarks,
    parameters: parameters.length > 0 ? parameters : undefined
  };
}

/** The published functions and every class and enum, in document order. */
function toSymbols(facts: FileFacts): PublicSymbolEntry[] {
  const patterns  = facts.exports?.map(wildcard);
  const published = patterns ? facts.functions.filter((fact) => patterns.some((pattern) => pattern.test(fact.name))) : facts.functions;
  const placed    = [
    ...published.map((fact) => ({ fact, entry: { name: fact.name, kind: "function", location: { line: fact.line, character: fact.character }, documentation: toDocumentation(fact) } })),
    ...facts.types.map((fact) => ({ fact, entry: { name: fact.name, kind: fact.kind, location: { line: fact.line, character: fact.character } } }))
  ];
  return placed
    .sort((left, right) => left.fact.line - right.fact.line || left.fact.character - right.fact.character)
    .map(({ entry }): PublicSymbolEntry => entry);
}

/** A load of one file by another: a dot-source, an import of a module, a script run by its path, or a module or script a manifest names. */
interface Load {
  kind: "dot" | "import" | "run" | "manifest";
  to:   string;
}

/** A load as a file's text gives it: its text when it was written out, the path the text fixes when it was built, and its file when the workspace holds one. */
interface ScriptLoad {
  kind:      Load["kind"];
  written:   Written;
  computed?: string;
  to?:       string;
}

/** A file's loads in the order the dependencies list them. */
function scriptLoads(facts: FileFacts, directory: string, files: WorkspaceFileIndex | undefined): ScriptLoad[] {
  const loads: ScriptLoad[] = [];
  const module = (written: Written): void => {
    loads.push({ kind: "import", written, to: written !== undefined && isModulePath(written) ? resolvePath(written, directory, files, true) : undefined });
  };
  facts.moduleImports.forEach(module);
  facts.usingModules.forEach(module);
  facts.requires.forEach(module);
  for (const written of facts.dotSources) loads.push({ kind: "dot", written, to: written === undefined ? undefined : resolvePath(written, directory, files, false) });
  for (const load of facts.computed) loads.push({ kind: load.kind, written: load.written, computed: load.path, to: resolvePath(load.path, directory, files, load.kind === "import") });
  for (const listing of facts.listings) {
    for (const to of listedFiles(listing, directory, files)) loads.push({ kind: "dot", written: undefined, to });
  }
  return loads;
}

/** Why a load draws nothing, as the notices say it. */
const UNFIXED_LOAD = "dot-sources and imports whose path the text does not fix, left unlinked";
const UNFOUND_LOAD = "loads whose path the text fixes but no file of the workspace holds, left unlinked";

/**
 * The dependencies of a script or module: what it loads, each under its file
 * or, when the workspace holds none, its text as written; then the files whose
 * functions it calls, by {@link calledFiles}, each with the functions called.
 * A load with neither draws nothing and is said as a notice: a path the text
 * does not fix, or a path built (`Join-Path`, a variable) that names no file
 * of the workspace.
 */
function toDependencies(facts: FileFacts, sourcePath: string, files: WorkspaceFileIndex | undefined, workspace: Workspace | undefined): { dependencies: DependencyEntry[]; notices: SourceNotice[] } {
  const dependencies = new Map<string, DependencyEntry>();
  const notices: SourceNotice[] = facts.unfixed.map((subject) => ({ reason: UNFIXED_LOAD, subject }));
  for (const load of scriptLoads(facts, path.posix.dirname(sourcePath), files)) {
    const specifier = load.to ?? load.written?.trim();
    if (!specifier && files !== undefined && load.computed !== undefined) notices.push({ reason: UNFOUND_LOAD, subject: load.computed });
    if (!specifier || load.to === sourcePath || dependencies.has(specifier)) continue;
    dependencies.set(specifier, { specifier, resolvedPath: load.to, symbols: [], kind: "import" });
  }
  const called = workspace ? calledFiles(workspace, sourcePath, facts) : new Map<string, Set<string>>();
  for (const file of Array.from(called.keys()).sort()) {
    const symbols = Array.from(called.get(file)!).sort();
    const existing = dependencies.get(file);
    if (existing) existing.symbols = symbols;
    else dependencies.set(file, { specifier: file, resolvedPath: file, symbols, kind: "import" });
  }
  return { dependencies: Array.from(dependencies.values()), notices };
}

/** The scripts a `Get-ChildItem` listing names, as Windows finds them: its folder without regard to case, then its leaf, `-Filter`, `-Include` and `-Exclude` as PowerShell's wildcards; only scripts and modules, which a loop can dot-source. */
function listedFiles(listing: Listing, directory: string, files: WorkspaceFileIndex | undefined): string[] {
  if (!files) return [];
  const expanded = listing.path.replace(SCRIPT_ROOT, ".").replace(/\\/g, "/");
  if (expanded.includes("$") || /^(?:[a-z]:|\/)/i.test(expanded)) return [];
  let folder = path.posix.normalize(path.posix.join(directory || ".", expanded)).replace(/\/$/, "");
  let leaf: RegExp | undefined;
  if (/[*?[]/.test(path.posix.basename(folder))) {
    leaf   = wildcard(path.posix.basename(folder));
    folder = path.posix.dirname(folder);
  }
  if (folder === ".." || folder.startsWith("../") || /[*?[]/.test(folder)) return [];
  const named = leaf ? undefined : findFile(files, folder);
  const filter  = listing.filter ? wildcard(listing.filter) : undefined;
  const include = listing.include?.map(wildcard);
  const exclude = listing.exclude?.map(wildcard);
  const prefix  = folder === "." ? "" : `${folder.toLowerCase()}/`;
  const listed: string[] = [];
  for (const file of named ? [named] : files) {
    if (!named) {
      if (!file.toLowerCase().startsWith(prefix)) continue;
      if (!listing.recurse && file.slice(prefix.length).includes("/")) continue;
    }
    const name = path.posix.basename(file);
    if (!/\.(?:ps1|psm1)$/i.test(name)) continue;
    if ((leaf && !leaf.test(name)) || (filter && !filter.test(name))) continue;
    if ((include && !include.some((pattern) => pattern.test(name))) || exclude?.some((pattern) => pattern.test(name))) continue;
    listed.push(file);
  }
  return listed.sort();
}

// ---------------------------------------------------------------------------
// The workspace: what every PowerShell file defines and loads
// ---------------------------------------------------------------------------

/** What the table keeps of a module manifest or data file. */
interface DataFacts {
  manifest:   boolean;
  /** The modules and scripts the manifest names, by key, the root module's first. */
  references: Array<{ key: string; name: string; version?: string }>;
  /** The functions `FunctionsToExport` names, as written. */
  exports:    string[];
}

type TableEntry = { kind: "script"; hash: string; facts: FileFacts } | { kind: "data"; hash: string; facts: DataFacts };

/**
 * Every PowerShell file of a workspace, read once: its facts, which the
 * analysis of the file itself reuses, the files that define each function at
 * their own level, and, worked out when first asked, what each file loads,
 * which files each module holds and which files each file's loading reaches.
 */
interface Workspace {
  files:      WorkspaceFileIndex;
  entries:    Map<string, TableEntry>;
  /** By case-folded name without a scope prefix: each file that defines the function at its own level, with the name as written there. */
  definers:   Map<string, Array<{ file: string; name: string }>>;
  loads:      Map<string, Load[]>;
  members:    Map<string, Set<string>>;
  modulesOf?: Map<string, string[]>;
  reach:      Map<string, Set<string>>;
}

/** Each index's workspace, built once per index, which is built once per run, as the C# reader builds its type table. */
const workspaces = new WeakMap<WorkspaceFileIndex, Promise<Workspace>>();

function digest(content: string): string {
  return createHash("sha1").update(content).digest("base64");
}

/** A function's name as callers write it: without a scope prefix, case-folded, as PowerShell finds commands. */
function callName(name: string): string {
  return name.replace(/^(?:script|global|local|private):/i, "").toLowerCase();
}

async function buildWorkspace(workspaceRoot: string, files: WorkspaceFileIndex): Promise<Workspace> {
  const workspace: Workspace = { files, entries: new Map(), definers: new Map(), loads: new Map(), members: new Map(), reach: new Map() };
  const extensions = new Set(powershellSyntax.extensions);
  for (const file of Array.from(files).sort()) {
    const extension = path.posix.extname(file).toLowerCase();
    if (!extensions.has(extension)) continue;
    try {
      const content = await readSourceText(path.join(workspaceRoot, file));
      workspace.entries.set(file, extension === ".psd1"
        ? { kind: "data", hash: digest(content), facts: await extractDataFacts(content) }
        : { kind: "script", hash: digest(content), facts: await extractFacts(content) });
    } catch (error) {
      // A failure of the machine's is thrown on, to the generator's catch, which names it. A file that cannot be read
      // or parsed for a cause of its own defines and loads nothing here; its own analysis reports what it can.
      throwIfMachineFailure(error);
    }
  }
  for (const [file, entry] of workspace.entries) addDefiners(workspace, file, entry);
  return workspace;
}

/** Records the functions a file defines at its own level, each name once, as the name it is written by there. */
function addDefiners(workspace: Workspace, file: string, entry: TableEntry): void {
  if (entry.kind !== "script") return;
  const seen = new Set<string>();
  for (const fact of entry.facts.functions) {
    const name = callName(fact.name);
    if (!fact.fileScope || seen.has(name)) continue;
    seen.add(name);
    workspace.definers.set(name, [...(workspace.definers.get(name) ?? []), { file, name: fact.name }]);
  }
}

function workspaceOf(workspaceRoot: string, files: WorkspaceFileIndex): Promise<Workspace> {
  let pending = workspaces.get(files);
  if (!pending) {
    pending = buildWorkspace(workspaceRoot, files);
    workspaces.set(files, pending);
  }
  return pending;
}

/** The files a file loads, by the same reading its dependencies use. */
function loadsOf(workspace: Workspace, file: string): Load[] {
  let loads = workspace.loads.get(file);
  if (!loads) {
    const entry = workspace.entries.get(file);
    loads = !entry ? [] : entry.kind === "script"
      ? scriptLoads(entry.facts, path.posix.dirname(file), workspace.files).flatMap((load) => (load.to && load.to !== file ? [{ kind: load.kind, to: load.to }] : []))
      : manifestFiles(entry.facts, file, workspace.files).map((to): Load => ({ kind: "manifest", to }));
    workspace.loads.set(file, loads);
  }
  return loads;
}

/** Whether a file is a module's root: a `.psm1`, or a manifest. */
function isModuleRoot(workspace: Workspace, file: string): boolean {
  const entry = workspace.entries.get(file);
  return entry?.kind === "data" ? entry.facts.manifest : /\.psm1$/i.test(file);
}

/** The files a module holds: its root, what a manifest root names, and what any of them dot-sources, followed. A module it imports is a module of its own. */
function membersOf(workspace: Workspace, root: string): Set<string> {
  let members = workspace.members.get(root);
  if (!members) {
    members = new Set([root]);
    const pending = [root];
    while (pending.length > 0) {
      const at = pending.pop()!;
      for (const load of loadsOf(workspace, at)) {
        const follows = load.kind === "dot" || (load.kind === "manifest" && at === root);
        if (follows && !members.has(load.to)) {
          members.add(load.to);
          pending.push(load.to);
        }
      }
    }
    workspace.members.set(root, members);
  }
  return members;
}

/** The module roots whose modules hold a file. */
function modulesOf(workspace: Workspace, file: string): string[] {
  if (!workspace.modulesOf) {
    const modules = new Map<string, string[]>();
    for (const root of Array.from(workspace.entries.keys()).filter((candidate) => isModuleRoot(workspace, candidate))) {
      for (const member of membersOf(workspace, root)) modules.set(member, [...(modules.get(member) ?? []), root]);
    }
    workspace.modulesOf = modules;
  }
  return workspace.modulesOf.get(file) ?? [];
}

/**
 * What loading reaches from some files: each file they dot-source, the files
 * of each module they import, and what a manifest names, followed. A script
 * run by its path runs in a scope of its own, whose functions do not come back.
 */
function reachOf(workspace: Workspace, key: string, start: Iterable<string>): Set<string> {
  let reached = workspace.reach.get(key);
  if (!reached) {
    reached = new Set(start);
    const pending = Array.from(reached);
    while (pending.length > 0) {
      const at = pending.pop()!;
      for (const load of loadsOf(workspace, at)) {
        if (load.kind === "run") continue;
        const targets = load.kind === "import" && isModuleRoot(workspace, load.to) ? membersOf(workspace, load.to) : [load.to];
        for (const target of targets) {
          if (reached.has(target)) continue;
          reached.add(target);
          pending.push(target);
        }
      }
    }
    workspace.reach.set(key, reached);
  }
  return reached;
}

/**
 * Whether a file is a test, by the archetype the product gives it: the
 * generator's answer under the workspace's own configuration, which the file
 * index carries (`archetypeOf`), its overrides and sample roots among it; an
 * index made without the generator, as a test's, has the default
 * configuration's conventions of tests in `resolveArchetype`.
 */
function isTestFile(files: WorkspaceFileIndex, file: string): boolean {
  return (files.archetypeOf?.(file) ?? resolveArchetype(file, DEFAULT_LIVE_DOCUMENTATION_CONFIG)) === "test";
}

/** Whether a file's functions are loaded where another file runs: by what the file loads, or by its modules, their files and what they load. */
function isLoadedFrom(workspace: Workspace, file: string, definer: string): boolean {
  if (reachOf(workspace, `file|${file}`, [file]).has(definer)) return true;
  return modulesOf(workspace, file).some((root) => reachOf(workspace, `module|${root}`, membersOf(workspace, root)).has(definer));
}

/**
 * The files whose functions a file calls, each with the functions called,
 * under the rule measured on 2026-11-19 ("loaded, else unique"). Only a
 * function defined at a file's own level counts. A name the file defines
 * itself is its own. Otherwise the call goes to the one defining file that the
 * caller's loading reaches; if it reaches several, to none; if it reaches
 * none, to the only file of the workspace that defines the name, unless the
 * name is a command PowerShell itself ships, which answers where nothing
 * loaded overrides it. That last reach passes over a test file unless the
 * caller is a test: nothing in a repository's working code depends on its
 * tests, so a test's stub of another module's command is never the only
 * definition working code finds.
 */
function calledFiles(workspace: Workspace, file: string, facts: FileFacts): Map<string, Set<string>> {
  const own    = new Set(facts.functions.map((fact) => callName(fact.name)));
  const called = new Map<string, Set<string>>();
  const caller = isTestFile(workspace.files, file);
  for (const name of facts.calls) {
    if (own.has(name)) continue;
    const definers = (workspace.definers.get(name) ?? []).filter((definer) => definer.file !== file);
    if (definers.length === 0) continue;
    const loaded = definers.filter((definer) => isLoadedFrom(workspace, file, definer.file));
    const reach  = caller ? definers : definers.filter((definer) => !isTestFile(workspace.files, definer.file));
    const chosen = loaded.length === 1 ? loaded[0]
      : loaded.length === 0 && reach.length === 1 && !SHIPPED_COMMANDS.has(name) ? reach[0]
        : undefined;
    if (chosen) called.set(chosen.file, new Set([...(called.get(chosen.file) ?? []), chosen.name]));
  }
  return called;
}

// ---------------------------------------------------------------------------
// Module manifests
// ---------------------------------------------------------------------------

/** Keys whose values name the root module, in the current spelling and the one before it. */
const ROOT_MODULE_KEYS = ["rootmodule", "moduletoprocess"];

/** Keys of which one makes a `.psd1`'s table a module manifest's; a data file has none of them. */
const MANIFEST_KEYS = [...ROOT_MODULE_KEYS, "moduleversion", "functionstoexport"];

/** Keys whose values name the modules and scripts a manifest loads, the root module's first. */
const MODULE_KEYS = [...ROOT_MODULE_KEYS, "nestedmodules", "scriptstoprocess", "requiredmodules"];

/** The table a `.psd1` holds: its one statement's value, when that is a hashtable. */
function dataFileTable(root: SyntaxNode): DataTable | undefined {
  const list       = root.namedChildren.find((child) => child.type === "statement_list") ?? null;
  const statements = statementsOf(list);
  if (statements.length !== 1) return undefined;
  const table = dataValue(statements[0]);
  return table instanceof Map ? table : undefined;
}

/** A module or script a manifest names: by a name or path, or a module specification's `ModuleName`, with the version the specification writes. */
function manifestEntries(value: DataValue): Array<{ name: string; version?: string }> {
  const items = Array.isArray(value) ? value : [value];
  return items.flatMap((item) => {
    if (typeof item === "string") return item ? [{ name: item }] : [];
    if (!(item instanceof Map)) return [];
    const name    = item.get("modulename");
    const version = item.get("requiredversion") ?? item.get("moduleversion");
    if (typeof name !== "string" || !name) return [];
    return typeof version === "string" ? [{ name, version }] : [{ name }];
  });
}

/** Reads one `.psd1`'s table: whether it is a module manifest, the modules and scripts it names, and the functions it exports. */
async function extractDataFacts(content: string): Promise<DataFacts> {
  return readTree("powershell", content, (root): DataFacts => {
    const table = dataFileTable(root);
    if (!table || !MANIFEST_KEYS.some((key) => table.has(key))) return { manifest: false, references: [], exports: [] };
    const references = MODULE_KEYS.flatMap((key) => manifestEntries(table.get(key)).map((entry) => ({ key, ...entry })));
    const exported   = table.get("functionstoexport");
    const exports    = (Array.isArray(exported) ? exported : [exported]).filter((name): name is string => typeof name === "string" && name.length > 0);
    return { manifest: true, references, exports };
  });
}

/** The workspace files a manifest names, from its folder, the root module's first; never the manifest itself. */
function manifestFiles(facts: DataFacts, sourcePath: string, files: WorkspaceFileIndex | undefined): string[] {
  const directory = path.posix.dirname(sourcePath);
  const named: string[] = [];
  for (const reference of facts.references) {
    const file = resolvePath(reference.name, directory, files, true);
    if (file && file !== sourcePath && !named.includes(file)) named.push(file);
  }
  return named;
}

/**
 * The functions a manifest's `FunctionsToExport` names, each offered under the
 * name its origin defines it by and linked to that origin: the one file of the
 * module, its root and what that loads, that defines the function at its own
 * level. A name the module does not define exactly once, or a wildcard, is not
 * offered; callers reach every function at its origin, not through the manifest.
 */
function manifestReExports(workspace: Workspace, sourcePath: string, facts: DataFacts): ReExportedSymbolInfo[] {
  const members = membersOf(workspace, sourcePath);
  const offered: ReExportedSymbolInfo[] = [];
  for (const name of facts.exports) {
    if (/[*?[]/.test(name)) continue;
    const origins = (workspace.definers.get(callName(name)) ?? []).filter((definer) => members.has(definer.file));
    if (origins.length === 1) offered.push({ name: origins[0].name, kind: "function", sourceModulePath: origins[0].file });
  }
  return offered;
}

/** Reads one `.psd1`: a module manifest's module, what it names, the root module it declares and the functions it offers; nothing of a data file. */
function analyzeDataFile(facts: DataFacts, sourcePath: string, files: WorkspaceFileIndex | undefined, workspace: Workspace | undefined): SourceAnalysisResult {
  if (!facts.manifest) return { symbols: [], dependencies: [] };
  const directory = path.posix.dirname(sourcePath);
  const linked    = new Set<string>();
  const external  = new Set<string>();
  const declares: DeclaredEntry[] = [];
  for (const entry of facts.references) {
    const file = resolvePath(entry.name, directory, files, true);
    if (file && file !== sourcePath) {
      linked.add(file);
      if (ROOT_MODULE_KEYS.includes(entry.key) && declares.length === 0) declares.push({ reason: "module", file });
    } else if (!file) {
      external.add(entry.version ? `${entry.name}@${entry.version}` : entry.name);
    }
  }
  const dependencies: DependencyEntry[] = [
    ...Array.from(linked).sort().map((file): DependencyEntry => ({ specifier: file, resolvedPath: file, symbols: [], kind: "import" })),
    ...Array.from(external).sort().map((specifier): DependencyEntry => ({ specifier, symbols: [], kind: "import" }))
  ];
  const symbols = packageSymbols(path.posix.basename(sourcePath).replace(/\.psd1$/i, ""));
  const result: SourceAnalysisResult = declares.length > 0 ? { symbols, dependencies, declares } : { symbols, dependencies };
  const offered = workspace ? manifestReExports(workspace, sourcePath, facts) : [];
  if (offered.length > 0) result.reExportedSymbols = offered;
  return result;
}

// ---------------------------------------------------------------------------
// The adapter
// ---------------------------------------------------------------------------

/**
 * Analyzes one PowerShell file from its text, without the generator: a
 * script's or module's published functions, classes and enums, its
 * dependencies and whether it is a program, or a module manifest's module,
 * what it names and the root module it declares. Paths are resolved against
 * `fileIndex`, the workspace's files; without one, nothing resolves.
 */
export async function analyzePowerShellSource(options: { content: string; absolutePath: string; workspaceRoot: string; fileIndex?: WorkspaceFileIndex }): Promise<SourceAnalysisResult> {
  const sourcePath = normalizeWorkspacePath(path.relative(options.workspaceRoot, options.absolutePath));
  const extension  = path.extname(options.absolutePath).toLowerCase();
  const workspace  = options.fileIndex ? await workspaceOf(options.workspaceRoot, options.fileIndex) : undefined;
  const entry      = await admit(workspace, sourcePath, extension, options.content);
  if (entry.kind === "data") return analyzeDataFile(entry.facts, sourcePath, options.fileIndex, workspace);
  const facts  = entry.facts;
  const { dependencies, notices } = toDependencies(facts, sourcePath, options.fileIndex, workspace);
  const result: SourceAnalysisResult = { symbols: toSymbols(facts), dependencies };
  if (notices.length > 0) result.notices = notices;
  // A script is what PowerShell runs, so a `.ps1` is the program's entry unless running it would do nothing: a library, there to be dot-sourced. A module is not.
  if (extension === ".ps1" && !facts.library) result.program = {};
  return result;
}

/**
 * The facts of the file being analyzed: the workspace's, read when the
 * workspace was, when its text is the same, so that each file is parsed once
 * a run; else read from the text given, which then stands for the file in the
 * workspace too, everything worked out from the old text forgotten.
 */
async function admit(workspace: Workspace | undefined, sourcePath: string, extension: string, content: string): Promise<TableEntry> {
  const hash  = digest(content);
  const known = workspace?.entries.get(sourcePath);
  if (known?.hash === hash) return known;
  const entry: TableEntry = extension === ".psd1"
    ? { kind: "data", hash, facts: await extractDataFacts(content) }
    : { kind: "script", hash, facts: await extractFacts(content) };
  if (workspace) {
    workspace.entries.set(sourcePath, entry);
    for (const [name, definers] of workspace.definers) workspace.definers.set(name, definers.filter((definer) => definer.file !== sourcePath));
    addDefiners(workspace, sourcePath, entry);
    workspace.loads.clear();
    workspace.members.clear();
    workspace.reach.clear();
    workspace.modulesOf = undefined;
  }
  return entry;
}

/** Language adapter for PowerShell (`.ps1`, `.psm1`, `.psd1`): published functions with their comment-based help, classes and enums, the files a script loads and the files whose functions it calls, and module manifests with the functions they offer; a `.ps1` script is the program's entry unless it is a library, a module or manifest is not. */
export const powershellAdapter: LanguageAdapter = {
  id: "powershell-basic",
  extensions: powershellSyntax.extensions,
  async analyze({ absolutePath, workspaceRoot, fileIndex }): Promise<SourceAnalysisResult | null> {
    const content = await readSourceText(absolutePath);
    return analyzePowerShellSource({ content, absolutePath, workspaceRoot, fileIndex });
  }
};
