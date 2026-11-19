/**
 * How a markdown link is read: CommonMark's rule, in one place, for every reader of this tool. The engine reads the
 * links of a doc's authored words and of the workspace's documents with it, the Explorer renders prose with it, and
 * the markdown link audit checks links with it, so that a link one of them counts is the link the others open.
 *
 * @remarks
 * The inline rule is CommonMark 0.31.2's, graded by its own examples (`markdownLinks.commonmark.test.ts`):
 * where a destination begins and ends, in angle brackets or bare with parentheses that pair and backslash
 * escapes; its title in double quotes, single quotes or parentheses; backslash escapes and character references
 * in both; and what is not a link because something else claims its characters first, a code span, an autolink
 * or raw HTML, read left to right as CommonMark reads them. Links do not hold links; an image may sit inside a
 * link, and what an image's description holds is its text, not links. A reference link, `[text][label]`,
 * `[label][]` or `[label]`, takes the destination of the document's first definition of its label.
 *
 * Of the blocks, this module reads only what decides whether a link is one: a fenced code block holds no links,
 * a blank line, a heading, a thematic break or a list item ends a paragraph, and a paragraph may begin with link
 * reference definitions. It differs from CommonMark deliberately in three places, each because telling them
 * apart needs the whole container structure of lists and block quotes, which no reader here keeps:
 * - An indented code block is not recognised, and a link in one is read. Authored docs indent a nested list
 *   item by four spaces, which only the list structure tells from code.
 * - A fence is recognised at the start of a line, indented by up to three spaces, as the Explorer's renderer and
 *   the symbol audit find one; a fence inside a block quote, or under a list item by four spaces or more, is read
 *   as text, where its backticks pair as a code span when no blank line falls between them.
 * - An HTML block is not recognised: a link written between `<div>` lines is read. Its tags are raw HTML.
 *
 * Pure, and with no dependencies but HTML's table of named references, so that the Explorer's page carries it.
 *
 * @module
 */

import { namedCharacterReference } from "./htmlEntities";

/**
 * How many characters and tokens the reader has looked at since it was loaded, for the test that holds its work
 * linear in the text: each loop that walks characters, and each search for a closer, adds what it walked. A
 * pattern tried at one place is counted once, since each is bounded by its own delimiters or by a closer known to
 * stand ahead.
 */
export const readingSteps = { count: 0 };

/** A link, an image or an autolink, as CommonMark reads it. */
export interface MarkdownLink {
  /**
   * `inline`, `[text](destination "title")`; `reference`, `[text][label]`, `[label][]` or `[label]` with a
   * definition `[label]: destination` elsewhere in the document; `autolink`, `<https://…>` or `<name@host>`.
   */
  kind: "inline" | "reference" | "autolink";
  /** True for an image, `![description](…)`. */
  image: boolean;
  /**
   * The destination as CommonMark reads it: without its angle brackets, its backslash escapes and character
   * references resolved, and its percent-encoding kept, as it stands in a browser's address; an email autolink's
   * is a `mailto:` address. {@link linkPath} reads the path it names.
   */
  destination: string;
  /** The title, its escapes and references resolved, when the link has one. */
  title?: string;
  /** Where the whole link begins and ends in the text read, `[` or `!` to the closing `)`, `]` or `>`. */
  start: number;
  end: number;
  /** Where its text begins and ends: between its brackets, or, for an autolink, the address. */
  textStart: number;
  textEnd: number;
}

/** Something inline that is not a link but claims its characters before a link can. */
export interface MarkdownLiteral {
  /** A code span, a backslash escape, a character reference, or raw HTML. */
  kind: "code" | "escape" | "reference-character" | "html";
  start: number;
  end: number;
  /**
   * What it stands for: a code span's content, its line endings as spaces and one space trimmed from each end
   * when both have one; the escaped character; the character a reference names; raw HTML as written.
   */
  text: string;
}

/** What a run of inline text holds, in the order it begins, a link's contents after the link. */
export type InlineToken = MarkdownLink | MarkdownLiteral;

/** A link reference definition's destination and title. */
export interface LinkDefinition {
  destination: string;
  title?: string;
}

/** A document's link reference definitions, by their labels as {@link normalizeLabel} gives them. */
export type LinkDefinitions = ReadonlyMap<string, LinkDefinition>;

/** What a document's links are: every link, image and autolink, and the references whose label no definition names. */
export interface MarkdownLinkReading {
  /** In the order they begin; a link inside an image's description is not one. */
  links: MarkdownLink[];
  /**
   * Every `[text][label]` or `[label][]` whose label no definition names: text to CommonMark, a link its author
   * meant, which the link audit reports.
   */
  unresolved: Array<{ label: string; start: number; end: number }>;
  definitions: LinkDefinitions;
}

/**
 * Every link of a markdown document, by CommonMark's rule but where the module's remarks say otherwise. Offsets
 * are the document's own.
 */
export function readMarkdownLinks(document: string): MarkdownLinkReading {
  // A line ends at CRLF, CR or LF alike; offsets into the text read are mapped back to the document's own.
  const original = lineEndingOffsets(document);
  const at = (offset: number): number => original?.[offset] ?? offset;
  const { text, blocks } = readBlocks(original ? document.replace(/\r\n?/gu, "\n") : document);
  const definitions = new Map<string, LinkDefinition>();
  const contents: Array<[number, number]> = [];
  for (const block of blocks) {
    const content = text.slice(block.start, block.end);
    const start = block.heading ? 0 : leadingDefinitions(content, definitions);
    if (start < content.length) contents.push([block.start + start, block.end]);
  }
  const links: MarkdownLink[] = [];
  const unresolved: MarkdownLinkReading["unresolved"] = [];
  for (const [start, end] of contents) {
    const scan = new InlineScan(text.slice(start, end), definitions);
    // Tokens are in the order they begin, so one sweep tells what stands inside an image's description.
    let insideImageUntil = -1;
    for (const token of scan.tokens) {
      readingSteps.count += 1;
      if (token.start < insideImageUntil || !isLink(token)) continue;
      if (token.image) insideImageUntil = token.textEnd;
      links.push({ ...token, start: at(token.start + start), end: at(token.end + start), textStart: at(token.textStart + start), textEnd: at(token.textEnd + start) });
    }
    for (const reference of scan.unresolved) unresolved.push({ ...reference, start: at(reference.start + start), end: at(reference.end + start) });
  }
  return { links, unresolved, definitions };
}

/**
 * For a document with a carriage return in it, the offset in the document of each offset in the text with its line
 * endings as line feeds, one past its end included; undefined for a document whose line endings are line feeds.
 */
function lineEndingOffsets(document: string): number[] | undefined {
  if (!document.includes("\r")) return undefined;
  const offsets: number[] = [];
  for (let index = 0; index < document.length; index += 1) {
    // A CRLF is one line feed, which stands where its carriage return does, so that a link ending a line ends before it.
    offsets.push(index);
    if (document[index] === "\r" && document[index + 1] === "\n") index += 1;
  }
  offsets.push(document.length);
  return offsets;
}

/**
 * Where a paragraph's text goes on after the link reference definitions it begins with, which CommonMark reads as
 * definitions and does not show; 0 when it begins with none. Each definition is added to `definitions` unless its
 * label is defined already, since the first definition of a label is the one that counts.
 */
export function leadingDefinitions(paragraph: string, definitions: Map<string, LinkDefinition> = new Map()): number {
  let start = 0;
  for (;;) {
    const at = skipSpace(paragraph, start, paragraph.length);
    const found = linkDefinition(paragraph, at);
    if (!found) return start;
    if (!definitions.has(found.label)) definitions.set(found.label, found.definition);
    start = found.end;
  }
}

/**
 * What one run of inline text holds, a paragraph's or a heading's: its links and what claims characters before
 * them, in the order they begin, with offsets into the text. A reference link needs the document's definitions.
 */
export function inlineTokens(text: string, definitions: LinkDefinitions = new Map()): InlineToken[] {
  return new InlineScan(text, definitions).tokens;
}

/** True for a link, an image or an autolink. */
export function isLink(token: InlineToken): token is MarkdownLink {
  return token.kind === "inline" || token.kind === "reference" || token.kind === "autolink";
}

/**
 * The path a link's destination names, and its fragment, read as a browser reads a URL reference: the fragment
 * begins at the first `#` and the query at the first `?` before it, and the path before them is percent-decoded,
 * so that `plan%20%28draft%29.md` names `plan (draft).md` and `a%23b.md#top` the file `a#b.md` at `top`. A path
 * whose percent-encoding is malformed is left as written. The fragment is decoded the same way.
 */
export function linkPath(destination: string): { path: string; fragment?: string } {
  const hash = destination.indexOf("#");
  const beforeFragment = hash === -1 ? destination : destination.slice(0, hash);
  const query = beforeFragment.indexOf("?");
  const path = percentDecoded(query === -1 ? beforeFragment : beforeFragment.slice(0, query));
  return hash === -1 ? { path } : { path, fragment: percentDecoded(destination.slice(hash + 1)) };
}

/**
 * A label as CommonMark matches it: without its brackets, its runs of spaces, tabs and line endings one space, no
 * space at either end, and case folded; empty when the label holds nothing else, which no definition can name.
 */
export function normalizeLabel(label: string): string {
  return label.slice(1, -1).replace(/[ \t\r\n]+/gu, " ").replace(/^ | $/gu, "").toLowerCase().toUpperCase();
}

// ============================================================================
// Blocks
// ============================================================================

interface Block {
  start: number;
  end: number;
  heading: boolean;
}

const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/u;
const QUOTE_MARKER = /^ {0,3}>[ \t]?/u;
const LIST_MARKER = /^[ \t]*(?:[-+*]|\d{1,9}[.)])(?:[ \t]+|$)/u;
const THEMATIC_BREAK = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/u;
const SETEXT_UNDERLINE = /^ {0,3}=+[ \t]*$/u;
const ATX_HEADING = /^ {0,3}#{1,6}(?=[ \t]|$)/u;

/**
 * A document, its line endings line feeds, as the inline rule reads it, of the same length, and its paragraphs
 * and headings: a fenced block's lines, and the block quote and list item markers that begin a line, are spaces.
 */
function readBlocks(text: string): { text: string; blocks: Block[] } {
  const chars = text.split("");
  const blocks: Block[] = [];
  let open: { start: number; end: number; depth: number } | undefined;
  let fence: string | undefined;
  const close = (): void => {
    if (open) blocks.push({ start: open.start, end: open.end, heading: false });
    open = undefined;
  };
  const blank = (from: number, to: number): void => {
    for (let index = from; index < to; index += 1) chars[index] = " ";
  };
  for (let start = 0; start <= text.length;) {
    const newline = text.indexOf("\n", start);
    const end = newline === -1 ? text.length : newline;
    const line = text.slice(start, end);
    const next = end + 1;
    if (fence !== undefined) {
      if (new RegExp(`^ {0,3}${fence[0]}{${fence.length},}[ \\t]*$`, "u").test(line)) fence = undefined;
      blank(start, end);
      start = next;
      continue;
    }
    const opening = FENCE.exec(line);
    if (opening && !(opening[1][0] === "`" && opening[2].includes("`"))) {
      close();
      fence = opening[1];
      blank(start, end);
      start = next;
      continue;
    }
    let offset = 0;
    let depth = 0;
    for (let marker = QUOTE_MARKER.exec(line); marker; marker = QUOTE_MARKER.exec(line.slice(offset))) {
      offset += marker[0].length;
      depth += 1;
    }
    let rest = line.slice(offset);
    if (open && depth > open.depth) close();
    if (THEMATIC_BREAK.test(rest) || SETEXT_UNDERLINE.test(rest) || /^[ \t]*$/u.test(rest)) {
      close();
      start = next;
      continue;
    }
    const item = LIST_MARKER.exec(rest);
    if (item) {
      close();
      offset += item[0].length;
      rest = line.slice(offset);
    }
    blank(start, start + offset);
    const heading = ATX_HEADING.exec(rest);
    if (heading) {
      close();
      blocks.push({ start: start + offset + heading[0].length, end, heading: true });
    } else if (open) {
      open.end = end;
    } else if (rest.trim() !== "") {
      open = { start: start + offset, end, depth };
    }
    start = next;
  }
  close();
  return { text: chars.join(""), blocks };
}

/**
 * A link reference definition at `start` of a paragraph's text, `[label]: destination "title"`, ending at the end
 * of its line, or undefined when none stands there.
 */
function linkDefinition(source: string, start: number): { label: string; definition: LinkDefinition; end: number } | undefined {
  const labelLength = linkLabel(source, start);
  if (labelLength === 0 || source[start + labelLength] !== ":") return undefined;
  const label = normalizeLabel(source.slice(start, start + labelLength));
  if (label === "") return undefined;
  const destination = linkDestination(source, spaceAndOneLineEnding(source, start + labelLength + 1));
  if (!destination) return undefined;
  const beforeTitle = destination.end;
  const atTitle = spaceAndOneLineEnding(source, beforeTitle);
  const title = atTitle > beforeTitle ? linkTitle(source, atTitle) : undefined;
  const end = title ? lineEnd(source, title.end) : undefined;
  if (title && end !== undefined) {
    return { label, definition: { destination: destination.value, title: title.value }, end };
  }
  // A title that does not end its line is not one; the definition may still end at its destination.
  const untitled = lineEnd(source, beforeTitle);
  return untitled === undefined ? undefined : { label, definition: { destination: destination.value }, end: untitled };
}

/** Where the line ends after nothing but spaces and tabs, past its line ending; undefined when anything else follows. */
function lineEnd(text: string, start: number): number | undefined {
  const index = skipSpace(text, start, text.length);
  if (index === text.length) return index;
  return text[index] === "\n" ? index + 1 : undefined;
}

function skipSpace(text: string, start: number, limit: number): number {
  let index = start;
  while (index < limit && (text[index] === " " || text[index] === "\t")) index += 1;
  return index;
}

// ============================================================================
// Inlines
// ============================================================================

/** ASCII punctuation, the characters a backslash escapes. */
const ESCAPABLE = /^[!-/:-@[-`{-~]$/u;
/** The characters at which something inline may begin. */
const SPECIAL = /[\\`&<[\]!]/gu;
const CHARACTER_REFERENCE = /&(?:#[xX]([0-9a-fA-F]{1,6})|#([0-9]{1,7})|([A-Za-z][A-Za-z0-9]{1,31}));/y;
// eslint-disable-next-line no-control-regex -- an autolink holds no control character
const URI_AUTOLINK = /<([A-Za-z][A-Za-z0-9.+-]{1,31}:[^<>\x00-\x20]*)>/y;
/** What ends a bare destination: a space or an ASCII control character. */
// eslint-disable-next-line no-control-regex -- the control characters are what a bare destination cannot hold
const SPACE_OR_CONTROL = /[\x00-\x20\x7f]/u;
const EMAIL_AUTOLINK = /<([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/y;
const WHITESPACE = "[ \\t\\n]";
const ATTRIBUTE = `(?:${WHITESPACE}+[A-Za-z_:][A-Za-z0-9_.:-]*(?:${WHITESPACE}*=${WHITESPACE}*(?:[^"'=<>\`\\x00-\\x20]+|'[^']*'|"[^"]*"))?)`;
/** An open or a closing tag; a comment, an instruction, a declaration or CDATA is found by its closer instead. */
const RAW_HTML_TAG = new RegExp(`<[A-Za-z][A-Za-z0-9-]*${ATTRIBUTE}*${WHITESPACE}*/?>|</[A-Za-z][A-Za-z0-9-]*${WHITESPACE}*>`, "y");
const LINK_LABEL = /\[(?:[^\\[\]]|\\[\s\S]){0,999}\]/y;
/** How deep a bare destination's parentheses may nest, as cmark bounds them. */
const MAX_PARENTHESIS_DEPTH = 32;
/** A line ending in a paragraph and the spaces and tabs after it, which CommonMark strips from each line it continues. */
const CONTINUATION = /\n[ \t]*/gu;
const ANGLE_DESTINATION = /<((?:[^<>\n\\]|\\.)*)>/y;

interface Opener {
  /** Where its `[` stands. */
  index: number;
  image: boolean;
  /** Its place in the order openers are met; a link opener met before the last link made is inactive. */
  order: number;
  /** True once another `[` has followed it, so that its text cannot be a label. */
  bracketAfter: boolean;
}

/** One left-to-right reading of inline text, as CommonMark's "look for link or image" reads it. */
class InlineScan {
  readonly tokens: InlineToken[] = [];
  readonly unresolved: Array<{ label: string; start: number; end: number }> = [];
  private readonly openers: Opener[] = [];
  private openersMet = 0;
  /**
   * Links do not hold links: once one is made, every link opener met before it is inactive. Kept as one number,
   * the count of openers met when the last link was made, so that making a link costs nothing per opener.
   */
  private inactiveBefore = 0;

  constructor(private readonly text: string, private readonly definitions: LinkDefinitions) {
    let index = 0;
    while (index < text.length) {
      SPECIAL.lastIndex = index;
      const special = SPECIAL.exec(text);
      if (!special) break;
      readingSteps.count += special.index - index + 1;
      index = this.at(special.index);
    }
    this.tokens.sort((a, b) => a.start - b.start);
  }

  /** Reads what begins at a special character; returns where reading goes on. */
  private at(index: number): number {
    const { text } = this;
    switch (text[index]) {
      case "\\":
        if (ESCAPABLE.test(text[index + 1] ?? "")) {
          this.tokens.push({ kind: "escape", start: index, end: index + 2, text: text[index + 1] });
          return index + 2;
        }
        return index + 1;
      case "`":
        return this.codeSpan(index);
      case "&": {
        const reference = characterReference(text, index);
        if (reference) {
          this.tokens.push({ kind: "reference-character", start: index, end: reference.end, text: reference.value });
          return reference.end;
        }
        return index + 1;
      }
      case "<":
        return this.angle(index);
      case "[":
        this.open(index, false);
        return index + 1;
      case "!":
        if (text[index + 1] === "[") {
          this.open(index + 1, true);
          return index + 2;
        }
        return index + 1;
      default:
        return this.closeBracket(index);
    }
  }

  /** A code span from a run of backticks to the next run of the same length; without one, the run is text. */
  private codeSpan(index: number): number {
    const { text } = this;
    let after = index;
    while (text[after] === "`") after += 1;
    const length = after - index;
    const closer = this.nextRun(length, after);
    if (closer === undefined) return after;
    let content = text.slice(after, closer).replace(CONTINUATION, " ");
    if (content.length > 1 && content.startsWith(" ") && content.endsWith(" ") && content.trim() !== "") content = content.slice(1, -1);
    this.tokens.push({ kind: "code", start: index, end: closer + length, text: content });
    return closer + length;
  }

  /** Where each length of backtick run begins, found by one walk of the text, and how far each has been read. */
  private runs?: Map<number, { at: number[]; next: number }>;

  /** The first run of exactly `length` backticks at or after `from`, as a code span's closer; reading only goes forward. */
  private nextRun(length: number, from: number): number | undefined {
    if (!this.runs) {
      this.runs = new Map();
      for (const run of this.text.matchAll(/`+/gu)) {
        readingSteps.count += run[0].length;
        const runs = this.runs.get(run[0].length) ?? { at: [], next: 0 };
        runs.at.push(run.index);
        this.runs.set(run[0].length, runs);
      }
    }
    const runs = this.runs.get(length);
    if (!runs) return undefined;
    while (runs.next < runs.at.length && runs.at[runs.next] < from) {
      readingSteps.count += 1;
      runs.next += 1;
    }
    return runs.at[runs.next];
  }

  /** Where a closer stands at or after `from`, found once and reused while reading goes forward past `from`. */
  private readonly closers = new Map<string, { from: number; at: number }>();

  private closerAt(closer: string, from: number): number {
    const known = this.closers.get(closer);
    if (known && known.from <= from && (known.at === -1 || known.at >= from)) return known.at;
    const at = this.text.indexOf(closer, from);
    readingSteps.count += (at === -1 ? this.text.length : at) - from + 1;
    this.closers.set(closer, { from, at });
    return at;
  }

  /** An autolink or raw HTML at a `<`; otherwise the `<` is text. */
  private angle(index: number): number {
    const { text } = this;
    for (const [pattern, scheme] of [[URI_AUTOLINK, ""], [EMAIL_AUTOLINK, "mailto:"]] as const) {
      pattern.lastIndex = index;
      const match = pattern.exec(text);
      if (match) {
        const end = index + match[0].length;
        this.tokens.push({ kind: "autolink", image: false, destination: scheme + match[1], start: index, end, textStart: index + 1, textEnd: end - 1 });
        return end;
      }
    }
    readingSteps.count += 1;
    const end = this.rawHtmlEnd(index);
    if (end !== undefined) {
      const html = text.slice(index, end);
      readingSteps.count += html.length;
      this.tokens.push({ kind: "html", start: index, end, text: html });
      return end;
    }
    return index + 1;
  }

  /**
   * Where raw HTML that begins at a `<` ends, or undefined when none begins there. A comment, a processing
   * instruction, a CDATA section or a declaration runs to its closer, found by one search that reading reuses as it
   * goes forward, so that a paragraph of unclosed `<!--` is not read to its end from each one; a tag is read by its
   * pattern, which its own delimiters bound.
   */
  private rawHtmlEnd(index: number): number | undefined {
    const { text } = this;
    const through = (closer: string, from: number): number | undefined => {
      const at = this.closerAt(closer, from);
      return at === -1 ? undefined : at + closer.length;
    };
    if (text.startsWith("<!-->", index)) return index + 5;
    if (text.startsWith("<!--->", index)) return index + 6;
    if (text.startsWith("<!--", index)) return through("-->", index + 4);
    if (text.startsWith("<?", index)) return through("?>", index + 2);
    if (text.startsWith("<![CDATA[", index)) return through("]]>", index + 9);
    if (/^<![A-Za-z]/u.test(text.slice(index, index + 3))) return through(">", index + 2);
    RAW_HTML_TAG.lastIndex = index;
    const tag = RAW_HTML_TAG.exec(text);
    return tag ? index + tag[0].length : undefined;
  }

  private open(index: number, image: boolean): void {
    const previous = this.openers.at(-1);
    if (previous) previous.bracketAfter = true;
    this.openers.push({ index, image, order: this.openersMet, bracketAfter: false });
    this.openersMet += 1;
  }

  /** A `]`: the link or image it closes, if the text after it makes one; otherwise it is text. */
  private closeBracket(index: number): number {
    const { text } = this;
    const opener = this.openers.pop();
    if (!opener) return index + 1;
    if (!opener.image && opener.order < this.inactiveBefore) return index + 1;
    const after = index + 1;
    let found: { kind: "inline" | "reference"; definition: LinkDefinition; end: number } | undefined;
    if (text[after] === "(") {
      const inline = inlineLink(text, after + 1);
      if (inline) found = { kind: "inline", definition: inline, end: inline.end };
    }
    if (!found) {
      const labelLength = linkLabel(text, after);
      let label: string | undefined;
      let end = after;
      if (labelLength > 2) {
        label = text.slice(after, after + labelLength);
        end = after + labelLength;
      } else if (!opener.bracketAfter && after - opener.index <= 1001) {
        // A collapsed or shortcut reference: the text is the label, so it may hold no bracket.
        label = text.slice(opener.index, after);
        end = after + labelLength;
      }
      const definition = label !== undefined ? this.definitions.get(normalizeLabel(label)) : undefined;
      if (definition) {
        found = { kind: "reference", definition, end };
      } else if (label !== undefined && labelLength > 0 && normalizeLabel(label) !== "") {
        this.unresolved.push({ label: label.slice(1, -1), start: opener.index - (opener.image ? 1 : 0), end });
      }
    }
    if (!found) return after;
    this.tokens.push({
      kind: found.kind,
      image: opener.image,
      destination: found.definition.destination,
      ...(found.definition.title !== undefined ? { title: found.definition.title } : {}),
      start: opener.index - (opener.image ? 1 : 0),
      end: found.end,
      textStart: opener.index + 1,
      textEnd: index
    });
    if (!opener.image) this.inactiveBefore = this.openersMet;
    return found.end;
  }
}

/** An inline link's destination and title after its `(`, through its `)`. */
function inlineLink(text: string, start: number): (LinkDefinition & { end: number }) | undefined {
  const destination = linkDestination(text, spaceAndOneLineEnding(text, start));
  if (!destination) return undefined;
  let index = spaceAndOneLineEnding(text, destination.end);
  let title: string | undefined;
  // A title must be set apart from the destination by whitespace.
  if (index > destination.end) {
    const found = linkTitle(text, index);
    if (found) {
      title = found.value;
      index = spaceAndOneLineEnding(text, found.end);
    }
  }
  if (text[index] !== ")") return undefined;
  return { destination: destination.value, ...(title !== undefined ? { title } : {}), end: index + 1 };
}

/**
 * A destination at `start`: in angle brackets, holding no line ending and no `<` or `>` but escaped; or bare,
 * holding no space and no control character, its parentheses escaped or in pairs, and empty only before `)`.
 */
function linkDestination(text: string, start: number): { value: string; end: number } | undefined {
  if (text[start] === "<") {
    // Bounded by its own delimiters: it ends at the next `<`, `>` or line ending.
    ANGLE_DESTINATION.lastIndex = start;
    const match = ANGLE_DESTINATION.exec(text);
    readingSteps.count += 1 + (match ? match[0].length : 0);
    return match ? { value: unescapeString(match[1]), end: start + match[0].length } : undefined;
  }
  let index = start;
  let depth = 0;
  while (index < text.length) {
    readingSteps.count += 1;
    const character = text[index];
    if (character === "\\" && ESCAPABLE.test(text[index + 1] ?? "")) {
      index += 2;
    } else if (character === "(") {
      // CommonMark lets a reader bound the nesting so that a run of `[a](` is not read again from each one; cmark
      // stops at 32, and so does this rule. Deeper parentheses end the attempt, so the link is text.
      depth += 1;
      if (depth > MAX_PARENTHESIS_DEPTH) return undefined;
      index += 1;
    } else if (character === ")") {
      if (depth === 0) break;
      depth -= 1;
      index += 1;
    } else if (SPACE_OR_CONTROL.test(character)) {
      break;
    } else {
      index += 1;
    }
  }
  if ((index === start && text[index] !== ")") || depth !== 0) return undefined;
  return { value: unescapeString(text.slice(start, index)), end: index };
}

/** A title at `start`: in double quotes, single quotes or parentheses, its own closer escaped inside it. */
function linkTitle(text: string, start: number): { value: string; end: number } | undefined {
  const opener = text[start];
  const closer = opener === '"' ? '"' : opener === "'" ? "'" : opener === "(" ? ")" : undefined;
  if (closer === undefined) return undefined;
  // Bounded: the next title opener of the same kind closes it, or a `(` ends one in parentheses.
  for (let index = start + 1; index < text.length; index += 1) {
    readingSteps.count += 1;
    const character = text[index];
    if (character === "\\") {
      index += 1;
    } else if (character === closer) {
      return { value: unescapeString(text.slice(start + 1, index).replace(CONTINUATION, "\n")), end: index + 1 };
    } else if (opener === "(" && character === "(") {
      return undefined;
    }
  }
  return undefined;
}

/** The length of a link label at `start`, `[` to `]` with no bracket inside unescaped, or 0. */
function linkLabel(text: string, start: number): number {
  // Bounded: a label holds at most 999 characters.
  LINK_LABEL.lastIndex = start;
  const match = LINK_LABEL.exec(text);
  readingSteps.count += 1 + (match ? match[0].length : 0);
  return match ? match[0].length : 0;
}

/** Past spaces and tabs, at most one line ending, and the spaces and tabs after it. */
function spaceAndOneLineEnding(text: string, start: number): number {
  let index = skipSpace(text, start, text.length);
  if (text[index] === "\n") index = skipSpace(text, index + 1, text.length);
  return index;
}

/** A string with its backslash escapes and character references resolved, as CommonMark reads a destination or title. */
function unescapeString(value: string): string {
  if (!/[\\&]/u.test(value)) return value;
  let result = "";
  for (let index = 0; index < value.length;) {
    const character = value[index];
    if (character === "\\" && ESCAPABLE.test(value[index + 1] ?? "")) {
      result += value[index + 1];
      index += 2;
      continue;
    }
    const reference = character === "&" ? characterReference(value, index) : undefined;
    if (reference) {
      result += reference.value;
      index = reference.end;
      continue;
    }
    result += character;
    index += 1;
  }
  return result;
}

/** A character reference at `start`, `&name;`, `&#digits;` or `&#xhex;`, and what it stands for; undefined for any other `&`. */
function characterReference(text: string, start: number): { value: string; end: number } | undefined {
  CHARACTER_REFERENCE.lastIndex = start;
  const match = CHARACTER_REFERENCE.exec(text);
  if (!match) return undefined;
  const end = start + match[0].length;
  if (match[3] !== undefined) {
    const value = namedCharacterReference(match[3]);
    return value === undefined ? undefined : { value, end };
  }
  const point = Number.parseInt(match[1] ?? match[2], match[1] !== undefined ? 16 : 10);
  // The null character, a surrogate and a number past Unicode are the replacement character.
  const valid = point !== 0 && point <= 0x10ffff && (point < 0xd800 || point > 0xdfff);
  return { value: valid ? String.fromCodePoint(point) : "�", end };
}

/** A path percent-decoded, or as written when its encoding is malformed. */
function percentDecoded(path: string): string {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}
