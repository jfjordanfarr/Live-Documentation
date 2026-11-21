The `history` folder beside `pathfind.ts` is `packages/engine/src/live-docs/history/`. I found 36 files in it by searching the explorer for each starting letter:

- `bundled.ts` and `bundled.test.ts`
- `codec.ts`
- `derive.ts` and `derive.test.ts`
- `directories.ts` and `directories.test.ts`
- `format.ts`
- `git.ts` and `git.test.ts`
- `lens.ts` and `lens.test.ts`
- `rows.ts` and `rows.test.ts`
- `sampling.ts` and `sampling.test.ts`
- `sequence.ts` and `sequence.test.ts`
- `shape.ts`
- `summary.ts` and `summary.test.ts`
- `textStore.ts` and `textStore.test.ts`
- `ticks.ts` and `ticks.test.ts`
- `window.ts` and `window.test.ts`
- `words.ts` and `words.test.ts`

Of these, `codec.ts`, `format.ts` and `shape.ts` have no test file beside them. All the others come as an implementation file plus its `.test.ts`.

The explorer's search box only shows about 12 results at a time, so I searched letter by letter. I checked b, c, d, f, g, l, m, n, o, p, r, s, t, u and w. Nothing starts with m, n, o, p or u. I did not search q, v, x, y, z or the letters between (a, e, h, i, j, k), but the first unfiltered results ran straight from `bundled` to `lens` with no gaps. A file starting with one of the unsearched letters is unlikely, but I can't completely rule it out.

The explorer shows indexed files only, so anything it doesn't index, such as non-code files, wouldn't appear.

I didn't copy anything to the clipboard.
