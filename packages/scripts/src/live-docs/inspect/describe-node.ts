/**
 * Node description utilities for output formatting.
 * 
 * Provides functions to build descriptors for nodes and their symbols,
 * used by the emit-result modules for human-readable and JSON output.
 * 
 * @module inspect/describe-node
 */

import type { LiveDocGraph, LiveDocGraphNode } from "@live-documentation/scripts/live-docs/graph/liveDocGraph";

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
  const node = graph.nodes.get(codePath);
  if (!node) {
    return { codePath };
  }

  // In slim mode (default), omit symbol lists for compact output
  if (!verbose) {
    return {
      codePath: node.codePath,
      docPath: node.docPath
    };
  }

  const symbols = buildSymbolDescriptors(node);
  return {
    codePath: node.codePath,
    docPath: node.docPath,
    symbols: symbols.length > 0 ? symbols : undefined
  };
}

/**
 * Builds symbol descriptors from a node's public symbols.
 * 
 * @param node - The Live Doc graph node
 * @returns Array of symbol descriptors with documentation
 */
export function buildSymbolDescriptors(node: LiveDocGraphNode): SymbolDescriptor[] {
  if (node.publicSymbols.length === 0) {
    return [];
  }

  const seen = new Set<string>();
  const descriptors: SymbolDescriptor[] = [];

  for (const symbol of node.publicSymbols) {
    if (seen.has(symbol)) {
      continue;
    }
    seen.add(symbol);

    const documentation = node.symbolDocumentation[symbol];
    const descriptor: SymbolDescriptor = {
      name: symbol
    };

    if (documentation) {
      if (documentation.summary) {
        descriptor.summary = documentation.summary;
      }
      if (documentation.remarks) {
        descriptor.remarks = documentation.remarks;
      }
      if (documentation.parameters && documentation.parameters.length > 0) {
        descriptor.parameters = documentation.parameters.map((parameter): SymbolParameterDescriptor => ({
          name: parameter.name,
          description: parameter.description
        }));
      }
    }

    descriptors.push(descriptor);
  }

  return descriptors;
}
