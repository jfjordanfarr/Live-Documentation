import { describe, expect, it, vi } from "vitest";

import { renderMarkdown } from "./markdown";

const headingIds = (html: string): string[] => [...html.matchAll(/<h[1-6] id="([^"]*)">/g)].map(match => match[1]);

describe("reader heading anchors", () => {
  it("matches the punctuation-containing section named by an actual bundled provenance link", () => {
    const html = renderMarkdown("## Turn 19: Config & Schema Hardening (Lines 3,561-3,760)");
    expect(headingIds(html)).toEqual(["turn-19-config--schema-hardening-lines-3561-3760"]);
  });

  it("disambiguates repeated headings and existing numbered names within each document", () => {
    expect(headingIds(renderMarkdown("## Repeat\n### Repeat\n## Repeat-1\n## Repeat")))
      .toEqual(["repeat", "repeat-1", "repeat-1-1", "repeat-2"]);
    expect(headingIds(renderMarkdown("## Repeat"))).toEqual(["repeat"]);
  });

  it("keeps Unicode and meaningful underscores while stripping only heading markup", () => {
    const html = renderMarkdown([
      "## Привет non-latin 你好",
      "## Use `renderLiveDoc` for [docs](../guide.md) and __strong__ words",
      "## The Native Views Are the Base _(Recorded 2026-10-03)_",
      "## snake_case",
      "  ### Closing hashes ###"
    ].join("\n"));
    expect(headingIds(html)).toEqual([
      "привет-non-latin-你好",
      "use-renderlivedoc-for-docs-and-strong-words",
      "the-native-views-are-the-base-recorded-2026-10-03",
      "snake_case",
      "closing-hashes"
    ]);
  });

  it("does not derive anchors from custom link-handler HTML or display-level clamping", () => {
    const html = renderMarkdown("###### A [readable label](guide.md)\n## A readable label", {
      maxHeadingLevel: 3,
      linkHandler: (_href, text) => `<a data-kind="bundled" href="#">${text}</a>`
    });
    expect(headingIds(html)).toEqual(["a-readable-label", "a-readable-label-1"]);
    expect(html).toContain('<h3 id="a-readable-label">');
  });
});

describe("fenced code in the reader", () => {
  it("keeps heading-like code literal and reserves no section IDs from it", () => {
    const links = vi.fn(() => "unexpected link");
    const html = renderMarkdown([
      "```ts",
      "const value = '<tag>';",
      "## Repeat",
      "[example](guide.md) and **literal**",
      "```",
      "## Repeat",
      "## Repeat"
    ].join("\n"), { linkHandler: links });
    expect(headingIds(html)).toEqual(["repeat", "repeat-1"]);
    expect(links).not.toHaveBeenCalled();
    expect(html).toContain('<pre><code class="language-ts">const value = &#39;&lt;tag&gt;&#39;;\n## Repeat\n[example](guide.md) and **literal**</code></pre>');
  });

  it("honors a longer backtick fence containing shorter fences and preserves indentation", () => {
    const html = renderMarkdown([
      "````markdown",
      "  ## Sample",
      "```",
      "## Sample",
      "```",
      "````",
      "## Sample"
    ].join("\n"));
    expect(headingIds(html)).toEqual(["sample"]);
    expect(html).toContain('<pre><code class="language-markdown">  ## Sample\n```\n## Sample\n```</code></pre>');
  });

  it("recognizes tilde fences, accepts longer closing fences, and keeps an unclosed fence opaque to end of input", () => {
    const html = renderMarkdown("~~~\n## Sample\n~~~~\n## Sample\n~~~text\n## Sample\n```");
    expect(headingIds(html)).toEqual(["sample"]);
    expect(html).toContain('<pre><code class="language-text">## Sample\n```</code></pre>');
  });
});
