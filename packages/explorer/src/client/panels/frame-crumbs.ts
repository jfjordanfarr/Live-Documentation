/**
 * The scales from the outside in, as the Bare frame's breadcrumb shows them (a trial, 2026-11-19): one crumb for each
 * place a press can go out to, the innermost the place shown. On the Local Map, the World Map's crumb when the bundle
 * carries a board, then the scan root, then each directory down to the subject, then the subject file. Knowledge
 * Sources stands alone. Each crumb's words are names the scan gives (a directory's or a file's own name); the view
 * crumbs and the scan root are drawn as icons, named for assistive technology by their accessible names.
 *
 * Pure-function module: no DOM.
 *
 * @module frame-crumbs
 */

import type { ViewName } from "../types";

/** What the Local Map is about: a file or a directory, by its path from the scan root ("" is the root). */
export type CrumbSubject = { kind: "file" | "directory"; path: string };

/** One crumb: a view, the scan root or a directory, or the subject file. */
export type Crumb =
  | { kind: "view"; view: Exclude<ViewName, "map">; current: boolean }
  | { kind: "directory"; path: string; name: string; current: boolean }
  | { kind: "file"; path: string; name: string; current: true };

/** What the crumbs are read from: the view shown, whether there is a World Map to go out to, and the Local Map's subject. */
export interface CrumbInput {
  view: ViewName;
  hasBoard: boolean;
  subject: CrumbSubject | null;
}

/** The crumbs, outermost first; the last is always the place shown. */
export function crumbsOf({ view, hasBoard, subject }: CrumbInput): Crumb[] {
  if (view === "sources") return [{ kind: "view", view: "sources", current: true }];
  const crumbs: Crumb[] = [];
  if (hasBoard || view === "world") crumbs.push({ kind: "view", view: "world", current: view === "world" });
  if (view !== "map") return crumbs;
  const path = subject?.path.replace(/^\/+|\/+$/g, "") ?? "";
  const parts = path ? path.split("/") : [];
  const directories = subject?.kind === "file" ? parts.slice(0, -1) : parts;
  crumbs.push({ kind: "directory", path: "", name: "", current: directories.length === 0 && subject?.kind !== "file" });
  directories.forEach((name, index) => {
    crumbs.push({ kind: "directory", path: directories.slice(0, index + 1).join("/"), name, current: index === directories.length - 1 && subject?.kind !== "file" });
  });
  if (subject?.kind === "file" && parts.length) crumbs.push({ kind: "file", path, name: parts.at(-1)!, current: true });
  return crumbs;
}

/** The crumb a narrow window's back chevron goes out to: the one before the place shown, or none at the outermost. */
export function outwardCrumb(crumbs: readonly Crumb[]): Crumb | null {
  return crumbs.length > 1 ? crumbs[crumbs.length - 2] : null;
}
