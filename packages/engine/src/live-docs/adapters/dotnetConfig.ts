/**
 * .NET configuration files (`Web.config`, `App.config`, `packages.config`).
 *
 * A configuration file's public symbols are the names code reaches into it by:
 * appSettings keys, connection string names, WCF client endpoint names and WCF
 * service names, and the addresses its services listen on. Its dependencies
 * are the workspace types its endpoints and services name through `contract`
 * and `service name`, and, observed from configuration, the file that listens
 * on the address each client endpoint points at. A `packages.config` lists the
 * packages the project stands on.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult, WorkspaceSymbolIndex } from "../core";
import { ADDRESS_KIND } from "../openings";
import { resolveWorkspaceTypes } from "./csharp";
import type { LanguageAdapter } from "./index";

const TAG_PATTERN = /<(\/?)([A-Za-z_][\w.:-]*)\b([^>]*?)(\/?)>/gu;

function attribute(fragment: string, name: string): string | undefined {
  const match = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "iu").exec(fragment);
  return match ? (match[1] ?? match[2]) : undefined;
}

/** One element of the file with the elements above it, in document order. */
interface Element {
  name: string;
  attributes: string;
  index: number;
  ancestors: string[];
}

/** Walks the elements of the file, keeping the names of the elements each one sits under. */
function elements(content: string): Element[] {
  const found: Element[] = [];
  const stack: string[] = [];
  for (const match of content.matchAll(TAG_PATTERN)) {
    const [, closing, name, attributes, selfClosing] = match;
    if (closing) {
      const at = stack.lastIndexOf(name);
      if (at !== -1) {
        stack.length = at;
      }
      continue;
    }
    found.push({ name, attributes, index: match.index ?? 0, ancestors: [...stack] });
    if (!selfClosing) {
      stack.push(name);
    }
  }
  return found;
}

/** Joins a service endpoint's address to its host's base address when the address is relative. */
function absoluteAddress(address: string, base: string | undefined): string | undefined {
  if (/^[a-z][a-z0-9+.-]*:\/\//iu.test(address)) {
    return address;
  }
  if (!base) {
    return undefined;
  }
  const trimmed = base.replace(/\/+$/u, "");
  return address ? `${trimmed}/${address.replace(/^\/+/u, "")}` : trimmed;
}

/** Language adapter for `.config` files: configuration names and service addresses as symbols; contracts, services and the files behind client addresses as dependencies. */
export const dotnetConfigAdapter: LanguageAdapter = {
  id:         "dotnet-config",
  extensions: [".config"],
  async analyze({ absolutePath, workspaceRoot, fileIndex, symbolIndex }): Promise<SourceAnalysisResult | null> {
    const content = await fs.readFile(absolutePath, "utf8");
    const thisFile = normalizeWorkspacePath(path.relative(workspaceRoot, absolutePath));
    const symbols: PublicSymbolEntry[] = [];
    const seen    = new Set<string>();
    const publish = (name: string, kind: string, index: number) => {
      const key = `${kind}:${name}`;
      if (seen.has(key)) return;
      seen.add(key);
      const line = content.slice(0, index).split("\n").length;
      symbols.push({ name, kind, location: { line, character: 1 } });
    };

    const typeNames       = new Set<string>();
    const clientAddresses = new Set<string>();
    const packages: DependencyEntry[] = [];
    let baseAddress: string | undefined;

    for (const element of elements(content)) {
      const under = (name: string) => element.ancestors.includes(name);
      switch (element.name) {
        case "add": {
          if (under("appSettings") && attribute(element.attributes, "key") !== undefined && attribute(element.attributes, "value") !== undefined) {
            publish(attribute(element.attributes, "key")!, "setting", element.index);
          } else if (under("connectionStrings") && attribute(element.attributes, "name") !== undefined && attribute(element.attributes, "connectionString") !== undefined) {
            publish(attribute(element.attributes, "name")!, "connection-string", element.index);
          } else if (under("baseAddresses") && attribute(element.attributes, "baseAddress")) {
            baseAddress = attribute(element.attributes, "baseAddress");
          }
          break;
        }
        case "service": {
          const name = attribute(element.attributes, "name");
          if (name && under("services")) {
            publish(name, "service", element.index);
            typeNames.add(name);
            baseAddress = undefined;
          }
          break;
        }
        case "endpoint": {
          const name     = attribute(element.attributes, "name");
          const address  = attribute(element.attributes, "address");
          const contract = attribute(element.attributes, "contract");
          if (contract) typeNames.add(contract);
          if (under("client")) {
            if (name) publish(name, "endpoint", element.index);
            if (address && /^[a-z][a-z0-9+.-]*:\/\//iu.test(address)) clientAddresses.add(address);
          } else if (under("service") && address !== undefined) {
            const listening = absoluteAddress(address, baseAddress);
            if (listening) publish(listening, ADDRESS_KIND, element.index);
          }
          break;
        }
        case "package": {
          const id      = attribute(element.attributes, "id");
          const version = attribute(element.attributes, "version");
          if (id && under("packages")) {
            packages.push({ specifier: version ? `${id}@${version}` : id, symbols: [], kind: "import" });
          }
          break;
        }
        default:
          break;
      }
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

    dependencies.push(...listenersOf(clientAddresses, thisFile, symbolIndex));
    dependencies.push(...packages.sort((left, right) => left.specifier.localeCompare(right.specifier)));

    symbols.sort((left, right) => left.location!.line - right.location!.line || left.name.localeCompare(right.name));
    return { symbols, dependencies };
  }
};

/** One dependency per file that listens on an address a client endpoint points at, and one external entry per address nothing listens on. */
function listenersOf(addresses: Set<string>, thisFile: string, symbolIndex: WorkspaceSymbolIndex | undefined): DependencyEntry[] {
  const byFile = new Map<string, Set<string>>();
  const unresolved: string[] = [];
  for (const address of Array.from(addresses).sort()) {
    const listeners = (symbolIndex?.get(address) ?? []).filter((location) => location.kind === ADDRESS_KIND && location.sourcePath !== thisFile);
    if (listeners.length === 0) {
      unresolved.push(address);
      continue;
    }
    for (const listener of listeners) {
      const names = byFile.get(listener.sourcePath) ?? new Set<string>();
      names.add(address);
      byFile.set(listener.sourcePath, names);
    }
  }
  const dependencies: DependencyEntry[] = Array.from(byFile.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([file, names]) => ({ specifier: file, resolvedPath: file, symbols: Array.from(names).sort(), kind: "import" as const, basis: "configuration" as const }));
  for (const address of unresolved) {
    dependencies.push({ specifier: address, symbols: [], kind: "import", basis: "configuration" });
  }
  return dependencies;
}
