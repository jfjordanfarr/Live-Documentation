import { describe, expect, it } from "vitest";

import type { ArtifactSeed } from "./fallbackInference";
import {
  LinkInferenceOrchestrator,
  type KnowledgeFeed,
  type WorkspaceLinkProvider
} from "./linkInference";
import type { ExternalSnapshot } from "../knowledge/externalTypes";

const DOC_URI = "file:///repo/docs/feature.md";
const CODE_URI = "file:///repo/src/core.ts";
const SPEC_URI = "file:///repo/specs/spec.md";

describe("LinkInferenceOrchestrator", () => {
  it("combines fallback, workspace providers, and knowledge feeds", async () => {
    const seeds: ArtifactSeed[] = [
      {
        uri: DOC_URI,
        layer: "requirements",
        language: "markdown",
        owner: "docs",
        content: "# Feature\n\nLinks to [Core](file:///repo/src/core.ts) implementation."
      },
      {
        uri: CODE_URI,
        layer: "implementation",
        language: "typescript",
        owner: "backend",
        content: "export function core() { return true; }"
      }
    ];

    const provider: WorkspaceLinkProvider = {
      id: "workspace-symbols",
      label: "Workspace Symbols",
      collect() {
        return Promise.resolve({
          evidences: [
            {
              sourceUri: CODE_URI,
              targetUri: DOC_URI,
              kind: "documents",
              confidence: 0.85,
              rationale: "Symbol reference back to requirement"
            }
          ]
        });
      }
    };

    const snapshot: ExternalSnapshot = {
      id: "snapshot-001",
      label: "Spec Feed",
      artifacts: [
        {
          id: "spec-artifact",
          uri: SPEC_URI,
          layer: "requirements",
          language: "markdown",
          owner: "architecture"
        },
        {
          id: "doc-artifact",
          uri: DOC_URI,
          layer: "requirements",
          language: "markdown",
          owner: "docs"
        }
      ],
      links: [
        {
          id: "spec-to-doc",
          sourceId: "spec-artifact",
          targetId: "doc-artifact",
          kind: "documents",
          confidence: 0.95,
          createdBy: "spec-feed"
        }
      ]
    };

    const feed: KnowledgeFeed = {
      id: "external-spec-feed",
      snapshot: {
        label: snapshot.label,
        loadSnapshot() {
          return Promise.resolve(snapshot);
        }
      }
    };

    const orchestrator = new LinkInferenceOrchestrator();

    const result = await orchestrator.run({
      seeds,
      workspaceProviders: [provider],
      knowledgeFeeds: [feed]
    });

    expect(result.errors).toHaveLength(0);

    const artifactsById = new Map(result.artifacts.map(artifact => [artifact.id, artifact.uri] as const));
    expect(result.artifacts.map(artifact => artifact.uri)).toEqual(
      expect.arrayContaining([DOC_URI, CODE_URI, SPEC_URI])
    );

    const linkTriples = result.links.map(link => ({
      source: artifactsById.get(link.sourceId),
      target: artifactsById.get(link.targetId),
      kind: link.kind
    }));

    expect(linkTriples).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: DOC_URI, target: CODE_URI }),
        expect.objectContaining({ source: CODE_URI, target: DOC_URI }),
        expect.objectContaining({ source: SPEC_URI, target: DOC_URI })
      ])
    );

    const providerSummary = result.providerSummaries.find(summary => summary.id === provider.id);
    expect(providerSummary).toBeDefined();
    expect(providerSummary?.evidenceCount).toBe(1);

    const feedSummary = result.feedSummaries.find(summary => summary.id === feed.id);
    expect(feedSummary).toBeDefined();
    expect(feedSummary?.artifactCount).toBe(1);
    expect(feedSummary?.linkCount).toBe(1);

    const traceOrigins = result.traces.map(trace => trace.origin);
    expect(traceOrigins).toContain("heuristic");
    expect(traceOrigins).toContain("workspace-symbols");
    expect(traceOrigins).toContain("knowledge-feed");
  });
});
