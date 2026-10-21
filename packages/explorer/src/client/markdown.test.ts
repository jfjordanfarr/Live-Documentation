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

describe("what a doc's text can do to the page", () => {
  const attacks = [
    `<img src="https://example.com/x.png" onerror="alert(1)">`,
    `<script>fetch("https://example.com/")</script>`,
    `<iframe src="https://example.com/"></iframe>`,
    `<a href="javascript:alert(1)">click</a>`
  ];

  it("shows raw HTML as written wherever inline text is read, and never as markup", () => {
    for (const attack of attacks) {
      const html = renderMarkdown([`## Heading ${attack}`, `Text ${attack}`, `- Item ${attack}`, `1. Step ${attack}`, `[label ${attack}](guide.md)`].join("\n\n"));
      expect(html).not.toMatch(/<(?:img|script|iframe)\b/u);
      expect(html).not.toMatch(/<a href="javascript:/iu);
      expect(html.split("&lt;").length - 1).toBeGreaterThanOrEqual(5);
    }
    expect(renderMarkdown(`Text <img src=x onerror=alert(1)> & more`)).toBe("<p>Text &lt;img src=x onerror=alert(1)&gt; &amp; more</p>");
  });

  it("reads an image's syntax as a link to the image, which is never fetched", () => {
    expect(renderMarkdown("![The map](https://example.com/map.png)"))
      .toBe('<p><a href="https://example.com/map.png" target="_blank" rel="noopener noreferrer">The map</a></p>');
  });

  it("keeps a link to any scheme but the web and mail as its text", () => {
    for (const href of ["javascript:location='https://example.com/'", " JavaScript:void 0", "data:text/html,<script>fetch`/`</script>", "vbscript:msgbox"]) {
      expect(renderMarkdown(`[run](${href})`)).toBe("<p>run</p>");
    }
    expect(renderMarkdown("[mail](mailto:someone@example.com) and [up](../guide.md)"))
      .toBe('<p><a href="mailto:someone@example.com" target="_blank" rel="noopener noreferrer">mail</a> and <a href="../guide.md" target="_blank" rel="noopener noreferrer">up</a></p>');
  });

  it("turns an autolink into a link and leaves other angle brackets as text", () => {
    expect(renderMarkdown("Offered to <https://github.com/example/grammar>; gone since <commit>."))
      .toBe('<p>Offered to <a href="https://github.com/example/grammar" target="_blank" rel="noopener noreferrer">https://github.com/example/grammar</a>; gone since &lt;commit&gt;.</p>');
  });

  it("keeps the character that marks a finished piece as text, so that no doc can forge a piece", () => {
    const html = renderMarkdown("[one](a.md) \uE0000\uE000 \uE0000\uE000 `code`");
    expect(html.match(/<a /gu)).toHaveLength(1);
    expect(html).toBe('<p><a href="a.md" target="_blank" rel="noopener noreferrer">one</a> &#xE000;0&#xE000; &#xE000;0&#xE000; <code>code</code></p>');
    expect(renderMarkdown("[a\uE000b](x.md) and `c\uE000d`"))
      .toBe('<p><a href="x.md" target="_blank" rel="noopener noreferrer">a&#xE000;b</a> and <code>c&#xE000;d</code></p>');
  });
});

describe("inline code, links and emphasis in the reader", () => {
  it("keeps a code span literal: a path in it stays code and underscores and asterisks stay letters", () => {
    expect(renderMarkdown("See `./foo.ts`, `snake_case_name` and `a * b * c` here"))
      .toBe("<p>See <code>./foo.ts</code>, <code>snake_case_name</code> and <code>a * b * c</code> here</p>");
  });

  it("never lets emphasis reach a link's attributes", () => {
    expect(renderMarkdown("[a_b_c](x_y_z.md) and _(Recorded 2026-10-03)_"))
      .toBe('<p><a href="x_y_z.md" target="_blank" rel="noopener noreferrer">a_b_c</a> and <em>(Recorded 2026-10-03)</em></p>');
  });

  it("treats an underscore inside a word as a letter and around a word as emphasis", () => {
    expect(renderMarkdown("keep_authored_stale stays, _this_ leans, __this__ and **this** stand, *in*word leans"))
      .toBe("<p>keep_authored_stale stays, <em>this</em> leans, <strong>this</strong> and <strong>this</strong> stand, <em>in</em>word leans</p>");
  });

  it("still links a bare relative path in prose and emphasizes around a link", () => {
    expect(renderMarkdown("**Read [the guide](guide.md)** beside ../packages/generator/src/generator.ts"))
      .toBe('<p><strong>Read <a href="guide.md" target="_blank" rel="noopener noreferrer">the guide</a></strong> beside <a href="../packages/generator/src/generator.ts" target="_blank" rel="noopener noreferrer">../packages/generator/src/generator.ts</a></p>');
  });
});
