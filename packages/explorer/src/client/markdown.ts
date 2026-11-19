/**
 * @file markdown.ts
 * @description Lightweight markdown renderer for the Live Docs Explorer detail panel.
 * 
 * This is a minimal renderer designed for Live Documentation markdown files.
 * It handles the most common patterns found in Live Docs:
 * - Headings (## and ###)
 * - Code blocks (``` and inline `)
 * - Links (both markdown and relative paths)
 * - Lists (bulleted and numbered)
 * - Bold and italic text
 * - Horizontal rules
 *
 * Raw HTML is shown as text, never interpreted, and an image's syntax is a
 * link to the image: a doc can neither run script nor make the page fetch.
 * It does NOT aim to be a full CommonMark implementation; but where a link
 * begins and ends, and what claims characters before it (code spans, escapes,
 * character references, raw HTML), is read by CommonMark's rule, the one the
 * engine counts a doc's links by, so a link the map counts opens here.
 */

import { GitHubSlugger, slugText } from "@live-documentation/engine/tooling/githubSlugger";
import { inlineTokens, leadingDefinitions, readMarkdownLinks, type InlineToken, type LinkDefinitions } from "@live-documentation/engine/tooling/markdownLinks";

import { escapeHtml } from "./graph-helpers";

/**
 * Render markdown to HTML.
 * 
 * @param markdown - The markdown content to render
 * @param options - Rendering options
 * @returns HTML string
 */
export function renderMarkdown(
    markdown: string,
    options: RenderMarkdownOptions = {}
): string {
    const {
        linkHandler,
        maxHeadingLevel = 6,
    } = options;

    // Normalize line endings
    const content = markdown.replace(/\r\n?/g, "\n");
    // A reference link takes its destination from the document's definitions, which a caller rendering a document in
    // parts passes whole; by default, those of the markdown rendered.
    const definitions = options.definitions ?? readMarkdownLinks(content).definitions;
    const processInline = (text: string, handler?: (href: string, text: string) => string): string => inlineHtml(text, definitions, handler);

    // Process block elements
    const lines = content.split("\n");
    const outputLines: string[] = [];
    const headings = options.slugger ?? new GitHubSlugger();
    let inList = false;
    let listType: "ul" | "ol" | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Keep fenced contents opaque: a heading, link or emphasis inside code is literal text,
        // and cannot reserve an anchor that belongs to a later real heading.
        const closing = fenceClosing(line);
        if (closing) {
            if (inList) {
                outputLines.push(listType === "ul" ? "</ul>" : "</ol>");
                inList = false;
                listType = null;
            }
            const code: string[] = [];
            for (i += 1; i < lines.length && !closing.test(lines[i]); i += 1) code.push(lines[i]);
            const language = line.replace(/^ {0,3}(`{3,}|~{3,})/, "").trim().split(/\s+/)[0];
            const langClass = language ? ` class="language-${escapeHtml(language)}"` : "";
            outputLines.push(`<pre><code${langClass}>${escapeHtml(code.join("\n"))}</code></pre>`);
            continue;
        }

        // Horizontal rule
        if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
            if (inList) {
                outputLines.push(listType === "ul" ? "</ul>" : "</ol>");
                inList = false;
                listType = null;
            }
            outputLines.push("<hr>");
            continue;
        }

        // Headings
        const headingLine = headingOf(line);
        if (headingLine) {
            if (inList) {
                outputLines.push(listType === "ul" ? "</ul>" : "</ol>");
                inList = false;
                listType = null;
            }
            const level = Math.min(headingLine.level, maxHeadingLevel);
            const heading = headingLine.text;
            const text = processInline(heading, linkHandler);
            const id = headings.slug(slugText(heading));
            outputLines.push(`<h${level} id="${escapeHtml(id)}">${text}</h${level}>`);
            continue;
        }

        // Unordered list items
        const ulMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
        if (ulMatch) {
            if (!inList || listType !== "ul") {
                if (inList) outputLines.push(listType === "ul" ? "</ul>" : "</ol>");
                outputLines.push("<ul>");
                inList = true;
                listType = "ul";
            }
            const text = processInline(ulMatch[2], linkHandler);
            outputLines.push(`<li>${text}</li>`);
            continue;
        }

        // Ordered list items
        const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
        if (olMatch) {
            if (!inList || listType !== "ol") {
                if (inList) outputLines.push(listType === "ul" ? "</ul>" : "</ol>");
                outputLines.push("<ol>");
                inList = true;
                listType = "ol";
            }
            const text = processInline(olMatch[2], linkHandler);
            outputLines.push(`<li>${text}</li>`);
            continue;
        }

        // Empty line ends list
        if (line.trim() === "") {
            if (inList) {
                outputLines.push(listType === "ul" ? "</ul>" : "</ol>");
                inList = false;
                listType = null;
            }
            // Don't add empty paragraphs
            continue;
        }

        // Paragraph
        if (inList) {
            outputLines.push(listType === "ul" ? "</ul>" : "</ol>");
            inList = false;
            listType = null;
        }
        const paragraph = [line.trim()];
        while (i + 1 < lines.length) {
            const next = lines[i + 1];
            if (!next.trim() || headingOf(next) || fenceClosing(next)
                || /^\s*(?:[-*+]\s+|\d+\.\s+|---+\s*$|\*\*\*+\s*$)/u.test(next)) break;
            paragraph.push(next.trim());
            i += 1;
        }
        // Link reference definitions at a paragraph's start are read, not shown; each ends its own line.
        const raw = paragraph.join("\n");
        const rest = raw.slice(leadingDefinitions(raw)).replace(/\n/g, " ").trim();
        if (rest) outputLines.push(`<p>${processInline(rest, linkHandler)}</p>`);
    }

    // Close any open list
    if (inList) {
        outputLines.push(listType === "ul" ? "</ul>" : "</ol>");
    }

    return outputLines.join("\n");
}

/** Options for the lightweight markdown-to-HTML renderer. */
export interface RenderMarkdownOptions {
    /**
     * Custom handler for links. Receives the href and link text,
     * returns the HTML for the link element.
     */
    linkHandler?: (href: string, text: string) => string;

    /**
     * Maximum heading level to render (default: 6).
     * Headings deeper than this will be clamped.
     */
    maxHeadingLevel?: number;

    /**
     * The slugger that names the headings, shared when one document is rendered in parts, so that every heading
     * keeps the id it has when the whole is rendered at once; a fresh one by default.
     */
    slugger?: GitHubSlugger;

    /**
     * The link reference definitions a reference link takes its destination from: a whole document's, when it is
     * rendered in parts, so that a reference opens wherever its definition stands; by default, the markdown's own.
     */
    definitions?: LinkDefinitions;
}

/**
 * The line that closes the fence a line opens, or null when the line opens none. A backtick fence whose info string
 * holds a backtick is not one. Any reader that splits a document must agree with the renderer on what is fenced.
 */
export function fenceClosing(line: string): RegExp | null {
    const fence = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!fence || (fence[1][0] === "`" && fence[2].includes("`"))) return null;
    return new RegExp(`^ {0,3}${fence[1][0]}{${fence[1].length},}[ \\t]*$`);
}

/** A heading line's level and its text without closing hashes, or null when the line is not a heading. */
export function headingOf(line: string): { level: number; text: string } | null {
    const match = line.match(/^ {0,3}(#{1,6})[ \t]+(.*)$/);
    return match ? { level: match[1].length, text: match[2].replace(/[ \t]+#+[ \t]*$/, "").trim() } : null;
}

/**
 * What marks a held piece of finished HTML in the text: a private-use character. One a doc writes is held first as
 * its own character reference, so the doc keeps it and no doc can forge a marker.
 */
const HELD = "\uE000";
const HELD_PIECE = /\uE000(\d+)\uE000/g;

/** A link the default handler writes: to the web, mail or a relative path; any other scheme, `javascript:` among them, stays text. */
function defaultLink(href: string, html: string): string {
    const target = href.trim();
    // As a browser reads the scheme: tabs and line breaks anywhere, and controls and spaces in front, are dropped.
    // eslint-disable-next-line no-control-regex -- the control characters are what a browser drops from an address
    const scheme = target.replace(/[\t\n\r]/gu, "").replace(/^[\x00-\x20]+/u, "");
    if (/^[a-z][a-z0-9+.-]*:/iu.test(scheme) && !/^(?:https?|mailto):/iu.test(scheme)) return html;
    return `<a href="${escapeHtml(target)}" target="_blank" rel="noopener noreferrer">${html}</a>`;
}

/** Bold and italic; an underscore inside a word, as in snake_case, is a letter of it. */
function emphasize(html: string): string {
    return html
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/(?<![\p{L}\p{N}])__([^_]+)__(?![\p{L}\p{N}])/gu, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/(?<![\p{L}\p{N}])_([^_]+)_(?![\p{L}\p{N}])/gu, "<em>$1</em>");
}

/** How many tokens the renderer has walked since it was loaded, for the test that holds its work linear in the text. */
export const renderingSteps = { count: 0 };

/** Finished HTML for text, with a doc's own private-use character as its reference, so that it marks nothing. */
function textHtml(text: string): string {
    return escapeHtml(text).replace(//g, "&#xE000;");
}

/**
 * Process inline markdown elements. What claims characters is read by CommonMark's rule, the one the engine
 * counts links by (`tooling/markdownLinks.ts`): links and images, autolinks, code spans, backslash escapes,
 * character references and raw HTML. Each is finished first and held aside behind a marker, so that nothing
 * later reads inside it: a path in backticks stays code, an escaped `*` or `#` is the character itself, and
 * emphasis never reaches an attribute or a code span. A doc's raw HTML is shown as written and never becomes part
 * of the page, so reading a doc can neither run script nor fetch anything; an image's syntax is a link to the
 * image, which is never fetched. Then bare relative paths in what is left become links, and the rest is text,
 * escaped whole, then emphasized.
 */
function inlineHtml(
    text: string,
    definitions: LinkDefinitions,
    linkHandler?: (href: string, text: string) => string
): string {
    const held: string[] = [];
    const hold = (html: string): string => `${HELD}${held.push(html) - 1}${HELD}`;
    // A destination may hold the marker's character, written or as a character reference; as a URL it is that
    // character's percent-encoding, so that no doc can forge a piece through an address.
    const link = (href: string, html: string): string => {
        const address = href.replace(//g, "%EE%80%80");
        return hold(linkHandler ? linkHandler(address, html) : defaultLink(address, html));
    };
    const tokens = inlineTokens(text, definitions);

    /** The text between two offsets, with what it holds held; inside a link, a link or image is its text alone. */
    const render = (from: number, to: number, inLink: boolean): string => {
        let out = "";
        let at = from;
        // Tokens are in the order they begin: start at the first one in the range, so that rendering each link's
        // text does not walk every token of the paragraph again.
        let low = 0;
        for (let high = tokens.length; low < high;) {
            const middle = (low + high) >> 1;
            if (tokens[middle].start < from) low = middle + 1;
            else high = middle;
        }
        for (let index = low; index < tokens.length && tokens[index].start < to; index += 1) {
            const token = tokens[index];
            renderingSteps.count += 1;
            // A token inside one already rendered is part of it.
            if (token.start < at || token.end > to) continue;
            out += plain(at, token.start) + piece(token, inLink);
            at = token.end;
        }
        return out + plain(at, to);
    };
    const plain = (from: number, to: number): string => text.slice(from, to).replace(//g, () => hold("&#xE000;"));
    const piece = (token: InlineToken, inLink: boolean): string => {
        switch (token.kind) {
            case "code":
                return hold(`<code>${textHtml(token.text)}</code>`);
            case "escape":
            case "reference-character":
            case "html":
                return hold(textHtml(token.text));
            case "autolink":
                return inLink || !/^(?:https?|mailto):/iu.test(token.destination)
                    ? hold(textHtml(text.slice(token.start, token.end)))
                    : link(token.destination, textHtml(text.slice(token.textStart, token.textEnd)));
            default: {
                const inner = render(token.textStart, token.textEnd, true);
                return inLink ? inner : link(token.destination, emphasize(escapeHtml(inner)));
            }
        }
    };

    // e.g. ../packages/generator/src/generator.ts becomes a link
    const rest = render(0, text.length, false).replace(
        /(?<!["\w])(\.\.?\/?[\w\-./]+\.(?:ts|js|md|json|css|html))(?!["\w])/g,
        (_match: string, filePath: string) => link(filePath, escapeHtml(filePath))
    );

    // A piece may hold an earlier one, as a link's text holds a doc's own private-use character; never a later one.
    const restore = (html: string): string => html.replace(HELD_PIECE, (_match: string, index: string) => restore(held[Number(index)]));
    return restore(emphasize(escapeHtml(rest)));
}
