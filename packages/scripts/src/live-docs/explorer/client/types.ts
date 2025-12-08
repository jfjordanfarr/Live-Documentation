import type {
  ExplorerLinkKind,
  ExplorerNodePayload
} from "../shared/types";

export type ViewName = "circuit" | "map" | "graph";

export interface ExplorerFilters {
  showTests: boolean;
  showAssets: boolean;
}

export interface BezierTuning {
  stubFactor: number;
  stubMin: number;
  stubMaxOffset: number;
  verticalOffset: number;
}

export interface ClickBehaviorTuning {
  singleClickFocusOnly: boolean;
  doubleClickRecenter: boolean;
}

export interface VisualTuning {
  showTypeBadges: boolean;
  alchemyGlow: boolean;
}

export interface LocalMapTuning {
  columnGap: number;
  hoverDimSymbols: number;
  hoverDimConnections: number;
  /** How much self-loop "French Corset" strokes taper (0=no taper, 1=full taper to half width) */
  selfLoopTaper: number;
}

export interface TuningConfig {
  bezier: BezierTuning;
  clickBehavior: ClickBehaviorTuning;
  visual: VisualTuning;
  localMap: LocalMapTuning;
}

export interface ExplorerState {
  view: ViewName;
  selectedNode: ExplorerNodePayload | null;
  focusedNode: ExplorerNodePayload | null;
  filters: ExplorerFilters;
  tuning: TuningConfig;
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
