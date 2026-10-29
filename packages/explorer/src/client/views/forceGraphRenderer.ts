import { AmbientLight, DirectionalLight, PerspectiveCamera, Plane, Raycaster, Scene, Vector2, Vector3, WebGLRenderer } from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";

import { createSpatialBuffers, drawSpatialGraphOnChange, type SpatialDrawLink, type SpatialDrawStyle } from "./forceGraphBatches";
import type { CameraPoint } from "./forceGraphCamera";
import type { SpatialNode } from "./forceGraphLayout";

/** The view owns motion and attention; this layer owns only their picture, camera and direct instance picking. */
export interface SpatialRendererOptions<N, L> {
  style: SpatialDrawStyle<N, L>;
  resistance(): { nodes: number; wires: number };
  linkLabel(link: L): string;
  onDrag(node: N): void;
  onDragEnd(node: N): void;
}

/** A direct Three renderer with a bounded number of scene objects, irrespective of graph size. */
export class SpatialRenderer<N extends SpatialNode, L extends SpatialDrawLink<N>> {
  private readonly world = new Scene();
  private readonly eye = new PerspectiveCamera(50, 1, .1, 125000);
  private readonly gpu = new WebGLRenderer({ antialias: true, alpha: true });
  private readonly orbit: TrackballControls;
  private readonly buffers: ReturnType<typeof createSpatialBuffers<N, L>>;
  private data: { nodes: N[]; links: L[] } = { nodes: [], links: [] };
  private readonly byId = new Map<string, N>();
  private readonly wrapper: HTMLDivElement;
  private readonly tooltip: HTMLDivElement;
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();
  private readonly point = new Vector3();
  private revision = 0;
  private readonly paint: { render(): void };
  private appearance = 0;
  private pendingData = false;
  private viewWidth = 1;
  private viewHeight = 1;
  private drag: { node: N; pointerId: number; plane: Plane; offset: Vector3; fixed: [number | null | undefined, number | null | undefined, number | null | undefined]; moved: boolean } | null = null;

  constructor(container: HTMLElement, private readonly options: SpatialRendererOptions<N, L>) {
    this.wrapper = document.createElement("div"); this.wrapper.className = "scene-container";
    this.wrapper.style.position = "relative";
    container.replaceChildren(this.wrapper);
    this.gpu.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.gpu.setClearColor(0x000011, 1); this.wrapper.append(this.gpu.domElement);
    this.eye.position.z = 1000;
    this.world.add(new AmbientLight(0xcccccc, Math.PI), new DirectionalLight(0xffffff, .6 * Math.PI));
    this.buffers = createSpatialBuffers(this.world, options.style);
    this.paint = { render: (): void => {
      const resistance = this.options.resistance();
      if (this.pendingData) { this.buffers.setData(this.data); this.pendingData = false; }
      this.buffers.update(this.eye, this.viewWidth, this.viewHeight, resistance.nodes, resistance.wires);
      this.gpu.render(this.world, this.eye);
    } };
    drawSpatialGraphOnChange(this.eye, this.gpu, this.paint, () => {
      const resistance = this.options.resistance();
      return [this.revision, this.appearance, resistance.nodes, resistance.wires];
    });
    this.orbit = new TrackballControls(this.eye, this.gpu.domElement);
    this.orbit.minDistance = .1; this.orbit.maxDistance = 50000;
    const help = document.createElement("div"); help.className = "scene-nav-info";
    help.textContent = "Left-click: rotate, Mouse-wheel/middle-click: zoom, Right-click: pan";
    this.wrapper.append(help);
    this.tooltip = document.createElement("div"); this.tooltip.className = "spatial-wire-tooltip"; this.tooltip.hidden = true;
    this.tooltip.setAttribute("role", "tooltip"); this.wrapper.append(this.tooltip);
    this.width(container.clientWidth); this.height(container.clientHeight);
    this.gpu.domElement.addEventListener("pointerdown", event => {
      if (this.drag) { this.endDrag(); return; }
      const node = this.nodeAt(event.clientX, event.clientY);
      if (!node) return;
      const plane = new Plane().setFromNormalAndCoplanarPoint(this.eye.getWorldDirection(new Vector3()), new Vector3(node.x, node.y, node.z));
      this.setRay(event.clientX, event.clientY);
      if (!this.raycaster.ray.intersectPlane(plane, this.point)) return;
      this.drag = { node, pointerId: event.pointerId, plane, offset: this.point.clone().sub(new Vector3(node.x, node.y, node.z)),
        fixed: [node.fx, node.fy, node.fz], moved: false };
      node.fx = node.x; node.fy = node.y; node.fz = node.z;
      this.orbit.enabled = false;
      this.gpu.domElement.setPointerCapture(event.pointerId);
      event.stopImmediatePropagation();
    }, true);
    this.gpu.domElement.addEventListener("pointermove", event => {
      const drag = this.drag;
      if (!drag || event.pointerId !== drag.pointerId) return;
      this.setRay(event.clientX, event.clientY);
      if (!this.raycaster.ray.intersectPlane(drag.plane, this.point)) return;
      this.point.sub(drag.offset);
      drag.node.fx = drag.node.x = this.point.x; drag.node.fy = drag.node.y = this.point.y; drag.node.fz = drag.node.z = this.point.z;
      drag.moved = true; this.options.onDrag(drag.node);
    });
    const end = (event: PointerEvent): void => { if (this.drag?.pointerId === event.pointerId) this.endDrag(); };
    this.gpu.domElement.addEventListener("pointerup", end);
    this.gpu.domElement.addEventListener("pointercancel", end);
    this.gpu.domElement.addEventListener("lostpointercapture", end);
    window.addEventListener("blur", () => this.endDrag());
  }

  private endDrag(): void {
    const drag = this.drag;
    if (!drag) return;
    this.drag = null;
    [drag.node.fx, drag.node.fy, drag.node.fz] = drag.fixed;
    if (this.gpu.domElement.hasPointerCapture(drag.pointerId)) this.gpu.domElement.releasePointerCapture(drag.pointerId);
    this.orbit.enabled = true;
    if (drag.moved) this.options.onDragEnd(drag.node);
  }

  /** The camera shared by drawing, projection and framing. */
  camera(): PerspectiveCamera { return this.eye; }
  /** The existing trackball gesture and damping controls. */
  controls(): TrackballControls { return this.orbit; }
  /** The GPU renderer used for drawing and exporting the picture. */
  renderer(): WebGLRenderer { return this.gpu; }
  /** The requested graph; its membership is uploaded at the next draw. */
  graphData(): { nodes: N[]; links: L[] } { return this.data; }
  /** Whether a file or directory participates in the requested picture. */
  hasNode(id: string): boolean { return this.byId.has(id); }

  /** Hidden views release captured nodes and suspend camera input until the view is shown again. */
  setActive(active: boolean): void {
    if (!active) { this.endDrag(); this.hideWire(); }
    this.orbit.enabled = active && !this.drag;
  }

  /** Carry membership into the next draw, keeping the last uploaded picture valid for picking until then. */
  setData(data: { nodes: N[]; links: L[] }): void {
    if (this.drag && !data.nodes.includes(this.drag.node)) this.endDrag();
    this.data = data; this.byId.clear();
    for (const node of data.nodes) this.byId.set(node.id, node);
    this.pendingData = true; this.appearance++;
  }

  /** Re-read visual accessors on the next draw without advancing layout. */
  invalidateAppearance(): void { this.buffers.invalidateAppearance(); this.appearance++; }
  /** Read or replace the node colour accessor without changing layout. */
  nodeColor(): (node: N) => string;
  /** Read or replace the node colour accessor without changing layout. */
  nodeColor(read: (node: N) => string): this;
  /** Read or replace the node colour accessor without changing layout. */
  nodeColor(read?: (node: N) => string): this | ((node: N) => string) {
    if (!read) return this.options.style.nodeColor;
    this.options.style.nodeColor = read; this.invalidateAppearance(); return this;
  }
  /** Replace wire colours and alpha for the next draw. */
  linkColor(read: (link: L) => string): this { this.options.style.linkColor = read; this.invalidateAppearance(); return this; }
  /** Replace the rule for which documented wires are drawn. */
  linkVisibility(read: (link: L) => boolean): this { this.options.style.linkVisible = read; this.invalidateAppearance(); return this; }
  /** Replace the base wire-width accessor; zoom compensation remains separate. */
  linkWidth(read: (link: L) => number): this { this.options.style.linkWidth = read; this.invalidateAppearance(); return this; }
  /** Replace physical node radii used for drawing; layout is owned by the view. */
  nodeRadius(read: (node: N) => number): this { this.options.style.radius = read; this.invalidateAppearance(); return this; }

  /** Read or set the canvas width in CSS pixels. */
  width(): number;
  /** Read or set the canvas width in CSS pixels. */
  width(value: number): this;
  /** Read or set the canvas width in CSS pixels. */
  width(value?: number): number | this { if (value === undefined) return this.viewWidth; this.viewWidth = Math.max(1, value); this.resize(); return this; }
  /** Read or set the canvas height in CSS pixels. */
  height(): number;
  /** Read or set the canvas height in CSS pixels. */
  height(value: number): this;
  /** Read or set the canvas height in CSS pixels. */
  height(value?: number): number | this { if (value === undefined) return this.viewHeight; this.viewHeight = Math.max(1, value); this.resize(); return this; }
  private resize(): void {
    this.gpu.setSize(this.viewWidth, this.viewHeight);
    this.wrapper.style.width = `${this.viewWidth}px`; this.wrapper.style.height = `${this.viewHeight}px`;
    this.eye.aspect = this.viewWidth / this.viewHeight; this.eye.updateProjectionMatrix(); this.orbit.handleResize();
  }

  /** Read the camera position, or place the camera and its target together. */
  cameraPosition(): CameraPoint;
  /** Read the camera position, or place the camera and its target together. */
  cameraPosition(position: CameraPoint, target: CameraPoint): this;
  /** Read the camera position, or place the camera and its target together. */
  cameraPosition(position?: CameraPoint, target?: CameraPoint): CameraPoint | this {
    if (!position || !target) return { x: this.eye.position.x, y: this.eye.position.y, z: this.eye.position.z };
    this.eye.position.set(position.x, position.y, position.z); this.orbit.target.set(target.x, target.y, target.z);
    this.eye.lookAt(this.orbit.target); this.eye.updateMatrixWorld(); return this;
  }
  /** Project graph coordinates into canvas-relative CSS pixels. */
  graph2ScreenCoords(x: number, y: number, z: number): { x: number; y: number } {
    this.point.set(x, y, z).project(this.eye);
    return { x: (this.point.x + 1) * this.viewWidth / 2, y: (1 - this.point.y) * this.viewHeight / 2 };
  }
  /** Advance pending pointer navigation and its damping. */
  updateControls(): void { this.orbit.update(); }

  /** Draw only a changed uploaded picture; scene traversal stays constant in the number of graph elements. */
  draw(revision: number): void {
    this.revision = revision;
    this.paint.render();
  }

  private setRay(clientX: number, clientY: number): void {
    const rect = this.gpu.domElement.getBoundingClientRect();
    this.pointer.set((clientX - rect.left) / rect.width * 2 - 1, 1 - (clientY - rect.top) / rect.height * 2);
    this.eye.updateMatrixWorld(); this.raycaster.setFromCamera(this.pointer, this.eye);
  }
  /** Pick the closest tessellated sphere in the latest uploaded picture. */
  nodeAt(clientX: number, clientY: number): N | undefined {
    this.setRay(clientX, clientY); return this.buffers.pickNode(this.raycaster);
  }
  /** Show the documented relationship under the pointer using its projected stroke. */
  showWireAt(clientX: number, clientY: number): void {
    this.setRay(clientX, clientY);
    const link = this.buffers.pickLink(this.raycaster, this.eye, this.options.resistance().wires);
    this.tooltip.hidden = !link;
    if (link) {
      const label = this.options.linkLabel(link);
      if (this.tooltip.textContent !== label) this.tooltip.textContent = label;
      const rect = this.gpu.domElement.getBoundingClientRect();
      this.tooltip.style.left = `${Math.max(8, Math.min(this.viewWidth - this.tooltip.offsetWidth - 8, clientX - rect.left + 12))}px`;
      this.tooltip.style.top = `${Math.max(8, Math.min(this.viewHeight - this.tooltip.offsetHeight - 8, clientY - rect.top + 12))}px`;
    }
  }
  /** Close the wire tooltip. */
  hideWire(): void { this.tooltip.hidden = true; }
}
