#!/usr/bin/env node
/**
 * Updates rootHash values in fixtures.manifest.json for all fixtures with integrity metadata.
 *
 * Usage:
 *   npm run fixtures:update-hashes          # Update hashes in-place
 *   npm run fixtures:update-hashes -- --dry-run  # Show what would change without writing
 *
 * This script materializes each vendor fixture, computes its integrity digest using the
 * CRLF-normalized hashing algorithm, and updates the manifest if hashes differ.
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";
import process from "node:process";

import {
  BENCHMARK_MANIFEST_SEGMENTS,
  computeIntegrityDigest,
  loadBenchmarkManifest,
  type BenchmarkFixtureDefinition
} from "./benchmark-manifest";
import { materializeFixture } from "./fixtureMaterializer";

const REPO_ROOT = path.resolve(path.join(__dirname, "..", ".."));

interface HashUpdate {
  id: string;
  oldHash: string;
  newHash: string;
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");

  console.log(dryRun ? "=== Dry Run: Fixture Hash Update ===" : "=== Updating Fixture Hashes ===");

  const manifestPath = path.join(REPO_ROOT, ...BENCHMARK_MANIFEST_SEGMENTS);
  const manifestContent = await fs.readFile(manifestPath, "utf8");
  const manifest = JSON.parse(manifestContent) as { fixtures: BenchmarkFixtureDefinition[] };

  const fixtures = await loadBenchmarkManifest(REPO_ROOT);
  const candidates = fixtures.filter(f => f.integrity);

  if (candidates.length === 0) {
    console.log("No fixtures with integrity metadata found.");
    return;
  }

  const updates: HashUpdate[] = [];

  for (const fixture of candidates) {
    console.log(`\nProcessing ${fixture.id}...`);

    const { workspaceRoot, dispose } = await materializeFixture(REPO_ROOT, fixture, {
      workspaceMode: "ephemeral"
    });

    try {
      const digest = await computeIntegrityDigest(REPO_ROOT, fixture, workspaceRoot);
      const currentHash = fixture.integrity!.rootHash;

      if (digest.rootHash !== currentHash) {
        updates.push({
          id: fixture.id,
          oldHash: currentHash,
          newHash: digest.rootHash
        });
        console.log(`  → Hash changed: ${currentHash.slice(0, 12)}... → ${digest.rootHash.slice(0, 12)}...`);
      } else {
        console.log(`  → Hash unchanged (${digest.fileCount} files)`);
      }
    } finally {
      if (dispose) {
        await dispose();
      }
    }
  }

  if (updates.length === 0) {
    console.log("\n✓ All hashes are up-to-date.");
    return;
  }

  console.log(`\n${updates.length} hash(es) need updating:`);
  for (const update of updates) {
    console.log(`  - ${update.id}: ${update.oldHash.slice(0, 16)}... → ${update.newHash.slice(0, 16)}...`);
  }

  if (dryRun) {
    console.log("\nDry run complete. No changes written.");
    return;
  }

  // Apply updates to manifest
  let updatedContent = manifestContent;
  for (const update of updates) {
    updatedContent = updatedContent.replace(
      new RegExp(`"rootHash":\\s*"${update.oldHash}"`, "g"),
      `"rootHash": "${update.newHash}"`
    );
  }

  await fs.writeFile(manifestPath, updatedContent, "utf8");
  console.log(`\n✓ Updated ${manifestPath}`);
}

void main().catch(error => {
  console.error("Failed to update fixture hashes.");
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exit(1);
});
