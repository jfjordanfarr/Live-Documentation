import type { DirectoryNode } from "../../types";

/**
 * Barrel file patterns by language convention.
 *
 * A barrel file is a module whose primary purpose is to re-export the
 * public API surface of a directory. In the Membrane Map, barrel files
 * are absorbed into their parent membrane rather than rendered as
 * interior leaf nodes — the membrane border IS the barrel.
 */
const BARREL_PATTERNS: RegExp[] = [
  // TypeScript / JavaScript
  /^index\.[mc]?[jt]sx?$/,
  // Python
  /^__init__\.pyi?$/,
  // Rust
  /^mod\.rs$/,
  // Go (doc.go is the conventional package-documentation file)
  /^doc\.go$/,
];

/**
 * Returns true if the given filename matches a known barrel file pattern.
 */
export function isBarrelFile(filename: string): boolean {
  return BARREL_PATTERNS.some(pattern => pattern.test(filename));
}

/**
 * Recursively applies barrel-as-membrane semantics to a DirectoryNode tree.
 *
 * For each directory that contains a barrel file AND at least one other file,
 * the barrel file is removed from the directory's `nodes` array. The membrane
 * boundary itself represents the barrel's re-export surface.
 *
 * When a barrel file is the only file in a directory, it is kept — removing
 * it would leave the membrane with zero weight, making it invisible.
 *
 * This function returns a new tree (does not mutate the input).
 */
export function applyBarrelSemantics(root: DirectoryNode): DirectoryNode {
  const newChildren = new Map<string, DirectoryNode>();
  for (const [key, child] of root.children) {
    newChildren.set(key, applyBarrelSemantics(child));
  }

  let newNodes = root.nodes;
  if (root.nodes.length > 1) {
    const filtered = root.nodes.filter(n => !isBarrelFile(n.name));
    if (filtered.length > 0) {
      newNodes = filtered;
    }
  }

  return {
    name: root.name,
    path: root.path,
    children: newChildren,
    nodes: newNodes,
  };
}
