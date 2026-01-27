#!/usr/bin/env node
/**
 * generate-scip-indexes.ts
 *
 * Generates SCIP indexes for all TypeScript fixtures in the benchmarks folder.
 * This is a prerequisite for using scip-to-expected.ts to generate ground-truth
 * expected.json files from compiler analysis.
 *
 * Usage:
 *   npx tsx scripts/fixture-tools/generate-scip-indexes.ts [--fixture <name>] [--clean]
 *
 * Options:
 *   --fixture, -f   Generate index for a specific fixture only
 *   --clean, -c     Remove existing index.scip files before generating
 *   --dry-run, -n   Show what would be done without doing it
 */

import { execSync } from "node:child_process";
import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const FIXTURES_ROOT = "tests/integration/benchmarks/fixtures/typescript";

interface FixtureInfo {
  name: string;
  path: string;
  hasSrc: boolean;
  hasExistingScip: boolean;
}

/**
 * Parse command line arguments
 */
function parseArgs(): { fixture: string | null; clean: boolean; dryRun: boolean } {
  const args = process.argv.slice(2);
  let fixture: string | null = null;
  let clean = false;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--fixture" || args[i] === "-f") {
      fixture = args[++i];
    } else if (args[i] === "--clean" || args[i] === "-c") {
      clean = true;
    } else if (args[i] === "--dry-run" || args[i] === "-n") {
      dryRun = true;
    } else if (args[i] === "--help" || args[i] === "-h") {
      console.log(`
Usage: npx tsx scripts/fixture-tools/generate-scip-indexes.ts [options]

Options:
  --fixture, -f   Generate index for a specific fixture only
  --clean, -c     Remove existing index.scip files before generating
  --dry-run, -n   Show what would be done without doing it
  --help, -h      Show this help message
`);
      process.exit(0);
    }
  }

  return { fixture, clean, dryRun };
}

/**
 * Find all TypeScript fixtures that have source files
 */
function findTypeScriptFixtures(): FixtureInfo[] {
  const fixturesPath = path.resolve(FIXTURES_ROOT);
  const fixtures: FixtureInfo[] = [];

  if (!existsSync(fixturesPath)) {
    console.error(`Fixtures root not found: ${fixturesPath}`);
    return fixtures;
  }

  for (const entry of readdirSync(fixturesPath)) {
    const entryPath = path.join(fixturesPath, entry);
    if (!statSync(entryPath).isDirectory()) continue;

    const srcPath = path.join(entryPath, "src");
    const hasSrc = existsSync(srcPath) && statSync(srcPath).isDirectory();
    
    // Also check for .ts files directly in the fixture root (for flat fixtures)
    const hasRootTs = readdirSync(entryPath).some(f => f.endsWith(".ts") && !f.endsWith(".d.ts"));
    
    const hasExistingScip = existsSync(path.join(entryPath, "index.scip"));

    if (hasSrc || hasRootTs) {
      fixtures.push({
        name: entry,
        path: entryPath,
        hasSrc: hasSrc || hasRootTs,
        hasExistingScip
      });
    }
  }

  return fixtures;
}

/**
 * Generate SCIP index for a fixture
 */
function generateScipIndex(fixture: FixtureInfo, options: { clean: boolean; dryRun: boolean }): boolean {
  const indexPath = path.join(fixture.path, "index.scip");

  // Clean if requested
  if (options.clean && fixture.hasExistingScip) {
    if (options.dryRun) {
      console.log(`  Would remove: ${indexPath}`);
    } else {
      rmSync(indexPath);
      console.log(`  Removed: ${indexPath}`);
    }
  }

  // Generate new index
  const cmd = `npx scip-typescript index --infer-tsconfig --output index.scip`;
  
  if (options.dryRun) {
    console.log(`  Would run: ${cmd}`);
    console.log(`  In: ${fixture.path}`);
    return true;
  }

  try {
    console.log(`  Generating SCIP index...`);
    execSync(cmd, {
      cwd: fixture.path,
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 60000 // 60 second timeout
    });
    console.log(`  ✓ Created: ${indexPath}`);
    return true;
  } catch (err) {
    const error = err as { message?: string; stderr?: Buffer };
    const stderr = error.stderr?.toString() || error.message || "Unknown error";
    console.error(`  ✗ Failed: ${stderr.split("\n")[0]}`);
    return false;
  }
}

/**
 * Main entry point
 */
function main(): void {
  const options = parseArgs();
  
  console.log("SCIP Index Generator for TypeScript Fixtures");
  console.log("============================================\n");

  const allFixtures = findTypeScriptFixtures();
  
  if (allFixtures.length === 0) {
    console.log("No TypeScript fixtures with source files found.");
    return;
  }

  // Filter if specific fixture requested
  let fixtures = allFixtures;
  if (options.fixture) {
    fixtures = allFixtures.filter(f => f.name === options.fixture);
    if (fixtures.length === 0) {
      console.error(`Fixture not found: ${options.fixture}`);
      console.log(`Available fixtures: ${allFixtures.map(f => f.name).join(", ")}`);
      process.exit(1);
    }
  }

  console.log(`Found ${fixtures.length} fixture(s) to process:\n`);

  let successCount = 0;
  let failCount = 0;

  for (const fixture of fixtures) {
    console.log(`[${fixture.name}]`);
    
    if (!fixture.hasSrc) {
      console.log("  Skipped: No source files (materialization required)");
      continue;
    }

    const success = generateScipIndex(fixture, options);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    console.log();
  }

  console.log("============================================");
  console.log(`Results: ${successCount} succeeded, ${failCount} failed`);
  
  if (failCount > 0) {
    process.exit(1);
  }
}

main();
