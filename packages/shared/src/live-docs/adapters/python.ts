/**
 * Python adapter: tree-sitter symbols and import resolution across the workspace.
 *
 * A module's public symbols are its top-level classes, functions and assignments
 * and the public members of its classes (methods, properties, fields, nested
 * classes), with docstrings parsed by `python.docstring.ts`.
 *
 * Dependencies follow the language's import semantics rather than its text:
 *
 * - `from M import name` depends on M's own file and on the file where `name`
 *   is defined, followed through the `from .x import name` re-exports of a
 *   package's `__init__.py`; a name that is a submodule depends on that module.
 * - `import a.b.c [as m]` depends on module `a.b.c`, and `m.X` (or `a.b.c.X`)
 *   used anywhere in the file depends on where `X` is defined.
 * - `from M import *` depends on M and, for every public name of M the file
 *   uses, on where that name is defined.
 * - Imports inside functions and under `if TYPE_CHECKING:` count like any other;
 *   import text inside strings and comments does not, because the parser sees it
 *   for what it is.
 *
 * An absolute module is looked up, in order, beside the importing file, at the
 * root of the package the file belongs to, at the workspace root and under its
 * `src/`; a module found nowhere is recorded by name as an external dependency.
 */
import { promises as fs, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { pythonSyntax } from "../../languages";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult, SymbolDocumentation, TypeReference } from "../core";
import type { LanguageAdapter } from "./index";
import { parseDocstring } from "./python.docstring";
import { parseSource, type SyntaxNode } from "./treeSitter";

// ---------------------------------------------------------------------------
// Facts about one module
// ---------------------------------------------------------------------------

interface ImportedName {
  name:  string;
  alias: string;
}

/** One import statement, as written. `level` counts the leading dots of a relative import. */
interface ModuleImport {
  module:    string[];
  level:     number;
  /** The names of a `from` import; absent for `import M`. */
  names?:    ImportedName[];
  wildcard:  boolean;
  /** The `as` name of `import M as alias`. */
  alias?:    string;
}

interface Declared {
  name:           string;
  qualifiedName:  string;
  kind:           string;
  line:           number;
  character:      number;
  documentation?: SymbolDocumentation;
  typeReferences: TypeReference[];
  members:        Declared[];
}

interface ModuleFacts {
  imports:      ModuleImport[];
  declarations: Declared[];
  /** Every name bound at module level, public or not. */
  boundNames:   Set<string>;
  /** The names listed in `__all__`, when it is a literal list. */
  all?:         string[];
  /** Every bare identifier the module uses. */
  identifiers:  Set<string>;
  /** Every `a.b.c` chain the module uses, longest form only. */
  chains:       string[][];
}

const FUTURE_MODULE = "__future__";

function position(node: SyntaxNode): { line: number; character: number } {
  return { line: node.startPosition.row + 1, character: node.startPosition.column + 1 };
}

function dottedParts(node: SyntaxNode | null): string[] {
  if (!node) return [];
  if (node.type === "identifier") return [node.text];
  return node.namedChildren.filter((child) => child.type === "identifier").map((child) => child.text);
}

/** Reads an import statement into its module path and bound names. */
function readImport(node: SyntaxNode): ModuleImport[] {
  if (node.type === "import_statement") {
    const imports: ModuleImport[] = [];
    for (const child of node.namedChildren) {
      if (child.type === "dotted_name") {
        imports.push({ module: dottedParts(child), level: 0, wildcard: false });
      } else if (child.type === "aliased_import") {
        imports.push({ module: dottedParts(child.childForFieldName("name")), level: 0, wildcard: false, alias: child.childForFieldName("alias")?.text });
      }
    }
    return imports;
  }

  const moduleNode = node.childForFieldName("module_name");
  let level  = 0;
  let module: string[] = [];
  if (moduleNode?.type === "relative_import") {
    level  = moduleNode.namedChildren.find((child) => child.type === "import_prefix")?.text.length ?? 0;
    module = dottedParts(moduleNode.namedChildren.find((child) => child.type === "dotted_name") ?? null);
  } else {
    module = dottedParts(moduleNode);
  }

  const names: ImportedName[] = [];
  let wildcard = false;
  for (const child of node.namedChildren) {
    if (child.id === moduleNode?.id) continue;
    if (child.type === "dotted_name") {
      names.push({ name: child.text, alias: child.text });
    } else if (child.type === "aliased_import") {
      const name = child.childForFieldName("name")?.text ?? "";
      names.push({ name, alias: child.childForFieldName("alias")?.text ?? name });
    } else if (child.type === "wildcard_import") {
      wildcard = true;
    }
  }
  return [{ module, level, names, wildcard }];
}

/** Statements at module level, looking inside `if` and `try` blocks, whose bindings are module-level too. */
function* moduleStatements(block: SyntaxNode): Generator<SyntaxNode> {
  for (const statement of block.namedChildren) {
    if (statement.type === "if_statement" || statement.type === "try_statement") {
      for (const child of statement.namedChildren) {
        if (child.type === "block") {
          yield* moduleStatements(child);
        } else if (child.type.endsWith("_clause")) {
          const inner = child.namedChildren.find((grandchild) => grandchild.type === "block");
          if (inner) yield* moduleStatements(inner);
        }
      }
    } else {
      yield statement;
    }
  }
}

function docstringOf(body: SyntaxNode | null): SymbolDocumentation | undefined {
  const first = body?.namedChildren[0];
  const text  = first?.type === "expression_statement" && first.namedChildren[0]?.type === "string"
    ? first.namedChildren[0].namedChildren.filter((child) => child.type === "string_content").map((child) => child.text).join("")
    : undefined;
  const normalized = text ? normalizeDocstring(text) : "";
  return normalized ? parseDocstring(normalized) : undefined;
}

/** Trims a docstring's blank edges and removes the indentation its position in the source gave it. */
function normalizeDocstring(raw: string): string {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  while (lines.length > 0 && !lines[0].trim()) lines.shift();
  while (lines.length > 0 && !lines[lines.length - 1].trim()) lines.pop();
  if (lines.length === 0) return "";

  let indent = Infinity;
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    indent = Math.min(indent, line.match(/^\s*/)![0].length);
  }
  const body = lines.map((line, index) => (index === 0 || !Number.isFinite(indent) ? line.trim() : line.slice(indent)));
  return body.join("\n").trim();
}

/** The names a type annotation mentions, minus builtins; names inside `[...]` are type arguments. */
function typeNames(node: SyntaxNode, role: TypeReference["role"], parameterName?: string, into: TypeReference[] = []): TypeReference[] {
  const add = (name: string, nameRole: TypeReference["role"]) => {
    if (pythonSyntax.isFrameworkType(name) || name === "None") return;
    if (into.some((reference) => reference.name === name && reference.role === nameRole && reference.parameterName === parameterName)) return;
    into.push(parameterName ? { name, role: nameRole, parameterName } : { name, role: nameRole });
  };
  const visit = (current: SyntaxNode, currentRole: TypeReference["role"]): void => {
    switch (current.type) {
      case "identifier":
        add(current.text, currentRole);
        return;
      case "attribute":
        add(current.text, currentRole);
        return;
      case "string":
        add(current.namedChildren.filter((child) => child.type === "string_content").map((child) => child.text).join(""), currentRole);
        return;
      case "type_parameter":
        for (const child of current.namedChildren) visit(child, "type-argument");
        return;
      case "subscript": {
        const value = current.childForFieldName("value");
        if (value) visit(value, currentRole);
        for (const child of current.namedChildren) {
          if (child !== value) visit(child, "type-argument");
        }
        return;
      }
      default:
        for (const child of current.namedChildren) visit(child, currentRole);
    }
  };
  visit(node, role);
  return into;
}

function decoratorNames(node: SyntaxNode): string[] {
  return node.namedChildren
    .filter((child) => child.type === "decorator")
    .map((child) => child.namedChildren[0])
    .map((expression) => (expression?.type === "call" ? expression.childForFieldName("function")?.text : expression?.text) ?? "");
}

/** Reads a class or function definition, with its members when it is a class. */
function readDefinition(statement: SyntaxNode, scope: string[], insideClass: boolean): Declared | undefined {
  let node       = statement;
  let decorators: string[] = [];
  if (statement.type === "decorated_definition") {
    decorators = decoratorNames(statement);
    node       = statement.childForFieldName("definition") ?? statement;
  }
  if (node.type !== "class_definition" && node.type !== "function_definition") return undefined;
  if (decorators.some((name) => name.endsWith(".setter") || name.endsWith(".deleter"))) return undefined;

  const nameNode = node.childForFieldName("name");
  if (!nameNode) return undefined;
  const name          = nameNode.text;
  const qualifiedName = [...scope, name].join(".");
  const body          = node.childForFieldName("body");
  const { line, character } = position(nameNode);

  if (node.type === "class_definition") {
    const typeReferences: TypeReference[] = [];
    for (const base of node.childForFieldName("superclasses")?.namedChildren ?? []) {
      if (base.type === "keyword_argument") continue;
      typeNames(base, "extends", undefined, typeReferences);
    }
    const members: Declared[] = [];
    for (const child of body?.namedChildren ?? []) {
      const member = readMember(child, [...scope, name]);
      if (member && !members.some((existing) => existing.name === member.name)) members.push(member);
    }
    return { name, qualifiedName, kind: "class", line, character, documentation: docstringOf(body), typeReferences, members };
  }

  const kind = decorators.includes("property") ? "property" : insideClass ? "method" : "function";
  const typeReferences: TypeReference[] = [];
  for (const parameter of node.childForFieldName("parameters")?.namedChildren ?? []) {
    const type = parameter.childForFieldName("type");
    if (!type) continue;
    const parameterName = parameter.childForFieldName("name")?.text ?? parameter.namedChildren[0]?.text;
    typeNames(type, "parameter", parameterName, typeReferences);
  }
  const returnType = node.childForFieldName("return_type");
  if (returnType) typeNames(returnType, "return", undefined, typeReferences);
  return { name, qualifiedName, kind, line, character, documentation: docstringOf(body), typeReferences, members: [] };
}

function readMember(statement: SyntaxNode, scope: string[]): Declared | undefined {
  const assigned = readAssignment(statement, scope, "field");
  return assigned ?? readDefinition(statement, scope, true);
}

/** A module-level or class-level assignment to one plain name. */
function readAssignment(statement: SyntaxNode, scope: string[], kind: string): Declared | undefined {
  const assignment = statement.type === "expression_statement" ? statement.namedChildren[0] : undefined;
  if (assignment?.type !== "assignment") return undefined;
  const left = assignment.childForFieldName("left");
  if (left?.type !== "identifier") return undefined;
  const type = assignment.childForFieldName("type");
  const { line, character } = position(left);
  return {
    name:           left.text,
    qualifiedName:  [...scope, left.text].join("."),
    kind,
    line,
    character,
    typeReferences: type ? typeNames(type, "property") : [],
    members:        []
  };
}

function readAll(statement: SyntaxNode): string[] | undefined {
  const assignment = statement.type === "expression_statement" ? statement.namedChildren[0] : undefined;
  if (assignment?.type !== "assignment" || assignment.childForFieldName("left")?.text !== "__all__") return undefined;
  const right = assignment.childForFieldName("right");
  if (right?.type !== "list" && right?.type !== "tuple") return undefined;
  return right.namedChildren
    .filter((child) => child.type === "string")
    .map((child) => child.namedChildren.filter((part) => part.type === "string_content").map((part) => part.text).join(""));
}

/** Collects every identifier and attribute chain used anywhere in the module. */
function collectUses(root: SyntaxNode, facts: ModuleFacts): void {
  const visit = (node: SyntaxNode): void => {
    if (node.type === "import_statement" || node.type === "import_from_statement" || node.type === "future_import_statement") return;
    if (node.type === "attribute") {
      const chain = attributeChain(node);
      if (chain) {
        facts.chains.push(chain);
        facts.identifiers.add(chain[0]);
        return;
      }
    }
    if (node.type === "identifier") {
      facts.identifiers.add(node.text);
      return;
    }
    for (const child of node.namedChildren) visit(child);
  };
  visit(root);
}

function attributeChain(node: SyntaxNode): string[] | undefined {
  const object    = node.childForFieldName("object");
  const attribute = node.childForFieldName("attribute");
  if (!object || !attribute) return undefined;
  if (object.type === "identifier") return [object.text, attribute.text];
  if (object.type === "attribute") {
    const inner = attributeChain(object);
    return inner ? [...inner, attribute.text] : undefined;
  }
  return undefined;
}

async function extractFacts(source: string): Promise<ModuleFacts> {
  const tree  = await parseSource("python", source);
  const facts: ModuleFacts = { imports: [], declarations: [], boundNames: new Set(), identifiers: new Set(), chains: [] };
  try {
    const root = tree.rootNode;

    const visitImports = (node: SyntaxNode): void => {
      if (node.type === "import_statement" || node.type === "import_from_statement") {
        facts.imports.push(...readImport(node));
        return;
      }
      for (const child of node.namedChildren) visitImports(child);
    };
    visitImports(root);

    for (const statement of moduleStatements(root)) {
      const all = readAll(statement);
      if (all) {
        facts.all = all;
        continue;
      }
      const declared = readAssignment(statement, [], "variable") ?? readDefinition(statement, [], false);
      if (!declared) continue;
      facts.boundNames.add(declared.name);
      if (!facts.declarations.some((existing) => existing.name === declared.name)) facts.declarations.push(declared);
    }
    for (const entry of facts.imports) {
      for (const name of entry.names ?? []) facts.boundNames.add(name.alias);
      if (!entry.names) facts.boundNames.add(entry.alias ?? entry.module[0]);
    }

    collectUses(root, facts);
  } finally {
    tree.delete();
  }
  return facts;
}

// ---------------------------------------------------------------------------
// Workspace: module facts by file, and import resolution
// ---------------------------------------------------------------------------

const factsCache = new Map<string, { mtimeMs: number; facts: Promise<ModuleFacts> }>();

async function moduleFacts(absolutePath: string): Promise<ModuleFacts> {
  const mtimeMs = statSync(absolutePath).mtimeMs;
  const cached  = factsCache.get(absolutePath);
  if (cached && cached.mtimeMs === mtimeMs) return cached.facts;
  const facts = fs.readFile(absolutePath, "utf8").then(extractFacts);
  factsCache.set(absolutePath, { mtimeMs, facts });
  return facts;
}

const directoryCache = new Map<string, { mtimeMs: number; entries: Set<string> }>();

/** The entries of a directory, cached until the directory changes. */
function directoryEntries(directory: string): Set<string> {
  let mtimeMs: number;
  try {
    mtimeMs = statSync(directory).mtimeMs;
  } catch {
    return new Set();
  }
  const cached = directoryCache.get(directory);
  if (cached && cached.mtimeMs === mtimeMs) return cached.entries;
  const entries = new Set(readdirSync(directory));
  directoryCache.set(directory, { mtimeMs, entries });
  return entries;
}

/** Whether `candidate` exists as a file with exactly that name: Python imports are case-sensitive even where the filesystem is not. */
function isFile(candidate: string): boolean {
  if (!directoryEntries(path.dirname(candidate)).has(path.basename(candidate))) return false;
  try {
    return statSync(candidate).isFile();
  } catch {
    return false;
  }
}

/** The file for module `parts` under `base`: `a/b.py`, else `a/b/__init__.py`; `base/__init__.py` for no parts. */
function probeModule(base: string, parts: string[]): string | undefined {
  if (parts.length === 0) {
    const init = path.join(base, "__init__.py");
    return isFile(init) ? init : undefined;
  }
  const stem = path.join(base, ...parts);
  if (isFile(`${stem}.py`)) return `${stem}.py`;
  const init = path.join(stem, "__init__.py");
  return isFile(init) ? init : undefined;
}

/** Where an absolute import is looked up from `importer`, in order. */
function importRoots(importer: string, workspaceRoot: string): string[] {
  const directory = path.dirname(importer);
  const roots     = [directory];
  if (isFile(path.join(directory, "__init__.py"))) {
    let top = directory;
    while (path.dirname(top) !== top && isFile(path.join(path.dirname(top), "__init__.py"))) top = path.dirname(top);
    roots.push(path.dirname(top));
  }
  roots.push(workspaceRoot, path.join(workspaceRoot, "src"));
  return Array.from(new Set(roots));
}

function resolveModule(entry: ModuleImport, importer: string, workspaceRoot: string): string | undefined {
  if (entry.level > 0) {
    let base = path.dirname(importer);
    for (let up = 1; up < entry.level; up += 1) base = path.dirname(base);
    return probeModule(base, entry.module);
  }
  if (entry.module[0] === FUTURE_MODULE) return undefined;
  for (const root of importRoots(importer, workspaceRoot)) {
    const found = probeModule(root, entry.module);
    if (found) return found;
  }
  return undefined;
}

/** For a package's `__init__.py`, the file of its submodule `name`; otherwise nothing. */
function submoduleOf(moduleFile: string, name: string): string | undefined {
  return path.basename(moduleFile) === "__init__.py" ? probeModule(path.dirname(moduleFile), [name]) : undefined;
}

interface Origin {
  file:  string;
  name?: string;
}

/** The public names of a module: `__all__` when it says, else every bound name without a leading underscore. */
async function publicNames(moduleFile: string): Promise<Set<string>> {
  const facts = await moduleFacts(moduleFile);
  return new Set(facts.all ?? Array.from(facts.boundNames).filter((name) => !name.startsWith("_")));
}

/** Where `name`, as exported by `moduleFile`, is defined: the module itself, a submodule, or the file a re-export leads to. */
async function originOf(moduleFile: string, name: string, workspaceRoot: string, seen = new Set<string>()): Promise<Origin | undefined> {
  const key = `${moduleFile}|${name}`;
  if (seen.has(key)) return undefined;
  seen.add(key);

  const facts = await moduleFacts(moduleFile);
  if (facts.boundNames.has(name) && facts.declarations.some((declared) => declared.name === name)) {
    return { file: moduleFile, name };
  }

  for (const entry of facts.imports) {
    if (entry.names) {
      const imported = entry.names.find((candidate) => candidate.alias === name);
      if (!imported) continue;
      const target = resolveModule(entry, moduleFile, workspaceRoot);
      if (!target) return undefined;
      const submodule = submoduleOf(target, imported.name);
      return submodule ? { file: submodule } : originOf(target, imported.name, workspaceRoot, seen);
    }
    if ((entry.alias ?? entry.module[0]) === name) {
      const target = resolveModule(entry, moduleFile, workspaceRoot);
      return target ? { file: target } : undefined;
    }
  }

  const submodule = submoduleOf(moduleFile, name);
  if (submodule) return { file: submodule };

  for (const entry of facts.imports) {
    if (!entry.wildcard) continue;
    const target = resolveModule(entry, moduleFile, workspaceRoot);
    if (!target || !(await publicNames(target)).has(name)) continue;
    const origin = await originOf(target, name, workspaceRoot, seen);
    if (origin) return origin;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Adapter output
// ---------------------------------------------------------------------------

function published(declared: Declared): boolean {
  return !declared.name.startsWith("_");
}

/** A name bound to a module by an import: `import a.b.c` binds `a` to the whole path, `import a.b.c as m` and `from a.b import c` bind one name. */
interface ModuleBinding {
  module: string[];
  file:   string;
  alias:  boolean;
}

/** A type written through a module binding (`money.Money`, `a.b.c.X`) is the symbol behind it. */
function unqualified(name: string, bindings: Map<string, ModuleBinding>): string {
  const chain   = name.split(".");
  const binding = bindings.get(chain[0]);
  if (!binding || chain.length < 2) return name;
  if (binding.alias) return chain.slice(1).join(".");
  if (chain.length > binding.module.length && binding.module.every((part, index) => chain[index] === part)) {
    return chain.slice(binding.module.length).join(".");
  }
  return name;
}

function toSymbols(facts: ModuleFacts, bindings: Map<string, ModuleBinding>): PublicSymbolEntry[] {
  const entries: PublicSymbolEntry[] = [];
  const add = (declared: Declared): void => {
    if (!published(declared)) return;
    const typeReferences = declared.typeReferences.map((reference) => ({ ...reference, name: unqualified(reference.name, bindings) }));
    entries.push({
      name:           declared.name,
      kind:           declared.kind,
      qualifiedName:  declared.qualifiedName !== declared.name ? declared.qualifiedName : undefined,
      location:       { line: declared.line, character: declared.character },
      documentation:  declared.documentation,
      typeReferences: typeReferences.length > 0 ? typeReferences : undefined
    });
    for (const member of declared.members) add(member);
  };
  for (const declared of facts.declarations) add(declared);
  return entries.sort((left, right) =>
    (left.location!.line - right.location!.line) ||
    (left.location!.character - right.location!.character) ||
    left.name.localeCompare(right.name)
  );
}

function specifierOf(entry: ModuleImport): string {
  return `${".".repeat(entry.level)}${entry.module.join(".")}`;
}

async function toDependencies(
  facts: ModuleFacts,
  absolutePath: string,
  workspaceRoot: string
): Promise<{ dependencies: DependencyEntry[]; bindings: Map<string, ModuleBinding> }> {
  const byFile   = new Map<string, { specifier?: string; symbols: Set<string> }>();
  const external = new Map<string, Set<string>>();
  const bindings = new Map<string, ModuleBinding>();

  const link = (file: string, symbol?: string, specifier?: string): void => {
    if (file === absolutePath) return;
    const target = byFile.get(file) ?? { symbols: new Set<string>() };
    target.specifier ??= specifier;
    if (symbol) target.symbols.add(symbol);
    byFile.set(file, target);
  };
  const linkOrigin = (origin: Origin | undefined): void => {
    if (origin) link(origin.file, origin.name);
  };

  for (const entry of facts.imports) {
    if (entry.level === 0 && entry.module[0] === FUTURE_MODULE) continue;
    const specifier  = specifierOf(entry);
    const moduleFile = resolveModule(entry, absolutePath, workspaceRoot);
    if (!moduleFile) {
      const symbols = external.get(specifier) ?? new Set<string>();
      for (const name of entry.names ?? []) symbols.add(name.name);
      external.set(specifier, symbols);
      continue;
    }

    link(moduleFile, undefined, specifier);
    if (!entry.names) {
      bindings.set(entry.alias ?? entry.module[0], { module: entry.module, file: moduleFile, alias: Boolean(entry.alias) });
      continue;
    }
    for (const imported of entry.names) {
      const submodule = submoduleOf(moduleFile, imported.name);
      if (submodule) {
        link(submodule, undefined, `${specifier}.${imported.name}`);
        bindings.set(imported.alias, { module: [...entry.module, imported.name], file: submodule, alias: true });
      } else {
        linkOrigin(await originOf(moduleFile, imported.name, workspaceRoot));
      }
    }
    if (entry.wildcard) {
      for (const name of await publicNames(moduleFile)) {
        if (facts.identifiers.has(name)) linkOrigin(await originOf(moduleFile, name, workspaceRoot));
      }
    }
  }

  for (const chain of facts.chains) {
    const binding = bindings.get(chain[0]);
    if (!binding) continue;
    let symbol: string | undefined;
    if (binding.alias) {
      symbol = chain[1];
    } else if (binding.module.every((part, index) => chain[index] === part)) {
      symbol = chain[binding.module.length];
    }
    if (symbol) linkOrigin(await originOf(binding.file, symbol, workspaceRoot));
  }

  const dependencies: DependencyEntry[] = Array.from(byFile.entries())
    .map(([file, target]) => {
      const relative = normalizeWorkspacePath(path.relative(workspaceRoot, file));
      return { specifier: target.specifier ?? relative, resolvedPath: relative, symbols: Array.from(target.symbols).sort(), kind: "import" as const };
    })
    .sort((left, right) => left.resolvedPath.localeCompare(right.resolvedPath));

  for (const [specifier, symbols] of Array.from(external.entries()).sort(([left], [right]) => left.localeCompare(right))) {
    dependencies.push({ specifier, symbols: Array.from(symbols).sort(), kind: "import" });
  }
  return { dependencies, bindings };
}

/** Language adapter for Python (`.py`): tree-sitter symbols and import resolution that follows re-exports to where a name is defined. */
export const pythonAdapter: LanguageAdapter = {
  id:         "python",
  extensions: [".py"],
  async analyze({ absolutePath, workspaceRoot }): Promise<SourceAnalysisResult | null> {
    const facts = await moduleFacts(absolutePath);
    const { dependencies, bindings } = await toDependencies(facts, absolutePath, workspaceRoot);
    return { symbols: toSymbols(facts, bindings), dependencies };
  }
};
