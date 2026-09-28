/**
 * Rust adapter: tree-sitter symbols and path resolution through the module tree.
 *
 * A file's symbols are its public items (functions, structs, enums, traits, type
 * aliases, constants, statics, modules), the methods of its impl blocks and
 * traits, its public fields and its enum variants, each with the rustdoc above
 * it.
 *
 * Dependencies follow the language's rules. Every crate root of a Cargo package
 * (`src/lib.rs`, `src/main.rs`, `src/bin`, `tests`, `examples`, `benches`) owns
 * the module tree its `mod` declarations reach, one file per module. A path is
 * resolved the way rustc resolves it: `crate`, `super` and `self` name modules of
 * the tree; a first segment names a child module, an item or a `use` binding of
 * the current module, or a library crate of the workspace by its package name;
 * a `use` re-export is followed to the item it names. Every module a path names
 * is a dependency, and the item it ends on is a dependency on its file. A glob
 * import links the names the file uses. The standard library (`std`, `core`,
 * `alloc`) is not listed; other crates the workspace does not contain are listed
 * by name. Names inside strings and comments are never references; names inside
 * macro invocations are.
 */
import { glob } from "glob";
import { promises as fs } from "node:fs";
import path from "node:path";

import { rustSyntax } from "../../languages";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult, SymbolDocumentation, TypeReference } from "../core";
import type { LanguageAdapter, WorkspaceFileIndex } from "./index";
import { parseRustDocumentation } from "./rust.rustdoc";
import { parseSource, type SyntaxNode } from "./treeSitter";

// ---------------------------------------------------------------------------
// Facts about one file, module by module
// ---------------------------------------------------------------------------

/** `use a::b::C as D` binds `D` to the path `a::b::C` in its module. */
interface UseBinding {
  name: string;
  path: string[];
}

/** One module of a file: the file's own, or an inline `mod x { }`. */
interface ModuleFacts {
  name?:        string;
  /** Item name to kind. */
  items:        Map<string, string>;
  /** `mod x;` declarations, whose bodies live in other files. */
  declared:     string[];
  inline:       ModuleFacts[];
  uses:         UseBinding[];
  globs:        string[][];
  /** Every path written in the module, `use` targets included. */
  paths:        string[][];
  /** Every bare name used in the module. */
  identifiers:  Set<string>;
  /** Whether a `use` path was written as an import (its last segment is an imported name). */
  imported:     Set<string>;
}

interface Declared {
  name:           string;
  qualifiedName?: string;
  kind:           string;
  line:           number;
  character:      number;
  documentation?: SymbolDocumentation;
  typeReferences: TypeReference[];
  published:      boolean;
}

interface FileFacts {
  module:       ModuleFacts;
  declarations: Declared[];
}

const ITEM_KINDS: Record<string, string> = {
  function_item:           "function",
  struct_item:             "struct",
  enum_item:               "enum",
  union_item:              "struct",
  trait_item:              "trait",
  type_item:               "type",
  const_item:              "constant",
  static_item:             "variable",
  macro_definition:        "macro"
};

const STANDARD_CRATES = new Set(["std", "core", "alloc"]);

/** Traits everything implements; a link to them says nothing. */
const STANDARD_TRAITS = new Set([
  "Debug", "Display", "Clone", "Copy", "Default", "Eq", "PartialEq", "Ord", "PartialOrd", "Hash",
  "Send", "Sync", "Sized", "Drop", "From", "Into", "TryFrom", "TryInto", "Iterator", "IntoIterator",
  "Deref", "DerefMut", "AsRef", "AsMut", "Serialize", "Deserialize"
]);

function newModule(name?: string): ModuleFacts {
  return { name, items: new Map(), declared: [], inline: [], uses: [], globs: [], paths: [], identifiers: new Set(), imported: new Set() };
}

function position(node: SyntaxNode): { line: number; character: number } {
  return { line: node.startPosition.row + 1, character: node.startPosition.column + 1 };
}

function isPublic(node: SyntaxNode): boolean {
  return node.namedChildren.some((child) => child.type === "visibility_modifier");
}

/** The segments of a path node: `scoped_identifier`, `scoped_type_identifier`, `generic_type`, `crate`, `super`, `self` or a lone identifier. */
function pathSegments(node: SyntaxNode | null): string[] | undefined {
  if (!node) return undefined;
  switch (node.type) {
    case "identifier":
    case "type_identifier":
    case "crate":
    case "super":
    case "self":
    case "metavariable":
      return [node.text];
    case "scoped_identifier":
    case "scoped_type_identifier": {
      const head = pathSegments(node.childForFieldName("path"));
      const name = node.childForFieldName("name");
      return head && name ? [...head, name.text] : name ? [name.text] : undefined;
    }
    case "generic_type":
      return pathSegments(node.childForFieldName("type"));
    case "bracketed_type":
      return pathSegments(node.namedChildren[0] ?? null);
    default:
      return undefined;
  }
}

/** The rustdoc above an item: `///` lines or a `/** *\/` block, skipping attributes in between. */
function docOf(node: SyntaxNode): SymbolDocumentation | undefined {
  const lines: string[] = [];
  let previous = node.previousNamedSibling;
  while (previous && previous.type === "attribute_item") previous = previous.previousNamedSibling;
  while (previous && (previous.type === "line_comment" || previous.type === "block_comment")) {
    const outer = previous.namedChildren.some((child) => child.type === "outer_doc_comment_marker");
    const doc   = previous.childForFieldName("doc");
    if (!outer || !doc) break;
    const text = previous.type === "line_comment"
      ? [doc.text.replace(/\n$/, "").replace(/^ /, "")]
      : doc.text.split("\n").map((line) => line.replace(/^\s*\* ?/, "").trimEnd());
    lines.unshift(...text);
    previous = previous.previousNamedSibling;
    while (previous && previous.type === "attribute_item") previous = previous.previousNamedSibling;
  }
  return lines.length > 0 ? parseRustDocumentation(lines) : undefined;
}

class FileExtractor {
  private readonly declarations: Declared[] = [];

  extract(root: SyntaxNode): FileFacts {
    const module = newModule();
    this.readModule(root, module, [], true);
    return { module, declarations: this.declarations };
  }

  private readModule(body: SyntaxNode, module: ModuleFacts, scope: string[], published: boolean): void {
    for (const node of body.namedChildren) {
      switch (node.type) {
        case "mod_item": {
          const name  = node.childForFieldName("name")!.text;
          const inner = node.childForFieldName("body");
          if (inner) {
            const inline = newModule(name);
            module.inline.push(inline);
            module.items.set(name, "module");
            this.declare(node, name, "module", scope, published && isPublic(node));
            this.readModule(inner, inline, [...scope, name], published && isPublic(node));
          } else {
            module.declared.push(name);
            module.items.set(name, "module");
            this.declare(node, name, "module", scope, published && isPublic(node));
          }
          break;
        }
        case "use_declaration":
          this.readUse(node.childForFieldName("argument"), [], module, isPublic(node));
          break;
        case "impl_item":
          this.readImpl(node, module, scope, published);
          break;
        case "attribute_item":
        case "inner_attribute_item":
        case "line_comment":
        case "block_comment":
          break;
        default:
          this.readItem(node, module, scope, published);
      }
    }
  }

  private declare(node: SyntaxNode, name: string, kind: string, scope: string[], published: boolean, extra: Partial<Declared> = {}): Declared {
    const nameNode = node.childForFieldName("name") ?? node;
    const declared: Declared = {
      name,
      qualifiedName:  scope.length > 0 ? [...scope, name].join(".") : undefined,
      kind,
      ...position(nameNode),
      documentation:  docOf(node),
      typeReferences: [],
      published,
      ...extra
    };
    this.declarations.push(declared);
    return declared;
  }

  private readItem(node: SyntaxNode, module: ModuleFacts, scope: string[], published: boolean): void {
    const kind = ITEM_KINDS[node.type];
    if (!kind) {
      this.visit(node, module);
      return;
    }
    const nameNode = node.childForFieldName("name");
    if (!nameNode) return;
    const name = nameNode.text;
    module.items.set(name, kind);
    const isPub    = published && isPublic(node);
    const declared = this.declare(node, name, kind, scope, isPub);
    const typeParameters = this.typeParameterNames(node);

    switch (node.type) {
      case "function_item":
        declared.typeReferences = this.signatureReferences(node, typeParameters, module);
        this.visit(node.childForFieldName("body"), module);
        break;
      case "struct_item":
      case "union_item": {
        this.boundsReferences(node, typeParameters, declared.typeReferences, module);
        const body = node.childForFieldName("body");
        for (const field of body?.namedChildren ?? []) {
          if (field.type !== "field_declaration") continue;
          const fieldName = field.childForFieldName("name")!;
          const type      = field.childForFieldName("type");
          const references: TypeReference[] = [];
          if (type) this.collectTypeNames(type, "property", references, typeParameters, module);
          this.declare(field, fieldName.text, "field", [...scope, name], isPub && isPublic(field), { typeReferences: references, documentation: docOf(field) });
        }
        if (body?.type === "ordered_field_declaration_list") this.visit(body, module);
        break;
      }
      case "enum_item": {
        this.boundsReferences(node, typeParameters, declared.typeReferences, module);
        for (const variant of node.childForFieldName("body")?.namedChildren ?? []) {
          if (variant.type !== "enum_variant") continue;
          const variantName = variant.childForFieldName("name")!;
          this.declare(variant, variantName.text, "variant", [...scope, name], isPub, { documentation: docOf(variant) });
          this.visit(variant.childForFieldName("body"), module);
        }
        break;
      }
      case "trait_item": {
        this.boundsReferences(node, typeParameters, declared.typeReferences, module);
        for (const member of node.childForFieldName("body")?.namedChildren ?? []) {
          if (member.type !== "function_signature_item" && member.type !== "function_item") continue;
          const memberName = member.childForFieldName("name")!;
          const references = this.signatureReferences(member, [...typeParameters, ...this.typeParameterNames(member)], module);
          this.declare(member, memberName.text, "method", [...scope, name], isPub, { typeReferences: references });
          this.visit(member.childForFieldName("body"), module);
        }
        for (const child of node.namedChildren) {
          if (child.type === "trait_bounds") this.collectTypeNames(child, "extends", declared.typeReferences, typeParameters, module);
        }
        break;
      }
      case "type_item": {
        const type = node.childForFieldName("type");
        if (type) this.collectTypeNames(type, "extends", declared.typeReferences, typeParameters, module);
        break;
      }
      case "const_item":
      case "static_item": {
        const type = node.childForFieldName("type");
        if (type) this.collectTypeNames(type, "property", declared.typeReferences, [], module);
        this.visit(node.childForFieldName("value"), module);
        break;
      }
      default:
        break;
    }
  }

  private readImpl(node: SyntaxNode, module: ModuleFacts, scope: string[], published: boolean): void {
    const typeParameters = this.typeParameterNames(node);
    const traitNode = node.childForFieldName("trait");
    const typeNode  = node.childForFieldName("type");
    const traitPath = pathSegments(traitNode);
    const typePath  = pathSegments(typeNode);
    if (traitNode) this.collectTypeNames(traitNode, "implements", [], typeParameters, module);
    if (typeNode) this.collectTypeNames(typeNode, "implements", [], typeParameters, module);

    const typeName = typePath?.[typePath.length - 1];
    const owner    = typeName ? this.declarations.find((declared) => declared.name === typeName && (declared.kind === "struct" || declared.kind === "enum")) : undefined;
    const traitName = traitPath?.[traitPath.length - 1];
    if (owner && traitName && !STANDARD_TRAITS.has(traitName) && !owner.typeReferences.some((reference) => reference.name === traitName && reference.role === "implements")) {
      owner.typeReferences.push({ name: traitName, role: "implements" });
    }

    for (const member of node.childForFieldName("body")?.namedChildren ?? []) {
      if (member.type !== "function_item") {
        this.visit(member, module);
        continue;
      }
      const memberName = member.childForFieldName("name")!;
      const references = this.signatureReferences(member, [...typeParameters, ...this.typeParameterNames(member)], module);
      const isPub = published && (traitNode ? (owner?.published ?? true) : isPublic(member));
      this.declare(member, memberName.text, "method", typeName ? [...scope, typeName] : scope, isPub, { typeReferences: references });
      this.visit(member.childForFieldName("body"), module);
    }
  }

  private typeParameterNames(node: SyntaxNode): string[] {
    return (node.childForFieldName("type_parameters")?.namedChildren ?? [])
      .map((parameter) => parameter.childForFieldName("name")?.text ?? (parameter.type === "type_identifier" ? parameter.text : ""))
      .filter(Boolean);
  }

  private boundsReferences(node: SyntaxNode, typeParameters: string[], into: TypeReference[], module: ModuleFacts): void {
    for (const parameter of node.childForFieldName("type_parameters")?.namedChildren ?? []) {
      const bounds = parameter.childForFieldName("bounds");
      if (bounds) this.collectTypeNames(bounds, "generic-constraint", into, typeParameters, module);
    }
    for (const child of node.namedChildren) {
      if (child.type === "where_clause") this.collectTypeNames(child, "generic-constraint", into, typeParameters, module);
    }
  }

  /** Parameter, return and bound types of a function or signature. */
  private signatureReferences(node: SyntaxNode, typeParameters: string[], module: ModuleFacts): TypeReference[] {
    const references: TypeReference[] = [];
    this.boundsReferences(node, typeParameters, references, module);
    for (const parameter of node.childForFieldName("parameters")?.namedChildren ?? []) {
      if (parameter.type !== "parameter") continue;
      const type = parameter.childForFieldName("type");
      const pattern = parameter.childForFieldName("pattern");
      if (type) this.collectTypeNames(type, "parameter", references, typeParameters, module, pattern?.type === "identifier" ? pattern.text : undefined);
    }
    const returnType = node.childForFieldName("return_type");
    if (returnType) this.collectTypeNames(returnType, "return", references, typeParameters, module);
    return references;
  }

  /** The named types a type expression mentions, as references and as path uses. */
  private collectTypeNames(node: SyntaxNode, role: TypeReference["role"], into: TypeReference[], typeParameters: string[], module: ModuleFacts, parameterName?: string): void {
    const add = (name: string, nameRole: TypeReference["role"]): void => {
      if (name === "Self" || rustSyntax.isFrameworkType(name) || typeParameters.includes(name)) return;
      if (into.some((reference) => reference.name === name && reference.role === nameRole && reference.parameterName === parameterName)) return;
      into.push(parameterName ? { name, role: nameRole, parameterName } : { name, role: nameRole });
    };
    const visit = (current: SyntaxNode, currentRole: TypeReference["role"]): void => {
      switch (current.type) {
        case "type_identifier":
          if (!typeParameters.includes(current.text)) module.identifiers.add(current.text);
          add(current.text, currentRole);
          return;
        case "scoped_type_identifier": {
          const segments = pathSegments(current);
          if (segments) {
            module.paths.push(segments);
            add(segments[segments.length - 1], currentRole);
          }
          for (const child of current.namedChildren) {
            if (child.type === "type_arguments") visit(child, "type-argument");
          }
          return;
        }
        case "generic_type": {
          const type = current.childForFieldName("type");
          if (type) visit(type, currentRole);
          const typeArguments = current.childForFieldName("type_arguments");
          if (typeArguments) visit(typeArguments, "type-argument");
          return;
        }
        case "type_arguments":
          for (const child of current.namedChildren) visit(child, "type-argument");
          return;
        case "lifetime":
        case "primitive_type":
          return;
        default:
          for (const child of current.namedChildren) visit(child, currentRole);
      }
    };
    visit(node, role);
  }

  /** `use` trees, flattened into bindings, globs and paths. */
  private readUse(node: SyntaxNode | null, prefix: string[], module: ModuleFacts, pub: boolean): void {
    if (!node) return;
    switch (node.type) {
      case "identifier":
      case "crate":
      case "super":
      case "self": {
        if (node.type === "self" && prefix.length > 0) {
          module.paths.push(prefix);
          module.uses.push({ name: prefix[prefix.length - 1], path: prefix });
          return;
        }
        const full = [...prefix, node.text];
        module.paths.push(full);
        module.imported.add(full.join("::"));
        module.uses.push({ name: node.text, path: full });
        return;
      }
      case "scoped_identifier": {
        const segments = pathSegments(node);
        if (!segments) return;
        const full = [...prefix, ...segments];
        module.paths.push(full);
        module.imported.add(full.join("::"));
        module.uses.push({ name: full[full.length - 1], path: full });
        return;
      }
      case "use_as_clause": {
        const target = pathSegments(node.childForFieldName("path"));
        const alias  = node.childForFieldName("alias")?.text;
        if (!target || !alias) return;
        const full = [...prefix, ...target];
        module.paths.push(full);
        module.imported.add(full.join("::"));
        module.uses.push({ name: alias, path: full });
        return;
      }
      case "scoped_use_list": {
        const head = pathSegments(node.childForFieldName("path"));
        const list = node.childForFieldName("list");
        const full = [...prefix, ...(head ?? [])];
        for (const child of list?.namedChildren ?? []) this.readUse(child, full, module, pub);
        return;
      }
      case "use_list":
        for (const child of node.namedChildren) this.readUse(child, prefix, module, pub);
        return;
      case "use_wildcard": {
        const head = pathSegments(node.namedChildren[0] ?? null);
        const full = [...prefix, ...(head ?? [])];
        if (full.length > 0) {
          module.paths.push(full);
          module.globs.push(full);
        }
        return;
      }
      default:
        return;
    }
  }

  /** Expressions, statements, patterns and macro token trees: every path and bare name. */
  private visit(node: SyntaxNode | null, module: ModuleFacts): void {
    if (!node) return;
    switch (node.type) {
      case "use_declaration":
        this.readUse(node.childForFieldName("argument"), [], module, isPublic(node));
        return;
      case "mod_item": {
        // A module declared inside a function body is rare; treat it like a top-level one of this module.
        this.readModule(node.childForFieldName("body") ?? node, module, [], false);
        return;
      }
      case "scoped_identifier":
      case "scoped_type_identifier": {
        const segments = pathSegments(node);
        if (segments) module.paths.push(segments);
        for (const child of node.namedChildren) {
          if (child.type === "type_arguments" || child.type === "generic_type") this.visit(child, module);
        }
        return;
      }
      case "identifier":
      case "type_identifier":
        module.identifiers.add(node.text);
        return;
      case "token_tree":
        this.visitTokens(node, module);
        return;
      case "attribute_item":
      case "inner_attribute_item":
      case "line_comment":
      case "block_comment":
      case "string_literal":
      case "raw_string_literal":
      case "char_literal":
      case "field_identifier":
      case "shorthand_field_identifier":
      case "primitive_type":
      case "lifetime":
        return;
      default:
        for (const child of node.namedChildren) this.visit(child, module);
    }
  }

  /** Inside a macro invocation the source is tokens; `a::b::c` is read back as a path. */
  private visitTokens(tree: SyntaxNode, module: ModuleFacts): void {
    const tokens = tree.children;
    let index = 0;
    while (index < tokens.length) {
      const token = tokens[index];
      if (token.type === "token_tree") {
        this.visitTokens(token, module);
        index += 1;
        continue;
      }
      if (token.type === "identifier" || token.type === "crate" || token.type === "super" || token.type === "self") {
        const segments = [token.text];
        let cursor = index + 1;
        while (cursor + 1 < tokens.length && tokens[cursor].type === "::" && (tokens[cursor + 1].type === "identifier")) {
          segments.push(tokens[cursor + 1].text);
          cursor += 2;
        }
        if (segments.length > 1) module.paths.push(segments);
        else module.identifiers.add(token.text);
        index = cursor;
        continue;
      }
      index += 1;
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
  const tree    = await parseSource("rust", content);
  try {
    const facts = new FileExtractor().extract(tree.rootNode);
    factsCache.set(absolutePath, { mtimeMs: stats.mtimeMs, facts });
    return facts;
  } finally {
    tree.delete();
  }
}

// ---------------------------------------------------------------------------
// The workspace's crates and their module trees
// ---------------------------------------------------------------------------

interface Crate {
  name: string;
  root: Module;
}

interface Module {
  /** Workspace-relative file. */
  file:     string;
  facts:    ModuleFacts;
  crate:    Crate;
  parent?:  Module;
  children: Map<string, Module>;
}

interface ModuleTable {
  /** The modules a file hosts: its own first, then any inline ones. */
  byFile:  Map<string, Module[]>;
  /** Library crates by package name, underscored, for paths that start with a crate name. */
  libraries: Map<string, Crate>;
}

const tableCache = new WeakMap<WorkspaceFileIndex, Promise<ModuleTable>>();

async function listRustFiles(workspaceRoot: string, fileIndex: WorkspaceFileIndex | undefined): Promise<string[]> {
  if (fileIndex) return Array.from(fileIndex).filter((file) => file.endsWith(".rs")).sort();
  const files = await glob("**/*.rs", { cwd: workspaceRoot, ignore: ["**/node_modules/**", "**/target/**"], nodir: true, windowsPathsNoEscape: true });
  return files.map((file) => normalizeWorkspacePath(file)).sort();
}

interface CrateRoot {
  name: string;
  file: string;
}

const packageCache = new Map<string, string | undefined>();

/** The directory of the nearest `Cargo.toml` at or above `directory`, inside the workspace. */
async function packageDirOf(directory: string, workspaceRoot: string): Promise<string | undefined> {
  if (packageCache.has(directory)) return packageCache.get(directory);
  let found: string | undefined;
  try {
    await fs.access(path.join(directory, "Cargo.toml"));
    found = directory;
  } catch {
    const parent = path.dirname(directory);
    found = directory.startsWith(workspaceRoot) && parent !== directory ? await packageDirOf(parent, workspaceRoot) : undefined;
  }
  packageCache.set(directory, found);
  return found;
}

function isConventionalRoot(relative: string): boolean {
  return relative === "src/main.rs" || relative === "src/lib.rs" ||
    /^src\/bin\/[^/]+\.rs$/u.test(relative) || /^src\/bin\/[^/]+\/main\.rs$/u.test(relative) ||
    /^(tests|examples|benches)\/[^/]+\.rs$/u.test(relative) || /^(tests|examples|benches)\/[^/]+\/main\.rs$/u.test(relative);
}

/** Cargo's conventional targets under each package (lib, main, bins, tests, examples, benches); a file with no package is a root when it is a `main.rs` or `lib.rs`. */
async function crateRoots(workspaceRoot: string, rustFiles: string[]): Promise<CrateRoot[]> {
  const roots: CrateRoot[] = [];
  const names = new Map<string, string>();
  for (const file of rustFiles) {
    const packageDir = await packageDirOf(path.dirname(path.join(workspaceRoot, file)), workspaceRoot);
    if (!packageDir) {
      const base = path.basename(file);
      if (base === "lib.rs" || base === "main.rs") roots.push({ name: base === "lib.rs" ? path.basename(path.dirname(path.dirname(file))) : `bin:${file}`, file });
      continue;
    }
    let name = names.get(packageDir);
    if (!name) {
      const manifest = await fs.readFile(path.join(packageDir, "Cargo.toml"), "utf8");
      name = (/^\[package\][^[]*?^\s*name\s*=\s*"([^"]+)"/msu.exec(manifest)?.[1] ?? path.basename(packageDir)).replace(/-/g, "_");
      names.set(packageDir, name);
    }
    const relative = normalizeWorkspacePath(path.relative(packageDir, path.join(workspaceRoot, file)));
    if (isConventionalRoot(relative)) roots.push({ name: relative === "src/lib.rs" ? name : `${name}:${relative}`, file });
  }
  return roots;
}

/** Where `mod name;` in `file` puts the module: beside a root or `mod.rs`, otherwise in the directory named after the file. */
function childCandidates(file: string, name: string, isRoot: boolean): string[] {
  const directory = normalizeWorkspacePath(path.dirname(file));
  const stem      = path.basename(file, ".rs");
  const base      = isRoot || stem === "mod" ? directory : `${directory}/${stem}`;
  const join      = (...parts: string[]) => normalizeWorkspacePath(path.posix.join(...parts));
  return [join(base, `${name}.rs`), join(base, name, "mod.rs")];
}

async function buildModuleTable(workspaceRoot: string, fileIndex: WorkspaceFileIndex | undefined): Promise<ModuleTable> {
  const table: ModuleTable = { byFile: new Map(), libraries: new Map() };
  const rustFiles = await listRustFiles(workspaceRoot, fileIndex);
  const fileSet   = new Set(rustFiles);
  const known     = new Map<string, FileFacts>();
  const factsOf = async (file: string): Promise<FileFacts | undefined> => {
    if (known.has(file)) return known.get(file);
    try {
      const facts = await fileFacts(path.join(workspaceRoot, file));
      known.set(file, facts);
      return facts;
    } catch {
      return undefined;
    }
  };

  const attach = (file: string, facts: ModuleFacts, crate: Crate, parent: Module | undefined): Module => {
    const module: Module = { file, facts, crate, parent, children: new Map() };
    const hosted = table.byFile.get(file) ?? [];
    hosted.push(module);
    table.byFile.set(file, hosted);
    for (const inline of facts.inline) module.children.set(inline.name!, attach(file, inline, crate, module));
    return module;
  };

  const reached = new Set<string>();
  const build = async (file: string, crate: Crate | undefined, parent: Module | undefined, isRoot: boolean): Promise<Module | undefined> => {
    const facts = await factsOf(file);
    if (!facts) return undefined;
    reached.add(file);
    const owner: Crate = crate ?? { name: "", root: undefined as unknown as Module };
    const module = attach(file, facts.module, owner, parent);
    if (!crate) owner.root = module;
    for (const name of facts.module.declared) {
      const candidate = childCandidates(file, name, isRoot).find((path) => fileSet.has(path));
      if (!candidate || reached.has(candidate)) continue;
      const child = await build(candidate, owner, module, false);
      if (child) module.children.set(name, child);
    }
    return module;
  };

  for (const root of await crateRoots(workspaceRoot, rustFiles)) {
    const crate: Crate = { name: root.name, root: undefined as unknown as Module };
    const module = await build(root.file, undefined, undefined, true);
    if (!module) continue;
    module.crate.name = root.name;
    crate.root = module;
    if (!root.name.includes(":")) table.libraries.set(root.name, module.crate);
  }
  for (const file of rustFiles) {
    if (!reached.has(file)) await build(file, undefined, undefined, true);
  }
  return table;
}

function moduleTable(workspaceRoot: string, fileIndex: WorkspaceFileIndex | undefined): Promise<ModuleTable> {
  if (!fileIndex) return buildModuleTable(workspaceRoot, undefined);
  let pending = tableCache.get(fileIndex);
  if (!pending) {
    pending = buildModuleTable(workspaceRoot, fileIndex);
    tableCache.set(fileIndex, pending);
  }
  return pending;
}

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------

interface Resolved {
  /** Every module the path named, in order. */
  modules:   Module[];
  /** The item the path ended on, if it ended on one. */
  item?:     { module: Module; name: string };
  /** The crate name of a path the workspace does not contain. */
  external?: string;
}

/** What `name` means inside `module`: a child module, an item, a `use` binding, or something a glob brings in. */
function lookup(module: Module, name: string, table: ModuleTable, seen: Set<string>): Resolved | undefined {
  const child = module.children.get(name);
  if (child) return { modules: [child] };
  if (module.facts.items.has(name)) return { modules: [], item: { module, name } };
  const binding = module.facts.uses.find((use) => use.name === name);
  if (binding) return resolvePath(binding.path, module, table, seen);
  for (const globPath of module.facts.globs) {
    const target = resolvePath(globPath, module, table, seen);
    const source = target.modules[target.modules.length - 1];
    if (!source || target.item) continue;
    const found = lookup(source, name, table, seen);
    if (found) return { ...found, modules: [...target.modules, ...found.modules] };
  }
  return undefined;
}

function resolvePath(segments: string[], from: Module, table: ModuleTable, seen = new Set<string>()): Resolved {
  const key = `${from.file}|${from.facts.name ?? ""}|${segments.join("::")}`;
  if (seen.has(key)) return { modules: [] };
  seen.add(key);

  let current: Module | undefined;
  let index = 0;
  const modules: Module[] = [];
  const [head] = segments;

  if (head === "crate") {
    current = from.crate.root;
    index = 1;
  } else if (head === "self") {
    current = from;
    index = 1;
  } else if (head === "super") {
    current = from;
    while (segments[index] === "super") {
      current = current?.parent;
      index += 1;
    }
  } else {
    const found = lookup(from, head, table, seen);
    if (found) {
      modules.push(...found.modules);
      if (found.item) return { modules, item: found.item };
      current = modules[modules.length - 1];
      index = 1;
    } else if (table.libraries.has(head)) {
      current = table.libraries.get(head)!.root;
      index = 1;
    } else {
      return { modules: [], external: head };
    }
  }
  if (!current) return { modules };
  if (!modules.includes(current)) modules.push(current);

  for (; index < segments.length; index += 1) {
    const found = lookup(current, segments[index], table, seen);
    if (!found) break;
    for (const module of found.modules) if (!modules.includes(module)) modules.push(module);
    if (found.item) return { modules, item: found.item };
    current = modules[modules.length - 1];
  }
  return { modules };
}

// ---------------------------------------------------------------------------
// Adapter output
// ---------------------------------------------------------------------------

function toSymbols(facts: FileFacts): PublicSymbolEntry[] {
  return facts.declarations
    .filter((declared) => declared.published)
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

function toDependencies(thisFile: string, table: ModuleTable): DependencyEntry[] {
  const byTarget = new Map<string, Set<string>>();
  const external = new Map<string, Set<string>>();
  const link = (file: string, symbol?: string): void => {
    if (file === thisFile) return;
    const symbols = byTarget.get(file) ?? new Set<string>();
    if (symbol) symbols.add(symbol);
    byTarget.set(file, symbols);
  };
  const linkResolved = (resolved: Resolved, imported?: string, fromUse = false): void => {
    for (const module of resolved.modules) link(module.file);
    if (resolved.item) link(resolved.item.module.file, resolved.item.name);
    if (!resolved.external || STANDARD_CRATES.has(resolved.external)) return;
    // A crate is named at the head of a `use` path, or as a lowercase qualifier in an expression; `Vec::new()` names a prelude type, not a crate.
    if (!fromUse && !/^[a-z][a-z0-9_]*$/u.test(resolved.external)) return;
    const symbols = external.get(resolved.external) ?? new Set<string>();
    if (imported) symbols.add(imported);
    external.set(resolved.external, symbols);
  };

  for (const module of table.byFile.get(thisFile) ?? []) {
    for (const name of module.facts.declared) {
      const child = module.children.get(name);
      if (child) link(child.file);
    }
    for (const segments of module.facts.paths) {
      const resolved = resolvePath(segments, module, table);
      const fromUse  = module.facts.imported.has(segments.join("::"));
      linkResolved(resolved, fromUse ? segments[segments.length - 1] : undefined, fromUse || module.facts.globs.includes(segments));
    }
    for (const globPath of module.facts.globs) {
      const target = resolvePath(globPath, module, table);
      const source = target.modules[target.modules.length - 1];
      if (!source || target.item) continue;
      for (const name of module.facts.identifiers) {
        const found = lookup(source, name, table, new Set());
        if (found?.item) linkResolved({ modules: [...target.modules, ...found.modules], item: found.item });
      }
    }
  }

  const dependencies: DependencyEntry[] = Array.from(byTarget.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([file, symbols]) => ({ specifier: file, resolvedPath: file, symbols: Array.from(symbols).sort(), kind: "import" as const }));
  for (const [crate, symbols] of Array.from(external.entries()).sort(([left], [right]) => left.localeCompare(right))) {
    dependencies.push({ specifier: crate, symbols: Array.from(symbols).sort(), kind: "import" });
  }
  return dependencies;
}

/** Language adapter for Rust (`.rs`): tree-sitter symbols and path resolution through the crate's module tree. */
export const rustAdapter: LanguageAdapter = {
  id:         "rust",
  extensions: [".rs"],
  async analyze({ absolutePath, workspaceRoot, fileIndex }): Promise<SourceAnalysisResult | null> {
    const facts    = await fileFacts(absolutePath);
    const table    = await moduleTable(workspaceRoot, fileIndex);
    const thisFile = normalizeWorkspacePath(path.relative(workspaceRoot, absolutePath));
    return {
      symbols:      toSymbols(facts),
      dependencies: toDependencies(thisFile, table)
    };
  }
};
