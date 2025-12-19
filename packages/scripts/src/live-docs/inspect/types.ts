/**
 * Types used across the inspect CLI pathfinding modules.
 * 
 * @module inspect/types
 */

/**
 * Traversal direction for graph searches.
 */
export type Direction = "outbound" | "inbound" | "both";

/**
 * Entry in the search frontier, representing a node that couldn't be explored further.
 */
export interface FrontierEntry {
  node: string;
  docPath?: string;
  reason: "terminal" | "max-depth" | "missing-doc";
  missingDependency?: string;
}

/**
 * Result of a file-level path search.
 */
export interface PathSearchResult {
  path?: string[];
  visited: Set<string>;
  frontier: FrontierEntry[];
}

/**
 * Descriptor for a node in path output.
 */
export interface NodeDescriptor {
  codePath: string;
  docPath?: string;
  symbols?: SymbolDescriptor[];
}

/**
 * Descriptor for a hop (edge) in path output.
 */
export interface HopDescriptor {
  from: NodeDescriptor;
  to: NodeDescriptor;
}

/**
 * Descriptor for a public symbol.
 */
export interface SymbolDescriptor {
  name: string;
  summary?: string;
  remarks?: string;
  parameters?: SymbolParameterDescriptor[];
}

/**
 * Descriptor for a symbol parameter.
 */
export interface SymbolParameterDescriptor {
  name: string;
  description?: string;
}

/**
 * A terminal path in fanout enumeration.
 */
export interface FanoutPath {
  nodes: string[];
}

/**
 * A reference that may include a symbol anchor (e.g., "file.ts#SymbolName").
 */
export interface SymbolReference {
  codePath: string;
  symbol?: string;
}

/**
 * A node in a symbol-aware path, tracking both file and symbol at each hop.
 */
export interface SymbolHop {
  codePath: string;
  symbol?: string;
}

/**
 * Result of a symbol-aware path search.
 */
export interface SymbolPathSearchResult {
  path?: SymbolHop[];
  found: boolean;
}
