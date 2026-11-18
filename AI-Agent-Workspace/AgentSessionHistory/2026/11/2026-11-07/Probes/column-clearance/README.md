# Probes: the foreign lane samples of the repository chain's retained picture

_Status: instruments of 2026-11-07, kept with [their evidence](../../../Screenshots/2026-11-07/column-clearance/README.md). They are Playwright specs that use the browser suite's own reader (`tests/e2e/still-picture.ts`), so they run from inside the suite's tree: copy them to `tests/e2e/_probe/`, run `NODE_PATH=$PWD/node_modules npx playwright test --config tests/e2e/playwright.config.ts _probe/<name>` from the repository root, and remove the folder afterwards, since the suite would otherwise run them. Each needs the bundle built first (`npm run live-docs:visualize`); the config serves it on 8766._

- `foreign-lanes.spec.ts`: reads the retained picture with `readPicture` and prints every wire with a lane sample in a foreign directory, which membrane holds the samples, where they are on the screen, and the lanes of the picture.
- `lane-columns.spec.ts`: the columns of the wires' ends, each column's wrappers' lefts and widths (a column holds several bands' cards, each band's as wide as its own text asks), and the fifth column's cards.
- `lane-look.spec.ts`: pans to the lane above `scripts/layout-lab/measurer.ts` with the suite's drag helper and saves a screenshot to `SHOT`; the before and after pictures of the evidence folder.
