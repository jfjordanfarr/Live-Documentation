import type { LocalMapPerspective, ViewName } from "../types";

/** Read current and retired view names at the persistence boundary. */
export function readView(value: unknown): ViewName {
  return value === "world" || value === "sources" ? value : "map";
}

/** Old Force Graph links are the Local Map in 3D; other old links open in 2D. */
export function readPerspective(value: unknown, legacyView?: unknown): LocalMapPerspective {
  if (value === "2d" || value === "3d") return value;
  return legacyView === "graph" || legacyView === "force" ? "3d" : "2d";
}
