import { glob } from "glob";
import * as fs from "node:fs/promises";
import path from "node:path";

import { type LiveDocumentationConfig } from "@live-documentation/shared/config/liveDocumentationConfig";
import { directoryExists } from "@live-documentation/shared/live-docs/core";
import {
  renderBeginMarker,
  renderEndMarker
} from "@live-documentation/shared/live-docs/markdown";
import type {
  Stage0Doc,
  Stage0DocLogger,
  Stage0Symbol
} from "@live-documentation/shared/live-docs/types";
import { normalizeWorkspacePath } from "@live-documentation/shared/tooling/pathUtils";

interface LoadStage0DocsArgs {
  workspaceRoot: string;
  config: LiveDocumentationConfig;
  logger?: Stage0DocLogger;
}

interface ParseStage0DocArgs {
  content: string;
  absolutePath: string;
  relativeDocPath: string;
  stage0Root: string;
  docExtension: string;
  logger?: Stage0DocLogger;
}

export async function loadStage0Docs(args: LoadStage0DocsArgs): Promise<Stage0Doc[]> {
  const stage0Root = path.resolve(args.workspaceRoot, args.config.root, args.config.baseLayer);
  const docExtension = args.config.extension;
  const exists = await directoryExists(stage0Root);
  if (!exists) {
    return [];
  }

  const files = await glob(`**/*${docExtension}`, {
    cwd: stage0Root,
    absolute: true,
    nodir: true,
    dot: false,
    windowsPathsNoEscape: true
  });

  files.sort();

  const stage0Docs: Stage0Doc[] = [];
  for (const absolute of files) {
    const relative = normalizeWorkspacePath(path.relative(args.workspaceRoot, absolute));
    const content = await fs.readFile(absolute, "utf8");
    const parsed = parseStage0Doc({
      content,
      absolutePath: absolute,
      relativeDocPath: relative,
      stage0Root,
      docExtension,
      logger: args.logger
    });
    if (parsed) {
      stage0Docs.push(parsed);
    }
  }

  return stage0Docs;
}

function parseStage0Doc(args: ParseStage0DocArgs): Stage0Doc | undefined {
  const metadataBlock = extractSection(args.content, "Metadata");
  if (!metadataBlock) {
    args.logger?.warn?.(`Missing metadata block in ${args.relativeDocPath}`);
    return undefined;
  }

  const metadataEntries = parseMetadataLines(metadataBlock);
  const sourcePath = metadataEntries.get("Code Path");
  const archetype = metadataEntries.get("Archetype") ?? "implementation";

  if (!sourcePath) {
    args.logger?.warn?.(`Stage-0 doc ${args.relativeDocPath} is missing Code Path metadata.`);
    return undefined;
  }

  const normalizedSourcePath = normalizeWorkspacePath(sourcePath);

  const dependenciesBlock = extractGeneratedSection(args.content, "Dependencies");
  const dependencyPaths = dependenciesBlock
    ? parseDependencyLinks({
        block: dependenciesBlock,
        docAbsolutePath: args.absolutePath,
        stage0Root: args.stage0Root,
        docExtension: args.docExtension
      })
    : { stage0Paths: [], externalModules: [] };

  const publicSymbolsBlock = extractGeneratedSection(args.content, "Public Symbols");
  const publicSymbols = publicSymbolsBlock ? parsePublicSymbols(publicSymbolsBlock) : [];

  return {
    sourcePath: normalizedSourcePath,
    docAbsolutePath: args.absolutePath,
    docRelativePath: args.relativeDocPath,
    archetype,
    dependencies: dependencyPaths.stage0Paths,
    externalModules: dependencyPaths.externalModules,
    publicSymbols
  };
}

function extractSection(content: string, heading: string): string | undefined {
  const headingPattern = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "m");
  const match = content.match(headingPattern);
  if (!match || match.index === undefined) {
    return undefined;
  }

  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const nextHeading = rest.search(/^##\s+/m);
  const endIndex = nextHeading === -1 ? content.length : start + nextHeading;
  return content.slice(start, endIndex).trim();
}

function extractGeneratedSection(content: string, name: string): string | undefined {
  const begin = renderBeginMarker(name);
  const end = renderEndMarker(name);
  const beginIndex = content.indexOf(begin);
  if (beginIndex === -1) {
    return undefined;
  }
  const start = beginIndex + begin.length;
  const endIndex = content.indexOf(end, start);
  if (endIndex === -1) {
    return undefined;
  }
  return content.slice(start, endIndex).trim();
}

function parseMetadataLines(block: string): Map<string, string> {
  const entries = new Map<string, string>();
  const lines = block.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("- ")) {
      continue;
    }
    const separatorIndex = trimmed.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }
    const key = trimmed.slice(2, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key) {
      entries.set(key, value);
    }
  }
  return entries;
}

function parseDependencyLinks(args: {
  block: string;
  docAbsolutePath: string;
  stage0Root: string;
  docExtension: string;
}): { stage0Paths: string[]; externalModules: string[] } {
  // Use arrays to preserve symbol-level multiplicity (MEME-style: 2 symbols = 2 edges)
  const stage0Paths: string[] = [];
  const externalModules = new Set<string>();

  const lines = args.block.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("-")) {
      continue;
    }

    const linkMatch = trimmed.match(/\(([^)#]+)(#[^)]+)?\)/);
    if (linkMatch) {
      const reference = linkMatch[1];
      if (reference.toLowerCase().endsWith(args.docExtension.toLowerCase())) {
        const targetAbsolute = path.resolve(path.dirname(args.docAbsolutePath), reference);
        if (targetAbsolute.startsWith(args.stage0Root)) {
          const stage0Relative = targetAbsolute.slice(args.stage0Root.length + 1).replace(/\\/g, "/");
          const sourcePath = stage0Relative.slice(0, -args.docExtension.length);
          // Push instead of add — allows duplicates for symbol-level edge counting
          stage0Paths.push(normalizeWorkspacePath(sourcePath));
          continue;
        }
      }
    }

    const codeMatch = trimmed.match(/`([^`]+)`/);
    if (codeMatch) {
      externalModules.add(codeMatch[1]);
    }
  }

  // Sort but preserve duplicates for proper edge weight computation
  return {
    stage0Paths: stage0Paths.sort(),
    externalModules: Array.from(externalModules).sort()
  };
}

function parsePublicSymbols(block: string): Stage0Symbol[] {
  const symbols: Stage0Symbol[] = [];
  const lines = block.split(/\r?\n/);
  let current: Stage0Symbol | undefined;
  for (const line of lines) {
    if (line.startsWith("#### ")) {
      if (current) {
        symbols.push(current);
      }
      const nameMatch = line.match(/`([^`]+)`/);
      current = {
        name: nameMatch ? nameMatch[1] : line.slice(5).trim(),
        type: "symbol"
      };
      continue;
    }

    if (!current) {
      continue;
    }

    const typeMatch = line.match(/-\s+Type:\s+(.+)/);
    if (typeMatch) {
      current.type = typeMatch[1].trim();
    }
  }

  if (current) {
    symbols.push(current);
  }

  return symbols;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
