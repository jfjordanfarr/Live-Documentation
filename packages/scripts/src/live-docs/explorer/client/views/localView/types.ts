import type {
  ExplorerGraphPayload,
  ExplorerLinkKind,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../../shared/types";
import type { ExplorerState, TestCoverageMap } from "../../types";

export interface LocalViewOptions {
  state: ExplorerState;
  graphData: ExplorerGraphPayload;
  resolveLinkEndpoint: (endpoint: ExplorerLinkPayload["source"]) => string;
  onSelectNode: (node: ExplorerNodePayload) => void | Promise<void>;
  onRecenterNode: (node: ExplorerNodePayload) => void | Promise<void>;
  testCoverage: TestCoverageMap;
}

export interface LocalViewApi {
  render(): void;
  drawConnections(): void;
  highlightSelection(): void;
  zoomIn(): void;
  zoomOut(): void;
  resetZoom(): void;
}

export interface LocalEdge {
  sourceId: string;
  targetId: string;
  direction: "outbound" | "inbound";
  kind: ExplorerLinkKind;
  sourceSymbol?: string;
  targetSymbol?: string;
}

export interface LocalSubgraph {
  center: ExplorerNodePayload;
  nodes: ExplorerNodePayload[];
  links: LocalEdge[];
  inboundIds: Set<string>;
  outboundIds: Set<string>;
}

export interface CenterAlignmentGuides {
  anchors: Map<string, number>;
  cardCenters: Map<string, number>;
}

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface LayoutExtents {
  content: Bounds;
  focus: Bounds | null;
}

export interface MapTransform {
  x: number;
  y: number;
  k: number;
}
