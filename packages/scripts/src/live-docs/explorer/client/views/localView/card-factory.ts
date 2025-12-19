/**
 * Card factory functions for Local Map node cards and symbol sections.
 *
 * Extracted from render.ts to improve maintainability.
 * These functions create the DOM elements for individual node cards
 * and their symbol sections in the Local Map view.
 *
 * @module card-factory
 */

import type { LocalViewController } from "./controller";
import type { ColumnRole } from "./types";
import type { ExplorerNodePayload, ExplorerPublicSymbol, ExplorerTypeReference } from "../../../shared/types";
import { ROOT_KEY, getDirectoryKey } from "../layoutUtils";

/**
 * Creates a node card element for the Local Map view.
 *
 * @param controller - The LocalViewController instance
 * @param node - The node data to render
 * @param columnRole - The role of the column this card belongs to
 * @param hopIndex - Optional hop index for multi-hop visualization
 * @returns The created card element
 */
export function createNodeCard(
  controller: LocalViewController,
  node: ExplorerNodePayload,
  columnRole: ColumnRole,
  hopIndex?: number
): HTMLElement {
  const card = document.createElement("div");
  card.className = "node-card";
  card.dataset.id = node.id;
  card.dataset.columnRole = columnRole;
  if (hopIndex !== undefined) {
    card.dataset.hopIndex = String(hopIndex);
  }
  card.title = node.codeRelativePath;
  card.tabIndex = 0;

  const { state, testCoverage } = controller.options;

  if (state.selectedNode && state.selectedNode.id === node.id) {
    card.classList.add("selected", "local-focus");
  }

  // Use hop-aware registration when hopIndex is provided
  const registerAnchor = hopIndex !== undefined
    ? (key: string, element: HTMLElement) => controller.registerAnchorWithHop(node.id, columnRole, hopIndex, key, element)
    : (key: string, element: HTMLElement) => controller.registerAnchor(node.id, columnRole, key, element);

  registerAnchor("card", card);

  const isAsset = (node.archetype || "").toLowerCase() === "asset";

  // For assets: add node-wide inbound AND outbound hubs since they don't have symbol rows
  if (isAsset) {
    const inboundHub = document.createElement("div");
    inboundHub.className = "symbol-anchor hub inbound";
    card.appendChild(inboundHub);
    registerAnchor("inbound:*", inboundHub);

    const outboundHub = document.createElement("div");
    outboundHub.className = "symbol-anchor hub outbound";
    card.appendChild(outboundHub);
    registerAnchor("outbound:*", outboundHub);
  }

  // For center and upstream columns: add outbound hub for file-level connections
  // - Center: for connections to dependents when symbol resolution isn't available
  // - Upstream (dependencies): for file-level dependency edges (e.g., require_relative)
  // This ensures connections anchor at the card edge, not the card center.
  if ((columnRole === "center" || columnRole === "upstream") && !isAsset) {
    const outboundHub = document.createElement("div");
    outboundHub.className = "symbol-anchor hub outbound" + (columnRole === "center" ? " center-hub" : "");
    card.appendChild(outboundHub);
    registerAnchor("outbound:*", outboundHub);
  }

  const header = document.createElement("div");
  header.className = "node-title";
  header.textContent = node.name;
  card.appendChild(header);

  const pathElement = document.createElement("div");
  pathElement.className = "node-path";
  pathElement.textContent = node.codeRelativePath;
  card.appendChild(pathElement);

  card.appendChild(createSymbolSection(controller, node, columnRole, hopIndex));

  if (!controller.isTestNode(node) && state.filters.showTests) {
    const backing = testCoverage.get(node.id);
    if (backing && backing.length > 0) {
      card.classList.add("test-backed");
      card.dataset.testCount = String(backing.length);
      const coverage = document.createElement("div");
      coverage.className = "node-tests";
      const label = document.createElement("span");
      label.className = "node-tests__label";
      label.textContent = backing.length === 1 ? "Test" : "Tests";
      coverage.appendChild(label);
      backing.slice(0, 3).forEach(testNode => {
        const tag = document.createElement("span");
        tag.className = "node-tests__item";
        tag.textContent = testNode.name;
        coverage.appendChild(tag);
      });
      if (backing.length > 3) {
        const remainder = document.createElement("span");
        remainder.className = "node-tests__more";
        remainder.textContent = `+${backing.length - 3}`;
        coverage.appendChild(remainder);
      }
      const coverageTitle = backing.map(test => test.codeRelativePath).join("\n");
      card.title = `${card.title}\nTest coverage:\n${coverageTitle}`;
      card.appendChild(coverage);
    }
  }

  const directory = document.createElement("div");
  directory.className = "node-directory";
  directory.textContent = getDirectoryKey(node) === ROOT_KEY ? "(root)" : getDirectoryKey(node);
  card.appendChild(directory);

  card.addEventListener("click", event => {
    event.stopPropagation();
    // Clear any pinned symbol when clicking on a card (but not on a symbol row, which handles its own clicks)
    controller.clearPinnedSymbol();
    void controller.selectNode(node);
  });

  card.addEventListener("dblclick", event => {
    event.stopPropagation();
    void controller.recenterNode(node);
  });

  return card;
}

/**
 * Creates the symbol section for a node card, including all public symbols
 * and the "Internals" pseudo-symbol.
 *
 * @param controller - The LocalViewController instance
 * @param node - The node data
 * @param columnRole - The role of the column
 * @param hopIndex - Optional hop index for multi-hop visualization
 * @returns The symbol section element
 */
export function createSymbolSection(
  controller: LocalViewController,
  node: ExplorerNodePayload,
  columnRole: ColumnRole,
  hopIndex?: number
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "node-symbols";

  // Use hop-aware registration when hopIndex is provided
  const registerAnchor = hopIndex !== undefined
    ? (key: string, element: HTMLElement) => controller.registerAnchorWithHop(node.id, columnRole, hopIndex, key, element)
    : (key: string, element: HTMLElement) => controller.registerAnchor(node.id, columnRole, key, element);

  const hasPublicSymbols = node.publicSymbols && node.publicSymbols.length > 0;

  if (!hasPublicSymbols) {
    const empty = document.createElement("div");
    empty.className = "node-meta";
    empty.textContent = "No public symbols";
    wrapper.appendChild(empty);
    // Fall through to add the Internals row as the fallback anchor
  }

  const grid = document.createElement("div");
  grid.className = "symbol-grid";

  // Build a map from symbol name to extended info (if available)
  const extendedByName = new Map<string, ExplorerPublicSymbol>();
  if (node.publicSymbolsExtended) {
    for (const ext of node.publicSymbolsExtended) {
      extendedByName.set(ext.name, ext);
    }
  }

  node.publicSymbols.forEach(symbol => {
    const extended = extendedByName.get(symbol);
    const typeRefs = extended?.typeReferences;
    const hasTypeRefs = typeRefs && typeRefs.length > 0;
    const hasResolvedTypeRefs = hasTypeRefs && typeRefs.some(ref => ref.isResolved);

    // Wrapper element for hover targeting (uses display: contents to preserve grid layout)
    const symbolRow = document.createElement("div");
    symbolRow.className = "symbol-row";
    symbolRow.dataset.nodeId = node.id;
    symbolRow.dataset.symbol = symbol;

    // Add hover handlers for connection highlighting
    symbolRow.addEventListener("mouseenter", () => {
      controller.highlightSymbolConnections(node.id, symbol);
    });
    symbolRow.addEventListener("mouseleave", () => {
      controller.clearSymbolHighlight();
    });
    // Add click handler for "sticky" pinned highlighting (useful for mobile & exploring large files)
    symbolRow.addEventListener("click", (event) => {
      event.stopPropagation();
      controller.togglePinnedSymbol(node.id, symbol);
    });

    const inboundAnchor = document.createElement("div");
    inboundAnchor.className = "symbol-anchor dot inbound";
    inboundAnchor.dataset.symbol = symbol;
    symbolRow.appendChild(inboundAnchor);
    registerAnchor(`inbound:${symbol}`, inboundAnchor);

    const labelWrapper = document.createElement("div");
    labelWrapper.className = "symbol-label-wrapper";

    const label = document.createElement("div");
    label.className = "symbol-label";
    label.textContent = symbol;
    labelWrapper.appendChild(label);

    // Add type reference indicator if present
    if (hasTypeRefs && controller.options.state.tuning.visual.showTypeBadges) {
      const typeIndicator = createTypeReferenceIndicator(controller, typeRefs);
      labelWrapper.appendChild(typeIndicator);
    }

    // If there are resolved type refs, make the label visually indicate it
    // But DON'T add a click handler here — badge click will handle navigation
    // Symbol row click will just toggle the pin (handled by the row's click handler)
    if (hasResolvedTypeRefs) {
      labelWrapper.classList.add("has-type-link");
      const firstResolved = typeRefs.find(ref => ref.isResolved);
      if (firstResolved?.targetId) {
        labelWrapper.dataset.targetId = firstResolved.targetId;
        labelWrapper.dataset.targetAnchor = firstResolved.targetAnchor ?? "";
        // Double-click still recenters on the target node
        labelWrapper.addEventListener("dblclick", event => {
          event.stopPropagation();
          const targetNode = controller.options.nodesById.get(firstResolved.targetId!);
          if (targetNode) {
            void controller.recenterNode(targetNode);
          }
        });
      }
    }

    symbolRow.appendChild(labelWrapper);

    const outboundAnchor = document.createElement("div");
    outboundAnchor.className = "symbol-anchor dot outbound";
    outboundAnchor.dataset.symbol = symbol;
    symbolRow.appendChild(outboundAnchor);
    registerAnchor(`outbound:${symbol}`, outboundAnchor);

    grid.appendChild(symbolRow);
  });

  // Add the "Internals" pseudo-symbol at the end — represents private implementation
  // This row only has an inbound anchor (data flows IN but doesn't flow OUT to other files)
  // Skip for assets — they use the node-wide inbound hub instead (no internal logic to represent)
  const isAsset = (node.archetype || "").toLowerCase() === "asset";
  if (!isAsset) {
    // Wrapper element for hover targeting (uses display: contents to preserve grid layout)
    const internalsRow = document.createElement("div");
    internalsRow.className = "symbol-row internals-row";
    internalsRow.dataset.nodeId = node.id;
    internalsRow.dataset.symbol = "__internals__";

    // Add hover handlers for connection highlighting
    internalsRow.addEventListener("mouseenter", () => {
      controller.highlightSymbolConnections(node.id, "__internals__");
    });
    internalsRow.addEventListener("mouseleave", () => {
      controller.clearSymbolHighlight();
    });
    // Add click handler for "sticky" pinned highlighting
    internalsRow.addEventListener("click", (event) => {
      event.stopPropagation();
      controller.togglePinnedSymbol(node.id, "__internals__");
    });

    const internalsInbound = document.createElement("div");
    internalsInbound.className = "symbol-anchor dot inbound internals-anchor";
    internalsInbound.dataset.symbol = "__internals__";
    internalsRow.appendChild(internalsInbound);
    registerAnchor("inbound:__internals__", internalsInbound);
    registerAnchor("inbound:*", internalsInbound);

    const internalsLabel = document.createElement("div");
    internalsLabel.className = "symbol-label-wrapper internals-label";
    internalsLabel.innerHTML = `<div class="symbol-label internals-text">⬛ Internals</div>`;
    internalsLabel.title = "Internal/private implementation — data flows in but isn't exposed as public symbols";
    internalsRow.appendChild(internalsLabel);

    // Empty placeholder for the outbound column (internals don't have outbound connections)
    const internalsOutboundPlaceholder = document.createElement("div");
    internalsOutboundPlaceholder.className = "symbol-anchor-placeholder";
    internalsRow.appendChild(internalsOutboundPlaceholder);

    grid.appendChild(internalsRow);
  }

  wrapper.appendChild(grid);
  return wrapper;
}

/**
 * Creates a type reference indicator element showing what types a symbol references.
 *
 * @param controller - The LocalViewController instance
 * @param typeRefs - The type references to display
 * @returns The indicator element
 */
export function createTypeReferenceIndicator(
  controller: LocalViewController,
  typeRefs: ExplorerTypeReference[]
): HTMLElement {
  const indicator = document.createElement("div");
  indicator.className = "type-refs-indicator";

  // Group by role
  const returnRefs = typeRefs.filter(r => r.role === "return");
  const paramRefs = typeRefs.filter(r => r.role === "parameter");
  const extendsRefs = typeRefs.filter(r => r.role === "extends");
  const implementsRefs = typeRefs.filter(r => r.role === "implements");

  const badges: HTMLElement[] = [];

  if (returnRefs.length > 0) {
    const badge = createTypeBadge(controller, returnRefs, "→", "return");
    badges.push(badge);
  }

  if (paramRefs.length > 0) {
    const badge = createTypeBadge(controller, paramRefs, "←", "param");
    badges.push(badge);
  }

  if (extendsRefs.length > 0) {
    const badge = createTypeBadge(controller, extendsRefs, "⊲", "extends");
    badges.push(badge);
  }

  if (implementsRefs.length > 0) {
    const badge = createTypeBadge(controller, implementsRefs, "◇", "implements");
    badges.push(badge);
  }

  for (const badge of badges) {
    indicator.appendChild(badge);
  }

  return indicator;
}

/**
 * Creates a single type badge element for a group of type references.
 *
 * @param controller - The LocalViewController instance
 * @param refs - The type references for this badge
 * @param icon - The icon to display
 * @param kind - The kind of reference (return, param, extends, implements)
 * @returns The badge element
 */
export function createTypeBadge(
  controller: LocalViewController,
  refs: ExplorerTypeReference[],
  icon: string,
  kind: string
): HTMLElement {
  const badge = document.createElement("span");
  badge.className = `type-badge type-badge-${kind}`;

  const hasResolved = refs.some(r => r.isResolved);
  if (hasResolved) {
    badge.classList.add("type-badge-resolved");
  }

  const typeNames = refs.map(r => r.typeName).join(", ");
  badge.title = `${kind}: ${typeNames}`;
  badge.textContent = icon;

  // Make resolved badges clickable to navigate to the type
  if (hasResolved) {
    const firstResolved = refs.find(r => r.isResolved);
    if (firstResolved?.targetId) {
      badge.classList.add("clickable");
      badge.addEventListener("click", _event => {
        // Don't stop propagation - let the row's click handler also fire to toggle pin
        const targetNode = controller.options.nodesById.get(firstResolved.targetId!);
        if (targetNode) {
          void controller.focusSidebar(targetNode);
        }
      });
      badge.addEventListener("dblclick", event => {
        event.stopPropagation();
        const targetNode = controller.options.nodesById.get(firstResolved.targetId!);
        if (targetNode) {
          void controller.recenterNode(targetNode);
        }
      });
    }
  }

  return badge;
}
