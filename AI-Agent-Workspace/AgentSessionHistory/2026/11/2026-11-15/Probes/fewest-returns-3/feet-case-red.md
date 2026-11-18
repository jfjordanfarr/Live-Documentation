# The feet case, red on a build without the feet

_Historical evidence, 2026-11-16, fifth leg: the two cycle-trial cases of `tests/e2e/layout-lab.spec.ts` run against a build whose cycle trial prediction stood every card at the shown picture's height, given the final build's data. The `core.ts` case fails, each trial predicted a foot taller than the walk; `branches.ts` passes, since there the feet move only the vertical placement, which that case leaves aside. Colour codes, attachments and stack lines are trimmed._

```text
Running 2 tests using 1 worker
  ✘  1 [chromium] › tests/e2e/layout-lab.spec.ts:110:5 › a cycle trial's prediction stands each card's foot as the trial dresses it: core.ts, term by term (16.7s)
  ✓  2 [chromium] › tests/e2e/layout-lab.spec.ts:124:5 › the page's search judges a cycle's trials as the lab's walk does: branches.ts (18.8s)
  1) [chromium] › tests/e2e/layout-lab.spec.ts:110:5 › a cycle trial's prediction stands each card's foot as the trial dresses it: core.ts, term by term 
    Error: the page's predicted terms are the walk's
    expect(received).toEqual(expected) // deep equality
    - Expected  - 7
    + Received  + 7
      Array [
        Object {
          "churn": 120,
          "crossings": 3617,
    -     "height": 5136,
    +     "height": 5156,
          "horizontal": 125199,
          "returns": 21,
          "steps": 5,
          "unevenness": 2962,
    -     "unlevel": 6184,
    -     "vertical": 224338,
    +     "unlevel": 6104,
    +     "vertical": 225418,
          "width": 3094,
        },
        Object {
          "churn": 117,
          "crossings": 4000,
    -     "height": 5130,
    +     "height": 5150,
          "horizontal": 162039,
          "returns": 18,
          "steps": 4,
    -     "unevenness": 3300,
    -     "unlevel": 6334,
    -     "vertical": 251746,
    +     "unevenness": 3320,
    +     "unlevel": 6254,
    +     "vertical": 252966,
          "width": 3500,
        },
      ]
      112 |   const { walked, trials } = await cycleTrials(page, "packages/engine/src/live-docs/core.ts");
      113 |   expect(walked.length, "the walk tries both other orders").toBe(2);
    > 114 |   expect(trials.map(trial => named(trial.predicted)), "the page's predicted terms are the walk's").toEqual(walked.map(trial => named(trial.terms)));
          |                                                                                                    ^
```
