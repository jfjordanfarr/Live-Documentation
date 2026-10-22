/**
 * The grammar of a Live Doc.
 *
 * @remarks
 * A Live Doc is markdown, and this module is the only place that knows its
 * shape. {@link renderLiveDoc} writes a {@link LiveDoc} out; {@link parseLiveDoc}
 * reads one back and refuses anything the grammar does not describe. The two
 * are inverses: `parseLiveDoc(renderLiveDoc(doc))` equals `doc`, and
 * `renderLiveDoc(parseLiveDoc(text))` equals `text` for every doc the generator
 * has written. That property is what lets the markdown serve as the store that
 * every other consumer reads.
 *
 * @module
 */

// ============================================================================
// The model
// ============================================================================

/** A Live Doc, as written to disk: everything the file says and nothing else. */
export interface LiveDoc {
  /** Workspace-relative path of the source file; the title and the `Code Path` line. */
  codePath: string;
  layer: number;
  archetype?: string;
  /** The `Entry` lines: why something outside the code starts this file; empty when nothing is known to. */
  entries: Entry[];
  /** When the generated sections last changed. */
  generatedAt?: string;
  /** The authored block, verbatim, with no leading or trailing blank lines. */
  authored: string;
  /** The `Public Symbols` section; empty when the file publishes nothing. */
  symbols: SymbolBlock[];
  /** The `Dependencies` section; empty when the file depends on nothing. */
  dependencies: Dependency[];
  /** The `Cited By` section, present only when a document links to the file. */
  citedBy?: CitedBy[];
  /** The `Re-Exported Symbol Anchors` section, present only when the file re-exports. */
  reExports?: ReExport[];
}

/** One public symbol: a `####` heading, its detail lines and its documentation sections. */
export interface SymbolBlock {
  /** The heading text between the backticks, for example `Widget (interface)`. */
  name: string;
  /** The `{#…}` anchor on the heading. */
  slug?: string;
  /** The `Type:` line's kind, for example `interface`. */
  kind: string;
  /** The `Type:` line's parenthesised flags: `default`, `type-only`. */
  flags: string[];
  /** The `Source:` line: a link to the source file and line. */
  source?: { path: string; line: number };
  /** The `Returns:`, `Parameters:`, `Extends:`, `Implements:` and `Constraints:` lines, in order. */
  references: ReferenceLine[];
  /** The `#####` sections: Summary, Remarks, Parameters and the rest, in order. */
  sections: DocSection[];
}

/** The reference lines that list types directly; `Parameters` lists them per parameter. */
export type ReferenceRole = "Returns" | "Extends" | "Implements" | "Constraints";

/** A line of type references on a symbol. */
export type ReferenceLine =
  | { role: ReferenceRole; types: TypeRef[] }
  | { role: "Parameters"; parameters: { name: string; types: TypeRef[] }[] };

/** One type in a reference line: a link to the doc that declares it, or a bare name. */
export interface TypeRef {
  name: string;
  /** The link target, relative to the doc, when the type resolved to a Live Doc. */
  link?: string;
  /** The type is an array of the named type. */
  array?: boolean;
  /** The type is a promise of the named type. */
  promise?: boolean;
}

/** A `#####` documentation section under a symbol. */
export interface DocSection {
  title: string;
  /** The body, verbatim; never empty and never ending in a blank line. */
  body: string[];
}

/** One line of the `Dependencies` section. */
export interface Dependency {
  /** The inline-code label: a module, a `module.symbol`, or an external specifier. */
  label: string;
  /** The link target, relative to the doc, when the dependency is a workspace file. */
  link?: string;
  /** For an external dependency, the symbols taken from it. */
  symbols?: string[];
  /** `re-export`, `type-only`, and the basis of an edge not observed from source: `contract`, `configuration`. */
  qualifiers: string[];
}

/**
 * Why a file is an entry: something outside the code starts it.
 *
 * - `program`: the file holds the language's program entry point.
 * - `command`: a manifest's script or binary runs it, by the script's or binary's name.
 * - `module`: a manifest's `main` names it as the package's module.
 * - `opening`: the file serves a route, an address, a procedure or a table that a caller outside the scan names.
 * - `tooling`: a tool reads it: a manifest, a compiler or runner configuration.
 * - `declared`: the configuration names it as an entry.
 *
 * A test is an entry by its archetype and carries no line.
 */
export type EntryReason = "program" | "command" | "module" | "opening" | "tooling" | "declared";

/** One `Entry` line of the Metadata block: the reason and its evidence. */
export interface Entry {
  reason: EntryReason;
  /** For `program`, the symbol that starts the program when the language names one; for `opening`, the opening served. Linked when the doc has the symbol. */
  symbol?: { name: string; link?: string };
  /** For `command`, the script's or binary's name. */
  command?: string;
  /** For `command` and `module`, the manifest that names the file: its workspace path and the link to its doc. */
  declarer?: { label: string; link: string };
}

/**
 * One line of the `Cited By` section: a document, outside the Live Docs, whose
 * markdown links name this file or its doc. The reverse of the links a doc's
 * authored words make, which the generator writes so that every reader of the
 * docs, the Explorer and the CLI alike, derives the same related documents
 * (the owner's rule of 2026-01-06, built in this direction on 2026-10-22).
 */
export interface CitedBy {
  /** The document's workspace-relative path, as the line's inline-code label. */
  label: string;
  /** The link to the document, relative to the doc. */
  link: string;
}

/** One entry of the `Re-Exported Symbol Anchors` section. */
export interface ReExport {
  name: string;
  slug?: string;
  /** The module the symbol comes from, when it is a workspace file. */
  from?: { label: string; link: string };
  /** `type-only`. */
  flags: string[];
}

// ============================================================================
// Vocabulary
// ============================================================================

const BEGIN = "<!-- LIVE-DOC:BEGIN ";
const END = "<!-- LIVE-DOC:END ";
const CLOSE = " -->";

const PUBLIC_SYMBOLS = "Public Symbols";
const DEPENDENCIES = "Dependencies";
const CITED_BY = "Cited By";
const RE_EXPORTS = "Re-Exported Symbol Anchors";

const NO_SYMBOLS = "_No public symbols detected_";
const NO_DEPENDENCIES = "_No dependencies documented yet_";
const EXTERNAL_RE_EXPORT = "- Re-exported from external module";

/** The authored block a new doc starts with. */
export const DEFAULT_AUTHORED_BLOCK = ["### Purpose", "_Pending authored purpose_", "", "### Notes", "_Pending notes_"].join("\n");

/**
 * The note a new doc of a file no reader handles starts with, in place of
 * `_Pending notes_`. Its generated sections say only what was detected, and
 * nothing was looked for; the note says so where a person reads it, in the
 * authored block, since the generated regions say only what a reader found
 * (the owner, 2026-10-22: "a reasonable caveat to throw in the Authored
 * section and worthy of remembering when we visit such a file again"). Like
 * the pending placeholders it is not authored content of its own.
 */
export const UNREAD_NOTE = "_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._";

/** The authored block a new doc of a file no reader handles starts with: {@link DEFAULT_AUTHORED_BLOCK} with {@link UNREAD_NOTE}. */
export const UNREAD_AUTHORED_BLOCK = ["### Purpose", "_Pending authored purpose_", "", "### Notes", UNREAD_NOTE].join("\n");

/**
 * An entry's reason and evidence in words, as the CLI prints them and the
 * Explorer shows them: "program main", "command build of package.json",
 * "module of packages/cli/package.json", "opening GET api/payments",
 * "tooling", "declared".
 */
export function entryWords(entry: Entry): string {
  switch (entry.reason) {
    case "program":
      return entry.symbol ? `program ${entry.symbol.name}` : "program";
    case "command":
      return `command ${entry.command} of ${entry.declarer?.label}`;
    case "module":
      return `module of ${entry.declarer?.label}`;
    case "opening":
      return `opening ${entry.symbol?.name}`;
    default:
      return entry.reason;
  }
}

/**
 * The name of a symbol without the parenthesised suffix a heading carries to
 * tell it from another of the same name, such as `Widget (interface)` or
 * `parse (method overload 2)`.
 */
export function symbolName(symbol: Pick<SymbolBlock, "name">): string {
  return symbol.name.replace(/ \([^()]*\)$/u, "");
}

// ============================================================================
// Rendering
// ============================================================================

/** Writes a Live Doc as markdown. The output always ends with one newline. */
export function renderLiveDoc(doc: LiveDoc): string {
  const lines: string[] = [];
  lines.push(`# ${doc.codePath}`, "", "## Metadata", `- Layer: ${doc.layer}`);
  if (doc.archetype) {
    lines.push(`- Archetype: ${doc.archetype}`);
  }
  if (doc.layer === 4) {
    lines.push(`- Code Path: ${doc.codePath}`);
  }
  for (const entry of doc.entries) {
    lines.push(renderEntry(entry));
  }
  if (doc.generatedAt) {
    lines.push(`- Generated At: ${doc.generatedAt}`);
  }
  lines.push("", "## Authored", ...doc.authored.split("\n"), "", "## Generated");
  pushSection(lines, PUBLIC_SYMBOLS, doc.symbols.length ? renderSymbolBlocks(doc.symbols) : [NO_SYMBOLS]);
  lines.push("");
  pushSection(lines, DEPENDENCIES, doc.dependencies.length ? doc.dependencies.map(renderDependency) : [NO_DEPENDENCIES]);
  if (doc.citedBy) {
    lines.push("");
    pushSection(lines, CITED_BY, doc.citedBy.map(renderCitedBy));
  }
  if (doc.reExports) {
    lines.push("");
    pushSection(lines, RE_EXPORTS, renderReExports(doc.reExports));
  }
  return `${lines.join("\n")}\n`;
}

function renderEntry(entry: Entry): string {
  const symbol = entry.symbol ? renderSymbolRef(entry.symbol) : "";
  const declarer = entry.declarer ? `[\`${entry.declarer.label}\`](${entry.declarer.link})` : "";
  switch (entry.reason) {
    case "program":
      return `- Entry: program${symbol ? ` ${symbol}` : ""}`;
    case "command":
      return `- Entry: command \`${entry.command}\` of ${declarer}`;
    case "module":
      return `- Entry: module of ${declarer}`;
    case "opening":
      return `- Entry: opening ${symbol}`;
    default:
      return `- Entry: ${entry.reason}`;
  }
}

function renderSymbolRef(symbol: { name: string; link?: string }): string {
  return symbol.link ? `[\`${symbol.name}\`](${symbol.link})` : `\`${symbol.name}\``;
}

function pushSection(lines: string[], name: string, body: string[]): void {
  lines.push(`${BEGIN}${name}${CLOSE}`, `### ${name}`, ...body, `${END}${name}${CLOSE}`);
}

/** Writes the body of the `Public Symbols` section: the lines between its markers. */
export function renderSymbolBlocks(symbols: SymbolBlock[]): string[] {
  const lines: string[] = [];
  symbols.forEach((symbol, index) => {
    if (index > 0) {
      lines.push("");
    }
    lines.push(`#### \`${symbol.name}\`${symbol.slug ? ` {#${symbol.slug}}` : ""}`);
    lines.push(`- Type: ${symbol.kind}${symbol.flags.length ? ` (${symbol.flags.join(", ")})` : ""}`);
    if (symbol.source) {
      lines.push(`- Source: [source](${symbol.source.path}#L${symbol.source.line})`);
    }
    for (const reference of symbol.references) {
      lines.push(renderReference(reference));
    }
    symbol.sections.forEach((section) => {
      lines.push("", `##### \`${symbol.name}\` — ${section.title}`, ...section.body);
    });
  });
  return lines;
}

function renderReference(reference: ReferenceLine): string {
  if (reference.role === "Parameters") {
    const entries = reference.parameters.map((parameter) => `\`${parameter.name}\`: ${renderTypes(parameter.types)}`);
    return `- Parameters: ${entries.join("; ")}`;
  }
  return `- ${reference.role}: ${renderTypes(reference.types)}`;
}

function renderTypes(types: TypeRef[]): string {
  return types.map(renderType).join(", ");
}

function renderType(type: TypeRef): string {
  let text = type.link ? `[\`${type.name}\`](${type.link})` : `\`${type.name}\``;
  if (type.array) {
    text = `${text}[]`;
  }
  if (type.promise) {
    text = `Promise<${text}>`;
  }
  return text;
}

function renderDependency(dependency: Dependency): string {
  const qualifier = dependency.qualifiers.length ? ` (${dependency.qualifiers.join(", ")})` : "";
  if (dependency.link) {
    return `- [\`${dependency.label}\`](${dependency.link})${qualifier}`;
  }
  const symbols = dependency.symbols?.length ? ` - ${dependency.symbols.map((symbol) => `\`${symbol}\``).join(", ")}` : "";
  return `- \`${dependency.label}\`${symbols}${qualifier}`;
}

function renderCitedBy(entry: CitedBy): string {
  return `- [\`${entry.label}\`](${entry.link})`;
}

function renderReExports(entries: ReExport[]): string[] {
  const lines: string[] = [];
  entries.forEach((entry, index) => {
    if (index > 0) {
      lines.push("");
    }
    lines.push(`#### \`${entry.name}\`${entry.slug ? ` {#${entry.slug}}` : ""}`);
    const flags = entry.flags.length ? ` (${entry.flags.join(", ")})` : "";
    lines.push(entry.from ? `- Re-exported from [\`${entry.from.label}\`](${entry.from.link})${flags}` : `${EXTERNAL_RE_EXPORT}${flags}`);
  });
  return lines;
}

// ============================================================================
// Parsing
// ============================================================================

/** Thrown when text is not a Live Doc. `line` is one-based. */
export class LiveDocSyntaxError extends Error {
  constructor(readonly line: number, readonly detail: string) {
    super(`line ${line}: ${detail}`);
    this.name = "LiveDocSyntaxError";
  }
}

/** Reads a Live Doc back from markdown, refusing anything outside the grammar. */
export function parseLiveDoc(text: string): LiveDoc {
  const reader = new Reader(text);
  const codePath = reader.expect(/^# (.+)$/u, "the title")[1];
  reader.expectBlank();
  reader.expectLine("## Metadata");
  const layer = Number(reader.expect(/^- Layer: (\d+)$/u, "the Layer line")[1]);
  const archetype = reader.take(/^- Archetype: (.+)$/u)?.[1];
  if (layer === 4) {
    const declared = reader.expect(/^- Code Path: (.+)$/u, "the Code Path line")[1];
    if (declared !== codePath) {
      reader.fail(`the Code Path (${declared}) differs from the title (${codePath})`);
    }
  }
  const entries: Entry[] = [];
  for (let line = reader.take(ENTRY_LINE); line; line = reader.take(ENTRY_LINE)) {
    entries.push(parseEntry(line, reader.lineNumber() - 1));
  }
  const generatedAt = reader.take(/^- Generated At: (.+)$/u)?.[1];
  reader.expectBlank();
  reader.expectLine("## Authored");
  const authored = reader.until((line) => line === "## Generated", "the Generated heading");
  if (authored.length === 0 || authored[authored.length - 1] !== "") {
    reader.fail("the authored block must end with one blank line");
  }
  authored.pop();
  if (authored.length === 0 || authored[0] === "" || authored[authored.length - 1] === "") {
    reader.fail("the authored block must not start or end with a blank line");
  }
  reader.expectLine("## Generated");

  const symbols = parseSection(reader, PUBLIC_SYMBOLS, (body) => body.lines.length === 1 && body.lines[0] === NO_SYMBOLS ? [] : parseSymbols(body));
  reader.expectBlank();
  const dependencies = parseSection(reader, DEPENDENCIES, (body) => body.lines.length === 1 && body.lines[0] === NO_DEPENDENCIES ? [] : body.lines.map((line, index) => parseDependency(line, body.start + index)));
  // The optional sections, each present or not, in this order.
  let citedBy: CitedBy[] | undefined;
  if (nextSectionIs(reader, CITED_BY)) {
    reader.expectBlank();
    citedBy = parseSection(reader, CITED_BY, (body) => body.lines.map((line, index) => parseCitedBy(line, body.start + index)));
  }
  let reExports: ReExport[] | undefined;
  if (nextSectionIs(reader, RE_EXPORTS)) {
    reader.expectBlank();
    reExports = parseSection(reader, RE_EXPORTS, (body) => parseReExports(body));
  }
  if (!reader.atEnd()) {
    reader.fail("text after the last generated section");
  }
  return { codePath, layer, archetype, entries, generatedAt, authored: authored.join("\n"), symbols, dependencies, citedBy, reExports };
}

/** True when a blank line and the named section's opening marker come next; the end of the text is not a section. */
function nextSectionIs(reader: Reader, name: string): boolean {
  return !reader.atEnd() && reader.peek(0) === "" && reader.peek(1) === `${BEGIN}${name}${CLOSE}`;
}

const ENTRY_LINE = /^- Entry: (program|command|module|opening|tooling|declared)(?: (.+))?$/u;
const SYMBOL_REF = /^(?:\[`([^`]+)`\]\(([^)]+)\)|`([^`]+)`)$/u;
const DECLARER = /^\[`([^`]+)`\]\(([^)]+)\)$/u;
const COMMAND_EVIDENCE = /^`([^`]+)` of (\[`[^`]+`\]\([^)]+\))$/u;
const MODULE_EVIDENCE = /^of (\[`[^`]+`\]\([^)]+\))$/u;

function parseEntry(match: RegExpExecArray, lineNumber: number): Entry {
  const reason = match[1] as EntryReason;
  const evidence = match[2];
  const fail = (): never => {
    throw new LiveDocSyntaxError(lineNumber, `unexpected evidence on the ${reason} entry ${JSON.stringify(match[0])}`);
  };
  const symbolOf = (text: string): { name: string; link?: string } => {
    const ref = SYMBOL_REF.exec(text) ?? fail();
    return ref[3] !== undefined ? { name: ref[3] } : { name: ref[1], link: ref[2] };
  };
  const declarerOf = (text: string): { label: string; link: string } => {
    const ref = DECLARER.exec(text) ?? fail();
    return { label: ref[1], link: ref[2] };
  };
  switch (reason) {
    case "program":
      return evidence === undefined ? { reason } : { reason, symbol: symbolOf(evidence) };
    case "command": {
      const command = COMMAND_EVIDENCE.exec(evidence ?? "") ?? fail();
      return { reason, command: command[1], declarer: declarerOf(command[2]) };
    }
    case "module": {
      const module = MODULE_EVIDENCE.exec(evidence ?? "") ?? fail();
      return { reason, declarer: declarerOf(module[1]) };
    }
    case "opening": {
      const symbol = symbolOf(evidence ?? "");
      if (!symbol.link) {
        fail();
      }
      return { reason, symbol };
    }
    default:
      if (evidence !== undefined) {
        fail();
      }
      return { reason };
  }
}

/** The lines of a section body and the one-based line number of the first. */
interface Body {
  start: number;
  lines: string[];
}

function parseSection<T>(reader: Reader, name: string, parse: (body: Body) => T): T {
  reader.expectLine(`${BEGIN}${name}${CLOSE}`);
  reader.expectLine(`### ${name}`);
  const start = reader.lineNumber();
  const lines = reader.until((line) => line === `${END}${name}${CLOSE}`, `the end of ${name}`);
  reader.expectLine(`${END}${name}${CLOSE}`);
  if (lines.length === 0) {
    throw new LiveDocSyntaxError(start, `${name} is empty`);
  }
  return parse({ start, lines });
}

const SYMBOL_HEADING = /^#### `([^`]+)`(?: \{#([^}]+)\})?$/u;
const SECTION_HEADING = /^##### `([^`]+)` — (.+)$/u;
const TYPE_LINE = /^- Type: ([^ ]+)(?: \(([^)]+)\))?$/u;
const SOURCE_LINE = /^- Source: \[source\]\((.+)#L(\d+)\)$/u;
const REFERENCE_LINE = /^- (Returns|Parameters|Extends|Implements|Constraints): (.+)$/u;

function parseSymbols(body: Body): SymbolBlock[] {
  const symbols: SymbolBlock[] = [];
  const lines = body.lines;
  const at = (index: number): number => body.start + index;
  let index = 0;
  while (index < lines.length) {
    const heading = SYMBOL_HEADING.exec(lines[index]);
    if (!heading) {
      throw new LiveDocSyntaxError(at(index), `expected a symbol heading, found ${JSON.stringify(lines[index])}`);
    }
    const symbol: SymbolBlock = { name: heading[1], slug: heading[2], kind: "", flags: [], references: [], sections: [] };
    index += 1;
    const type = TYPE_LINE.exec(lines[index] ?? "");
    if (!type) {
      throw new LiveDocSyntaxError(at(index), `expected the Type line of ${symbol.name}`);
    }
    symbol.kind = type[1];
    symbol.flags = type[2] ? type[2].split(", ") : [];
    index += 1;
    const source = SOURCE_LINE.exec(lines[index] ?? "");
    if (source) {
      symbol.source = { path: source[1], line: Number(source[2]) };
      index += 1;
    }
    while (index < lines.length && lines[index].startsWith("- ")) {
      symbol.references.push(parseReference(lines[index], at(index)));
      index += 1;
    }
    while (index < lines.length) {
      if (lines[index] !== "") {
        throw new LiveDocSyntaxError(at(index), `expected a blank line after the details of ${symbol.name}, found ${JSON.stringify(lines[index])}`);
      }
      index += 1;
      if (SYMBOL_HEADING.test(lines[index] ?? "")) {
        break;
      }
      const section = SECTION_HEADING.exec(lines[index] ?? "");
      if (!section) {
        throw new LiveDocSyntaxError(at(index), `expected a section of ${symbol.name}, found ${JSON.stringify(lines[index])}`);
      }
      if (section[1] !== symbol.name) {
        throw new LiveDocSyntaxError(at(index), `section of ${section[1]} under ${symbol.name}`);
      }
      index += 1;
      const sectionLines: string[] = [];
      let fence = false;
      while (index < lines.length) {
        const line = lines[index];
        if (!fence && (SECTION_HEADING.test(line) || SYMBOL_HEADING.test(line))) {
          break;
        }
        if (!fence && line === "" && (index + 1 === lines.length || SECTION_HEADING.test(lines[index + 1]) || SYMBOL_HEADING.test(lines[index + 1]))) {
          break;
        }
        if (line.startsWith("```")) {
          fence = !fence;
        }
        sectionLines.push(line);
        index += 1;
      }
      if (sectionLines.length === 0 || sectionLines[sectionLines.length - 1] === "") {
        throw new LiveDocSyntaxError(at(index), `the ${section[2]} section of ${symbol.name} is empty or ends with a blank line`);
      }
      symbol.sections.push({ title: section[2], body: sectionLines });
      if (index < lines.length && lines[index] !== "") {
        // The next heading follows a section body directly; only a blank may separate them.
        throw new LiveDocSyntaxError(at(index), `expected a blank line before ${JSON.stringify(lines[index])}`);
      }
    }
    symbols.push(symbol);
  }
  return symbols;
}

function parseReference(line: string, lineNumber: number): ReferenceLine {
  const match = REFERENCE_LINE.exec(line);
  if (!match) {
    throw new LiveDocSyntaxError(lineNumber, `unexpected detail line ${JSON.stringify(line)}`);
  }
  const [, role, rest] = match;
  if (role === "Parameters") {
    const parameters = rest.split("; ").map((entry) => {
      const parameter = /^`([^`]+)`: (.+)$/u.exec(entry);
      if (!parameter) {
        throw new LiveDocSyntaxError(lineNumber, `unexpected parameter ${JSON.stringify(entry)}`);
      }
      return { name: parameter[1], types: parseTypes(parameter[2], lineNumber) };
    });
    return { role, parameters };
  }
  return { role: role as ReferenceRole, types: parseTypes(rest, lineNumber) };
}

const TYPE_REF = /^(Promise<)?(?:\[`([^`]+)`\]\(([^)]+)\)|`([^`]+)`)(\[\])?(>)?$/u;

function parseTypes(text: string, lineNumber: number): TypeRef[] {
  return text.split(", ").map((item) => {
    const match = TYPE_REF.exec(item);
    if (!match || Boolean(match[1]) !== Boolean(match[6])) {
      throw new LiveDocSyntaxError(lineNumber, `unexpected type ${JSON.stringify(item)}`);
    }
    const type: TypeRef = { name: match[2] ?? match[4] };
    if (match[3]) {
      type.link = match[3];
    }
    if (match[5]) {
      type.array = true;
    }
    if (match[1]) {
      type.promise = true;
    }
    return type;
  });
}

const LINKED_DEPENDENCY = /^- \[`([^`]+)`\]\(([^)]+)\)(?: \(([^)]+)\))?$/u;
const EXTERNAL_DEPENDENCY = /^- `([^`]+)`(?: - (`[^`]+`(?:, `[^`]+`)*))?(?: \(([^)]+)\))?$/u;

function parseDependency(line: string, lineNumber: number): Dependency {
  const linked = LINKED_DEPENDENCY.exec(line);
  if (linked) {
    return { label: linked[1], link: linked[2], qualifiers: linked[3] ? linked[3].split(", ") : [] };
  }
  const external = EXTERNAL_DEPENDENCY.exec(line);
  if (external) {
    const dependency: Dependency = { label: external[1], qualifiers: external[3] ? external[3].split(", ") : [] };
    if (external[2]) {
      dependency.symbols = external[2].split(", ").map((symbol) => symbol.slice(1, -1));
    }
    return dependency;
  }
  throw new LiveDocSyntaxError(lineNumber, `unexpected dependency line ${JSON.stringify(line)}`);
}

const CITED_BY_LINE = /^- \[`([^`]+)`\]\(([^)]+)\)$/u;

function parseCitedBy(line: string, lineNumber: number): CitedBy {
  const match = CITED_BY_LINE.exec(line);
  if (!match) {
    throw new LiveDocSyntaxError(lineNumber, `unexpected Cited By line ${JSON.stringify(line)}`);
  }
  return { label: match[1], link: match[2] };
}

const RE_EXPORT_FROM = /^- Re-exported from \[`([^`]+)`\]\(([^)]+)\)(?: \(([^)]+)\))?$/u;
const RE_EXPORT_EXTERNAL = new RegExp(`^${escape(EXTERNAL_RE_EXPORT)}(?: \\(([^)]+)\\))?$`, "u");

function parseReExports(body: Body): ReExport[] {
  const entries: ReExport[] = [];
  const lines = body.lines;
  const at = (index: number): number => body.start + index;
  for (let index = 0; index < lines.length; index += 3) {
    const heading = SYMBOL_HEADING.exec(lines[index]);
    if (!heading) {
      throw new LiveDocSyntaxError(at(index), `expected a re-export heading, found ${JSON.stringify(lines[index])}`);
    }
    const line = lines[index + 1] ?? "";
    const from = RE_EXPORT_FROM.exec(line);
    const external = RE_EXPORT_EXTERNAL.exec(line);
    if (!from && !external) {
      throw new LiveDocSyntaxError(at(index + 1), `expected the origin of ${heading[1]}, found ${JSON.stringify(line)}`);
    }
    const flags = (from ? from[3] : external?.[1])?.split(", ") ?? [];
    entries.push({ name: heading[1], slug: heading[2], from: from ? { label: from[1], link: from[2] } : undefined, flags });
    if (index + 2 < lines.length && lines[index + 2] !== "") {
      throw new LiveDocSyntaxError(at(index + 2), `expected a blank line after ${heading[1]}`);
    }
  }
  return entries;
}

// ============================================================================
// Lenient reading
// ============================================================================

/**
 * The authored block of any text that has one, whatever else the text holds.
 *
 * @remarks
 * The generator uses this to carry a doc's authored block forward even when the
 * rest of the doc predates the grammar. It returns the default block when there
 * is nothing to carry.
 */
export function authoredBlockOf(text: string | undefined): string {
  if (!text) {
    return DEFAULT_AUTHORED_BLOCK;
  }
  const start = /^## Authored[ \t]*$/mu.exec(text);
  if (!start || start.index === undefined) {
    return DEFAULT_AUTHORED_BLOCK;
  }
  const from = start.index + start[0].length;
  const end = /^## Generated[ \t]*$/mu.exec(text.slice(from));
  const block = text.slice(from, end ? from + end.index : undefined).replace(/\r\n/gu, "\n").trim();
  return block || DEFAULT_AUTHORED_BLOCK;
}

// ============================================================================
// Reader
// ============================================================================

/** Reads a text line by line for the parsers, and fails with the line number when the grammar is not met. */
export class Reader {
  private readonly lines: string[];
  private index = 0;

  constructor(text: string) {
    if (!text.endsWith("\n")) {
      throw new LiveDocSyntaxError(text.split("\n").length, "the text must end with a newline");
    }
    this.lines = text.slice(0, -1).split("\n");
  }

  /** The current line's number, counted from one. */
  lineNumber(): number {
    return this.index + 1;
  }

  /** True when every line has been consumed. */
  atEnd(): boolean {
    return this.index >= this.lines.length;
  }

  /** The line `offset` lines ahead of the current one, without consuming it. */
  peek(offset: number): string | undefined {
    return this.lines[this.index + offset];
  }

  /** Throws a syntax error at the current line. */
  fail(detail: string): never {
    throw new LiveDocSyntaxError(this.lineNumber(), detail);
  }

  /** Consumes the current line, which must be exactly the text expected. */
  expectLine(expected: string): void {
    if (this.lines[this.index] !== expected) {
      this.fail(`expected ${JSON.stringify(expected)}, found ${JSON.stringify(this.lines[this.index])}`);
    }
    this.index += 1;
  }

  /** Consumes the current line, which must be blank. */
  expectBlank(): void {
    this.expectLine("");
  }

  /** Consumes the current line, which must match the pattern, and returns the match; `what` names it in the error. */
  expect(pattern: RegExp, what: string): RegExpExecArray {
    const match = this.take(pattern);
    if (!match) {
      this.fail(`expected ${what}, found ${JSON.stringify(this.lines[this.index])}`);
    }
    return match;
  }

  /** Consumes the current line when it matches the pattern and returns the match; otherwise leaves it and returns undefined. */
  take(pattern: RegExp): RegExpExecArray | undefined {
    const line = this.lines[this.index];
    if (line === undefined) {
      return undefined;
    }
    const match = pattern.exec(line);
    if (match) {
      this.index += 1;
    }
    return match ?? undefined;
  }

  /** Lines up to, not including, the first that satisfies `stop`. */
  until(stop: (line: string) => boolean, what: string): string[] {
    const start = this.index;
    while (this.index < this.lines.length && !stop(this.lines[this.index])) {
      this.index += 1;
    }
    if (this.index >= this.lines.length) {
      throw new LiveDocSyntaxError(start + 1, `${what} never comes`);
    }
    return this.lines.slice(start, this.index);
  }
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
