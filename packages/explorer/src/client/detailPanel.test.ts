import { describe, expect, it } from "vitest";

import { renderSymbolBlocks, type SymbolBlock } from "@live-documentation/engine/live-docs/document";

import { inspectedSymbolHtml } from "./detailPanel";
import { renderMarkdown } from "./markdown";

const link = (href: string, text: string): string => `<a data-href="${href}">${text}</a>`;

const block: SymbolBlock = {
  name: "a\nb",
  kind: "function",
  flags: [],
  source: { path: "../src/a.ts", line: 3 },
  references: [{ role: "Parameters", parameters: [{ name: "x``y", types: [{ name: "Plan", link: "./plan.ts.md#symbol-plan", array: true }] }] }],
  sections: [
    { title: "Summary", body: ["Opens an example:", "```ts", "const x = 1;"] },
    { title: "Remarks", body: ["After the example, *read* as text."] }
  ]
};

describe("the inspected symbol in the reader", () => {
  it("shows the names the doc's reader reads, never the form the doc writes them in", () => {
    const html = inspectedSymbolHtml(block, link);
    expect(html).toContain("<h4><code>a\nb</code></h4>");
    expect(html).toContain('Parameters: <code>x``y</code>: <a data-href="./plan.ts.md#symbol-plan"><code>Plan</code></a>[]');
    expect(html).toContain('Source: <a data-href="../src/a.ts#L3">source</a>');
    expect(html).not.toContain("&quot;");
    expect(html).not.toContain("\\");
  });

  it("ends a section's unclosed fence with its section, so the next section reads as itself", () => {
    const html = inspectedSymbolHtml(block, link);
    expect(html).toContain('<pre><code class="language-ts">const x = 1;</code></pre>');
    expect(html).toContain("<h5><code>a\nb</code> — Remarks</h5>\n<p>After the example, <em>read</em> as text.</p>");
  });

  it("differs from rendering the doc's written form, which showed the quoted name and swallowed what followed the fence", () => {
    const written = renderMarkdown(renderSymbolBlocks([block]).join("\n"), { linkHandler: link });
    expect(written).not.toContain("<h4><code>a\nb</code></h4>");
    expect(inspectedSymbolHtml(block, link)).not.toBe(written);
  });
});
