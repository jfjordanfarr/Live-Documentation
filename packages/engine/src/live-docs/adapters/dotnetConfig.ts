/**
 * .NET configuration files (`Web.config`, `App.config`).
 *
 * A configuration file's public symbols are the names code reaches into it by:
 * appSettings keys, connection string names, WCF client endpoint names and WCF
 * service names. Its dependencies are the workspace types its endpoints and
 * services name through `contract` and `service name`.
 */
import { promises as fs } from "node:fs";

import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult } from "../core";
import { resolveWorkspaceTypes } from "./csharp";
import type { LanguageAdapter } from "./index";

const APP_SETTING_PATTERN       = /<add\b[^>]*?\bkey\s*=\s*"([^"]+)"[^>]*?\bvalue\s*=/giu;
const CONNECTION_STRING_PATTERN = /<add\b[^>]*?\bname\s*=\s*"([^"]+)"[^>]*?\bconnectionString\s*=/giu;
const ENDPOINT_PATTERN          = /<endpoint\b([^>]*)>/giu;
const SERVICE_PATTERN           = /<service\b[^>]*?\bname\s*=\s*"([^"]+)"/giu;

function attribute(fragment: string, name: string): string | undefined {
  const match = new RegExp(`\\b${name}\\s*=\\s*"([^"]+)"`, "iu").exec(fragment);
  return match?.[1];
}

function allMatches(pattern: RegExp, content: string): RegExpExecArray[] {
  const matches: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) matches.push(match);
  pattern.lastIndex = 0;
  return matches;
}

/** Language adapter for `.config` files: configuration names as symbols, contract and service types as dependencies. */
export const dotnetConfigAdapter: LanguageAdapter = {
  id:         "dotnet-config",
  extensions: [".config"],
  async analyze({ absolutePath, workspaceRoot, fileIndex }): Promise<SourceAnalysisResult | null> {
    const content = await fs.readFile(absolutePath, "utf8");
    const symbols: PublicSymbolEntry[] = [];
    const seen    = new Set<string>();
    const publish = (name: string, kind: string, index: number) => {
      const key = `${kind}:${name}`;
      if (seen.has(key)) return;
      seen.add(key);
      const line = content.slice(0, index).split("\n").length;
      symbols.push({ name, kind, location: { line, character: 1 } });
    };

    for (const match of allMatches(APP_SETTING_PATTERN, content))       publish(match[1], "setting", match.index);
    for (const match of allMatches(CONNECTION_STRING_PATTERN, content)) publish(match[1], "connection-string", match.index);

    const typeNames = new Set<string>();
    for (const match of allMatches(ENDPOINT_PATTERN, content)) {
      const name     = attribute(match[1], "name");
      const contract = attribute(match[1], "contract");
      if (name) publish(name, "endpoint", match.index);
      if (contract) typeNames.add(contract);
    }
    for (const match of allMatches(SERVICE_PATTERN, content)) {
      publish(match[1], "service", match.index);
      typeNames.add(match[1]);
    }

    const byFile = new Map<string, Set<string>>();
    for (const typeName of typeNames) {
      for (const target of await resolveWorkspaceTypes(workspaceRoot, fileIndex, typeName)) {
        const names = byFile.get(target.file) ?? new Set<string>();
        names.add(target.name);
        byFile.set(target.file, names);
      }
    }
    const dependencies: DependencyEntry[] = Array.from(byFile.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([file, names]) => ({ specifier: file, resolvedPath: file, symbols: Array.from(names).sort(), kind: "import" as const }));

    symbols.sort((left, right) => left.location!.line - right.location!.line || left.name.localeCompare(right.name));
    return { symbols, dependencies };
  }
};
