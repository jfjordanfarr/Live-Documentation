# Search and reader, before and after

Taken on 2026-10-30 at 1280×800 in headless Chromium over this repository's bundle, with a short Playwright script, for the remediation item "Search and evidence answer the immediate question".

- [before-search-generator.png](before-search-generator.png): "generator" typed on the World Map before the change; `tsconfig.base.json` and `format.ts` come first and `generator.ts` stands in the ninth row, paths in `#666`.
- [after-search-generator.png](after-search-generator.png): the same after it; `generator.ts` is the first row, its group first, the paths in the panel's muted colour.
- [before-reader-generator.png](before-reader-generator.png): `generator.ts` in the reader before the change; Notes follow Purpose, and the symbols are below them.
- [after-reader-generator.png](after-reader-generator.png): the same after it; the jump list at the top, then Purpose, then the public symbols and dependencies, with Notes after Cited By.
- [landed-search-generator.png](landed-search-generator.png): the root's own look on main's build after every piece landed: "generator" typed on the Local Map, `generator.ts` the first row under its directory's heading, then its test, the directory itself, and the other matches by group.
- [landed-reader-generator.png](landed-reader-generator.png): the reader on `generator.ts` on the same build: the jump list, the kind, path and date, Purpose, then the public symbols and the dependencies, Notes last.
