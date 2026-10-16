/**
 * C and C++ adapter: tree-sitter symbols, `#include` dependencies with the
 * names each header lends the file, and the program entry.
 *
 * Both languages are read with the C++ grammar: the bundle ships no separate C
 * grammar, and C is within what it parses.
 *
 * A file's symbols are what it offers at file scope: functions, defined or
 * prototyped; variables; structs, unions and enums, by tag, or by the name a
 * typedef gives an anonymous one; typedefs and `using` aliases; macros; and
 * classes with their public members, qualified `Class.member`. In a C++ file
 * a struct's and a union's members are listed the same way, public unless an
 * access specifier says otherwise; in a C file their bodies contribute
 * nothing. A name declared inside a namespace is qualified `ns.Name`. What is
 * `static`, or inside an anonymous namespace, belongs to the file alone and
 * is not listed. Each symbol carries the comment immediately above it, read
 * as Doxygen.
 *
 * Dependencies are the file's `#include`s. A quoted include is looked for in
 * the including file's directory and in each of its ancestors up to the
 * workspace root, trying each directory itself, then its `include/`, then
 * its `src/`, nearest first; that rule was chosen on 2026-10-16 by measuring
 * the four strategies below against scip-clang over five fixtures, where it
 * alone agreed with the compiler on every include. A resolved include carries
 * the file's path and the names the file uses from it: identifiers in its
 * code, outside comments and strings, that the header declares at file
 * scope. A system include, or a quoted one that resolves to nothing, is
 * external and keeps its specifier.
 *
 * The program's entry point is a definition of `main`, `wmain`, `WinMain` or
 * `wWinMain` with a body, in a file that is not a header.
 */
import { promises as fs, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { cSyntax } from "../../languages";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type {
  DependencyEntry,
  PublicSymbolEntry,
  SourceAnalysisResult,
  SymbolDocumentation,
  SymbolDocumentationLink,
  SymbolDocumentationParameter
} from "../core";
import type { ProgramEntry } from "../coreTypes";
import type { LanguageAdapter } from "./index";
import { parseSource, type SyntaxNode } from "./treeSitter";

// ---------------------------------------------------------------------------
// Facts about one file
// ---------------------------------------------------------------------------

interface Declared {
  name: string;
  /** `ns.Name` inside a namespace, `Class.member` for a member; absent at file scope. */
  qualifiedName?: string;
  kind: string;
  /** A class's member, which another file reaches through the class rather than by name. */
  member: boolean;
  line: number;
  character: number;
  documentation?: SymbolDocumentation;
}

interface Include {
  specifier: string;
  /** Written `<...>` rather than `"..."`. */
  system: boolean;
}

interface FileFacts {
  includes: Include[];
  declarations: Declared[];
  /** Every identifier the file's code mentions, outside comments and strings. */
  identifiers: Set<string>;
  /** The first definition of `main` or a Windows entry point, at the line of its name. */
  program?: ProgramEntry;
}

/** The enclosing namespaces and classes of a declaration, outermost first. */
interface Scope {
  path: string[];
  inClass: boolean;
}

/** The access the members of a class body are declared under, as `public:` and the others change it. */
interface Access {
  current: string;
}

/** What a declarator names, and the scopes a qualified one spells: `Box<T>::grow` gives `["Box"]`. */
interface DeclaredName {
  node: SyntaxNode;
  name: string;
  qualifier: string[];
}

const FILE_SCOPE: Scope = { path: [], inClass: false };

const PROGRAM_ENTRY_NAMES = new Set(["main", "wmain", "WinMain", "wWinMain"]);

/** The files whose `main` starts a program; a header's is not one. */
const PROGRAM_FILE_EXTENSIONS = new Set([".c", ".cpp", ".cc", ".cxx"]);

/** The files read as C++, where a struct has members to list; `.c` and `.h` are read as C. */
const CPP_EXTENSIONS = new Set([".cpp", ".cc", ".cxx", ".hpp", ".hh", ".hxx", ".inl"]);

function isCppFile(absolutePath: string): boolean {
  return CPP_EXTENSIONS.has(path.extname(absolutePath).toLowerCase());
}

/** The kind each type specifier declares. */
const TYPE_SPECIFIER_KINDS = new Map([
  ["struct_specifier", "struct"],
  ["union_specifier", "union"],
  ["enum_specifier", "enum"],
  ["class_specifier", "class"]
]);

/** Declarators that wrap the one holding the name: `*name`, `&name`, `name[3]`, `name = 1`, `(name)`, `name(int)`. */
const WRAPPING_DECLARATORS = new Set([
  "pointer_declarator",
  "reference_declarator",
  "array_declarator",
  "init_declarator",
  "parenthesized_declarator",
  "attributed_declarator",
  "function_declarator"
]);

/** Comments and literals in a macro's body, which the grammar keeps as text. */
const MACRO_BODY_NOISE = /\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g;

function position(node: SyntaxNode): { line: number; character: number } {
  return { line: node.startPosition.row + 1, character: node.startPosition.column + 1 };
}

function isStatic(node: SyntaxNode): boolean {
  return node.namedChildren.some((child) => child.type === "storage_class_specifier" && child.text === "static");
}

function innerDeclarator(node: SyntaxNode): SyntaxNode | null {
  return node.childForFieldName("declarator") ?? node.namedChildren[0] ?? null;
}

/** The name a declarator declares, through the wrappers around it. */
function declaredName(declarator: SyntaxNode | null): DeclaredName | undefined {
  let current = declarator;
  while (current) {
    switch (current.type) {
      case "identifier":
      case "field_identifier":
      case "type_identifier":
      case "destructor_name":
      case "operator_name":
        return { node: current, name: current.text.replace(/\s+/g, " "), qualifier: [] };
      case "qualified_identifier": {
        const inner = declaredName(current.childForFieldName("name"));
        if (!inner) return undefined;
        const scope = current.childForFieldName("scope");
        const head = scope ? [scope.childForFieldName("name")?.text ?? scope.text] : [];
        return { ...inner, qualifier: [...head, ...inner.qualifier] };
      }
      case "template_function":
      case "template_method":
        current = current.childForFieldName("name");
        break;
      default:
        current = WRAPPING_DECLARATORS.has(current.type) ? innerDeclarator(current) : null;
    }
  }
  return undefined;
}

/** Whether a declarator declares a function rather than a pointer to one, which parenthesizes its name: `int (*callback)(int)`. */
function declaresFunction(declarator: SyntaxNode): boolean {
  let current: SyntaxNode | null = declarator;
  while (current && WRAPPING_DECLARATORS.has(current.type)) {
    if (current.type === "function_declarator") {
      return innerDeclarator(current)?.type !== "parenthesized_declarator";
    }
    current = innerDeclarator(current);
  }
  return false;
}

/** The identifiers in a macro's body, without its comments and literals; a number's suffix is not one. */
function macroBodyIdentifiers(body: string): string[] {
  return body.replace(MACRO_BODY_NOISE, " ").match(/(?<!\w)[A-Za-z_]\w*/g) ?? [];
}

class FileExtractor {
  private readonly facts: FileFacts = { includes: [], declarations: [], identifiers: new Set() };

  /** @param cpp - Whether the file is C++, whose structs and unions have members to list. */
  constructor(private readonly cpp: boolean) {}

  extract(root: SyntaxNode): FileFacts {
    this.readScope(root.namedChildren, FILE_SCOPE);
    this.collectIdentifiers(root);
    return this.facts;
  }

  /** The declarations of a file, a namespace, a linkage block, a conditional region or a class body. */
  private readScope(nodes: SyntaxNode[], scope: Scope, access?: Access): void {
    for (const node of nodes) {
      if (node.type === "access_specifier") {
        if (access) access.current = node.text;
        continue;
      }
      if (access && access.current !== "public") continue;
      this.readDeclaration(node, scope, node, access);
    }
  }

  /**
   * One declaration. `documented` is the node whose preceding comment
   * documents it: the template declaration around a templated one.
   */
  private readDeclaration(node: SyntaxNode, scope: Scope, documented: SyntaxNode, access?: Access): void {
    switch (node.type) {
      case "preproc_include":
        this.readInclude(node);
        break;
      case "preproc_def":
      case "preproc_function_def":
        this.declare(node.childForFieldName("name"), "const", FILE_SCOPE, documented);
        break;
      case "preproc_if":
      case "preproc_ifdef":
      case "preproc_elif":
      case "preproc_elifdef":
      case "preproc_else":
        this.readScope(node.namedChildren, scope, access);
        break;
      case "function_definition":
        if (scope.inClass || !isStatic(node)) {
          this.readCallable(node.childForFieldName("declarator"), scope, documented, true);
        }
        break;
      case "declaration":
      case "field_declaration":
        this.readDeclarators(node, scope, documented);
        break;
      case "struct_specifier":
      case "union_specifier":
      case "enum_specifier":
      case "class_specifier":
        this.readTypeSpecifier(node, scope, documented);
        break;
      case "type_definition":
        this.readTypedef(node, scope, documented);
        break;
      case "alias_declaration":
        this.declare(node.childForFieldName("name"), "type", scope, documented);
        break;
      case "namespace_definition":
        this.readNamespace(node, scope);
        break;
      case "linkage_specification": {
        const body = node.childForFieldName("body");
        if (body) this.readScope(body.type === "declaration_list" ? body.namedChildren : [body], scope);
        break;
      }
      case "template_declaration": {
        const inner = node.namedChildren[node.namedChildren.length - 1];
        if (inner) this.readDeclaration(inner, scope, documented);
        break;
      }
      default:
        break;
    }
  }

  private readInclude(node: SyntaxNode): void {
    const pathNode = node.childForFieldName("path");
    if (pathNode?.type === "string_literal") {
      this.facts.includes.push({ specifier: pathNode.text.slice(1, -1), system: false });
    } else if (pathNode?.type === "system_lib_string") {
      this.facts.includes.push({ specifier: pathNode.text.slice(1, -1), system: true });
    }
  }

  /** A function, a class's method or constructor, or, when defined at file scope, the program's entry. */
  private readCallable(declarator: SyntaxNode | null, scope: Scope, documented: SyntaxNode, isDefinition: boolean): void {
    const declared = declaredName(declarator);
    if (!declared) return;
    const owner = declared.qualifier.length > 0
      ? declared.qualifier[declared.qualifier.length - 1]
      : scope.inClass ? scope.path[scope.path.length - 1] : undefined;
    const kind = owner === undefined ? "function" : declared.name === owner ? "constructor" : "method";
    this.declare(declared.node, kind, scope, documented, declared.qualifier, declared.name);
    const isEntry = isDefinition && kind === "function" && scope.path.length === 0 && PROGRAM_ENTRY_NAMES.has(declared.name);
    if (isEntry && !this.facts.program) {
      this.facts.program = { symbol: declared.name, line: declared.node.startPosition.row + 1 };
    }
  }

  /**
   * The declarators of a declaration: prototypes, variables, a class's fields
   * and method prototypes; and the type it defines in passing, as
   * `struct tag { } instance;` and a class's nested types do.
   */
  private readDeclarators(node: SyntaxNode, scope: Scope, documented: SyntaxNode): void {
    if (!scope.inClass && isStatic(node)) return;
    const type = node.childForFieldName("type");
    if (type && TYPE_SPECIFIER_KINDS.has(type.type)) this.readTypeSpecifier(type, scope, documented);
    for (const declarator of node.childrenForFieldName("declarator")) {
      if (declaresFunction(declarator)) {
        this.readCallable(declarator, scope, documented, false);
        continue;
      }
      const declared = declaredName(declarator);
      if (declared) {
        this.declare(declared.node, scope.inClass ? "field" : "variable", scope, documented, declared.qualifier, declared.name);
      }
    }
  }

  /** A named struct, union, enum or class with a body; its public members follow it. */
  private readTypeSpecifier(node: SyntaxNode, scope: Scope, documented: SyntaxNode): void {
    const nameNode = node.childForFieldName("name");
    if (!nameNode || !node.childForFieldName("body")) return;
    this.declare(nameNode, TYPE_SPECIFIER_KINDS.get(node.type) ?? "type", scope, documented);
    this.readMembers(node, nameNode.text, scope);
  }

  /**
   * The public members of a type's body, under the name the type is known by:
   * a class's start private, and in a C++ file a struct's or union's start
   * public. A C struct's or union's body contributes nothing, nor does an
   * enum's.
   */
  private readMembers(specifier: SyntaxNode, typeName: string, scope: Scope): void {
    const body = specifier.childForFieldName("body");
    const access = specifier.type === "class_specifier"
      ? "private"
      : this.cpp && (specifier.type === "struct_specifier" || specifier.type === "union_specifier") ? "public" : undefined;
    if (!body || !access) return;
    this.readScope(body.namedChildren, { path: [...scope.path, typeName], inClass: true }, { current: access });
  }

  /**
   * A typedef: the tag it defines, when it defines one, then each name it
   * introduces. An anonymous struct, union or enum takes its typedef name and
   * kind; `typedef struct logger { } logger;` is one name, not two.
   */
  private readTypedef(node: SyntaxNode, scope: Scope, documented: SyntaxNode): void {
    const type = node.childForFieldName("type");
    const typeKind = type ? TYPE_SPECIFIER_KINDS.get(type.type) : undefined;
    const definesBody = typeKind !== undefined && type?.childForFieldName("body") !== null;
    const tag = definesBody ? type?.childForFieldName("name")?.text : undefined;
    if (type && typeKind) this.readTypeSpecifier(type, scope, documented);
    for (const declarator of node.childrenForFieldName("declarator")) {
      const declared = declaredName(declarator);
      if (!declared || declared.name === tag) continue;
      const kind = definesBody && tag === undefined && typeKind ? typeKind : "type";
      this.declare(declared.node, kind, scope, documented, [], declared.name);
      if (kind !== "type" && type) this.readMembers(type, declared.name, scope);
    }
  }

  /** A named namespace, `a::b` opening two; an anonymous one is the file's own and is left out. */
  private readNamespace(node: SyntaxNode, scope: Scope): void {
    const nameNode = node.childForFieldName("name");
    const body = node.childForFieldName("body");
    if (!nameNode || !body) return;
    const names = nameNode.text.split("::").map((part) => part.trim());
    this.readScope(body.namedChildren, { path: [...scope.path, ...names], inClass: false });
  }

  private declare(nameNode: SyntaxNode | null, kind: string, scope: Scope, documented: SyntaxNode, qualifier: string[] = [], name = nameNode?.text): void {
    if (!nameNode || !name) return;
    const scopes = [...scope.path, ...qualifier];
    this.facts.declarations.push({
      name,
      qualifiedName: scopes.length > 0 ? [...scopes, name].join(".") : undefined,
      kind,
      member: scope.inClass || qualifier.length > 0,
      ...position(nameNode),
      documentation: docCommentOf(documented)
    });
  }

  /** Every identifier the code mentions, macro bodies included; a macro's own name and parameters are not uses. */
  private collectIdentifiers(node: SyntaxNode): void {
    switch (node.type) {
      case "identifier":
      case "type_identifier":
        this.facts.identifiers.add(node.text);
        return;
      case "preproc_def":
      case "preproc_function_def":
        for (const identifier of macroBodyIdentifiers(node.childForFieldName("value")?.text ?? "")) {
          this.facts.identifiers.add(identifier);
        }
        return;
      case "preproc_arg":
      case "comment":
      case "string_literal":
      case "char_literal":
      case "raw_string_literal":
      case "system_lib_string":
        return;
      default:
        for (const child of node.namedChildren) this.collectIdentifiers(child);
    }
  }
}

// ---------------------------------------------------------------------------
// Doxygen comments
// ---------------------------------------------------------------------------

const TAG_PATTERN = /^[@\\](\w+)\s*(.*)$/;

/** The comment immediately above a declaration, read as Doxygen; a plain comment there is its summary. */
function docCommentOf(node: SyntaxNode): SymbolDocumentation | undefined {
  const lines: string[] = [];
  let expectedRow = node.startPosition.row - 1;
  let previous = node.previousSibling;
  while (previous && previous.type === "comment" && previous.endPosition.row === expectedRow) {
    lines.unshift(...commentLines(previous.text));
    expectedRow = previous.startPosition.row - 1;
    previous = previous.previousSibling;
  }
  return parseDoxygen(lines);
}

/** A comment's lines without its marks: `//`, `///`, `//!`, the block openers `/*`, `/**` and `/*!`, the closer, and the `*` leading a block's lines. */
function commentLines(comment: string): string[] {
  if (comment.startsWith("//")) {
    return [comment.replace(/^\/\/[/!]?\s?/, "").trimEnd()];
  }
  return comment
    .replace(/^\/\*[*!]?/, "")
    .replace(/\*\/$/, "")
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trimEnd());
}

function parseDoxygen(rawLines: string[]): SymbolDocumentation | undefined {
  const lines = trimEmptyEdges(rawLines.map((line) => line.trimEnd()));
  if (lines.length === 0) return undefined;

  const documentation: SymbolDocumentation = { source: "doxygen" };
  const plainLines: string[] = [];
  let summaryExplicit = false;
  let example: { title?: string; lines: string[] } | undefined;

  const addRemark = (fragment: string): void => {
    documentation.remarks = documentation.remarks ? `${documentation.remarks}\n\n${fragment}` : fragment;
  };
  const endExample = (): void => {
    if (!example) return;
    const code = example.lines.join("\n").trimEnd();
    if (code) (documentation.examples ??= []).push({ description: example.title, code, language: "c" });
    example = undefined;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const tag = trimmed ? TAG_PATTERN.exec(trimmed) : null;
    if (!tag) {
      (example ? example.lines : plainLines).push(trimmed ? line : "");
      continue;
    }
    endExample();
    const name = tag[1].toLowerCase();
    const payload = tag[2].trim();
    switch (name) {
      case "brief":
        if (payload) {
          documentation.summary = documentation.summary ? `${documentation.summary}\n${payload}` : payload;
          summaryExplicit = true;
        }
        break;
      case "details":
      case "remark":
      case "remarks":
        if (payload) addRemark(payload);
        break;
      case "param": {
        const parameter = parseParam(payload);
        if (parameter) (documentation.parameters ??= []).push(parameter);
        break;
      }
      case "return":
      case "returns":
        if (payload) documentation.returns = documentation.returns ? `${documentation.returns}\n\n${payload}` : payload;
        break;
      case "throws":
      case "throw":
      case "exception": {
        const [type, ...description] = payload.split(/\s+/);
        if (type) (documentation.exceptions ??= []).push({ type, description: description.join(" ") || undefined });
        break;
      }
      case "note":
      case "warning":
      case "todo":
      case "deprecated":
      case "since":
        if (payload) addRemark(`${capitalize(name)}: ${payload}`);
        break;
      case "see": {
        const link = parseSeeTag(payload);
        if (link) addLink(documentation, link);
        break;
      }
      case "example":
      case "code":
        example = { title: payload || undefined, lines: [] };
        break;
      case "endcode":
        break;
      default:
        plainLines.push(line);
    }
  }
  endExample();

  const paragraphs = toParagraphs(plainLines);
  if (!summaryExplicit && paragraphs.length > 0) documentation.summary = paragraphs.shift();
  if (paragraphs.length > 0) addRemark(paragraphs.join("\n\n"));
  for (const link of linksInText(lines.join("\n"))) addLink(documentation, link);

  return hasContent(documentation) ? documentation : undefined;
}

function trimEmptyEdges(lines: string[]): string[] {
  let start = 0;
  while (start < lines.length && !lines[start].trim()) start += 1;
  let end = lines.length;
  while (end > start && !lines[end - 1].trim()) end -= 1;
  return lines.slice(start, end);
}

function toParagraphs(lines: string[]): string[] {
  const paragraphs: string[] = [];
  let buffer: string[] = [];
  for (const line of lines) {
    if (line.trim()) {
      buffer.push(line.trim());
    } else if (buffer.length > 0) {
      paragraphs.push(buffer.join(" "));
      buffer = [];
    }
  }
  if (buffer.length > 0) paragraphs.push(buffer.join(" "));
  return paragraphs;
}

/** `@param [in] name description`: the direction is dropped. */
function parseParam(payload: string): SymbolDocumentationParameter | undefined {
  const [name, ...description] = payload.replace(/^\[[^\]]+\]\s*/, "").split(/\s+/);
  if (!name) return undefined;
  return { name, description: description.join(" ") || undefined };
}

/** `@see target`, or `@see some words target`. */
function parseSeeTag(payload: string): SymbolDocumentationLink | undefined {
  const segments = payload.split(/\s+/).filter(Boolean);
  const target = segments.pop();
  if (!target) return undefined;
  return segments.length > 0 ? { kind: "href", target, text: segments.join(" ") } : { kind: "href", target };
}

/** Markdown links and bare URLs anywhere in the comment. */
function linksInText(text: string): SymbolDocumentationLink[] {
  const links: SymbolDocumentationLink[] = [];
  for (const match of text.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)) {
    links.push({ kind: "href", target: match[2], text: match[1] });
  }
  for (const match of text.matchAll(/https?:\/\/[^)\s]+/g)) {
    links.push({ kind: "href", target: match[0] });
  }
  return links;
}

function addLink(documentation: SymbolDocumentation, link: SymbolDocumentationLink): void {
  const links = (documentation.links ??= []);
  if (!links.some((existing) => existing.kind === link.kind && existing.target === link.target)) links.push(link);
}

function hasContent(documentation: SymbolDocumentation): boolean {
  return Boolean(
    documentation.summary ||
      documentation.remarks ||
      documentation.returns ||
      documentation.parameters?.length ||
      documentation.exceptions?.length ||
      documentation.examples?.length ||
      documentation.links?.length
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// ---------------------------------------------------------------------------
// Per-file facts, cached by modification time
// ---------------------------------------------------------------------------

const factsCache = new Map<string, { mtimeMs: number; facts: FileFacts }>();

async function extractFacts(content: string, absolutePath: string): Promise<FileFacts> {
  const tree = await parseSource("cpp", content);
  try {
    return new FileExtractor(isCppFile(absolutePath)).extract(tree.rootNode);
  } finally {
    tree.delete();
  }
}

async function fileFacts(absolutePath: string): Promise<FileFacts> {
  const stats = await fs.stat(absolutePath);
  const cached = factsCache.get(absolutePath);
  if (cached && cached.mtimeMs === stats.mtimeMs) return cached.facts;
  const facts = await extractFacts(await fs.readFile(absolutePath, "utf8"), absolutePath);
  factsCache.set(absolutePath, { mtimeMs: stats.mtimeMs, facts });
  return facts;
}

// ---------------------------------------------------------------------------
// Include resolution
// ---------------------------------------------------------------------------

/**
 * Where a quoted include is looked for, the compiler's `-I` flags being
 * unknown: the including file's directory only; that directory and each of
 * its ancestors up to the workspace root; the same, trying each directory's
 * `include/` and `src/` as well; or every directory of the workspace, nearest
 * first, a greedy rule that can pick a decoy.
 */
export type IncludeStrategy = "including-directory" | "ancestors" | "ancestors-with-include-directories" | "any-directory";

/** The strategy the adapter resolves includes with: the one that matched the compiler on every measured include (2026-10-16). The others stay for the measurement script. */
export const DEFAULT_INCLUDE_STRATEGY: IncludeStrategy = "ancestors-with-include-directories";

/** Directories a workspace walk never enters. */
const UNWALKED_DIRECTORIES = new Set([".git", "node_modules"]);

interface Listing {
  files: Set<string>;
  directories: Set<string>;
}

const listingCache = new Map<string, { mtimeMs: number; listing: Listing }>();

/** A directory's entries by exact name, read again when the directory changes: an include names a file case-sensitively even where the filesystem does not. */
function listingOf(directory: string): Listing | undefined {
  let mtimeMs: number;
  try {
    const stats = statSync(directory);
    if (!stats.isDirectory()) return undefined;
    mtimeMs = stats.mtimeMs;
  } catch {
    return undefined;
  }
  const cached = listingCache.get(directory);
  if (cached && cached.mtimeMs === mtimeMs) return cached.listing;
  const listing: Listing = { files: new Set(), directories: new Set() };
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    let isDirectory = entry.isDirectory();
    if (entry.isSymbolicLink()) {
      try {
        isDirectory = statSync(path.join(directory, entry.name)).isDirectory();
      } catch {
        continue;
      }
    }
    (isDirectory ? listing.directories : listing.files).add(entry.name);
  }
  listingCache.set(directory, { mtimeMs, listing });
  return listing;
}

/** Whether `relativePath` names a file under `workspaceRoot`, each segment spelled as on disk. */
function workspaceFileExists(workspaceRoot: string, relativePath: string): boolean {
  const segments = relativePath.split("/");
  const name = segments.pop() ?? "";
  let directory = workspaceRoot;
  for (const segment of segments) {
    if (!listingOf(directory)?.directories.has(segment)) return false;
    directory = path.join(directory, segment);
  }
  return listingOf(directory)?.files.has(name) ?? false;
}

/** Every directory of the workspace as a workspace-relative path, the root as `""`. */
function workspaceDirectories(workspaceRoot: string): string[] {
  const found: string[] = [];
  const walk = (relative: string): void => {
    found.push(relative);
    for (const name of listingOf(path.join(workspaceRoot, relative))?.directories ?? []) {
      if (!UNWALKED_DIRECTORIES.has(name)) walk(relative ? `${relative}/${name}` : name);
    }
  };
  walk("");
  return found;
}

/** The steps between two workspace-relative directories: up to their common ancestor, then down. */
function directoryDistance(from: string, to: string): number {
  const fromParts = from ? from.split("/") : [];
  const toParts = to ? to.split("/") : [];
  let shared = 0;
  while (shared < fromParts.length && shared < toParts.length && fromParts[shared] === toParts[shared]) shared += 1;
  return fromParts.length - shared + (toParts.length - shared);
}

/** The including file's directory and its ancestors, up to and including the workspace root. */
function ancestorDirectories(includingDirectory: string): string[] {
  const directories: string[] = [];
  let directory = includingDirectory;
  for (;;) {
    directories.push(directory);
    if (!directory) return directories;
    const parent = path.posix.dirname(directory);
    directory = parent === "." ? "" : parent;
  }
}

/** The directories an include is tried against under a strategy, in order. */
function baseDirectories(includingDirectory: string, workspaceRoot: string, strategy: IncludeStrategy): string[] {
  switch (strategy) {
    case "including-directory":
      return [includingDirectory];
    case "ancestors":
      return ancestorDirectories(includingDirectory);
    case "ancestors-with-include-directories":
      return ancestorDirectories(includingDirectory).flatMap((directory) => [
        directory,
        path.posix.join(directory, "include"),
        path.posix.join(directory, "src")
      ]);
    case "any-directory":
      return workspaceDirectories(workspaceRoot).sort(
        (left, right) => directoryDistance(includingDirectory, left) - directoryDistance(includingDirectory, right) || left.localeCompare(right)
      );
  }
}

/**
 * The workspace-relative path, with forward slashes, of the file a quoted
 * include names under a strategy, or undefined when none exists inside the
 * workspace. A specifier without an extension is also tried with `.h`.
 */
export function resolveInclude(options: { includingFile: string; workspaceRoot: string; specifier: string; strategy: IncludeStrategy }): string | undefined {
  const specifier = options.specifier.replace(/\\/g, "/");
  if (path.posix.isAbsolute(specifier)) return undefined;
  const includingDirectory = normalizeWorkspacePath(path.relative(options.workspaceRoot, path.dirname(options.includingFile)));
  const spellings = path.posix.extname(specifier) ? [specifier] : [specifier, `${specifier}.h`];
  for (const base of baseDirectories(includingDirectory, options.workspaceRoot, options.strategy)) {
    for (const spelling of spellings) {
      const candidate = path.posix.normalize(path.posix.join(base, spelling));
      if (candidate === ".." || candidate.startsWith("../")) continue;
      if (workspaceFileExists(options.workspaceRoot, candidate)) return candidate;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Adapter output
// ---------------------------------------------------------------------------

/** The declarations in source order, each type followed by its members, which a typedef names only after the body. */
function toSymbols(facts: FileFacts): PublicSymbolEntry[] {
  return facts.declarations.map((declared) => ({
    name: declared.name,
    kind: declared.kind,
    qualifiedName: declared.qualifiedName,
    location: { line: declared.line, character: declared.character },
    documentation: declared.documentation
  }));
}

/** The names the file uses that the header declares at file scope. */
async function usedNames(facts: FileFacts, headerPath: string): Promise<string[]> {
  let header: FileFacts;
  try {
    header = await fileFacts(headerPath);
  } catch {
    return [];
  }
  const names = new Set<string>();
  for (const declared of header.declarations) {
    if (!declared.member && facts.identifiers.has(declared.name)) names.add(declared.name);
  }
  return Array.from(names).sort();
}

async function toDependencies(facts: FileFacts, absolutePath: string, workspaceRoot: string, strategy: IncludeStrategy): Promise<DependencyEntry[]> {
  const dependencies = new Map<string, DependencyEntry>();
  for (const include of facts.includes) {
    const resolvedPath = include.system
      ? undefined
      : resolveInclude({ includingFile: absolutePath, workspaceRoot, specifier: include.specifier, strategy });
    const key = `${include.specifier}:${resolvedPath ?? ""}`;
    if (dependencies.has(key)) continue;
    dependencies.set(key, {
      specifier: include.specifier,
      resolvedPath,
      symbols: resolvedPath ? await usedNames(facts, path.join(workspaceRoot, resolvedPath)) : [],
      kind: "import"
    });
  }
  return Array.from(dependencies.values()).sort((left, right) => left.specifier.localeCompare(right.specifier));
}

/**
 * Analyzes one C or C++ file from its text, without the generator: its
 * symbols, its includes resolved under the strategy, and its program entry.
 */
export async function analyzeCSource(options: { content: string; absolutePath: string; workspaceRoot: string; strategy?: IncludeStrategy }): Promise<SourceAnalysisResult> {
  const strategy = options.strategy ?? DEFAULT_INCLUDE_STRATEGY;
  const facts = await extractFacts(options.content, options.absolutePath);
  const result: SourceAnalysisResult = {
    symbols: toSymbols(facts),
    dependencies: await toDependencies(facts, options.absolutePath, options.workspaceRoot, strategy)
  };
  if (facts.program && PROGRAM_FILE_EXTENSIONS.has(path.extname(options.absolutePath).toLowerCase())) {
    result.program = facts.program;
  }
  return result;
}

/** Language adapter for C and C++: tree-sitter symbols, `#include` dependencies with the names used from each header, and the program entry. */
export const cAdapter: LanguageAdapter = {
  id: "c-basic",
  extensions: cSyntax.extensions,
  async analyze({ absolutePath, workspaceRoot }): Promise<SourceAnalysisResult | null> {
    const content = await fs.readFile(absolutePath, "utf8");
    return analyzeCSource({ content, absolutePath, workspaceRoot });
  }
};
