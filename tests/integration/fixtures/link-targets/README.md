# link-targets

The workspace of the browser case `tests/e2e/link-targets.spec.ts`: one source file whose Live Doc's authored words link to a document by every form CommonMark reads for a target that holds parentheses, and whose docstring holds a line the Live Doc writes behind a backslash.

| Path | What it is |
| --- | --- |
| `src/plan.ts` | `draftPlan`, whose docstring holds the line ``#### `notes` ``, which its Live Doc writes as ``\#### `notes` `` so that it is not read as a symbol's heading |
| `.live-documentation/source/src/plan.ts.md` | The authored part of its Live Doc: links to `notes/plan (draft).md` in angle brackets, bare with parentheses that pair, percent-encoded, with backslash escapes, with a title in quotes and with a title in parentheses, and one into `app/(auth)/`; and once by reference, `[by reference][plan]`, whose definition stands in the Notes section |
| `notes/plan (draft).md` | The document they name, a name with a space and parentheses |
| `app/(auth)/notes.md` | A document in a folder named as a web framework's route group |

`npm run live-docs:visualize:link-targets` generates the rest of the Live Doc in a copy and builds the Explorer over it into `dist/explorer/samples/link-targets`.
