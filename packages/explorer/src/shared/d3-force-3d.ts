/** Ambient contract for the untyped d3-force-3d 3.0.6 library, checked against its published source; emits no implementation. */
declare module "d3-force-3d" {
  /**
   *
   */
  export interface SimulationNodeDatum {
    index?: number;
    x?: number; y?: number; z?: number;
    vx?: number; vy?: number; vz?: number;
    fx?: number | null; fy?: number | null; fz?: number | null;
  }
  /**
   *
   */
  export interface SimulationLinkDatum<N extends SimulationNodeDatum> {
    source: string | number | N;
    target: string | number | N;
    index?: number;
  }
  /**
   *
   */
  export interface Force<N extends SimulationNodeDatum> {
    (alpha: number): void;
    initialize?(nodes: N[], dimensions: number, random: () => number): void;
  }
  /**
   *
   */
  export interface ForceLink<N extends SimulationNodeDatum, L extends SimulationLinkDatum<N>> extends Force<N> {
    links(): L[];
    links(links: L[]): this;
    id(): (node: N, index: number, nodes: N[]) => string | number;
    id(id: (node: N, index: number, nodes: N[]) => string | number): this;
    distance(): (link: L, index: number, links: L[]) => number;
    distance(distance: number | ((link: L, index: number, links: L[]) => number)): this;
    strength(): (link: L, index: number, links: L[]) => number;
    strength(strength: number | ((link: L, index: number, links: L[]) => number)): this;
  }
  /**
   *
   */
  export interface ForceManyBody<N extends SimulationNodeDatum> extends Force<N> {
    strength(): (node: N, index: number, nodes: N[]) => number;
    strength(strength: number | ((node: N, index: number, nodes: N[]) => number)): this;
    /** The distance beyond which two bodies no longer act on each other; the library's default is unbounded. */
    distanceMax(): number;
    distanceMax(distance: number): this;
    distanceMin(): number;
    distanceMin(distance: number): this;
    theta(): number;
    theta(theta: number): this;
  }
  /** A positioning force toward a sphere of the given radius about a point: at radius zero, a pull toward the point in proportion to distance. */
  export interface ForceRadial<N extends SimulationNodeDatum> extends Force<N> {
    strength(): (node: N, index: number, nodes: N[]) => number;
    strength(strength: number | ((node: N, index: number, nodes: N[]) => number)): this;
    radius(): (node: N, index: number, nodes: N[]) => number;
    radius(radius: number | ((node: N, index: number, nodes: N[]) => number)): this;
  }
  /**
   *
   */
  export interface ForceCollide<N extends SimulationNodeDatum> extends Force<N> {
    radius(radius: number | ((node: N, index: number, nodes: N[]) => number)): this;
    strength(strength: number): this;
    iterations(iterations: number): this;
  }
  /**
   *
   */
  export interface Simulation<N extends SimulationNodeDatum> {
    nodes(): N[];
    nodes(nodes: N[]): this;
    force(name: string): Force<N> | undefined;
    force(name: string, force: Force<N> | null): this;
    tick(iterations?: number): this;
    stop(): this;
    alpha(): number;
    alpha(alpha: number): this;
    alphaMin(): number;
    alphaMin(min: number): this;
    alphaDecay(decay: number): this;
    alphaTarget(): number;
    alphaTarget(target: number): this;
    velocityDecay(decay: number): this;
    randomSource(random: () => number): this;
  }
  export function forceSimulation<N extends SimulationNodeDatum>(nodes?: N[], dimensions?: number): Simulation<N>;
  export function forceLink<N extends SimulationNodeDatum, L extends SimulationLinkDatum<N>>(links?: L[]): ForceLink<N, L>;
  export function forceManyBody<N extends SimulationNodeDatum>(): ForceManyBody<N>;
  export function forceCenter<N extends SimulationNodeDatum>(x?: number, y?: number, z?: number): Force<N>;
  export function forceCollide<N extends SimulationNodeDatum>(radius?: number | ((node: N) => number)): ForceCollide<N>;
  export function forceRadial<N extends SimulationNodeDatum>(radius: number | ((node: N, index: number, nodes: N[]) => number), x?: number, y?: number, z?: number): ForceRadial<N>;
}
