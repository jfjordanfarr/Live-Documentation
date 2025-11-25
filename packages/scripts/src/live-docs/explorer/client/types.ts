import type {
  ExplorerLinkKind,
  ExplorerNodePayload
} from "../shared/types";

export type ViewName = "circuit" | "map" | "graph";

export interface ExplorerFilters {
  showTests: boolean;
  showAssets: boolean;
}

export interface ExplorerState {
  view: ViewName;
  selectedNode: ExplorerNodePayload | null;
  filters: ExplorerFilters;
}

export type TestCoverageMap = Map<string, ExplorerNodePayload[]>;

export interface CircuitTransform {
  x: number;
  y: number;
  k: number;
}

export interface DragPosition {
  x: number;
  y: number;
  time: number;
}

export interface DirectoryNode {
  name: string;
  path: string;
  children: Map<string, DirectoryNode>;
  nodes: ExplorerNodePayload[];
}

export type ConnectionKind = ExplorerLinkKind;
