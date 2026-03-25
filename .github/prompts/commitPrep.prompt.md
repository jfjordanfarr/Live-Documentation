You have been requested to perform **Commit Prep** — the canonical sequence for landing a commit after implementation work has stabilized.

**Do not attempt commit prep while implementation is still in flux.** The user signals readiness by invoking this prompt. If the workspace appears unstable (failing builds, mid-refactor states), flag it and confirm before proceeding.

---

## Step 1: Get `npm run safe:commit` Passing

Run `npm run safe:commit`. This executes the full validation pipeline: ESLint, unit tests, integration tests, Live Docs regeneration, Live Docs lint, and SlopCop link hygiene checks.

**Fix failures iteratively.** Common failure categories (in rough frequency order from project history):

1. **ESLint errors** in newly created/modified source files (import ordering, unused imports, missing JSDoc on exported symbols)
2. **Broken markdown links** in documentation files (stale `../` depth counts after file moves, incorrect anchor slugs, references to deleted files)
3. **Orphaned Live Docs** — when source files have been deleted or moved, their Live Doc companions with authored content survive regeneration and cause SlopCop broken-link failures. These must be **manually deleted**. The generator logs preservation warnings like `Preserved (has authored content): <path>` — check the `live-docs:generate` output for these.
4. **Test failures** from behavioral changes that weren't caught during development

Re-run `npm run safe:commit` after each fix cycle until it's fully green. Record the final test count for the commit message.

**When to add `--benchmarks`**: Only when changes affect polyglot adapters, benchmark fixtures, or the benchmark infrastructure itself. Most commits do not need this flag.

---

## Step 2: Author Live Documentation Content

Run `npm run live-docs:lint` and inspect the output for lines containing `Authored sections missing content` or similar warnings about pending authored sections.

### The 3-Element Joint Context Requirement

Each authored content section **must** be written while holding all three of the following simultaneously:

1. **The full source code file** — read it completely, not just the header
2. **The full generated Live Doc markdown** — read the `.mdmd.md` file that the generator produced
3. **Chat history provenance** — search the chat history (`AI-Agent-Workspace/ChatHistory/`) to find when and why the file was created, which dev day and turn produced it, and what design decisions informed its existence

**Do not batch-process authored content.** Do not "scan headers" or "efficiently fill in" sections. Each file deserves individual attention with all three context elements present.

### Authored Content Format

Follow the [Layer 4 instructions](../instructions/mdmd.layer4.instructions.md):

- **`### Purpose`** (required): 1–2 sentences describing _what_ the file does and _why_ it exists, in domain-specific terms
- **`### Notes`** (optional but strongly encouraged): 3–6 bullets covering:
  - **Creation provenance**: a markdown link to the chat history file where the file was created (e.g., `Created in [Dev Day 80](../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md)`). These provenance links cause the referenced chat history file to be bundled into the static Explorer site as downloadable "Related Documentation" — they are architecturally significant, not cosmetic.
  - Key exports and their roles
  - Design rationale or constraints
  - Module relationships and dependencies
  - Degenerate/edge case handling

### Computing Provenance Link Depth

The `../` depth in provenance links depends on where the Live Doc sits in the `.mdmd/layer-4/` tree relative to the `AI-Agent-Workspace/` directory. Count the directory segments from the Live Doc's location back to the workspace root. Recent patterns: 9 segments for persistence/styles files, 10 for deeply nested view files.

---

## Step 3: Re-run `npm run safe:commit`

Content authoring introduces new markdown links (especially provenance links to chat history files). These can create new SlopCop broken-link failures if:

- The `../` depth is miscalculated
- The linked chat history file doesn't exist yet
- An anchor slug is malformed

Run `npm run safe:commit` again and fix any new failures. This step is not optional — it catches the most common class of errors introduced by Step 2.

---

## Step 4: Propose a Commit Message

Check `git status --short` and `git diff --stat` to understand the full scope of changes.

### Commit Message Rules (distilled from project history)

1. **Be honest about completeness.** If the work is incomplete or WIP, use `wip(scope):` prefix. Never claim "complete" for partial work — the user has forcefully corrected this in the past. Frame WIP commits as "context preservation" rather than feature completion.
2. **Avoid internal jargon in the title.** References like "Option C", "UC-087", "REQ-V1", or "Dev Day 78" are opaque to external readers. Make descriptions self-contained. Move internal tracking references to a `Refs:` footer line if needed.
3. **Use conventional commit format**: `type(scope): description`
   - `feat` for new features
   - `fix` for bug fixes
   - `refactor` for restructuring
   - `docs` for documentation-only changes
   - `wip` for incomplete work being committed for context preservation
4. **Structured body** listing key changes grouped by category (implementation, tests, documentation, infrastructure). Include final test counts and any numerical metrics that demonstrate scope.
5. **Note what is NOT complete** when relevant — especially for WIP commits. This prevents future sessions from assuming completeness.

Present the proposed message to the user for review. The user will approve, modify, or request revision.

---

## Step 5: Stage and Verify

Run `git status` to verify the full set of changes. Call out:

- Any **unintended files** that should NOT be staged (temp files, build artifacts, scratch scripts)
- Any **missing files** that SHOULD be staged but aren't tracked (new files that weren't `git add`-ed)
- **AI-Agent-Workspace/** files that should be included (chat history, census updates, summaries)

The user will perform the actual `git add`, `git commit`, and `git push`.

---

## Step 6: Verbalize Loose Ends

List all known open items, deferred work, and unresolved questions that should bootstrap the next dev day or chat session. Draw from:

1. **Deferred items** from this session's work (things explicitly punted)
2. **Known bugs or visual issues** observed but not fixed
3. **Test gaps** (areas with no coverage)
4. **Documentation gaps** (L1–L3 docs that may need updating to reflect implementation changes)
5. **Feature backlog items** that were partially advanced

This list serves as the handoff artifact between sessions, complementing the chat summary as the primary vehicle for continuity.

---

## Resilience Rules

- **If `safe:commit` fails repeatedly on the same issue**, investigate the root cause rather than creating workarounds. The pipeline is designed to catch real problems.
- **If autosummarization occurs mid-prep**, rehydrate from the workspace state — files already edited are durable. Check `git status` to see what's been modified.
- **If orphaned Live Docs with authored content block regeneration**, manually delete them after confirming the source file is truly gone. The generator preserves them as a safety mechanism, not a bug.
- **Do not skip Step 3** (re-running safe:commit after authoring). History shows this is the most commonly failed step when skipped.
