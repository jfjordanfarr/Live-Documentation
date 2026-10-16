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
 * module` and `#requires -Modules`, all imports. A path is resolved to a file
 * of the workspace when the text alone fixes it: a string or a bare word
 * written out, in which `$PSScriptRoot` stands for the file's directory and
 * against which a relative path is resolved, as if the script ran from where
 * it lies. A module path may name a `.psm1`, a `.psd1`, or a directory holding
 * the module of its name. Each name in a path is found among the workspace's
 * files as Windows finds it, without regard to case. A module named rather
 * than pathed, a dynamic path and a path outside the workspace keep their
 * text as the specifier. A `.ps1` is the program's entry; a module is not.
 *
 * A `.psd1` whose table has a `RootModule` (or `ModuleToProcess`, its older
 * name), a `ModuleVersion` or a `FunctionsToExport` is a module manifest: the
 * module, named by the file's stem, is its one symbol; the modules and scripts
 * its root module, `NestedModules`, `ScriptsToProcess` and
 * `RequiredModules` name are its dependencies, each linked to the file it
 * names from the manifest's folder when the workspace holds it, and otherwise
 * kept by name, as `name@version` when a module specification writes a
 * `RequiredVersion` or a `ModuleVersion`; and its root module is the file it
 * declares as a `module` entry. Any other `.psd1` is a data file, of which
 * nothing is read.
 *
 * A file is read as PowerShell reads it, by its byte order mark: UTF-16 in
 * either order, else UTF-8.
 *
 * The rules are measured against PowerShell's own parser, whose record of
 * each PowerShell fixture is `expected/powershell-ast.json`.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import { powershellSyntax } from "../../languages";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult, SymbolDocumentation, SymbolDocumentationParameter } from "../core";
import type { DeclaredEntry } from "../coreTypes";
import type { LanguageAdapter, WorkspaceFileIndex } from "./index";
import { packageSymbols } from "./manifest";
import { parseSource, type SyntaxNode } from "./treeSitter";

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

interface FileFacts {
  functions:     FunctionFact[];
  types:         TypeFact[];
  /** The `-Function` patterns of the file's `Export-ModuleMember` commands; undefined when it calls none, or one the grammar could not read in full or whose patterns are not all written out. */
  exports?:      string[];
  dotSources:    Written[];
  moduleImports: Written[];
  usingModules:  Written[];
  requires:      string[];
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
 * joined to one by a colon, is that parameter's; any other argument is
 * positional. A parameter the signature does not know takes nothing.
 */
function bindArguments(command: SyntaxNode, signature: CmdletSignature): Map<string, Written[]> {
  const bound   = new Map<string, Written[]>();
  const bind    = (name: string, node: SyntaxNode): void => {
    bound.set(name, [...(bound.get(name) ?? []), ...argumentStrings(node)]);
  };
  const elements = command.childForFieldName("command_elements")?.children ?? [];
  let pending: CmdletParameter | undefined;
  let position = 0;
  for (let index = 0; index < elements.length; index += 1) {
    const element = elements[index];
    if (element.type === "command_parameter") {
      const parameter = resolveParameter(signature, element.text);
      const colon     = elements[index + 1]?.type === "command_argument_sep" && elements[index + 1].text === ":";
      pending = parameter && (colon || !parameter.switch) ? parameter : undefined;
      continue;
    }
    if (!element.isNamed || NOT_ARGUMENTS.has(element.type)) continue;
    if (pending) {
      bind(pending.name, element);
      pending = undefined;
    } else {
      const positional = signature.positional[position];
      position += 1;
      if (positional) bind(positional, element);
    }
  }
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
    case "path_command_name":
      return target.text;
    default:
      return undefined;
  }
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
  const tree = await parseSource("powershell", content);
  try {
    const { functions, types, commands, usings, comments } = collect(tree.rootNode);
    const facts: FileFacts = { functions: [], types: [], dotSources: [], moduleImports: [], usingModules: [], requires: [] };
    for (const node of functions) {
      const name = node.namedChildren.find((child) => child.type === "function_name")?.text;
      if (!name) continue;
      facts.functions.push({
        name,
        line:      node.startPosition.row + 1,
        character: node.startPosition.column + 1,
        help:      helpOf(node, comments, content),
        declared:  declaredParameters(node)
      });
    }
    for (const node of types) {
      const name = node.namedChildren.find((child) => child.type === "simple_name")?.text;
      if (!name) continue;
      facts.types.push({ name, kind: node.type === "enum_statement" ? "enum" : "class", line: node.startPosition.row + 1, character: node.startPosition.column + 1 });
    }

    let exportsReadable = true;
    for (const command of commands) {
      if (command.namedChildren.some((child) => child.type === "command_invokation_operator" && child.text === ".")) {
        facts.dotSources.push(dotSourceTarget(command));
        continue;
      }
      switch (commandName(command)) {
        case "import-module":
        case "ipmo":
          facts.moduleImports.push(...(bindArguments(command, IMPORT_MODULE).get("Name") ?? []));
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

    for (const statement of usings) {
      const name = usingModuleName(statement);
      if (name !== null) facts.usingModules.push(name);
    }
    for (const comment of comments) facts.requires.push(...requiredModules(comment.text));
    return facts;
  } finally {
    tree.delete();
  }
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

function toDependencies(facts: FileFacts, directory: string, files: WorkspaceFileIndex | undefined): DependencyEntry[] {
  const dependencies = new Map<string, DependencyEntry>();
  const add = (written: Written, resolvedPath: string | undefined): void => {
    const specifier = resolvedPath ?? written?.trim();
    if (!specifier || dependencies.has(specifier)) return;
    dependencies.set(specifier, { specifier, resolvedPath, symbols: [], kind: "import" });
  };
  const addModule = (written: Written): void => {
    add(written, written !== undefined && isModulePath(written) ? resolvePath(written, directory, files, true) : undefined);
  };
  facts.moduleImports.forEach(addModule);
  facts.usingModules.forEach(addModule);
  facts.requires.forEach(addModule);
  for (const written of facts.dotSources) add(written, written === undefined ? undefined : resolvePath(written, directory, files, false));
  return Array.from(dependencies.values());
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

/** Reads one `.psd1`: a module manifest's module, what it names and the root module it declares; nothing of a data file. */
async function analyzeDataFile(content: string, sourcePath: string, files: WorkspaceFileIndex | undefined): Promise<SourceAnalysisResult> {
  const tree = await parseSource("powershell", content);
  try {
    const table = dataFileTable(tree.rootNode);
    if (!table || !MANIFEST_KEYS.some((key) => table.has(key))) return { symbols: [], dependencies: [] };
    const directory = path.posix.dirname(sourcePath);
    const linked    = new Set<string>();
    const external  = new Set<string>();
    const declares: DeclaredEntry[] = [];
    for (const key of MODULE_KEYS) {
      for (const entry of manifestEntries(table.get(key))) {
        const file = resolvePath(entry.name, directory, files, true);
        if (file && file !== sourcePath) {
          linked.add(file);
          if (ROOT_MODULE_KEYS.includes(key) && declares.length === 0) declares.push({ reason: "module", file });
        } else if (!file) {
          external.add(entry.version ? `${entry.name}@${entry.version}` : entry.name);
        }
      }
    }
    const dependencies: DependencyEntry[] = [
      ...Array.from(linked).sort().map((file): DependencyEntry => ({ specifier: file, resolvedPath: file, symbols: [], kind: "import" })),
      ...Array.from(external).sort().map((specifier): DependencyEntry => ({ specifier, symbols: [], kind: "import" }))
    ];
    const symbols = packageSymbols(path.posix.basename(sourcePath).replace(/\.psd1$/i, ""));
    return declares.length > 0 ? { symbols, dependencies, declares } : { symbols, dependencies };
  } finally {
    tree.delete();
  }
}

// ---------------------------------------------------------------------------
// The adapter
// ---------------------------------------------------------------------------

/** A file's text as PowerShell reads it, by its byte order mark: UTF-16 in either order, else UTF-8, the mark dropped. */
function decodeScript(bytes: Uint8Array): string {
  const encoding = bytes[0] === 0xff && bytes[1] === 0xfe ? "utf-16le" : bytes[0] === 0xfe && bytes[1] === 0xff ? "utf-16be" : "utf-8";
  return new TextDecoder(encoding).decode(bytes);
}

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
  if (extension === ".psd1") return analyzeDataFile(options.content, sourcePath, options.fileIndex);
  const facts  = await extractFacts(options.content);
  const result: SourceAnalysisResult = {
    symbols:      toSymbols(facts),
    dependencies: toDependencies(facts, path.posix.dirname(sourcePath), options.fileIndex)
  };
  // A script is what PowerShell runs, so every `.ps1` is the program's entry, whatever it holds; a module is not.
  if (extension === ".ps1") result.program = {};
  return result;
}

/** Language adapter for PowerShell (`.ps1`, `.psm1`, `.psd1`): published functions with their comment-based help, classes and enums, dot-source, module and `#requires` dependencies, and module manifests; a `.ps1` script is the program's entry, a module or manifest is not. */
export const powershellAdapter: LanguageAdapter = {
  id: "powershell-basic",
  extensions: powershellSyntax.extensions,
  async analyze({ absolutePath, workspaceRoot, fileIndex }): Promise<SourceAnalysisResult | null> {
    const content = decodeScript(await fs.readFile(absolutePath));
    return analyzePowerShellSource({ content, absolutePath, workspaceRoot, fileIndex });
  }
};
