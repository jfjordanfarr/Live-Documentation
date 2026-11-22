# The engine review of 2026-11-22: the day's changes to how the product reads code, attacked by inputs

Historical evidence, a record of 2026-11-22. An independent reviewer wrote it for the root on a branch from `46e13bf60`, the tip of `day/2026-11-22`. It reviews `git diff 76cd9914c 46e13bf60 -- packages/engine packages/generator scripts/live-docs scripts/oracle` and the day's changes to tests. No product code and no existing test was changed. Each finding comes with an input, the command that shows the answer, and the reason the answer is wrong. Each failing case is now a test, red today, for the builders to mend on top of this branch.

This record is a first milestone. It covers items 1, 2, 4 and 5 of the brief, part of item 3, and part of item 6. Item 7 was not reached (section 6).

## 1. Findings, in rank order

### A wrong fact shown: a path between ends that share files is lost

- **Input.** A workspace with `src/a.ts` using `src/b.ts`, and `src/Pay/p.ts` using `src/a.ts`.
- **Command.** `inspect --from src/ --to src/b.ts`
- **Answer.** "No path runs between src/ and src/b.ts, either way." (exit 1). `--from src --to src/Pay` gives the same answer, and so does `--json`. The JSON's `visited` lists `src/b.ts`, the target, and its frontier calls `src/a.ts` "terminal", though `src/a.ts` uses `src/b.ts`.
- **Why it is wrong.** `walkBetween` states its rule as "a file in both sets is not its own path, so the starts are never targets". The rule's first half is right: one file is never a path to itself. The second half does not follow from it. Dropping every start from the targets also loses every path between two different files where the target is a start as well. `src/a.ts` → `src/b.ts` is such a path: `src/a.ts` is in `src/`, and `src/b.ts` is in both ends. The Explorer walks through the same function, so the page gives the same wrong answer.
- **Test.** `packages/engine/src/live-docs/pathfind.overlapping-ends.test.ts`.

### A wrong fact shown: `exports: null` and a `null` under a condition, read unlike Node

All the inputs are built as packages and Node is asked by `require.resolve` and by `import.meta.resolve`. The test is `packages/engine/src/live-docs/adapters/json.exports-held-by-node.test.ts`. The reader's answers are the module entries it declares.

| Manifest | Node | The reader |
| --- | --- | --- |
| `{ "exports": null, "main": "./lib/main.js" }` | `lib/main.js`, both ways | nothing |
| `.`: `{ node: { import: null, require: "./n.cjs" }, default: "./d.js" }` | `n.cjs`; import: not exported | `d.js`, `n.cjs` |
| `.`: `{ import: [], require: "./r.cjs", default: "./d.js" }` | `r.cjs`; import: not exported | `d.js`, `r.cjs` |
| `.`: `{ import: [null], require: "./r.cjs", default: "./d.js" }` | `r.cjs`; import: not exported | `d.js`, `r.cjs` |
| `"exports": "./../outside.js"` | `ERR_INVALID_PACKAGE_TARGET` | `../outside.js`, a file outside the package |
| `"exports": "./lib/../x.js"` | `ERR_INVALID_PACKAGE_TARGET` | `x.js` |
| `{ ".": "./a.js", "import": "./b.js" }` | `ERR_INVALID_PACKAGE_CONFIG` | `b.js` |

The reasons, from Node's documented algorithm and checked against Node 26.13.1:

- Node reads `exports` when it is "not null or undefined". The reader tests `=== undefined` only, so `exports: null` gives no entry at all.
- A condition whose target resolves to `null` returns `null`, and the search ends there. This covers a `null` nested under another condition, an empty list, and a list of `null`. The reader's `exportTarget` turns a nested `null` into `undefined` and goes on to the next condition.
- Node requires a target to be `./` followed by segments free of `.`, `..` and `node_modules`. The reader accepts any target that begins with `./`. One result is an entry declared outside the package, which in a monorepo is a file of another package.
- Node refuses an `exports` that mixes subpaths with conditions, as the oracle's `causeOf` already names. The reader still declares an entry for it.

The oracle over the 281 installed packages could not see any of these shapes, because no installed package holds them.

### A wrong fact shown: a directory typed in the wrong case stands for two directories

- **Input.** A workspace holding `src/Pay/p.ts`, `src/pay/q.ts` and `src/PaymentService/s.ts`, where `q.ts` uses `s.ts`.
- **Command.** `inspect --from src/PAY --to src/PaymentService --json`
- **Answer.** Exit 0 and `kind: "path"`, a path from `src/pay/q.ts`. The text form labels it `src/PAY/`.
- **Why it is wrong.** When the typed name matches nothing as spelled, `resolveEnd` folds the case of every path. Both directories then match, and the end becomes their union: a path from a directory nobody named. The scan reads names as written, and Linux allows both names in one folder.
- **Test.** `scripts/live-docs/inspect.case-folded-directory.test.ts`. It proposes that the command fail and name both spellings; the builder may choose another honest form.
- **What does hold.** `Pay` against `PaymentService` is told apart (`under` matches on `/`), and a directory spelled as in the workspace is found as spelled.

### A gap between the rule and the code: a symbol's path to itself is a path of no hops

- **Command.** `inspect --from 'src/a.ts#a' --to 'src/a.ts#a'`
- **Answer.** "Symbol path from src/a.ts#a to src/a.ts#a (0 hop(s), outbound)." (exit 0). `--to src/a.ts` gives the same answer.
- **Why it is a gap.** Since this day, a file asked as a path to itself is no path, on both surfaces. The symbol search, which the same command runs, does not follow that rule. A case in `pathfind.overlapping-ends.test.ts` holds it. If the root rules that a symbol's path to itself is a different question, that case changes.

### A gap between the rule and the code: the host is asked again and again for a `go.mod` that is not there

- **Input.** The `go/depot` sample.
- **Command.** `node --import tsx AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/engine-review/count-host.mts tests/integration/programs/go/depot`. The script scans a copy through a host that counts every call, failures included.
- **Answer.** The whole scan asks 32 times for eight `go.mod` files that do not exist; `report/go.mod` and `stock/go.mod` are asked eight times each. Every file that does exist is read once.
- **Why it is a gap.** The run's reads promise that each file is read "once per file per run". `moduleOf` in `go.ts` walks up by reading `go.mod` in every folder. A failed read is kept by no one, by design, so the next Go file of the same folder asks the host again. In a page every such ask waits on the browser. The design moves these probes to `kind` from the listing in step 4, so the gap is a known one. What is new is that nothing measures it: see the next finding.
- **Test.** `packages/engine/src/live-docs/adapters/go.module-probe.test.ts`, which counts the second pass alone (four asks each for `report/go.mod` and `stock/go.mod`).
- **Elsewhere.** The other seven samples measured (`typescript/tidepool`, `python/ledger`, `rust/analytics`, `csharp/estate`, `c/modular`, `java/service`, `ruby/cli`) showed no path asked of the host more than once, and no failed ask.

### A weakness of the tests: the page check counts no failed read

`bytesOf` in `tests/page-scan/stand-ins/fs.mjs` counts a read only after finding the file, so the check's "read once" is blind to repeated asks for absent files. The Go reader's 32 asks show this, and step 4's probes of absent files will too. No test file is added for it: the mend belongs to the check, and the Go case above fails while the check stays green.

### A weakness of the tests: the package oracle's import side never asks from a nested copy

- **Command.** `node --input-type=module -e 'console.log(import.meta.resolve("eslint-visitor-keys", "file:///nonexistent/place/x.mjs"))'`
- **Answer.** The top-level copy's file, exactly as when the parent named is `node_modules/eslint/consumer.mjs`. With `--experimental-import-meta-resolve`, Node gives the nested copy's `node_modules/eslint/node_modules/eslint-visitor-keys/lib/index.js`.
- **Why it matters.** Node reads `import.meta.resolve`'s second argument only under that flag; its documentation says so. The oracle (`importedByNode` in `tests/integration/live-docs/package-modules.oracle.test.ts`) passes the owner's folder as that argument. So every package is resolved from the test's working folder.
- **What follows.** The register's cause "a nested copy: Node's ESM resolver answers with the top-level copy's file", with its note "Not established why", is the oracle's own mistake, not Node's behaviour. For the six nested packages, the import side has never been compared.
- **A second weakness.** `causeOf` puts every nested package that disagrees, for whatever reason, under that one cause. Only its count guards it.
- **The mend.** Run each nested package's question in a process whose working folder is the owner, as `json.exports.test.ts` already does, or pass the flag.
- No test file is added: a test of Node's flag would fail for Node's reason, not the product's.

## 2. What was attacked and held

**Reads.**
- A file shorter than the kept head is handled: `subarray` stops at the end of the file.
- A head asked after a whole read is answered from that read. The generator now asks for a file's reading before its head, so a file with a reader is read once.
- Every `readSourceText` and `readSourceReading` call in the engine hands on the run's reads.
- A tsconfig extending a file of another kind was tried and read nothing twice; that file is not among the scan's targets.
- The seven samples above showed no file asked of the host twice.
- `node-needs.json`'s remaining reads outside the host (discovery's `.gitignore`, the docs the generator and `graphFiles.ts` read back, and the Node host itself) are the four that `engine-and-hosts.mdmd.md` step 3 names, each with its reason.
- Not tried: a file that changes between the passes. With one read per run it cannot read differently; under Node a file that changes during the run's single read is the host's concern.

**Entries from manifests.** These shapes agree with Node:
- a `.` target that is a list of conditions, `[{ import: "./i.mjs" }, "./f.js"]`;
- a `null` inside a fall-back list;
- `exports` as a bare string;
- `main` naming a folder that holds its own `package.json` (Node does not read the inner manifest, and the reader does not either);
- a condition nested three deep that ends in a `null`. The reader's answer for import is wrong there, but the union of the two sides equals Node's, and the union is what the product shows.

**The author's reference.** The C# reader was run on a file of crefs, without the compiler, so there is no finding from it. It linked:
- an overload by `int`, by `Int32` and by `System.Int32` to the same overload;
- `string` to the other overload;
- a nested type;
- generics of one and of two parameters, to the right declaration;
- a namespace alias (`L.Calc`) and a type alias (`CalcAlias`).

It linked nothing for:
- an indexer and an operator, as its doc says it does not;
- `L::Calc`, the alias-qualified form, which C# binds. This was not checked against the compiler;
- `Lib.Calc.Add` with no parameters it linked both overloads, the class the compiler records as `Ambiguous` (CS0419).

No road from `documentation` to `edges`, `outbound`, reach or paths was found by search. Its consumers are `graph.ts`, `estateGraph.ts` and `inspect/emit.ts`.

**The command line.**
- `--from a --to a` is no path, as ruled.
- A directory as `--from` with no `--to` refuses, naming `--to` and `--reachable`.

## 3. The tests added, and which cases are red

| File | Red | Green |
| --- | --- | --- |
| `packages/engine/src/live-docs/pathfind.overlapping-ends.test.ts` | 4: directory to a file under it; overlapping sets; directory to a subdirectory, inbound; a symbol's path to itself | 1: one file as both ends |
| `packages/engine/src/live-docs/adapters/json.exports-held-by-node.test.ts` | all 7 shapes | none |
| `scripts/live-docs/inspect.case-folded-directory.test.ts` | 1: two directories by case | 1: one directory by case |
| `packages/engine/src/live-docs/adapters/go.module-probe.test.ts` | 1 | none |

Thirteen cases are red and two are green.

## 4. Not reached

- **The C# compiler oracle on new inputs.** `dotnet` is installed, but `csharp-compiler.cs` was not run on the probe's file of crefs.
- **Item 5 in full.** These were not tried: two runs compared for the same output, each answer's stated bound, and the JSON of every answer against its text. One was seen: the not-found JSON above lists the target among `visited`.
- **Item 6 in full.** The parity ledger and `parity.test.ts`, and the day's other registers, were not read for a miss they would accept silently.
- **Item 7.** The merges between branches were not examined.
