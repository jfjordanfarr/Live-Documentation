# packages/explorer/src/shared/template.html

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/shared/template.html
- Generated At: 2026-10-07T13:20:48.560Z

## Authored
### Purpose

The single-page HTML shell for the Live Docs Explorer static site. Defines the full DOM skeleton — sidebar, view containers (Circuit Board, Local Map, Force Graph, Knowledge Sources), pathfinding toolbar, detail panel, and all interactive controls. Every `id` attribute in this file constitutes the Explorer's public DOM API; client TypeScript modules bind to these ids via `getElementById()` at startup.

### Notes

- Created [2025-11-22](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-24.SUMMARIZED.md) as part of the initial Explorer server scaffolding (`f1e2dec0`).
- Relocated from `server/template.html` to `shared/template.html` on [2026-03-09](../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-09.1.md) during the server retirement that consolidated all Explorer build-time utilities into the `shared/` module.
- Its `id` attributes are extracted as public symbols by the HTML adapter ([html.ts](../../../engine/src/live-docs/adapters/html.ts.mdmd.md)), enabling Live Documentation to track which client modules depend on which DOM elements.
- The pathfinder's status (`pathfind-status`) is a line of its own under the input row since [Turn 10 of 2026-10-01](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10), because it can hold a sentence and a link (the reverse question offered when a path runs against the map's direction).
- The Tuning section's Local Map subsection gained the laces' sliders on 2026-10-06 (`tuning-lace-reach`, `tuning-lace-curl`, `tuning-lace-width`), beside the taper now labelled Lace Taper, each with a title saying what it moves ([Turn 13](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-13)); a `tuning-lace-inset` slider of the same day was removed on 2026-10-07, when the laces became cut by the card's edge, and the reach's title now says it is measured from that edge.
- Click Behavior and Visual tuning subsections removed in [Dev Day 83](../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md) as dead code — their checkbox controls were eliminated along with the corresponding `ClickBehaviorTuning`/`VisualTuning` type interfaces.
- The Local Map subsection gained the Move slider (`tuning-move-ms`, 0 to 1,200 ms by 50) and the Hold Still select (`tuning-hold-still`: the last clicked card, or the last clicked or hovered) on 2026-10-07, for the animated re-layout.
- The Local Map subsection gained the Order Starts slider (`tuning-order-starts`, 0 to 16) and the continuing search's Search Starts (`tuning-search-starts`, 0 to 128, zero off) and Search Patience (`tuning-search-patience`, 1 to 32) on 2026-10-07.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `circuit-connections` {#symbol-circuit-connections}
- Type: variable

#### `circuit-container` {#symbol-circuit-container}
- Type: variable

#### `circuit-viewport` {#symbol-circuit-viewport}
- Type: variable

#### `context-bar` {#symbol-context-bar}
- Type: variable

#### `context-name` {#symbol-context-name}
- Type: variable

#### `controls` {#symbol-controls}
- Type: variable

#### `detail-body` {#symbol-detail-body}
- Type: variable

#### `detail-close` {#symbol-detail-close}
- Type: variable

#### `detail-panel` {#symbol-detail-panel}
- Type: variable

#### `detail-title` {#symbol-detail-title}
- Type: variable

#### `download-doc-btn` {#symbol-download-doc-btn}
- Type: variable

#### `filter-toggle-assets` {#symbol-filter-toggle-assets}
- Type: variable

#### `filter-toggle-related-docs` {#symbol-filter-toggle-related-docs}
- Type: variable

#### `filter-toggle-tests` {#symbol-filter-toggle-tests}
- Type: variable

#### `graph-svg` {#symbol-graph-svg}
- Type: variable

#### `history-back` {#symbol-history-back}
- Type: variable

#### `history-forward` {#symbol-history-forward}
- Type: variable

#### `main` {#symbol-main}
- Type: variable

#### `map-connections` {#symbol-map-connections}
- Type: variable

#### `map-container` {#symbol-map-container}
- Type: variable

#### `map-viewport` {#symbol-map-viewport}
- Type: variable

#### `membrane-connections` {#symbol-membrane-connections}
- Type: variable

#### `membrane-container` {#symbol-membrane-container}
- Type: variable

#### `membrane-viewport` {#symbol-membrane-viewport}
- Type: variable

#### `omnisearch` {#symbol-omnisearch}
- Type: variable

#### `omnisearch-input` {#symbol-omnisearch-input}
- Type: variable

#### `omnisearch-results` {#symbol-omnisearch-results}
- Type: variable

#### `omnisearch-trigger` {#symbol-omnisearch-trigger}
- Type: variable

#### `pathfind-clear` {#symbol-pathfind-clear}
- Type: variable

#### `pathfind-from` {#symbol-pathfind-from}
- Type: variable

#### `pathfind-from-clear` {#symbol-pathfind-from-clear}
- Type: variable

#### `pathfind-from-group` {#symbol-pathfind-from-group}
- Type: variable

#### `pathfind-from-results` {#symbol-pathfind-from-results}
- Type: variable

#### `pathfind-from-symbol` {#symbol-pathfind-from-symbol}
- Type: variable

#### `pathfind-go` {#symbol-pathfind-go}
- Type: variable

#### `pathfind-path` {#symbol-pathfind-path}
- Type: variable

#### `pathfind-status` {#symbol-pathfind-status}
- Type: variable

#### `pathfind-to` {#symbol-pathfind-to}
- Type: variable

#### `pathfind-to-clear` {#symbol-pathfind-to-clear}
- Type: variable

#### `pathfind-to-group` {#symbol-pathfind-to-group}
- Type: variable

#### `pathfind-to-results` {#symbol-pathfind-to-results}
- Type: variable

#### `pathfind-to-symbol` {#symbol-pathfind-to-symbol}
- Type: variable

#### `pathfind-toolbar` {#symbol-pathfind-toolbar}
- Type: variable

#### `sidebar` {#symbol-sidebar}
- Type: variable

#### `sidebar-toggle` {#symbol-sidebar-toggle}
- Type: variable

#### `sources-container` {#symbol-sources-container}
- Type: variable

#### `stats-line` {#symbol-stats-line}
- Type: variable

#### `tuning-column-gap` {#symbol-tuning-column-gap}
- Type: variable

#### `tuning-column-gap-value` {#symbol-tuning-column-gap-value}
- Type: variable

#### `tuning-hold-still` {#symbol-tuning-hold-still}
- Type: variable

#### `tuning-hover-dim-connections` {#symbol-tuning-hover-dim-connections}
- Type: variable

#### `tuning-hover-dim-connections-value` {#symbol-tuning-hover-dim-connections-value}
- Type: variable

#### `tuning-hover-dim-symbols` {#symbol-tuning-hover-dim-symbols}
- Type: variable

#### `tuning-hover-dim-symbols-value` {#symbol-tuning-hover-dim-symbols-value}
- Type: variable

#### `tuning-lace-curl` {#symbol-tuning-lace-curl}
- Type: variable

#### `tuning-lace-curl-value` {#symbol-tuning-lace-curl-value}
- Type: variable

#### `tuning-lace-reach` {#symbol-tuning-lace-reach}
- Type: variable

#### `tuning-lace-reach-value` {#symbol-tuning-lace-reach-value}
- Type: variable

#### `tuning-lace-width` {#symbol-tuning-lace-width}
- Type: variable

#### `tuning-lace-width-value` {#symbol-tuning-lace-width-value}
- Type: variable

#### `tuning-move-ms` {#symbol-tuning-move-ms}
- Type: variable

#### `tuning-move-ms-value` {#symbol-tuning-move-ms-value}
- Type: variable

#### `tuning-order-starts` {#symbol-tuning-order-starts}
- Type: variable

#### `tuning-order-starts-value` {#symbol-tuning-order-starts-value}
- Type: variable

#### `tuning-search-patience` {#symbol-tuning-search-patience}
- Type: variable

#### `tuning-search-patience-value` {#symbol-tuning-search-patience-value}
- Type: variable

#### `tuning-search-starts` {#symbol-tuning-search-starts}
- Type: variable

#### `tuning-search-starts-value` {#symbol-tuning-search-starts-value}
- Type: variable

#### `tuning-self-loop-taper` {#symbol-tuning-self-loop-taper}
- Type: variable

#### `tuning-self-loop-taper-value` {#symbol-tuning-self-loop-taper-value}
- Type: variable

#### `tuning-strain-nudge` {#symbol-tuning-strain-nudge}
- Type: variable

#### `tuning-strain-nudge-value` {#symbol-tuning-strain-nudge-value}
- Type: variable

#### `tuning-stub-factor` {#symbol-tuning-stub-factor}
- Type: variable

#### `tuning-stub-factor-value` {#symbol-tuning-stub-factor-value}
- Type: variable

#### `tuning-stub-max-offset` {#symbol-tuning-stub-max-offset}
- Type: variable

#### `tuning-stub-max-offset-value` {#symbol-tuning-stub-max-offset-value}
- Type: variable

#### `tuning-stub-min` {#symbol-tuning-stub-min}
- Type: variable

#### `tuning-stub-min-value` {#symbol-tuning-stub-min-value}
- Type: variable

#### `tuning-symbol-order` {#symbol-tuning-symbol-order}
- Type: variable

#### `tuning-vertical-offset` {#symbol-tuning-vertical-offset}
- Type: variable

#### `tuning-vertical-offset-value` {#symbol-tuning-vertical-offset-value}
- Type: variable

#### `view-circuit` {#symbol-view-circuit}
- Type: variable

#### `view-graph` {#symbol-view-graph}
- Type: variable

#### `view-map` {#symbol-view-map}
- Type: variable

#### `view-membrane` {#symbol-view-membrane}
- Type: variable

#### `view-sources` {#symbol-view-sources}
- Type: variable

#### `view-world` {#symbol-view-world}
- Type: variable

#### `world-root` {#symbol-world-root}
- Type: variable
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `./static/index.js`
- `./static/styles.css`
<!-- LIVE-DOC:END Dependencies -->
