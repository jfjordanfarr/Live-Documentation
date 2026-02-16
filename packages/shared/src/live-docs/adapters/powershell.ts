import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

import type { LanguageAdapter } from "./index";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type {
  DependencyEntry,
  PublicSymbolEntry,
  SourceAnalysisResult,
  SymbolDocumentationParameter
} from "../core";

const execFileAsync = promisify(execFile);
const RUNTIME_CANDIDATES = ["pwsh", "powershell"] as const;

interface PowerShellFunctionInfo {
  Name: string;
  Line?: number;
  Column?: number;
  Help?: PowerShellFunctionHelp;
}

interface PowerShellDotSourceInfo {
  Raw?: string;
  Resolved?: string;
}

interface PowerShellFunctionHelp {
  Synopsis?: string;
  Description?: string;
  Parameters?: PowerShellParameterHelp[];
}

interface PowerShellParameterHelp {
  Name?: string;
  Description?: string;
}

interface PowerShellExtractionPayload {
  Functions?: PowerShellFunctionInfo[];
  DotSources?: PowerShellDotSourceInfo[];
  ImportModules?: string[];
  UsingModules?: string[];
  RequiresModules?: string[];
  ExportedFunctions?: string[];
  Errors?: string[];
}

const cache = new Map<string, Promise<PowerShellExtractionPayload | null>>();

/** Language adapter for PowerShell (`.ps1`, `.psm1`, `.psd1`). Extracts functions, cmdlets, aliases, and dot-source/`Import-Module` dependencies. */
export const powershellAdapter: LanguageAdapter = {
  id: "powershell-basic",
  extensions: [".ps1", ".psm1", ".psd1"],
  async analyze({ absolutePath, workspaceRoot }): Promise<SourceAnalysisResult | null> {
    const extension = path.extname(absolutePath).toLowerCase();

    if (extension === ".psd1") {
      return {
        symbols: [],
        dependencies: []
      };
    }

    const payload = await parsePowerShellFile(absolutePath, workspaceRoot);
    if (!payload) {
      return {
        symbols: [],
        dependencies: []
      };
    }


    const functions = Array.isArray(payload.Functions) ? payload.Functions : [];
    const dotSources = Array.isArray(payload.DotSources) ? payload.DotSources : [];
    const importModules = Array.isArray(payload.ImportModules) ? payload.ImportModules : [];
    const usingModules = Array.isArray(payload.UsingModules) ? payload.UsingModules : [];
    const requiresModules = Array.isArray(payload.RequiresModules) ? payload.RequiresModules : [];
    const exportedFunctions = Array.isArray(payload.ExportedFunctions) ? payload.ExportedFunctions : [];

    const exportedSymbols = new Set(exportedFunctions.map((entry) => entry.toLowerCase()));

    const symbols: PublicSymbolEntry[] = functions
      .filter((fn) => {
        if (exportedSymbols.size === 0) {
          return true;
        }
        if (exportedSymbols.has("*")) {
          return true;
        }
        return exportedSymbols.has((fn.Name ?? "").toLowerCase());
      })
      .map((fn): PublicSymbolEntry => ({
        name: fn.Name ?? "(anonymous)",
        kind: "function",
        location: fn.Line && fn.Column
          ? { line: fn.Line, character: fn.Column }
          : undefined,
        documentation: toSymbolDocumentation(fn.Help)
      }));

    const dependencyMap = new Map<string, DependencyEntry>();

    for (const importName of importModules) {
      addDependency(dependencyMap, importName, "import");
    }

    for (const usingName of usingModules) {
      addDependency(dependencyMap, usingName, "import");
    }

    for (const requirement of requiresModules) {
      addDependency(dependencyMap, requirement, "import");
    }

    for (const dotSource of dotSources) {
      const specifier = deriveDotSourceSpecifier(dotSource, workspaceRoot, absolutePath);
      addDependency(dependencyMap, specifier.specifier, "import", specifier.resolvedPath);
    }

    const dependencies = Array.from(dependencyMap.values());

    if (symbols.length === 0 && dependencies.length === 0) {
      return {
        symbols: [],
        dependencies: []
      };
    }

    return {
      symbols,
      dependencies
    };
  }
};

function addDependency(
  map: Map<string, DependencyEntry>,
  specifierRaw: string | undefined,
  kind: "import",
  resolvedPath?: string
): void {
  if (!specifierRaw) {
    return;
  }

  const specifier = specifierRaw.trim();
  if (!specifier) {
    return;
  }

  if (map.has(specifier)) {
    const existing = map.get(specifier);
    if (existing && !existing.resolvedPath && resolvedPath) {
      existing.resolvedPath = resolvedPath;
    }
    return;
  }

  map.set(specifier, {
    specifier,
    resolvedPath,
    symbols: [],
    kind
  });
}

function toSymbolDocumentation(help?: PowerShellFunctionHelp): PublicSymbolEntry["documentation"] {
  if (!help) {
    return undefined;
  }

  const summary = normalizeHelpText(help.Synopsis);
  const remarks = normalizeHelpText(help.Description);
  const parameters = Array.isArray(help.Parameters)
    ? help.Parameters
        .map((parameter) => toDocumentationParameter(parameter))
        .filter((parameter): parameter is SymbolDocumentationParameter => parameter !== undefined)
    : undefined;

  const hasParameters = parameters && parameters.length > 0;

  if (!summary && !remarks && !hasParameters) {
    return undefined;
  }

  return {
    source: "comment-help",
    summary: summary ?? undefined,
    remarks: remarks ?? undefined,
    parameters: hasParameters ? parameters : undefined
  };
}

function toDocumentationParameter(parameter?: PowerShellParameterHelp): SymbolDocumentationParameter | undefined {
  if (!parameter) {
    return undefined;
  }

  const name = normalizeHelpName(parameter.Name);
  const description = normalizeHelpText(parameter.Description);

  if (!name) {
    return undefined;
  }

  if (!description) {
    return { name };
  }

  return {
    name,
    description
  };
}

function normalizeHelpText(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.replace(/\r?\n/g, "\n").trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeHelpName(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function deriveDotSourceSpecifier(
  info: PowerShellDotSourceInfo,
  workspaceRoot: string,
  sourceAbsolutePath: string
): { specifier: string; resolvedPath?: string } {
  const resolved = info.Resolved;
  if (resolved) {
    const normalized = normalizeWithinWorkspace(resolved, workspaceRoot);
    if (normalized) {
      return {
        specifier: normalized,
        resolvedPath: normalized
      };
    }
  }

  if (info.Raw) {
    const fromSource = resolveFromSource(info.Raw, sourceAbsolutePath, workspaceRoot);
    if (fromSource) {
      return fromSource;
    }
    return { specifier: info.Raw };
  }

  return { specifier: "(unknown dot-source)" };
}

function resolveFromSource(
  raw: string,
  sourceAbsolutePath: string,
  workspaceRoot: string
): { specifier: string; resolvedPath?: string } | undefined {
  if (!raw.startsWith(".")) {
    return undefined;
  }

  const baseDir = path.dirname(sourceAbsolutePath);
  const candidate = path.resolve(baseDir, raw);
  const normalized = normalizeWithinWorkspace(candidate, workspaceRoot);
  if (normalized) {
    return {
      specifier: normalized,
      resolvedPath: normalized
    };
  }

  return undefined;
}

function normalizeWithinWorkspace(candidate: string, workspaceRoot: string): string | undefined {
  try {
    const resolved = path.resolve(candidate);
    const relative = path.relative(workspaceRoot, resolved);
    if (relative && !relative.startsWith("..")) {
      return normalizeWorkspacePath(relative);
    }
  } catch {
    // ignore normalization failures
  }
  return undefined;
}

async function parsePowerShellFile(
  absolutePath: string,
  workspaceRoot: string
): Promise<PowerShellExtractionPayload | null> {
  const cached = cache.get(absolutePath);
  if (cached) {
    return cached;
  }

  const pending = invokePowerShellEmitter(absolutePath, workspaceRoot).catch((error) => {
    cache.delete(absolutePath);
    throw error;
  });

  cache.set(absolutePath, pending);
  return pending;
}

async function invokePowerShellEmitter(
  absolutePath: string,
  workspaceRoot: string
): Promise<PowerShellExtractionPayload | null> {
  const emitterPath = path.join(workspaceRoot, "scripts", "powershell", "emit-ast.ps1");
  for (const candidate of RUNTIME_CANDIDATES) {
    try {
      const { stdout } = await execFileAsync(candidate, [
        "-NoLogo",
        "-NonInteractive",
        "-NoProfile",
        "-File",
        emitterPath,
        "-Path",
        absolutePath
      ], {
        windowsHide: true
      });

      const trimmed = stdout?.trim();
      if (!trimmed) {
        return null;
      }
      try {
        const parsed = JSON.parse(trimmed) as PowerShellExtractionPayload;
        return parsed;
      } catch (parseError) {
        throw enrichPowerShellError(parseError, absolutePath, candidate);
      }
    } catch (error: unknown) {
      if (isMissingRuntimeError(error)) {
        continue;
      }
      throw enrichPowerShellError(error, absolutePath, candidate);
    }
  }

  throw new Error(
    "PowerShell runtime not found. Install PowerShell 7 (pwsh) or ensure powershell.exe is available in PATH."
  );
}

function isMissingRuntimeError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && (error as NodeJS.ErrnoException).code === "ENOENT");
}

function enrichPowerShellError(error: unknown, absolutePath: string, runtime: string): Error {
  if (error instanceof Error) {
    const message = [
      `Failed to analyse PowerShell file: ${absolutePath}`,
      `Runtime: ${runtime}`,
      error.message
    ].join("\n");
    return new Error(message, { cause: error });
  }
  return new Error(`Failed to analyse PowerShell file: ${absolutePath}`);
}
