/**
 * Bootstrap Module Index
 * 
 * Re-exports entry heuristics for inferring initial focus nodes.
 */

export {
  inferDefaultEntryNodeId,
  scoreNode,
  buildDegreeMap,
  type LinkEndpointResolver
} from "./entry-heuristics";
