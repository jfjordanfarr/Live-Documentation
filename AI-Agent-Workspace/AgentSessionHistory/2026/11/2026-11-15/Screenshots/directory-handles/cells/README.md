# A closed directory as cells, in three shapes, 2026-11-15 and 16

Historical evidence for the second milestone of the directory round ([November 15, Turn 1](../../../2026-11-15.1.record.md#turn-1)). The owner chose the cells among the three looks of the November 13 trial: "Cells is definitely my favorite. That tells me by far the most about what is interesting about each directory while also clearly indicating that these nodes are unique in some way. They still don't visually "read" quite like a directory ... I wonder if some combination of Cells internals plus a slight variation on the node corner rounding (more square-ish? something to look slightly more directory shaped?) would do well there?" And: "there's a bit in the visuals here that I struggle to understand the meaning of (likely folders in folders)".

So the skin with cells is the default look of a closed directory; a directory inside is a small skin around cells of the same size as every other cell; a cell takes the colour the 3D map gives a file of its kind, or one grey; and the skin's shape is one of three, which these sheets set side by side.

The sheets were first taken on November 15 and shown to the owner, and all were retaken on November 16 after what followed:

- **Colour.** The owner chose the kinds' colours on seeing both ([Turn 8](../../../2026-11-15.1.record.md#turn-8)): "WOW! I _love_ the splash of color those directories provide ... Yeah color for sure!" By kind is the default; one grey is one choice away. The owner also named the one conflict to resolve, the overlap between the kinds' blue and green and the blue and green that mean what offers and what uses; a round on the kinds' palette follows this one.
- **The tab is the reading look's alone.** In the first sheets the tab followed the held name at every look, and three or seven presses out one box had room for a step beside its name where its neighbour had none: a difference of form that meant nothing. From the connections look out every folder is now drawn plain.
- **A cell says its file's name on hover**, the name alone ([Turn 10](../../../2026-11-15.1.record.md#turn-10): "A scan of one's software -- their own words, should do essentially all of the talking if possible"). A hover is not in these pictures; the browser case `a cell says its file's name on hover` in `tests/e2e/closed-directory-looks.spec.ts` protects it. The legend gained no rows.
- **Small things.** A small folder's tab among the cells rises higher (2.5 units over contents set a unit lower), and a veiled skin keeps its outline and fades its last cell.

Every sheet is a composition made for looking: pages of the Explorer, one per variant, each cropped to its picture, under the variant's name. The words on a sheet are the sheet's, not the product's. `segoe` is drawn with Segoe UI's line metrics over this machine's Liberation Sans (the owner's browser draws Segoe UI); `fallback` with this machine's own lines.

## The three shapes

`sheet-{scripts|engine-src|root}-{arrive|out3|out7}-{segoe|fallback}.png`: `scripts` (five closed directories above four files), `packages/engine/src` (four closed directories) and the scan root (six closed directories beside its files), as the page arrives (the reading look), three presses of Zoom Out (the connections look) and seven (the overview look). Left to right:

- **Tab**, the default: a folder's silhouette. At the reading look the outline rises around the handle (the chevron, the name, and More beside the name) as a tab at the top left and steps down to the body's top edge to its right; the cells stand in the body. In the far looks it is a plain rounded box, between the capsule and the card's corners.
- **Round**: the capsule of the November 13 trial.
- **Square**: the same skin with a file card's corners.

In every shape the whole box opens the directory and the chevron and name are the keyboard's stop; the boxes and cards stand in the same places. The root sheet at arrival is shown at three fifths of its size.

The sheets seven presses out were taken once more after files only became the far view's default (merged from `main` on November 16): a file is its name alone there, and a closed directory keeps its held name and, where the name leaves a row, its cells. What they show and what is not right in them: whether a box holds a row of cells, and at what size its name stands, follows from how that one box's name fits, so of the scan root's six closed directories only `packages` shows cells, under a smaller name, and of `scripts`' five, three do. Siblings that differ in ways that mean nothing; left as seen, for the round that mends the held names' sizes.

A known weakness of Round: where a directory inside holds one file, its skin is a ring around a dot, which reads as a mark of another kind (a target, a radio button) rather than as a small directory. The Tab and Square skins stay recognisably containers at that size. Nothing was built for it.

## A directory inside a directory

`sheet-nested-{segoe|fallback}.png`, at twice the device pixels, and `sheet-nested-scale1-{segoe|fallback}.png`, at the device's own pixels as a screen at scale 1 draws it: the closed boxes of `packages/engine/src/live-docs`, `scripts/doc-tools`, `scripts/live-docs` and the scan root's `packages`. Before (the build on `main` when the pictures were taken), a directory inside was a pill of dots a third of a cell's size, or a ring. After, in each shape, it is a small skin of the outer skin's shape around cells of the one size; in `packages`, whose directories hold directories, a skin holds skins. A skin that holds more than it shows keeps its outline and fades its last cell.

## The cells' colour and strength

`sheet-colours-{segoe|fallback}.png`, at twice the device pixels and shown at half: the Tab shape with the cells coloured by kind, as the 3D map colours a file (blue an implementation file, green a test), beside one grey, at arrival and three presses out, on `scripts` and `packages/engine/src`.

`sheet-strength-{segoe|fallback}.png`, shown at three fifths: the cells' fill and ring a step quieter, as built, and a step stronger, on `scripts` and the scan root. The scripts picture has the wires of one file beside the cells, the same two hues at 0.7. A step quieter, the green cells sink into the skin and the colour the owner chose is dulled; a step stronger, layout-lab's two rows of cells are the brightest marks after the focused card and are read before the names. As built the cells are plainly coloured, quieter than a wire and than a name: kept.

## Opening

`sheet-opening-{segoe|fallback}.png`: `scripts/doc-tools` opened by a click on its box, in each shape, in three frames: the pointer on the closed box; about 0.45 s into the move, slowed to 0.9 s to catch it; and the opened directory. The transition is the one the plain box has.

What the frames show: the box is where it stood in the first; in the middle the new membrane has grown from that place while its neighbours move, and a neighbour's box or the new label crosses the other for a moment, as on November 13; the cells do not travel to become the cards, the box fades as the cards appear. The middle frames are not the same instant in each shape.

## Links

Paths that open each variant in the Explorer, whatever the browser's own Tuning holds:

- tab: `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqARgAYn4BLAFwFMK7DIATABZ4AI0xUAJnygCAHPAAWXNgHNFHAMKoAzhygBWeAHc2kjou17D8Cj1EAnCVwCiYLlSpcdO2bftOXgDKbBT4CGzonACesizwDqjGADJc7ghePrIAvvAAZqgO6Fw0TviKRBFUANYykABsrMSKmA6qXFCN8CQIETpsqLT0kEbEqGThbFSqjPBUqJJcIQBeHZAiIDrRFKKkQVgIawzwqk5gMVBMAHRMAqMkYYMeHEFc+K2YHANUl1cC3S02lwAEoSdqXeAEfCJAAeoU+31+cEQU2qQQ4Dg8qgsv1GE0kn1cXjasUgxxA3AsXAcv1u3U4XEkACFogAFMi9WYomoAdTMOLJcwWXAAWqhUBRgd42HoJMUkSY2JixRKpf1ZVR5ZBrgBOOaYOwAQX0ZIUIEUqHwvkFIEx7mwADEnHZrV1NspegARN4C-4gU7jfA8sr4anWzbVKYgbK5ECSKAAbU26AcbHwHF8AF1skA`
- round: `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqARgAYn4BLAFwFMK7DIATABZ4AI0xUAJnygCAHPAAWXNgHNFHAMKoAzhygBWeAHc2kjou17D8Cj1EAnCVwCiYLlSpcdO2bftOXgDKbBT4CGzonACesizwDqjGADJc7ghePn7EaDpckkGKBFxQIIlkUiAAvvAAZqgO6Fw0TviKRBFUANYykABsrMRFDqol-YMkCBE6bKi09JBGxKhk4WxUqozwVKiSXCEAXmMiIDrRFKKkQVgIYwzwqk5gMVBMAHRMAkskYXMeHEEuPhME4OLMqK83gJ4OhhqMAEoSUaveAEfCJAAeoUwYLmkLgiHWXSCHAcHlUFkhS1Wkhxri8I1ikHuIG4Fi4DkhnxhnHyACFogAFMhTLaE7oAdTMlOZ212XAAWqhUBR4d42HoJE18SY2GSlSq1TNNVRtZB3gBObaYOwAQX0zIUIEUqHwvllZTSXGwADEnHZ3QN4DplFMACJAmXQkCPFb4CWtfAc92nLrrao1ECSKAAbVO6AcbHwHF8AF0qkA`
- square: `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqARgAYn4BLAFwFMK7DIATABZ4AI0xUAJnygCAHPAAWXNgHNFHAMKoAzhygBWeAHc2kjou17D8Cj1EAnCVwCiYLlSpcdO2bftOXgDKbBT4CGzonACesizwDqjGADJc7ghePn7EaDpckkGKBFxQIDoAjmSYDiUAvvAAZqgO6Fw0TviKRBFUANYykABsrMRFDqolQyMkCBE6bKi09JBGxKhk4WxUqozwVKiSXCEAXpMiZdEUoqRBWAiTDPCqTmAxUEwAdEwCqyRhix4OEEuPhqpgOAsqO8PgJ4OgxhMAEoSCbveAEfCJAAeoXBkOhcEQW16QQ4NW2Fmhqw2knBri841ikEeIG4Fi4Dmh3zhnHyACFogAFMizXZEvoAdTMlOZewOXAAWqhUBREd42HoJK0CSY2DUlSq1fNNVRtZBPgBOPaYOwAQX0zIUIEUqHwvllIBq7mwADEnHZ3cN4DplLMACIgmWwkDPdb4CUdfAc91lXpbEC1eogSRQADaZXQDjY+A4vgAurUgA`
- tab, grey cells: `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqARgAYn4BLAFwFMK7DIATABZ4AI0xUAJnygCAHPAAWXNgHNFHAMKoAzhygBWeAHc2kjou17D8Cj1EAnCVwCiYLlSpcdO2bftOXgDKbBT4CGzonACesizwDqjGADJc7ghePn7EaDpckppcCAi+kCCqDlyxAL7wAGaoDuhcNE74ikQRVADWMpAAbKzEipgOqlxQg-AkxWw6bKi09JBGxKhk4WxUqozwVKiSXCEAXhOQIiA60RSipEFYCGcM8BWYYDFQTAB0TAKrJGFFh4OEEuPhRpgOAsqJ8vgJpiMxlwAEoScafeAEfCJAAeoUh0NhcEQW26QQ4lW2Flhqw2kkhri8Y1ikGeIG4Fi4Dlhv2mnHyACFogAFMjFXYknoAdTM1NZewOXAAWqhUBRkd45hwJM0iSY2JUVWqNfM9Dqzt8AJx7TB2ACC+lZChAilQ+FKbMq7mwADEnHZSlNLspigARMFy+HlRIbKVtfBc0qXbpbEDVWogSRQADal3QDjY+A4vgAutUgA`
- plain box: `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqARgAYn4BLAFwFMK7DIATABZ4AI0xUAJnygCAHPAAWXNgHNFHAMKoAzhygBWeAHc2kjou17D8Cj1EAnCVwCiYLlSpcdO2bftOXgDKbBT4CGzonACesizwDqjGADJc7ghePn7EaDpckgAibA5c6ByoDrGQIKKoAB4gAL7wAGYV6Fw0TviKRBFUANYykABsrMSKmA6qXFBj8CQIETpsqLT0kEbEqGThbFSqjPBUqJJcIQBes5AiIDrRFLUIQVgI1wzwqk5gMVBMAHRMARbEhhNYeDhBLj4KaYDirKh-f4CBaTaZcABKEhmf3gBHwiTqoThCKRcEQ+wGQQ4JQOFiRW12kjhri80yqHxA3AsXAcSKBC04+QAQtEAApkJZHCmDADqZnpkE5JzOAC1UKgKBjvGw9BIOmSTMUuOrNdqVnqqAbIACAJzHTB2ACC+iVChAilQ+F8SoSaS42AAYk47D75ndlEsCtDFSiQF8dvhZd18LyfXcBvsms0QJIoABtO7oBxsfAcXwAXUaQA`
- engine/src, tab: `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqARgAYn4BLAFwFMK7DIATABZ4AI0xUAJnygCAHPAAWXNgHNFHAMKoAzhygBWeAHc2kjou17D8Cj1EAnCVwCiYLlSpcdO2bftOXgDKbBT4CGzonACesizwDqjGADJc7ghePrIAvvAAZqgO6Fw0TviKRBFUANYykABsrMSKmA6qXFCN8CQIETpsqLT0kEbEqGThbFSqjPBUqJJcIQBeHZAiIDrRFKKkQVgIawzwqk5gMVBMAHRMAqMkYYMeHEFc+K2YHANUl1cC3S02lwAEoSdqXeAEfCJAAeoU+31+cEQU2qQQ4Dg8qgsv1GE0kn1cXjasUgxxA3AsXAcv1u3U4XEkACFogAFMi9WYomoAdTMOLJcwWXAAWqhUBRgd42HoJMUkSY2JixRKpf1ZVR5ZBrgBOOaYOwAQX0ZIUIEUqHwvkFIEx7mwADEnHZrV1NspegARN4C-4gU7jfA8sr4anWzbVKYgbK5ECSKAAbRA73Q1Uw7R0AHosVMuJmdEUQABdbJAA`
