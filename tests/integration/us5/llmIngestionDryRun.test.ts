// @ts-nocheck
const assert = require("node:assert");
const { mkdtempSync, rmSync, writeFileSync } = require("node:fs");
const fsp = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const repoRoot = path.resolve(__dirname, "../../../..");
const { GraphStore } = require(path.join(repoRoot, "packages/shared/dist"));
const {
  ProviderGuard
} = require(path.join(repoRoot, "packages/server/dist/features/settings/providerGuard"));
const {
  LlmIngestionOrchestrator
} = require(path.join(repoRoot, "packages/server/dist/features/knowledge/llmIngestionOrchestrator"));

suite("US5: LLM ingestion dry-run harness", () => {
  const tempDirs: string[] = [];

  teardown(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  test("Dry-run emits snapshot without mutating graph", async function () {
    this.timeout(10_000);

    const { store, orchestrator, artifactIds, snapshotDir } = await createHarness({
      relationships: [
        {
          sourceId: "root",
          targetId: "dependent",
          relationship: "depends_on",
          confidenceLabel: "high",
          supportingChunks: ["chunk-1"],
          rationale: "imports the dependent module"
        },
        {
          sourceId: "root",
          targetId: "speculative",
          relationship: "depends_on",
          confidenceLabel: "low",
          rationale: "partial identifier overlap"
        }
      ]
    });

    orchestrator.enqueueArtifacts([artifactIds.root]);
    const results = await orchestrator.runDryRun(snapshotDir);

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].stored, 0);
    assert.strictEqual(results[0].skipped, 2);
    assert.ok(results[0].dryRunSnapshotPath);

    const snapshotPath = results[0].dryRunSnapshotPath!;
    const snapshot = JSON.parse(await fsp.readFile(snapshotPath, "utf8"));

    assert.strictEqual(snapshot.metadata.templateId, "live-documentation.llm-ingestion.v1");
    assert.strictEqual(snapshot.relationships.length, 2);

    const lowEdge = snapshot.relationships.find((entry: any) => entry.targetId === "speculative");
    assert.ok(lowEdge, "Snapshot should include speculative relationship for auditing");
    assert.strictEqual(lowEdge.diagnosticsEligible, false);
    assert.strictEqual(lowEdge.confidenceTier, "low");

    const links = store.listLinkedArtifacts(artifactIds.root);
    assert.strictEqual(links.length, 0, "Dry-run should not persist graph edges");

    store.close();
  });

  test("Persistent run stores eligible edges and provenance", async function () {
    this.timeout(10_000);

    const { store, orchestrator, artifactIds } = await createHarness({
      relationships: [
        {
          sourceId: "root",
          targetId: "dependent",
          relationship: "depends_on",
          confidenceLabel: "high",
          supportingChunks: ["chunk-1"],
          rationale: "imports the dependent module"
        },
        {
          sourceId: "root",
          targetId: "speculative",
          relationship: "depends_on",
          confidenceLabel: "low"
        }
      ]
    });

    orchestrator.enqueueArtifacts([artifactIds.root]);
    const results = await orchestrator.runOnce();

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].stored, 1);
    assert.strictEqual(results[0].skipped, 1);

    const storedLink = (store as any).getLink(artifactIds.root, artifactIds.dependent, "depends_on");
    assert.ok(storedLink, "High confidence edge should be stored");

    const provenance = (store as any).getLlmEdgeProvenance(storedLink.id);
    assert.ok(provenance, "Stored edge should have provenance");
    assert.strictEqual(provenance.confidenceTier, "high");
    assert.strictEqual(provenance.diagnosticsEligible, true);

    const skippedLink = (store as any).getLink(artifactIds.root, "speculative", "depends_on");
    assert.strictEqual(skippedLink, undefined, "Low confidence edge should be skipped");

    store.close();
  });

  async function createHarness(options: { relationships: any[] }) {
    const tempDir = mkdtempSync(path.join(tmpdir(), "llm-ingestion-it-"));
    tempDirs.push(tempDir);

    const snapshotDir = path.join(tempDir, "snapshots");

    const rootPath = path.join(tempDir, "root.ts");
    const dependentPath = path.join(tempDir, "dependent.ts");
    const speculativePath = path.join(tempDir, "speculative.ts");

    writeFileSync(rootPath, "import './dependent';\n" + "console.log('root');\n");
    writeFileSync(dependentPath, "export const value = 1;\n");
    writeFileSync(speculativePath, "export const maybe = 2;\n");

    const store = new GraphStore({ dbPath: path.join(tempDir, "graph.db") });

    const rootArtifact = store.upsertArtifact({
      id: "root",
      uri: pathToFileURL(rootPath).toString(),
      layer: "code"
    });

    const dependentArtifact = store.upsertArtifact({
      id: "dependent",
      uri: pathToFileURL(dependentPath).toString(),
      layer: "code"
    });

    store.upsertArtifact({
      id: "speculative",
      uri: pathToFileURL(speculativePath).toString(),
      layer: "code"
    });

    const extractor = {
      extractRelationships: async (request: any) => ({
        prompt: request.prompt,
        promptHash: request.prompt.promptHash,
        modelId: "mock-model",
        issuedAt: request.prompt.issuedAt,
        relationships: options.relationships,
        responseText: JSON.stringify({ relationships: options.relationships }),
        usage: undefined
      })
    };

    const logger = { info: () => {}, warn: () => {}, error: () => {} };

    const connection = { console: logger } as any;
    const guard = new ProviderGuard(connection);
    guard.apply({ enableDiagnostics: true, llmProviderMode: "prompt" });

    const orchestrator = new LlmIngestionOrchestrator({
      graphStore: store,
      providerGuard: guard,
      relationshipExtractor: extractor as any,
      storageDirectory: tempDir,
      logger,
      now: () => new Date("2025-10-24T12:00:00.000Z")
    });

    return {
      store,
      orchestrator,
      artifactIds: {
        root: rootArtifact.id,
        dependent: dependentArtifact.id
      },
      snapshotDir
    };
  }
});
