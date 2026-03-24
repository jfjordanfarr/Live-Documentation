# packages/scripts/src/live-docs/explorer/shared/template.html

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/shared/template.html
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-shared-template-html
- Generated At: 2026-03-23T20:05:55.241Z

## Authored
### Purpose

The single-page HTML shell for the Live Docs Explorer static site. Defines the full DOM skeleton — sidebar, view containers (Circuit Board, Local Map, Force Graph, Knowledge Sources), pathfinding toolbar, detail panel, and all interactive controls. Every `id` attribute in this file constitutes the Explorer's public DOM API; client TypeScript modules bind to these ids via `getElementById()` at startup.

### Notes

- Created [2025-11-22](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-24.SUMMARIZED.md) as part of the initial Explorer server scaffolding (`f1e2dec0`).
- Relocated from `server/template.html` to `shared/template.html` on [2026-03-09](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-09.1.md) during the server retirement that consolidated all Explorer build-time utilities into the `shared/` module.
- Its `id` attributes are extracted as public symbols by the HTML adapter ([html.ts](../../../../../shared/src/live-docs/adapters/html.ts.mdmd.md)), enabling Live Documentation to track which client modules depend on which DOM elements.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-23T20:05:55.241Z","inputHash":"2c023c1865014d5c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `circuit-connections` {#symbol-circuitconnections}
- Type: variable

#### `circuit-container` {#symbol-circuitcontainer}
- Type: variable

#### `circuit-viewport` {#symbol-circuitviewport}
- Type: variable

#### `context-bar` {#symbol-contextbar}
- Type: variable

#### `context-name` {#symbol-contextname}
- Type: variable

#### `controls` {#symbol-controls}
- Type: variable

#### `detail-body` {#symbol-detailbody}
- Type: variable

#### `detail-close` {#symbol-detailclose}
- Type: variable

#### `detail-panel` {#symbol-detailpanel}
- Type: variable

#### `detail-title` {#symbol-detailtitle}
- Type: variable

#### `download-doc-btn` {#symbol-downloaddocbtn}
- Type: variable

#### `filter-toggle-assets` {#symbol-filtertoggleassets}
- Type: variable

#### `filter-toggle-related-docs` {#symbol-filtertogglerelateddocs}
- Type: variable

#### `filter-toggle-tests` {#symbol-filtertoggletests}
- Type: variable

#### `graph-svg` {#symbol-graphsvg}
- Type: variable

#### `main` {#symbol-main}
- Type: variable

#### `map-connections` {#symbol-mapconnections}
- Type: variable

#### `map-container` {#symbol-mapcontainer}
- Type: variable

#### `map-viewport` {#symbol-mapviewport}
- Type: variable

#### `membrane-connections` {#symbol-membraneconnections}
- Type: variable

#### `membrane-container` {#symbol-membranecontainer}
- Type: variable

#### `membrane-viewport` {#symbol-membraneviewport}
- Type: variable

#### `omnisearch` {#symbol-omnisearch}
- Type: variable

#### `omnisearch-input` {#symbol-omnisearchinput}
- Type: variable

#### `omnisearch-results` {#symbol-omnisearchresults}
- Type: variable

#### `omnisearch-trigger` {#symbol-omnisearchtrigger}
- Type: variable

#### `open-in-editor-btn` {#symbol-openineditorbtn}
- Type: variable

#### `pathfind-clear` {#symbol-pathfindclear}
- Type: variable

#### `pathfind-from` {#symbol-pathfindfrom}
- Type: variable

#### `pathfind-from-clear` {#symbol-pathfindfromclear}
- Type: variable

#### `pathfind-from-group` {#symbol-pathfindfromgroup}
- Type: variable

#### `pathfind-from-results` {#symbol-pathfindfromresults}
- Type: variable

#### `pathfind-from-symbol` {#symbol-pathfindfromsymbol}
- Type: variable

#### `pathfind-go` {#symbol-pathfindgo}
- Type: variable

#### `pathfind-path` {#symbol-pathfindpath}
- Type: variable

#### `pathfind-status` {#symbol-pathfindstatus}
- Type: variable

#### `pathfind-to` {#symbol-pathfindto}
- Type: variable

#### `pathfind-to-clear` {#symbol-pathfindtoclear}
- Type: variable

#### `pathfind-to-group` {#symbol-pathfindtogroup}
- Type: variable

#### `pathfind-to-results` {#symbol-pathfindtoresults}
- Type: variable

#### `pathfind-to-symbol` {#symbol-pathfindtosymbol}
- Type: variable

#### `pathfind-toolbar` {#symbol-pathfindtoolbar}
- Type: variable

#### `sidebar` {#symbol-sidebar}
- Type: variable

#### `sidebar-toggle` {#symbol-sidebartoggle}
- Type: variable

#### `sources-container` {#symbol-sourcescontainer}
- Type: variable

#### `stats-line` {#symbol-statsline}
- Type: variable

#### `tuning-alchemy-glow` {#symbol-tuningalchemyglow}
- Type: variable

#### `tuning-column-gap` {#symbol-tuningcolumngap}
- Type: variable

#### `tuning-column-gap-value` {#symbol-tuningcolumngapvalue}
- Type: variable

#### `tuning-double-click-recenter` {#symbol-tuningdoubleclickrecenter}
- Type: variable

#### `tuning-hover-dim-connections` {#symbol-tuninghoverdimconnections}
- Type: variable

#### `tuning-hover-dim-connections-value` {#symbol-tuninghoverdimconnectionsvalue}
- Type: variable

#### `tuning-hover-dim-symbols` {#symbol-tuninghoverdimsymbols}
- Type: variable

#### `tuning-hover-dim-symbols-value` {#symbol-tuninghoverdimsymbolsvalue}
- Type: variable

#### `tuning-self-loop-taper` {#symbol-tuningselflooptaper}
- Type: variable

#### `tuning-self-loop-taper-value` {#symbol-tuningselflooptapervalue}
- Type: variable

#### `tuning-single-click-focus` {#symbol-tuningsingleclickfocus}
- Type: variable

#### `tuning-stub-factor` {#symbol-tuningstubfactor}
- Type: variable

#### `tuning-stub-factor-value` {#symbol-tuningstubfactorvalue}
- Type: variable

#### `tuning-stub-max-offset` {#symbol-tuningstubmaxoffset}
- Type: variable

#### `tuning-stub-max-offset-value` {#symbol-tuningstubmaxoffsetvalue}
- Type: variable

#### `tuning-stub-min` {#symbol-tuningstubmin}
- Type: variable

#### `tuning-stub-min-value` {#symbol-tuningstubminvalue}
- Type: variable

#### `tuning-type-badges` {#symbol-tuningtypebadges}
- Type: variable

#### `tuning-vertical-offset` {#symbol-tuningverticaloffset}
- Type: variable

#### `tuning-vertical-offset-value` {#symbol-tuningverticaloffsetvalue}
- Type: variable

#### `view-circuit` {#symbol-viewcircuit}
- Type: variable

#### `view-graph` {#symbol-viewgraph}
- Type: variable

#### `view-map` {#symbol-viewmap}
- Type: variable

#### `view-membrane` {#symbol-viewmembrane}
- Type: variable

#### `view-sources` {#symbol-viewsources}
- Type: variable
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `./static/index.js`
- `./static/styles.css`
<!-- LIVE-DOC:END Dependencies -->
