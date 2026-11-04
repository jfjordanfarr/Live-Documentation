import { symbolName } from "@live-documentation/engine/live-docs/document";
import type { GraphFile } from "@live-documentation/engine/live-docs/graph";

import { escapeHtml } from "./graph-helpers";
import type { InspectionTarget } from "./types";
import type { ExplorerNodePayload } from "../shared/types";

/** The bundled facts against which every documentation surface resolves a link. */
export interface ReaderLinkContext {
  nodesById: ReadonlyMap<string, ExplorerNodePayload>;
  files: Readonly<Record<string, GraphFile>>;
  bundledMarkdown?: Readonly<Record<string, string>>;
}

/** Resolve against the document's real path; neither the docs root nor its extension is special. */
function resolveDocLink(relativePath: string, fromDocPath: string): string | null {
  if (!relativePath) return fromDocPath;
  const parts = relativePath.startsWith("/") ? [] : fromDocPath.split("/").slice(0, -1);
  for (const part of relativePath.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (!parts.length) return null;
      parts.pop();
    } else parts.push(part);
  }
  return parts.join("/");
}

function decodeLinkPart(value: string): string {
  try { return decodeURIComponent(value); } catch { return value; }
}

/** Follow a documented re-export to its origin where the bundle carries that evidence. */
export function fileInspection(
  node: ExplorerNodePayload,
  fragment: string | undefined,
  context: ReaderLinkContext,
  visited = new Set<string>()
): Extract<InspectionTarget, { kind: "file" }> {
  const whole: Extract<InspectionTarget, { kind: "file" }> = { kind: "file", nodeId: node.id };
  if (!fragment) return whole;
  const key = `${node.id}#${fragment}`;
  if (visited.has(key)) return whole;
  visited.add(key);
  const file = context.files[node.id];
  const anchored = file?.symbols.find(entry => entry.slug === fragment);
  const reExport = file?.reExports?.find(entry => entry.slug === fragment)
    ?? (anchored ? undefined : file?.reExports?.find(entry => entry.name === fragment));
  if (reExport?.from) {
    const origin = resolveReaderTarget(reExport.from.link, node.docPath, context, visited);
    if (origin?.kind === "file") return origin;
  }
  const exact = anchored ?? file?.symbols.find(entry => entry.name === fragment);
  const named = file?.symbols.filter(entry => symbolName(entry) === fragment) ?? [];
  const block = exact ?? (named.length === 1 ? named[0] : undefined);
  const symbol = block ? block.name : node.publicSymbols.includes(fragment) ? fragment : undefined;
  return symbol ? { ...whole, symbol } : whole;
}

/** Resolve a documentation link to an exact bundled file, symbol, directory or authored document. */
export function resolveReaderTarget(
  href: string,
  fromDocPath: string,
  context: ReaderLinkContext,
  visited?: Set<string>
): InspectionTarget | null {
  href = href.trim();
  if (href.startsWith("<") && href.endsWith(">")) href = href.slice(1, -1);
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/iu.test(href)) return null;
  const hash = href.indexOf("#");
  const pathPart = hash < 0 ? href : href.slice(0, hash);
  const fragment = hash < 0 ? undefined : decodeLinkPart(href.slice(hash + 1)) || undefined;
  const path = resolveDocLink(decodeLinkPart(pathPart), fromDocPath);
  if (path === null) return null;
  for (const node of context.nodesById.values()) {
    if (node.docPath === path || node.codePath === path || node.id === path) {
      return fileInspection(node, fragment, context, visited);
    }
  }
  if (context.bundledMarkdown && Object.hasOwn(context.bundledMarkdown, path)) {
    return { kind: "bundled-doc", path, ...(fragment ? { fragment } : {}) };
  }
  const directory = path.replace(/\/+$/u, "");
  const prefix = directory ? `${directory}/` : "";
  if ([...context.nodesById.keys()].some(id => id.startsWith(prefix))) return { kind: "directory", directory };
  return null;
}

/** An escaped, inert-until-activated link to known evidence within the bundle. */
export function readerLink(target: InspectionTarget, text: string): string {
  if (target.kind === "file") {
    return `<a href="#" class="node-link" data-node-id="${escapeHtml(target.nodeId)}"${target.symbol ? ` data-symbol="${escapeHtml(target.symbol)}"` : ""}>${text}</a>`;
  }
  if (target.kind === "directory") {
    return `<a href="#" class="directory-link" data-directory="${escapeHtml(target.directory)}">${text}</a>`;
  }
  return `<a href="#" class="bundled-doc-link" data-doc-path="${escapeHtml(target.path)}"${target.fragment ? ` data-fragment="${escapeHtml(target.fragment)}"` : ""}>${text}</a>`;
}

/** Authored Live Doc prose and bundled Markdown use exactly the same navigation rules. */
export function createReaderLinkHandler(fromDocPath: string, context: ReaderLinkContext): (href: string, text: string) => string {
  return (href, text) => {
    href = href.trim();
    if (href.startsWith("<") && href.endsWith(">")) href = href.slice(1, -1);
    const target = resolveReaderTarget(href, fromDocPath, context);
    if (target) {
      // A local authored heading does not name another evidence item or a generated symbol.
      if (href.startsWith("#") && target.kind === "file" && !target.symbol) {
        return `<a href="#" class="reader-anchor" data-fragment="${escapeHtml(decodeLinkPart(href.slice(1)))}">${text}</a>`;
      }
      return readerLink(target, text);
    }
    if (/^(?:https?:|mailto:|\/\/)/iu.test(href)) {
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    // A source-relative path unavailable in this static bundle has no truthful reader destination.
    return `<span class="unavailable-link" title="Not included in this bundle">${text}</span>`;
  };
}
