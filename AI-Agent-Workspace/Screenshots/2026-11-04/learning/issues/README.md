# Observed journey defects

Historical investigation frames from the November 4–5 review, followed by explicitly labelled repair evidence. They preserve failures and their corrected interpretations.

- [Baseline row crossing](baseline-row-crossing.png): a background-search permutation moves expanded Get/Post text through one another. Follow-up established that settled rows are collision-free.
- [Baseline pin header](baseline-pin-header.png): the extra search/path row can cover a previously visible title after pinning.
- [Candidate return transition](candidate-return-transition.png): an immediate Back frame loses the returning subject. Follow-up found exact restoration after settling, with an approximately 850ms offscreen interval; the repair concerns that interval, not persistent camera corruption.
- [Baseline after touch](baseline-after-touch.png): swiping the tall card body leaves the camera unchanged. The candidate's actual-touch regression checks that lower content becomes reachable without accidental inspection or changed pins.
- [Full-gate pin-header failure](full-gate-pin-header.png): despite the earlier focused pass, the first frozen full run left the file title above the new header after pinning at 900×700. The repair below passes the strengthened regression and final full gate; this picture preserves the actual earlier failure.
- [Repaired pin header during motion](repaired-pin-header-moving.png) and [after settling](repaired-pin-header.png): the rebuilt application keeps the title below the larger header. Root sampled 80 frames, including 73 moving frames, with minimum clearance 7.9991 px and final title y=103 against frame top95. These use a 1,200 ms native move at 900×700, ordinary Pin activation and a private browser closed after capture. The moving picture also shows the text-column surface occluding the crossing row without hiding its pins.

The [experiment report](../../../../Probes/2026-11-04/learning/README.md) links these observations to the implemented changes and verification.
