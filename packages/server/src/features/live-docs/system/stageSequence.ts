import * as fs from "node:fs/promises";
import path from "node:path";

import { normalizeWorkspacePath } from "@live-documentation/shared/tooling/pathUtils";

import type { RunAllStageDescriptor, StageSequence, StageSequenceMapEntry } from "./types";
import { includeInComponents } from "./utils";

// ─────────────────────────────────────────────────────────────────────────────
// Stage Sequence Building
// ─────────────────────────────────────────────────────────────────────────────

export function buildStageSequence(stageDescriptors: RunAllStageDescriptor[], stage0PathSet: Set<string>): StageSequence {
  const order: string[] = [];
  const map = new Map<string, StageSequenceMapEntry>();

  for (const descriptor of stageDescriptors) {
    const script = normalizeWorkspacePath(descriptor.script);
    if (!includeInComponents(script, stage0PathSet)) {
      continue;
    }
    if (!map.has(script)) {
      map.set(script, { before: [], after: [] });
      order.push(script);
    }
  }

  for (let index = 0; index < order.length; index += 1) {
    const current = order[index];
    const entry = map.get(current);
    if (!entry) {
      continue;
    }
    if (index > 0) {
      const previous = order[index - 1];
      entry.before.push(previous);
      const previousEntry = map.get(previous);
      if (previousEntry) {
        previousEntry.after.push(current);
      }
    }
  }

  return { order, map };
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage Sequence Edge Building
// ─────────────────────────────────────────────────────────────────────────────

export function buildStageSequenceEdges(args: {
  stageSequence: StageSequence;
  stage0PathSet: Set<string>;
  orchestratorPath?: string;
}): Array<{ from: string; to: string }> {
  if (!args.stageSequence.order.length) {
    return [];
  }

  const edges: Array<{ from: string; to: string }> = [];

  if (args.orchestratorPath && includeInComponents(args.orchestratorPath, args.stage0PathSet)) {
    const first = args.stageSequence.order[0];
    if (first && includeInComponents(first, args.stage0PathSet)) {
      edges.push({ from: args.orchestratorPath, to: first });
    }
  }

  for (const script of args.stageSequence.order) {
    const entry = args.stageSequence.map.get(script);
    if (!entry) {
      continue;
    }
    for (const next of entry.after) {
      if (includeInComponents(next, args.stage0PathSet)) {
        edges.push({ from: script, to: next });
      }
    }
  }

  return edges;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage Descriptor Extraction
// ─────────────────────────────────────────────────────────────────────────────

export async function extractRunAllStageDescriptors(workspaceRoot: string): Promise<RunAllStageDescriptor[]> {
  const runAllPath = path.resolve(workspaceRoot, "scripts", "live-docs", "run-all.ts");

  let content: string;
  try {
    content = await fs.readFile(runAllPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const descriptors: RunAllStageDescriptor[] = [];
  const stageRegex = /label:\s*"([^"]+)"[\s\S]*?script:\s*"([^"]+)"/g;
  for (const match of content.matchAll(stageRegex)) {
    const label = match[1];
    const script = normalizeWorkspacePath(match[2]);
    descriptors.push({ label, script });
  }

  const unique = new Map<string, RunAllStageDescriptor>();
  for (const descriptor of descriptors) {
    if (!unique.has(descriptor.script)) {
      unique.set(descriptor.script, descriptor);
    }
  }

  return Array.from(unique.values());
}
