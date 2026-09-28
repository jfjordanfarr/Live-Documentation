# Boards inside boards, and groups as levels of abstraction: how canvases and diagram tools answer it

_A survey gathered on 2026-09-28 by a subagent with web access, for two questions the owner asked once the board text was proposed: could a whole board be a thing on another board, and should a group be a black box, with Obsidian Canvas named as worth understanding. The owner then called the first a stretch goal, so nothing here was built; the board text's `Holds` is the declared, nestable membership every tool that reasons about groups uses. The survey records what existed on that date, with a source for every claim, and decides nothing. The agent's judgement is at the end._

## Prior art: boards inside boards, groups as levels of abstraction (surveyed 2026-09-28)

Gathered for two questions the owner asked: could a whole board be a thing on another board, and should a group behave as a black box. Every claim cites the page it was read from; versions and dates are given where the page states them. Nothing here decides anything.

### A. Obsidian Canvas and JSON Canvas

**JSON Canvas 1.0** (the spec page states version 1.0, dated 2024-03-11; https://jsoncanvas.org/spec/1.0/).

- Top level: two optional arrays, `nodes` and `edges`.
- Every node: `id`, `type` (`text`, `file`, `link`, `group`), `x`, `y`, `width`, `height` in pixels, optional `color`.
- Text nodes carry `text` (Markdown). File nodes carry `file` (a path) and optional `subpath` (starts with `#`). Link nodes carry `url`.
- Group nodes carry optional `label`, `background` (path to an image) and `backgroundStyle` (`cover`, `ratio`, `repeat`).
- Colors are hex strings or presets `"1"` to `"6"` (red, orange, yellow, green, cyan, purple); the preset values "are intentionally not defined".
- The spec's only words on containment: "Group type nodes are used as a visual container for nodes within it." No field names a node's group; there is no parent or children field. A node is "within" a group only by lying inside its rectangle.
- The only ordering rule is z-order: "Nodes are placed in the array in ascending order by z-index. The first node in the array should be displayed below all other nodes, and the last node in the array should be displayed on top of all other nodes."
- The spec says nothing about nesting one group in another.
- Edges: `id`, `fromNode`, `toNode` (required); `fromSide` and `toSide` (`top`, `right`, `bottom`, `left`); `fromEnd` (defaults to `none`) and `toEnd` (defaults to `arrow`), each `none` or `arrow`; optional `color` and `label`. An edge names a whole node and a whole side, not a member of a group and not a port.

**Obsidian's Canvas help** (https://obsidian.md/help/plugins/canvas; `help.obsidian.md/plugins/canvas` redirects there; source text at https://raw.githubusercontent.com/obsidianmd/obsidian-help/master/en/Plugins/Canvas.md; no version or date on the page).

- Create a group from cards: "1. Select the cards. 2. Right-click any of the selected cards and then select Create group." An empty group: "Right-click the canvas and then select Create group."
- Rename: "Double-click the name of the group to edit it, and then press Enter to save."
- Colour: select cards or connections, choose "Set color", pick a colour. The page does not say what moves when a group moves, nor how a group is resized.
- "Zoom to fit" (Shift+1) zooms "so that every item is visible"; "Zoom to selection" (Shift+2) "so that all selected items are visible"; "Reset zoom" returns to the default level.
- The help page has no statement about what happens to cards or group labels when zooming out.
- "Obsidian saves canvases as `.canvas` files using the open JSON Canvas format."
- No limits are stated.

**Zoom simplification** is documented only in release notes. The help repository's `Release notes/v1.1.md` (headed "Part 2", "Released February 22, 2023"; https://github.com/obsidianmd/obsidian-help/blob/master/Release%20notes/v1.1.md) lists a new Canvas settings page with:

- "Options to hide the card labels."
- "Configurable zoom threshold for when cards switch from showing their content to just showing the card title."
- The same notes add group background images ("cover the entire group or be used as a repeating pattern") and a "Jump to group" command that pans to a group by name.
- No rule for group labels at zoom is stated on any page fetched.

**Canvas inside canvas.**

- The product page says "Canvas views can be embedded in notes, and even nested within another Canvas" and lists "Nested canvas" among card types (https://obsidian.md/canvas).
- The help's embed page gives the syntax `![[My canvas.canvas]]` and a callout headed "Canvas embeds show shapes only": "Embedded canvases display shapes but not the text inside cards. To view the full canvas, open it directly." (https://raw.githubusercontent.com/obsidianmd/obsidian-help/master/en/Linking%20notes%20and%20files/Embed%20files.md)
- In JSON Canvas terms a nested canvas is a `file` node whose `file` is a `.canvas` path; the spec has no separate type for it.
- No fetched page describes how a nested canvas card is entered, and none describes edges between the outer canvas and anything inside the nested one.

### B. Collapsing groups in diagram tools

| Tool           | Membership                       | Collapse control                 | Boundary when closed                |
| -------------- | -------------------------------- | -------------------------------- | ----------------------------------- |
| draw.io        | child cells of a container cell  | `-` / `+` at top left            | not described in the docs fetched   |
| yEd            | children of a group node         | double-click; Open / Close Group | edges re-attached to the group node |
| Graphviz dot   | node inside a `cluster` subgraph | none (static drawing)            | edge clipped at the cluster line    |
| Cytoscape.js   | `data.parent`                    | extension cues                   | "meta edges" to the collapsed node  |
| ELK            | child nodes of a node            | none (layout only)               | hierarchical ports on the parent    |
| Figma sections | layers inside a section          | none documented                  | not applicable                      |
| tldraw frames  | reparented when dropped inside   | none documented                  | not applicable                      |

**draw.io** (https://www.drawio.com/docs/manual/shapes/container-shapes/, no date; blog https://drawio-app.com/blog/create-a-container-shape-in-draw-io/, June 8, 2017).

- "Container shapes are special shapes that can contain other shapes." A shape joins one by dropping it "when the outline is purple"; any shape becomes a container with Ctrl+G.
- "Most container shapes allow you to expand or collapse them by clicking on a `-` or `+` in the top left of the shape." The control is toggled under Extras > Collapse/Expand.
- "Connectors can connect to shapes across the boundaries of their parent containers."
- Blog: "When you move a container around on the drawing area, the shapes located within will move with the container", and "You will see a clearer overview of a busy diagram when the container shapes are collapsed."
- Storage is the mxGraph model. `mxCell.collapsed`: "Specifies whether the cell is collapsed. Default is false." (https://jgraph.github.io/mxgraph/docs/js-api/files/model/mxCell-js.html)
- `mxGeometry.alternateBounds` "Stores alternate values for x, y, width and height in a rectangle"; `swap` exchanges them with the live bounds (https://jgraph.github.io/mxgraph/docs/js-api/files/model/mxGeometry-js.html).
- `updateAlternateBounds` sets them "depending on whether the cell is going to be collapsed. The top, left corner is always kept at the same location"; `collapseToPreferredSize` "Specifies if the cell size should be changed to the preferred size when a cell is first collapsed" (https://jgraph.github.io/mxgraph/docs/js-api/files/view/mxGraph-js.html).
- So a collapsed container is the same cell drawn at its alternate rectangle. None of these pages says what connectors to hidden children look like once the container is closed.

**yEd** (https://yed.yworks.com/support/manual/hierarchy.html, no version on the page).

- "A node that contains another graph structure is called a group node."
- "When closed, their contained graph structure is not accessible and thus cannot be edited. When open, the nodes and edges contained in a group node are shown inside its bounds."
- Grouping creates "a new group node and making the selected nodes children of the newly created group node."
- "Double-clicking on a group node triggers the View Group Content action"; menus offer Open Group and Close Group.
- "The closed group nodes display an image of their contained graph structures (optional setting)."
- Edges: "Original edges will be represented by edges that connect to the node in which the subgraph is nested in. When opening group nodes or unpacking the contents of a group node again, the original edges will be restored."

**Graphviz** (https://graphviz.org/docs/attrs/compound/, https://graphviz.org/docs/attrs/lhead/, https://graphviz.org/docs/attrs/ltail/).

- `compound` is a graph attribute, type bool, default false, "dot only": "If true, allow edges between clusters".
- `lhead`: "When compound is true, if lhead is defined and is the name of a cluster containing the real head, the edge is clipped to the boundary of the cluster." `ltail` is the same for the tail.
- The real endpoint stays a node inside the cluster; only the drawing stops at the boundary.

**Cytoscape.js** (https://js.cytoscape.org/; source text at https://raw.githubusercontent.com/cytoscape/cytoscape.js/unstable/documentation/md/notation.md and `style.md` beside it).

- "Compound nodes are specified via the `parent` field in a nodes's `data`."
- "A compound parent node does not have independent dimensions (position and size), as those values are automatically inferred by the positions and dimensions of the descendant nodes."
- "As far as the API is concerned, compound nodes are treated just like regular nodes", so `neighborhood()` on a parent does not include what its descendants connect to.
- Style: `compound-sizing-wrt-labels` (`include` or `exclude`), `padding`, and `min-width` / `min-height` "for a compound parent node".
- The expand-collapse extension (https://github.com/iVis-at-Bilkent/cytoscape.js-expand-collapse) gives "an interface to expand/collapse nodes and edges for better management of complexity of Cytoscape.js compound graphs".
- Collapsing a parent hides its children; edges from or to hidden children become "meta edges" to the collapsed node; several can be merged into one edge carrying `directionType` (`unidirection` or `bidirection`) and the class `cy-expand-collapse-collapsed-edge`; `groupEdgesOfSameTypeOnCollapse` merges by the field named in `edgeTypeInfo` (default `edgeType`).
- `+` / `-` cues sit on the compound node; hidden children are kept and returned by `getCollapsedChildren()`; `collapseRecursively`, `expandAll` and undo exist.
- The README states the repository "is no longer being maintained".

**Eclipse Layout Kernel** (https://eclipse.dev/elk/documentation/tooldevelopers/graphdatastructure.html; https://eclipse.dev/elk/reference/options/org-eclipse-elk-hierarchyHandling.html; https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-layered.html).

- Nodes "can contain child nodes"; one with children is "hierarchical", one without is "simple".
- "Ports represent explicit attachment points provided by nodes. Each port belongs to exactly one node." A hierarchical port is "a port on a hierarchical node that has incident hierarchical edges": a port on the parent that an edge from inside reaches.
- Edges crossing hierarchy are "short hierarchical" (one level) or "long hierarchical" (several); an edge belongs to "the lowest common ancestor of all end points".
- `org.eclipse.elk.hierarchyHandling`: `INHERIT` (default), `INCLUDE_CHILDREN` (the node and its descendants are laid out together "until a descendant is encountered which has its hierarchy handling set to SEPARATE_CHILDREN", which "allows cross-hierarchical edges to be laid out properly"), or `SEPARATE_CHILDREN` (separate runs).
- ELK Layered lists the features "Compound: Edges that connect nodes from different hierarchy levels and are incident to compound nodes" and "Clusters: Edges that connect nodes from different clusters, but not the cluster parent nodes".
- No ELK page fetched collapses anything; it lays out what it is given.

**Figma sections** (https://help.figma.com/hc/en-us/articles/9771500257687-Organize-your-canvas-with-sections, no date).

- "Sections in Figma Design are a top-level element on the canvas by default. Sections can contain all layer types, including other sections, but cannot be contained within frames or groups."
- Created with the Section tool or Shift+S, by dragging over objects, or by "Wrap in new section".
- A section can be marked "Ready for dev"; later edits flip its status to "Changed".
- Nothing on the page collapses a section or describes its label at zoom.

**tldraw frames and groups** (https://tldraw.dev/sdk-features/frame-shape; https://tldraw.dev/sdk-features/groups).

- A frame is "a container with a labeled header that holds other shapes"; "the frame tool reparents any sibling shapes that fall fully inside the frame's bounds".
- "Moving the frame moves every descendant; rotating the frame rotates them too."
- "Frames clip their children to the frame's rectangle during rendering", but "Arrows are exempt from clipping so connectors can leave a frame."
- "Every frame renders a heading above its top edge that displays the frame's `name` property"; the heading "rotates with the frame to stay above whichever edge is currently 'up'".
- Groups "draw nothing of their own apart from a dashed outline while the group is focused", "can contain other groups", and dissolve when reduced to one child.
- Neither page mentions collapsing.

### C. Diagrams that contain diagrams

**C4 and Structurizr.**

- A system landscape diagram is "really just a system context diagram without a specific focus on a particular software system": "a map of the software systems within the chosen scope, with a set of system context, container, component, and code diagrams for each software system of interest" (https://c4model.com/diagrams/system-landscape).
- In the DSL a `softwareSystem` contains `container`s, which contain `component`s; a view names the element in scope, and `include *` on a system context view means "the software system in scope; plus all people and software systems that are directly connected" (https://docs.structurizr.com/dsl/language; the page lists "Binaries - v2026.09.19").
- Navigation: "Double-clicking a software system will either take you to the System Context or Container diagram for that software system, if one exists"; "Double-clicking a container will take you to the first Component diagram for that container, if one exists"; elements with a further diagram carry a zoom-in symbol; a mix of targets opens "a modal from which you can choose where to go next" (https://docs.structurizr.com/ui/diagrams/navigation).
- Implied relationships are the rule for a closed box's wires. The DSL cookbook: a relationship from a person to a container inside a system implies one from the person to the system; the DSL "uses the CreateImpliedRelationshipsUnlessAnyRelationshipExistsStrategy", which "prevents multiple implied relationships from being created"; `!impliedRelationships false` turns it off (https://docs.structurizr.com/dsl/cookbook/implied-relationships/).
- The strategies, read from source (https://github.com/structurizr/java/tree/master/structurizr-core/src/main/java/com/structurizr/model):

| Strategy                                                         | Rule                                                                                                                              |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `DefaultImpliedRelationshipsStrategy`                            | "The default strategy is to NOT create implied relationships."                                                                    |
| `CreateImpliedRelationshipsUnlessAnyRelationshipExistsStrategy`  | walks every source ancestor against every destination ancestor; creates one "unless any relationship already exists between them" |
| `CreateImpliedRelationshipsUnlessSameRelationshipExistsStrategy` | same walk; creates one "unless the same relationship already exists between them" (matched by description)                        |

- `AbstractImpliedRelationshipsStrategy` refuses an implied relationship when source equals destination or when either is an ancestor of the other (people are exempt from that check), copies the description and technology, and records the originating relationship in `linkedRelationshipId`.
- The Java docs page for these strategies (`docs.structurizr.com/java/model/implied-relationships`) returned 404 on 2026-09-28.

**FINOS CALM** (schema `$id` `https://calm.finos.org/release/1.0/meta/core.json`, read at https://raw.githubusercontent.com/finos/architecture-as-code/main/calm/release/1.0/meta/core.json; docs https://calm.finos.org/core-concepts/nodes/).

- A node needs `unique-id`, `node-type`, `name`, `description`; `node-type` is one of `actor`, `ecosystem`, `system`, `service`, `database`, `network`, `ldap`, `webclient`, `data-asset`.
- `details` holds `detailed-architecture` (string) and `required-pattern` (string). The docs: `detailed-architecture` "Allows for linking to a more detailed architectural representation of the node, which can be useful for complex systems or nested architectures"; `required-pattern` is "The pattern that the detailed architecture must conform to".
- Relationship types: `interacts` (an actor plus nodes), `connects` (source and destination interfaces), `deployed-in` and `composed-of` (each a `container` plus a list of `nodes`), and `options`.
- Nothing fetched says how the outer architecture's relationships map onto the linked file.

**Ilograph.**

- "A resource can have one or more child resources. Child resources can be declared under a parent resource using its children property"; the name is the identifier; abstract resources "cannot be referenced in perspectives" (https://www.ilograph.com/docs/editing/resources/).
- "A resource can have many child resources, but a resource can have only one parent resource"; parents "appear as context nodes in the perspective" (https://www.ilograph.com/blog/posts/idl-3, June 9, 2019).
- The spec's top level is "An array of resources (the resource tree)"; relations have `from` and `to`; perspectives have `extends` and `overrides` (https://www.ilograph.com/docs/spec/, page states last updated August 29, 2026).
- Viewer: "Diagram viewers can adjust the level of detail using the slider in the top-right of the app. As they do so, resources will expand and collapse to show (or hide) their child resources." A detail override of `minimize` keeps a resource "collapsed regardless of what the viewer sets the detail level to"; `maximize` keeps it expanded; "a maximized resource will still collapse if its parent resource (if it has one) becomes collapsed" (https://www.ilograph.com/docs/editing/perspectives/resource-sizes-and-positions/).
- Entering: "Only resources with child resources can be focused on"; "Clicking on a resource selects that resource. When a resource is selected, unrelated resources are hidden"; "Clicking on a selected resource selects its parent resource, if it has one" (https://www.ilograph.com/docs/getting-started/browsing-diagrams/).
- No fetched page states how a relation between two hidden children is drawn between their collapsed parents.

**IcePanel** (https://docs.icepanel.io/core-features/diagramming and https://docs.icepanel.io/core-features/modelling, navigation "updated in March 2026"; https://icepanel.io/blog/new-releases-nested-groups-connection-via, 15 Dec 2025).

- "The diagram hierarchy in IcePanel is based on the C4 model, with 3 levels of connected diagrams"; the model nests Organization, Landscape, Domain, then Actor, Group or System, then App or Store, then Component.
- Drill-down: "Clicking the [magnifier icon] at the top-left of an object in a diagram. A numeric indicator will show how many objects are nested within the object. If there are no nested objects, a blank diagram will be created at a lower level when you click on it." (The page shows the icon as a pictograph; it is replaced by words here.)
- Zooming into a system "will land on the first Level 2 App diagram within that system"; a custom landing diagram can be set per diagram.
- "Existing connections from lower levels in the C4 model can be reused at higher levels. These are called lower connections and will sync changes in the original connection. These connections will show if a relationship has been created between objects inside (child objects) of those 2 objects previously."
- Groups "can now be nested 5 levels deep by changing the parent to another Group" and gain a "Contains" field.

**Netflix Vizceral** (https://github.com/Netflix/vizceral/wiki/How-to-Use; https://github.com/Netflix/vizceral).

- "The graph format is essentially a root node that contains nodes and connections. Any node can also contain nodes and connections. This is how we allow the drill-down functionality."
- The root has `renderer: 'global'`; a region node has `renderer: 'region'` with its own `nodes`, `connections`, `maxVolume` and `updated`; connections carry `source`, `target` and `metrics`.
- "three levels of information, global, regional, and service-level, with clicking or double-clicking on a node bringing you one level deeper"; the component "will generate a 'global' graph showing all incoming traffic into each of the 'regions', with support for cross-region traffic".
- Levels are entered by click, not by zoom. The README says the project "is not actively being worked on".

**UML 2.5.1 and SysML 1.6** (read from the OMG PDFs at https://www.omg.org/spec/UML/2.5.1/PDF and https://www.omg.org/spec/SysML/1.6/PDF).

- UML: "Connectors have a kind, whose value is assembly or delegation"; "The semantics of delegation connectors are only related to Ports" (PDF p. 227). The kind is derived: "a Connector with one or more ends connected to a Port which is not on a Part and which is not a behavior port is a delegation; otherwise it is an assembly" (p. 269).
- UML 11.3.3.1 Ports: "A delegation Connector is a Connector that links a Port to a role within the owning EncapsulatedClassifier"; "A request that arrives at a Port that has a delegation Connector to one or more Properties or Ports on Properties will be passed on to those targets for handling" (p. 233).
- Same section: "Delegation Connectors can be used to model the hierarchical decomposition of behavior, where services provided by an EncapsulatedClassifier may ultimately be realized by one that is nested multiple levels deep within it"; "a delegating Port behaves, for connection, as though it had an internal 'face' that is the conjugate of its external 'face'".
- SysML 8.3.2.3: "A Binding Connector is a connector which specifies that the properties at both ends of the connector have equal values."
- SysML 8.3.1.2.6: "A NestedConnectorEnd stereotype of a UML ConnectorEnd is automatically applied to any connector end that is nested more than one level deep within a containing context."
- SysML 8.3.1.2.2: the internal block diagram's frame heading "shall identify the name of a SysML block", so the diagram's frame stands for the enclosing block.
- Read together: the closed box's door is a port on its boundary, and a delegation (UML) or binding (SysML) connector from that port to a part's port inside is what makes the door real.

### D. Level of detail by zoom

- Cytoscape.js `min-zoomed-font-size`: "If zooming makes the effective font size of the label smaller than this, then no label is shown" (https://raw.githubusercontent.com/cytoscape/cytoscape.js/unstable/documentation/md/style.md). Core options `hideEdgesOnViewport` ("not render edges while the viewport is being manipulated") and `textureOnViewport` (https://js.cytoscape.org/).
- Sigma.js defaults: `labelDensity: 1`, `labelGridCellSize: 100`, `labelRenderedSizeThreshold: 6`, `hideEdgesOnMove: false`, `hideLabelsOnMove: false`, `zoomToSizeRatioFunction: Math.sqrt` (https://github.com/jacomyal/sigma.js/blob/main/packages/sigma/src/settings.ts); the typedoc page gives types only (https://www.sigmajs.org/docs/typedoc/sigma/src/settings/interfaces/Settings/).
- Sigma's renderer skips a label when the node's scaled size is below the threshold unless `forceLabel` is set (https://github.com/jacomyal/sigma.js/blob/main/packages/sigma/src/sigma.ts) and rations the rest through a `LabelGrid`, "a 2D spatial grid divided into constant-size cells", whose per-cell quota is scaled by the camera ratio (https://github.com/jacomyal/sigma.js/blob/main/packages/sigma/src/core/labels.ts).
- The prose version is in ipysigma, a wrapper by the same lab: "sigma.js relies on a constant size grid to select the 'worthiest' labels to display, after taking camera zoom into account"; the threshold is the "minimum actual rendered size (after camera zoom operations) a node must have on screen for its label to be allowed to be displayed" (https://github.com/medialab/ipysigma/blob/master/README.md).
- Gephi: the quickstart lets you show labels, set their size "to 'node size'" and use a size slider; no zoom rule is stated (https://gephi.org/quickstart/).
- Holten 2006, hierarchical edge bundles: "we bend each adjacency edge, modeled as a B-spline curve, toward the polyline defined by the path via the inclusion edges from one node to another. This hierarchical bundling reduces visual clutter and also visualizes implicit adjacency edges between parent nodes that are the result of explicit adjacency edges between their respective child nodes" (IEEE TVCG 12(5), 741-748, Sep-Oct 2006, DOI 10.1109/TVCG.2006.147; abstract read from the PubMed record https://pubmed.ncbi.nlm.nih.gov/17080795/).
- Maps: zoom 0 is "whole world", 5 "large African country", 10 "metropolitan area", 13 "village, or suburb", 17 "block, park, addresses" (https://wiki.openstreetmap.org/wiki/Zoom_levels). Mapbox Streets v8 gives each layer a minimum zoom (building 13, road 3, place_label 0) and a `filterrank` that is "relative to the current zoom level" for label density (https://docs.mapbox.com/data/tilesets/reference/mapbox-streets-v8/).
- Obsidian: the configurable zoom threshold at which a card shows only its title, from A.

### What this says for the questions

1. A diagram as a node of another diagram.
   - Obsidian allows it: a `file` node pointing at a `.canvas`, drawn as shapes without text, with no edges of its own beyond what the outer canvas draws to the card.
   - CALM allows it by a string link (`detailed-architecture`) and says nothing about edges.
   - C4/Structurizr, IcePanel and Vizceral nest by model rather than by file: the outer element opens its own diagram on double-click or a magnifier icon, and its wires come from the children's wires (Structurizr's ancestor walk, IcePanel's "lower connections", Vizceral's generated global graph of inter-region traffic).
   - yEd, Cytoscape's extension, Graphviz and ELK do the same at draw time: an edge into a closed group is re-attached to the group (yEd), replaced by a meta edge (Cytoscape), clipped at the boundary (Graphviz) or brought to a hierarchical port (ELK).
   - UML and SysML make the boundary explicit: a port on the box, joined to a part's port inside by a delegation or binding connector.
2. Groups.
   - Declared membership: Cytoscape (`data.parent`), ELK, yEd, draw.io, Ilograph (`children`), Structurizr, IcePanel, Figma sections, tldraw (a `parentId` set when a shape is dropped fully inside a frame). Spatial only: JSON Canvas, where a group is "a visual container" with no membership field.
   - Nestable: all of the above; JSON Canvas is silent; Figma sections nest but cannot sit inside frames; IcePanel groups nest five deep.
   - Collapsible: draw.io containers, yEd groups, Cytoscape via the extension, Ilograph via a detail slider and per-resource overrides, IcePanel and Structurizr via per-level diagrams. Not documented for Obsidian groups, Figma sections or tldraw frames.
   - What a closed boundary shows: yEd draws the original edges re-attached to the group node and optionally a picture of the inside; Cytoscape draws meta edges, optionally merged by type; Graphviz clips the edge at the cluster line; ELK gives the parent ports; UML gives it typed ports whose inner face is the conjugate of the outer.
3. What changes at zoom.
   - Obsidian switches a card from content to title at a configurable threshold and can hide card labels; no group rule is documented.
   - Cytoscape drops a label when its effective font falls below `min-zoomed-font-size`; Sigma drops labels below a rendered-size threshold and rations the rest by a constant-size grid scaled with the camera.
   - Map tilesets give each layer a minimum zoom and rank labels relative to zoom. Holten bundles child edges into parent-level bundles by geometry, not by zoom.
   - Ilograph, Structurizr, IcePanel and Vizceral change level by an explicit slider, click or per-level diagram, not by the camera; Graphviz, ELK, yEd and draw.io have no zoom behaviour in the pages fetched.

### Not found

- Obsidian help: how a group moves or resizes with its cards; how a nested canvas card is entered; any zoom behaviour for group labels; any limits. The zoom threshold for cards appears only in the v1.1 release notes.
- JSON Canvas: any membership, nesting or containment rule for groups beyond the one sentence quoted.
- draw.io docs: what a collapsed container looks like and what happens to connectors of hidden children; only the mxGraph storage (`collapsed`, `alternateBounds`) is documented.
- Cytoscape.js core docs: whether an edge may name a compound parent as an endpoint.
- Ilograph: how a relation between two hidden children is drawn when both parents are collapsed.
- Sigma.js: official prose for the label settings (the typedoc lists types only); the explanation was taken from ipysigma's README and the sigma source.
- Figma, tldraw: any collapse of a section or frame; any statement on labels at zoom; tldraw's frame page does not say whether frames nest.
- Gephi: any zoom-dependent label rule in official documentation.
- Structurizr: the Java docs page on implied relationships (404); the strategies were read from source instead.
- SysML 1.6: a sentence saying ports may be drawn on the internal block diagram's frame; PDF pages 100 to 150 were searched without a hit.
- Miro frames and Excalidraw frames were not fetched; Figma sections and tldraw frames stood in for the modern canvas.
- Holten 2006 full text: the Eindhoven host did not resolve and IEEE returned an empty page; only the abstract was verified.

### The agent's judgement

_Read by the agent on 2026-09-28, after the survey above. A judgement, not a decision._

**A board as a thing.** The field does it two ways. By file link, as Obsidian's nested canvas, a card that shows shapes without text and carries no edges of its own, and as CALM's string that names a more detailed architecture and says nothing about edges. Or by model nesting, as C4 and Structurizr, IcePanel and Vizceral, where the outer element opens its own diagram and its wires come from the children's wires. Only the second gives the outer box its doors and wires, and the board text already has that form: a thing that holds things. If a board is ever named as another board's source, it should arrive as held things, not as a picture card; the owner called it a stretch goal and it stays one.

**A group as a black box.** Every tool that closes a group derives the closed box's wires from the children's and stores nothing: yEd re-attaches the original edges to the group node and restores them on opening, Cytoscape's extension draws meta edges that can merge by type, Graphviz clips at the cluster boundary, ELK routes to hierarchical ports on the parent, Structurizr's strategy walks every ancestor pair and creates one relationship unless one exists, IcePanel shows a lower connection whenever children are already connected, and UML makes the boundary a port with an inner face that is the conjugate of its outer. So the rule for a closed region on the World Map is the rule the docs already follow: derive, never store. A closed region shows on its boundary the doors its members serve to things outside it, and one wire per pair of things or regions, counted, from the members' wires; a wire from a member to its own region is not a wire, which is Structurizr's ancestor exception. The board text needs no field for it.

**Membership.** JSON Canvas groups are spatial, a visual container with no membership field, which is why Obsidian can nest them without declaring anything and also why nothing can reason about them. Every tool that lays out, collapses or implies edges declares membership. `Holds` is declared, and that is the right side of the line.

**Zoom.** Nothing surveyed collapses a group because the camera moved. Levels change by an explicit act, a click, a magnifier, a slider or a per-level diagram, and the camera changes only labels and detail: Obsidian's threshold at which a card shows only its title, Cytoscape's and Sigma's label thresholds, a map layer's minimum zoom. That matches the picture's rule that text never resizes and sharpens one thing: closing a region is a click on it, not a side effect of zooming out, while the transition into a thing's inside stays the zoom. Ilograph's per-resource minimize and maximize is the one place a saved open-or-closed state exists; if the board ever remembers one, it is a word in Layout, not a fact in Declared.
