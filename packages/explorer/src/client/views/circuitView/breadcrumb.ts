/**
 * Creates a breadcrumb navigation bar for the Circuit Board view.
 *
 * The breadcrumb shows the path from root to the currently deepest
 * expanded directory, allowing one-click navigation back to any
 * ancestor level (collapsing everything below that point).
 */
export function createBreadcrumb(
  crumbs: ReadonlyArray<{ label: string; path: string }>,
  onNavigate: (path: string) => void
): HTMLElement {
  const bar = document.createElement("nav");
  bar.className = "circuit-breadcrumb";
  bar.setAttribute("aria-label", "Circuit Board navigation");

  crumbs.forEach((crumb, index) => {
    if (index > 0) {
      const separator = document.createElement("span");
      separator.className = "circuit-breadcrumb__separator";
      separator.textContent = "›";
      separator.setAttribute("aria-hidden", "true");
      bar.appendChild(separator);
    }

    const isLast = index === crumbs.length - 1;
    const item = document.createElement("button");
    item.className = "circuit-breadcrumb__item";
    item.textContent = crumb.label;
    item.dataset.path = crumb.path;

    if (isLast) {
      item.classList.add("circuit-breadcrumb__item--active");
      item.setAttribute("aria-current", "location");
    } else {
      item.addEventListener("click", event => {
        event.stopPropagation();
        onNavigate(crumb.path);
      });
    }

    bar.appendChild(item);
  });

  return bar;
}
