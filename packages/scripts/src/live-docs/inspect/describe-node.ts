/**
 * Node description utilities for output formatting.
 *
 * Provides functions to build descriptors for nodes and their symbols,
 * used by the emit-result modules for human-readable and JSON output.
 *
 * @module inspect/describe-node
 */

import { symbolName } from "@live-documentation/engine/live-docs/document";
import type { GraphFile, LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

import type { NodeDescriptor, SymbolDescriptor, SymbolParameterDescriptor } from "./types";

/**
 * Creates a descriptor for a node in the graph.
 *
 * @param graph - The Live Doc graph
 * @param codePath - The code path of the node
 * @param verbose - If true, includes full symbol lists
 * @returns Node descriptor with optional symbol information
 */
export function describeNode(
  graph: LiveDocGraph,
  codePath: string,
  verbose: boolean = false
): NodeDescriptor {
  const file = graph.files[codePath];
  if (!file) {
    return { codePath };
  }

  // In slim mode (default), omit symbol lists for compact output
  if (!verbose) {
    return {
      codePath: file.codePath,
      docPath: file.docPath
    };
  }

  const symbols = buildSymbolDescriptors(file);
  return {
    codePath: file.codePath,
    docPath: file.docPath,
    symbols: symbols.length > 0 ? symbols : undefined
  };
}

/**
 * Builds symbol descriptors from a file's public symbols: one per name, with the
 * Summary, Remarks and Parameters sections of the first symbol that carries it.
 *
 * @param file - The file of the graph
 * @returns Array of symbol descriptors with documentation
 */
export function buildSymbolDescriptors(file: GraphFile): SymbolDescriptor[] {
  const seen = new Set<string>();
  const descriptors: SymbolDescriptor[] = [];

  for (const symbol of file.symbols) {
    const name = symbolName(symbol);
    if (seen.has(name)) {
      continue;
    }
    seen.add(name);

    const descriptor: SymbolDescriptor = { name };
    for (const section of symbol.sections) {
      if (section.title === "Summary") {
        descriptor.summary = section.body.join("\n");
      } else if (section.title === "Remarks") {
        descriptor.remarks = section.body.join("\n");
      } else if (section.title === "Parameters") {
        const parameters = parametersOf(section.body);
        if (parameters.length > 0) {
          descriptor.parameters = parameters;
        }
      }
    }
    descriptors.push(descriptor);
  }

  return descriptors;
}

/** Reads the `- \`name\`: description` bullets of a Parameters section. */
function parametersOf(body: string[]): SymbolParameterDescriptor[] {
  const parameters: SymbolParameterDescriptor[] = [];
  for (const line of body) {
    const bullet = /^\s*-\s+`([^`]+)`:\s*(.*)$/u.exec(line);
    if (bullet) {
      parameters.push({ name: bullet[1], description: bullet[2] ? bullet[2] : undefined });
    } else if (parameters.length > 0 && line.trim()) {
      const last = parameters[parameters.length - 1];
      last.description = last.description ? `${last.description}\n${line.trim()}` : line.trim();
    }
  }
  return parameters;
}
