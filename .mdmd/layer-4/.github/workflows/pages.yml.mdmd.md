# .github/workflows/pages.yml

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: .github/workflows/pages.yml
- Generated At: 2026-10-22T00:39:32.713Z

## Authored
### Purpose
Publishes this repository's own Explorer, with the history of its whole mainline, to GitHub Pages at `https://jfjordanfarr.github.io/Live-Documentation/` on every push to `main`, so that anyone can try the Explorer over its own code without installing anything.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- The `build` job checks out the whole history, restores `.mdmd/history` from an Actions cache, runs `npm run live-docs:history -- --jobs 2` (every mainline commit the cache lacks, two at a time), saves the cache, and builds the bundle with `npm run live-docs:visualize -- --history all` into `dist/explorer/`, which it uploads with a `.nojekyll` marker; the `deploy` job publishes it to the `github-pages` environment. `configure-pages` with `enablement: true` turns Pages on if the repository has not.
- The cache key hashes `packages/engine`, `packages/generator`, the root `package.json` and lock, and `.live-docs.config.json`, then adds the run: each run saves a new cache, and the next restores the newest one made by the same generator, dependencies and configuration. A change to any of them starts the history from nothing, which is why the job allows 180 minutes. The cache is saved even when generation fails, since finished commits are written atomically; the job stays failed. Runs wait rather than cancel one another, so that a running build can save its cache, and GitHub keeps only the newest waiting run.
- The present picture is built from the committed Live Docs, which this workflow does not regenerate, and it does not wait for `ci.yml`: a push deploys even when CI fails on it. The [repository's board](../../../layer-3/board.mdmd.md) declares this workflow by hand as `pages-workflow`, deploying to the `pages` site, an imagined thing until workflow files are read as a source.
- Began on 2025-12-13 with the first CI, when the owner asked for the static site "to showcase the Live Documentation Explorer for the repo itself (allows users to see exactly what using the software is like without any obligation to install/build/run in their own environments)" ([Turn 6 of the December 13 session](../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-13.1.SUMMARIZED.md#turn-06)). The history steps came on 2026-10-19 (`b0f824a2`), the owner having chosen to compute the hosted site's history here with a cache "for now until we find it doesn't do everything we want, or causes undue technical debt burden" ([Turn 5 of the October 17 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-5)); its first hosted run, for `82fee09d`, generated the history and deployed ([Turn 17 of the October 19 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-19.1.SUMMARIZED.md#turn-17)). It gained a Live Doc on 2026-10-22, when every file began to get one except the kinds the owner settled on leaving out ([Turn 8 of the October 21 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
