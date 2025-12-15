import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { GraphStore } from "./graphStore";

describe("GraphStore", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  function createStore(): GraphStore {
    const dir = mkdtempSync(path.join(tmpdir(), "graph-store-test-"));
    tempDirs.push(dir);
    const dbPath = path.join(dir, "graph.db");
    return new GraphStore({ dbPath });
  }

  it("reuses existing artifact ids when upserting by uri", () => {
    const store = createStore();
    const uri = "file:///tmp/doc.md";

    try {
      const first = store.upsertArtifact({
        id: randomUUID(),
        uri,
        layer: "requirements"
      });

      const second = store.upsertArtifact({
        id: randomUUID(),
        uri,
        layer: "requirements",
        language: "markdown"
      });

      expect(second.id).toBe(first.id);
      expect(second.language).toBe("markdown");
    } finally {
      store.close();
    }
  });

  it("stores and retrieves llm provenance metadata", () => {
    const store = createStore();

    try {
      const source = store.upsertArtifact({
        id: randomUUID(),
        uri: "file:///tmp/source.ts",
        layer: "code"
      });
      const target = store.upsertArtifact({
        id: randomUUID(),
        uri: "file:///tmp/target.ts",
        layer: "code"
      });

      const linkId = randomUUID();
      const timestamp = new Date().toISOString();

      store.upsertLink({
        id: linkId,
        sourceId: source.id,
        targetId: target.id,
        kind: "depends_on",
        confidence: 0.9,
        createdAt: timestamp,
        createdBy: "test"
      });

      store.storeLlmEdgeProvenance({
        linkId,
        templateId: "live-documentation.llm-ingestion.v1",
        templateVersion: "2025-10-24",
        promptHash: "hash",
        modelId: "mock",
        issuedAt: timestamp,
        createdAt: timestamp,
        confidenceTier: "high",
        calibratedConfidence: 0.92,
        rawConfidence: 0.85,
        supportingChunks: ["chunk-1"],
        rationale: "imports chunk",
        diagnosticsEligible: true,
        shadowed: false,
        promotionCriteria: ["requires corroboration"]
      });

      const provenance = store.getLlmEdgeProvenance(linkId);
      expect(provenance).toBeDefined();
      expect(provenance).toMatchObject({
        linkId,
        confidenceTier: "high",
        diagnosticsEligible: true,
        shadowed: false,
        supportingChunks: ["chunk-1"],
        promotionCriteria: ["requires corroboration"]
      });
    } finally {
      store.close();
    }
  });
});
