import { describe, expect, it } from "vitest";

import {
  RelationshipExtractor,
  RelationshipExtractorError,
  type RelationshipExtractionPrompt
} from "./relationshipExtractor";

function createPrompt(overrides: Partial<RelationshipExtractionPrompt> = {}): RelationshipExtractionPrompt {
  return {
    templateId: "live-documentation.llm-ingestion.v1",
    templateVersion: "2025-10-24",
    promptText: "<prompt>",
    promptHash: "hash1234",
    issuedAt: "2025-10-24T12:00:00.000Z",
    ...overrides
  } satisfies RelationshipExtractionPrompt;
}

describe("RelationshipExtractor", () => {
  it("parses JSON relationships from model response", async () => {
    const extractor = new RelationshipExtractor({
      invokeModel: async () => ({
        response: JSON.stringify({
          relationships: [
            {
              sourceId: "source",
              targetId: "target",
              relationship: "depends_on",
              confidence: 0.9,
              confidenceLabel: "high",
              rationale: "links directly",
              supportingChunks: ["chunk-1"]
            }
          ]
        }),
        modelId: "mock-model"
      })
    });

    const batch = await extractor.extractRelationships({ prompt: createPrompt() });

    expect(batch.modelId).toBe("mock-model");
    expect(batch.promptHash).toBe("hash1234");
    expect(batch.relationships).toHaveLength(1);
    expect(batch.relationships[0]).toMatchObject({
      sourceId: "source",
      targetId: "target",
      relationship: "depends_on",
      confidence: 0.9,
      confidenceLabel: "high",
      supportingChunks: ["chunk-1"]
    });
  });

  it("throws when model response is invalid JSON", async () => {
    const extractor = new RelationshipExtractor({
      invokeModel: async () => ({ response: "not-json" })
    });

    await expect(async () => extractor.extractRelationships({ prompt: createPrompt() })).rejects.toBeInstanceOf(
      RelationshipExtractorError
    );
  });

  it("throws when relationships array missing", async () => {
    const extractor = new RelationshipExtractor({
      invokeModel: async () => ({
        response: JSON.stringify({ invalid: true })
      })
    });

    await expect(async () => extractor.extractRelationships({ prompt: createPrompt() })).rejects.toBeInstanceOf(
      RelationshipExtractorError
    );
  });
});
