/**
 * Go adapter: tree-sitter symbols and package-aware name resolution across the
 * module.
 *
 * A file's symbols are its package-level declarations (functions, types,
 * constants, variables), exported or not, since every file of the package can
 * use them; the exported methods and fields of its types; and the methods of
 * its interfaces, each with the doc comment above it.
 *
 * Dependencies follow the language's rules. A file belongs to the package its
 * `package` clause names, together with the other files of its directory that
 * name the same package, and uses their declarations without qualification; a
 * name declared inside the function shadows them. An import names a package by
 * path, resolved through the nearest `go.mod` to a directory of the workspace,
 * and `pkg.Name` depends on the file of that package that declares `Name`. A
 * dot import brings the package's exported names into scope; a blank import
 * depends on the whole package. A path that resolves to no directory is
 * external, and one whose first element has no dot is the standard library and
 * is not listed. Names inside strings and comments are never references.
 */
import { glob } from "glob";
import { promises as fs } from "node:fs";
import path from "node:path";

import { goSyntax } from "../../languages";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult, SymbolDocumentation, TypeReference } from "../core";
import type { LanguageAdapter, WorkspaceFileIndex } from "./index";
import { parseSource, type SyntaxNode } from "./treeSitter";

// ---------------------------------------------------------------------------
// Facts about one file
// ---------------------------------------------------------------------------

interface GoImport {
  path:  string;
  /** The `as` name; the package's own name is used when absent. */
  name?: string;
  dot:   boolean;
  blank: boolean;
}

interface Declared {
  name:           string;
  /** `Type.Method` or `Type.Field` for members. */
  qualifiedName?: string;
  kind:           string;
  line:           number;
  character:      number;
  documentation?: SymbolDocumentation;
  typeReferences: TypeReference[];
}

/** `pkg.Name` or a bare `Name`, with the names the enclosing function declares. */
interface NameUse {
  head?:  string;
  name:   string;
  locals: Set<string>;
}

interface FileFacts {
  packageName:   string;
  imports:       GoImport[];
  declarations:  Declared[];
  /** Every package-level name the file declares, exported or not. */
  declaredNames: Set<string>;
  hasInit:       boolean;
  uses:          NameUse[];
}

const NO_LOCALS = new Set<string>();

function position(node: SyntaxNode): { line: number; character: number } {
  return { line: node.startPosition.row + 1, character: node.startPosition.column + 1 };
}

function isExported(name: string): boolean {
  return /^\p{Lu}/u.test(name);
}

/** The `//` and `/* *\/` comments immediately above a declaration, as documentation. */
function docCommentOf(node: SyntaxNode): SymbolDocumentation | undefined {
  const lines: string[] = [];
  let expectedRow = node.startPosition.row - 1;
  let previous    = node.previousSibling;
  while (previous && previous.type === "comment" && previous.endPosition.row === expectedRow) {
    lines.unshift(...previous.text.replace(/^\/\*|\*\/$/g, "").split("\n").map((line) => line.replace(/^\s*\/\/ ?/, "").replace(/^\s*\* ?/, "").trimEnd()));
    expectedRow = previous.startPosition.row - 1;
    previous    = previous.previousSibling;
  }
  while (lines.length > 0 && !lines[0].trim()) lines.shift();
  while (lines.length > 0 && !lines[lines.length - 1].trim()) lines.pop();
  if (lines.length === 0) return undefined;
  const blank    = lines.findIndex((line) => !line.trim());
  const summary  = (blank === -1 ? lines : lines.slice(0, blank)).join(" ").trim();
  const remarks  = blank === -1 ? "" : lines.slice(blank + 1).join("\n").trim();
  return { source: "godoc", summary: summary || undefined, remarks: remarks || undefined };
}

class FileExtractor {
  private readonly facts: FileFacts = { packageName: "", imports: [], declarations: [], declaredNames: new Set(), hasInit: false, uses: [] };

  extract(root: SyntaxNode): FileFacts {
    for (const child of root.namedChildren) {
      switch (child.type) {
        case "package_clause":
          this.facts.packageName = child.namedChildren.find((part) => part.type === "package_identifier")?.text ?? "";
          break;
        case "import_declaration":
          this.readImports(child);
          break;
        case "function_declaration":
          this.readFunction(child);
          break;
        case "method_declaration":
          this.readMethod(child);
          break;
        case "type_declaration":
          for (const spec of child.namedChildren) this.readTypeSpec(spec);
          break;
        case "const_declaration":
        case "var_declaration":
          this.readValues(child, child.type === "const_declaration" ? "constant" : "variable");
          break;
        default:
          break;
      }
    }
    return this.facts;
  }

  private readImports(node: SyntaxNode): void {
    const specs = node.namedChildren.flatMap((child) => (child.type === "import_spec_list" ? child.namedChildren : [child]));
    for (const spec of specs) {
      if (spec.type !== "import_spec") continue;
      const pathNode = spec.childForFieldName("path");
      const importPath = pathNode?.namedChildren.map((part) => part.text).join("") ?? pathNode?.text.replace(/^"|"$/g, "");
      if (!importPath) continue;
      const nameNode = spec.childForFieldName("name");
      this.facts.imports.push({
        path:  importPath,
        name:  nameNode?.type === "package_identifier" ? nameNode.text : undefined,
        dot:   nameNode?.type === "dot",
        blank: nameNode?.type === "blank_identifier"
      });
    }
  }

  private readFunction(node: SyntaxNode): void {
    const nameNode = node.childForFieldName("name")!;
    const name     = nameNode.text;
    if (name === "init") this.facts.hasInit = true;
    else this.facts.declaredNames.add(name);
    const typeParameters = this.typeParameterNames(node);
    const typeReferences = this.signatureReferences(node, typeParameters);
    this.facts.declarations.push({ name, kind: "function", ...position(nameNode), documentation: docCommentOf(node), typeReferences });
    this.visitFunction(node, typeParameters);
  }

  private readMethod(node: SyntaxNode): void {
    const nameNode = node.childForFieldName("name")!;
    const receiver = node.childForFieldName("receiver")?.namedChildren[0];
    const receiverType = receiver ? this.baseTypeName(receiver.childForFieldName("type")) : undefined;
    const typeParameters = this.typeParameterNames(node);
    const typeReferences = this.signatureReferences(node, typeParameters);
    this.facts.declarations.push({
      name:          nameNode.text,
      qualifiedName: receiverType ? `${receiverType}.${nameNode.text}` : undefined,
      kind:          "method",
      ...position(nameNode),
      documentation: docCommentOf(node),
      typeReferences
    });
    if (receiverType) this.facts.uses.push({ name: receiverType, locals: NO_LOCALS });
    this.visitFunction(node, typeParameters);
  }

  private readTypeSpec(spec: SyntaxNode): void {
    if (spec.type !== "type_spec" && spec.type !== "type_alias") return;
    const nameNode = spec.childForFieldName("name")!;
    const name     = nameNode.text;
    const type     = spec.childForFieldName("type");
    const typeParameters = this.typeParameterNames(spec);
    this.facts.declaredNames.add(name);
    const declaration = spec.parent?.type === "type_declaration" && spec.parent.namedChildren.length === 1 ? spec.parent : spec;
    const typeReferences: TypeReference[] = [];
    let kind = "type";
    if (type?.type === "struct_type") {
      kind = "struct";
      for (const field of type.namedChildren.flatMap((list) => list.namedChildren)) {
        if (field.type !== "field_declaration") continue;
        const fieldType = field.childForFieldName("type");
        const names = field.namedChildren.filter((child) => child.type === "field_identifier");
        if (names.length === 0 && fieldType) {
          this.collectTypeNames(fieldType, "extends", typeReferences, typeParameters);
          continue;
        }
        const fieldReferences: TypeReference[] = [];
        if (fieldType) this.collectTypeNames(fieldType, "property", fieldReferences, typeParameters);
        for (const fieldName of names) {
          this.facts.declarations.push({ name: fieldName.text, qualifiedName: `${name}.${fieldName.text}`, kind: "field", ...position(fieldName), documentation: docCommentOf(field), typeReferences: fieldReferences });
        }
      }
    } else if (type?.type === "interface_type") {
      kind = "interface";
      for (const element of type.namedChildren) {
        if (element.type === "method_elem") {
          const methodName = element.childForFieldName("name")!;
          const methodReferences = this.signatureReferences(element, typeParameters);
          this.facts.declarations.push({ name: methodName.text, qualifiedName: `${name}.${methodName.text}`, kind: "method", ...position(methodName), documentation: docCommentOf(element), typeReferences: methodReferences });
        } else {
          this.collectTypeNames(element, "extends", typeReferences, typeParameters);
        }
      }
    } else if (type) {
      if (type.type === "function_type") {
        typeReferences.push(...this.signatureReferences(type, typeParameters));
      } else {
        this.collectTypeNames(type, "extends", typeReferences, typeParameters);
      }
    }
    this.facts.declarations.push({ name, kind, ...position(nameNode), documentation: docCommentOf(declaration), typeReferences });
  }

  private readValues(node: SyntaxNode, kind: string): void {
    const specs = node.namedChildren.flatMap((child) => (child.type === "var_spec_list" ? child.namedChildren : [child]));
    for (const spec of specs) {
      if (spec.type !== "var_spec" && spec.type !== "const_spec") continue;
      const type = spec.childForFieldName("type");
      const typeReferences: TypeReference[] = [];
      if (type) this.collectTypeNames(type, "property", typeReferences, []);
      const value = spec.childForFieldName("value");
      if (value) this.visitExpressions(value, NO_LOCALS);
      const declaration = specs.length === 1 && spec.parent?.type !== "var_spec_list" ? node : spec;
      for (const nameNode of spec.namedChildren.filter((child) => child.type === "identifier")) {
        if (nameNode.text === "_") continue;
        this.facts.declaredNames.add(nameNode.text);
        this.facts.declarations.push({ name: nameNode.text, kind, ...position(nameNode), documentation: docCommentOf(declaration), typeReferences });
      }
    }
  }

  private typeParameterNames(node: SyntaxNode): string[] {
    return (node.childForFieldName("type_parameters")?.namedChildren ?? [])
      .flatMap((parameter) => parameter.namedChildren.filter((child) => child.type === "identifier").map((child) => child.text));
  }

  /** Parameter, result and constraint types of a function, method or signature. */
  private signatureReferences(node: SyntaxNode, typeParameters: string[]): TypeReference[] {
    const references: TypeReference[] = [];
    for (const parameter of node.childForFieldName("type_parameters")?.namedChildren ?? []) {
      const constraint = parameter.childForFieldName("type");
      if (constraint) this.collectTypeNames(constraint, "generic-constraint", references, typeParameters);
    }
    for (const parameter of node.childForFieldName("parameters")?.namedChildren ?? []) {
      const type = parameter.childForFieldName("type");
      if (!type) continue;
      const names = parameter.namedChildren.filter((child) => child.type === "identifier").map((child) => child.text);
      if (names.length === 0) this.collectTypeNames(type, "parameter", references, typeParameters);
      for (const parameterName of names) this.collectTypeNames(type, "parameter", references, typeParameters, parameterName);
    }
    const result = node.childForFieldName("result");
    if (result?.type === "parameter_list") {
      for (const parameter of result.namedChildren) {
        const type = parameter.childForFieldName("type");
        if (type) this.collectTypeNames(type, "return", references, typeParameters);
      }
    } else if (result) {
      this.collectTypeNames(result, "return", references, typeParameters);
    }
    return references;
  }

  private baseTypeName(node: SyntaxNode | null): string | undefined {
    if (!node) return undefined;
    if (node.type === "type_identifier") return node.text;
    if (node.type === "pointer_type" || node.type === "generic_type") return this.baseTypeName(node.namedChildren[0] ?? null);
    return undefined;
  }

  /** The named types a type expression mentions, as references and as uses. */
  private collectTypeNames(node: SyntaxNode, role: TypeReference["role"], into: TypeReference[], typeParameters: string[], parameterName?: string): void {
    const add = (name: string, nameRole: TypeReference["role"]): void => {
      if (goSyntax.isFrameworkType(name) || typeParameters.includes(name)) return;
      if (into.some((reference) => reference.name === name && reference.role === nameRole && reference.parameterName === parameterName)) return;
      into.push(parameterName ? { name, role: nameRole, parameterName } : { name, role: nameRole });
    };
    const visit = (current: SyntaxNode, currentRole: TypeReference["role"]): void => {
      switch (current.type) {
        case "qualified_type": {
          const head = current.childForFieldName("package")?.text;
          const name = current.childForFieldName("name")?.text;
          if (head && name) {
            this.facts.uses.push({ head, name, locals: NO_LOCALS });
            add(name, currentRole);
          }
          return;
        }
        case "type_identifier":
          if (!typeParameters.includes(current.text)) this.facts.uses.push({ name: current.text, locals: NO_LOCALS });
          add(current.text, currentRole);
          return;
        case "generic_type": {
          const [head, ...rest] = current.namedChildren;
          if (head) visit(head, currentRole);
          for (const child of rest) visit(child, "type-argument");
          return;
        }
        case "type_arguments":
          for (const child of current.namedChildren) visit(child, "type-argument");
          return;
        case "function_type":
          for (const reference of this.signatureReferences(current, typeParameters)) {
            if (!into.some((existing) => existing.name === reference.name && existing.role === reference.role)) into.push(reference);
          }
          return;
        default:
          for (const child of current.namedChildren) visit(child, currentRole);
      }
    };
    visit(node, role);
  }

  /** A function or method body, with the names its parameters and statements declare as locals. */
  private visitFunction(node: SyntaxNode, typeParameters: string[]): void {
    const locals = new Set<string>(typeParameters);
    const addNames = (list: SyntaxNode | null): void => {
      for (const parameter of list?.namedChildren ?? []) {
        for (const child of parameter.namedChildren) if (child.type === "identifier") locals.add(child.text);
      }
    };
    addNames(node.childForFieldName("receiver"));
    addNames(node.childForFieldName("parameters"));
    const result = node.childForFieldName("result");
    if (result?.type === "parameter_list") addNames(result);
    const body = node.childForFieldName("body");
    if (!body) return;
    this.collectLocals(body, locals);
    this.visitExpressions(body, locals);
  }

  private collectLocals(node: SyntaxNode, locals: Set<string>): void {
    switch (node.type) {
      case "short_var_declaration":
      case "range_clause": {
        for (const child of node.childForFieldName("left")?.namedChildren ?? []) if (child.type === "identifier") locals.add(child.text);
        break;
      }
      case "var_spec":
      case "const_spec":
        for (const child of node.namedChildren) if (child.type === "identifier") locals.add(child.text);
        break;
      case "type_switch_statement":
        for (const child of node.childForFieldName("alias")?.namedChildren ?? []) if (child.type === "identifier") locals.add(child.text);
        break;
      case "func_literal": {
        for (const parameter of node.childForFieldName("parameters")?.namedChildren ?? []) {
          for (const child of parameter.namedChildren) if (child.type === "identifier") locals.add(child.text);
        }
        break;
      }
      case "labeled_statement":
        locals.add(node.childForFieldName("label")?.text ?? "");
        break;
      case "type_spec":
      case "type_alias":
        locals.add(node.childForFieldName("name")?.text ?? "");
        break;
      case "function_declaration":
        return;
      default:
        break;
    }
    for (const child of node.namedChildren) this.collectLocals(child, locals);
  }

  /** Statements and expressions: every name that could be a package-level declaration or `pkg.Name`. */
  private visitExpressions(node: SyntaxNode, locals: Set<string>): void {
    switch (node.type) {
      case "selector_expression": {
        const operand = node.childForFieldName("operand");
        if (operand?.type === "identifier") {
          const field = node.childForFieldName("field")?.text;
          if (field && !locals.has(operand.text)) this.facts.uses.push({ head: operand.text, name: field, locals });
          return;
        }
        if (operand) this.visitExpressions(operand, locals);
        return;
      }
      case "qualified_type":
      case "type_identifier":
        this.collectTypeNames(node, "type-argument", [], Array.from(locals));
        return;
      case "identifier":
        this.facts.uses.push({ name: node.text, locals });
        return;
      case "keyed_element": {
        const [key, ...rest] = node.namedChildren;
        if (key && !(key.namedChildren.length === 1 && key.namedChildren[0].type === "identifier")) this.visitExpressions(key, locals);
        for (const child of rest) this.visitExpressions(child, locals);
        return;
      }
      case "field_identifier":
      case "package_identifier":
      case "label_name":
      case "interpreted_string_literal":
      case "raw_string_literal":
      case "comment":
        return;
      default:
        for (const child of node.namedChildren) this.visitExpressions(child, locals);
    }
  }
}

// ---------------------------------------------------------------------------
// Per-file facts, cached by modification time
// ---------------------------------------------------------------------------

const factsCache = new Map<string, { mtimeMs: number; facts: FileFacts }>();

async function fileFacts(absolutePath: string): Promise<FileFacts> {
  const stats  = await fs.stat(absolutePath);
  const cached = factsCache.get(absolutePath);
  if (cached && cached.mtimeMs === stats.mtimeMs) return cached.facts;
  const content = await fs.readFile(absolutePath, "utf8");
  const tree    = await parseSource("go", content);
  try {
    const facts = new FileExtractor().extract(tree.rootNode);
    factsCache.set(absolutePath, { mtimeMs: stats.mtimeMs, facts });
    return facts;
  } finally {
    tree.delete();
  }
}

// ---------------------------------------------------------------------------
// The workspace's packages, by directory
// ---------------------------------------------------------------------------

interface PackageFile {
  /** Workspace-relative. */
  file:  string;
  facts: FileFacts;
}

/** Files by workspace-relative directory (`.` for the root). */
type PackageTable = Map<string, PackageFile[]>;

const tableCache = new WeakMap<WorkspaceFileIndex, Promise<PackageTable>>();

async function listGoFiles(workspaceRoot: string, fileIndex: WorkspaceFileIndex | undefined): Promise<string[]> {
  if (fileIndex) return Array.from(fileIndex).filter((file) => file.endsWith(".go")).sort();
  const files = await glob("**/*.go", { cwd: workspaceRoot, ignore: ["**/node_modules/**", "**/vendor/**"], nodir: true, windowsPathsNoEscape: true });
  return files.map((file) => normalizeWorkspacePath(file)).sort();
}

async function buildPackageTable(workspaceRoot: string, fileIndex: WorkspaceFileIndex | undefined): Promise<PackageTable> {
  const table: PackageTable = new Map();
  for (const file of await listGoFiles(workspaceRoot, fileIndex)) {
    let facts: FileFacts;
    try {
      facts = await fileFacts(path.join(workspaceRoot, file));
    } catch {
      continue;
    }
    const directory = normalizeWorkspacePath(path.dirname(file)) || ".";
    const files = table.get(directory) ?? [];
    files.push({ file, facts });
    table.set(directory, files);
  }
  return table;
}

function packageTable(workspaceRoot: string, fileIndex: WorkspaceFileIndex | undefined): Promise<PackageTable> {
  if (!fileIndex) return buildPackageTable(workspaceRoot, undefined);
  let pending = tableCache.get(fileIndex);
  if (!pending) {
    pending = buildPackageTable(workspaceRoot, fileIndex);
    tableCache.set(fileIndex, pending);
  }
  return pending;
}

interface GoModule {
  path: string;
  /** Workspace-relative directory of the `go.mod`. */
  root: string;
}

/** The module the file belongs to: the nearest `go.mod` above it, inside the workspace. */
async function moduleOf(absolutePath: string, workspaceRoot: string): Promise<GoModule | undefined> {
  let directory = path.dirname(absolutePath);
  while (directory.startsWith(workspaceRoot)) {
    try {
      const content = await fs.readFile(path.join(directory, "go.mod"), "utf8");
      const match   = /^module\s+(\S+)/mu.exec(content);
      if (match) return { path: match[1], root: normalizeWorkspacePath(path.relative(workspaceRoot, directory)) || "." };
    } catch {
      // no go.mod here; look one level up
    }
    const parent = path.dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }
  return undefined;
}

function isTestFile(file: string): boolean {
  return file.endsWith("_test.go");
}

/** The files that make up the importable package at a directory: those whose package name is not a `_test` package, and not test files. */
function importableFiles(table: PackageTable, directory: string): PackageFile[] {
  return (table.get(directory) ?? []).filter((entry) => !isTestFile(entry.file) && !entry.facts.packageName.endsWith("_test"));
}

// ---------------------------------------------------------------------------
// Adapter output
// ---------------------------------------------------------------------------

/** Every package-level declaration is visible to the package's other files, so all are published; members only when exported. */
function published(declared: Declared): boolean {
  if (!declared.qualifiedName) return true;
  return isExported(declared.name) && isExported(declared.qualifiedName.split(".")[0]);
}

function toSymbols(facts: FileFacts): PublicSymbolEntry[] {
  return facts.declarations
    .filter(published)
    .map((declared) => ({
      name:           declared.name,
      kind:           declared.kind,
      qualifiedName:  declared.qualifiedName,
      location:       { line: declared.line, character: declared.character },
      documentation:  declared.documentation,
      typeReferences: declared.typeReferences.length > 0 ? declared.typeReferences : undefined
    }))
    .sort((left, right) =>
      (left.location.line - right.location.line) ||
      (left.location.character - right.location.character) ||
      left.name.localeCompare(right.name)
    );
}

interface Binding {
  files: PackageFile[];
}

function isStandardLibrary(importPath: string): boolean {
  return !importPath.split("/")[0].includes(".");
}

async function toDependencies(facts: FileFacts, thisFile: string, absolutePath: string, workspaceRoot: string, table: PackageTable): Promise<DependencyEntry[]> {
  const byTarget = new Map<string, Set<string>>();
  const link = (file: string, symbol?: string): void => {
    if (file === thisFile) return;
    const symbols = byTarget.get(file) ?? new Set<string>();
    if (symbol) symbols.add(symbol);
    byTarget.set(file, symbols);
  };

  const module   = await moduleOf(absolutePath, workspaceRoot);
  const bindings = new Map<string, Binding>();
  const dotImports: Binding[] = [];
  const external: DependencyEntry[] = [];

  for (const entry of facts.imports) {
    let files: PackageFile[] = [];
    if (module && (entry.path === module.path || entry.path.startsWith(`${module.path}/`))) {
      const relative  = entry.path.slice(module.path.length).replace(/^\//, "");
      const directory = normalizeWorkspacePath(path.posix.join(module.root, relative)) || ".";
      files = importableFiles(table, directory);
    }
    if (files.length === 0) {
      if (!isStandardLibrary(entry.path)) external.push({ specifier: entry.path, symbols: [], kind: "import" });
      continue;
    }
    if (entry.blank) {
      for (const file of files) link(file.file);
    } else if (entry.dot) {
      dotImports.push({ files });
    } else {
      bindings.set(entry.name ?? files[0].facts.packageName, { files });
    }
  }

  const siblings = (table.get(normalizeWorkspacePath(path.dirname(thisFile)) || ".") ?? [])
    .filter((entry) => entry.file !== thisFile && entry.facts.packageName === facts.packageName && (isTestFile(thisFile) || !isTestFile(entry.file)));

  for (const use of facts.uses) {
    if (use.head) {
      const binding = bindings.get(use.head);
      if (!binding) continue;
      for (const file of binding.files) {
        if (file.facts.declaredNames.has(use.name)) link(file.file, use.name);
      }
      continue;
    }
    if (use.locals.has(use.name) || facts.declaredNames.has(use.name) || goSyntax.isFrameworkType(use.name)) continue;
    for (const sibling of siblings) {
      if (sibling.facts.declaredNames.has(use.name)) link(sibling.file, use.name);
    }
    if (!isExported(use.name)) continue;
    for (const binding of dotImports) {
      for (const file of binding.files) {
        if (file.facts.declaredNames.has(use.name)) link(file.file, use.name);
      }
    }
  }

  const dependencies: DependencyEntry[] = Array.from(byTarget.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([file, symbols]) => ({ specifier: file, resolvedPath: file, symbols: Array.from(symbols).sort(), kind: "import" as const }));
  return [...dependencies, ...external.sort((left, right) => left.specifier.localeCompare(right.specifier))];
}

/** Language adapter for Go (`.go`): tree-sitter symbols and package-aware name resolution across the module. */
export const goAdapter: LanguageAdapter = {
  id:         "go",
  extensions: [".go"],
  async analyze({ absolutePath, workspaceRoot, fileIndex }): Promise<SourceAnalysisResult | null> {
    const facts    = await fileFacts(absolutePath);
    const table    = await packageTable(workspaceRoot, fileIndex);
    const thisFile = normalizeWorkspacePath(path.relative(workspaceRoot, absolutePath));
    return {
      symbols:      toSymbols(facts),
      dependencies: await toDependencies(facts, thisFile, absolutePath, workspaceRoot, table)
    };
  }
};
