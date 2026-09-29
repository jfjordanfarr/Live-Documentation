/**
 * The World Map view: a board, read from the bundle's board text and the graph,
 * drawn as pieces with doors, wires between them and tinted regions.
 */

import { lintBoard, parseBoard } from "@live-documentation/engine/live-docs/board";
import { deriveBoardGraph } from "@live-documentation/engine/live-docs/boardGraph";
import { LiveDocSyntaxError } from "@live-documentation/engine/live-docs/document";
import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

import { WorldMapController, type WorldMapApi } from "./controller";
import { buildWorldModel } from "./model";

export interface WorldMapViewOptions {
  root: HTMLElement;
  graph: LiveDocGraph;
  board?: { path: string; text: string };
  /** Opens a file of the graph in the Local Map, from a link in a pinned panel. */
  onOpenFile?: (file: string) => void;
}

export interface WorldMapView {
  render: () => void;
  dispose: () => void;
  /** The handle a test drives; absent when the bundle carries no board. */
  api?: WorldMapApi;
}

/** Creates the World Map over the bundle's board, or a note saying the bundle has none. */
export function createWorldMapView(options: WorldMapViewOptions): WorldMapView {
  const { root, graph, board, onOpenFile } = options;
  if (!board) {
    return noBoard(root, "This bundle carries no board. Build it with <code>npm run live-docs:visualize -- --board &lt;board.md&gt;</code> to draw a World Map.");
  }
  let parsed;
  try {
    parsed = parseBoard(board.text);
  } catch (error) {
    const message = error instanceof LiveDocSyntaxError ? error.message : String(error);
    return noBoard(root, `The board at <code>${escape(board.path)}</code> is not a board: ${escape(message)}`);
  }
  const faults = lintBoard(parsed);
  if (faults.length) {
    return noBoard(root, `The board at <code>${escape(board.path)}</code> has faults: ${faults.map((fault) => escape(fault.message)).join("; ")}`);
  }
  const model = buildWorldModel(parsed, deriveBoardGraph(parsed, graph, board.path), graph);
  let controller: WorldMapController | null = null;
  let rendered = false;
  return {
    render: () => {
      if (!controller) {
        controller = new WorldMapController({ root, board: parsed, boardPath: board.path, model, graph, onOpenFile });
        (window as Window & { __worldMap?: WorldMapApi }).__worldMap = controller.api;
      }
      if (!rendered) {
        controller.render();
        rendered = true;
      }
    },
    dispose: () => {
      controller?.dispose();
      controller = null;
      rendered = false;
    },
    get api() {
      return controller?.api;
    }
  };
}

function noBoard(root: HTMLElement, html: string): WorldMapView {
  root.innerHTML = `<div class="world"><div class="world-empty"><div>${html}</div></div></div>`;
  return { render: () => undefined, dispose: () => { root.innerHTML = ""; } };
}

function escape(text: string): string {
  return text.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;");
}
