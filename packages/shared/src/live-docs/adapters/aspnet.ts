import { promises as fs, statSync } from "node:fs";
import path from "node:path";

import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type { DependencyEntry, SourceAnalysisResult } from "../core";
import type { LanguageAdapter } from "./index";

const SCRIPT_SRC_PATTERN = /<script[^>]*?src\s*=\s*"([^"]+)"[^>]*?>/gi;
const PAGE_DIRECTIVE_PATTERN = /<%@\s+Page[^%]*?(?:CodeFile|CodeBehind)\s*=\s*"([^"]+)"[^%]*?%>/i;
const MARKUP_EXTENSIONS = new Set([".aspx", ".cshtml", ".razor", ".ascx"]);

/** Language adapter for ASP.NET markup files (`.aspx`, `.cshtml`, `.razor`, `.ascx`). Extracts `CodeFile`/`CodeBehind` references and model directives. */
export const aspNetMarkupAdapter: LanguageAdapter = {
  id: "aspnet-markup",
  extensions: [".aspx", ".cshtml", ".razor"],
  async analyze({ absolutePath, workspaceRoot }): Promise<SourceAnalysisResult | null> {
    const content = await fs.readFile(absolutePath, "utf8");
    const dependencies: DependencyEntry[] = [];

    const scriptDependencies = resolveScriptDependencies({
      content,
      absolutePath,
      workspaceRoot
    });
    dependencies.push(...scriptDependencies);

    const codeBehind = await resolveCodeBehindDependency({
      absolutePath,
      workspaceRoot,
      content
    });
    if (codeBehind) {
      dependencies.push(codeBehind);
    }

    return {
      symbols: [],
      dependencies
    };
  }
};

function resolveScriptDependencies(params: {
  content: string;
  absolutePath: string;
  workspaceRoot: string;
}): DependencyEntry[] {
  const matches: DependencyEntry[] = [];
  const sourceDir = path.dirname(params.absolutePath);
  let match: RegExpExecArray | null;

  while ((match = SCRIPT_SRC_PATTERN.exec(params.content)) !== null) {
    const rawSrc = match[1]?.trim();
    if (!rawSrc || rawSrc.startsWith("http://") || rawSrc.startsWith("https://")) {
      continue;
    }

    const resolved = resolveMarkupRelativePath(rawSrc, sourceDir, params.workspaceRoot);
    if (!resolved) {
      continue;
    }

    matches.push({
      specifier: resolved,
      resolvedPath: resolved,
      symbols: [],
      kind: "import"
    });
  }

  SCRIPT_SRC_PATTERN.lastIndex = 0;

  return dedupeDependencies(matches);
}

async function resolveCodeBehindDependency(params: {
  absolutePath: string;
  workspaceRoot: string;
  content: string;
}): Promise<DependencyEntry | undefined> {
  const extension = path.extname(params.absolutePath).toLowerCase();

  if (extension === ".aspx") {
    const match = PAGE_DIRECTIVE_PATTERN.exec(params.content);
    if (match) {
      const relativeFile = match[1]?.trim();
      if (relativeFile) {
        const resolved = resolveMarkupRelativePath(relativeFile, path.dirname(params.absolutePath), params.workspaceRoot);
        if (resolved) {
          return {
            specifier: resolved,
            resolvedPath: resolved,
            symbols: [],
            kind: "import"
          };
        }
      }
    }
  }

  if (extension === ".cshtml" || extension === ".razor") {
    const candidate = `${params.absolutePath}.cs`;
    if (await fileExists(candidate)) {
      const relative = normalizeWorkspacePath(path.relative(params.workspaceRoot, candidate));
      return {
        specifier: relative,
        resolvedPath: relative,
        symbols: [],
        kind: "import"
      };
    }
  }

  return undefined;
}

function resolveMarkupRelativePath(
  rawSpecifier: string,
  sourceDir: string,
  workspaceRoot: string
): string | undefined {
  const normalised = rawSpecifier.replace(/\\/g, "/");
  let candidate: string;

  if (normalised.startsWith("~/")) {
    candidate = path.join(workspaceRoot, normalised.slice(2));
  } else if (normalised.startsWith("/")) {
    candidate = path.join(workspaceRoot, normalised.slice(1));
  } else {
    candidate = path.join(sourceDir, normalised);
  }

  if (!MARKUP_EXTENSIONS.has(path.extname(candidate).toLowerCase()) && !path.extname(candidate)) {
    const withJs = `${candidate}.js`;
    if (fileExistsSync(withJs)) {
      candidate = withJs;
    }
  }

  if (!fileExistsSync(candidate)) {
    return undefined;
  }

  return normalizeWorkspacePath(path.relative(workspaceRoot, candidate));
}

function dedupeDependencies(entries: DependencyEntry[]): DependencyEntry[] {
  const seen = new Map<string, DependencyEntry>();
  for (const entry of entries) {
    if (!seen.has(entry.specifier)) {
      seen.set(entry.specifier, entry);
    }
  }
  return Array.from(seen.values());
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

function fileExistsSync(filePath: string): boolean {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}
