# The board's file and the traded thing: the permutations weighed

_Written 2026-09-28, late evening, after the prior-art survey and the owner's pointer at "the system contained the means to perpetuate itself". A proposal with its forks marked, not a decision; the owner's answer is the decision. It belongs to fork 5 and 18 of [the record](README.md): where a board's declared districts, tunnels, edges and positions are written, and who writes them._

## What the owner wants, in their words

- Portability: "I really want to maximize portability. I want to have folks able to trade these around."
- Truth by fiat: "make things true by fiat from time to time, especially if they're detached from the sources."
- Imagined pieces: "if I am _imagining_ a system I wish to create ... I do not yet need to know about program guts. I only care that _something_ will exist in this slot, and it will fulfill these needs for me."
- The criteria: "Consider the many permutations and tradeoffs of shareability, authorability, and durability."
- The shape they pointed at: Jonathan Blow "ships his games with the full engine tooling inside them", and their own scanning tool's report had to contain "The entire script to run the output shown in the report" and "The full log of that script execution", both collapsed by default.
- Standing wants that bear on it: the audience includes non-software people ("show non-software people what I do and they can _see it_"); no network calls; a PCI-DSS environment, so what is shared may need trimming; markdown canonical; the simplest correct form.

## What is settled already

- A system's own facts (kind, declared doors, notes, scans) travel with the system's docs. A board's facts (which pieces, their sources, districts, tunnels, edges between pieces, positions, imagined pieces) travel with the board. Identity is by name, never by path.
- A declaration never hides a scan; the difference is drawn as drift with `declared` as a basis.
- Floors are an arrangement, not a law.

## The shapes

Six coherent shapes, each a bundle of choices. Two of them (E and F) turn out to be placements of the others rather than alternatives.

**A. A folder and an installed tool.** The traded unit is a folder: the board text, snapshots of detached systems, the docs. The VS Code panel or the CLI writes positions; a static build is a read-only picture. This is Structurizr's and Backstage's shape.

**B. A static site with a board download.** Today's bundle (a viewer, a data file with the derived graph, scripts) with the board text embedded, and a button that downloads an updated board text for a person to drop back into the repository.

**C. A single self-saving file.** One HTML file holding the viewer, the graph (which the round-trip suite proves is the docs in another encoding), the board text, the snapshots, the configuration, the tool's version and commit, and the generation log, all collapsed under the picture. Moving a piece, declaring an edge or adding an imagined piece and pressing save writes a new copy of the file. An import extracts the board text and any snapshots back into a repository and shows the difference against what is there. TiddlyWiki's shape, and the owner's report.

**D. C with the scanner inside.** The engine and the generator ship in the file too (tree-sitter is already WASM), so a recipient can drop a folder onto the board and have it scanned in the browser with nothing installed. Blow's shape in full.

**E. The viewer beside the docs.** Whichever of B or C is built, written into the docs root as well, so any checkout of a repository with Live Docs opens as a map without the tool. A placement, not a shape: it decides only whether a built file sits in the repository.

**F. The repository as the traded unit.** Docs, snapshots, board text, build script and history together. A placement too: it is the home of the source text for A to D, and the natural form for the owner's own estate, but not something a non-software colleague opens.

## Pros and cons

| Shape                       | Trade it around                                  | Edit and return                                   | Hand-writable                     | Git diffs                                  | Provenance                        | Cost from today                                              |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------- | --------------------------------- | ------------------------------------------ | --------------------------------- | ------------------------------------------------------------ |
| A. Folder and tool          | Needs the tool installed; developers only        | Yes, with the tool                                | Yes, the board text               | Clean                                      | From git                          | Board grammar, lint, the panel writing positions             |
| B. Static site and download | A folder to zip; opens in a browser, no install  | Download a board text, drop it in by hand         | Yes, the loose text               | Clean; the site is never committed         | None today                        | Small: embed the board text, add the download                |
| C. Self-saving file         | One file; opens anywhere, offline, for anyone    | Move, declare, imagine, save a copy, send it back | Yes, in the repo and inside the file | The file diffs badly, so it is never committed; the repo keeps the text and the import brings changes home | Configuration, version, commit and log inside, collapsed | Single-file build, self-save, import with drift, provenance |
| D. C with the scanner       | As C                                             | As C, plus "drop a folder to add a system"        | As C                              | As C                                       | As C, plus each snapshot's log    | A browser host for the generator; larger file                |
| E. Viewer beside the docs   | Anyone with a checkout opens a map               | As B or C                                         | As B or C                         | Noisy if committed, absent if ignored      | As B or C                         | A flag on the build                                          |
| F. Repository as the unit   | Developers with git; history and review          | Yes, by commit                                    | Yes                               | Clean                                      | From git                          | Nothing: it is the source form of A to D                     |

Where each shape stands on the owner's three scenarios and two constraints:

- **Truth by fiat when detached.** A declared line with `declared` as its basis, in the board text or a system's authored region. A needs the tool to write it; B needs a download and a drop; C and D allow it inside the file by anyone holding it, and also by a text editor, because the board text sits in the file as readable markdown.
- **An imagined piece.** A name, a kind, the doors it must serve, no source. Later the name is pointed at a folder or a snapshot and the scan fills the doors; drift shows what the real thing fails to serve. Same across shapes; C and D let a recipient add one.
- **Detachment.** A, B and C carry snapshots. D can make new ones.
- **Trust and trim.** A trades no runnable artifact. B, C and D trade HTML that runs, like any web page, and C and D also embed the docs, so the trim becomes the question of what goes into the file, and the file states what it holds and what was left out, the CycloneDX rule.
- **Size.** Today's site is a few megabytes. C adds the board text, snapshots and provenance, still a file a browser opens without effort; D adds the grammars and the TypeScript compiler, which is a different order of size and a reason to make it a separate build.
- **Saving.** A browser cannot overwrite the file it opened; C saves by downloading a copy, as TiddlyWiki does, and can use the file system API where a browser offers it. A writes in place through the panel.
- **Two truths.** With C, a returned file and the repository can disagree. The provenance stamp names the commit and run the file came from, and the import shows the difference, positions accepted as they are (a lost position costs a drag) and declarations shown as declared lines to accept (a lost declaration costs knowledge).

## The choice

**C, built on the loose text kept in the repository, with D as the step after and E as an optional flag.** In detail:

1. The board is one markdown file with strict sections: pieces with their sources (a folder, a snapshot, or none for an imagined piece), districts, tunnels, edges, and a layout section of positions keyed by name. A person can write every line of it. The tool can rewrite the layout section the way the generator rewrites a Live Doc, preserving the rest. Lint checks its shape. It lives in the repository, or in a board folder, as the source.
2. The traded thing is the single self-saving file, which carries the board text verbatim, the graph, the snapshots, the configuration, the version and commit, and the generation log, collapsed under the picture, and says what was trimmed.
3. The import brings a returned file's board text and snapshots back into the repository with the difference shown.
4. D, the scanner in the file, waits until the World Map exists and the single-file build has been used in anger.

Why this and not A: A meets authorability and durability and fails the first want, portability to people who will not install anything, which is the owner's audience at work. Why not B alone: B is a step on the way to C and its download-and-drop loop is the manual form of C's import; building B first and C after builds the same thing twice. Why not D now: the generator runs on Node against a file system and the PowerShell adapter shells out to a script, so a browser host is real work with a larger file at the end; nothing about C forecloses it. Why E and F are not choices: they are placements, and both stay available.

What this costs that the survey's tools do not pay: a single-file build (inlining the scripts and the data), the self-save, the import with drift, and the provenance block. What it saves: no second authoring tool, no server, no network, and no separate layout file with a merge algorithm and a documented loss case.

## Forks left for the owner

- **The trim levels.** World Map only; with the Local Map; without endpoints; which snapshots. The file states its level either way.
- **The viewer beside the docs (E).** Off by default, a flag on the build, or on by default and ignored by git.
- **Committing a traded file.** Never, by this proposal. A board repository for non-developers to fetch a file from is the owner's call.
- **The board file's name and words.** The sketch in the chat used "pieces", "districts", "tunnels", "edges", "layout"; on trial like the map names.

## D's risks and how to mitigate them

_Added the same evening after the owner's reply: "D is, I would say, desirable _but very risky_. That does not mean it's wrong or that the risk isn't worth it. But how might we mitigate those risks?" They also asked whether browser storage could carry some of the save-versus-download problem, and whether a single self-reproducing file makes the VS Code surface more complicated or more portable._

**The hard line.** A double-clicked file opens under `file://`, and there a page cannot fetch its sibling files, register a service worker, or stream a WASM module from a URL. So the file must inline everything: scripts, styles, the data, and any WASM as bytes. The moment a second file is needed, the user needs a server, and the portability the owner wants is gone. Everything below assumes one file and nothing else.

**Browser storage.** Yes, for the draft, not for the artifact. The board text is the live state of the page; serialising the file is cheap enough to do at save time, so nothing needs "prepping". What storage buys is safety: the pending board text kept in local storage, keyed by the board's name and provenance stamp, so that a closed tab or a reload does not lose an hour of dragging, and an "unsaved draft from 19:40, restore?" on the next open. Storage under `file://` exists in the major browsers but some share it across every local file, hence the key. Session storage dies with the tab and is the wrong one.

**Save.** Download a copy, named exactly as the opened file, so that the browser's own "replace?" makes overwriting the file one click; where the file system API exists (Chromium) save in place after the first pick; where a host exists (the VS Code webview) hand the new artifact to the host, which writes it. Each save is a whole new file, never a patch, so a failed save leaves the old file intact. The file carries a save counter and a timestamp in its provenance so that two copies can be told apart.

**Hosts, and the VS Code question.** The owner asks whether a single file complicates the VS Code surface. It adds a seam, not a surface. The viewer is one artifact in every host; two functions sit behind a seam, save and scan, and each host supplies its own: a plain browser downloads and scans with the in-file engine, the VS Code webview posts to the extension host, which writes in place and runs the Node generator with every adapter. So the viewer code becomes more portable, not less, and the hosts shrink to those two functions plus loading the file. The webview's constraints are known: a content security policy with a nonce for the inline script and permission for WASM, and a local resource root for the file.

**Security.** Three separate things.

- The file calls nothing. A content security policy in the file itself, in a `meta` tag, with `connect-src 'none'` and no remote sources of any kind, so that even a compromised script inside could not reach a network. This matches the owner's standing want of no network calls.
- The file never executes its data. Board text, docs and snapshots are parsed and rendered as text nodes, never as HTML or code, so a hostile board text is inert.
- The file says what it is. The provenance block carries the tool's version and commit and a hash of the viewer code; the import in the repository checks the hash against a known build before it reads anything, and refuses a file whose engine is not one it knows. Between colleagues the trust model is the same as any document that runs code, and the policy above is what makes it safer than most.

**Safety of the repository.** The import validates the board text against the grammar before touching the repository, shows the difference, and applies positions as they come while declarations are shown to accept. It never writes into a generated region.

**Browser differences.** Workers from a local file, storage on `file://`, WASM under a content security policy, the decompression API and Safari's habits are all things to test rather than assume. The mitigation is a Playwright matrix already in reach: build the file, open it from `file://` in Chromium, Firefox and WebKit, render, move a piece, save with the download intercepted, open the saved file, and compare it to the original with only the layout changed. If a browser refuses a worker from a local file, the scan runs on the main thread yielding progress.

**Size.** C adds text to a few megabytes of viewer. D adds grammars and the TypeScript compiler, tens of megabytes as plain base64. Mitigations: D is a separate build, not the default; a board's file carries only the grammars its systems' languages need; and the browsers' native decompression API lets the inlined code and WASM be stored gzipped, which cuts them by more than half. The file states its size and contents in the collapsed provenance so nobody is surprised.

**Correctness of the in-file scanner.** The generator runs on Node against a file system and the PowerShell adapter shells out. Mitigations: C first, then a D that scans only the languages whose adapters are pure, with PowerShell marked "needs the desktop tool" in the file itself; a file-access seam in the generator so the same code runs over a picked folder in the browser and over the file system on Node; and a measurement, the sample programs scanned in the browser under Playwright must produce byte-identical docs to the CLI's, which the round-trip suite and the oracle fixtures make cheap to state.

**Two truths.** A traded file and the repository drift. The provenance stamp names the commit and run the file came from, and the import shows the difference rather than choosing.

**What stays canonical.** The file should carry the docs' bytes, not only the derived graph, in a collapsed text block, and derive the graph on load the way every other consumer does. A person opening the file in a text editor then reads markdown, not JSON, and the import gets the canonical form back without a render step.

**The staged path, so the risk is bought in slices.** C first: the single file with save, draft, provenance and import, tested in the matrix. Then D-lite: the in-file scanner for the pure adapters, measured against the CLI. Then D in full, if the measurement holds and the size is bearable. Each slice is useful on its own and none forecloses the next.
