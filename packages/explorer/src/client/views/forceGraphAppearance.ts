/** The file kinds actually coloured by the spatial map, shared with its legend. */
export const SPATIAL_NODE_STYLES: Readonly<Record<string, { color: string; label: string }>> = {
  implementation: { color: "#0091ff", label: "Implementation" },
  test: { color: "#28a745", label: "Test" },
  asset: { color: "#e83e8c", label: "Asset" },
  interface: { color: "#ffc107", label: "Interface" },
  config: { color: "#6c757d", label: "Configuration" },
  script: { color: "#17a2b8", label: "Script" },
  "related-doc": { color: "#9966cc", label: "Document" },
  directory: { color: "#e9984d", label: "Directory" },
  other: { color: "#888888", label: "Other" }
};

/** Unknown or absent file kinds receive the same neutral colour in the picture and key. */
export function spatialNodeStyle(archetype?: string): { color: string; label: string } {
  const kind = (archetype ?? "").toLowerCase();
  return Object.hasOwn(SPATIAL_NODE_STYLES, kind) ? SPATIAL_NODE_STYLES[kind] : SPATIAL_NODE_STYLES.other;
}
