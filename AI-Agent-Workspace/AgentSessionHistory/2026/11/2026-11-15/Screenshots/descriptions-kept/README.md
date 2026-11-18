# A line of description kept three presses out, four values, 2026-11-15

Historical evidence for the four values of Tuning → 2D Layout → Descriptions Zoomed Out, built for the owner to choose among ([Turn 1 of the November 15 record](../../../ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)). The owner, shown [the trial of November 13](../../2026-11-13/descriptions-zoomed-out/README.md): "the only reason it doesn't look quite as good in these screenshots is because the symbol name itself is willing to wrap onto a new line (I'm not confident this is preferable), causing only symbols with short enough names to have their description one-liner drawing beneath"; and of the gap under the file's name, "why are we not having a line there as well for the node-level description if the reader icon is active at the node level?"

## The four values

Every sheet shows the same card four times, left to right, a magenta rule between:

1. **Hidden**, the default: no description; a name takes the two lines its row holds.
2. **First line, where the name leaves room**, the trial's: a description's first line only under a name that takes one line.
3. **First line always, name cut at its end**: every row whose description is shown at reading size keeps its first line, and its name holds to one line, cut with an ellipsis where it does not fit.
4. **First line always, name cut in its middle**: the same, the name's first and last pieces kept about the ellipsis, broken only at the name's seams. Since November 16, where the first and last pieces do not fit together, the name keeps as many of its last pieces as fit behind a leading ellipsis ("…LinkViolation"), and is cut at its end only where not even its last piece fits; until then it was cut at its end there.

With any value but Hidden, a file whose Purpose is shown at reading size keeps the Purpose's first line under its name where the header's room holds it.

## Pictures

Named `{subject}-{presses}-presses-four-values-{fallback|segoe}.png`: the subject's card cut out of a frame of 1,440 by 900, opened by a link that carries the value, under this machine's own font lines (`fallback`) and under Segoe UI's line metrics (`segoe`). All are in the connections look.

- `documentationLinks-3`, `-4`, `-5`: `scripts/doc-tools/documentationLinks.ts`, the owner's card, as it arrives, fourteen descriptions shown, at three, four and five presses of Zoom Out.
- `documentationLinks-half-folded-3`: the same card with five descriptions folded by their books (`DEFAULT_RULES`, `DocumentationLinkEnforcementResult`, `DocumentationDocumentAnchors`, `formatDocumentationLinkComment`, `DocumentationTargetMap`), three presses out.
- `branch-renderer-3`: `packages/explorer/src/client/views/localView/branch-renderer.ts`, three presses out.
- `estate-PaymentService-3`: the estate sample's `PaymentService/PaymentService.cs`, three presses out.
- `frame-documentationLinks-3-presses-{value}-{metrics}.png`: the whole frame of the owner's card three presses out in each value, for the neighbouring cards and the wires.

The sheets of `documentationLinks-3`, `documentationLinks-half-folded-3` and `branch-renderer-3` were retaken on November 16 with the leading ellipsis, and what is said below is of them. The `-4` and `-5` sheets, the estate's sheet and the middle cut's two frames were taken the day before and show the fallback of that day in their fourth panel: three of the owner's names cut at their end ("DocumentationLinkViol…", "DocumentationDocum…", "DocumentationAnchor…"), and "Payment…" where the rule now gives "…Service".

## What was measured

The same under both font metrics unless said. No card's box differs between the values: the owner's card is 387 by 1,199 (fallback) and 430 by 1,199 (Segoe's lines) in all four, 1,089 tall half folded; `branch-renderer.ts` 310 and 344 by 668; `PaymentService.cs` 254 and 275 by 358.

| Card | Described rows | Hidden | First line, where room | Always, end cut | Always, middle cut |
| --- | --- | --- | --- | --- | --- |
| `documentationLinks.ts` | 14 of 14 | 12 names on two lines | 2 lines kept, 12 names on two lines | 14 kept, 12 names cut | 14 kept, 12 names cut: 9 with both ends about the ellipsis, 3 behind a leading ellipsis, none at its end |
| the same, half folded | 9 of 14 | 12 names on two lines | none kept | 9 kept, 8 names cut, 3 folded names on two lines | 9 kept, 8 names cut: 6 with both ends, 2 behind a leading ellipsis |
| `branch-renderer.ts` | 6 of 7 | 2 names on two lines | 4 kept | 6 kept, 2 names cut | 6 kept, 2 names cut, both behind a leading ellipsis |
| `PaymentService.cs` | 1 of 3 | 1 name on two lines | none kept | 1 kept, 1 name cut | 1 kept, 1 name cut (at its end in the picture, taken before the change) |

- **The middle cuts on the owner's card:** "Documentation…Result", "run…LinkEnforcement", "resolveCodeTo…Map", "format…LinkComment", "parse…Anchors", "Documentation…Map", "Run…Options", "Resolved…Target", "Parse…AnchorsOptions". Three names' first and last pieces do not fit together, and they keep their end behind a leading ellipsis: "…LinkViolation", "…DocumentAnchors", "…AnchorSummary".
- **Names that the end cut makes alike:** on the owner's card `parseDocumentationAnchors` and `ParseDocumentationAnchorsOptions` are drawn "parseDocumentationA…" and "ParseDocumentationA…" under Segoe's lines, and `runDocumentationLinkEnforcement` and `RunDocumentationLinkEnforcementOptions` "runDocumentationLink…" and "RunDocumentationLin…". The middle cut tells them apart.
- **Names the end cut makes the same:** on `branch-renderer.ts`, `refreshReadingPresentation` and `refreshReadingGeometry` are both drawn "refreshReading…" by the end cut. The middle cut drew them the same way until November 16, since "refresh…Presentation" does not fit the card; it now draws "…Presentation" and "…Geometry".
- **A narrow card:** `PaymentService` is drawn "Payment…" over "The on-pr…" under this machine's lines, and "PaymentS…" under Segoe's.
- **Half folded:** every described row keeps its line. The card is some ten units short of holding that and every folded name's second line, and one folded name, `DocumentationTargetMap`, gives its second line up and ends in the row's own ellipsis.
- **The file's line:** in the owner's card's picture, of the cards whose Purpose is on, six keep their line and one does not under this machine's lines: `enforce-documentation-links.ts`, whose name takes three lines, is 28.4 map units short. Under Segoe's lines five keep it and two do not: the same card, and `enforce-documentation-links.test.ts`, 16.5 short. In `branch-renderer.ts`'s picture all twenty-five keep it. `PaymentService.cs` shows no Purpose at reading size and has no line. No line is drawn smaller to fit.
- **A folded file:** folding a file's book folds its symbols' descriptions with it, so that card keeps no line, the file's or a row's, in any value, and the cards beside it keep theirs.
- **Evenness:** a kept line is part of its row's head, and the heads stand at even gaps. The dots and wire ends stand with the heads, so they do not stand where Hidden puts them: on the owner's card three presses out, by up to some twenty screen pixels (read from the sheet: the fourth row's dots at 199 under Hidden and at 220 with a line always kept). No box and no row's place changes.

## The browser cases, red first

`tests/e2e/descriptions-zoomed-out.spec.ts` run on the build of the commit before, which has no Descriptions Zoomed Out: seven of its nine cases failed and two passed.

- The trial's case, under each font's lines: rows that keep a line expected more than 0, received 0.
- Every described row keeps its line and its name holds to one, cut at its end and cut in its middle, under each font's lines (four cases): rows that keep a line expected more than 5, received 0.
- The file's own line: expected the Purpose's first line under the file's name, received none.
- The half-folded case passed at first, since without the choice no row counts as described; a count was added (every row but the five folded keeps a line: expected 9, received 0) and the case then failed there.
- "The overview look is as it was with the first line kept" passes on the code before by its nature: it holds that the choice changes nothing at the overview.

The leading ellipsis of November 16 is a design change, so the middle cut's two cases were moved to what the owner's card now draws and run on the build before it: both failed, each on the three names cut at their end though their last pieces fit behind an ellipsis ("not even its last piece fits its room": expected true, received false, for `DocumentationLinkViolation`, `DocumentationDocumentAnchors` and `DocumentationAnchorSummary`) and on the names kept behind a leading ellipsis (expected those three, received none).

## What I see

The kept lines are in the prose tone and the names in the name tone, and that is enough: the eye goes down the names first in every value.

With the first line always kept, the owner's card becomes an even ladder of fourteen pairs where Hidden is a ladder of names of one and two lines, and the card's room is used. The price is in the names. The end cut keeps the beginnings this card's names share and drops the ends that tell them apart, and makes two pairs of names nearly alike. The middle cut keeps what tells this card's names apart, at the cost named below. On a narrow card, the estate's, either value trades "Payment Service" for half of it ("Payment…", and since November 16 "…Service" in the middle cut) and nine characters of prose, which is a loss.

The trial's value never costs a name, and on `branch-renderer.ts`, where four of six described names take one line, it is the best of the four. On the owner's card it keeps two of fourteen.

**What the middle cut costs.** A name cut in its middle is no longer read at a glance; it is put together. The missing piece is the middle, so a word sought there ("Link", "Document") is not found by eye. The name's length and outline, by which a name already known is recognised without reading, are gone. Where the first and last pieces do not fit together the name loses its beginning, the word a reader goes in by: "…LinkViolation" is read as LinkViolation until the ellipsis is noticed, and a card's column of names no longer starts on one edge of letters.
