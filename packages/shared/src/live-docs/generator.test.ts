import { describe, expect, it } from "vitest";

import {
  composeLiveDocId,
  composeLiveDocPath,
  defaultAuthoredTemplate,
  extractAuthoredBlock,
  renderLiveDocMarkdown,
  renderProvenanceComment
} from "./markdown";
import type { LiveDocMetadata, LiveDocProvenance } from "./schema";
import { LIVE_DOCUMENTATION_FILE_EXTENSION } from "../config/liveDocumentationConfig";

describe("Live Documentation markdown rendering", () => {
  it("preserves authored block when present", () => {
    const original = [
      "# Title",
      "",
      "## Authored",
      "### Description",
      "Existing description",
      "",
      "### Purpose",
      "Existing purpose",
      "",
      "### Notes",
      "Existing notes",
      "",
      "## Generated"
    ].join("\n");

    const extracted = extractAuthoredBlock(original);
    expect(extracted).toContain("Existing description");
    expect(extracted).toContain("Existing purpose");
    expect(extracted).toContain("Existing notes");
  });

  it("falls back to default template when authored block missing", () => {
    const extracted = extractAuthoredBlock(undefined);
    expect(extracted).toBe(defaultAuthoredTemplate());
  });

  it("renders markdown with provenance marker", () => {
    const metadata: LiveDocMetadata = {
      layer: 4,
      archetype: "implementation",
      sourcePath: "src/example.ts",
      liveDocId: "LD-implementation-src-example-ts",
      generatedAt: "2025-11-08T12:34:56.000Z"
    };

    const provenance: LiveDocProvenance = {
      generators: [
        {
          tool: "live-docs-generator",
          version: "0.1.0",
          generatedAt: "2025-11-08T12:34:56.000Z",
          inputHash: "abcdef123456"
        }
      ]
    };

    const markdown = renderLiveDocMarkdown({
      title: "src/example.ts",
      metadata,
      authoredBlock: defaultAuthoredTemplate(),
      sections: [
        {
          name: "Public Symbols",
          lines: ["- `example`"]
        },
        {
          name: "Dependencies",
          lines: ["- ./library"]
        }
      ],
      provenance
    });

    expect(markdown).toContain("## Metadata");
    expect(markdown).toContain("<!-- LIVE-DOC:PROVENANCE ");
    expect(markdown).toContain("<!-- LIVE-DOC:BEGIN Public Symbols -->");
    expect(markdown).toContain("<!-- LIVE-DOC:END Dependencies -->");
  });

  it("composes deterministic Live Doc identifiers", () => {
    expect(composeLiveDocId("implementation", "packages/util.ts")).toBe(
      "LD-implementation-packages-util-ts"
    );
    expect(composeLiveDocId(undefined, "src/index.ts")).toBe("LD-unknown-src-index-ts");
  });

  it("composes Live Doc paths using normalized separators", () => {
    const composed = composeLiveDocPath(".live-documentation", "source", "src/index.ts");
    expect(composed).toBe(
      `.live-documentation/source/src/index.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`
    );
  });

  it("renders provenance payloads as JSON", () => {
    const provenance: LiveDocProvenance = {
      generators: [
        {
          tool: "example",
          generatedAt: "2025-11-08T00:00:00.000Z"
        }
      ]
    };

    const comment = renderProvenanceComment(provenance);
    expect(comment.startsWith("<!-- LIVE-DOC:PROVENANCE ")).toBe(true);
    expect(comment.endsWith(" -->")).toBe(true);
  });
});
