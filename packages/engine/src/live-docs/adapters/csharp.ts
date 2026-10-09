/**
 * C# adapter, built on tree-sitter.
 *
 * Symbols are every type declaration and every member that is public, protected
 * or internal (or any member of an interface), with their XML documentation and
 * the type references in their signatures.
 *
 * Dependencies are the workspace files that declare the types this file names.
 * A name is resolved the way the compiler resolves it: the enclosing types first,
 * then the enclosing namespaces from the inside out, then `using` directives and
 * aliases. Members of a partial class that live in a peer file count as well.
 * Configuration keys, reflection targets and Hangfire jobs are handled by
 * `csharp.dependencies`.
 *
 * Openings are the file's business too. A controller's route attributes become
 * route symbols. An HTTP client call, a stored procedure or table named in a
 * SQL string or a `Table` attribute, and a data context's connection name are
 * matched, through the workspace symbol index, to the file that serves them;
 * those edges are observed from a contract, and the ones nothing serves stay
 * as the opening's name. String expressions are folded through the `const`
 * members the compiler would fold them through.
 *
 * Nothing here grades itself: `npm run oracle:compare` measures this adapter
 * against the compiler on the C# fixtures.
 */
import { glob } from "glob";
import { promises as fs } from "node:fs";
import path from "node:path";

import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type {
  DependencyEntry,
  PublicSymbolEntry,
  SourceAnalysisResult,
  SymbolDocumentation,
  TypeReference
} from "../core";
import type { WorkspaceSymbolIndex } from "../coreTypes";
import {
  ROUTE_KIND,
  chooseServers,
  matchRoute,
  matchSqlObject,
  routeSegments,
  routeSymbolName,
  sqlObjectName,
  sqlReferences,
  type SqlObjectName
} from "../openings";
import { extractDynamicDependencies, type ConfigReference, type ResolvedTypeTarget } from "./csharp.dependencies";
import { buildDocumentationFromLines } from "./csharp.xmldoc";
import type { LanguageAdapter, WorkspaceFileIndex } from "./index";
import { parseSource, type SyntaxNode } from "./treeSitter";

// ---------------------------------------------------------------------------
// What one file declares and names
// ---------------------------------------------------------------------------

interface Scope {
  namespace:      string;
  /** Qualified names of the enclosing types, innermost first. */
  enclosingTypes: string[];
  /** Whether the innermost enclosing type is partial. */
  partial:        boolean;
}

interface DeclaredMember {
  name:            string;
  kind:            string;
  line:            number;
  character:       number;
  documentation?:  SymbolDocumentation;
  typeReferences?: TypeReference[];
  published:       boolean;
}

/** A route an action serves, as a symbol name, at the line of the attribute that declares it. */
interface DeclaredRoute {
  name:      string;
  line:      number;
  character: number;
}

interface DeclaredType {
  name:            string;
  qualifiedName:   string;
  kind:            string;
  partial:         boolean;
  line:            number;
  character:       number;
  documentation?:  SymbolDocumentation;
  typeReferences:  TypeReference[];
  members:         DeclaredMember[];
  /** `const string` members, by name, for configuration keys held in constants. */
  constants:       Map<string, string>;
  /** True for a controller: named so, or derived from one, or given a route prefix. */
  isController:    boolean;
  /** The template a `RoutePrefix` or class-level `Route` attribute puts before every action's route. */
  routePrefix?:    string;
  routes:          DeclaredRoute[];
}

/** A dotted name used somewhere in the file, with the scope it was used from. */
interface NameUse {
  chain: string[];
  scope: Scope;
}

/** A piece of a string expression: text as written, or a name that may fold to a constant. An empty chain is a part nothing can fold. */
type StringPart = { literal: string } | { chain: string[] };

/** A string expression, with the scope it was written in. */
interface StringUse {
  parts: StringPart[];
  scope: Scope;
}

interface ConfigUse extends StringUse {
  kind: ConfigReference["kind"];
}

/** An HTTP call: the method, when the call names one, and the URL as a string expression. */
interface RouteUse extends StringUse {
  method?: string;
}

interface FileFacts {
  usings:         string[];
  aliases:        Map<string, string>;
  namespaces:     Set<string>;
  types:          DeclaredType[];
  nameUses:       NameUse[];
  /** Identifiers used inside partial types; a peer file may declare them. */
  peerMemberUses: NameUse[];
  configUses:     ConfigUse[];
  routeUses:      RouteUse[];
  /** String expressions that read like SQL: they may name procedures and tables. */
  sqlUses:        StringUse[];
  /** Tables named by `Table` attributes, schema first when given. */
  tableUses:      StringUse[];
}

const HTTP_VERB_ATTRIBUTES: Record<string, string> = {
  HttpGet: "GET", HttpPost: "POST", HttpPut: "PUT", HttpDelete: "DELETE", HttpPatch: "PATCH", HttpHead: "HEAD", HttpOptions: "OPTIONS"
};

const HTTP_CLIENT_METHODS: Record<string, string | undefined> = {
  GetAsync: "GET", GetStringAsync: "GET", GetStreamAsync: "GET", GetByteArrayAsync: "GET", GetFromJsonAsync: "GET",
  PostAsync: "POST", PostAsJsonAsync: "POST", PostAsXmlAsync: "POST",
  PutAsync: "PUT", PutAsJsonAsync: "PUT", PutAsXmlAsync: "PUT",
  PatchAsync: "PATCH", PatchAsJsonAsync: "PATCH",
  DeleteAsync: "DELETE", DeleteFromJsonAsync: "DELETE"
};

const CONTROLLER_BASES = new Set(["ApiController", "Controller", "ControllerBase"]);

const SQL_VERB = /\b(?:EXEC(?:UTE)?|INSERT\s+INTO|DELETE\s+FROM|UPDATE|FROM|JOIN|MERGE\s+INTO|TRUNCATE\s+TABLE)\s/iu;

const TYPE_KINDS: Record<string, string> = {
  class_declaration:     "class",
  struct_declaration:    "struct",
  interface_declaration: "interface",
  enum_declaration:      "enum",
  record_declaration:    "record",
  delegate_declaration:  "delegate"
};

const MEMBER_KINDS: Record<string, string> = {
  method_declaration:      "method",
  constructor_declaration: "constructor",
  property_declaration:    "property",
  field_declaration:       "field",
  event_field_declaration: "event",
  event_declaration:       "event"
};

const PUBLISHING_MODIFIERS = new Set(["public", "protected", "internal"]);

const LITERAL_NODES = new Set([
  "comment",
  "string_literal",
  "verbatim_string_literal",
  "raw_string_literal",
  "character_literal",
  "integer_literal",
  "real_literal",
  "interpolated_string_text",
  "preprocessor_call"
]);

/** Names that appear in nearly every file and would only clutter the Parameters and Returns lines. */
const FRAMEWORK_TYPES = new Set([
  "object", "Object", "string", "String", "int", "Int32", "Int64", "long", "short", "Int16", "uint", "ulong", "ushort",
  "float", "Single", "double", "Double", "decimal", "Decimal", "bool", "Boolean", "byte", "Byte", "sbyte", "SByte",
  "char", "Char", "void", "Void", "dynamic", "var",
  "ValueType", "Enum", "Array", "Delegate", "MulticastDelegate", "Type", "Exception",
  "IDisposable", "IAsyncDisposable", "IEnumerable", "IEnumerator", "IComparable", "IEquatable", "ICloneable", "IFormattable", "IConvertible",
  "Task", "ValueTask", "Nullable", "List", "IList", "ICollection", "IReadOnlyList", "IReadOnlyCollection",
  "Dictionary", "IDictionary", "IReadOnlyDictionary", "HashSet", "ISet", "Func", "Action", "EventHandler", "EventArgs",
  "DateTime", "DateTimeOffset", "TimeSpan", "Guid", "Uri", "CancellationToken", "Stream"
]);

function joinNames(container: string, name: string): string {
  return container ? `${container}.${name}` : name;
}

function modifiersOf(node: SyntaxNode): Set<string> {
  return new Set(node.children.filter((child) => child.type === "modifier").map((child) => child.text));
}

function fieldText(node: SyntaxNode, field: string): string {
  return node.childForFieldName(field)?.text.replace(/\s+/g, "") ?? "";
}

/** The `///` lines that sit directly above a declaration, with nothing but attributes between. */
function leadingDocumentation(node: SyntaxNode): SymbolDocumentation | undefined {
  const lines: string[] = [];
  let expectedRow = node.startPosition.row;
  let sibling     = node.previousNamedSibling;
  while (sibling && sibling.type === "comment" && sibling.text.startsWith("///") && sibling.endPosition.row === expectedRow - 1) {
    lines.unshift(sibling.text);
    expectedRow = sibling.startPosition.row;
    sibling     = sibling.previousNamedSibling;
  }
  return lines.length > 0 ? buildDocumentationFromLines(lines) : undefined;
}

/** The identifiers of a dotted name, or null when the expression is not a plain name chain. */
function identifierChain(node: SyntaxNode | null): string[] | null {
  if (!node) return null;
  switch (node.type) {
    case "identifier":
      return [node.text];
    case "generic_name": {
      const identifier = node.namedChildren.find((child) => child.type === "identifier");
      return identifier ? [identifier.text] : null;
    }
    case "qualified_name": {
      const qualifier = identifierChain(node.childForFieldName("qualifier"));
      const name      = identifierChain(node.childForFieldName("name"));
      return qualifier && name ? [...qualifier, ...name] : null;
    }
    case "member_access_expression": {
      const expression = identifierChain(node.childForFieldName("expression"));
      const name       = identifierChain(node.childForFieldName("name"));
      return expression && name ? [...expression, ...name] : null;
    }
    case "alias_qualified_name":
      return identifierChain(node.childForFieldName("name"));
    default:
      return null;
  }
}

function stringLiteralValue(node: SyntaxNode | null | undefined): string | undefined {
  if (!node) return undefined;
  if (node.type === "equals_value_clause") {
    return stringLiteralValue(node.namedChildren[0]);
  }
  if (node.type === "string_literal" || node.type === "verbatim_string_literal") {
    const match = /^@?"([\s\S]*)"$/u.exec(node.text);
    return match ? match[1] : undefined;
  }
  return undefined;
}

/** One attribute on a declaration: its name without the `Attribute` suffix, its positional arguments and its named ones. */
interface DeclaredAttribute {
  name:       string;
  node:       SyntaxNode;
  positional: SyntaxNode[];
  named:      Map<string, SyntaxNode>;
}

function attributesOf(node: SyntaxNode): DeclaredAttribute[] {
  const attributes: DeclaredAttribute[] = [];
  for (const list of node.namedChildren.filter((child) => child.type === "attribute_list")) {
    for (const attribute of list.namedChildren.filter((child) => child.type === "attribute")) {
      const chain = identifierChain(attribute.childForFieldName("name"));
      if (!chain) continue;
      const declared: DeclaredAttribute = { name: chain[chain.length - 1].replace(/Attribute$/u, ""), node: attribute, positional: [], named: new Map() };
      const argumentList = attribute.namedChildren.find((child) => child.type === "attribute_argument_list");
      for (const argument of argumentList?.namedChildren ?? []) {
        if (argument.type !== "attribute_argument") continue;
        const expression = argument.namedChildren[argument.namedChildren.length - 1];
        if (!expression) continue;
        if (expression.type === "assignment_expression") {
          const left  = expression.childForFieldName("left") ?? expression.namedChildren[0];
          const right = expression.childForFieldName("right") ?? expression.namedChildren[1];
          if (left && right) declared.named.set(left.text, right);
        } else if (argument.namedChildren.length > 1 && argument.namedChildren[0].type === "name_equals") {
          declared.named.set(argument.namedChildren[0].text.replace(/\s*=\s*$/u, ""), expression);
        } else {
          declared.positional.push(expression);
        }
      }
      attributes.push(declared);
    }
  }
  return attributes;
}

/** The parts of a string expression: literals, interpolations and concatenations. Null when the expression is not one. */
function stringParts(node: SyntaxNode | null | undefined): StringPart[] | null {
  if (!node) return null;
  switch (node.type) {
    case "string_literal":
    case "verbatim_string_literal": {
      const value = stringLiteralValue(node);
      return value === undefined ? null : [{ literal: value }];
    }
    case "interpolated_string_expression": {
      const parts: StringPart[] = [];
      for (const child of node.namedChildren) {
        if (child.type === "string_content" || child.type === "interpolated_string_text") {
          parts.push({ literal: child.text });
        } else if (child.type === "interpolation") {
          const inner = child.namedChildren.find((candidate) => candidate.type !== "interpolation_brace");
          parts.push({ chain: identifierChain(inner ?? null) ?? [] });
        }
      }
      return parts;
    }
    case "parenthesized_expression":
      return stringParts(node.namedChildren[0]);
    case "binary_expression": {
      if (!node.children.some((child) => child.type === "+")) return null;
      const leftNode  = node.childForFieldName("left")  ?? node.namedChildren[0];
      const rightNode = node.childForFieldName("right") ?? node.namedChildren[1];
      const left  = stringParts(leftNode)  ?? [{ chain: identifierChain(leftNode  ?? null) ?? [] }];
      const right = stringParts(rightNode) ?? [{ chain: identifierChain(rightNode ?? null) ?? [] }];
      const parts = [...left, ...right];
      return parts.some((part) => "literal" in part) ? parts : null;
    }
    default:
      return null;
  }
}

/** The single string literal an attribute argument holds, if that is what it is. */
function literalOf(node: SyntaxNode | undefined): string | undefined {
  return node ? stringLiteralValue(node) : undefined;
}

/** The HTTP method a Web API action answers when no attribute says: the one its name starts with. */
function verbFromName(name: string): string | undefined {
  const match = /^(Get|Post|Put|Delete|Patch|Head|Options)(?=[A-Z_]|$)/u.exec(name);
  return match ? match[1].toUpperCase() : undefined;
}

function joinRoute(prefix: string, template: string): string {
  if (template.startsWith("~/")) return template.slice(2);
  const left  = prefix.replace(/\/+$/u, "");
  const right = template.replace(/^\/+/u, "");
  return left && right ? `${left}/${right}` : left || right;
}

/** True when this identifier is the name being declared rather than a name being used. */
function isDeclaredName(node: SyntaxNode): boolean {
  const parent = node.parent;
  if (!parent) return false;
  if (parent.type === "name_colon" || parent.type === "name_equals" || parent.type === "member_binding_expression") {
    return true;
  }
  const nameNode = parent.childForFieldName("name");
  if (!nameNode || !nameNode.equals(node)) return false;
  return parent.type !== "attribute" && parent.type !== "alias_qualified_name";
}

/** The simple names referenced by a type node, outermost first, with generic arguments and element types included. */
function typeReferencesOf(node: SyntaxNode | null, role: TypeReference["role"], parameterName?: string): TypeReference[] {
  if (!node) return [];
  const references: TypeReference[] = [];
  const add = (name: string | undefined) => {
    if (name && !FRAMEWORK_TYPES.has(name)) {
      references.push(parameterName ? { name, role, parameterName } : { name, role });
    }
  };
  switch (node.type) {
    case "identifier":
      add(node.text);
      break;
    case "generic_name": {
      add(node.namedChildren.find((child) => child.type === "identifier")?.text);
      const arguments_ = node.namedChildren.find((child) => child.type === "type_argument_list");
      for (const argument of arguments_?.namedChildren ?? []) {
        references.push(...typeReferencesOf(argument, role, parameterName));
      }
      break;
    }
    case "qualified_name":
    case "alias_qualified_name":
      references.push(...typeReferencesOf(node.childForFieldName("name"), role, parameterName));
      break;
    case "nullable_type":
    case "array_type":
    case "pointer_type":
    case "ref_type":
    case "scoped_type":
      references.push(...typeReferencesOf(node.childForFieldName("type") ?? node.namedChildren[0] ?? null, role, parameterName));
      break;
    case "tuple_type":
      for (const element of node.namedChildren) {
        references.push(...typeReferencesOf(element.childForFieldName("type") ?? element.namedChildren[0] ?? null, role, parameterName));
      }
      break;
    default:
      break;
  }
  return references;
}

function parameterReferences(parameterList: SyntaxNode | null): TypeReference[] {
  const references: TypeReference[] = [];
  for (const parameter of parameterList?.namedChildren ?? []) {
    if (parameter.type !== "parameter") continue;
    references.push(...typeReferencesOf(parameter.childForFieldName("type"), "parameter", parameter.childForFieldName("name")?.text));
  }
  return references;
}

function baseListReferences(baseList: SyntaxNode, kind: string): TypeReference[] {
  const references: TypeReference[] = [];
  baseList.namedChildren.forEach((entry, index) => {
    const typeNode = entry.type === "primary_constructor_base_type" ? (entry.childForFieldName("type") ?? entry.namedChildren[0] ?? null) : entry;
    const [outer]  = typeReferencesOf(typeNode, "extends");
    if (!outer) return;
    const looksLikeInterface = /^I[A-Z]/u.test(outer.name);
    const role: TypeReference["role"] =
      kind === "interface" ? "extends" : index === 0 && !looksLikeInterface ? "extends" : "implements";
    references.push({ name: outer.name, role });
  });
  return references;
}

function constraintReferences(clause: SyntaxNode): TypeReference[] {
  const references: TypeReference[] = [];
  for (const constraint of clause.namedChildren) {
    if (constraint.type !== "type_parameter_constraint") continue;
    const typeNode = constraint.namedChildren[0];
    if (typeNode) references.push(...typeReferencesOf(typeNode, "generic-constraint"));
  }
  return references;
}

class FileExtractor {
  readonly facts: FileFacts = {
    usings:         [],
    aliases:        new Map(),
    namespaces:     new Set(),
    types:          [],
    nameUses:       [],
    peerMemberUses: [],
    configUses:     [],
    routeUses:      [],
    sqlUses:        [],
    tableUses:      []
  };

  extract(root: SyntaxNode): FileFacts {
    let scope: Scope = { namespace: "", enclosingTypes: [], partial: false };
    for (const child of root.namedChildren) {
      if (child.type === "file_scoped_namespace_declaration") {
        scope = { ...scope, namespace: joinNames(scope.namespace, fieldText(child, "name")) };
        this.facts.namespaces.add(scope.namespace);
        continue;
      }
      this.visitDeclaration(child, scope);
    }
    return this.facts;
  }

  private visitDeclaration(node: SyntaxNode, scope: Scope): void {
    if (node.type === "using_directive") {
      this.recordUsing(node);
      return;
    }
    if (node.type === "namespace_declaration") {
      const inner: Scope = { namespace: joinNames(scope.namespace, fieldText(node, "name")), enclosingTypes: [], partial: false };
      this.facts.namespaces.add(inner.namespace);
      for (const child of node.childForFieldName("body")?.namedChildren ?? []) {
        this.visitDeclaration(child, inner);
      }
      return;
    }
    if (node.type in TYPE_KINDS) {
      this.visitType(node, scope);
      return;
    }
    this.visitExpression(node, scope);
  }

  private recordUsing(node: SyntaxNode): void {
    const alias   = node.childForFieldName("name");
    const targets = node.namedChildren.filter((child) => ["qualified_name", "identifier", "alias_qualified_name", "generic_name"].includes(child.type));
    if (alias) {
      const target = targets.find((candidate) => !candidate.equals(alias));
      if (target) this.facts.aliases.set(alias.text, target.text.replace(/\s+/g, "").replace(/^global::/u, ""));
      return;
    }
    if (node.children.some((child) => child.type === "static")) {
      return;
    }
    const target = targets[0];
    if (target) this.facts.usings.push(target.text.replace(/\s+/g, "").replace(/^global::/u, ""));
  }

  private visitType(node: SyntaxNode, scope: Scope): void {
    const nameNode = node.childForFieldName("name");
    if (!nameNode) {
      this.visitExpression(node, scope);
      return;
    }
    const modifiers     = modifiersOf(node);
    const kind          = TYPE_KINDS[node.type];
    const qualifiedName = joinNames(scope.enclosingTypes[0] ?? scope.namespace, nameNode.text);
    const declared: DeclaredType = {
      name:           nameNode.text,
      qualifiedName,
      kind,
      partial:        modifiers.has("partial"),
      line:           nameNode.startPosition.row + 1,
      character:      nameNode.startPosition.column + 1,
      documentation:  leadingDocumentation(node),
      typeReferences: [],
      members:        [],
      constants:      new Map(),
      isController:   /Controller$/u.test(nameNode.text),
      routes:         []
    };
    const inner: Scope = { namespace: scope.namespace, enclosingTypes: [qualifiedName, ...scope.enclosingTypes], partial: declared.partial };

    for (const attribute of attributesOf(node)) {
      if (attribute.name === "RoutePrefix" || attribute.name === "Route") {
        const template = literalOf(attribute.positional[0]);
        if (template !== undefined) {
          declared.routePrefix = template.replace(/\[controller\]/giu, nameNode.text.replace(/Controller$/u, ""));
          declared.isController = true;
        }
      } else if (attribute.name === "Table") {
        const table  = literalOf(attribute.positional[0]);
        const schema = literalOf(attribute.named.get("Schema"));
        if (table) this.facts.tableUses.push({ parts: [{ literal: schema ? `${schema}.${table}` : table }], scope: inner });
      }
    }

    for (const child of node.namedChildren) {
      if (child.equals(nameNode) || child.type === "modifier" || child.type === "type_parameter_list") continue;
      switch (child.type) {
        case "base_list":
          declared.typeReferences.push(...baseListReferences(child, kind));
          if (declared.typeReferences.some((reference) => CONTROLLER_BASES.has(reference.name))) declared.isController = true;
          this.visitExpression(child, inner);
          break;
        case "type_parameter_constraints_clause":
          declared.typeReferences.push(...constraintReferences(child));
          this.visitExpression(child, inner);
          break;
        case "parameter_list":
          declared.typeReferences.push(...parameterReferences(child));
          this.visitExpression(child, inner);
          break;
        case "declaration_list":
          for (const member of child.namedChildren) {
            if (member.type in TYPE_KINDS) {
              this.visitType(member, inner);
            } else {
              this.visitMember(member, declared, inner);
            }
          }
          break;
        case "enum_member_declaration_list":
          break;
        default:
          this.visitExpression(child, inner);
      }
    }
    this.facts.types.push(declared);
  }

  private visitMember(node: SyntaxNode, owner: DeclaredType, scope: Scope): void {
    const kind = MEMBER_KINDS[node.type];
    if (!kind) {
      this.visitExpression(node, scope);
      return;
    }
    const modifiers      = modifiersOf(node);
    const published      = owner.kind === "interface" || Array.from(modifiers).some((modifier) => PUBLISHING_MODIFIERS.has(modifier));
    const documentation  = leadingDocumentation(node);
    const names: SyntaxNode[]        = [];
    let typeReferences: TypeReference[] = [];

    switch (node.type) {
      case "field_declaration":
      case "event_field_declaration": {
        const declaration = node.namedChildren.find((child) => child.type === "variable_declaration");
        for (const declarator of declaration?.namedChildren ?? []) {
          if (declarator.type !== "variable_declarator") continue;
          const nameNode = declarator.childForFieldName("name");
          if (!nameNode) continue;
          names.push(nameNode);
          if (node.type === "field_declaration" && modifiers.has("const")) {
            const initializer = declarator.namedChildren.find((child) => !child.equals(nameNode));
            const value       = stringLiteralValue(initializer);
            if (value !== undefined) owner.constants.set(nameNode.text, value);
          }
        }
        break;
      }
      case "method_declaration": {
        const nameNode = node.childForFieldName("name");
        if (nameNode) names.push(nameNode);
        typeReferences = [
          ...typeReferencesOf(node.childForFieldName("returns"), "return"),
          ...parameterReferences(node.childForFieldName("parameters"))
        ];
        if (nameNode && published) this.recordRoutes(node, nameNode.text, owner);
        break;
      }
      case "constructor_declaration": {
        const nameNode = node.childForFieldName("name");
        if (nameNode) names.push(nameNode);
        typeReferences = parameterReferences(node.childForFieldName("parameters"));
        const initializer = node.namedChildren.find((child) => child.type === "constructor_initializer");
        if (initializer && initializer.children.some((child) => child.type === "base") && owner.typeReferences.some((reference) => reference.role === "extends" && reference.name === "DbContext")) {
          const argument = initializer.namedChildren.find((child) => child.type === "argument_list")?.namedChildren.find((child) => child.type === "argument");
          this.recordConfigArgument("connectionString", argument?.namedChildren[0] ?? null, scope);
        }
        break;
      }
      default: {
        const nameNode = node.childForFieldName("name");
        if (nameNode) names.push(nameNode);
      }
    }

    for (const nameNode of names) {
      owner.members.push({
        name:           nameNode.text,
        kind,
        line:           nameNode.startPosition.row + 1,
        character:      nameNode.startPosition.column + 1,
        documentation,
        typeReferences: typeReferences.length > 0 ? typeReferences : undefined,
        published
      });
    }

    for (const child of node.namedChildren) {
      if (child.type === "modifier") continue;
      this.visitExpression(child, scope);
    }
  }

  /** The routes an action serves: its verb attributes and `Route` templates under the controller's prefix. */
  private recordRoutes(node: SyntaxNode, methodName: string, owner: DeclaredType): void {
    const verbs: string[]     = [];
    const templates: string[] = [];
    let routed = false;
    let first: SyntaxNode | undefined;
    for (const attribute of attributesOf(node)) {
      const verb = HTTP_VERB_ATTRIBUTES[attribute.name];
      if (verb) {
        verbs.push(verb);
        routed = true;
      } else if (attribute.name === "AcceptVerbs") {
        first ??= attribute.node;
        for (const argument of attribute.positional) {
          const value = literalOf(argument);
          if (value) verbs.push(value.toUpperCase());
        }
        continue;
      } else if (attribute.name !== "Route") {
        continue;
      }
      routed = true;
      first ??= attribute.node;
      const template = literalOf(attribute.positional[0]);
      if (template !== undefined) templates.push(template);
    }
    if (!routed || !(owner.isController || owner.routePrefix !== undefined)) return;
    if (templates.length === 0) templates.push("");
    const inferred = verbFromName(methodName);
    const methods: Array<string | undefined> = verbs.length > 0 ? Array.from(new Set(verbs)) : [inferred];
    for (const template of templates) {
      const full = joinRoute(owner.routePrefix ?? "", template.replace(/\[action\]/giu, methodName));
      for (const method of methods) {
        const name = routeSymbolName(method, full);
        if (!owner.routes.some((route) => route.name === name)) {
          owner.routes.push({ name, line: (first ?? node).startPosition.row + 1, character: (first ?? node).startPosition.column + 1 });
        }
      }
    }
  }

  /** A string expression that reads like SQL is kept, to be folded and searched for the objects it names. */
  private recordStringUse(parts: StringPart[], scope: Scope): void {
    const written = parts.map((part) => ("literal" in part ? part.literal : " ")).join("");
    if (SQL_VERB.test(written)) this.facts.sqlUses.push({ parts, scope });
  }

  /** The URL of an HTTP client call: the argument itself, or the relative part of `new Uri(base, relative)`. */
  private recordRouteUse(method: string | undefined, argument: SyntaxNode | null | undefined, scope: Scope): void {
    let expression = argument;
    if (expression?.type === "object_creation_expression" && expression.childForFieldName("type")?.text === "Uri") {
      const arguments_ = expression.childForFieldName("arguments")?.namedChildren.filter((child) => child.type === "argument") ?? [];
      expression = (arguments_.length > 1 ? arguments_[1] : arguments_[0])?.namedChildren[0] ?? null;
    }
    const parts = stringParts(expression);
    if (parts) this.facts.routeUses.push({ method, parts, scope });
  }

  private recordNameUse(chain: string[], scope: Scope): void {
    this.facts.nameUses.push({ chain, scope });
    if (scope.partial) {
      this.facts.peerMemberUses.push({ chain: [chain[0]], scope });
    }
  }

  private visitGenericArguments(genericName: SyntaxNode, scope: Scope): void {
    const arguments_ = genericName.namedChildren.find((child) => child.type === "type_argument_list");
    for (const argument of arguments_?.namedChildren ?? []) {
      this.visitExpression(argument, scope);
    }
  }

  /** Walks everything below a declaration, recording each name that may refer to a type. */
  private visitExpression(node: SyntaxNode, scope: Scope): void {
    if (node.type === "string_literal" || node.type === "verbatim_string_literal") {
      const parts = stringParts(node);
      if (parts) this.recordStringUse(parts, scope);
      return;
    }
    if (LITERAL_NODES.has(node.type)) return;

    switch (node.type) {
      case "binary_expression":
      case "interpolated_string_expression": {
        const parts = stringParts(node);
        if (parts) this.recordStringUse(parts, scope);
        break;
      }
      case "invocation_expression": {
        const callee   = node.childForFieldName("function") ?? node.namedChildren[0];
        const nameNode = callee?.type === "member_access_expression" ? callee.childForFieldName("name") : callee;
        const name     = nameNode?.type === "generic_name" ? identifierChain(nameNode)?.[0] : nameNode?.type === "identifier" ? nameNode.text : undefined;
        if (name && name in HTTP_CLIENT_METHODS) {
          const argument = node.childForFieldName("arguments")?.namedChildren.find((child) => child.type === "argument");
          this.recordRouteUse(HTTP_CLIENT_METHODS[name], argument?.namedChildren[0], scope);
        }
        break;
      }
      case "using_directive":
        this.recordUsing(node);
        return;
      case "namespace_declaration":
        this.visitDeclaration(node, scope);
        return;
      case "qualified_name": {
        const chain = identifierChain(node);
        if (chain) this.recordNameUse(chain, scope);
        const nameNode = node.childForFieldName("name");
        if (nameNode?.type === "generic_name") this.visitGenericArguments(nameNode, scope);
        return;
      }
      case "member_access_expression": {
        const chain    = identifierChain(node);
        const nameNode = node.childForFieldName("name");
        if (chain) {
          this.recordNameUse(chain, scope);
        } else {
          const expression = node.childForFieldName("expression");
          if (expression) this.visitExpression(expression, scope);
        }
        if (nameNode?.type === "generic_name") this.visitGenericArguments(nameNode, scope);
        return;
      }
      case "generic_name": {
        const identifier = node.namedChildren.find((child) => child.type === "identifier");
        if (identifier) this.recordNameUse([identifier.text], scope);
        this.visitGenericArguments(node, scope);
        return;
      }
      case "alias_qualified_name": {
        const nameNode = node.childForFieldName("name");
        if (nameNode) this.visitExpression(nameNode, scope);
        return;
      }
      case "identifier":
        if (!isDeclaredName(node)) this.recordNameUse([node.text], scope);
        return;
      case "attribute": {
        const nameNode = node.childForFieldName("name");
        const chain    = identifierChain(nameNode);
        if (chain) {
          this.recordNameUse(chain, scope);
          const last = chain[chain.length - 1];
          if (!last.endsWith("Attribute")) this.recordNameUse([...chain.slice(0, -1), `${last}Attribute`], scope);
        }
        for (const child of node.namedChildren) {
          if (!nameNode || !child.equals(nameNode)) this.visitExpression(child, scope);
        }
        return;
      }
      case "element_access_expression":
        this.recordConfigSubscript(node, scope);
        break;
      case "object_creation_expression":
        this.recordChannelFactory(node, scope);
        this.recordHttpRequestMessage(node, scope);
        break;
      case "lambda_expression": {
        const parameters = node.childForFieldName("parameters");
        for (const child of node.namedChildren) {
          if (parameters && child.equals(parameters) && parameters.type === "identifier") continue;
          this.visitExpression(child, scope);
        }
        return;
      }
      case "foreach_statement": {
        const left = node.childForFieldName("left");
        for (const child of node.namedChildren) {
          if (left && child.equals(left) && left.type === "identifier") continue;
          this.visitExpression(child, scope);
        }
        return;
      }
      default:
        break;
    }

    for (const child of node.namedChildren) {
      this.visitExpression(child, scope);
    }
  }

  /** `ConfigurationManager.AppSettings[key]` and `ConnectionStrings[name]`, with the key as a literal or a constant. */
  private recordConfigSubscript(node: SyntaxNode, scope: Scope): void {
    const chain = identifierChain(node.childForFieldName("expression"));
    if (!chain) return;
    const last = chain[chain.length - 1];
    const kind: ConfigUse["kind"] | undefined =
      last === "AppSettings" ? "appSetting" : last === "ConnectionStrings" ? "connectionString" : undefined;
    if (!kind) return;
    const argument = node.childForFieldName("subscript")?.namedChildren.find((child) => child.type === "argument");
    this.recordConfigArgument(kind, argument?.namedChildren[0] ?? null, scope);
  }

  /** `new ChannelFactory<TContract>(endpointName)`: the endpoint name is a client endpoint in the configuration. */
  private recordChannelFactory(node: SyntaxNode, scope: Scope): void {
    const typeNode = node.childForFieldName("type");
    const typeName = typeNode?.type === "generic_name" ? identifierChain(typeNode)?.[0] : typeNode?.text;
    if (typeName !== "ChannelFactory" && typeName !== "DuplexChannelFactory") return;
    const argument = node.childForFieldName("arguments")?.namedChildren.find((child) => child.type === "argument");
    this.recordConfigArgument("endpoint", argument?.namedChildren[0] ?? null, scope);
  }

  /** `new HttpRequestMessage(HttpMethod.Post, url)`: the method is the member named, the URL the second argument. */
  private recordHttpRequestMessage(node: SyntaxNode, scope: Scope): void {
    if (node.childForFieldName("type")?.text !== "HttpRequestMessage") return;
    const arguments_ = node.childForFieldName("arguments")?.namedChildren.filter((child) => child.type === "argument") ?? [];
    if (arguments_.length < 2) return;
    const method = identifierChain(arguments_[0].namedChildren[0] ?? null);
    this.recordRouteUse(method && method[0] === "HttpMethod" ? method[1]?.toUpperCase() : undefined, arguments_[1].namedChildren[0], scope);
  }

  private recordConfigArgument(kind: ConfigUse["kind"], expression: SyntaxNode | null, scope: Scope): void {
    if (!expression) return;
    const parts = stringParts(expression) ?? (identifierChain(expression) ? [{ chain: identifierChain(expression)! }] : null);
    if (parts) this.facts.configUses.push({ kind, parts, scope });
  }
}

// ---------------------------------------------------------------------------
// Per-file facts, cached by modification time
// ---------------------------------------------------------------------------

const factsCache = new Map<string, { mtimeMs: number; facts: FileFacts }>();

async function fileFacts(absolutePath: string): Promise<FileFacts> {
  const stats  = await fs.stat(absolutePath);
  const cached = factsCache.get(absolutePath);
  if (cached && cached.mtimeMs === stats.mtimeMs) {
    return cached.facts;
  }
  const content = await fs.readFile(absolutePath, "utf8");
  const tree    = await parseSource("c-sharp", content);
  try {
    const facts = new FileExtractor().extract(tree.rootNode);
    factsCache.set(absolutePath, { mtimeMs: stats.mtimeMs, facts });
    return facts;
  } finally {
    tree.delete();
  }
}

// ---------------------------------------------------------------------------
// The workspace's types, by qualified name
// ---------------------------------------------------------------------------

interface TypeRecord {
  file: string;
  type: DeclaredType;
}

interface TypeTable {
  byQualifiedName: Map<string, TypeRecord[]>;
  namespaces:      Set<string>;
}

const tableCache = new WeakMap<WorkspaceFileIndex, Promise<TypeTable>>();

async function listCSharpFiles(workspaceRoot: string, fileIndex: WorkspaceFileIndex | undefined): Promise<string[]> {
  if (fileIndex) {
    return Array.from(fileIndex).filter((file) => file.toLowerCase().endsWith(".cs")).sort();
  }
  const files = await glob("**/*.cs", {
    cwd:                 workspaceRoot,
    ignore:              ["**/node_modules/**", "**/bin/**", "**/obj/**"],
    nodir:               true,
    windowsPathsNoEscape: true
  });
  return files.map((file) => normalizeWorkspacePath(file)).sort();
}

async function buildTypeTable(workspaceRoot: string, fileIndex: WorkspaceFileIndex | undefined): Promise<TypeTable> {
  const table: TypeTable = { byQualifiedName: new Map(), namespaces: new Set() };
  for (const file of await listCSharpFiles(workspaceRoot, fileIndex)) {
    let facts: FileFacts;
    try {
      facts = await fileFacts(path.join(workspaceRoot, file));
    } catch {
      continue;
    }
    for (const namespace of facts.namespaces) table.namespaces.add(namespace);
    for (const type of facts.types) {
      const records = table.byQualifiedName.get(type.qualifiedName) ?? [];
      records.push({ file, type });
      table.byQualifiedName.set(type.qualifiedName, records);
    }
  }
  return table;
}

function typeTable(workspaceRoot: string, fileIndex: WorkspaceFileIndex | undefined): Promise<TypeTable> {
  if (!fileIndex) {
    return buildTypeTable(workspaceRoot, undefined);
  }
  let pending = tableCache.get(fileIndex);
  if (!pending) {
    pending = buildTypeTable(workspaceRoot, fileIndex);
    tableCache.set(fileIndex, pending);
  }
  return pending;
}

function namespaceChain(namespace: string): string[] {
  const chain: string[] = [];
  let current = namespace;
  while (current) {
    chain.push(current);
    const dot = current.lastIndexOf(".");
    current   = dot === -1 ? "" : current.slice(0, dot);
  }
  chain.push("");
  return chain;
}

/** Resolves a dotted name from a scope: exact, then relative to each container the compiler would search. */
function resolveSegments(segments: string[], scope: Scope, facts: FileFacts, table: TypeTable): TypeRecord[] {
  const dotted = segments.join(".");
  const containers = [...scope.enclosingTypes, ...namespaceChain(scope.namespace), ...facts.usings];
  for (const container of ["", ...containers]) {
    const records = table.byQualifiedName.get(joinNames(container, dotted));
    if (records) return records;
  }
  return [];
}

/** Resolves the longest prefix of a name chain that names a workspace type. */
function resolveChain(chain: string[], scope: Scope, facts: FileFacts, table: TypeTable): TypeRecord[] {
  const alias    = facts.aliases.get(chain[0]);
  const expanded = alias ? [...alias.split("."), ...chain.slice(1)] : chain;
  for (let length = expanded.length; length >= 1; length -= 1) {
    const records = resolveSegments(expanded.slice(0, length), scope, facts, table);
    if (records.length > 0) return records;
  }
  return [];
}

// ---------------------------------------------------------------------------
// Adapter output
// ---------------------------------------------------------------------------

function toSymbols(facts: FileFacts): PublicSymbolEntry[] {
  const entries: PublicSymbolEntry[] = [];
  for (const type of facts.types) {
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
        typeReferences: member.typeReferences
      });
    }
    for (const route of type.routes) {
      entries.push({ name: route.name, kind: ROUTE_KIND, location: { line: route.line, character: route.character } });
    }
  }
  return entries.sort((left, right) =>
    (left.location!.line - right.location!.line) ||
    (left.location!.character - right.location!.character) ||
    left.name.localeCompare(right.name)
  );
}

function constantValue(chain: string[], scope: Scope, facts: FileFacts, table: TypeTable): string | undefined {
  if (chain.length === 1) {
    for (const qualified of scope.enclosingTypes) {
      for (const record of table.byQualifiedName.get(qualified) ?? []) {
        const value = record.type.constants.get(chain[0]);
        if (value !== undefined) return value;
      }
    }
    return undefined;
  }
  const member = chain[chain.length - 1];
  for (const record of resolveChain(chain.slice(0, -1), scope, facts, table)) {
    const value = record.type.constants.get(member);
    if (value !== undefined) return value;
  }
  return undefined;
}

/**
 * The text of a string expression, its names folded through the constants they
 * name. A name that folds to nothing makes the text `unknown`, or undefined
 * when there is no stand-in for it.
 */
function foldString(use: StringUse, facts: FileFacts, table: TypeTable, unknown: string | undefined): string | undefined {
  let text = "";
  for (const part of use.parts) {
    if ("literal" in part) {
      text += part.literal;
      continue;
    }
    const value = part.chain.length > 0 ? constantValue(part.chain, use.scope, facts, table) : undefined;
    if (value !== undefined) {
      text += value;
    } else if (unknown !== undefined) {
      text += unknown;
    } else {
      return undefined;
    }
  }
  return text;
}

/** A connection name as Entity Framework reads it: `name=X` or a bare name; a whole connection string is not a name. */
function connectionName(value: string): string | undefined {
  const named = /^\s*name\s*=\s*(.+?)\s*$/iu.exec(value);
  if (named) return named[1];
  return value.includes("=") ? undefined : value.trim() || undefined;
}

function isWorkspaceNamespace(namespace: string, table: TypeTable): boolean {
  if (table.namespaces.has(namespace)) return true;
  for (const known of table.namespaces) {
    if (known.startsWith(`${namespace}.`)) return true;
  }
  return false;
}

async function toDependencies(
  facts: FileFacts,
  thisFile: string,
  absolutePath: string,
  workspaceRoot: string,
  content: string,
  table: TypeTable,
  fileIndex: WorkspaceFileIndex | undefined,
  symbolIndex: WorkspaceSymbolIndex | undefined
): Promise<DependencyEntry[]> {
  const byTarget = new Map<string, Set<string>>();
  const link = (file: string, symbol?: string) => {
    const symbols = byTarget.get(file) ?? new Set<string>();
    if (symbol) symbols.add(symbol);
    byTarget.set(file, symbols);
  };

  for (const use of facts.nameUses) {
    const records = resolveChain(use.chain, use.scope, facts, table);
    if (records.length === 0 || records.some((record) => record.file === thisFile)) continue;
    for (const record of records) link(record.file, record.type.name);
  }

  for (const use of facts.peerMemberUses) {
    const enclosing = use.scope.enclosingTypes[0];
    const own       = facts.types.find((type) => type.qualifiedName === enclosing);
    if (!enclosing || own?.members.some((member) => member.name === use.chain[0])) continue;
    for (const peer of table.byQualifiedName.get(enclosing) ?? []) {
      if (peer.file === thisFile) continue;
      const member = peer.type.members.find((candidate) => candidate.name === use.chain[0]);
      if (member) link(peer.file, member.published ? member.name : undefined);
    }
  }

  const configReferences: ConfigReference[] = [];
  for (const use of facts.configUses) {
    const folded = foldString(use, facts, table, undefined);
    const name   = folded === undefined ? undefined : use.kind === "connectionString" ? connectionName(folded) : folded;
    if (name) configReferences.push({ kind: use.kind, name });
  }

  const fileScope: Scope = { namespace: "", enclosingTypes: [], partial: false };
  const resolveType = (typeName: string): ResolvedTypeTarget[] => {
    const scopes: Scope[] = [fileScope, ...Array.from(facts.namespaces).map((namespace) => ({ namespace, enclosingTypes: [], partial: false }))];
    const targets = new Map<string, ResolvedTypeTarget>();
    for (const scope of scopes) {
      for (const record of resolveChain(typeName.split("."), scope, facts, table)) {
        if (record.file !== thisFile) targets.set(record.file, { file: record.file, name: record.type.name });
      }
    }
    return Array.from(targets.values());
  };

  const dynamic = await extractDynamicDependencies({ content, absolutePath, workspaceRoot, configReferences, resolveType });
  for (const entry of dynamic) {
    if (!entry.resolvedPath) continue;
    link(entry.resolvedPath);
    for (const symbol of entry.symbols) link(entry.resolvedPath, symbol);
  }

  const dependencies: DependencyEntry[] = Array.from(byTarget.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([file, symbols]) => ({ specifier: file, resolvedPath: file, symbols: Array.from(symbols).sort(), kind: "import" as const }));

  dependencies.push(...contractDependencies(facts, thisFile, table, fileIndex, symbolIndex));

  const external = facts.usings
    .filter((namespace) => namespace !== "System" && !namespace.startsWith("System.") && !isWorkspaceNamespace(namespace, table))
    .sort();
  for (const namespace of new Set(external)) {
    dependencies.push({ specifier: namespace, symbols: [], kind: "import" });
  }

  return dependencies;
}

/**
 * The edges observed from a contract: the routes this file calls, the
 * procedures and tables it names, each matched to the file that serves it, or
 * kept by name when nothing in the workspace does.
 */
function contractDependencies(
  facts: FileFacts,
  thisFile: string,
  table: TypeTable,
  fileIndex: WorkspaceFileIndex | undefined,
  symbolIndex: WorkspaceSymbolIndex | undefined
): DependencyEntry[] {
  const byTarget = new Map<string, Set<string>>();
  const unresolved = new Set<string>();
  const link = (file: string, symbol: string) => {
    if (file === thisFile) return;
    const symbols = byTarget.get(file) ?? new Set<string>();
    symbols.add(symbol);
    byTarget.set(file, symbols);
  };

  for (const use of facts.routeUses) {
    const url = foldString(use, facts, table, "{}");
    if (url === undefined) continue;
    const segments = routeSegments(url);
    if (segments.length === 0) continue;
    const servers = symbolIndex ? chooseServers(matchRoute({ method: use.method, segments }, symbolIndex), thisFile, fileIndex, false) : [];
    if (servers.length === 0) {
      if (!/\.[a-z0-9]{1,5}$/iu.test(segments[segments.length - 1])) unresolved.add(routeSymbolName(use.method, url));
      continue;
    }
    for (const server of servers) link(server.location.sourcePath, server.name);
  }

  const objects: Array<{ name: SqlObjectName; raw: string }> = [];
  for (const use of facts.sqlUses) {
    const text = foldString(use, facts, table, undefined);
    if (text === undefined) continue;
    for (const reference of sqlReferences(text)) {
      objects.push({ name: reference.name, raw: reference.raw });
    }
  }
  for (const use of facts.tableUses) {
    const text = foldString(use, facts, table, undefined);
    if (text) objects.push({ name: sqlObjectName(text), raw: text });
  }
  for (const object of objects) {
    const declared = symbolIndex ? matchSqlObject(object.name, symbolIndex) : [];
    if (declared.length === 0) {
      unresolved.add(object.raw);
      continue;
    }
    for (const target of declared) link(target.location.sourcePath, target.name);
  }

  const dependencies: DependencyEntry[] = Array.from(byTarget.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([file, symbols]) => ({ specifier: file, resolvedPath: file, symbols: Array.from(symbols).sort(), kind: "import" as const, basis: "contract" as const }));
  for (const name of Array.from(unresolved).sort()) {
    dependencies.push({ specifier: name, symbols: [], kind: "import", basis: "contract" });
  }
  return dependencies;
}

/** The workspace files that declare a qualified type name, for adapters of other file kinds. */
export async function resolveWorkspaceTypes(
  workspaceRoot: string,
  fileIndex: WorkspaceFileIndex | undefined,
  qualifiedName: string
): Promise<ResolvedTypeTarget[]> {
  const table = await typeTable(workspaceRoot, fileIndex);
  return (table.byQualifiedName.get(qualifiedName) ?? []).map((record) => ({ file: record.file, name: record.type.name }));
}

/** Language adapter for C# (`.cs`): tree-sitter symbols and compiler-style name resolution across the workspace. */
export const csharpAdapter: LanguageAdapter = {
  id:         "csharp",
  extensions: [".cs"],
  async analyze({ absolutePath, workspaceRoot, fileIndex, symbolIndex }): Promise<SourceAnalysisResult | null> {
    const facts    = await fileFacts(absolutePath);
    const table    = await typeTable(workspaceRoot, fileIndex);
    const thisFile = normalizeWorkspacePath(path.relative(workspaceRoot, absolutePath));
    const content  = await fs.readFile(absolutePath, "utf8");
    return {
      symbols:      toSymbols(facts),
      dependencies: await toDependencies(facts, thisFile, absolutePath, workspaceRoot, content, table, fileIndex, symbolIndex)
    };
  }
};
