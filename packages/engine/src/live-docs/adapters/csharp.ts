/**
 * C# adapter, built on tree-sitter.
 *
 * Symbols are every type declaration and every member that is public, protected
 * or internal (or any member of an interface), with their XML documentation and
 * the type references in their signatures.
 *
 * Dependencies are the workspace files that declare the types this file names.
 * A type the file uses without naming it, inferred through `var`, a lambda's
 * parameter or a method's or property's return, is not a dependency: of 40
 * links the compiler binds and this reader lacks, drawn on DNN Platform in
 * November 2026, 31 were of that kind, and they are a choice, not a fault.
 * A name is searched for in the compiler's order: the enclosing types from the
 * innermost out, each followed by the types it inherits members from (a
 * class's base classes up the chain, an interface's base interfaces); then
 * each namespace declaration from the innermost out, its members and then the
 * `using` directives written inside it; last the global namespace with the
 * compilation unit's `using` directives and the project's `global using`
 * directives; and among the declarations of a name, the one with as many type
 * parameters as the use writes type arguments. Only what the file's project
 * can see is linked (`dotnetProjects`). Members of a
 * partial class that live in a peer file count as well. Configuration keys,
 * reflection targets and Hangfire jobs are handled by `csharp.dependencies`.
 *
 * Openings are the file's business too. A controller's route attributes become
 * route symbols. An HTTP client call, a stored procedure or table named in a
 * SQL string or a `Table` attribute, and a data context's connection name are
 * matched, through the workspace symbol index, to the file that serves them;
 * those edges are observed from a contract, and the ones nothing serves stay
 * as the opening's name. String expressions are folded through the `const`
 * members the compiler would fold them through.
 *
 * The program's entry point is reported too: a static `Main`, or the file's
 * top-level statements.
 *
 * Nothing here grades itself: `npm run oracle:compare` measures this adapter
 * against scip-dotnet on the C# fixtures, and `npm run oracle:csharp` against
 * the C# compiler's own binding on any folder.
 */
import { glob } from "glob";
import path from "node:path";

import { compareText } from "../../tooling/compareText";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import { readSourceText, type SourceReads, throwIfMachineFailure } from "../../tooling/sourceText";
import type {
  DependencyEntry,
  PublicSymbolEntry,
  SourceAnalysisResult,
  SymbolDocumentation,
  SymbolDocumentationTarget,
  TypeReference
} from "../core";
import type { ProgramEntry, SourceNotice, WorkspaceSymbolIndex } from "../coreTypes";
import {
  ROUTE_KIND,
  bindSqlName,
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
import { buildDocumentationFromLines, crefName } from "./csharp.xmldoc";
import { projectReach, type ProjectReach } from "./dotnetProjects";
import type { LanguageAdapter, WorkspaceFileIndex } from "./index";
import { inSpaces } from "./spaces";
import { rangesOf, readTree, writtenOver, type SyntaxNode } from "./treeSitter";

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
  /** Shown among the file's symbols: a public, protected or internal member, or any of an interface. An enum's members are held, for a documentation reference to find, and not shown. */
  published:       boolean;
  /** A method's or constructor's parameter types as written, which tell one overload a documentation reference names from another. */
  parameterTypes?: string[];
  /** The scope its documentation's references are resolved from: the type that declares it. */
  docScope:        Scope;
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
  /** The number of type parameters: `Helper` and `Helper<T>` are two types of one name. */
  arity:           number;
  line:            number;
  character:       number;
  documentation?:  SymbolDocumentation;
  typeReferences:  TypeReference[];
  members:         DeclaredMember[];
  /** The type names of its base list, each with the scope the declaration stands in, which is where C# resolves them. */
  bases:           NameUse[];
  /** `const string` members, by name, for configuration keys held in constants. */
  constants:       Map<string, string>;
  /** True for a controller: named so, or derived from one, or given a route prefix. */
  isController:    boolean;
  /** The template a `RoutePrefix` or class-level `Route` attribute puts before every action's route. */
  routePrefix?:    string;
  routes:          DeclaredRoute[];
  /** The scope its documentation's references are resolved from: inside the type, where its own members are in scope. */
  docScope:        Scope;
}

/** A dotted name used somewhere in the file, with the scope it was used from. */
interface NameUse {
  chain: string[];
  scope: Scope;
  /** The number of type arguments each segment writes (`X` 0, `X<T>` 1, `X<,>` 2), where the syntax tells it. */
  arities?: number[];
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
  /** The namespaces this file's `global using` directives open to every file of its project. */
  globalUsings:   string[];
  /** The `using` directives by the namespace declaration they are written in, `""` for the compilation unit. */
  usingsIn:       Map<string, string[]>;
  /** The `global using` directives of the other files of this file's project, set for resolution only. */
  projectUsings?: string[];
  /** Each `using` alias's target: its identifiers and the type arguments each writes (`Lib.Helper` 0 and 0, `Lib.Helper<int>` 0 and 1). */
  aliases:        Map<string, { chain: string[]; arities?: number[] }>;
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
  /** The program's entry point: top-level statements, or a static `Main`. Top-level statements are the entry even beside a `Main`, as they are to the compiler. */
  program?:       ProgramEntry;
  /** Where the file's comments lie (`rangesOf`), so that the patterns of `csharp.dependencies` read the text with them written over. */
  comments:       number[];
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

/** Directives that hold no code, which may stand between a documentation comment and its declaration. */
const LINE_DIRECTIVES = new Set(["preproc_pragma", "preproc_region", "preproc_endregion", "preproc_nullable", "preproc_line", "preproc_warning", "preproc_error"]);

/**
 * The `///` lines that sit directly above a declaration, with nothing but attributes, other comments and directives
 * that hold no code between: the compiler takes a documentation comment across them (`/*[Obsolete]*\/` between
 * log4net's `MDC` and its documentation, a `#pragma warning disable` before many of DNN Platform's classes, measured
 * against the compiler on 2026-11-22), so the reader does too.
 */
function leadingDocumentation(node: SyntaxNode): SymbolDocumentation | undefined {
  const lines: string[] = [];
  let expectedRow = node.startPosition.row;
  let sibling     = node.previousNamedSibling;
  // A directive's node takes its line break, so it ends at the start of the next line.
  const lastRow = (candidate: SyntaxNode): number => (candidate.endPosition.column === 0 && candidate.endPosition.row > candidate.startPosition.row ? candidate.endPosition.row - 1 : candidate.endPosition.row);
  while (sibling && (sibling.type === "comment" || LINE_DIRECTIVES.has(sibling.type)) && lastRow(sibling) === expectedRow - 1) {
    if (sibling.type === "comment" && sibling.text.startsWith("///")) lines.unshift(sibling.text);
    expectedRow = sibling.startPosition.row;
    sibling     = sibling.previousNamedSibling;
  }
  return lines.length > 0 ? buildDocumentationFromLines(lines) : undefined;
}

/** The number of type arguments a generic name writes: `X<T>` 1, `X<,>` and `X<A, B>` 2; 0 for a plain name. */
function typeArgumentCount(node: SyntaxNode): number {
  const list = node.namedChildren.find((child) => child.type === "type_argument_list");
  return list ? list.children.filter((child) => child.type === ",").length + 1 : 0;
}

/** The type-argument count of each segment of a dotted name, parallel to {@link identifierChain}. */
function arityChain(node: SyntaxNode | null): number[] | null {
  if (!node) return null;
  switch (node.type) {
    case "identifier":
      return [0];
    case "generic_name":
      return [typeArgumentCount(node)];
    case "qualified_name": {
      const qualifier = arityChain(node.childForFieldName("qualifier"));
      const name      = arityChain(node.childForFieldName("name"));
      return qualifier && name ? [...qualifier, ...name] : null;
    }
    case "member_access_expression": {
      const expression = arityChain(node.childForFieldName("expression"));
      const name       = arityChain(node.childForFieldName("name"));
      return expression && name ? [...expression, ...name] : null;
    }
    case "alias_qualified_name":
      return arityChain(node.childForFieldName("name"));
    default:
      return null;
  }
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

/**
 * True for `this`, parenthesised or not. A cast of `this` is not: `((Base)this).member` names a member of the type
 * cast to, which the cast's type name already links; and `base.member` names a member the base type declares, which
 * the base list already links.
 */
function isThis(node: SyntaxNode | null | undefined): boolean {
  if (!node) return false;
  if (node.type === "parenthesized_expression") {
    // The grammar's `this` is an anonymous keyword node, so it is not among the named children.
    const inner = node.children.filter((child) => child.type !== "(" && child.type !== ")");
    return inner.length === 1 && isThis(inner[0]);
  }
  return node.type === "this";
}

function stringLiteralValue(node: SyntaxNode | null | undefined): string | undefined {
  if (!node) return undefined;
  if (node.type === "equals_value_clause") {
    return stringLiteralValue(node.namedChildren[0]);
  }
  if (node.type === "string_literal" || node.type === "verbatim_string_literal") {
    const match = /^(@?)"([\s\S]*)"$/u.exec(node.text);
    return match ? stringValue(match[2], match[1] === "@") : undefined;
  }
  return undefined;
}

const SIMPLE_ESCAPES: Readonly<Record<string, string>> = { "'": "'", "\"": "\"", "\\": "\\", "0": "\0", a: "\x07", b: "\b", e: "\x1b", f: "\f", n: "\n", r: "\r", t: "\t", v: "\v" };

/**
 * A string's text as the program holds it, from what the source writes between its quotes (C#'s "String literals"):
 * in a regular string each escape sequence is the character it stands for, so that `"-- note\nSELECT …"` holds a line
 * break, which ends SQL's line comment; in a verbatim string (`@"…"`) only a doubled quote stands for one.
 */
function stringValue(written: string, verbatim: boolean): string {
  if (verbatim) return written.replace(/""/gu, "\"");
  return written.replace(/\\(?:u([0-9A-Fa-f]{4})|U([0-9A-Fa-f]{8})|x([0-9A-Fa-f]{1,4})|([\s\S]))/gu, (whole: string, four?: string, eight?: string, hex?: string, simple?: string) => {
    const code = four ?? eight ?? hex;
    if (code !== undefined) {
      const point = Number.parseInt(code, 16);
      return point <= 0x10ffff ? String.fromCodePoint(point) : whole;
    }
    return simple !== undefined && simple in SIMPLE_ESCAPES ? SIMPLE_ESCAPES[simple] : whole;
  });
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
      // The grammar gives a regular string's escapes nodes of their own and leaves a verbatim one's `""` in its text.
      const parts: StringPart[] = [];
      const verbatim = /^(?:\$@|@\$)/u.test(node.text);
      for (const child of node.namedChildren) {
        if (child.type === "string_content" || child.type === "interpolated_string_text") {
          parts.push({ literal: stringValue(child.text, verbatim) });
        } else if (child.type === "escape_sequence") {
          parts.push({ literal: stringValue(child.text, false) });
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

/**
 * A parameter list's parameters as written, each with its modifiers (`ref Calc`, `out Calc`, `this Calc`) and its type,
 * which tell one overload from another. The grammar reads a `params` parameter not as a parameter but as the keyword,
 * its array type and its name, each a child of the list; it is kept as `params` and the type.
 */
function declaredParameters(parameterList: SyntaxNode): string[] {
  const parameters: string[] = [];
  let params = false;
  for (const child of parameterList.children) {
    if (!child) continue;
    if (child.type === "params") params = true;
    else if (child.type === "parameter") {
      const modifiers = child.namedChildren.filter((part) => part.type === "modifier").map((part) => part.text);
      parameters.push([...modifiers, fieldText(child, "type")].join(" "));
    } else if (params && child.isNamed) {
      parameters.push(`params ${child.text.replace(/\s+/gu, "")}`);
      params = false;
    }
  }
  return parameters;
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
    globalUsings:   [],
    usingsIn:       new Map(),
    aliases:        new Map(),
    namespaces:     new Set(),
    types:          [],
    nameUses:       [],
    peerMemberUses: [],
    configUses:     [],
    routeUses:      [],
    sqlUses:        [],
    tableUses:      [],
    comments:       []
  };

  extract(root: SyntaxNode): FileFacts {
    let scope: Scope = { namespace: "", enclosingTypes: [], partial: false };
    for (const child of root.namedChildren) {
      if (child.type === "file_scoped_namespace_declaration") {
        scope = { ...scope, namespace: joinNames(scope.namespace, fieldText(child, "name")) };
        this.facts.namespaces.add(scope.namespace);
        continue;
      }
      if (child.type === "global_statement") this.facts.program = {};
      this.visitDeclaration(child, scope);
    }
    return this.facts;
  }

  private visitDeclaration(node: SyntaxNode, scope: Scope): void {
    if (node.type === "using_directive") {
      this.recordUsing(node, scope.namespace);
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

  private recordUsing(node: SyntaxNode, namespace: string): void {
    const alias   = node.childForFieldName("name");
    const targets = node.namedChildren.filter((child) => ["qualified_name", "identifier", "alias_qualified_name", "generic_name"].includes(child.type));
    if (alias) {
      const target = targets.find((candidate) => !candidate.equals(alias)) ?? null;
      const chain  = identifierChain(target);
      if (chain) this.facts.aliases.set(alias.text, { chain, arities: arityChain(target) ?? undefined });
      return;
    }
    if (node.children.some((child) => child.type === "static")) {
      return;
    }
    const target = targets[0];
    if (!target) return;
    const opened = target.text.replace(/\s+/g, "").replace(/^global::/u, "");
    this.facts.usings.push(opened);
    this.facts.usingsIn.set(namespace, [...(this.facts.usingsIn.get(namespace) ?? []), opened]);
    if (node.children.some((child) => child.type === "global")) this.facts.globalUsings.push(opened);
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
      arity:          node.namedChildren.find((child) => child.type === "type_parameter_list")?.namedChildren.filter((child) => child.type === "type_parameter").length ?? 0,
      line:           nameNode.startPosition.row + 1,
      character:      nameNode.startPosition.column + 1,
      documentation:  leadingDocumentation(node),
      typeReferences: [],
      members:        [],
      bases:          [],
      constants:      new Map(),
      isController:   /Controller$/u.test(nameNode.text),
      routes:         [],
      docScope:       scope
    };
    const inner: Scope = { namespace: scope.namespace, enclosingTypes: [qualifiedName, ...scope.enclosingTypes], partial: declared.partial };
    declared.docScope = inner;

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
          for (const entry of child.namedChildren) {
            const typeNode = entry.type === "primary_constructor_base_type" ? (entry.childForFieldName("type") ?? entry.namedChildren[0] ?? null) : entry;
            const chain    = identifierChain(typeNode);
            if (chain) declared.bases.push({ chain, scope, arities: arityChain(typeNode) ?? undefined });
          }
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
          // An enum's members are held for a documentation reference to find (`Color.Red`), and not shown as symbols.
          for (const member of child.namedChildren) {
            const memberName = member.type === "enum_member_declaration" ? member.childForFieldName("name") : null;
            if (memberName) {
              declared.members.push({ name: memberName.text, kind: "enum member", line: memberName.startPosition.row + 1, character: memberName.startPosition.column + 1, published: false, docScope: inner });
            }
          }
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
    const parameterList  = node.type === "method_declaration" || node.type === "constructor_declaration" ? node.childForFieldName("parameters") : null;
    const parameterTypes = parameterList ? declaredParameters(parameterList) : undefined;

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
        if (nameNode?.text === "Main" && modifiers.has("static")) this.facts.program ??= { symbol: "Main", line: nameNode.startPosition.row + 1 };
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
        published,
        ...(parameterTypes ? { parameterTypes } : {}),
        docScope:       scope
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

  private recordNameUse(chain: string[], scope: Scope, arities?: number[] | null): void {
    this.facts.nameUses.push(arities && arities.length === chain.length ? { chain, scope, arities } : { chain, scope });
    if (scope.partial) {
      this.facts.peerMemberUses.push({ chain: [chain[0]], scope });
    }
  }

  /** Visits the type arguments of every generic name in a dotted name, `A<B>.C<D>` as much as `C<D>`. */
  private visitChainGenericArguments(node: SyntaxNode | null, scope: Scope): void {
    if (!node) return;
    switch (node.type) {
      case "generic_name":
        this.visitGenericArguments(node, scope);
        return;
      case "qualified_name":
        this.visitChainGenericArguments(node.childForFieldName("qualifier"), scope);
        this.visitChainGenericArguments(node.childForFieldName("name"), scope);
        return;
      case "member_access_expression":
        this.visitChainGenericArguments(node.childForFieldName("expression"), scope);
        this.visitChainGenericArguments(node.childForFieldName("name"), scope);
        return;
      case "alias_qualified_name":
        this.visitChainGenericArguments(node.childForFieldName("name"), scope);
        return;
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
        this.recordUsing(node, scope.namespace);
        return;
      case "namespace_declaration":
        this.visitDeclaration(node, scope);
        return;
      case "qualified_name": {
        const chain = identifierChain(node);
        if (chain) this.recordNameUse(chain, scope, arityChain(node));
        this.visitChainGenericArguments(node, scope);
        return;
      }
      case "member_access_expression": {
        const chain    = identifierChain(node);
        const nameNode = node.childForFieldName("name");
        const expression = node.childForFieldName("expression");
        if (chain) {
          this.recordNameUse(chain, scope, arityChain(node));
          this.visitChainGenericArguments(node, scope);
          return;
        } else if (isThis(expression)) {
          // `this.member` names a member of this type, never a type: in a partial type, one a peer half may declare.
          const member = identifierChain(nameNode)?.[0];
          if (member && scope.partial) this.facts.peerMemberUses.push({ chain: [member], scope });
        } else if (expression) {
          this.visitExpression(expression, scope);
        }
        if (nameNode?.type === "generic_name") this.visitGenericArguments(nameNode, scope);
        return;
      }
      case "generic_name": {
        const identifier = node.namedChildren.find((child) => child.type === "identifier");
        if (identifier) this.recordNameUse([identifier.text], scope, [typeArgumentCount(node)]);
        this.visitGenericArguments(node, scope);
        return;
      }
      case "alias_qualified_name": {
        const nameNode = node.childForFieldName("name");
        if (nameNode) this.visitExpression(nameNode, scope);
        return;
      }
      case "identifier":
        if (!isDeclaredName(node)) this.recordNameUse([node.text], scope, [0]);
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
// Per-file facts, kept for the run
// ---------------------------------------------------------------------------

// Kept for one generation, the run its file index names: a run with another index, or none, begins with nothing, so
// a process that generates commit after commit in one folder never reads a fact of another commit.
const factsCache = new Map<string, FileFacts>();
let factsRun: WorkspaceFileIndex | undefined;
function beginRun(fileIndex: WorkspaceFileIndex | undefined): void {
  if (fileIndex === undefined || fileIndex !== factsRun) factsCache.clear();
  factsRun = fileIndex;
}

/** A line that is a conditional directive, `#if`, `#elif`, `#else` or `#endif`, with what follows its name. */
const CONDITIONAL_DIRECTIVE = /^[ \t]*#[ \t]*(if|elif|else|endif)\b(.*)$/u;

/** A condition that is the literal `false`, which no configuration makes true; a directive may end in a comment. */
const LITERAL_FALSE = /^[ \t]*\(?[ \t]*false[ \t]*\)?[ \t]*(?:\/\/.*)?$/u;

/**
 * The file's text with each section a conditional directive whose condition is the literal `false` skips written over
 * in spaces ({@link inSpaces}), its lines kept: an `#if false` or `#elif false` to the `#elif`, `#else` or `#endif` that
 * ends it, a conditional nested in it counted. C# lexes no such section ("Conditional compilation directives":
 * "skipped source code is not subject to lexical analysis"), and no configuration compiles it, so the syntax tree, which
 * parses every branch, must not see it. A condition on a symbol (`#if DEBUG`) is read in every branch, as before: which
 * symbols a build defines is the open question of a declaration in any branch of `#if`. A line inside a verbatim or raw
 * string that looks like a directive is taken for one. The comment guard of 2026-11-21 (`commentGuard.test.ts`).
 */
function withoutFalseSections(text: string): string {
  const pieces = text.split(/(\r\n|\n|\r)/u);
  /** For each open conditional: whether a section around it skips, and whether its own current section does. */
  const open: Array<{ outer: boolean; skipping: boolean }> = [];
  let changed = false;
  for (let index = 0; index < pieces.length; index += 2) {
    const line = pieces[index];
    const directive = CONDITIONAL_DIRECTIVE.exec(line);
    const skipping = open.length > 0 && open[open.length - 1].skipping;
    if (directive) {
      const [, name, rest] = directive;
      if (name === "if") open.push({ outer: skipping, skipping: skipping || LITERAL_FALSE.test(rest) });
      else if (name === "endif") open.pop();
      else if (open.length > 0) {
        const top = open[open.length - 1];
        top.skipping = top.outer || (name === "elif" && LITERAL_FALSE.test(rest));
      }
      continue;
    }
    if (skipping && line.length > 0) {
      pieces[index] = inSpaces(line);
      changed = true;
    }
  }
  return changed ? pieces.join("") : text;
}

async function fileFacts(absolutePath: string, reads: SourceReads | undefined): Promise<FileFacts> {
  const cached = factsCache.get(absolutePath);
  if (cached) {
    return cached;
  }
  const content = withoutFalseSections(await readSourceText(absolutePath, reads));
  const facts   = await readTree("c-sharp", content, (root) => ({ ...new FileExtractor().extract(root), comments: rangesOf(root) }));
  factsCache.set(absolutePath, facts);
  return facts;
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
  /** Every declared namespace and every namespace that contains one, so that a `using` is known in one lookup. */
  namespacePrefixes: Set<string>;
  /** The last segment of every qualified name, so that a name no type ends with is set aside in one lookup. */
  lastSegments:    Set<string>;
  /** The namespaces each file's `global using` directives open, by file. */
  globalUsings:    Map<string, string[]>;
  /** Each file's facts, so that a name a declaration writes, as a base class, is resolved where it is written. */
  facts:           Map<string, FileFacts>;
  /** What each file's project lets it see. */
  reach:           ProjectReach;
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
  const table: TypeTable = {
    byQualifiedName:   new Map(),
    namespaces:        new Set(),
    namespacePrefixes: new Set(),
    lastSegments:      new Set(),
    globalUsings:      new Map(),
    facts:             new Map(),
    reach:             await projectReach(workspaceRoot, fileIndex)
  };
  for (const file of await listCSharpFiles(workspaceRoot, fileIndex)) {
    let facts: FileFacts;
    try {
      facts = await fileFacts(path.join(workspaceRoot, file), fileIndex);
    } catch (error) {
      throwIfMachineFailure(error);
      continue;
    }
    table.facts.set(file, facts);
    if (facts.globalUsings.length > 0) table.globalUsings.set(file, facts.globalUsings);
    for (const namespace of facts.namespaces) {
      table.namespaces.add(namespace);
      for (let prefix = namespace; prefix; prefix = prefix.slice(0, Math.max(prefix.lastIndexOf("."), 0))) table.namespacePrefixes.add(prefix);
    }
    for (const type of facts.types) {
      table.lastSegments.add(type.qualifiedName.slice(type.qualifiedName.lastIndexOf(".") + 1));
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

/**
 * The declarations of one qualified name that a file can see: undefined when it
 * sees none of them, so that the search goes on as the compiler's would; empty
 * when the name is ambiguous where it sees it.
 */
type Narrow = (records: TypeRecord[]) => TypeRecord[] | undefined;

/** Why a type name has no link although the workspace declares it. */
export const TYPE_NAME_REASONS = {
  ambiguous: "type names several projects in reach declare, left unlinked",
  outside:   "type names declared only outside the project's reach, left unlinked"
} as const;

/** What a search for a name met on the way: declarations it could not see, or an ambiguity where it stopped. */
interface SearchOutcome {
  outside?:   boolean;
  ambiguous?: boolean;
}

/** Every declaration, as a reflection lookup by name sees them. */
const WHOLE_WORKSPACE: Narrow = (records) => records;

/**
 * True when the declarations are not an ambiguity: a single type, the halves of
 * one partial type in one project, or types of one name told apart by their
 * number of type parameters (`Helper` and `Helper<T>`), each declared once or
 * in halves in one project. A use whose type arguments the reader counts is
 * narrowed to its arity before this (`resolveSegments`); where it cannot count
 * them, such a name links every arity.
 */
function oneType(records: TypeRecord[], reach: ProjectReach): boolean {
  if (records.length <= 1) return true;
  const byArity = new Map<number, TypeRecord[]>();
  for (const record of records) byArity.set(record.type.arity, [...(byArity.get(record.type.arity) ?? []), record]);
  const project = reach.projectOf(records[0].file);
  return Array.from(byArity.values()).every((group) =>
    group.length === 1 || group.every((record) => record.type.partial && reach.projectOf(record.file) === project));
}

/**
 * What a file sees of a name, as the compiler binds it: the declarations in the
 * file's own project, else in the projects it references directly, else in
 * those it reaches further (see `dotnetProjects`). Where several declarations
 * at that nearest tier are not halves of one partial type, the name is
 * ambiguous and nothing is linked. A declaration outside the project's reach
 * is never linked. A file no project holds sees every declaration, unless
 * there are several namesakes.
 */
function narrowFor(file: string, reach: ProjectReach): Narrow {
  const tiers = reach.tiersOf(file);
  if (!tiers) return (records) => (oneType(records, reach) ? records : []);
  return (records) => {
    for (const tier of tiers) {
      const here = records.filter((record) => {
        const project = reach.projectOf(record.file);
        return project !== undefined && tier.includes(project);
      });
      if (here.length > 0) return oneType(here, reach) ? here : [];
    }
    return undefined;
  };
}

/** The kinds of type a class or record inherits members from: its base class, never an interface it implements. */
const CLASS_KINDS = new Set(["class", "record"]);

/**
 * The types a declaration inherits members from directly, as C# looks a name
 * up in them: a class's or record's base class, an interface's base
 * interfaces. Each is the name its base list writes, resolved from the scope
 * the declaration stands in, in its own file, with what its project sees; a
 * base the workspace does not declare, or the project cannot see, adds none.
 */
const directBasesCache = new WeakMap<DeclaredType, TypeRecord[]>();
function directBases(record: TypeRecord, table: TypeTable): TypeRecord[] {
  const cached = directBasesCache.get(record.type);
  if (cached) return cached;
  // A base list that leads back to its own type, as namesakes can make it, ends there.
  directBasesCache.set(record.type, []);
  const facts = table.facts.get(record.file);
  const bases: TypeRecord[] = [];
  if (facts && record.type.bases.length > 0) {
    const seen   = withProjectUsings(facts, record.file, table, table.reach);
    const narrow = narrowFor(record.file, table.reach);
    for (const use of record.type.bases) {
      for (const base of resolveChain(use.chain, use.scope, seen, table, narrow, use.arities)) {
        if (record.type.kind === "interface" ? base.type.kind === "interface" : CLASS_KINDS.has(record.type.kind) && CLASS_KINDS.has(base.type.kind)) bases.push(base);
      }
    }
  }
  directBasesCache.set(record.type, bases);
  return bases;
}

/** The qualified names of the types the declarations inherit from, nearest first, up every chain. */
function inheritedTypes(records: TypeRecord[], table: TypeTable): string[] {
  const names: string[] = [];
  const visited = new Set<DeclaredType>();
  for (let level = records; level.length > 0; ) {
    const next: TypeRecord[] = [];
    for (const record of level) {
      if (visited.has(record.type)) continue;
      visited.add(record.type);
      next.push(...directBases(record, table));
    }
    for (const base of next) if (!names.includes(base.type.qualifiedName)) names.push(base.type.qualifiedName);
    level = next;
  }
  return names;
}

/**
 * The containers the compiler searches for a name used in a scope, nearest
 * first, in C#'s order: the enclosing types from the innermost out, each
 * followed by the types it inherits members from, up the chain as far as the
 * project's reach shows it; then each namespace declaration from the
 * innermost out, its own members and then the `using` directives written
 * inside that declaration (a file-scoped namespace holds the directives after
 * it); last the global namespace with the compilation unit's own `using`
 * directives and the `global using` directives of the file's project.
 */
const containersCache = new WeakMap<Scope, { projectUsings: string[] | undefined; table: TypeTable; containers: string[] }>();
function containersOf(scope: Scope, facts: FileFacts, table: TypeTable, narrow: Narrow): string[] {
  let cached = containersCache.get(scope);
  if (!cached || cached.projectUsings !== facts.projectUsings || cached.table !== table) {
    const containers: string[] = [];
    for (const type of scope.enclosingTypes) {
      containers.push(type);
      for (const inherited of inheritedTypes(narrow(table.byQualifiedName.get(type) ?? []) ?? [], table)) {
        if (!containers.includes(inherited)) containers.push(inherited);
      }
    }
    for (const namespace of namespaceChain(scope.namespace).filter(Boolean)) {
      containers.push(namespace, ...(facts.usingsIn.get(namespace) ?? []));
    }
    containers.push("", ...(facts.usingsIn.get("") ?? []), ...(facts.projectUsings ?? []));
    cached = { projectUsings: facts.projectUsings, table, containers };
    containersCache.set(scope, cached);
  }
  return cached.containers;
}

/**
 * The file's facts as name resolution reads them: its own `using` directives
 * and, after them, the `global using` directives any file of its project
 * declares, which C# applies to every file of the project.
 */
const projectUsingsCache = new WeakMap<TypeTable, Map<string, string[]>>();
function withProjectUsings(facts: FileFacts, thisFile: string, table: TypeTable, reach: ProjectReach): FileFacts {
  if (table.globalUsings.size === 0) return facts;
  const project = reach.projectOf(thisFile);
  if (project === undefined) return facts;
  let byProject = projectUsingsCache.get(table);
  if (!byProject) {
    byProject = new Map();
    for (const [file, namespaces] of table.globalUsings) {
      const owner = reach.projectOf(file);
      if (owner !== undefined) byProject.set(owner, [...(byProject.get(owner) ?? []), ...namespaces]);
    }
    projectUsingsCache.set(table, byProject);
  }
  const own   = facts.usingsIn.get("") ?? [];
  const extra = (byProject.get(project) ?? []).filter((namespace) => !own.includes(namespace));
  return extra.length === 0 ? facts : { ...facts, projectUsings: [...new Set(extra)] };
}

/** Resolves a dotted name from a scope: exact, then relative to each container the compiler would search. */
function resolveSegments(segments: string[], scope: Scope, facts: FileFacts, table: TypeTable, narrow: Narrow, arity: number | undefined, outcome?: SearchOutcome): TypeRecord[] | undefined {
  if (!table.lastSegments.has(segments[segments.length - 1])) return undefined;
  const dotted = segments.join(".");
  for (const container of containersOf(scope, facts, table, narrow)) {
    const records  = table.byQualifiedName.get(joinNames(container, dotted));
    const matching = records && arity !== undefined ? records.filter((record) => record.type.arity === arity) : records;
    const seen     = matching && matching.length > 0 ? narrow(matching) : undefined;
    if (matching && matching.length > 0 && !seen && outcome) outcome.outside = true;
    if (seen) {
      if (seen.length === 0 && outcome) outcome.ambiguous = true;
      return seen;
    }
  }
  return undefined;
}

/** Resolves the longest prefix of a name chain that names a type the file can see. */
function resolveChain(chain: string[], scope: Scope, facts: FileFacts, table: TypeTable, narrow: Narrow, arities?: number[], outcome?: SearchOutcome): TypeRecord[] {
  return resolvePrefix(chain, scope, facts, table, narrow, arities, outcome)?.records ?? [];
}

/** {@link resolveChain}, and the segments after the prefix that names the type: what a member access names in it. */
function resolvePrefix(chain: string[], scope: Scope, facts: FileFacts, table: TypeTable, narrow: Narrow, arities?: number[], outcome?: SearchOutcome): { records: TypeRecord[]; rest: string[] } | undefined {
  const alias    = facts.aliases.get(chain[0]);
  const expanded = alias ? [...alias.chain, ...chain.slice(1)] : chain;
  // An alias stands for its target as written, type arguments and all: `using H = Lib.Helper;` names the type with none.
  const counts: Array<number | undefined> | undefined = alias
    ? [...(alias.arities ?? alias.chain.map(() => undefined)), ...(arities?.slice(1) ?? chain.slice(1).map(() => undefined))]
    : arities;
  for (let length = expanded.length; length >= 1; length -= 1) {
    const records = resolveSegments(expanded.slice(0, length), scope, facts, table, narrow, counts?.[length - 1], outcome);
    if (records) return { records, rest: expanded.slice(length) };
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Documentation references
// ---------------------------------------------------------------------------

/** C#'s keywords for the framework's types, as a parameter of a reference or a declaration may write them. */
const TYPE_KEYWORDS: Readonly<Record<string, string>> = {
  bool: "Boolean", byte: "Byte", sbyte: "SByte", char: "Char", decimal: "Decimal", double: "Double", float: "Single",
  int: "Int32", uint: "UInt32", long: "Int64", ulong: "UInt64", short: "Int16", ushort: "UInt16", object: "Object",
  string: "String", nint: "IntPtr", nuint: "UIntPtr"
};

/**
 * A parameter as the reader can compare it with a reference's, keeping what tells overloads apart as C# does: the
 * passing modifier (`ref`, `out`, `in`, `ref readonly`), and the type's simple name with its type arguments, each read
 * the same way, and its array marks with their rank, pointer marks and `?`, in order. `params`, `this` and `scoped`
 * tell no overload apart, and a reference does not write them. A keyword is the framework's name (`int` is `Int32`).
 * The reader resolves no parameter's type, so two types of one simple name in different namespaces are alike to it.
 */
function parameterShape(written: string, annotations = true): string {
  const words = written.replace(/\s+/gu, " ").trim().split(" ");
  const modifiers: string[] = [];
  while (words.length > 1 && /^(?:ref|out|in|params|this|scoped|readonly)$/u.test(words[0])) modifiers.push(words.shift()!);
  const passing = modifiers.filter((modifier) => modifier === "ref" || modifier === "out" || modifier === "in" || (modifier === "readonly" && modifiers.includes("ref")));
  return [...passing, typeShape(words.join(""), annotations)].join(" ");
}

/** The framework's types C# writes by a keyword that are values, whose `?` makes another type (`int?` is `Nullable<int>`). */
const VALUE_KEYWORDS = new Set(Object.values(TYPE_KEYWORDS).filter((name) => name !== "String" && name !== "Object"));

/**
 * A type as {@link parameterShape} compares it: `Lib.Pair{Lib.Calc}[]` is `Pair<Calc>[]`, `System.Int32*` is `Int32*`.
 * Without `annotations`, a `?` is dropped but on a value the reader knows to be one: on a reference type it is a
 * nullable annotation, which no overload is told apart by; on a struct it is another type, which the reader cannot tell.
 */
function typeShape(written: string, annotations = true): string {
  const text = written.replace(/\s+/gu, "").replace(/^global::/u, "").replace(/\{/gu, "<").replace(/\}/gu, ">");
  const marks = /(?:\[,*\]|\*|\?)*$/u.exec(text)?.[0] ?? "";
  const base  = text.slice(0, text.length - marks.length);
  let name = base;
  let args = "";
  if (base.endsWith(">")) {
    let depth = 0;
    for (let index = base.length - 1; index >= 0; index -= 1) {
      if (base[index] === ">") depth += 1;
      else if (base[index] === "<" && --depth === 0) {
        name = base.slice(0, index);
        args = `<${splitTypeArguments(base.slice(index + 1, -1)).map((argument) => typeShape(argument, annotations)).join(",")}>`;
        break;
      }
    }
  }
  const last   = name.slice(name.lastIndexOf(".") + 1);
  const simple = TYPE_KEYWORDS[last] ?? last;
  return `${simple}${args}${annotations || (VALUE_KEYWORDS.has(simple) && args === "") ? marks : marks.replace(/\?/gu, "")}`;
}

/** Type arguments split at the commas outside every bracket. */
function splitTypeArguments(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    if ("<([".includes(text[index])) depth += 1;
    else if (">)]".includes(text[index])) depth -= 1;
    else if (depth === 0 && text[index] === ",") {
      parts.push(text.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

/** A declaration a reference lands on: the member, where the file shows it as a symbol, else the type that declares it. */
function memberTarget(record: TypeRecord, member: DeclaredMember): SymbolDocumentationTarget {
  return member.published
    ? { path: record.file, symbol: member.name, line: member.line }
    : { path: record.file, symbol: record.type.name, line: record.type.line };
}

function typeTarget(record: TypeRecord): SymbolDocumentationTarget {
  return { path: record.file, symbol: record.type.name, line: record.type.line };
}

/**
 * The members of a type a reference names, by name, in the parts the type is declared in, else, where `inherited`, in
 * the nearest type it inherits from that declares the name, as C#'s member lookup goes. Where the reference writes a parameter list, the
 * overloads whose parameters match it, by number and by each one's shape ({@link parameterShape}), a `?` on a type not
 * known to be a value counted only where no overload matches with it; where none matches, the overloads the type
 * inherits; where none there either, none: a name no overload answers is left as text, as the compiler leaves it, and
 * never linked to an overload that only looks alike ("a suggestion is never a fact"). A constructor is named `#ctor`
 * or by the type's own name; a name alone never finds one.
 */
function namedMembers(records: TypeRecord[], name: string, parameters: string[] | undefined, table: TypeTable, narrow: Narrow, constructors: boolean, inherited = true): SymbolDocumentationTarget[] {
  // A constructor is not inherited; a type that declares none has the one C# gives it, declared where the type is.
  const constructor = constructors && (name === "#ctor" || records.some((record) => record.type.name === name));
  if (constructor && parameters?.length === 0 && !records.some((record) => record.type.members.some((member) => member.kind === "constructor"))) return records.map(typeTarget);
  const levels: TypeRecord[][] = [records, ...(inherited && !constructor ? inheritedTypes(records, table).map((qualified) => narrow(table.byQualifiedName.get(qualified) ?? []) ?? []) : [])];
  for (const level of levels) {
    const found: Array<{ record: TypeRecord; member: DeclaredMember }> = [];
    for (const record of level) {
      const wanted = name === "#ctor" ? record.type.name : name;
      for (const member of record.type.members) {
        if (member.name !== wanted) continue;
        if ((member.kind === "constructor") !== (constructors && (name === "#ctor" || name === record.type.name))) continue;
        found.push({ record, member });
      }
    }
    if (found.length === 0) continue;
    let chosen = found;
    if (parameters !== undefined) {
      const counted  = found.filter(({ member }) => member.parameterTypes?.length === parameters.length);
      const matching = (annotations: boolean) => counted.filter(({ member }) => member.parameterTypes!.every((type, index) => parameterShape(type, annotations) === parameterShape(parameters[index], annotations)));
      const exact    = matching(true);
      chosen = exact.length > 0 ? exact : matching(false);
      // A method group holds the overloads a type inherits too, so one no overload here has is looked for there.
      if (chosen.length === 0) continue;
    }
    const targets = new Map<string, SymbolDocumentationTarget>();
    for (const { record, member } of chosen) {
      const target = memberTarget(record, member);
      targets.set(`${target.path}\u0000${target.line}`, target);
    }
    return Array.from(targets.values());
  }
  return [];
}

/**
 * The declarations a documentation reference (`cref`) names, resolved as the reader resolves a type's name in code:
 * the containers C# searches from the scope of the declaration the comment documents, with what its project can see
 * ({@link resolvePrefix}). A name alone may be a member the type documented declares, or a type enclosing it, which
 * C# finds before a type of a namespace; a member they only inherit it does not find, as the compiler's answers on DNN
 * Platform showed (2026-11-22: `<see cref="Settings"/>` in a class `Settings` that inherits a property `Settings` is
 * the class, `<see cref="Layout"/>` in an appender that inherits a property `Layout` the namespace `log4net.Layout`). A
 * member named through its type (`Base.Gadget`) is found where the type inherits it too. A type's name lands on each
 * part that declares it; a member's on the part that declares it, among overloads by their parameters
 * ({@link namedMembers}). A namespace, a name nothing here declares, and a member the reader does not hold (an
 * operator, an indexer, a conversion) resolve to none.
 */
function resolveReference(written: string, scope: Scope, facts: FileFacts, table: TypeTable, narrow: Narrow): SymbolDocumentationTarget[] {
  const name = crefName(written);
  if (!name) return [];
  const chain = name.segments.map((segment) => segment.name);
  if (chain.length === 1 && chain[0] !== "#ctor") {
    for (const enclosing of scope.enclosingTypes) {
      const records = narrow(table.byQualifiedName.get(enclosing) ?? []) ?? [];
      const members = records.length > 0 ? namedMembers(records, chain[0], name.parameters, table, narrow, false, false) : [];
      if (members.length > 0) return members;
    }
  }
  const found = resolvePrefix(chain, scope, facts, table, narrow, name.segments.map((segment) => segment.arity));
  if (!found || found.records.length === 0) return [];
  if (found.rest.length === 0) {
    // A type's name with a parameter list names its constructor, and only that: none that matches, nothing.
    return name.parameters !== undefined ? namedMembers(found.records, "#ctor", name.parameters, table, narrow, true) : found.records.map(typeTarget);
  }
  return found.rest.length === 1 ? namedMembers(found.records, found.rest[0], name.parameters, table, narrow, true) : [];
}

/** A declaration's documentation with each of its references' targets, as {@link resolveReference} finds them. */
function withTargets(documentation: SymbolDocumentation | undefined, scope: Scope, facts: FileFacts, table: TypeTable, narrow: Narrow): SymbolDocumentation | undefined {
  if (!documentation?.links?.some((link) => link.kind === "cref")) return documentation;
  return {
    ...documentation,
    links: documentation.links.map((link) => {
      if (link.kind !== "cref") return link;
      const targets = resolveReference(link.target, scope, facts, table, narrow);
      return targets.length > 0 ? { ...link, targets } : link;
    })
  };
}

// ---------------------------------------------------------------------------
// Adapter output
// ---------------------------------------------------------------------------

/** The file's symbols, each documentation's references given the declarations they name (`resolve`). */
function toSymbols(facts: FileFacts, resolve: (documentation: SymbolDocumentation | undefined, scope: Scope) => SymbolDocumentation | undefined): PublicSymbolEntry[] {
  const entries: PublicSymbolEntry[] = [];
  for (const type of facts.types) {
    entries.push({
      name:           type.name,
      kind:           type.kind,
      qualifiedName:  type.qualifiedName !== type.name ? type.qualifiedName : undefined,
      location:       { line: type.line, character: type.character },
      documentation:  resolve(type.documentation, type.docScope),
      typeReferences: type.typeReferences.length > 0 ? type.typeReferences : undefined
    });
    for (const member of type.members) {
      if (!member.published) continue;
      entries.push({
        name:           member.name,
        kind:           member.kind,
        location:       { line: member.line, character: member.character },
        documentation:  resolve(member.documentation, member.docScope),
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
    compareText(left.name, right.name)
  );
}

function constantValue(chain: string[], scope: Scope, facts: FileFacts, table: TypeTable, narrow: Narrow): string | undefined {
  if (chain.length === 1) {
    for (const qualified of scope.enclosingTypes) {
      for (const record of narrow(table.byQualifiedName.get(qualified) ?? []) ?? []) {
        const value = record.type.constants.get(chain[0]);
        if (value !== undefined) return value;
      }
    }
    return undefined;
  }
  const member = chain[chain.length - 1];
  for (const record of resolveChain(chain.slice(0, -1), scope, facts, table, narrow)) {
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
function foldString(use: StringUse, facts: FileFacts, table: TypeTable, narrow: Narrow, unknown: string | undefined): string | undefined {
  let text = "";
  for (const part of use.parts) {
    if ("literal" in part) {
      text += part.literal;
      continue;
    }
    const value = part.chain.length > 0 ? constantValue(part.chain, use.scope, facts, table, narrow) : undefined;
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

/** A type's members by name, the first of each name, as a search of the list in order would find it. */
const membersCache = new WeakMap<DeclaredType, Map<string, DeclaredMember>>();
function membersByName(type: DeclaredType): Map<string, DeclaredMember> {
  let members = membersCache.get(type);
  if (!members) {
    members = new Map();
    for (const member of type.members) if (!members.has(member.name)) members.set(member.name, member);
    membersCache.set(type, members);
  }
  return members;
}

function isWorkspaceNamespace(namespace: string, table: TypeTable): boolean {
  return table.namespacePrefixes.has(namespace);
}

function toDependencies(
  facts: FileFacts,
  thisFile: string,
  content: string,
  table: TypeTable,
  reach: ProjectReach,
  fileIndex: WorkspaceFileIndex | undefined,
  symbolIndex: WorkspaceSymbolIndex | undefined
): { dependencies: DependencyEntry[]; notices: SourceNotice[] } {
  const narrow   = narrowFor(thisFile, reach);
  const seen     = withProjectUsings(facts, thisFile, table, reach);
  const noticed  = new Map<string, SourceNotice>();
  const byTarget = new Map<string, Set<string>>();
  const link = (file: string, symbol?: string) => {
    const symbols = byTarget.get(file) ?? new Set<string>();
    if (symbol) symbols.add(symbol);
    byTarget.set(file, symbols);
  };

  for (const use of facts.nameUses) {
    const outcome: SearchOutcome = {};
    const records = resolveChain(use.chain, use.scope, seen, table, narrow, use.arities, outcome);
    if (records.length === 0 && (outcome.ambiguous || outcome.outside)) {
      const reason = outcome.ambiguous ? TYPE_NAME_REASONS.ambiguous : TYPE_NAME_REASONS.outside;
      // The generator names the file before each subject, so the subject is the name as written.
      noticed.set(`${reason}\u0000${use.chain.join(".")}`, { reason, subject: use.chain.join(".") });
    }
    if (records.length === 0 || records.some((record) => record.file === thisFile)) continue;
    for (const record of records) link(record.file, record.type.name);
  }

  for (const use of facts.peerMemberUses) {
    const enclosing = use.scope.enclosingTypes[0];
    const own       = facts.types.find((type) => type.qualifiedName === enclosing);
    if (!enclosing || (own && membersByName(own).has(use.chain[0]))) continue;
    for (const peer of table.byQualifiedName.get(enclosing) ?? []) {
      // The halves of a partial type are compiled together, so a peer lies in this file's own project.
      if (peer.file === thisFile || reach.projectOf(peer.file) !== reach.projectOf(thisFile)) continue;
      const member = membersByName(peer.type).get(use.chain[0]);
      if (member) link(peer.file, member.published ? member.name : undefined);
    }
  }

  const configReferences: ConfigReference[] = [];
  for (const use of facts.configUses) {
    const folded = foldString(use, seen, table, narrow, undefined);
    const name   = folded === undefined ? undefined : use.kind === "connectionString" ? connectionName(folded) : folded;
    if (name) configReferences.push({ kind: use.kind, name });
  }

  const fileScope: Scope = { namespace: "", enclosingTypes: [], partial: false };
  const resolveType = (typeName: string): ResolvedTypeTarget[] => {
    const scopes: Scope[] = [fileScope, ...Array.from(facts.namespaces).map((namespace) => ({ namespace, enclosingTypes: [], partial: false }))];
    const targets = new Map<string, ResolvedTypeTarget>();
    for (const scope of scopes) {
      // A type named in a string is loaded by reflection, from whatever assembly is loaded, not bound by the compiler.
      for (const record of resolveChain(typeName.split("."), scope, seen, table, WHOLE_WORKSPACE)) {
        if (record.file !== thisFile) targets.set(record.file, { file: record.file, name: record.type.name });
      }
    }
    return Array.from(targets.values());
  };

  // The patterns run over the text with its comments written over, so that a commented-out key, type or job is not read.
  const dynamic = extractDynamicDependencies({ content: writtenOver(content, facts.comments), thisFile, fileIndex, configReferences, resolveType });
  for (const entry of dynamic) {
    if (!entry.resolvedPath) continue;
    link(entry.resolvedPath);
    for (const symbol of entry.symbols) link(entry.resolvedPath, symbol);
  }

  const dependencies: DependencyEntry[] = Array.from(byTarget.entries())
    .sort(([left], [right]) => compareText(left, right))
    .map(([file, symbols]) => ({ specifier: file, resolvedPath: file, symbols: Array.from(symbols).sort(), kind: "import" as const }));

  dependencies.push(...contractDependencies(seen, thisFile, table, narrow, fileIndex, symbolIndex));

  const external = facts.usings
    .filter((namespace) => namespace !== "System" && !namespace.startsWith("System.") && !isWorkspaceNamespace(namespace, table))
    .sort();
  for (const namespace of new Set(external)) {
    dependencies.push({ specifier: namespace, symbols: [], kind: "import" });
  }

  return { dependencies, notices: Array.from(noticed.values()) };
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
  narrow: Narrow,
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
    const url = foldString(use, facts, table, narrow, "{}");
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
    const text = foldString(use, facts, table, narrow, undefined);
    if (text === undefined) continue;
    for (const reference of sqlReferences(text)) {
      objects.push({ name: reference.name, raw: reference.raw });
    }
  }
  for (const use of facts.tableUses) {
    const text = foldString(use, facts, table, narrow, undefined);
    if (text) objects.push({ name: sqlObjectName(text), raw: text });
  }
  for (const object of objects) {
    // A name in a C# string is no module's, so a one-part name binds as a loose script's does: to `dbo`'s object.
    const declared = bindSqlName({ name: object.name }, symbolIndex ? matchSqlObject(object.name, symbolIndex) : []);
    if (declared.length === 0) {
      unresolved.add(object.raw);
      continue;
    }
    for (const target of declared) link(target.location.sourcePath, target.name);
  }

  const dependencies: DependencyEntry[] = Array.from(byTarget.entries())
    .sort(([left], [right]) => compareText(left, right))
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
  beginRun(fileIndex);
  const table = await typeTable(workspaceRoot, fileIndex);
  return (table.byQualifiedName.get(qualifiedName) ?? []).map((record) => ({ file: record.file, name: record.type.name }));
}

/** Language adapter for C# (`.cs`): tree-sitter symbols and compiler-style name resolution across the workspace. */
export const csharpAdapter: LanguageAdapter = {
  id:         "csharp",
  extensions: [".cs"],
  async analyze({ absolutePath, workspaceRoot, fileIndex, symbolIndex }): Promise<SourceAnalysisResult | null> {
    beginRun(fileIndex);
    const facts    = await fileFacts(absolutePath, fileIndex);
    const table    = await typeTable(workspaceRoot, fileIndex);
    const thisFile = normalizeWorkspacePath(path.relative(workspaceRoot, absolutePath));
    // The text the syntax tree was read from, its comments' places counted in it.
    const content  = withoutFalseSections(await readSourceText(absolutePath, fileIndex));
    const reach    = await projectReach(workspaceRoot, fileIndex);
    // `resolved.notices` says why each type name left unlinked has no link, for the run to count at its end.
    const resolved = toDependencies(facts, thisFile, content, table, reach, fileIndex, symbolIndex);
    // A documentation reference is resolved as a name in code is, from the file with what its project sees.
    const seen     = withProjectUsings(facts, thisFile, table, reach);
    const narrow   = narrowFor(thisFile, reach);
    const result: SourceAnalysisResult = {
      symbols:      toSymbols(facts, (documentation, scope) => withTargets(documentation, scope, seen, table, narrow)),
      dependencies: resolved.dependencies
    };
    if (facts.program) result.program = facts.program;
    if (resolved.notices.length > 0) result.notices = resolved.notices;
    return result;
  }
};
