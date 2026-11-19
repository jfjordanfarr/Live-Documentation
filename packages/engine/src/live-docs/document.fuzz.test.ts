/**
 * Hostile names through the real composer, writer and reader.
 *
 * Every value a doc takes from a source file — a symbol's name, a JSON key path,
 * a script's or a binary's name, a file's path, a module specifier, a line of a
 * docstring — is composed into a doc by `compose.ts`, written by
 * `renderLiveDoc`, put through UTF-8 as a file on disk would be, and read back
 * by `parseLiveDoc`. Three things must hold for every value: the reader gives
 * back exactly what was written, two different values never read back as one
 * and their anchors differ, and neither writing nor reading throws. A link
 * besides must lead where it was written to: the graph resolves it to the path
 * it was made from, and so does a browser, the WHATWG URL parser standing in
 * for a markdown viewer as the oracle no code of ours wrote.
 *
 * The values come from a seeded generator, so a run is the same every time and
 * a failure names the value that broke it.
 */

import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  composeCitedBy,
  composeDependencies,
  composeEntries,
  composeReExports,
  composeSymbolBlocks,
  computePublicSymbolHeadingInfo
} from "./compose";
import type { DeclaredBy, DependencyEntry, PublicSymbolEntry, ReExportedSymbolInfo, WorkspaceSymbolIndex } from "./coreTypes";
import { createSymbolSlug } from "./coreUtils";
import { DEFAULT_AUTHORED_BLOCK, parseLiveDoc, renderLiveDoc, symbolName, type LiveDoc } from "./document";
import { resolveDocLink } from "./graph";

// ============================================================================
// The generator of hostile values
// ============================================================================

/** The pieces names are made of, by the trouble each can make. */
const PIECES: Record<string, readonly string[]> = {
  letters: ["a", "B", "x", "Foo", "foo", "é", "ß", "ſ", "Ω", "名前"],
  digits: ["0", "1", "42"],
  delimiters: ["`", "``", "```", "\"", "\"\"", "\\", "\\n", "\\\"", "(", ")", "()", "(a)", "[", "]", "{", "}", "{#", "#", "<", ">", "|", "*", "_", "~", ",", ", ", ";", "; ", ":", ": ", "!", "$", "$$", "%", "%29", "&", "'", "/", "-", " — ", "](", "Promise<", "[]", "@", ".", "?", "%20", "#L1", "&amp;", "&#x26;"],
  spaces: [" ", "  ", "\t", "\u00a0", "\u200b", "\ufeff", "\u3000"],
  lineBreaks: ["\n", "\r", "\r\n", "\n\n", "\u2028", "\u2029", "\u0085", "\v", "\f"],
  controls: ["\u0000", "\u0001", "\u001b", "\u007f", "\u0080", "\u009f"],
  surrogates: ["\ud800", "\udbff", "\udc00", "\udfff", "\udc00\ud800", "😀", "\ud83d"],
  combining: ["\u0301", "\u0308", "\u20dd", "e\u0301"],
  // Lines a docstring may hold that a markdown viewer reads as blocks running past them, or as structure.
  blocks: ["\n<!--", "\n-->", "\n<script>", "\n</script>", "\n<pre>", "\n<style>", "\n<textarea>", "\n<![CDATA[", "\n]]>", "\n<?php", "\n?>", "\n<!DOCTYPE", "\n~~~", "\n````", "\n   ```", "\n[ref]: https://e.invalid", "\n---", "\n===", "\n> ", "\n- ", "\n    ", "<img src=x>", "[a](https://e.invalid)"],
  format: [
    "# ", "#### ", "##### ", "## Generated", "## Authored", "### Notes", "- Type: key", "- Entry: command ", " of ", "- Source: [source](",
    "<!-- LIVE-DOC:END Public Symbols -->", "<!-- LIVE-DOC:BEGIN Dependencies -->", "_No public symbols detected_", "_No dependencies documented yet_",
    " (key)", " (key overload 1)", " (symbol)", " (variant 1)", "{#symbol-x}", "```ts", "\\#### `x`", "- Re-exported from external module", "symbol-~24"
  ]
};
const CLASSES = Object.keys(PIECES);

/** The reviewer's names, and pairs chosen to read back as one, tried before any generated name. */
const CHOSEN: readonly string[] = [
  "a\nb", "a\r\nb", "a\rb", "a`b", "", "\"\"", "\ud800", "\udc00", "d`x", "x (key)", "x", "build (prod)", "a'b", "Foo", "foo",
  "\"a\\nb\"", "`a`", " ", "  ", "`", " a ", "a\u2028b", "a)b", "a(b", "(auth)", "a#b", "\"q", "#### `z`", "```", "\\```",
  "<!-- LIVE-DOC:END Public Symbols -->", "x (key overload 1)", "Metadata", "$", "$$", "\u0000", "\t",
  // Paths a repository holds and a link must still open: a document named `plan (draft).md` once stopped generation.
  "plan (draft)", "[id]", "a b ", "a?b", "a%20b", "%", "<a>", "名前 ", "a#L1", "a\\b", "Q&amp;A", "R&D", "\"q\""
];

/** The reviewer's 70,000-character key, and long runs of what each form has to spell out, tried together in one doc. */
const LONG: readonly string[] = ["k".repeat(70_000), "`".repeat(20_000), "\n".repeat(20_000), "\ud800".repeat(20_000), "(a)".repeat(5_000), " ".repeat(20_000)];

/** A deterministic generator: mulberry32. */
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(next: () => number, items: readonly T[]): T {
  return items[Math.floor(next() * items.length)];
}

/** A name of one to six pieces; one in a hundred is one piece repeated up to two thousand times. */
function hostileName(next: () => number): string {
  if (next() < 0.01) {
    return pick(next, PIECES[pick(next, CLASSES)]).repeat(1 + Math.floor(next() * 2_000)) || "a";
  }
  let name = "";
  for (let count = 1 + Math.floor(next() * 6); count > 0; count -= 1) {
    name += pick(next, PIECES[pick(next, CLASSES)]);
  }
  return name;
}

/** The value as one path segment: a file name cannot hold `/` or NUL, nor be `.` or `..`, and is read from disk as UTF-8, so a lone surrogate is U+FFFD. */
function segment(name: string): string {
  // Any first character, a quote, a space, a `#` or a dot included, and a lone surrogate kept, as a string can hold one.
  const cleaned = name.split("/").join("_").split(String.fromCharCode(0)).join("_");
  return cleaned === "" || cleaned === "." || cleaned === ".." ? `d${cleaned}` : cleaned;
}

// ============================================================================
// Writing a doc the way the generator does
// ============================================================================

const WORKSPACE = "/w";
const DOCS_ROOT = "/w/docs/layer-4";
const EXTENSION = ".mdmd.md";

/** What a source file hands the composer: its path, symbols, manifests that name it, dependencies, re-exports and citing documents. */
interface Handed {
  codePath: string;
  symbols: PublicSymbolEntry[];
  program?: string;
  declaredBy: DeclaredBy[];
  dependencies: DependencyEntry[];
  reExports: ReExportedSymbolInfo[];
  citedBy: string[];
  symbolIndex: WorkspaceSymbolIndex;
}

/** The doc the generator would write for what was handed, through the real composer. */
function compose(handed: Handed): LiveDoc {
  const docAbsolute = path.join(DOCS_ROOT, `${handed.codePath}${EXTENSION}`);
  const docDir = path.dirname(docAbsolute);
  const analysis = { symbols: handed.symbols, dependencies: handed.dependencies, reExportedSymbols: handed.reExports, ...(handed.program !== undefined ? { program: { symbol: handed.program } } : {}) };
  const headings = computePublicSymbolHeadingInfo(handed.symbols);
  const citedBy = composeCitedBy({ documents: handed.citedBy, docDir, workspaceRoot: WORKSPACE });
  const reExports = composeReExports({ reExports: handed.reExports, headings, docDir, liveDocsRootAbsolute: DOCS_ROOT, docExtension: EXTENSION });
  return {
    codePath: handed.codePath,
    layer: 4,
    archetype: "implementation",
    entries: composeEntries({ analysis, sourceRelativePath: handed.codePath, headings, declaredBy: handed.declaredBy, config: { entryPoints: [] }, docDir, liveDocsRootAbsolute: DOCS_ROOT, docExtension: EXTENSION }),
    generatedAt: "2026-11-19T00:00:00.000Z",
    authored: DEFAULT_AUTHORED_BLOCK,
    symbols: composeSymbolBlocks({ headings, docDir, sourceAbsolute: path.join(WORKSPACE, handed.codePath), sourceRelativePath: handed.codePath, symbolIndex: handed.symbolIndex, liveDocsRootAbsolute: DOCS_ROOT, dependencies: handed.dependencies }),
    dependencies: composeDependencies({ analysis, docDir, liveDocsRootAbsolute: DOCS_ROOT, docExtension: EXTENSION, headings, symbolIndex: handed.symbolIndex }),
    ...(citedBy.length > 0 ? { citedBy } : {}),
    ...(reExports.length > 0 ? { reExports } : {})
  };
}

/** Everything one name can be handed as, in one doc: every place a doc carries a name, a path or free text from a source file. */
function everywhere(name: string): Handed {
  const folder = segment(name);
  const typeHome = `${folder}/types.ts`;
  const symbolIndex: WorkspaceSymbolIndex = new Map([[name, [{ liveDocPath: `docs/layer-4/${typeHome}${EXTENSION}`, sourcePath: typeHome, anchor: createSymbolSlug(name), kind: "type" }]]]);
  return {
    // Half the docs stand at the workspace root, so that their links begin with neither `./` nor `../` where a name begins with a dot.
    codePath: name.length % 2 === 0 ? `${folder}.ts` : `src/${folder}.ts`,
    symbols: [
      {
        name,
        kind: "function",
        location: { line: 1, character: 1 },
        typeReferences: [
          { name, role: "parameter", parameterName: name },
          { name, role: "return", isArrayElement: true, isPromiseResolution: true },
          { name: `${name}2`, role: "extends" }
        ],
        documentation: {
          summary: name,
          remarks: `before\n${name}\nafter`,
          // Every place the format puts a docstring's text: at the top level, and inside the list items it writes.
          parameters: [{ name, description: name }],
          typeParameters: [{ name, description: `${name}\n${name}` }],
          returns: `${name}\n\n${name}`,
          value: name,
          exceptions: [{ type: name, description: name }],
          examples: [{ description: name, code: name, language: "ts" }],
          links: [{ kind: "cref", target: name, text: name }, { kind: "href", target: name }, { kind: "unknown", target: name }],
          rawFragments: [name],
          unsupportedTags: [name]
        }
      },
      { name: `GET ${name}`, kind: "route" }
    ],
    program: name,
    declaredBy: [
      { declarer: `${folder}/package.json`, reason: "command", name },
      { declarer: `${folder}/package.json`, reason: "module" }
    ],
    dependencies: [
      { specifier: name, symbols: [name, "b"], kind: "import" },
      { specifier: `./${folder}/m`, resolvedPath: `${folder}/m.ts`, symbols: [name], kind: "import", isTypeOnly: true },
      { specifier: `./${folder}/n`, resolvedPath: `${folder}/n.ts`, symbols: [], kind: "export" }
    ],
    reExports: [
      { name, kind: "const", sourceModulePath: `${folder}/r.ts` },
      { name: `${name}!`, kind: "const" }
    ],
    citedBy: [`${folder}/README.md`],
    symbolIndex
  };
}

/** Many names in one doc, each as a symbol, a command, a dependency and a re-export, so that any two that read back as one are seen. */
function together(names: readonly string[]): Handed {
  return {
    codePath: "src/many.json",
    symbols: names.map((name, index) => ({ name, kind: index % 5 === 0 ? "const" : "key" })),
    declaredBy: names.map((name) => ({ declarer: "package.json", reason: "command" as const, name })),
    dependencies: names.map((name) => ({ specifier: name, symbols: [name], kind: "import" as const })),
    // Each name is re-exported too, as a barrel's `export *` would, so that two re-exports one anchor would name are seen.
    reExports: names.map((name) => ({ name, kind: "const" })),
    citedBy: [],
    symbolIndex: new Map()
  };
}

// ============================================================================
// The three properties
// ============================================================================

// ============================================================================
// What a markdown viewer sees: the CommonMark reference implementation as the oracle
// ============================================================================

interface MarkdownNode {
  type: string;
  level: number;
  destination: string | null;
  literal: string | null;
  sourcepos: [[number, number], [number, number]];
  parent: MarkdownNode | null;
  walker(): { next(): { entering: boolean; node: MarkdownNode } | null };
}
const { Parser } = createRequire(import.meta.url)("commonmark") as { Parser: new () => { parse(text: string): MarkdownNode } };

/** The one-based line ranges of a doc's docstring bodies, laid out as the writer lays a doc's symbols out. */
function bodyRanges(doc: LiveDoc, lines: readonly string[]): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  let at = lines.indexOf("### Public Symbols") + 2;
  doc.symbols.forEach((symbol, index) => {
    at += (index > 0 ? 1 : 0) + 2 + (symbol.source ? 1 : 0) + symbol.references.length;
    for (const section of symbol.sections) {
      at += 2;
      const length = section.body.flatMap((line) => line.split("\n")).length;
      ranges.push([at, at + length - 1]);
      at += length;
    }
  });
  return ranges;
}

/** A link as a browser takes it, percent-decoding undone where it is well-formed. */
function asOpened(link: string): string {
  try {
    return decodeURIComponent(link);
  } catch {
    return link;
  }
}

/**
 * Holds a written doc to what a markdown viewer sees, by the reference parser: every heading and every generated link
 * the doc holds is found at its place and as itself; outside a docstring nothing is a heading, a link, an image or raw
 * HTML the doc does not hold; and no block a docstring opens runs past it. Inside a docstring anything may render.
 */
function viewerSees(doc: LiveDoc, text: string): string | undefined {
  // The very long names alone make docs of megabytes, which the reference parser takes seconds over: those docs are held
  // to our reader only.
  if (text.length > 200_000) return undefined;
  const lines = text.split("\n");
  const bodies = bodyRanges(doc, lines);
  const inBody = (line: number): [number, number] | undefined => bodies.find(([start, end]) => line >= start && line <= end);
  const expectedHeadings = lines.flatMap((line, index) => (inBody(index + 1) === undefined && /^#{1,6} /u.test(line) ? [`${index + 1}:${/^#+/u.exec(line)![0].length}`] : []));
  const expectedLinks = [
    ...doc.entries.flatMap((entry) => [entry.symbol?.link, entry.declarer?.link]),
    ...doc.symbols.flatMap((symbol) => [
      symbol.source ? `${symbol.source.path}#L${symbol.source.line}` : undefined,
      ...symbol.references.flatMap((reference) => (reference.role === "Parameters" ? reference.parameters.flatMap((parameter) => parameter.types) : reference.types).map((type) => type.link))
    ]),
    ...doc.dependencies.map((dependency) => dependency.link),
    ...(doc.citedBy ?? []).map((entry) => entry.link),
    ...(doc.reExports ?? []).map((entry) => entry.from?.link)
  ].filter((link): link is string => link !== undefined && !/\p{Cs}/u.test(link)).map(asOpened);
  const headings: string[] = [];
  const links: string[] = [];
  const document = new Parser().parse(text);
  const walker = document.walker();
  for (let event = walker.next(); event; event = walker.next()) {
    const node = event.node;
    if (!event.entering) continue;
    // An inline node has no place of its own; it stands on its block's first line.
    let block: MarkdownNode | null = node;
    while (block !== null && !block.sourcepos) block = block.parent;
    if (block === null) continue;
    const line = block.sourcepos[0][0];
    const body = inBody(line);
    // A block may end on the blank line after the body; it may not hold a line of what follows.
    if (node.parent === document && node.sourcepos && body !== undefined && lines.slice(body[1], node.sourcepos[1][0]).some((next) => next.trim() !== "")) {
      return `a ${node.type} the docstring at line ${line} opens runs on to line ${node.sourcepos[1][0]}`;
    }
    if (body !== undefined) continue;
    if (node.type === "heading") headings.push(`${line}:${node.level}`);
    // A link written as a JSON string, deliberately, for a path no URL can hold, is no link a viewer follows.
    if (node.type === "link" && !asOpened(node.destination ?? "").startsWith("\"")) links.push(asOpened(node.destination ?? ""));
    if (node.type === "image") return `an image at line ${line}`;
    if (node.type === "html_inline" || (node.type === "html_block" && !(node.literal ?? "").startsWith("<!-- LIVE-DOC:"))) return `raw HTML at line ${line}: ${JSON.stringify(node.literal)}`;
  }
  if (JSON.stringify(headings) !== JSON.stringify(expectedHeadings)) return `the viewer's headings ${headings.join(" ")} are not the doc's ${expectedHeadings.join(" ")}`;
  if (JSON.stringify(links) !== JSON.stringify(expectedLinks)) return `the viewer's links ${JSON.stringify(links)} are not the doc's ${JSON.stringify(expectedLinks)}`;
  return undefined;
}

/** Writes the doc, puts it through UTF-8 as a file on disk would, and reads it back; fails naming the value. */
function writeAndRead(doc: LiveDoc, name: string): { text: string; read: LiveDoc } {
  const fail = (what: string, error?: unknown): never => {
    throw new Error(`${what} for the name ${JSON.stringify(name)}${error instanceof Error ? `: ${error.message}` : ""}`);
  };
  let text = "";
  try {
    text = renderLiveDoc(doc);
  } catch (error) {
    fail("writing threw", error);
  }
  const onDisk = Buffer.from(text, "utf8").toString("utf8");
  if (onDisk !== text) {
    fail("the doc does not survive UTF-8 on disk");
  }
  // Git shows and diffs it as text, and no renderer breaks a line in the middle of a name: no line holds a control
  // character but a tab, nor a line or paragraph separator; a quoted value spells such a character out.
  const unwritten = Array.from(text).find((character) => {
    const code = character.codePointAt(0)!;
    return (code < 0x20 && code !== 0x09 && code !== 0x0a) || code === 0x2028 || code === 0x2029;
  });
  if (unwritten !== undefined) {
    fail(`the doc holds the character U+${unwritten.codePointAt(0)!.toString(16).padStart(4, "0").toUpperCase()} as it is`);
  }
  let read: LiveDoc | undefined;
  try {
    read = parseLiveDoc(onDisk);
  } catch (error) {
    fail("reading threw", error);
  }
  try {
    expect(read).toEqual(doc);
    expect(renderLiveDoc(read!)).toBe(text);
  } catch (error) {
    fail("the doc does not read back as written", error);
  }
  const seen = viewerSees(doc, text);
  if (seen !== undefined) {
    fail(`a markdown viewer sees otherwise: ${seen}`);
  }
  // As Git for Windows checks it out, every line ending CRLF, and as Windows PowerShell writes it, a byte-order mark first.
  try {
    expect(parseLiveDoc(onDisk.split("\n").join("\r\n"))).toEqual(doc);
    expect(parseLiveDoc(`\ufeff${onDisk.split("\n").join("\r\n")}`)).toEqual(doc);
    expect(parseLiveDoc(onDisk.split("\n").join("\r"))).toEqual(doc);
  } catch (error) {
    fail("the doc with CRLF line endings or a byte-order mark does not read back as written", error);
  }
  return { text, read: read! };
}

/** Each name in every place a doc carries one: written, read back exactly, nothing thrown. */
function checkEverywhere(name: string): void {
  const handed = everywhere(name);
  const { text, read } = writeAndRead(compose(handed), name);
  const folder = segment(name);
  const fail = (what: string): never => {
    throw new Error(`${what} for the name ${JSON.stringify(name)}`);
  };
  // Every link leads to the path it was made from, as the graph reads it and as a browser does.
  const docPath = `docs/layer-4/${handed.codePath}${EXTENSION}`;
  const leadsTo = (link: string | undefined, target: string, what: string): void => {
    if (link !== undefined && /\p{Cs}/u.test(link)) {
      // No URL can hold a lone surrogate: the link is written as a JSON string, deliberately, and still leads there.
      if (text.includes(`(${link}`) || resolveDocLink(docPath, link) !== target) fail(`the ${what} link with a lone surrogate is not quoted or leads elsewhere`);
      return;
    }
    if (link === undefined || !text.includes(`(${link}`)) fail(`the ${what} link is not written as a markdown link's target`);
    if (Array.from(link!).some((character) => character <= " " || character === "\u007f" || "()<>".includes(character))) fail(`the ${what} link ${JSON.stringify(link)} holds what a markdown link's target cannot`);
    const resolved = resolveDocLink(docPath, link!);
    if (resolved !== target) fail(`the ${what} link resolves to ${JSON.stringify(resolved)}, not ${JSON.stringify(target)}`);
    if (/\p{Cs}/u.test(docPath)) return;
    const base = `https://viewer.test/${docPath.split("/").map(encodeURIComponent).join("/")}`;
    const opened = decodeURIComponent(new URL(link!, base).pathname);
    if (opened !== `/${target}`) fail(`a browser opens the ${what} link at ${JSON.stringify(opened)}, not ${JSON.stringify(`/${target}`)}`);
  };
  leadsTo(read.citedBy?.[0]?.link, `${folder}/README.md`, "citing document's");
  leadsTo(read.entries.find((entry) => entry.reason === "command")?.declarer?.link, `docs/layer-4/${folder}/package.json${EXTENSION}`, "manifest's");
  leadsTo(read.dependencies.find((dependency) => dependency.label.endsWith(name) && dependency.link)?.link, `docs/layer-4/${folder}/m.ts${EXTENSION}`, "dependency's");
  leadsTo(read.reExports?.find((entry) => entry.from)?.from?.link, `docs/layer-4/${folder}/r.ts${EXTENSION}`, "re-export's");
  leadsTo(read.symbols[0].source?.path, handed.codePath, "source's");
  if (read.codePath !== handed.codePath) fail("the code path reads back otherwise");
  if (symbolName(read.symbols[0]) !== name) fail(`the symbol reads back as ${JSON.stringify(symbolName(read.symbols[0]))}`);
  const command = read.entries.find((entry) => entry.reason === "command");
  if (command?.command !== name || command.declarer?.label !== `${folder}/package.json`) fail("the command entry reads back otherwise");
  if (read.entries.find((entry) => entry.reason === "module")?.declarer?.label !== `${folder}/package.json`) fail("the module entry reads back otherwise");
  if (read.entries.find((entry) => entry.reason === "program")?.symbol?.name !== name) fail("the program entry reads back otherwise");
  const external = read.dependencies.find((dependency) => dependency.link === undefined);
  if (external?.label !== name || external.symbols?.[external.symbols.indexOf(name)] !== name) fail("the external dependency reads back otherwise");
  if (read.reExports?.[0]?.name !== name && read.reExports?.[1]?.name !== name) fail("the re-export reads back otherwise");
  // The name and the name with `!` give one anchor by their names; the doc tells them apart.
  const anchors = [...read.symbols.map((symbol) => symbol.slug), ...(read.reExports ?? []).map((entry) => entry.slug)];
  if (new Set(anchors).size !== anchors.length) fail(`two of the symbols and re-exports share an anchor: ${JSON.stringify(anchors)}`);
  if (read.citedBy?.[0]?.label !== `${folder}/README.md`) fail("the citing document reads back otherwise");
  const parameters = read.symbols[0].references.find((reference) => reference.role === "Parameters");
  if (parameters?.role !== "Parameters" || parameters.parameters[0].name !== name || parameters.parameters[0].types[0].name !== name) fail("the parameter reads back otherwise");
}

/** Many names in one doc: each reads back as itself, so no two as one, and no two anchors are the same. */
function checkTogether(names: readonly string[]): void {
  const label = names.map((name) => JSON.stringify(name)).join(", ");
  const { read } = writeAndRead(compose(together(names)), label);
  const symbols = read.symbols.map(symbolName);
  const commands = read.entries.flatMap((entry) => (entry.command === undefined ? [] : [entry.command]));
  const specifiers = read.dependencies.map((dependency) => dependency.label);
  const sorted = [...names].sort();
  if (JSON.stringify([...symbols].sort()) !== JSON.stringify(sorted)) {
    throw new Error(`the symbols ${label} read back as ${symbols.map((name) => JSON.stringify(name)).join(", ")}`);
  }
  if (JSON.stringify([...commands].sort()) !== JSON.stringify(sorted)) {
    throw new Error(`the commands ${label} read back as ${commands.map((name) => JSON.stringify(name)).join(", ")}`);
  }
  if (JSON.stringify([...specifiers].sort()) !== JSON.stringify([...new Set(names)].sort())) {
    throw new Error(`the specifiers ${label} read back as ${specifiers.map((name) => JSON.stringify(name)).join(", ")}`);
  }
  const reExported = (read.reExports ?? []).map((entry) => entry.name);
  if (JSON.stringify([...reExported].sort()) !== JSON.stringify(sorted)) {
    throw new Error(`the re-exports ${label} read back as ${reExported.map((name) => JSON.stringify(name)).join(", ")}`);
  }
  // One doc's anchors are one namespace: no two apart among its public symbols and its re-exports together, as a
  // barrel re-exporting `Foo` and `foo`, or declaring `foo` and re-exporting `Foo`, needs.
  const anchors = [...read.symbols.map((symbol) => symbol.slug ?? ""), ...(read.reExports ?? []).map((entry) => entry.slug ?? "")];
  const repeated = anchors.find((anchor, index) => anchors.indexOf(anchor) !== index);
  if (repeated !== undefined) {
    throw new Error(`two of the symbols and re-exports ${label} share the anchor ${JSON.stringify(repeated)}`);
  }
}

describe("hostile names through the composer, the writer and the reader", () => {
  it("reads back every chosen name exactly, in every place a doc carries one", () => {
    for (const name of CHOSEN) {
      checkEverywhere(name);
    }
  });

  it("reads back the chosen names, and very long ones, as themselves when they share one doc", () => {
    // Distinct names only: a name handed twice is the adapter's doing and is told apart by its heading's suffix.
    checkTogether([...new Set(CHOSEN)]);
    checkTogether(LONG);
  });

  it("reads back 200 generated names exactly, in every place a doc carries one", () => {
    const next = random(20261119);
    for (let index = 0; index < 200; index += 1) {
      checkEverywhere(hostileName(next));
    }
  });

  it("reads back 80 generated docs of twelve names each, every name as itself and every anchor apart", () => {
    const next = random(1119);
    for (let index = 0; index < 80; index += 1) {
      const names = new Set<string>();
      while (names.size < 12) {
        const name = hostileName(next);
        names.add(name);
        // Its near twins: another case, the same with a suffix-like tail, and its quoted spelling.
        const twin = pick(next, [name.toUpperCase(), `${name} (key)`, JSON.stringify(name), `\`${name}\``, name.replace(/\n/gu, "\\n")]);
        names.add(twin);
      }
      checkTogether([...names].slice(0, 12));
    }
  });
});
