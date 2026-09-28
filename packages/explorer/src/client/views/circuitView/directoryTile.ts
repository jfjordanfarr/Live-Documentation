import type { DirectoryAggregate } from "./aggregation";

/** Escape HTML special characters to prevent XSS */
function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c] || c));
}

/**
 * Creates a DOM element representing a collapsed directory tile
 * in the aggregated Circuit Board view.
 *
 * The tile shows the directory name, file count, symbol count,
 * and cross-boundary dependency counts as compact metric badges.
 */
export function createDirectoryTile(
  aggregate: DirectoryAggregate,
  onExpand: (directoryPath: string) => void
): HTMLElement {
  const tile = document.createElement("div");
  tile.className = "layout-box directory-tile";
  tile.dataset.directoryPath = aggregate.path;
  tile.tabIndex = 0;
  tile.setAttribute("role", "button");
  tile.setAttribute("aria-label", `Directory ${aggregate.name}: ${aggregate.fileCount} files, ${aggregate.symbolCount} symbols`);
  tile.title = aggregate.path;

  // Directory name label
  const label = document.createElement("div");
  label.className = "layout-box__label";
  label.textContent = aggregate.name;
  tile.appendChild(label);

  // Metrics container
  const metrics = document.createElement("div");
  metrics.className = "directory-tile__metrics";

  metrics.appendChild(createBadge(`${aggregate.fileCount} files`, "files"));
  if (aggregate.symbolCount > 0) {
    metrics.appendChild(createBadge(`${aggregate.symbolCount} symbols`, "symbols"));
  }
  if (aggregate.outboundDepCount > 0) {
    metrics.appendChild(createBadge(`${aggregate.outboundDepCount} out`, "outbound"));
  }
  if (aggregate.inboundDepCount > 0) {
    metrics.appendChild(createBadge(`${aggregate.inboundDepCount} in`, "inbound"));
  }

  tile.appendChild(metrics);

  // Archetype tags
  if (aggregate.archetypes.size > 0) {
    const tags = document.createElement("div");
    tags.className = "directory-tile__archetypes";
    for (const archetype of aggregate.archetypes) {
      const tag = document.createElement("span");
      tag.className = `directory-tile__archetype directory-tile__archetype--${escapeHtml(archetype)}`;
      tag.textContent = archetype;
      tags.appendChild(tag);
    }
    tile.appendChild(tags);
  }

  // Click to expand
  tile.addEventListener("click", event => {
    event.stopPropagation();
    onExpand(aggregate.path);
  });
  tile.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onExpand(aggregate.path);
    }
  });

  return tile;
}

function createBadge(text: string, variant: string): HTMLElement {
  const badge = document.createElement("span");
  badge.className = `directory-tile__badge directory-tile__badge--${variant}`;
  badge.textContent = text;
  return badge;
}
