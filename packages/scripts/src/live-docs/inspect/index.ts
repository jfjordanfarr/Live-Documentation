/**
 * Inspect module public API.
 * 
 * This module provides the pathfinding and result emission utilities
 * used by the inspect CLI tool.
 * 
 * @module inspect
 */

// Types
export type {
  Direction,
  FrontierEntry,
  PathSearchResult,
  NodeDescriptor,
  HopDescriptor,
  SymbolDescriptor,
  SymbolParameterDescriptor,
  FanoutPath,
  SymbolReference,
  SymbolHop,
  SymbolPathSearchResult
} from "./types";

// Symbol reference parsing and resolution
export {
  symbolToAnchor,
  normalizeAnchor,
  symbolMatchesAnchor,
  resolveAnchorToSymbolName,
  parseSymbolReference,
  hasSymbolReference,
  resolveSymbolReference
} from "./symbol-reference";

// Artifact resolution
export {
  resolveArtifactIdentifier,
  normalizeInputIdentifier,
  stripLiveDocDecorations
} from "./resolve-artifact";

// File-level pathfinding
export {
  searchGraph,
  getNeighbors,
  reconstructPath
} from "./pathfind";

// Symbol-aware pathfinding
export {
  searchSymbolPath,
  getSymbolNeighbors
} from "./pathfind-symbol";

// Fanout enumeration
export {
  MAX_ENUMERATED_PATHS,
  enumerateTerminalPaths
} from "./pathfind-fanout";

// Node description
export {
  describeNode,
  buildSymbolDescriptors
} from "./describe-node";

// Result emission - file level
export {
  emitPathResult,
  emitNotFound,
  emitFanoutResult
} from "./emit-result";

// Result emission - symbol level
export {
  emitSymbolPathResult,
  emitSymbolPathNotFound
} from "./emit-result-symbol";

// Result emission - dual direction
export {
  emitDualDirectionResult,
  emitDualDirectionSymbolResult
} from "./emit-result-dual";
