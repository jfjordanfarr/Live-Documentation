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

## 2026-11-22, later: the second pass

The root asked for this pass after reading the first milestone. It runs on `bcd44843b`, the day's tip, merged in, which adds the readers' probes answered from the scan's listing (`tooling/workspaceListing.ts`, `workspaceProbes.ts`).

The package oracle's import side (the last weakness in section 1) had already been mended there by the engine's builder: it asks with the flag now, and 279 of 281 packages agree.

### Findings, in rank order

#### A wrong fact shown: the reverse search's "no path" claims something it did not test

- **Input.** A copy of the estate sample.
- **Command.** `inspect --from PaymentService --to Contracts --direction both`
- **Answer.** `REVERSE PATH (inbound): No path found.`, followed by `Nothing that depends on "PaymentService" also depends on "Contracts".`
- **Why it is wrong.** `Hub/App.config` uses `PaymentService/App.config` and `Contracts/IPaymentService.cs`, as `inspect --from Hub/App.config --direction outbound` lists. The reverse search shows only that `Contracts` does not depend on `PaymentService`.
- **History.** The sentence is older than the day (`emitDualDirectionResult`). The day's directories as ends now name a directory by its last segment in it.
- **Test.** `scripts/live-docs/inspect.reverse-path-wording.test.ts`, red.

#### A wrong fact shown: a reference to one overload links two overloads, or one that is not named

Two small projects were built: `Lib` declares `Mix(Calc[])`, `Mix(ref Calc)` and `Mix(Calc, Calc)`, and `App` names them. The compiler oracle (`scripts/oracle/csharp-compiler.cs`, Roslyn 4.12) was run on them. The reader's answers were read from `csharpAdapter` for each reference.

| `cref` | The compiler | The reader |
| --- | --- | --- |
| `Lib.Calc.Mix(Lib.Calc[])` | `Mix(Calc[])` | `Mix(Calc[])` and `Mix(ref Calc)` |
| `Lib.Calc.Mix(ref Lib.Calc)` | `Mix(ref Calc)` | both |
| `Lib.Calc.Mix(Lib.Pair{Lib.Calc})` | nothing | both one-parameter overloads |
| `Lib.Calc.Mix(Lib.Calc,)` | nothing (the parser recovers, the binding finds none) | `Mix(Calc, Calc)` |

There are two causes:

- `parameterShape` drops array marks and modifiers, which both a `cref` and a declaration write as text and could compare as written.
- `namedMembers` links every overload with the same number of parameters where none matches (`matching.length > 0 ? matching : counted`), a guess shown as a link.

The test is `packages/engine/src/live-docs/adapters/csharp.cref-overloads.test.ts`: four cases red, and a control, `Mix(Lib.Calc, Lib.Calc)`, green.

#### A weakness of the tests: the C# oracle's documentation comparison cannot see a wrong declaration

- **Command.** `npm run oracle:csharp -- <the two projects> --detail`
- **Answer.** "the reader's documentation relation: 2 pairs, 2 of them the compiler's; the compiler's only: 0; the reader's only: 0". It reports that while four references above link the wrong declarations.
- **Why.** `compareDocumentation` works on file pairs and drops a reference within one file (`to !== reference.from`). So a wrong overload, a wrong member of the right file, and every reference to a declaration of the same file are invisible to it, on DNN and on mojoPortal as here.
- **Two further gaps.** A `cref` the compiler cannot parse at all (seen: `L::Calc`, which Roslyn's cref grammar does not take) is absent from its record. If the reader linked one, `compareDocumentation` would file it as "unwritten", a cause that names inactive preprocessor sections.
- No test file is added: the mend changes the oracle's comparison to declarations, and the product case above is the test.

#### A weakness of the tests: the parity ledger reads neither the exit status nor which stream

`run` in `tests/integration/live-docs/parity.test.ts` joins standard output and standard error and resolves on close whatever the exit status. So a "yes" row passes while its fragment appears anywhere, an error message included, even when the command fails.

This was found by reading; no input was built, since every "yes" row exits 0 today. Each row could record its expected status.

### Attacked and held

**The readers' probes on the listing.** The HTML, CSS, Python and Ruby readers were each asked once with the run's listing and once with the disk, on a made workspace. `count-host`'s seven samples were not re-run.

- A file and a folder the listing holds: the same answers.
- Python's package and namespace imports, and Ruby's `require_relative`: the same.

Two answers do differ from the base, and both were already wrong at the base. Each is now an unlinked name where it was a broken link. Neither is the listing's fault, and the honest link was in neither. They are remarks only:

- **A link to a document.** `<a href="../README.md">`, `<a href="guide.md">`, `<a href="../LICENSE">` and a CSS `url("../docs/intro.md")` are drawn at the base as links to `../README.md.md`, a doc that does not exist, because documents get no Live Doc. At the tip they are unlinked names, because discovery keeps documents out of the listing. The document is in the scan as a document, and the honest link would be to it.
- **An include through a symbolic link.** `#include "../vendor/x.h"`, where `vendor` links to `third_party` inside the workspace, and `../shared/y.h`, where `shared` links outside, are drawn at the base as links to `../vendor/x.h.md` and `../shared/y.h.md`, docs that do not exist. At the tip they are unlinked. The listing holds `third_party/x.h` under its real path, and the honest link would be to it.

**The author's reference against the compiler.** These agree with the compiler, declaration by declaration:

- an overload named by `int`, `Int32` or `System.Int32`;
- a generic method `Echo{T}(T)` beside `Echo(int)`;
- a nested type's member, `Lib.Calc.Inner.Run`, beside the outer `Run`;
- a nested type's own `Run` and `Add` from within it, and the outer `Calc.Run` from within the nested type;
- generics of one and of two parameters, and `Pair{,}`;
- `global::`;
- a namespace alias (`L.Pair{X}`);
- `Run ()` with a space before the parenthesis.

`L::Calc`: Roslyn does not parse it as a reference, and the reader links nothing, so they agree.

Where the reader and the compiler part by known classes:

- **An operator.** The compiler resolves `operator +`; the reader links none. This is the oracle's `notRead` class.
- **Framework types.** Parameters of `int` without framework references resolve to nothing in the compiler. This is the oracle's `framework` class.

**The command line, the same input twice.** Twenty-five invocations over the estate copy, each run twice, gave identical output, error output and exit status:

- `inspect` with `--reachable`, `--groups`, neighbours, directory routes each way, `--direction both`, and each of these with `--json`;
- five malformed invocations;
- `board`, `lint` and `find-orphans`.

Every malformed one exits 1 with a message. None reads standard input: each was run with empty input and none waited.

**The JSON against the text.** Three answers were compared and agree, but for the reverse wording above. A remark: for a route between directories, `kind: "path"` names the path's end files as `from` and `to`, while `kind: "dual-direction"` names the directories asked. The text of the first does not mention the directories at all.

### Not reached in this pass

- **Item 5.** What the merges between branches may have broken was not examined.
- **The registers.** Only the C# oracle's documentation comparison and the parity ledger were read for this. The PowerShell and SQL ledgers and the page check's `differences.json` were not.
- **Stated bounds.** Each answer was not checked against its stated bound.

## 2026-11-22, last: the third pass

This pass reviews `3cd947724`, the day's tip, merged in with a plain merge and no conflict. Every finding of the first two passes had been mended and merged by then. The pass gated one rebuild of the history and the day's landing on `main`.

**Nothing found stops either of them.**

- **The history.** The history and a checkout agree on a made repository whose files carry a plain object's member names. No import resolved by a kept file was lost for a reason other than "left out".
- **The two new findings.** Both are in the C# reader's resolution of an author's documentation reference. That relation is held apart from the edges, so neither moves a use, a path or a reachability answer. Each does show a person a wrong link, or a missing one, in a symbol's Links list.

### Findings of the third pass, in rank order

#### A wrong fact shown: a member named through a type that only inherits it is linked; the compiler finds nothing

- **Input.** Two projects. In `Lib`, `Derived : Base`. `Derived` declares `Grow(Calc[])`, and `Base` declares `Grow(Calc)`, `Shrink(Calc)` and a property `Layout`. `App` names the members through `Derived`.
- **The C# compiler's answer.** It resolves none of these references:
  - `Lib.Derived.Grow(Lib.Calc)`;
  - `Lib.Derived.Shrink(Lib.Calc)`;
  - `Lib.Derived.Shrink`;
  - `Lib.Derived.Layout`.

  Two runs agree on this. `scripts/oracle/csharp-compiler.cs` (Roslyn 4.12, without framework references) gives it, with the same references inside `Lib` too. So does `dotnet build` with the framework and `GenerateDocumentationFile`, which warns CS1574 "could not be resolved" for each.
- **The reader's answer.** It links each one to `Base`'s declaration.
- **Why.** The reader's stated rule says the opposite of the compiler: "A member named through its type (`Base.Gadget`) is found where the type inherits it too". So does its own case in `csharp.test.ts` ("Named through its type, an inherited member is found": `Derived.Layout`), and so does the day's new fall-back to the base types' overloads. None of the three was held to the compiler on such a reference. The mended oracle reports these as "the compiler resolves the reference to nothing, and the reader links it".
- **Test.** `packages/engine/src/live-docs/adapters/csharp.cref-inherited-member.test.ts`, 4 red. Two controls are green: `Derived`'s own `Grow(Lib.Calc[])`, and `Shrink` through `Base`. The existing case in `csharp.test.ts` will need to change with the mend.

#### A link the author made is missing: a reference that renames a generic's type parameter is left as text

- **Input.** `Lib.Calc.Echo{U}(U)` for `Echo<T>(T)`, and `Lib.Box{X}.Put(X)` for `Box<T>.Put(T)`.
- **The compiler's answer.** It binds both, by the type parameter's position. The oracle gives this, and `dotnet build` raises no warning.
- **The reader's answer.** It links nothing.
- **Why.** `parameterShape` compares the written name, so `X` is not `T` to it.
- **Test.** `packages/engine/src/live-docs/adapters/csharp.cref-renamed-type-parameters.test.ts`, 2 red. The spellings as declared are green.

### Attacked and held in the third pass

**What a scan leaves out is never read.** A made workspace held excluded `generated/api.ts` and `generated/types.ts`. Five kept files imported them in every form the reader takes:
- `import` with and without `.js`;
- a dynamic `import()`;
- `export *`;
- a re-export chain through a kept barrel;
- an absent `./gone` and `./missing`.

The docs label each as written. The run's notices count five imports and two re-exports-of-all, by file and specifier, which is what I counted by hand.

For a kept file, the resolver's candidates are the same strings on the listing as on the disk: a `.js` specifier naming its `.ts` source, an `index` file, the `@/` and `~/` aliases. The listing and the disk differ only for:
- a path the scan does not keep;
- a path reached through a symbolic link to a folder (the walk does not follow one);
- a path outside the workspace.

The second pass recorded each of these as a broken link at the base, not a resolved import. One older gap was seen, not new: `require("./nothere")` in a TypeScript file is read as no dependency at all.

**The graph's files keyed with no prototype.** A made git repository of two commits had files named `__proto__`, `constructor`, `toString`, `hasOwnProperty` and `valueOf`, `src/__proto__.ts` and `src/constructor.ts`, with a configuration naming the root-level ones.
- The history's paths, and its last step's files with their dependencies, equal a checkout's index file for file.
- `inspect` answers to and from them: `--reachable`, `--to`, `--direction both --json` and `--groups --json`.
- `lint` validates all eleven.
- The board was not exercised: the made board was not in its format.
- The Explorer's built bundle was not tried.

**The author's reference as mended.** Each of these agrees with the compiler, declaration by declaration:
- overloads told apart by `in`, by `ref readonly`, by `ref`, by array and by `params`;
- `out` written where the overload takes `ref`: nothing on both sides;
- a nullable annotation `Lib.Calc?` on a reference type;
- an extension method, named with its `this` parameter left off;
- a method of a generic type named through its own type parameter;
- `Box{X}.Put(Lib.Calc)`.

**The oracle's register.** `csharp-oracle.test.ts` now holds each documentation difference by cause and entry, so a new one fails. `framework` is filed only where a parameter writes a framework keyword or a type the folder does not declare. Nothing was found that would accept a new miss silently.

### Not reached in the third pass

- **The manifest reader as rewritten** (item 3).
- **The path's new rule** (item 5): three nested ends, the scan root as an end, a directory whose only file is the other end, and the JSON against the text.
- **Item 6:** the merges between branches, the PowerShell and SQL ledgers, the page check's `differences.json`, and each answer against its stated bound.
- **The Explorer's lookups and the page's built bundle** with a file named `__proto__`.
