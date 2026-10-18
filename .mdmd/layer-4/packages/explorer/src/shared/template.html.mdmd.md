# packages/explorer/src/shared/template.html

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/shared/template.html
- Generated At: 2026-10-18T20:50:52.294Z

## Authored
### Purpose

The single-page HTML shell for the Live Docs Explorer static site. Defines the full DOM skeleton — sidebar, the search bar, Knowledge Sources, World Map, and the Local Map’s 2D/3D containers with the path's report, detail panel, and all interactive controls. Every `id` attribute in this file constitutes the Explorer's public DOM API; client TypeScript modules bind to these ids via `getElementById()` at startup.

### Notes

- Created [2025-11-22](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-24.SUMMARIZED.md) as part of the initial Explorer server scaffolding (`f1e2dec0`).
- Relocated from `server/template.html` to `shared/template.html` on [2026-03-09](../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-09.1.md) during the server retirement that consolidated all Explorer build-time utilities into the `shared/` module.
- Its `id` attributes are extracted as public symbols by the HTML adapter ([html.ts](../../../engine/src/live-docs/adapters/html.ts.mdmd.md)), enabling Live Documentation to track which client modules depend on which DOM elements.
- The search bar (2026-10-14, [Turn 6](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6)): `search-subject` with its results, and `search-destination-field` with the map marker, `search-destination`, its clear button and its results, at the top of `main`, which is a column with the views in `views` under the bar; the Ctrl+P dialog (`omnisearch`) and the sidebar's Search button, and the FROM/TO toolbar (`pathfind-toolbar` and its fields, dropdowns and buttons), are gone. The path's report (`path-report`) keeps `pathfind-status` and `pathfind-path` at the top of the Local Map.
- The pathfinder's status (`pathfind-status`) is a line of its own under the input row since [Turn 10 of 2026-10-01](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10), because it can hold a sentence and a link (the reverse question offered when a path runs against the map's direction).
- The Tuning section's Local Map subsection gained the laces' sliders on 2026-10-06 (`tuning-lace-reach`, `tuning-lace-curl`, `tuning-lace-width`), beside the taper now labelled Lace Taper, each with a title saying what it moves ([Turn 13](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-13)); a `tuning-lace-inset` slider of the same day was removed on 2026-10-07, when the laces became cut by the card's edge, and the reach's title now says it is measured from that edge.
- Click Behavior and Visual tuning subsections removed in [Dev Day 83](../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md) as dead code — their checkbox controls were eliminated along with the corresponding `ClickBehaviorTuning`/`VisualTuning` type interfaces.
- The Local Map subsection gained the Move slider (`tuning-move-ms`, 0 to 1,200 ms by 50) and the Hold Still select (`tuning-hold-still`: the last clicked card, or the last clicked or hovered) on 2026-10-07, for the animated re-layout.
- The Local Map subsection gained the Order Starts slider (`tuning-order-starts`, 0 to 16) and the continuing search's Search Starts (`tuning-search-starts`, 0 to 128, zero off) and Search Patience (`tuning-search-patience`, 1 to 32) on 2026-10-07.
- The Local Map subsection gained the Churn Cost slider (`tuning-churn-cost`, 0 to 400 by 10) later on 2026-10-07, and the Order Starts slider's default fell to 2.
- The Membrane Evenness and Row Levelness sliders (2026-10-07) stand after Column Gap in the Local Map group, 0 to 5 by a quarter, evenness at 1 by default.
- The 3D Layout group gained Gravity (`tuning-force-gravity`, 0 to 0.3 by 0.005) and Repulsion Reach (`tuning-force-charge-range`, 0 to 1,000 by 10, zero unbounded) on 2026-10-17, so that the owner can "toy around with how to keep things from wiggling around too much too quickly" by hand ([the October 17 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-3)).
- The same group gained Update Energy (`tuning-force-update-energy`, 0 to 1 by 0.01, 0.1 by default) on 2026-10-18 for ticket C2 of [the change-over-time plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions): how much a change to what is shown stirs the picture, the full reheat at 1, placement alone at 0, with a title that says so; the three settings the plan named are three places on one slider, as the owner asked for options to taste rather than a choice made for them.

Tuning's History group (2026-10-18, the plan's C4 and C14): the scrubber's axis, its ticks and the play rate, shown with the 3D groups.
- The 3D group gained Spring Strength (`tuning-force-link-strength`, 0 to 2 by 0.05, 1 by default) on 2026-10-18, with a title that says what one and zero mean, so that the owner can tune the pull between connected neighbours by eye beside Gravity and Repulsion Reach ([Turn 7](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-7)).
- The Gravity and Spring Strength sliders start at 0.01 and 0.25 since the evening of 2026-10-18, the owner's settings by eye ([Turn 9](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-9)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
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

#### `export-layout-settings` {#symbol-export-layout-settings}
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

#### `path-report` {#symbol-path-report}
- Type: variable

#### `pathfind-path` {#symbol-pathfind-path}
- Type: variable

#### `pathfind-status` {#symbol-pathfind-status}
- Type: variable

#### `search-bar` {#symbol-search-bar}
- Type: variable

#### `search-destination` {#symbol-search-destination}
- Type: variable

#### `search-destination-clear` {#symbol-search-destination-clear}
- Type: variable

#### `search-destination-field` {#symbol-search-destination-field}
- Type: variable

#### `search-destination-results` {#symbol-search-destination-results}
- Type: variable

#### `search-subject` {#symbol-search-subject}
- Type: variable

#### `search-subject-field` {#symbol-search-subject-field}
- Type: variable

#### `search-subject-results` {#symbol-search-subject-results}
- Type: variable

#### `sidebar` {#symbol-sidebar}
- Type: variable

#### `sidebar-toggle` {#symbol-sidebar-toggle}
- Type: variable

#### `sources-container` {#symbol-sources-container}
- Type: variable

#### `stats-line` {#symbol-stats-line}
- Type: variable

#### `tuning-band-gap` {#symbol-tuning-band-gap}
- Type: variable

#### `tuning-band-gap-value` {#symbol-tuning-band-gap-value}
- Type: variable

#### `tuning-churn-cost` {#symbol-tuning-churn-cost}
- Type: variable

#### `tuning-churn-cost-value` {#symbol-tuning-churn-cost-value}
- Type: variable

#### `tuning-column-gap` {#symbol-tuning-column-gap}
- Type: variable

#### `tuning-column-gap-value` {#symbol-tuning-column-gap-value}
- Type: variable

#### `tuning-force-charge` {#symbol-tuning-force-charge}
- Type: variable

#### `tuning-force-charge-range` {#symbol-tuning-force-charge-range}
- Type: variable

#### `tuning-force-charge-range-value` {#symbol-tuning-force-charge-range-value}
- Type: variable

#### `tuning-force-charge-value` {#symbol-tuning-force-charge-value}
- Type: variable

#### `tuning-force-collision-gap` {#symbol-tuning-force-collision-gap}
- Type: variable

#### `tuning-force-collision-gap-value` {#symbol-tuning-force-collision-gap-value}
- Type: variable

#### `tuning-force-coupling` {#symbol-tuning-force-coupling}
- Type: variable

#### `tuning-force-coupling-value` {#symbol-tuning-force-coupling-value}
- Type: variable

#### `tuning-force-gravity` {#symbol-tuning-force-gravity}
- Type: variable

#### `tuning-force-gravity-value` {#symbol-tuning-force-gravity-value}
- Type: variable

#### `tuning-force-link-gap` {#symbol-tuning-force-link-gap}
- Type: variable

#### `tuning-force-link-gap-value` {#symbol-tuning-force-link-gap-value}
- Type: variable

#### `tuning-force-link-strength` {#symbol-tuning-force-link-strength}
- Type: variable

#### `tuning-force-link-strength-value` {#symbol-tuning-force-link-strength-value}
- Type: variable

#### `tuning-force-node-size` {#symbol-tuning-force-node-size}
- Type: variable

#### `tuning-force-node-size-value` {#symbol-tuning-force-node-size-value}
- Type: variable

#### `tuning-force-symbol-scale` {#symbol-tuning-force-symbol-scale}
- Type: variable

#### `tuning-force-symbol-scale-value` {#symbol-tuning-force-symbol-scale-value}
- Type: variable

#### `tuning-force-update-energy` {#symbol-tuning-force-update-energy}
- Type: variable

#### `tuning-force-update-energy-value` {#symbol-tuning-force-update-energy-value}
- Type: variable

#### `tuning-height-cost` {#symbol-tuning-height-cost}
- Type: variable

#### `tuning-height-cost-value` {#symbol-tuning-height-cost-value}
- Type: variable

#### `tuning-history-axis` {#symbol-tuning-history-axis}
- Type: variable

#### `tuning-history-granularity` {#symbol-tuning-history-granularity}
- Type: variable

#### `tuning-history-play-rate` {#symbol-tuning-history-play-rate}
- Type: variable

#### `tuning-history-play-rate-value` {#symbol-tuning-history-play-rate-value}
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

#### `tuning-item-gap` {#symbol-tuning-item-gap}
- Type: variable

#### `tuning-item-gap-value` {#symbol-tuning-item-gap-value}
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

#### `tuning-membrane-evenness` {#symbol-tuning-membrane-evenness}
- Type: variable

#### `tuning-membrane-evenness-value` {#symbol-tuning-membrane-evenness-value}
- Type: variable

#### `tuning-membrane-simplicity` {#symbol-tuning-membrane-simplicity}
- Type: variable

#### `tuning-membrane-simplicity-value` {#symbol-tuning-membrane-simplicity-value}
- Type: variable

#### `tuning-move-ms` {#symbol-tuning-move-ms}
- Type: variable

#### `tuning-move-ms-value` {#symbol-tuning-move-ms-value}
- Type: variable

#### `tuning-order-starts` {#symbol-tuning-order-starts}
- Type: variable

#### `tuning-order-starts-value` {#symbol-tuning-order-starts-value}
- Type: variable

#### `tuning-row-levelness` {#symbol-tuning-row-levelness}
- Type: variable

#### `tuning-row-levelness-value` {#symbol-tuning-row-levelness-value}
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

#### `view-graph` {#symbol-view-graph}
- Type: variable

#### `view-map` {#symbol-view-map}
- Type: variable

#### `view-sources` {#symbol-view-sources}
- Type: variable

#### `view-world` {#symbol-view-world}
- Type: variable

#### `views` {#symbol-views}
- Type: variable

#### `world-root` {#symbol-world-root}
- Type: variable
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `./static/index.js`
- `./static/styles.css`
<!-- LIVE-DOC:END Dependencies -->
