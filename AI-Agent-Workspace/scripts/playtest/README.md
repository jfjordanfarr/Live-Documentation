# Blind playtests

Current, written 2026-11-18. The instrument for the owner's blind UX tests of the Explorer.

## Why it exists

On 2026-11-18 the owner asked for ever smaller Claude models to try the Explorer blind, "forced to use only keyboard/mouse inputs and screenshots (no access to DOM or page HTML/JS/CSS)", because what gets them stuck "are almost certainly going to reveal deeper underlying design decisions we need to resolve". Their aim of long standing is software that is almost self-evident: the weaker the model that can still do a visitor's task, the nearer the Explorer is to it. The ladder runs downward on the same tasks: Opus at medium effort, Opus at low, Sonnet, Haiku.

It is for the root agent and its builders, who run testers and judge their records; it is not part of the product, and nothing here is shipped or tested by the gate.

## What a tester has

A tester is a headless Claude Code session (`claude -p`) that has exactly seven tools, all from one MCP server, `browser-window.mjs`, which drives one Chromium page at 1,280 by 800:

| Tool | What it does |
| --- | --- |
| `look` | The picture of the page, with the address and the tab's title, as a browser window shows them, and where the pointer is: a headless picture has no pointer drawn in it, and a person always sees theirs. |
| `point` | Move the pointer and leave it there: hovering, which is how the Explorer explains itself. The one addition to the plan's six. |
| `click`, `drag`, `scroll` | The mouse, at x, y in the picture's pixels, with a button and held keys where wanted. |
| `type`, `press` | The keyboard: text into whatever has focus, or a key or combination. |

The harness, not an instruction, keeps the tester blind. The tester is started from an empty folder outside the repository with no built-in tools (`--tools ""`), this server as its only MCP server (`--strict-mcp-config`), no setting sources, no skills or slash commands, no saved session, its own system prompt in place of Claude Code's, and an environment that carries none of the calling session's variables. Its permission mode (`dontAsk`) refuses every tool not named in `--allowedTools`, which names the seven. The page's requests that leave the site's origin are blocked, a new tab is followed, dialogs are dismissed and reported, downloads are refused. The server never reads the DOM or the accessibility tree for the tester and offers no way to open an address. The 2026-11-18 probes are the evidence: `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/blind-playtests/`.

The tester's prompt is the visitor's message and the link; the page is already open on it. Its system prompt says only that it is at a browser window, that its reply is all the person will read, and that what it copies to the clipboard reaches them with its reply. That last is how a tester sends a link it cannot see: a person who presses a copy button pastes the link into their reply, so the harness reads the clipboard after every action and the judge reads `clipboard.jsonl`. The address of the page is also in every `look`, as the address bar is.

## Variants

`--variant look-only` (the default): actions answer "Done." and only `look` returns a picture. `--variant after-each`: every action returns the picture of the page once it has come to rest. Each tool's description says which, since in the first after-each run, whose descriptions did not, the tester looked again after every picture it had already been given. In both, the record has a picture after every action. A page has come to rest when two pictures 200 ms apart are the same, or after 4 s (1.5 s for `look`); the tester is told when it was still moving.

## Running one tester

The site is the main checkout's built Explorer (`dist/explorer/`; build nothing for a playtest), served read-only on `http://127.0.0.1:8792/`. The launcher serves it for the run if nothing does already, and runs the tester under the shared browser lock (`flock -s /tmp/live-docs-browser.lock`), so a gate or a timing run waits for it and it waits for them.

```bash
node AI-Agent-Workspace/scripts/playtest/playtest.mjs --task estate-uses --model claude-sonnet-5-5 --effort medium \
  --variant look-only --out AI-Agent-Workspace/AgentSessionHistory/<year>/<month>/<day>/Probes/blind-playtests/<run>
```

`--task` names an entry of [tasks.json](tasks.json); `--start <url> --words <message>` gives one instead. `--max-actions` (default 60) ends the tester's time with the window: past it, every action answers that time is over. Model IDs: `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5`; efforts: `low`, `medium`, `high`, or `default` for the model's own. `run.json` notes when the built site was last written, at the run's start and end, and `siteChanged` says whether a rebuild came under the run. `--claude` names the Claude Code program when it is not where this container keeps it. Without `--out` the run goes to `AI-Agent-Workspace/tmp/playtests/`.

## The narrative playtest

On 2026-11-19 the owner named a test of the whole product: "a true test of the efficacy of our product would be to hand it to an agent which watches the evolution of the software and have it functionally restate the narrative.md just by using the software". They also named the bias such a test must allow for: "Models live on text. It's natural for them to wish for there to be more."

- **The tester.** It starts on this repository's 3D Local Map. The window has opened the history with the map's own History button, as a setup the tester is told of (`--open-history`). It has 150 actions to tell how the software came to be, with what on the screen showed each statement.
- **Two conditions**, because this repository's commit subjects are written to be read:
  - `narrative-panel` shows the step panel, as a person meets it.
  - `narrative-picture` (`--hide-step-words`) draws no step panel, no panel toggle, no step dialog and no commit subject in the finder's results. The harness does this with a stylesheet of its own, added before the page loads. The tester then has the picture, the ticks, the dates and the names on the map.

  In both conditions the window checks the setup before the tester begins: is the scrubber open, and is the panel drawn or not drawn as the condition says. It writes the check to `setup.json` and ends the run if the check fails.
- **The key.** [narrative-claims.md](narrative-claims.md) holds 39 dated claims drawn from [the narrative](../../Memory/narrative.md) before any run. Each is marked showable as a picture, showable only in words, or not showable by the history at all. It is never shown to a tester.
- **The grade.** `grade-narrative.mjs <run folder>` gives [the grader's brief](narrative-grader.md), the claims, the narrative and the account to a fresh session with no tools, and writes `grade.md` and `grade.json` beside the run. The grader is not told the tester's model or condition. It needs no browser.

```bash
node AI-Agent-Workspace/scripts/playtest/playtest.mjs --task narrative-panel --model claude-opus-5-5 --effort high --out <records>/narrative-panel-opus-high
node AI-Agent-Workspace/scripts/playtest/playtest.mjs --task narrative-picture --model claude-opus-5-5 --effort high --out <records>/narrative-picture-opus-high
node AI-Agent-Workspace/scripts/playtest/grade-narrative.mjs <records>/narrative-panel-opus-high
```

## Running a ladder

`ladder.mjs --plan <plan.json> --into <records folder> [--parallel 4] [--gap 30]` runs a list of testers (`{ name, task, model, effort, variant }`) a few at a time. When a batch ends, it leaves the browser lock free for `--gap` seconds, so a gate or timing run waiting to hold the lock alone gets in. One server serves the site for the whole ladder, and a run already finished in its folder is skipped. A stopped ladder resumes when run again.

## Keeping the pictures a finding needs

A run takes a picture after every action, about 100 KB each, and half a ladder came to 16 MB. Following the owner's wish for fewer committed artifacts, `keep-pictures.mjs <records folder>` runs once the runs are judged and the folder's README links the pictures its findings rest on. It keeps each run's first and last picture and every picture the README links to, and moves the rest to the main checkout's `AI-Agent-Workspace/tmp/playtests/<run>/shots/`, which git ignores. Each run's `actions.jsonl` still names every picture. Run it again after the README changes: a newly cited picture comes back if it is still there. The ladder prints this step when it ends.

## A run's record

One folder a run:

- `run.json`: the task, start address, words, model, effort, variant, the system prompt, and when it ends the outcome, turns, tool calls, actions by tool, tokens, cost, wall time (from the tester's start, so not counting `lockWaitMs`, the wait for a gate to free the lock), the clipboard's contents, the final address, and the tester's own account of its tools, servers, skills and plugins at start.
- `actions.jsonl`: every action in order, with its time, tool, arguments, whether the page came to rest, the address and title after it, its picture, and anything the harness noticed (a dialog, a new tab, a blocked request).
- `shots/`: the picture after each action, numbered as the actions are. A picture the same as the one before is not written again: the action's line in `actions.jsonl` names the earlier file.
- `transcript.jsonl`: what the tester said and did and what came back to it (text only; pictures are counted, and are in `shots/`). The tester's reasoning is not kept.
- `answer.md`: the tester's reply. `clipboard.jsonl`: each change to the clipboard. `stderr.log`: the program's own complaints.

[tasks.json](tasks.json) holds each task's `rightAnswer`, for the judge only.
