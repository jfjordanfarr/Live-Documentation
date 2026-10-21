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
 * It does NOT aim to be a full CommonMark implementation.
 */

import { GitHubSlugger, slugText } from "@live-documentation/engine/tooling/githubSlugger";

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

    // Process block elements
    const lines = content.split("\n");
    const outputLines: string[] = [];
    const headings = new GitHubSlugger();
    let inList = false;
    let listType: "ul" | "ol" | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Keep fenced contents opaque: a heading, link or emphasis inside code is literal text,
        // and cannot reserve an anchor that belongs to a later real heading.
        const fence = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
        if (fence && !(fence[1][0] === "`" && fence[2].includes("`"))) {
            if (inList) {
                outputLines.push(listType === "ul" ? "</ul>" : "</ol>");
                inList = false;
                listType = null;
            }
            const closing = new RegExp(`^ {0,3}${fence[1][0]}{${fence[1].length},}[ \\t]*$`);
            const code: string[] = [];
            for (i += 1; i < lines.length && !closing.test(lines[i]); i += 1) code.push(lines[i]);
            const language = fence[2].trim().split(/\s+/)[0];
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
        const headingMatch = line.match(/^ {0,3}(#{1,6})[ \t]+(.*)$/);
        if (headingMatch) {
            if (inList) {
                outputLines.push(listType === "ul" ? "</ul>" : "</ol>");
                inList = false;
                listType = null;
            }
            const level = Math.min(headingMatch[1].length, maxHeadingLevel);
            const heading = headingMatch[2].replace(/[ \t]+#+[ \t]*$/, "").trim();
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
        const text = processInline(line, linkHandler);
        outputLines.push(`<p>${text}</p>`);
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
    if (/^[a-z][a-z0-9+.-]*:/iu.test(target) && !/^(?:https?|mailto):/iu.test(target)) return html;
    return `<a href="${escapeHtml(target)}" target="_blank" rel="noopener noreferrer">${html}</a>`;
}

/** A link's text: its code spans as code, the rest escaped and emphasized. */
function linkTextHtml(text: string): string {
    return text.split(/`([^`]+)`/g)
        .map((part, index) => (index % 2 === 1 ? `<code>${escapeHtml(part)}</code>` : emphasize(escapeHtml(part))))
        .join("");
}

/** Bold and italic; an underscore inside a word, as in snake_case, is a letter of it. */
function emphasize(html: string): string {
    return html
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/(?<![\p{L}\p{N}])__([^_]+)__(?![\p{L}\p{N}])/gu, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/(?<![\p{L}\p{N}])_([^_]+)_(?![\p{L}\p{N}])/gu, "<em>$1</em>");
}

/**
 * Process inline markdown elements. Each link and code span is finished first
 * and held aside behind a marker, so that nothing later reads inside it: a path in backticks
 * stays code, and emphasis never reaches an attribute or a code span. What is
 * left is text, escaped whole: a doc's raw HTML is shown as written and never
 * becomes part of the page, so reading a doc can neither run script nor fetch
 * anything.
 *
 * ORDERING IS CRITICAL:
 * 1. Links, so that [`code`](url) works; an image's syntax is read as a link to the image, which is never fetched
 * 2. Autolinks, <https://…> and <mailto:…>
 * 3. Inline code
 * 4. Auto-links for bare relative paths
 * 5. The rest escaped, then bold and italic
 */
function processInline(
    text: string,
    linkHandler?: (href: string, text: string) => string
): string {
    const held: string[] = [];
    const hold = (html: string): string => `${HELD}${held.push(html) - 1}${HELD}`;
    const link = (href: string, html: string): string => hold(linkHandler ? linkHandler(href, html) : defaultLink(href, html));

    text = text.replace(/\uE000/g, () => hold("&#xE000;"));
    text = text.replace(/!?\[([^\]]+)\]\(([^)]+)\)/g, (_match: string, linkText: string, href: string) => link(href, linkTextHtml(linkText)));
    text = text.replace(/<((?:https?|mailto):[^<>\s]+)>/giu, (_match: string, href: string) => link(href, escapeHtml(href)));
    text = text.replace(/`([^`]+)`/g, (_match: string, code: string) => hold(`<code>${escapeHtml(code)}</code>`));
    // e.g. ../packages/generator/src/generator.ts becomes a link
    text = text.replace(
        /(?<!["\w])(\.\.?\/?[\w\-./]+\.(?:ts|js|md|json|css|html))(?!["\w])/g,
        (_match: string, filePath: string) => link(filePath, escapeHtml(filePath))
    );

    // A piece may hold an earlier one, as a link's text holds a doc's own private-use character; never a later one.
    const restore = (html: string): string => html.replace(HELD_PIECE, (_match: string, index: string) => restore(held[Number(index)]));
    return restore(emphasize(escapeHtml(text)));
}
