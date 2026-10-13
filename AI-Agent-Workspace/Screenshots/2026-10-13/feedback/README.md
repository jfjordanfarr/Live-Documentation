# Local Map review comparisons and motion

_Historical agent captures, October 13, 2026, following the [owner's review](../../../ChatHistory/2026/10/2026-10-13.1.record.md#turn-7--owner-review-of-alignment-and-motion). The [original owner screenshots](../../../ChatHistory/2026/10/2026-10-13.1.images/README.md) remain separate, byte-preserved sources._

These are 1600×1000 browser captures from the built Explorer. Overviews use public wheel and pan gestures after the entry camera settles. Tests are shown. Main and generator use direct links with assets hidden; warehouse and the four deck scopes retain their named files with assets shown. The [probe report](../../../Probes/2026-10-13/local-map-feedback/README.md) identifies the measurements and limitations. All pictures in the tables were opened and inspected.

## Relaxed alignment comparison

The two values are row-levelness weights; all other Relaxed values stay fixed. A Custom label identifies an advanced edit during comparison. This is exploratory tuning evidence before final regeneration, not an independent owner approval of every scene.

| Scene | Initial 0.25 | Candidate 2 | Height before → after |
| --- | --- | --- | ---: |
| Three-card main | [Picture](main-align-0.25.png) | [Picture](main-align-2.png) | 298 → 298 |
| Generator | [Picture](generator-align-0.25.png) | [Picture](generator-align-2.png) | 1757 → 1757 |
| Warehouse | [Picture](warehouse-align-0.25.png) | [Picture](warehouse-align-2.png) | 617 → 617 |
| Repository five files | [Picture](repository-five-files-align-0.25.png) | [Picture](repository-five-files-align-2.png) | 3725 → 3725 |
| Repository chain | [Picture](repository-chain-align-0.25.png) | [Picture](repository-chain-align-2.png) | 4000 → 4124 |
| Estate five files | [Picture](estate-five-files-align-0.25.png) | [Picture](estate-five-files-align-2.png) | 1448 → 1448 |
| Estate chain | [Picture](estate-chain-align-0.25.png) | [Picture](estate-chain-align-2.png) | 909 → 909 |

## Compact alignment comparison

| Scene | Initial 0 | Candidate 0.25 | Height before → after |
| --- | --- | --- | ---: |
| Three-card main | [Picture](compact-main-align-0.png) | [Picture](compact-main-align-0.25.png) | 282 → 289 |
| Generator | [Picture](compact-generator-align-0.png) | [Picture](compact-generator-align-0.25.png) | 1636 → 1636 |
| Repository five files | [Picture](compact-repository-five-files-align-0.png) | [Picture](compact-repository-five-files-align-0.25.png) | 3480 → 3581 |
| Estate five files | [Picture](compact-estate-five-files-align-0.png) | [Picture](compact-estate-five-files-align-0.25.png) | 1203 → 1203 |

## Wire motion

[Before](motion-before.png), [during](motion-middle.png) and [after](motion-after.png) a pinning move in the zoomed Rosetta scene. The diagnostic lengthens the move to 1200 ms for inspection; the shipping duration remains 450 ms. Matching wire elements persist, new wires fade with entering cards and every frame reads the real pins. The pointer remains over the pinned row in the last picture, so the unrelated connections are dimmed. The dedicated browser regression also moves the pointer out and verifies that this transient attention clears.

The separate [both-bypasses-below illustration](../../../Probes/2026-10-13/local-map-feedback/main-both-below-candidate.png) is a solved layout candidate painted onto a disposable page. It is not a claim that the shipping search selects that route.

## Final interaction captures

The final source was rebuilt after correcting hover re-entry, then these nine pictures were opened and inspected. Tests are shown; assets and related documents are hidden. The [native observations](../../../Probes/2026-10-13/local-map-feedback/final-spatial-observations.json) accompany the pictures.

- Stock three-card [Compact](final-main-compact.png) and [Relaxed](final-main-relaxed.png), at reading size.
- Spatial attention [before hover](final-spatial-hover-before.png), [after re-entering the distant sphere](final-spatial-hover-during.png), and [after leaving again](final-spatial-hover-after.png). Its material opacity changes 0.15→0.75→0.15; the hover is temporary and never exceeds normal intensity.
- [After clearing file pins](final-spatial-cleared.png), with no directory retained: all 580 filtered nodes have normal 0.75 opacity.
- Native middle-button zoom reaches a [54.61-unit camera distance](final-spatial-zoom-close.png), inside the wheel's usual 65-unit limit. [Inward wheel](final-spatial-zoom-inward.png) holds that distance rather than jumping outward; [outward wheel](final-spatial-zoom-outward.png) increases it to63.45. This is a deliberately close input-method comparison, not a recommended overview framing.

The captured production source subsequently passed the complete required check: 990 unit, 52 integration and all 108 browser tests, plus builds/type/lint and documentation audits. No production source changed afterward. The [record](../../../ChatHistory/2026/10/2026-10-13.1.record.md#turn-8--relaxed-should-spend-wire-length-on-composition) preserves the earlier failures and corrections.
