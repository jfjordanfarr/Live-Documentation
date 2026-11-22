/**
 * The C# adapter, held to the C# compiler's own binding. For every C# fixture
 * that carries `expected/csharp-compiler.json`, written by `npm run
 * oracle:csharp -- <fixture> --write` where .NET is (Roslyn binding every
 * simple name, each project's references as MSBuild evaluates them), the
 * adapter reads each C# file as the generator has it read, the fixture's files
 * its index, and the C# file pairs it draws are set beside the compiler's by
 * `compareCSharp`. Nothing here runs `dotnet`. The record names every file it
 * was compiled from with a digest, and a fixture whose C# or project files are
 * new, gone or changed since fails until the record is written again, so that
 * no file of a fixture goes ungraded.
 *
 * Where they disagree the disagreement is listed, in words, and the list must
 * equal the register below exactly: a miss fixed, or a new one, fails the
 * test until the register says so. Each entry names its cause.
 */
import { globSync } from "glob";
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { compareCSharp, compiledSources, type CompilerRecord, type CSharpReport, type DocumentationReference } from "../../../scripts/oracle/csharp-compare";
import { folderFiles } from "../../../scripts/oracle/powershell-compare";
import { sourceDigests, sourcesDiffer } from "../../../scripts/oracle/sources";

const INTEGRATION_ROOT = path.resolve(__dirname, "..");

/**
 * The measured misses, fixture by fixture. `names` holds the cases an
 * independent review of the reader found on 2026-11-21: a nested type named
 * inside a class that inherits it, which C# finds in the base class before any
 * `using`, and an alias to the non-generic one of two types that differ only
 * by arity; both were mended the same day. The other C# samples had none
 * when their records were first kept, the same day.
 *
 * Its one known miss, found by the review's second pass and not mended: a
 * member a type inherits hides a type of the same name where an expression is
 * read, so `Gadget * 2` inside `MemberOverUsing : Base` is `Base`'s property;
 * the reader does not tell where an expression is read from where a type is,
 * for a type's own members either, and takes `Gadget` for the class a `using`
 * brings in.
 */
const MEASURED_MISSES: Record<string, string[]> = {
  "programs/csharp/basic":    [],
  "programs/csharp/estate":   [],
  "programs/csharp/names":    ["the adapter draws App/MemberOverUsing.cs → App/Other.cs on a namesake"],
  "programs/csharp/rosetta":  [],
  "programs/csharp/webforms": []
};

/**
 * The compiler's answer for every documentation reference (`cref`) the samples hold, and the C# file pairs they make.
 * `names/App/Documented.cs`, written on 2026-11-22, holds one of each kind worth telling apart: a type, a member, a
 * nested type, a generic beside the type of its name without one, each of two overloads declared in two parts of a
 * partial class, the overloads' name alone (the compiler cannot choose, its warning CS0419), a namespace, a name
 * nothing declares and a type of a project the file's project does not reference (both resolved to nothing, CS1574);
 * `estate/Hub/PaymentHub.cs` names an overload in another project, a pair its code binds as well. Rosetta's
 * `ArgumentException` resolves to nothing because the compilation has no framework references.
 *
 * `drawn` is the pairs the adapter draws by its dependency lines: only those the code makes too, since a reference is
 * no use by the code. `related` is the pairs the reader's documentation relation makes, the owner's word of 2026-11-21
 * that an author's reference is to be honoured, drawn as a relation of its own kind (root's ruling of 2026-11-22): set
 * beside the compiler's pairs. Each reference is also set beside the compiler's declaration by declaration, a
 * reference within its own file as any other (since a later leg of 2026-11-22, when an independent review showed that
 * pairs hide a wrong overload): `agree` counts those that name the same declarations, and every one on which they part
 * is in `differences`, by cause (`DOCUMENTATION_CAUSES`), so that a difference mended in silence, or a new one, fails
 * here. `names/App/Overloads.cs`, written by that leg, names overloads told apart only by an array's mark or rank, a
 * modifier, a type's arguments or `params`, references no overload answers, and a name the compiler cannot parse.
 */
const DOCUMENTATION: Record<string, { references: string[]; alsoCode: string[]; authorOnly: string[]; drawn: string[]; related: string[]; agree: number; differences: string[] }> = {
  "programs/csharp/basic":  { references: [], alsoCode: [], authorOnly: [], drawn: [], related: [], agree: 0, differences: [] },
  "programs/csharp/estate": {
    references:  ["Hub/PaymentHub.cs:12 <seealso> IPaymentService.Post(PaymentRequest): resolved, Method Estate.Contracts.IPaymentService.Post(Estate.Contracts.PaymentRequest) in Contracts/IPaymentService.cs"],
    alsoCode:    ["Hub/PaymentHub.cs → Contracts/IPaymentService.cs"],
    authorOnly:  [],
    drawn:       ["Hub/PaymentHub.cs → Contracts/IPaymentService.cs"],
    related:     ["Hub/PaymentHub.cs → Contracts/IPaymentService.cs"],
    agree:       1,
    differences: []
  },
  "programs/csharp/names": {
    references: [
      "App/Documented.cs:5 <see> Base: resolved, NamedType App.Base in App/Base.cs",
      "App/Documented.cs:5 <see> Base.Gadget: resolved, Property App.Base.Gadget in App/Base.cs",
      "App/Documented.cs:5 <see> Base.Options: resolved, NamedType App.Base.Options in App/Base.cs",
      "App/Documented.cs:6 <see> Lib.Helper{T}: resolved, NamedType Lib.Helper<T> in App/HelperOfT.cs",
      "App/Documented.cs:6 <see> Lib.Helper: resolved, NamedType Lib.Helper in App/Helper.cs",
      "App/Documented.cs:7 <see> Runner.Run(Runner.Count): resolved, Method App.Runner.Run(App.Runner.Count) in App/Runner.cs",
      "App/Documented.cs:8 <seealso> Runner.Run(Runner.Text): resolved, Method App.Runner.Run(App.Runner.Text) in App/Runner.Text.cs",
      "App/Documented.cs:8 <see> Runner.Run: Ambiguous, Method App.Runner.Run(App.Runner.Count) in App/Runner.cs; Method App.Runner.Run(App.Runner.Text) in App/Runner.Text.cs",
      "App/Documented.cs:9 <see> App.Other: resolved, Namespace App.Other in App/Other.cs",
      "App/Documented.cs:10 <see> Missing: unresolved",
      "App/Documented.cs:12 <permission> Derived: resolved, NamedType App.Derived in App/Derived.cs",
      "App/Documented.cs:15 <inheritdoc> Base.Gadget: resolved, Property App.Base.Gadget in App/Base.cs",
      "App/Documented.cs:16 <exception> Lib.Thing: unresolved",
      "App/Overloads.cs:23 <see> Mixer: resolved, NamedType App.Mixer in App/Overloads.cs",
      "App/Overloads.cs:28 <see> Mixer.Mix(Mixer[]): resolved, Method App.Mixer.Mix(App.Mixer[]) in App/Overloads.cs",
      "App/Overloads.cs:28 <see> Mixer.Mix(ref Mixer): resolved, Method App.Mixer.Mix(ref App.Mixer) in App/Overloads.cs",
      "App/Overloads.cs:28 <see> Mixer.Mix(Mixer, Mixer): resolved, Method App.Mixer.Mix(App.Mixer, App.Mixer) in App/Overloads.cs",
      "App/Overloads.cs:29 <see> Mixer.Grid(Mixer[,]): resolved, Method App.Mixer.Grid(App.Mixer[*,*]) in App/Overloads.cs",
      "App/Overloads.cs:29 <see> Mixer.Grid(Mixer[]): resolved, Method App.Mixer.Grid(App.Mixer[]) in App/Overloads.cs",
      "App/Overloads.cs:30 <see> Mixer.Take(Box{Mixer}): resolved, Method App.Mixer.Take(App.Box<App.Mixer>) in App/Overloads.cs",
      "App/Overloads.cs:30 <see> Mixer.Take(Box{Box{Mixer}}): resolved, Method App.Mixer.Take(App.Box<App.Box<App.Mixer>>) in App/Overloads.cs",
      "App/Overloads.cs:31 <see> Mixer.Opt(Mixer, Mixer[]): resolved, Method App.Mixer.Opt(App.Mixer, params App.Mixer[]) in App/Overloads.cs",
      "App/Overloads.cs:31 <see> Mixer.Out(out Mixer): resolved, Method App.Mixer.Out(out App.Mixer) in App/Overloads.cs",
      "App/Overloads.cs:31 <see> Mixer.Out(Mixer): resolved, Method App.Mixer.Out(App.Mixer) in App/Overloads.cs",
      "App/Overloads.cs:32 <see> Mixer.Mixer(Mixer): resolved, Method App.Mixer.Mixer(App.Mixer) in App/Overloads.cs",
      "App/Overloads.cs:33 <see> Mixer.Mix(Box{Mixer}): unresolved",
      "App/Overloads.cs:33 <see> Mixer.Mix(Mixer,): unresolved",
      "App/Overloads.cs:33 <see> Mixer.Out(ref Mixer): unresolved",
      "App/Overloads.cs:34 <see> Mixer.Mixer(Box{Mixer}): unresolved",
      "App/Overloads.cs:34 <see> M::Mixer: unparsed"
    ],
    alsoCode:   [],
    authorOnly: [
      "App/Documented.cs → App/Base.cs",
      "App/Documented.cs → App/Derived.cs",
      "App/Documented.cs → App/Helper.cs",
      "App/Documented.cs → App/HelperOfT.cs",
      "App/Documented.cs → App/Runner.Text.cs",
      "App/Documented.cs → App/Runner.cs"
    ],
    drawn:   [],
    related: [
      "App/Documented.cs → App/Base.cs",
      "App/Documented.cs → App/Derived.cs",
      "App/Documented.cs → App/Helper.cs",
      "App/Documented.cs → App/HelperOfT.cs",
      "App/Documented.cs → App/Runner.Text.cs",
      "App/Documented.cs → App/Runner.cs"
    ],
    agree: 30,
    differences: []
  },
  "programs/csharp/rosetta":  { references: ["src/Processor/Processor.cs:33 <exception> ArgumentException: unresolved"], alsoCode: [], authorOnly: [], drawn: [], related: [], agree: 1, differences: [] },
  "programs/csharp/webforms": { references: [], alsoCode: [], authorOnly: [], drawn: [], related: [], agree: 0, differences: [] }
};

/** Every reference on which the reader and the compiler part, declaration by declaration, in words, by cause. */
function documentationDifferences(relation: CSharpReport["documentation"]["relation"]): string[] {
  return Object.entries(relation.byCause).sort(([left], [right]) => left.localeCompare(right)).flatMap(([cause, entries]) => entries.map((entry) => `${cause}: ${entry}`));
}

/** A documentation reference and the compiler's answer for it, in words. */
function answered(reference: DocumentationReference): string {
  const symbols = reference.resolved.map((symbol) => `${symbol.kind} ${symbol.symbol} in ${symbol.files.join(", ")}`).join("; ");
  return `${reference.from}:${reference.line} <${reference.element}> ${reference.written}: ${reference.outcome}${symbols ? `, ${symbols}` : ""}`;
}

/** Discover compiler records independently of the register of measured misses. */
function measuredFixtures(root = INTEGRATION_ROOT): string[] {
  return globSync(["programs/**/expected/csharp-compiler.json", "fixtures/**/expected/csharp-compiler.json"], { cwd: root, dot: true, nodir: true })
    .map((file) => path.posix.dirname(path.posix.dirname(file.replace(/\\/gu, "/"))))
    .sort();
}

/** Every disagreement of a report, in words. */
function disagreements(report: CSharpReport): string[] {
  const only = report.edges.adapterOnly;
  return [
    ...report.projects.xml.map((project) => `MSBuild could not evaluate ${project}`),
    ...report.conditional.map((reference) => `a reference under a condition the default configuration does not meet: ${reference}`),
    ...only.namesake.map((edge) => `the adapter draws ${edge} on a namesake`),
    ...only.conditional.map((edge) => `the adapter draws ${edge} on a reference under such a condition`),
    ...only.other.map((edge) => `the adapter draws ${edge}, the compiler does not`),
    ...report.edges.compilerOnly.map((edge) => `the compiler binds ${edge}, the adapter does not draw it`)
  ];
}

describe("the C# adapter against the C# compiler's binding", () => {
  it("finds the fixtures that carry the compiler's record", () => {
    expect(measuredFixtures()).toEqual(Object.keys(MEASURED_MISSES).sort());
    expect(measuredFixtures()).toEqual(Object.keys(DOCUMENTATION).sort());
  });

  it("discovers a new compiler record without adding it to the miss register", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "csharp-oracle-discovery-"));
    try {
      const expected = path.join(root, "programs", "csharp", "new-case", "expected");
      fs.mkdirSync(expected, { recursive: true });
      fs.writeFileSync(path.join(expected, "csharp-compiler.json"), "{}\n");
      expect(measuredFixtures(root)).toEqual(["programs/csharp/new-case"]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  for (const fixture of measuredFixtures()) {
    it(`agrees with the compiler on ${fixture}, but for its measured misses, its record compiled from its sources as they stand`, async () => {
      const fixtureDir = path.join(INTEGRATION_ROOT, fixture);
      const kept       = JSON.parse(fs.readFileSync(path.join(fixtureDir, "expected", "csharp-compiler.json"), "utf8")) as CompilerRecord;
      const present    = sourceDigests(fixtureDir, compiledSources(folderFiles(fixtureDir)));
      expect(sourcesDiffer(present, kept.sources), `write the record again: npm run oracle:csharp -- tests/integration/${fixture} --write`).toEqual([]);
      const report     = await compareCSharp(fixtureDir, kept);
      expect(report.edges.compiler).toBeGreaterThan(0);
      expect(disagreements(report)).toEqual(MEASURED_MISSES[fixture]);
      const documentation = report.documentation;
      expect({
        references: (kept.crefs ?? []).map(answered),
        alsoCode:   documentation.alsoCode,
        authorOnly: documentation.authorOnly,
        drawn:      documentation.drawn,
        related:    documentation.relation.pairs,
        agree:      documentation.relation.agree,
        differences: documentationDifferences(documentation.relation)
      }).toEqual(DOCUMENTATION[fixture]);
    });
  }
});
