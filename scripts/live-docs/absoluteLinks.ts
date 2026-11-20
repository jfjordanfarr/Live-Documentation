/**
 * The links in a Live Doc that leave the repository, which the docs lint refuses: a link to the web, or to a path on
 * a drive. Links are read by the markdown link rule, as the engine reads them, so a link's shape described in a code
 * span or a fenced block is not a link, and an autolink, which a doc's words may use to name a page, is left alone.
 *
 * @module
 */
import { readMarkdownLinks } from "@live-documentation/engine/tooling/markdownLinks";

/** A link the lint refuses, and why: to a web address, or to a path on a drive. */
export interface AbsoluteLink {
  target: string;
  kind: "web" | "drive";
}

/** The doc's links and images, inline or by reference, that name a web address or a drive's path, in order. */
export function absoluteLinks(content: string): AbsoluteLink[] {
  const found: AbsoluteLink[] = [];
  for (const link of readMarkdownLinks(content).links) {
    if (link.kind === "autolink") continue;
    if (/^https?:\/\//iu.test(link.destination)) found.push({ target: link.destination, kind: "web" });
    else if (/^[a-zA-Z]+:\\/u.test(link.destination)) found.push({ target: link.destination, kind: "drive" });
  }
  return found;
}
