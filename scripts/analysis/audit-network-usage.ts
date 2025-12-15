#!/usr/bin/env node
/**
 * audit-network-usage.ts — Static analysis for network-related code patterns.
 *
 * This script scans the codebase for any usage of network-related APIs:
 * - `http.request` / `https.request`
 * - `fetch()` / `globalThis.fetch`
 * - `http.createServer` / `https.createServer`
 * - Direct socket access (`net.Socket`, `tls.TLSSocket`)
 *
 * The goal is to provide auditable evidence that Live Documentation only makes
 * network requests through the safeFetch wrapper (which enforces localhost-only).
 *
 * Exit codes:
 * - 0: All network usage is accounted for and safe
 * - 1: Unaccounted network usage detected (requires review)
 *
 * @module
 */

import { globSync } from "glob";
import { promises as fs } from "node:fs";
import * as path from "node:path";

interface NetworkUsage {
  file: string;
  line: number;
  pattern: string;
  context: string;
  verdict: "safe" | "allowed" | "review";
  reason: string;
}

// Patterns to scan for
const NETWORK_PATTERNS = [
  { pattern: /\bfetch\s*\(/g, name: "fetch()" },
  { pattern: /globalThis\.fetch/g, name: "globalThis.fetch" },
  { pattern: /http\.request\s*\(/g, name: "http.request()" },
  { pattern: /https\.request\s*\(/g, name: "https.request()" },
  { pattern: /http\.get\s*\(/g, name: "http.get()" },
  { pattern: /https\.get\s*\(/g, name: "https.get()" },
  { pattern: /createServer\s*\(/g, name: "createServer()" },
  { pattern: /new\s+(?:net\.)?Socket\s*\(/g, name: "net.Socket()" },
  { pattern: /new\s+(?:tls\.)?TLSSocket\s*\(/g, name: "tls.TLSSocket()" },
  { pattern: /import.*from\s+["']node-fetch["']/g, name: "node-fetch import" },
  { pattern: /import.*from\s+["']axios["']/g, name: "axios import" },
  { pattern: /import.*from\s+["']got["']/g, name: "got import" },
  { pattern: /require\s*\(\s*["']node-fetch["']\s*\)/g, name: "node-fetch require" },
  { pattern: /require\s*\(\s*["']axios["']\s*\)/g, name: "axios require" },
  { pattern: /require\s*\(\s*["']got["']\s*\)/g, name: "got require" },
];

// Known-safe patterns (with reasons)
const SAFE_PATTERNS: Array<{
  filePattern: RegExp;
  contextPattern: RegExp;
  reason: string;
}> = [
  // safeFetch wrapper itself — all patterns in this file are definitional
  {
    filePattern: /safeFetch\.ts$/,
    contextPattern: /./,
    reason: "Core safeFetch wrapper — this IS the enforcement point"
  },
  // Tests for safeFetch (mocking and assertions)
  {
    filePattern: /safeFetch\.test\.ts$/,
    contextPattern: /./,
    reason: "Tests for safeFetch wrapper"
  },
  // The audit script itself (pattern definitions, not actual network calls)
  {
    filePattern: /audit-network-usage\.ts$/,
    contextPattern: /./,
    reason: "Audit script — pattern definitions, not actual network calls"
  },
  // Tests mocking fetch
  {
    filePattern: /\.test\.ts$/,
    contextPattern: /globalThis\.fetch\s*=/,
    reason: "Test mocking fetch"
  },
  {
    filePattern: /\.test\.ts$/,
    contextPattern: /vi\.fn\(\)\.mockResolvedValue/,
    reason: "Vitest mock setup"
  },
  // Browser-side fetch (runs in browser, not Node)
  {
    filePattern: /explorer[/\\]client[/\\]/,
    contextPattern: /./,
    reason: "Browser-side code (runs in user's browser, not extension process)"
  },
  {
    filePattern: /staticBuilder\.ts$/,
    contextPattern: /const response = await fetch\(dataUrl/,
    reason: "Browser bundle code (runs in user's browser during static site preview)"
  },
  // Local dev server (createServer for localhost visualization)
  {
    filePattern: /visualize.*\.ts$/,
    contextPattern: /./,
    reason: "Local dev server for visualization (localhost only, user-initiated)"
  },
  {
    filePattern: /explorer[/\\]server[/\\]/,
    contextPattern: /./,
    reason: "Local dev server for explorer (localhost only, user-initiated)"
  },
  // ollamaClient using safeFetch
  {
    filePattern: /ollamaClient\.ts$/,
    contextPattern: /safeFetch\s*\(/,
    reason: "Uses safeFetch wrapper (localhost-only enforced)"
  },
];

// Allowed but flagged patterns
const ALLOWED_PATTERNS: Array<{
  filePattern: RegExp;
  contextPattern: RegExp;
  reason: string;
}> = [
  // Test fixtures (not production code)
  {
    filePattern: /fixtures?\//,
    contextPattern: /./,
    reason: "Test fixture — not production code"
  },
  // Chat history / documentation
  {
    filePattern: /ChatHistory\//,
    contextPattern: /./,
    reason: "Chat history documentation — not code"
  },
];

async function scanFile(filePath: string): Promise<NetworkUsage[]> {
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n");
  const usages: NetworkUsage[] = [];

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    for (const { pattern, name } of NETWORK_PATTERNS) {
      // Reset regex state
      pattern.lastIndex = 0;

      if (pattern.test(line)) {
        // Determine verdict
        let verdict: NetworkUsage["verdict"] = "review";
        let reason = "Requires manual review";

        // Check if it's a known-safe pattern
        for (const safe of SAFE_PATTERNS) {
          if (safe.filePattern.test(filePath) && safe.contextPattern.test(line)) {
            verdict = "safe";
            reason = safe.reason;
            break;
          }
        }

        // Check if it's allowed but flagged
        if (verdict === "review") {
          for (const allowed of ALLOWED_PATTERNS) {
            if (allowed.filePattern.test(filePath) && allowed.contextPattern.test(line)) {
              verdict = "allowed";
              reason = allowed.reason;
              break;
            }
          }
        }

        usages.push({
          file: filePath,
          line: lineNum + 1,
          pattern: name,
          context: line.trim().substring(0, 100),
          verdict,
          reason
        });
      }
    }
  }

  return usages;
}

async function main(): Promise<void> {
  console.log("🔍 Network Usage Audit for Live Documentation\n");
  console.log("Scanning for network-related patterns in TypeScript source...\n");

  const workspaceRoot = process.cwd();
  const patterns = [
    "packages/**/*.ts",
    "scripts/**/*.ts",
    "tests/**/*.ts"
  ];

  const excludePatterns = [
    "**/node_modules/**",
    "**/dist/**",
    "**/*.d.ts"
  ];

  const allUsages: NetworkUsage[] = [];

  for (const pattern of patterns) {
    const files = globSync(pattern, {
      cwd: workspaceRoot,
      ignore: excludePatterns,
      absolute: true
    });

    for (const file of files) {
      const usages = await scanFile(file);
      allUsages.push(...usages);
    }
  }

  // Group by verdict
  const safe = allUsages.filter(u => u.verdict === "safe");
  const allowed = allUsages.filter(u => u.verdict === "allowed");
  const review = allUsages.filter(u => u.verdict === "review");

  // Print results
  console.log("=" .repeat(80));
  console.log("RESULTS SUMMARY");
  console.log("=" .repeat(80));
  console.log(`✅ Safe (localhost-only enforced): ${safe.length}`);
  console.log(`📋 Allowed (non-production code): ${allowed.length}`);
  console.log(`⚠️  Requires review: ${review.length}`);
  console.log();

  if (safe.length > 0) {
    console.log("-".repeat(80));
    console.log("✅ SAFE NETWORK USAGE (protected by safeFetch or browser-only):");
    console.log("-".repeat(80));
    for (const usage of safe) {
      const relativePath = path.relative(workspaceRoot, usage.file);
      console.log(`  ${relativePath}:${usage.line}`);
      console.log(`    Pattern: ${usage.pattern}`);
      console.log(`    Reason: ${usage.reason}`);
      console.log();
    }
  }

  if (allowed.length > 0) {
    console.log("-".repeat(80));
    console.log("📋 ALLOWED (non-production code):");
    console.log("-".repeat(80));
    for (const usage of allowed) {
      const relativePath = path.relative(workspaceRoot, usage.file);
      console.log(`  ${relativePath}:${usage.line}`);
      console.log(`    Pattern: ${usage.pattern}`);
      console.log(`    Reason: ${usage.reason}`);
      console.log();
    }
  }

  if (review.length > 0) {
    console.log("-".repeat(80));
    console.log("⚠️  REQUIRES REVIEW:");
    console.log("-".repeat(80));
    for (const usage of review) {
      const relativePath = path.relative(workspaceRoot, usage.file);
      console.log(`  ${relativePath}:${usage.line}`);
      console.log(`    Pattern: ${usage.pattern}`);
      console.log(`    Context: ${usage.context}`);
      console.log();
    }
  }

  console.log("=" .repeat(80));

  if (review.length > 0) {
    console.log("\n❌ AUDIT FAILED: Unaccounted network usage detected.");
    console.log("   Please review the flagged patterns and either:");
    console.log("   1. Migrate to safeFetch() for localhost-only access");
    console.log("   2. Add to SAFE_PATTERNS if genuinely safe");
    console.log("   3. Add to ALLOWED_PATTERNS if non-production");
    process.exit(1);
  } else {
    console.log("\n✅ AUDIT PASSED: All network usage is accounted for.");
    console.log("   Live Documentation enforces localhost-only network access.");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Audit failed with error:", error);
  process.exit(1);
});
