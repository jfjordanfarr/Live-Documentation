/**
 * The reference implementation grades the link rule over whole documents: over every markdown file this repository
 * tracks, the links, images and autolinks the rule reads (destination and title) must be those commonmark.js finds,
 * but for the differences named below, each with its cause. A difference that appears, or one named that
 * disappears, fails. The specification's examples grade the rule piece by piece (`markdownLinks.commonmark.test.ts`);
 * this test grades it where a link that is not a link would be counted as a citation: a fence inside a list, an
 * indented code block, an HTML block, the places the rule departs from CommonMark by design.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { readMarkdownLinks } from "@live-documentation/engine/tooling/markdownLinks";

interface Node { type: string; destination: string; title: string }
const { Parser } = createRequire(__filename)("commonmark") as { Parser: new () => { parse(text: string): { walker(): { next(): { entering: boolean; node: Node } | null } } } };

const ROOT = path.resolve(__dirname, "../../..");

/** Where the rule and the reference implementation read a document's links otherwise, and why. */
const REGISTER: Record<string, { cause: string; onlyRule: string[]; onlyReference: string[] }> = {
  "AI-Agent-Workspace/AgentSessionHistory/2025/12/Summarized/2025-12-06.2.SUMMARIZED.md": {
    // A stated limit, not a fault to mend here: neither the link reader nor the Explorer's renderer reads list items or
    // block quotes as containers, so a fence indented four or more spaces under a list item, or inside a quote, is not
    // seen as a fence. This is the one place in this repository; a rule of fences alone lost 295 true links when tried,
    // and the mend, if ever, is the containers read once for both readers (`markdownLinks.ts`).
    cause: "a fence indented four spaces under a list item, which the rule reads as text since it reads no list item or block quote as a container, so the two example links inside it are read as links",
    onlyRule: ["./logger.h.mdmd.md#symbol-log_message \"\"", "./metrics.h.mdmd.md#symbol-compute_average \"\""],
    onlyReference: []
  }
};

/**
 * The reference implementation's URL normalization (mdurl's `encode`): a valid percent-escape and the characters
 * it leaves are kept, anything else is percent-encoded as UTF-8. It is how commonmark.js writes a destination into
 * its tree, not how a link is read, so the rule's destinations pass through it before they are compared.
 */
function normalizeUri(uri: string): string {
  let result = "";
  for (let index = 0; index < uri.length; index += 1) {
    const character = uri[index];
    const code = character.charCodeAt(0);
    if (character === "%" && /^[0-9a-f]{2}$/iu.test(uri.slice(index + 1, index + 3))) {
      result += uri.slice(index, index + 3);
      index += 2;
    } else if (/[A-Za-z0-9;/?:@&=+$,\-_.!~*'()#]/u.test(character)) {
      result += character;
    } else if (code >= 0xd800 && code <= 0xdbff && /[\udc00-\udfff]/u.test(uri[index + 1] ?? "")) {
      result += encodeURIComponent(character + uri[index + 1]);
      index += 1;
    } else {
      result += code >= 0xd800 && code <= 0xdfff ? "%EF%BF%BD" : encodeURIComponent(character);
    }
  }
  return result;
}

/** What one list holds more often than another, each item once per time. */
function beyond(list: string[], other: string[]): string[] {
  const left = [...other];
  return list.filter((item) => {
    const at = left.indexOf(item);
    if (at === -1) return true;
    left.splice(at, 1);
    return false;
  }).sort();
}

describe("the link rule against commonmark.js, over every markdown file of this repository", () => {
  it("reads the links the reference implementation reads, but for the differences the register names", () => {
    const files = execFileSync("git", ["ls-files", "-z", "*.md", "*.markdown"], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 26 }).split("\0").filter(Boolean);
    expect(files.length).toBeGreaterThan(1_000);
    const found: typeof REGISTER = {};
    let links = 0;
    for (const file of files) {
      const text = readFileSync(path.join(ROOT, file), "utf8");
      const rule = readMarkdownLinks(text).links.map((link) => `${normalizeUri(link.destination)} ${JSON.stringify(link.title ?? "")}`);
      const reference: string[] = [];
      const walker = new Parser().parse(text).walker();
      for (let event = walker.next(); event; event = walker.next()) {
        if (event.entering && (event.node.type === "link" || event.node.type === "image")) reference.push(`${event.node.destination} ${JSON.stringify(event.node.title ?? "")}`);
      }
      links += reference.length;
      const onlyRule = beyond(rule, reference);
      const onlyReference = beyond(reference, rule);
      if (onlyRule.length > 0 || onlyReference.length > 0) found[file] = { cause: REGISTER[file]?.cause ?? "unnamed", onlyRule, onlyReference };
    }
    expect(links, "the repository's documents hold tens of thousands of links").toBeGreaterThan(10_000);
    expect(found).toEqual(REGISTER);
  }, 300_000);
});
