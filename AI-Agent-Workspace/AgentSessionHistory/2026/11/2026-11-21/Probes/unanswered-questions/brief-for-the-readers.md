# Brief: list what was put to the owner in one chunk of a chat record

You are one of about twenty readers working in parallel. Each reads one chunk of a chat record and writes a list. You need nothing else from this repository: do not read other files, do not run git, and change nothing except your one output file.

## What this is for

A software project's owner works with an AI "root" agent in long chat sessions. Over five days (November 15 to 19, 2026) the root put many questions and choices to the owner. The owner believes they failed to answer a good number of them, and that the root's own default choice then quietly took effect. They want every such item brought back up. A later reader, with the whole five days in view, will decide which items are still open. **Your job is only to find them all in your chunk and say whether the owner answered inside your chunk.** A missed item is the costly mistake here; an extra item costs almost nothing. When in doubt, include it.

## How the record is laid out

- `## Turn N` headings: under each, a fenced block holds what the **owner** typed, verbatim. Text outside the fence is the root's work notes.
- Headings such as `## Root's reply to Turn 5, as delivered`, `## Root's messages from 18:18 to 18:44 UTC, as delivered`, and (in the earlier days) plain headings like `## Questions for you` or `## One call of mine you can reverse` that sit inside a fenced reply: these hold what the **root** showed the owner, verbatim.
- Work notes (headings beginning `### Work notes`, and the `## Resumption` section near the top) are the root's own account and plans. The owner did not necessarily see them. They are still useful: they often list what is "put to the owner and unanswered".
- Your chunk may start in the middle of a session. Its first line says where it sits.

## What to list

One entry for each thing the root put to the owner. Five kinds:

1. **question**: a direct question to the owner. Signs: "Which…?", "Do you want…?", "yes or no?", "Questions for you", "Waiting on you", "Decision for you", "One fork for you", "What I need from you".
2. **reversible-call**: a choice the root made on the owner's behalf and told them they could reverse, correct or object to. Signs: "a call of mine you can reverse", "choices you can reverse", "rulings for you to correct", "unless you object", "stands unless you say otherwise", "I'm taking X as the default", "my call".
3. **offer**: something the root offered to do if the owner said so. Signs: "say the word and…", "if you want, I'll…", "I can also…".
4. **awaiting-your-eye**: a picture, link, trial or set of alternatives the root asked the owner to look at and judge. Signs: "for your eye", "tell me which reads better", "see it yourself", options A/B/C shown as pictures.
5. **carried-list**: where the root (in a reply or in work notes) lists questions "still waiting on you", "unanswered" or "open with the owner" from earlier. Copy **each line of such a list as its own entry**, kind `carried-list`.

Do not list: questions the owner asks the root; questions the root asks itself; rhetorical questions; plain status reports with nothing asked.

If the same item is put again later in your chunk, list it once at its first place and add `repeated-under:` with the later heading.

## Whether it was answered

For each entry, read the owner's turns that come **after** it in your chunk. The owner often answers many things in one long message, sometimes by quoting the question with `>`, sometimes in passing, sometimes indirectly.

- `yes`: the owner's words address it. Quote them.
- `partly`: they address part of it, or react without choosing. Quote them and say what is left.
- `no`: nothing in your chunk addresses it. Do not guess what happened after your chunk ends.

A work note saying "the owner answered in Turn 3" is a pointer; go and quote the owner's words from that turn if it is in your chunk.

## Output

Write one Markdown file at the output path you were given. For each entry, exactly this block (keep the field names):

```
### <running number>
- day: <the session date from the chunk's first line, e.g. 2026-11-18>
- under: <the nearest "## " heading above it, copied exactly>
- kind: question | reversible-call | offer | awaiting-your-eye | carried-list
- quote: "<the root's words, verbatim, enough to stand alone, up to about 400 characters>"
- default: <what the root said it would do or was doing absent an answer; or "none stated">
- answered-in-chunk: yes | partly | no
- answer: "<the owner's verbatim words>" (under <heading>)        <- omit this line when answered-in-chunk is no
- topic: <three to eight plain words>
```

Then reply to me with only: the output path, how many entries of each kind, the last line number of the chunk you read, and anything you could not read. Do not paste the list into your reply.

## Reading

Read your chunk file from its first line to its last. The file reader returns a large file in ranges: keep reading until the file ends. Do not sample or search in place of reading; a question can sit in the middle of a long status message.
