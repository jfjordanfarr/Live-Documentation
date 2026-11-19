/**
 * CommonMark's own examples grade the link rule: every example of the sections that bear on links, from the
 * specification's published data (version 0.31.2, kept beside this test with its source and licence), must read
 * as the reference renderer's HTML says it does, or be named below with the reason this product reads it
 * otherwise. A named example that starts to pass fails the test, so the list never outlives its reasons.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { readMarkdownLinks } from "./markdownLinks";

interface Example {
  example: number;
  section: string;
  markdown: string;
  html: string;
}

const { examples } = JSON.parse(readFileSync(path.join(__dirname, "__fixtures__", "commonmark-link-examples.json"), "utf8")) as { examples: Example[] };

/** The examples this product reads otherwise, each with its reason; the module's remarks name the rule. */
const DIFFERENCES: Record<number, string> = {
  211: "an indented code block is not recognised, so the definition in it is read"
};

/**
 * The links the reference renderer wrote into an example's HTML, in order: each `<a href>` and `<img src>` with its
 * title, as the HTML says them. A tag that stands in the markdown as written is raw HTML passed through, not a link.
 */
function expectedLinks(example: Example): string[] {
  const links: string[] = [];
  for (const match of example.html.matchAll(/<a href="([^"]*)"(?: title="([^"]*)")?>|<img src="([^"]*)" alt="[^"]*"(?: title="([^"]*)")? \/>/gu)) {
    if (example.markdown.includes(match[0])) continue;
    links.push(match[1] !== undefined ? describeLink(match[1], match[2]) : describeLink(match[3], match[4]));
  }
  return links;
}

/** The links the rule reads, as the reference renderer writes them: the destination URL-normalized, both escaped. */
function actualLinks(markdown: string): string[] {
  return readMarkdownLinks(markdown).links.map((link) => describeLink(escapeXml(normalizeUri(link.destination)), link.title === undefined ? undefined : escapeXml(link.title)));
}

function describeLink(destination: string, title: string | undefined): string {
  return title === undefined ? destination : `${destination} "${title}"`;
}

/**
 * The reference renderer's URL normalization (commonmark.js, through mdurl's `encode`): a valid percent-escape is
 * kept, an ASCII letter, digit or one of `;/?:@&=+$,-_.!~*'()#` is kept, and anything else is percent-encoded as
 * UTF-8, a lone surrogate as the replacement character. Part of how the HTML writes a link, not of how it is read.
 */
function normalizeUri(uri: string): string {
  let result = "";
  for (let index = 0; index < uri.length; index += 1) {
    const character = uri[index];
    if (character === "%" && /^[0-9a-f]{2}$/iu.test(uri.slice(index + 1, index + 3))) {
      result += uri.slice(index, index + 3);
      index += 2;
    } else if (/[A-Za-z0-9;/?:@&=+$,\-_.!~*'()#]/u.test(character)) {
      result += character;
    } else {
      const code = character.charCodeAt(0);
      if (code >= 0xd800 && code <= 0xdbff && /[\udc00-\udfff]/u.test(uri[index + 1] ?? "")) {
        result += encodeURIComponent(character + uri[index + 1]);
        index += 1;
      } else if (code >= 0xd800 && code <= 0xdfff) {
        result += "%EF%BF%BD";
      } else {
        result += encodeURIComponent(character).replace(/[!'()*]/gu, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
      }
    }
  }
  return result;
}

function escapeXml(text: string): string {
  return text.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;");
}

describe("CommonMark's examples", () => {
  it("are all here: the sections that bear on links, 230 examples", () => {
    expect(examples).toHaveLength(230);
  });

  for (const example of examples) {
    const difference = DIFFERENCES[example.example];
    it(`example ${example.example} (${example.section})${difference ? `: read otherwise, ${difference}` : ""}`, () => {
      if (difference) {
        expect(actualLinks(example.markdown)).not.toEqual(expectedLinks(example));
      } else {
        expect(actualLinks(example.markdown)).toEqual(expectedLinks(example));
      }
    });
  }
});
