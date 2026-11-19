/**
 * The grammar of a Live Doc.
 *
 * @remarks
 * A Live Doc is markdown, and this module is the only place that knows its
 * shape. {@link renderLiveDoc} writes a {@link LiveDoc} out; {@link parseLiveDoc}
 * reads one back and refuses anything the grammar does not describe. The two
 * are inverses: `parseLiveDoc(renderLiveDoc(doc))` equals `doc`, and
 * `renderLiveDoc(parseLiveDoc(text))` equals `text` for every doc this version
 * of the generator writes. A doc written before 2026-11-19 can hold a form it no
 * longer writes, which the reader refuses or in two cases reads as another
 * value; `live-docs:generate` rewrites it. That property is what lets the markdown serve as the store that
 * every other consumer reads.
 *
 * It holds for whatever a repository can hand the generator. Every name, path
 * and link a doc takes from a source file is written by one rule,
 * {@link writeValue}: as the format has always written it where that reads back
 * as the value, and as a JSON string where it would not, a name with a line
 * break or a link with a `)`. A docstring's line that the reader would take for
 * a heading, a fence or a section marker is written with a backslash in front
 * ({@link escapeBody}).
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
  /** The heading's text: the name, with the parenthesised suffix that tells it from another where it has one, for example `Widget (interface)`. */
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
  /** The body's lines, each without a line break; never empty and never ending in a blank line. */
  body: string[];
}

/** One line of the `Dependencies` section. */
export interface Dependency {
  /** The label: a module, a `module.symbol`, or an external specifier. */
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
  /** The document's workspace-relative path, the line's label. */
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

/** Where a line of a doc or a board ends: at LF, CRLF or a carriage return alone, as CommonMark ends a line. */
const LINE_ENDING = /\r\n?|\n/u;

/** U+FEFF at the start of a text: a byte-order mark, which says how the file is encoded and is no part of its first line. */
const BYTE_ORDER_MARK = "\ufeff";

const MARKER = "<!-- LIVE-DOC:";
const BEGIN = `${MARKER}BEGIN `;
const END = `${MARKER}END `;
const CLOSE = " -->";

const PUBLIC_SYMBOLS = "Public Symbols";
const DEPENDENCIES = "Dependencies";
const CITED_BY = "Cited By";
const RE_EXPORTS = "Re-Exported Symbol Anchors";

const NO_SYMBOLS = "_No public symbols detected_";
const NO_DEPENDENCIES = "_No dependencies documented yet_";
const RE_EXPORTED_FROM = "- Re-exported from ";
const EXTERNAL_RE_EXPORT = `${RE_EXPORTED_FROM}external module`;

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
// Values
// ============================================================================

/**
 * One place in a line where a doc writes a value taken from a source file, and the value's plain form there: what the
 * format has always written.
 */
interface Slot {
  /** The plain form of a value, or undefined where the plain form cannot carry it. */
  plain(value: string): string | undefined;
  /** The quoted form of a value: its JSON string, where the slot writes it. */
  quoted(value: string): string;
  /** The value that begins at `at` in a line, in either form, and where it ends; undefined where none does. */
  take(line: string, at: number): Taken | undefined;
}

/** A value read from a line, and the index just after it. */
interface Taken {
  value: string;
  end: number;
}

/** Text that fits on its line as a pattern's `.` reads one: no line terminator of JavaScript's. */
const LINE_TEXT = /^.+$/u;

/** A lone surrogate, which no file can hold: UTF-8 writes it as U+FFFD. */
const LONE_SURROGATE = /\p{Cs}/u;

/**
 * What no line of a doc holds as itself: a line break, a control character other than a tab, which git takes for a
 * sign of a binary file (a NUL, a carriage return alone) and a renderer may break a line at, and the line and
 * paragraph separators. A value holding one is quoted, which spells it out.
 */
// eslint-disable-next-line no-control-regex -- the control characters are what a line of a doc cannot hold
const UNWRITTEN = /[\x00-\x08\x0a-\x1f\u2028\u2029]/u;

/**
 * A name, of a symbol, a script, a type, a parameter, a module or a file, or a file's path in its doc's title, as a code
 * span, which a markdown viewer shows as it is. Quoted, the JSON string is the span's content, so that a quoted name is
 * as inert as a plain one; a name that begins with `"` is quoted, so that the span's first character tells the forms
 * apart.
 */
const NAME: Slot = {
  plain: (value) => (value === "" || value.startsWith('"') ? undefined : codeSpan(value)),
  quoted: (value) => codeSpan(quote(value)),
  take: (line, at) => {
    const span = takeCodeSpan(line, at);
    if (span === undefined || !span.content.startsWith('"')) {
      return span && { value: span.content, end: span.end };
    }
    const quoted = takeQuoted(span.content, 0);
    return quoted?.end === span.content.length ? { value: quoted.value, end: span.end } : undefined;
  }
};

/** A link's target, up to the parenthesis that closes the link. */
const LINK: Slot = {
  plain: (value) => (value !== "" && !value.includes(")") ? value : undefined),
  quoted: quote,
  take: (line, at) => {
    if (line[at] === '"') return takeQuoted(line, at);
    const close = line.indexOf(")", at);
    return close > at ? { value: line.slice(at, close), end: close } : undefined;
  }
};

/** A source file's path in a `Source` line's link: everything before the last `#L` and line number. */
const SOURCE: Slot = {
  plain: (value) => (LINE_TEXT.test(value) ? value : undefined),
  quoted: quote,
  take: (line, at) => {
    if (line[at] === '"') return takeQuoted(line, at);
    const match = /^(.+)#L\d+\)$/u.exec(line.slice(at));
    return match ? { value: match[1], end: at + match[1].length } : undefined;
  }
};

/**
 * Writes a value into a slot: in the slot's plain form where that carries it, and as a JSON string anywhere else.
 *
 * @remarks
 * The one rule by which a doc holds any name, path or link a repository can, and reads it back as itself. The plain
 * form cannot carry a line break, a lone surrogate, an empty name, a `)` in a link, or a line terminator in a path,
 * and is not given a control character other than a tab or a line or paragraph separator, so that git shows and diffs
 * the doc as text and no renderer breaks a line inside a name ({@link UNWRITTEN});
 * such a value is written in double quotes with JSON's escapes (`"a\nb"`, `"\ud800"`, `""`), with U+2028 and U+2029
 * escaped too so that it stays on its line for every reader. A value whose plain form would begin with `"` is quoted
 * as well, so the first character tells the reader which form it has, and each value has exactly one form. A value
 * the plain form carries is written as the format always wrote it.
 */
function writeValue(slot: Slot, value: string): string {
  const plain = UNWRITTEN.test(value) || LONE_SURROGATE.test(value) ? undefined : slot.plain(value);
  return plain === undefined || plain.startsWith('"') ? slot.quoted(value) : plain;
}

/** Reads a value from a slot at `at`, in either form; undefined unless the text there is exactly what {@link writeValue} writes for it. */
function takeValue(slot: Slot, line: string, at: number): Taken | undefined {
  const taken = slot.take(line, at);
  return taken && writeValue(slot, taken.value) === line.slice(at, taken.end) ? taken : undefined;
}

/** A value as a JSON string that stays on its line. */
function quote(value: string): string {
  return JSON.stringify(value).replace(/[\u2028\u2029]/gu, (character) => `\\u${character.charCodeAt(0).toString(16)}`);
}

/** The JSON string that begins at `at`; undefined where it never closes or is not JSON. */
function takeQuoted(line: string, at: number): Taken | undefined {
  for (let index = at + 1; index < line.length; index += 1) {
    if (line[index] === "\\") {
      index += 1;
    } else if (line[index] === '"') {
      try {
        return { value: JSON.parse(line.slice(at, index + 1)) as string, end: index + 1 };
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

/**
 * A name as a markdown code span that reads back as the name whatever it holds: fenced by one backtick more than its
 * longest run of backticks, and padded with a space on each side where it begins or ends with a backtick or a space,
 * as CommonMark reads a code span; a name that is all spaces is written as it is.
 */
export function codeSpan(name: string): string {
  // A loop, not `Math.max(...runs)`, which throws past some hundred thousand runs.
  let longest = 0;
  for (const run of name.matchAll(/`+/gu)) {
    longest = Math.max(longest, run[0].length);
  }
  const fence = "`".repeat(longest + 1);
  const pad = /^[` ]|[` ]$/u.test(name) && name.trim() !== "" ? " " : "";
  return `${fence}${pad}${name}${pad}${fence}`;
}

/**
 * The code span that begins at `at`, as CommonMark reads one: its fence of backticks, its content up to the next run of
 * exactly as many, and a space stripped from each side where the content begins and ends with one and is not all
 * spaces; undefined where no span begins or it never closes.
 */
export function takeCodeSpan(text: string, at: number): { content: string; end: number } | undefined {
  const open = /^`+/u.exec(text.slice(at));
  if (open === null) return undefined;
  const fence = open[0].length;
  for (let index = at + fence; index < text.length; index += 1) {
    if (text[index] !== "`") continue;
    let run = index;
    while (run < text.length && text[run] === "`") run += 1;
    if (run - index === fence) {
      let content = text.slice(at + fence, index);
      if (content.length >= 2 && content.startsWith(" ") && content.endsWith(" ") && content.trim() !== "") content = content.slice(1, -1);
      return content === "" ? undefined : { content, end: run };
    }
    index = run - 1;
  }
  return undefined;
}

/**
 * What a link's path cannot hold as itself, as a URL or as a markdown link's target: `%`, `#`, `?`, parentheses, angle
 * brackets, a backslash, a space or a control character, a line separator, and `&`, since CommonMark reads `&amp;` in a
 * target as `&`.
 */
// eslint-disable-next-line no-control-regex -- the control characters are what a link cannot hold
const LINK_UNSAFE = /[%&#?()<>\\\x00-\x20\x7f\u2028\u2029]/gu;

/**
 * A workspace path as a link's path: every character a URL or a markdown link's target cannot hold as itself
 * percent-encoded as UTF-8 (`notes/plan (draft).md` is `notes/plan%20%28draft%29.md`), every other as it is, so
 * that the link opens the file in a markdown viewer and its first `#` begins its fragment. A path of letters, digits
 * and `-./@_` is written as it is.
 */
export function encodeLinkPath(path: string): string {
  return path.replace(LINK_UNSAFE, (character) => Array.from(new TextEncoder().encode(character), (byte) => `%${byte.toString(16).toUpperCase().padStart(2, "0")}`).join(""));
}

/**
 * A link's path as the workspace path it names, percent-decoded as a browser reads it; a path that is not well-formed
 * percent-encoding is read as written, as the Explorer's reader reads one.
 */
export function decodeLinkPath(path: string): string {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

/** A name as the doc writes it. */
function name(value: string): string {
  return writeValue(NAME, value);
}

/** A name linked to a target: `[name](target)`. */
function linked(label: string, target: string): string {
  return `[${name(label)}](${writeValue(LINK, target)})`;
}

// ============================================================================
// Rendering
// ============================================================================

/** Writes a Live Doc as markdown. The output always ends with one newline. */
export function renderLiveDoc(doc: LiveDoc): string {
  const lines: string[] = [];
  const codePath = name(doc.codePath);
  lines.push(`# ${codePath}`, "", "## Metadata", `- Layer: ${doc.layer}`);
  if (doc.archetype) {
    lines.push(`- Archetype: ${doc.archetype}`);
  }
  if (doc.layer === 4) {
    lines.push(`- Code Path: ${codePath}`);
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
  const declarer = entry.declarer ? linked(entry.declarer.label, entry.declarer.link) : "";
  switch (entry.reason) {
    case "program":
      return `- Entry: program${symbol ? ` ${symbol}` : ""}`;
    case "command":
      return `- Entry: command ${name(entry.command ?? "")} of ${declarer}`;
    case "module":
      return `- Entry: module of ${declarer}`;
    case "opening":
      return `- Entry: opening ${symbol}`;
    default:
      return `- Entry: ${entry.reason}`;
  }
}

function renderSymbolRef(symbol: { name: string; link?: string }): string {
  return symbol.link ? linked(symbol.name, symbol.link) : name(symbol.name);
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
    lines.push(`#### ${name(symbol.name)}${symbol.slug ? ` {#${symbol.slug}}` : ""}`);
    lines.push(`- Type: ${symbol.kind}${symbol.flags.length ? ` (${symbol.flags.join(", ")})` : ""}`);
    if (symbol.source) {
      lines.push(`- Source: [source](${writeValue(SOURCE, symbol.source.path)}#L${symbol.source.line})`);
    }
    for (const reference of symbol.references) {
      lines.push(renderReference(reference));
    }
    symbol.sections.forEach((section) => {
      lines.push("", `##### ${name(symbol.name)} — ${section.title}`, ...escapeBody(section.body.flatMap((line) => line.split("\n"))));
    });
  });
  return lines;
}

function renderReference(reference: ReferenceLine): string {
  if (reference.role === "Parameters") {
    const entries = reference.parameters.map((parameter) => `${name(parameter.name)}: ${renderTypes(parameter.types)}`);
    return `- Parameters: ${entries.join("; ")}`;
  }
  return `- ${reference.role}: ${renderTypes(reference.types)}`;
}

function renderTypes(types: TypeRef[]): string {
  return types.map(renderType).join(", ");
}

function renderType(type: TypeRef): string {
  let text = type.link ? linked(type.name, type.link) : name(type.name);
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
    return `- ${linked(dependency.label, dependency.link)}${qualifier}`;
  }
  const symbols = dependency.symbols?.length ? ` - ${dependency.symbols.map(name).join(", ")}` : "";
  return `- ${name(dependency.label)}${symbols}${qualifier}`;
}

function renderCitedBy(entry: CitedBy): string {
  return `- ${linked(entry.label, entry.link)}`;
}

function renderReExports(entries: ReExport[]): string[] {
  const lines: string[] = [];
  entries.forEach((entry, index) => {
    if (index > 0) {
      lines.push("");
    }
    lines.push(`#### ${name(entry.name)}${entry.slug ? ` {#${entry.slug}}` : ""}`);
    const flags = entry.flags.length ? ` (${entry.flags.join(", ")})` : "";
    lines.push(entry.from ? `${RE_EXPORTED_FROM}${linked(entry.from.label, entry.from.link)}${flags}` : `${EXTERNAL_RE_EXPORT}${flags}`);
  });
  return lines;
}

// ============================================================================
// Section bodies
// ============================================================================

/** A fence line as CommonMark reads one: up to three spaces, three or more backticks or tildes, and whether it may close a fence. */
function fenceOf(line: string): { char: string; length: number; closes: boolean } | undefined {
  const fence = /^ {0,3}(`{3,}|~{3,})(.*)$/u.exec(line);
  if (fence === null || (fence[1][0] === "`" && fence[2].includes("`"))) return undefined;
  return { char: fence[1][0], length: fence[1].length, closes: fence[2].trim() === "" };
}

/** True when a fence line closes the fence opened by `open`, as CommonMark closes one. */
function closesFence(line: string, open: { char: string; length: number }): boolean {
  const fence = fenceOf(line);
  return fence !== undefined && fence.closes && fence.char === open.char && fence.length >= open.length;
}

/**
 * The HTML blocks CommonMark ends only at a closer, not at a blank line: a `<script>`, `<pre>`, `<style>` or
 * `<textarea>`, a comment, a processing instruction, a declaration and a CDATA section. Opened in a docstring and never
 * closed there, one would run on over the doc after it.
 */
const HTML_BLOCKS: readonly { start: RegExp; end: RegExp }[] = [
  { start: /^ {0,3}<(?:script|pre|style|textarea)(?:[ \t>]|$)/iu, end: /<\/(?:script|pre|style|textarea)>/iu },
  { start: /^ {0,3}<!--/u, end: /-->/u },
  { start: /^ {0,3}<\?/u, end: /\?>/u },
  { start: /^ {0,3}<![A-Za-z]/u, end: />/u },
  { start: /^ {0,3}<!\[CDATA\[/u, end: /\]\]>/u }
];

/** The HTML block a line opens, if it opens one that only a closer ends. */
function htmlBlockOf(line: string): { start: RegExp; end: RegExp } | undefined {
  return HTML_BLOCKS.find((block) => block.start.test(line));
}

/** A body line the grammar or a markdown viewer would take for structure: a heading, a fence, a section marker, an HTML block a closer ends. */
function structural(line: string): boolean {
  return fenceOf(line) !== undefined || htmlBlockOf(line) !== undefined || line.startsWith(MARKER) || symbolHeading(line) !== undefined || sectionHeading(line) !== undefined;
}

/**
 * A section's body as written: each line the reader would take for structure gets one more backslash in front.
 *
 * @remarks
 * A body is free text from a source file, a docstring's lines, and markdown by its author's intent: its emphasis,
 * links and lists render. What it may not do is change the doc around it. The reader ends a body at a heading outside
 * a fence and a section at its end marker anywhere; a markdown viewer runs a fence or an HTML block of the kinds a
 * closer ends ({@link HTML_BLOCKS}) on past the body when nothing in the body closes it. So a line of the body that is
 * a heading outside a fence, that is a section marker, or that opens a fence or such an HTML block nothing later in the
 * body closes, is written with a backslash in front, which markdown shows as the line's own text; so is a fence line
 * inside such an HTML block, where the reader, which knows fences and not HTML, would take it for one; and so is a
 * line that is already such a line behind backslashes, so that {@link unescapeBodyLine} gives every line back. Fences
 * are read by CommonMark's rule, backticks or tildes, a closer at least as long as its opener, by the writer and the
 * reader alike.
 */
function escapeBody(lines: string[]): string[] {
  // What closes after each line, counted once from the end: the longest closing fence of each kind, and whether each
  // HTML block's closer comes, so that the escape stays linear in a docstring of many lines.
  const longestCloser = new Map<string, number[]>([["`", []], ["~", []]]);
  const closerComes = HTML_BLOCKS.map((): boolean[] => []);
  let longest = { "`": 0, "~": 0 } as Record<string, number>;
  let comes = HTML_BLOCKS.map(() => false);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    longestCloser.get("`")![index] = longest["`"];
    longestCloser.get("~")![index] = longest["~"];
    HTML_BLOCKS.forEach((_, kind) => (closerComes[kind][index] = comes[kind]));
    const fence = fenceOf(lines[index]);
    if (fence?.closes) longest = { ...longest, [fence.char]: Math.max(longest[fence.char], fence.length) };
    comes = HTML_BLOCKS.map((block, kind) => comes[kind] || block.end.test(lines[index]));
  }
  let fence: { char: string; length: number } | undefined;
  let html: RegExp | undefined;
  return lines.map((line, index) => {
    const escaped = `\\${line}`;
    if (line.startsWith("\\")) {
      return structural(line.replace(/^\\+/u, "")) ? escaped : line;
    }
    if (line.startsWith(MARKER)) {
      return escaped;
    }
    if (fence !== undefined) {
      if (closesFence(line, fence)) fence = undefined;
      return line;
    }
    if (html !== undefined) {
      if (html.test(line)) html = undefined;
      // Inside such a block a markdown viewer shows the lines as they are; the reader, which knows no HTML, still takes a
      // fence or a heading for its own, so those are escaped.
      return fenceOf(line) !== undefined || symbolHeading(line) !== undefined || sectionHeading(line) !== undefined ? escaped : line;
    }
    const opens = fenceOf(line);
    if (opens !== undefined) {
      if (longestCloser.get(opens.char)![index] < opens.length) return escaped;
      fence = opens;
      return line;
    }
    const block = htmlBlockOf(line);
    if (block !== undefined) {
      const rest = line.replace(block.start, "");
      if (block.end.test(rest)) return line;
      if (!closerComes[HTML_BLOCKS.indexOf(block)][index]) return escaped;
      html = block.end;
      return line;
    }
    return structural(line) ? escaped : line;
  });
}

/** A body line as it was before {@link escapeBody}. */
function unescapeBodyLine(line: string): string {
  return line.startsWith("\\") && structural(line.replace(/^\\+/u, "")) ? line.slice(1) : line;
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
  const codePath = wholeValue(NAME, reader.expect(/^# /u, "the title").input, 2) ?? reader.failBefore("unexpected title");
  reader.expectBlank();
  reader.expectLine("## Metadata");
  const layer = Number(reader.expect(/^- Layer: (\d+)$/u, "the Layer line")[1]);
  const archetype = reader.take(/^- Archetype: (.+)$/u)?.[1];
  if (layer === 4) {
    const declared = wholeValue(NAME, reader.expect(/^- Code Path: /u, "the Code Path line").input, CODE_PATH.length) ?? reader.failBefore("unexpected Code Path");
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

const CODE_PATH = "- Code Path: ";

/** True when a blank line and the named section's opening marker come next; the end of the text is not a section. */
function nextSectionIs(reader: Reader, name: string): boolean {
  return !reader.atEnd() && reader.peek(0) === "" && reader.peek(1) === `${BEGIN}${name}${CLOSE}`;
}

/** The value of a slot that runs from `at` to the end of the line, in either form; undefined where it does not. */
function wholeValue(slot: Slot, line: string, at: number): string | undefined {
  const taken = takeValue(slot, line, at);
  return taken?.end === line.length ? taken.value : undefined;
}

/**
 * Reads one line from left to right: literal text, and values in either of their forms. Every value is
 * self-delimiting, so no separator inside a name, a path or a link is ever taken for the grammar's own.
 */
class Cursor {
  constructor(private readonly line: string, private at = 0) {}

  /** Consumes `literal` where the line goes on with it. */
  skip(literal: string): boolean {
    if (!this.line.startsWith(literal, this.at)) {
      return false;
    }
    this.at += literal.length;
    return true;
  }

  /** Consumes a value of the slot. */
  value(slot: Slot): string | undefined {
    const taken = takeValue(slot, this.line, this.at);
    if (taken) {
      this.at = taken.end;
    }
    return taken?.value;
  }

  /** Consumes `[name](link)`: the name and the link; consumes nothing where none follows. */
  linked(): { name: string; link: string } | undefined {
    const start = this.at;
    const name = this.skip("[") ? this.value(NAME) : undefined;
    const link = name !== undefined && this.skip("](") ? this.value(LINK) : undefined;
    if (link !== undefined && this.skip(")")) {
      return { name: name!, link };
    }
    this.at = start;
    return undefined;
  }

  /** Consumes a parenthesised list of words to the end of the line, ` (re-export, type-only)`, or nothing where none follows. */
  words(): string[] | undefined {
    if (!this.skip(" (")) {
      return [];
    }
    const words = /^([^)]+)\)$/u.exec(this.rest());
    return words ? words[1].split(", ") : undefined;
  }

  /** Consumes the rest of the line. */
  rest(): string {
    const rest = this.line.slice(this.at);
    this.at = this.line.length;
    return rest;
  }

  /** True when the whole line has been read. */
  done(): boolean {
    return this.at === this.line.length;
  }
}

const ENTRY_LINE = /^- Entry: (program|command|module|opening|tooling|declared)(?: ([\s\S]+))?$/u;

function parseEntry(match: RegExpExecArray, lineNumber: number): Entry {
  const reason = match[1] as EntryReason;
  const cursor = new Cursor(match[2] ?? "");
  const symbolOf = (): { name: string; link?: string } | undefined => {
    const link = cursor.linked();
    const name = link ? undefined : cursor.value(NAME);
    return link ? { name: link.name, link: link.link } : name !== undefined ? { name } : undefined;
  };
  const declarerOf = (): { label: string; link: string } | undefined => {
    const link = cursor.linked();
    return link && { label: link.name, link: link.link };
  };
  let entry: Entry | undefined;
  switch (reason) {
    case "program": {
      const symbol = match[2] === undefined ? undefined : symbolOf();
      entry = match[2] === undefined ? { reason } : symbol && { reason, symbol };
      break;
    }
    case "command": {
      const command = cursor.value(NAME);
      const declarer = command !== undefined && cursor.skip(" of ") ? declarerOf() : undefined;
      entry = declarer && { reason, command, declarer };
      break;
    }
    case "module": {
      const declarer = cursor.skip("of ") ? declarerOf() : undefined;
      entry = declarer && { reason, declarer };
      break;
    }
    case "opening": {
      const symbol = symbolOf();
      entry = symbol?.link !== undefined ? { reason, symbol } : undefined;
      break;
    }
    default:
      entry = match[2] === undefined ? { reason } : undefined;
  }
  if (!entry || !cursor.done()) {
    throw new LiveDocSyntaxError(lineNumber, `unexpected evidence on the ${reason} entry ${JSON.stringify(match[0])}`);
  }
  return entry;
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

/** A symbol's or a re-export's heading: `#### name {#anchor}`. */
function symbolHeading(line: string): { name: string; slug?: string } | undefined {
  if (!line.startsWith("#### ")) return undefined;
  const cursor = new Cursor(line, 5);
  const name = cursor.value(NAME);
  if (name === undefined) return undefined;
  if (cursor.done()) return { name };
  const anchor = /^ \{#([^}]+)\}$/u.exec(cursor.rest());
  return anchor ? { name, slug: anchor[1] } : undefined;
}

/** A section heading under a symbol: `##### name — title`. */
function sectionHeading(line: string): { name: string; title: string } | undefined {
  if (!line.startsWith("##### ")) return undefined;
  const cursor = new Cursor(line, 6);
  const name = cursor.value(NAME);
  const title = name !== undefined && cursor.skip(" — ") ? cursor.rest() : undefined;
  return title !== undefined && LINE_TEXT.test(title) ? { name: name!, title } : undefined;
}

const TYPE_LINE = /^- Type: ([^ ]+)(?: \(([^)]+)\))?$/u;
const SOURCE_LINE = "- Source: [source](";
const REFERENCE_LINE = /^- (Returns|Parameters|Extends|Implements|Constraints): /u;

/** A `Source` line: the path of the source file and the line the symbol is on. */
function sourceOf(line: string): { path: string; line: number } | undefined {
  if (!line.startsWith(SOURCE_LINE)) return undefined;
  const cursor = new Cursor(line, SOURCE_LINE.length);
  const path = cursor.value(SOURCE);
  const number = path === undefined ? null : /^#L(\d+)\)$/u.exec(cursor.rest());
  return number ? { path: path!, line: Number(number[1]) } : undefined;
}

function parseSymbols(body: Body): SymbolBlock[] {
  const symbols: SymbolBlock[] = [];
  const lines = body.lines;
  const at = (index: number): number => body.start + index;
  let index = 0;
  while (index < lines.length) {
    const heading = symbolHeading(lines[index]);
    if (!heading) {
      throw new LiveDocSyntaxError(at(index), `expected a symbol heading, found ${JSON.stringify(lines[index])}`);
    }
    const symbol: SymbolBlock = { name: heading.name, slug: heading.slug, kind: "", flags: [], references: [], sections: [] };
    index += 1;
    const type = TYPE_LINE.exec(lines[index] ?? "");
    if (!type) {
      throw new LiveDocSyntaxError(at(index), `expected the Type line of ${symbol.name}`);
    }
    symbol.kind = type[1];
    symbol.flags = type[2] ? type[2].split(", ") : [];
    index += 1;
    const source = sourceOf(lines[index] ?? "");
    if (source) {
      symbol.source = source;
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
      if (symbolHeading(lines[index] ?? "") !== undefined) {
        break;
      }
      const section = sectionHeading(lines[index] ?? "");
      if (!section) {
        throw new LiveDocSyntaxError(at(index), `expected a section of ${symbol.name}, found ${JSON.stringify(lines[index])}`);
      }
      if (section.name !== symbol.name) {
        throw new LiveDocSyntaxError(at(index), `section of ${section.name} under ${symbol.name}`);
      }
      index += 1;
      const sectionLines: string[] = [];
      let fence: { char: string; length: number } | undefined;
      while (index < lines.length) {
        const line = lines[index];
        if (!fence && (sectionHeading(line) !== undefined || symbolHeading(line) !== undefined)) {
          break;
        }
        if (!fence && line === "" && (index + 1 === lines.length || sectionHeading(lines[index + 1]) !== undefined || symbolHeading(lines[index + 1]) !== undefined)) {
          break;
        }
        // Fences by CommonMark's rule, as the writer pairs them.
        if (fence !== undefined) {
          if (closesFence(line, fence)) fence = undefined;
        } else {
          const opens = fenceOf(line);
          if (opens !== undefined) fence = opens;
        }
        sectionLines.push(line);
        index += 1;
      }
      if (sectionLines.length === 0 || sectionLines[sectionLines.length - 1] === "") {
        throw new LiveDocSyntaxError(at(index), `the ${section.title} section of ${symbol.name} is empty or ends with a blank line`);
      }
      symbol.sections.push({ title: section.title, body: sectionLines.map(unescapeBodyLine) });
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
  const cursor = new Cursor(line, match[0].length);
  const role = match[1] as ReferenceRole | "Parameters";
  let reference: ReferenceLine | undefined;
  if (role === "Parameters") {
    const parameters: { name: string; types: TypeRef[] }[] = [];
    do {
      const name = cursor.value(NAME);
      const types = name !== undefined && cursor.skip(": ") ? typesOf(cursor) : undefined;
      if (!types) {
        throw new LiveDocSyntaxError(lineNumber, `unexpected parameter in ${JSON.stringify(line)}`);
      }
      parameters.push({ name: name!, types });
    } while (cursor.skip("; "));
    reference = { role, parameters };
  } else {
    const types = typesOf(cursor);
    reference = types && { role, types };
  }
  if (!reference || !cursor.done()) {
    throw new LiveDocSyntaxError(lineNumber, `unexpected type in ${JSON.stringify(line)}`);
  }
  return reference;
}

/** Types separated by commas: `[name](link)` or `name`, each perhaps an array (`[]`) and a promise (`Promise<…>`). */
function typesOf(cursor: Cursor): TypeRef[] | undefined {
  const types: TypeRef[] = [];
  do {
    const promise = cursor.skip("Promise<");
    const link = cursor.linked();
    const name = link ? link.name : cursor.value(NAME);
    if (name === undefined) {
      return undefined;
    }
    const type: TypeRef = { name };
    if (link) {
      type.link = link.link;
    }
    if (cursor.skip("[]")) {
      type.array = true;
    }
    if (promise) {
      if (!cursor.skip(">")) {
        return undefined;
      }
      type.promise = true;
    }
    types.push(type);
  } while (cursor.skip(", "));
  return types;
}

function parseDependency(line: string, lineNumber: number): Dependency {
  const cursor = new Cursor(line);
  let dependency: Dependency | undefined;
  if (cursor.skip("- ")) {
    const link = cursor.linked();
    const label = link ? link.name : cursor.value(NAME);
    let symbols: string[] | undefined;
    if (label !== undefined && !link && cursor.skip(" - ")) {
      symbols = [];
      for (let symbol = cursor.value(NAME); symbol !== undefined; symbol = cursor.skip(", ") ? cursor.value(NAME) : undefined) {
        symbols.push(symbol);
      }
    }
    const qualifiers = label === undefined || symbols?.length === 0 ? undefined : cursor.words();
    if (label !== undefined && qualifiers !== undefined) {
      dependency = link ? { label, link: link.link, qualifiers } : { label, qualifiers, ...(symbols ? { symbols } : {}) };
    }
  }
  if (!dependency || !cursor.done()) {
    throw new LiveDocSyntaxError(lineNumber, `unexpected dependency line ${JSON.stringify(line)}`);
  }
  return dependency;
}

function parseCitedBy(line: string, lineNumber: number): CitedBy {
  const cursor = new Cursor(line);
  const link = cursor.skip("- ") ? cursor.linked() : undefined;
  if (!link || !cursor.done()) {
    throw new LiveDocSyntaxError(lineNumber, `unexpected Cited By line ${JSON.stringify(line)}`);
  }
  return { label: link.name, link: link.link };
}

const RE_EXPORT_EXTERNAL = new RegExp(`^${escape(EXTERNAL_RE_EXPORT)}(?: \\(([^)]+)\\))?$`, "u");

function parseReExports(body: Body): ReExport[] {
  const entries: ReExport[] = [];
  const lines = body.lines;
  const at = (index: number): number => body.start + index;
  for (let index = 0; index < lines.length; index += 3) {
    const heading = symbolHeading(lines[index]);
    if (!heading) {
      throw new LiveDocSyntaxError(at(index), `expected a re-export heading, found ${JSON.stringify(lines[index])}`);
    }
    const line = lines[index + 1] ?? "";
    const external = RE_EXPORT_EXTERNAL.exec(line);
    const cursor = new Cursor(line);
    const from = external ? undefined : cursor.skip(RE_EXPORTED_FROM) ? cursor.linked() : undefined;
    const flags = external ? external[1]?.split(", ") ?? [] : from ? cursor.words() : undefined;
    if (!flags || (from && !cursor.done())) {
      throw new LiveDocSyntaxError(at(index + 1), `expected the origin of ${heading.name}, found ${JSON.stringify(line)}`);
    }
    entries.push({ name: heading.name, slug: heading.slug, from: from ? { label: from.name, link: from.link } : undefined, flags });
    if (index + 2 < lines.length && lines[index + 2] !== "") {
      throw new LiveDocSyntaxError(at(index + 2), `expected a blank line after ${heading.name}`);
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
  // Lines end where the grammar's do, at LF, CRLF or CR, and nowhere else: a name holding U+2028 and `## Authored` is
  // no heading, and the words of a doc saved with CR alone are found.
  const lines = text.split(LINE_ENDING);
  const start = lines.findIndex((line) => /^## Authored[ \t]*$/u.test(line));
  if (start < 0) {
    return DEFAULT_AUTHORED_BLOCK;
  }
  const end = lines.findIndex((line, index) => index > start && /^## Generated[ \t]*$/u.test(line));
  const block = lines.slice(start + 1, end < 0 ? undefined : end).join("\n").trim();
  return block || DEFAULT_AUTHORED_BLOCK;
}

// ============================================================================
// Reader
// ============================================================================

/**
 * Reads a text line by line for the parsers, and fails with the line number when the grammar is not met. A line ends
 * at LF, CRLF or a carriage return alone, as CommonMark ends one, so a doc checked out with Windows line endings, or
 * saved by an editor that ends lines with CR, reads as the one written with LF: the writer holds no carriage return in
 * a line, quoting a name that has one ({@link UNWRITTEN}). A byte-order mark before the first line, which Windows
 * PowerShell 5.1 writes whenever a file passes through it, is set aside. A Live Doc and a board are both read here.
 */
export class Reader {
  private readonly lines: string[];
  private index = 0;

  constructor(text: string) {
    const body = text.startsWith(BYTE_ORDER_MARK) ? text.slice(1) : text;
    const ending = /(?:\r\n?|\n)$/u.exec(body);
    if (!ending) {
      throw new LiveDocSyntaxError(body.split(LINE_ENDING).length, "the text must end with a newline");
    }
    this.lines = body.slice(0, ending.index).split(LINE_ENDING);
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

  /** Throws a syntax error at the line just consumed, quoting it. */
  failBefore(detail: string): never {
    throw new LiveDocSyntaxError(this.index, `${detail} ${JSON.stringify(this.lines[this.index - 1])}`);
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
