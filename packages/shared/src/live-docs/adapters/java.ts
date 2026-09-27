/**
 * Java adapter: tree-sitter symbols and compiler-style name resolution across
 * the workspace.
 *
 * A file's symbols are the types it declares, top-level and nested, and the
 * members those types expose (public or protected, or any member of an
 * interface), with Javadoc from the comment above each declaration.
 *
 * Dependencies come from every type name the file uses, resolved the way javac
 * resolves a simple name: a nested type of an enclosing type, a type declared
 * in the same file, a single-type import, a type of the same package, then a
 * type of an on-demand (`.*`) import. A qualified name is looked up as written.
 * The workspace's types are tabled once per generation run from the `package`
 * declarations of every `.java` file, so a package split across `src/main` and
 * `src/test` is one package, as it is to the compiler. Names inside strings and
 * comments are never references.
 */
import { glob } from "glob";
import { promises as fs } from "node:fs";
import path from "node:path";

import { javaSyntax } from "../../languages";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult, SymbolDocumentation, TypeReference } from "../core";
import type { LanguageAdapter, WorkspaceFileIndex } from "./index";
import { parseJavaDoc } from "./java.javadoc";
import { parseSource, type SyntaxNode } from "./treeSitter";

// ---------------------------------------------------------------------------
// Facts about one compilation unit
// ---------------------------------------------------------------------------

interface JavaImport {
  /** The imported name's parts; `a.b.C` or, for an on-demand import, the package or type `a.b`. */
  parts:    string[];
  wildcard: boolean;
  isStatic: boolean;
}

interface DeclaredMember {
  name:           string;
  kind:           string;
  line:           number;
  character:      number;
  documentation?: SymbolDocumentation;
  typeReferences: TypeReference[];
  published:      boolean;
}

interface DeclaredType {
  name:           string;
  /** Package-qualified, with enclosing types: `com.acme.store.Inventory.Listener`. */
  qualifiedName:  string;
  kind:           string;
  line:           number;
  character:      number;
  documentation?: SymbolDocumentation;
  typeReferences: TypeReference[];
  members:        DeclaredMember[];
  nested:         DeclaredType[];
}

/** A type name used somewhere in the file, with the types it is written inside, innermost first. */
interface TypeUse {
  chain:     string[];
  enclosing: string[];
}

interface FileFacts {
  package:  string;
  imports:  JavaImport[];
  types:    DeclaredType[];
  typeUses: TypeUse[];
}

const TYPE_DECLARATIONS: Record<string, string> = {
  class_declaration:           "class",
  interface_declaration:       "interface",
  enum_declaration:            "enum",
  record_declaration:          "record",
  annotation_type_declaration: "annotation"
};

const JDK_PACKAGES = ["java.", "javax.", "jdk."];

function position(node: SyntaxNode): { line: number; character: number } {
  return { line: node.startPosition.row + 1, character: node.startPosition.column + 1 };
}

/** The identifiers of a dotted name: `scoped_identifier`, `scoped_type_identifier`, `field_access` or a lone identifier. */
function nameChain(node: SyntaxNode | null): string[] | undefined {
  if (!node) return undefined;
  switch (node.type) {
    case "identifier":
    case "type_identifier":
      return [node.text];
    case "scoped_identifier":
    case "scoped_type_identifier": {
      const parts: string[] = [];
      for (const child of node.namedChildren) {
        if (child.type === "type_arguments") continue;
        const inner = nameChain(child);
        if (!inner) return undefined;
        parts.push(...inner);
      }
      return parts;
    }
    case "field_access": {
      const object = nameChain(node.childForFieldName("object"));
      const field  = node.childForFieldName("field");
      return object && field ? [...object, field.text] : undefined;
    }
    case "generic_type":
      return nameChain(node.namedChildren[0] ?? null);
    default:
      return undefined;
  }
}

function modifiersOf(node: SyntaxNode): Set<string> {
  const modifiers = node.namedChildren.find((child) => child.type === "modifiers");
  return new Set(modifiers?.children.filter((child) => !child.isNamed || child.type.endsWith("annotation")).map((child) => child.type) ?? []);
}

/** The Javadoc block that sits right above a declaration. */
function javadocOf(node: SyntaxNode): SymbolDocumentation | undefined {
  const previous = node.previousNamedSibling;
  return previous?.type === "block_comment" ? parseJavaDoc(previous.text) : undefined;
}

class FileExtractor {
  private readonly facts: FileFacts = { package: "", imports: [], types: [], typeUses: [] };

  extract(root: SyntaxNode): FileFacts {
    for (const child of root.namedChildren) {
      if (child.type === "package_declaration") {
        this.facts.package = nameChain(child.namedChildren.find((part) => part.type !== "modifiers" && !part.type.endsWith("annotation")) ?? null)?.join(".") ?? "";
      } else if (child.type === "import_declaration") {
        this.readImport(child);
      } else if (child.type in TYPE_DECLARATIONS) {
        this.facts.types.push(this.readType(child, [], []));
      }
    }
    return this.facts;
  }

  private readImport(node: SyntaxNode): void {
    const name = node.namedChildren.find((child) => child.type === "scoped_identifier" || child.type === "identifier");
    const parts = nameChain(name ?? null);
    if (!parts) return;
    this.facts.imports.push({
      parts,
      wildcard: node.namedChildren.some((child) => child.type === "asterisk"),
      isStatic: node.children.some((child) => child.type === "static")
    });
  }

  private readType(node: SyntaxNode, enclosing: string[], outerTypeParameters: string[]): DeclaredType {
    const nameNode      = node.childForFieldName("name")!;
    const name          = nameNode.text;
    const qualifiedName = [enclosing[0] ?? this.facts.package, name].filter(Boolean).join(".");
    const kind          = TYPE_DECLARATIONS[node.type];
    const typeParameters = [...outerTypeParameters, ...this.typeParameterNames(node)];
    const scope         = [qualifiedName, ...enclosing];
    const { line, character } = position(nameNode);

    const typeReferences: TypeReference[] = [];
    const superclass = node.childForFieldName("superclass");
    if (superclass) this.collectTypeNames(superclass, "extends", typeReferences, typeParameters, scope);
    const interfaces = node.childForFieldName("interfaces");
    if (interfaces) this.collectTypeNames(interfaces, "implements", typeReferences, typeParameters, scope);
    for (const child of node.namedChildren) {
      if (child.type === "extends_interfaces") this.collectTypeNames(child, "extends", typeReferences, typeParameters, scope);
    }
    for (const parameter of node.childForFieldName("type_parameters")?.namedChildren ?? []) {
      for (const bound of parameter.namedChildren.filter((child) => child.type === "type_bound")) {
        this.collectTypeNames(bound, "generic-constraint", typeReferences, typeParameters, scope);
      }
    }
    this.visitAnnotations(node, scope);

    const declared: DeclaredType = {
      name, qualifiedName, kind, line, character,
      documentation: javadocOf(node),
      typeReferences,
      members: [],
      nested:  []
    };

    const implicitlyPublic = kind === "interface" || kind === "annotation";
    for (const parameter of node.childForFieldName("parameters")?.namedChildren ?? []) {
      const member = this.readParameterAsField(parameter, typeParameters, scope);
      if (member) declared.members.push(member);
    }
    const body = node.childForFieldName("body");
    for (const child of body?.namedChildren ?? []) {
      this.readMember(child, declared, scope, typeParameters, implicitlyPublic);
    }
    return declared;
  }

  private readMember(node: SyntaxNode, owner: DeclaredType, scope: string[], typeParameters: string[], implicitlyPublic: boolean): void {
    if (node.type in TYPE_DECLARATIONS) {
      owner.nested.push(this.readType(node, scope, typeParameters));
      return;
    }
    if (node.type === "enum_body_declarations") {
      for (const child of node.namedChildren) this.readMember(child, owner, scope, typeParameters, implicitlyPublic);
      return;
    }
    if (node.type === "enum_constant") {
      const nameNode = node.childForFieldName("name")!;
      owner.members.push({ name: nameNode.text, kind: "field", ...position(nameNode), documentation: javadocOf(node), typeReferences: [], published: true });
      this.visitExpressions(node, scope);
      return;
    }

    const modifiers = modifiersOf(node);
    const published = implicitlyPublic || modifiers.has("public") || modifiers.has("protected");
    this.visitAnnotations(node, scope);

    switch (node.type) {
      case "method_declaration":
      case "constructor_declaration":
      case "annotation_type_element_declaration": {
        const nameNode       = node.childForFieldName("name")!;
        const ownTypeParameters = [...typeParameters, ...this.typeParameterNames(node)];
        const typeReferences: TypeReference[] = [];
        const returnType = node.childForFieldName("type");
        if (returnType) this.collectTypeNames(returnType, "return", typeReferences, ownTypeParameters, scope);
        for (const parameter of node.childForFieldName("parameters")?.namedChildren ?? []) {
          const type = parameter.childForFieldName("type") ?? parameter.namedChildren.find((child) => child.type.endsWith("type") || child.type === "type_identifier" || child.type === "scoped_type_identifier");
          const parameterName = parameter.childForFieldName("name")?.text ?? parameter.namedChildren.find((child) => child.type === "variable_declarator")?.childForFieldName("name")?.text;
          if (type) this.collectTypeNames(type, "parameter", typeReferences, ownTypeParameters, scope, parameterName);
        }
        for (const child of node.namedChildren) {
          if (child.type === "throws") this.visitTypes(child, scope, ownTypeParameters);
        }
        owner.members.push({
          name:          nameNode.text,
          kind:          node.type === "constructor_declaration" ? "constructor" : "method",
          ...position(nameNode),
          documentation: javadocOf(node),
          typeReferences,
          published
        });
        const body = node.childForFieldName("body");
        if (body) this.visitExpressions(body, scope, ownTypeParameters);
        return;
      }
      case "field_declaration":
      case "constant_declaration": {
        const type = node.childForFieldName("type");
        const typeReferences: TypeReference[] = [];
        if (type) this.collectTypeNames(type, "property", typeReferences, typeParameters, scope);
        for (const declarator of node.namedChildren.filter((child) => child.type === "variable_declarator")) {
          const nameNode = declarator.childForFieldName("name")!;
          owner.members.push({ name: nameNode.text, kind: "field", ...position(nameNode), documentation: javadocOf(node), typeReferences, published });
          const value = declarator.childForFieldName("value");
          if (value) this.visitExpressions(value, scope, typeParameters);
        }
        return;
      }
      default:
        this.visitExpressions(node, scope, typeParameters);
    }
  }

  private readParameterAsField(parameter: SyntaxNode, typeParameters: string[], scope: string[]): DeclaredMember | undefined {
    const nameNode = parameter.childForFieldName("name");
    const type     = parameter.childForFieldName("type");
    if (!nameNode) return undefined;
    const typeReferences: TypeReference[] = [];
    if (type) this.collectTypeNames(type, "property", typeReferences, typeParameters, scope);
    return { name: nameNode.text, kind: "field", ...position(nameNode), typeReferences, published: true };
  }

  private typeParameterNames(node: SyntaxNode): string[] {
    return (node.childForFieldName("type_parameters")?.namedChildren ?? [])
      .map((parameter) => parameter.namedChildren.find((child) => child.type === "type_identifier" || child.type === "identifier")?.text ?? "")
      .filter(Boolean);
  }

  /** Records the type names a type expression mentions as references, and as uses. */
  private collectTypeNames(node: SyntaxNode, role: TypeReference["role"], into: TypeReference[], typeParameters: string[], scope: string[], parameterName?: string): void {
    const visit = (current: SyntaxNode, currentRole: TypeReference["role"]): void => {
      switch (current.type) {
        case "type_identifier":
        case "scoped_type_identifier": {
          const chain = nameChain(current);
          if (!chain) return;
          this.useType(chain, scope, typeParameters);
          const name = chain.join(".");
          if (chain.length === 1 && (javaSyntax.isFrameworkType(name) || typeParameters.includes(name))) return;
          if (!into.some((reference) => reference.name === name && reference.role === currentRole && reference.parameterName === parameterName)) {
            into.push(parameterName ? { name, role: currentRole, parameterName } : { name, role: currentRole });
          }
          if (current.type === "scoped_type_identifier") {
            for (const child of current.namedChildren) {
              if (child.type === "type_arguments") visit(child, "type-argument");
            }
          }
          return;
        }
        case "type_arguments":
          for (const child of current.namedChildren) visit(child, "type-argument");
          return;
        case "generic_type": {
          const [head, ...rest] = current.namedChildren;
          if (head) visit(head, currentRole);
          for (const child of rest) visit(child, "type-argument");
          return;
        }
        default:
          for (const child of current.namedChildren) visit(child, currentRole);
      }
    };
    visit(node, role);
  }

  private visitAnnotations(node: SyntaxNode, scope: string[]): void {
    const modifiers = node.namedChildren.find((child) => child.type === "modifiers");
    for (const annotation of modifiers?.namedChildren ?? []) {
      if (!annotation.type.endsWith("annotation")) continue;
      const chain = nameChain(annotation.childForFieldName("name"));
      if (chain) this.useType(chain, scope, []);
      const argumentList = annotation.childForFieldName("arguments");
      if (argumentList) this.visitExpressions(argumentList, scope, []);
    }
  }

  /** Every type name written in a subtree, as a use. */
  private visitTypes(node: SyntaxNode, scope: string[], typeParameters: string[]): void {
    if (node.type === "type_identifier" || node.type === "scoped_type_identifier") {
      const chain = nameChain(node);
      if (chain) this.useType(chain, scope, typeParameters);
      if (node.type === "scoped_type_identifier") {
        for (const child of node.namedChildren) {
          if (child.type === "type_arguments") this.visitTypes(child, scope, typeParameters);
        }
      }
      return;
    }
    for (const child of node.namedChildren) this.visitTypes(child, scope, typeParameters);
  }

  /** Statements and expressions: type names in declarations, casts and `new`, plus the qualifier of a static call or field. */
  private visitExpressions(node: SyntaxNode, scope: string[], typeParameters: string[] = []): void {
    switch (node.type) {
      case "type_identifier":
      case "scoped_type_identifier":
        this.visitTypes(node, scope, typeParameters);
        return;
      case "method_invocation":
      case "field_access":
      case "method_reference": {
        const object = node.type === "method_reference" ? node.namedChildren[0] : node.childForFieldName("object");
        const chain  = nameChain(object ?? null);
        if (chain && object && object.type !== "type_identifier" && object.type !== "scoped_type_identifier") this.facts.typeUses.push({ chain, enclosing: scope });
        for (const child of node.namedChildren) {
          if (object && child.id === object.id && chain) continue;
          this.visitExpressions(child, scope, typeParameters);
        }
        return;
      }
      case "marker_annotation":
      case "annotation": {
        const chain = nameChain(node.childForFieldName("name"));
        if (chain) this.useType(chain, scope, typeParameters);
        const argumentList = node.childForFieldName("arguments");
        if (argumentList) this.visitExpressions(argumentList, scope, typeParameters);
        return;
      }
      case "local_variable_declaration":
      case "class_declaration":
      case "interface_declaration":
      case "enum_declaration":
      case "record_declaration":
        break;
      default:
        break;
    }
    if (node.type in TYPE_DECLARATIONS) {
      // A local or anonymous type declared inside a method body: its uses count, its symbols do not.
      for (const child of node.namedChildren) this.visitExpressions(child, scope, typeParameters);
      return;
    }
    for (const child of node.namedChildren) this.visitExpressions(child, scope, typeParameters);
  }

  private useType(chain: string[], scope: string[], typeParameters: string[]): void {
    if (chain.length === 1 && (javaSyntax.isFrameworkType(chain[0]) || typeParameters.includes(chain[0]))) return;
    this.facts.typeUses.push({ chain, enclosing: scope });
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
  const tree    = await parseSource("java", content);
  try {
    const facts = new FileExtractor().extract(tree.rootNode);
    factsCache.set(absolutePath, { mtimeMs: stats.mtimeMs, facts });
    return facts;
  } finally {
    tree.delete();
  }
}

// ---------------------------------------------------------------------------
// The workspace's types, by qualified name and by package
// ---------------------------------------------------------------------------

interface TypeRecord {
  file: string;
  type: DeclaredType;
}

interface TypeTable {
  byQualifiedName: Map<string, TypeRecord[]>;
  byPackage:       Map<string, Map<string, TypeRecord[]>>;
}

const tableCache = new WeakMap<WorkspaceFileIndex, Promise<TypeTable>>();

async function listJavaFiles(workspaceRoot: string, fileIndex: WorkspaceFileIndex | undefined): Promise<string[]> {
  if (fileIndex) {
    return Array.from(fileIndex).filter((file) => file.endsWith(".java")).sort();
  }
  const files = await glob("**/*.java", {
    cwd:                  workspaceRoot,
    ignore:               ["**/node_modules/**", "**/target/**", "**/build/**", "**/out/**"],
    nodir:                true,
    windowsPathsNoEscape: true
  });
  return files.map((file) => normalizeWorkspacePath(file)).sort();
}

function tableType(table: TypeTable, packageName: string, file: string, type: DeclaredType): void {
  const records = table.byQualifiedName.get(type.qualifiedName) ?? [];
  records.push({ file, type });
  table.byQualifiedName.set(type.qualifiedName, records);
  if (!type.qualifiedName.includes(".") || type.qualifiedName === `${packageName}.${type.name}`) {
    const inPackage = table.byPackage.get(packageName) ?? new Map<string, TypeRecord[]>();
    inPackage.set(type.name, records);
    table.byPackage.set(packageName, inPackage);
  }
  for (const nested of type.nested) tableType(table, packageName, file, nested);
}

async function buildTypeTable(workspaceRoot: string, fileIndex: WorkspaceFileIndex | undefined): Promise<TypeTable> {
  const table: TypeTable = { byQualifiedName: new Map(), byPackage: new Map() };
  for (const file of await listJavaFiles(workspaceRoot, fileIndex)) {
    let facts: FileFacts;
    try {
      facts = await fileFacts(path.join(workspaceRoot, file));
    } catch {
      continue;
    }
    for (const type of facts.types) tableType(table, facts.package, file, type);
  }
  return table;
}

function typeTable(workspaceRoot: string, fileIndex: WorkspaceFileIndex | undefined): Promise<TypeTable> {
  if (!fileIndex) return buildTypeTable(workspaceRoot, undefined);
  let pending = tableCache.get(fileIndex);
  if (!pending) {
    pending = buildTypeTable(workspaceRoot, fileIndex);
    tableCache.set(fileIndex, pending);
  }
  return pending;
}

/** A simple type name, resolved as javac resolves it from inside `enclosing`. */
function resolveSimple(name: string, enclosing: string[], facts: FileFacts, table: TypeTable): TypeRecord[] {
  for (const outer of enclosing) {
    const nested = table.byQualifiedName.get(`${outer}.${name}`);
    if (nested) return nested;
  }
  const own = facts.types.find((type) => type.name === name);
  if (own) return table.byQualifiedName.get(own.qualifiedName) ?? [];
  for (const entry of facts.imports) {
    if (entry.wildcard || entry.isStatic || entry.parts[entry.parts.length - 1] !== name) continue;
    const records = table.byQualifiedName.get(entry.parts.join("."));
    if (records) return records;
  }
  const samePackage = table.byPackage.get(facts.package)?.get(name);
  if (samePackage) return samePackage;
  for (const entry of facts.imports) {
    if (!entry.wildcard || entry.isStatic) continue;
    const container = entry.parts.join(".");
    const records   = table.byPackage.get(container)?.get(name) ?? table.byQualifiedName.get(`${container}.${name}`);
    if (records) return records;
  }
  return [];
}

/** A name chain, resolved to the innermost type it names: as a qualified name first, then a simple name and its nested types. */
function resolveChain(chain: string[], enclosing: string[], facts: FileFacts, table: TypeTable): TypeRecord[] {
  for (let length = chain.length; length >= 2; length -= 1) {
    const records = table.byQualifiedName.get(chain.slice(0, length).join("."));
    if (records) return records;
  }
  let records = resolveSimple(chain[0], enclosing, facts, table);
  for (const part of chain.slice(1)) {
    const inner = records.flatMap((record) => table.byQualifiedName.get(`${record.type.qualifiedName}.${part}`) ?? []);
    if (inner.length === 0) break;
    records = inner;
  }
  return records;
}

// ---------------------------------------------------------------------------
// Adapter output
// ---------------------------------------------------------------------------

function toSymbols(facts: FileFacts): PublicSymbolEntry[] {
  const entries: PublicSymbolEntry[] = [];
  const add = (type: DeclaredType): void => {
    entries.push({
      name:           type.name,
      kind:           type.kind,
      qualifiedName:  type.qualifiedName !== type.name ? type.qualifiedName : undefined,
      location:       { line: type.line, character: type.character },
      documentation:  type.documentation,
      typeReferences: type.typeReferences.length > 0 ? type.typeReferences : undefined
    });
    for (const member of type.members) {
      if (!member.published) continue;
      entries.push({
        name:           member.name,
        kind:           member.kind,
        location:       { line: member.line, character: member.character },
        documentation:  member.documentation,
        typeReferences: member.typeReferences.length > 0 ? member.typeReferences : undefined
      });
    }
    for (const nested of type.nested) add(nested);
  };
  for (const type of facts.types) add(type);
  return entries.sort((left, right) =>
    (left.location!.line - right.location!.line) ||
    (left.location!.character - right.location!.character) ||
    left.name.localeCompare(right.name)
  );
}

function isJdk(parts: string[]): boolean {
  const name = parts.join(".");
  return JDK_PACKAGES.some((prefix) => name.startsWith(prefix));
}

function toDependencies(facts: FileFacts, thisFile: string, table: TypeTable): DependencyEntry[] {
  const byTarget = new Map<string, Set<string>>();
  const link = (record: TypeRecord): void => {
    if (record.file === thisFile) return;
    const symbols = byTarget.get(record.file) ?? new Set<string>();
    symbols.add(record.type.name);
    byTarget.set(record.file, symbols);
  };

  for (const use of facts.typeUses) {
    for (const record of resolveChain(use.chain, use.enclosing, facts, table)) link(record);
  }

  const external: DependencyEntry[] = [];
  for (const entry of facts.imports) {
    if (isJdk(entry.parts)) continue;
    const typeParts = entry.isStatic && !entry.wildcard ? entry.parts.slice(0, -1) : entry.parts;
    const records   = entry.wildcard && !entry.isStatic
      ? (table.byPackage.has(typeParts.join(".")) ? [] : table.byQualifiedName.get(typeParts.join(".")) ?? [])
      : table.byQualifiedName.get(typeParts.join(".")) ?? [];
    if (records.length > 0) {
      for (const record of records) link(record);
      continue;
    }
    if (entry.wildcard && !entry.isStatic && table.byPackage.has(typeParts.join("."))) continue;
    const specifier = `${entry.parts.join(".")}${entry.wildcard ? ".*" : ""}`;
    external.push({ specifier, symbols: entry.wildcard ? [] : [entry.parts[entry.parts.length - 1]], kind: "import" });
  }

  const dependencies: DependencyEntry[] = Array.from(byTarget.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([file, symbols]) => ({ specifier: file, resolvedPath: file, symbols: Array.from(symbols).sort(), kind: "import" as const }));
  return [...dependencies, ...external.sort((left, right) => left.specifier.localeCompare(right.specifier))];
}

/** Language adapter for Java (`.java`): tree-sitter symbols and javac-style name resolution across the workspace. */
export const javaAdapter: LanguageAdapter = {
  id:         "java",
  extensions: [".java"],
  async analyze({ absolutePath, workspaceRoot, fileIndex }): Promise<SourceAnalysisResult | null> {
    const facts    = await fileFacts(absolutePath);
    const table    = await typeTable(workspaceRoot, fileIndex);
    const thisFile = normalizeWorkspacePath(path.relative(workspaceRoot, absolutePath));
    return {
      symbols:      toSymbols(facts),
      dependencies: toDependencies(facts, thisFile, table)
    };
  }
};
