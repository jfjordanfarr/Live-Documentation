#!/usr/bin/env bash
# Rebuilds the gallery's side-by-side sheets from the pictures in this folder.
# Run from anywhere: bash AI-Agent-Workspace/Gallery/sheets.sh
# Needs ImageMagick (convert, montage), which the devcontainer carries.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
selected_sheet="${1:-}"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

# sheet <output file> <title> [<label> <picture>]...
# Every tile is padded to 1600 by 1000 so that the labels line up whatever the picture's size.
sheet() {
  local out="$1" title="$2"; shift 2
  if [[ -n "$selected_sheet" && "$out" != "$selected_sheet" ]]; then return; fi
  local args=()
  while (($#)); do
    local label="$1" picture="$2"; shift 2
    local padded="$work/${picture//\//-}"
    convert "$here/$picture" -background '#0b0f16' -gravity north -extent 1600x1000 "$padded"
    args+=(-label "$label" "$padded")
  done
  montage -font DejaVu-Sans -pointsize 30 -fill white -background '#0b0f16' \
    -title "$title" -geometry +16+40 -tile 2x "${args[@]}" "$here/sheets/$out"
  echo "wrote sheets/$out"
}

sheet graph-ts-six-ways.png "graph.ts and its five files, this repository, six ways" \
  "Local Map (shipped), graph.ts selected" graph-ts/local-map.png \
  "Membrane Map (shipped), all five pinned" graph-ts/membrane-map.png \
  "Rings (probe), every reference drawn" graph-ts/rings.png \
  "Folder columns (probe), every reference drawn" graph-ts/folder-columns.png \
  "Analysis surface (Astra's probe), five pinned" graph-ts/analysis-surface.png \
  "Force Graph (shipped), graph.ts in context" graph-ts/force-graph.png

sheet payment-service-four-ways.png "PaymentService.cs and its four kept files, the estate, four ways" \
  "Local Map (shipped), PaymentService.cs selected" payment-service/local-map.png \
  "Membrane Map (shipped), all five pinned" payment-service/membrane-map.png \
  "Rings (probe), every reference drawn" payment-service/rings.png \
  "Folder columns (probe), every reference drawn" payment-service/folder-columns.png

sheet two-symbols-three-ways.png "LiveDoc on document.ts and GraphFile on graph.ts, both pinned, three ways" \
  "Membrane Map (shipped)" graph-ts/two-symbols-membrane-map.png \
  "Analysis surface (Astra's probe)" graph-ts/two-symbols-analysis-surface.png \
  "Handoff (Astra's probe)" graph-ts/two-symbols-handoff.png

sheet estate-outside-four-ways.png "The estate from outside, four ways" \
  "World Map (shipped), at rest" estate-outside/world-map.png \
  "Interfaces (Astra's probe), light, isometric" estate-outside/interfaces.png \
  "Handoff (Astra's probe), hub and gateway as cards" estate-outside/handoff.png \
  "Analysis surface (Astra's probe), the board docked" estate-outside/analysis-surface-board.png

sheet graph-ts-astra-four-ways.png "graph.ts in Astra's four navigations" \
  "Orientation: fixed neighbourhood, the camera travels" graph-ts/orientation.png \
  "Interfaces: isometric cards, right-angle wires" graph-ts/interfaces.png \
  "Depth, side view: wires in lanes behind the plane" graph-ts/depth-side.png \
  "Analysis surface: the scoped overview" graph-ts/analysis-surface-overview.png

sheet graph-ts-journey-routes.png "Five retained files, 40 pins, 24 references: four route choices" \
  "Outer lanes, no bundling" graph-ts/journey-lanes.png \
  "Outer lanes, by file pair" graph-ts/journey-file-bundles.png \
  "Outer lanes, by directory pair" graph-ts/journey-directory-bundles.png \
  "Behind cards, foreground pin ends" graph-ts/journey-behind-cards.png

sheet rosetta-native-perspectives.png "TypeScript Rosetta: retained branches, two native perspectives" \
  "Local Map: format and processor pinned" rosetta-native/local-map.png \
  "Force Graph: same pins and subject anchor" rosetta-native/force-graph.png

sheet slopcop-retention.png "Checker exploration: retain by clicking, prune with close" \
  "Implementation and checker retained" slopcop-retention/local-map.png \
  "Implementation closed; checker keeps its needed interfaces" slopcop-retention/local-map-pruned.png
