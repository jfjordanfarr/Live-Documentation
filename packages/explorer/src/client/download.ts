/**
 * Document Download / Export
 *
 * Handles collecting Live Docs and Related Documentation and exporting them
 * as flattened markdown or ZIP archives.
 *
 * Extracted from index.ts during the Feb 2026 refactor to reduce the
 * monolith below the 1000-line threshold.
 */

import JSZip from "jszip";

import { renderLiveDoc } from "@live-documentation/engine/live-docs/document";
import type { GraphFile } from "@live-documentation/engine/live-docs/graph";

import type { SourcesFacts } from "./panels/sources-facts";
import type { DownloadBundleType, DownloadFormat } from "./panels/sources-view";

export type { DownloadBundleType, DownloadFormat };

/** A single document entry for download. */
export interface DocEntry {
  /** Relative path for the document (used for ZIP structure). */
  relativePath: string;
  /** Markdown content. */
  content: string;
  /** Whether this is a Live Doc or Related Doc. */
  type: "live" | "related";
}

/** What the download draws on: the graph's files and the bundled related markdown. */
export interface DownloadContext {
  files: Record<string, GraphFile>;
  bundledMarkdown?: Record<string, string>;
}

/**
 * Collect documents based on bundle type. A Live Doc is rendered from the graph,
 * which gives back the bytes the generator wrote.
 */
function collectDocs(bundleType: DownloadBundleType, ctx: DownloadContext): DocEntry[] {
  const docs: DocEntry[] = [];

  if (bundleType === "live" || bundleType === "all") {
    for (const file of Object.values(ctx.files)) {
      docs.push({ relativePath: file.docPath, content: renderLiveDoc(file), type: "live" });
    }
  }

  if ((bundleType === "related" || bundleType === "all") && ctx.bundledMarkdown) {
    for (const docPath of Object.keys(ctx.bundledMarkdown).sort()) {
      docs.push({ relativePath: docPath, content: ctx.bundledMarkdown[docPath], type: "related" });
    }
  }

  return docs;
}

/**
 * Download documents as flattened markdown.
 */
function downloadAsMarkdown(docs: DocEntry[], bundleType: DownloadBundleType): void {
  const sections: string[] = [];

  const liveDocs = docs.filter(d => d.type === "live");
  const relatedDocs = docs.filter(d => d.type === "related");

  if (liveDocs.length > 0) {
    sections.push(`## Live Documentation (${liveDocs.length} files)\n`);
    for (const doc of liveDocs) {
      sections.push(`\n---\n\n<!-- SOURCE: ${doc.relativePath} -->\n\n${doc.content}`);
    }
  }

  if (relatedDocs.length > 0) {
    sections.push(`\n\n## Related Documentation (${relatedDocs.length} files)\n`);
    for (const doc of relatedDocs) {
      sections.push(`\n---\n\n<!-- BUNDLED: ${doc.relativePath} -->\n\n${doc.content}`);
    }
  }

  const bundleLabel = bundleType === "live" ? "Live Docs" : bundleType === "related" ? "Related Docs" : "All Docs";
  const combined = `# Documentation Export (${bundleLabel})\n\nExported ${docs.length} documents on ${new Date().toISOString()}\n\n${sections.join("")}`;

  const filename = bundleType === "live" ? "live-documentation.md"
    : bundleType === "related" ? "related-documentation.md"
      : "all-documentation.md";
  saveBlob(new Blob([combined], { type: "text/markdown; charset=utf-8" }), filename);
}

/** Hands the browser a file to save, through a link clicked once and removed. */
function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** The Knowledge Sources panel's facts as one JSON file, so that what the screen says can be taken out as data. */
export function downloadFactsJson(facts: SourcesFacts): void {
  saveBlob(new Blob([JSON.stringify(facts, null, 2)], { type: "application/json" }), "knowledge-sources.json");
}

/**
 * Download documents as ZIP archive with preserved directory structure.
 */
async function downloadAsZip(docs: DocEntry[], bundleType: DownloadBundleType): Promise<void> {
  const zip = new JSZip();

  const liveDocsFolder = bundleType === "all" ? zip.folder("live-docs") : zip;
  const relatedDocsFolder = bundleType === "all" ? zip.folder("related-docs") : zip;

  for (const doc of docs) {
    const folder = doc.type === "live"
      ? (bundleType === "all" ? liveDocsFolder : zip)
      : (bundleType === "all" ? relatedDocsFolder : zip);

    if (folder) {
      folder.file(doc.relativePath, doc.content);
    }
  }

  const liveCount = docs.filter(d => d.type === "live").length;
  const relatedCount = docs.filter(d => d.type === "related").length;
  const bundleLabel = bundleType === "live" ? "Live Documentation"
    : bundleType === "related" ? "Related Documentation"
      : "All Documentation";

  const readme = `# ${bundleLabel} Export

Exported on: ${new Date().toISOString()}

## Contents

${liveCount > 0 ? `- **Live Documentation**: ${liveCount} files${bundleType === "all" ? " (in live-docs/ folder)" : ""}` : ""}
${relatedCount > 0 ? `- **Related Documentation**: ${relatedCount} files${bundleType === "all" ? " (in related-docs/ folder)" : ""}` : ""}

Total: ${docs.length} files

## What's in this archive?

${bundleType !== "related" ? `**Live Documentation** mirrors your source code structure. Each markdown file corresponds to a source file and contains:
- Purpose and notes (authored sections)
- Public symbols and their signatures
- Dependencies and dependents
` : ""}
${bundleType !== "live" ? `**Related Documentation** includes referenced markdown files from your workspace:
- READMEs
- Specification documents
- Other markdown files linked from Live Docs
` : ""}
---

Generated by [Live Documentation](https://github.com/jfjordanfarr/Live-Documentation)
`;

  zip.file("README.md", readme);

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 }
  });

  const filename = bundleType === "live" ? "live-documentation.zip"
    : bundleType === "related" ? "related-documentation.zip"
      : "all-documentation.zip";
  saveBlob(blob, filename);
}

/**
 * Main download function — collects docs and exports in the selected format.
 */
export async function downloadDocs(
  bundleType: DownloadBundleType,
  format: DownloadFormat,
  ctx: DownloadContext
): Promise<void> {
  try {
    const docs = collectDocs(bundleType, ctx);

    if (docs.length === 0) {
      alert("No documentation content available to download.");
      return;
    }

    if (format === "markdown") {
      downloadAsMarkdown(docs, bundleType);
    } else {
      await downloadAsZip(docs, bundleType);
    }
  } catch (error) {
    console.error("Failed to download documentation:", error);
    alert("Failed to download documentation. Check the console for details.");
  }
}
