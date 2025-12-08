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
 * It does NOT aim to be a full CommonMark implementation.
 */

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
    let content = markdown.replace(/\r\n?/g, "\n");

    // Process code blocks first (to prevent other processing inside them)
    content = processCodeBlocks(content);

    // Process block elements
    const lines = content.split("\n");
    const outputLines: string[] = [];
    let inList = false;
    let listType: "ul" | "ol" | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

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
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            if (inList) {
                outputLines.push(listType === "ul" ? "</ul>" : "</ol>");
                inList = false;
                listType = null;
            }
            const level = Math.min(headingMatch[1].length, maxHeadingLevel);
            const text = processInline(headingMatch[2], linkHandler);
            const id = slugify(headingMatch[2]);
            outputLines.push(`<h${level} id="${id}">${text}</h${level}>`);
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
 * Process fenced code blocks and replace with HTML.
 */
function processCodeBlocks(content: string): string {
    // Fenced code blocks (```language ... ```)
    content = content.replace(
        /```(\w*)\n([\s\S]*?)```/g,
        (_match: string, lang: string, code: string) => {
            const langClass = lang ? ` class="language-${escapeHtml(lang)}"` : "";
            return `<pre><code${langClass}>${escapeHtml(code.trim())}</code></pre>`;
        }
    );
    return content;
}

/**
 * Process inline markdown elements (bold, italic, code, links).
 * 
 * ORDERING IS CRITICAL:
 * 1. Links first - so [`code`](url) patterns work (backticks inside link text)
 * 2. Auto-links for bare paths
 * 3. Then inline code (backticks)
 * 4. Then bold/italic
 */
function processInline(
    text: string,
    linkHandler?: (href: string, text: string) => string
): string {
    // Links [text](url) - MUST be first so [`code`](url) works
    // Use a placeholder to protect already-processed links from further processing
    const linkPlaceholders: string[] = [];
    text = text.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        (_match: string, linkText: string, href: string) => {
            // Process the link text for inline code (backticks)
            const processedLinkText = linkText.replace(/`([^`]+)`/g, (_m: string, code: string) => {
                return `<code>${escapeHtml(code)}</code>`;
            });
            
            let link: string;
            if (linkHandler) {
                link = linkHandler(href, processedLinkText);
            } else {
                link = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${processedLinkText}</a>`;
            }
            // Store the link and return a placeholder
            const placeholder = `\x00LINK${linkPlaceholders.length}\x00`;
            linkPlaceholders.push(link);
            return placeholder;
        }
    );

    // Auto-link bare relative paths that look like file references
    // e.g., ../packages/server/src/main.ts → clickable link
    // Skip paths already in quotes or parentheses (likely in HTML attributes)
    text = text.replace(
        /(?<!["\w])(\.\.?\/?[\w\-./]+\.(?:ts|js|md|json|css|html))(?!["\w])/g,
        (_match: string, filePath: string) => {
            if (linkHandler) {
                return linkHandler(filePath, filePath);
            }
            return `<a href="${escapeHtml(filePath)}" target="_blank" rel="noopener">${escapeHtml(filePath)}</a>`;
        }
    );

    // Restore link placeholders
    for (let i = 0; i < linkPlaceholders.length; i++) {
        text = text.replace(`\x00LINK${i}\x00`, linkPlaceholders[i]);
    }

    // Inline code (after links, so remaining backticks outside links get processed)
    text = text.replace(/`([^`]+)`/g, (_match: string, code: string) => {
        return `<code>${escapeHtml(code)}</code>`;
    });

    // Bold (**text** or __text__)
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");

    // Italic (*text* or _text_)
    text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    text = text.replace(/_([^_]+)_/g, "<em>$1</em>");

    return text;
}

/**
 * Generate a URL-safe slug from text.
 */
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
