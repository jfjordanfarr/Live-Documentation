/**
 * The standing guard against reading what a comment holds.
 *
 * Every reader that finds a construct by a pattern over text, and every reader that walks a syntax tree, is asked the
 * same question for each construct it reads and each comment form its language has: the construct written inside the
 * comment yields no fact, while the same construct written live beside it still yields its own, so that a case cannot
 * pass by reading nothing. Where a comment marker stands inside a string or an attribute's value, it starts no comment,
 * and what follows it is still read. Where a form is a comment to one reader of a file and not to another (an HTML
 * comment hides an element from the browser, but the ASP.NET page parser still reads a directive inside one), the case
 * says so and expects the fact.
 *
 * Each comment form is the language's own, from its specification; the cases where the specification is subtle say
 * where. The table is the generator of failing cases: a reader added to the engine gets its rows here.
 *
 * The guard was built on 2026-11-21, after a commented-out `<ProjectReference>` was found read as real: the project
 * file's reader matched a pattern over the raw text, and its grader matched the same kind of pattern, so the two
 * agreed (the record `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md`).
 */
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { SourceAnalysisResult } from "../core";
import { buildWorkspaceIndexes } from "../discovery";
import { analyzeSourceFile } from "../sourceAnalysis";
import { withoutMarkupComments } from "./aspnet";
import { withoutCssComments } from "./css";
import { withoutXmlComments } from "./dotnetXml";
import { withoutHtmlComments } from "./html";
import type { WorkspaceFileIndex } from "./index";
import { heldToLedger, listedButNotRun } from "./knownDifferences";
import { writtenOver } from "./treeSitter";

/** This test's name as the ledger of known differences (`known-differences.json`) lists it. */
const LEDGERED = (): string => `commentGuard.test.ts > ${expect.getState().currentTestName ?? ""}`;

/** A way of writing the construct that the language does not run: the commented construct and the live one, as the file's text. */
interface Form {
  name: string;
  around: (gone: string, kept: string) => string;
  /** False where this form is no comment to the reader of this construct, so that the commented construct is read too. */
  hides?: boolean;
}

interface GuardCase {
  reader: string;
  construct: string;
  /** The file the construct is written in. */
  file: string;
  /** The file whose facts are read; the construct's own file unless another file's reading looks into it. */
  subject?: string;
  /** The construct, naming `name`. */
  text: (name: string) => string;
  /** The fact the construct yields, naming `name`. */
  fact: (name: string) => string;
  forms: Form[];
  /** The rest of the workspace, in which `Kept` and `Gone` are both declared where the construct needs a target. */
  files?: Record<string, string>;
}

const GONE = "Gone";
const KEPT = "Kept";

const beside = (wrap: (text: string) => string) => (gone: string, kept: string): string => `${wrap(gone)}\n${kept}\n`;
const perLine = (marker: string) => (text: string): string => text.split("\n").map((line) => `${marker}${line}`).join("\n");

/** C's comment forms, which C#, Java, Go, Rust, JavaScript and TypeScript share. */
const C_LIKE: Form[] = [
  { name: "a line comment, `//`", around: beside(perLine("// ")) },
  { name: "a block comment, `/* … */`", around: beside((text) => `/* ${text} */`) },
  { name: "a block comment over lines", around: beside((text) => `/*\n${text}\n*/`) }
];

/** The forms where a C-like comment marker stands inside a string, which must not hide what follows. */
const C_STRINGS = (declare: (value: string, at: number) => string): Form[] => [
  { name: "`/*` and `*/` inside strings around it", hides: false, around: (gone, kept) => `${declare("/*", 1)}\n${gone}\n${kept}\n${declare("*/", 2)}\n` },
  { name: "`//` inside a string on the line before", hides: false, around: (gone, kept) => `${declare("//", 3)} ${gone}\n${kept}\n` }
];

const HTML_COMMENT: Form = { name: "an HTML comment, `<!-- … -->`", around: beside((text) => `<!--\n${text}\n-->`) };

/** The forms where an HTML comment's opening stands where HTML reads no comment, which must not hide what follows. */
const HTML_STRINGS: Form[] = [
  // Each value holds a `>` before its marker, so that only reading the quoted value to its end keeps the marker inside the tag.
  { name: "`<!--` and `-->` inside attribute values around it", hides: false, around: (gone, kept) => `<a title="x > <!--"></a>\n${gone}\n${kept}\n<a title="y > -->"></a>\n` },
  // A quote opens a value only after `=` (WHATWG HTML, "attribute name state": a quote there is part of the name), so
  // the apostrophe of `it's` opens nothing and the comment after the tag is a comment.
  { name: "an HTML comment after a tag whose attribute's name holds a quote", around: (gone, kept) => `<a it's="1"></a>\n<!--\n${gone}\n-->\n${kept}\n<b title='x'></b>\n` },
  { name: "`<!--` and `-->` inside a script's text around it", hides: false, around: (gone, kept) => `<script>var a = "<!--";</script>\n${gone}\n${kept}\n<script>var b = "-->";</script>\n` }
];

/*
 * A reviewer's forms of 2026-11-21, each red when committed, each from the language's own rule. HTML: a comment also
 * ends at `--!>` (WHATWG, "comment end bang state": "an incorrectly-closed-comment parse error … Emit the current comment
 * token"), and with scripting on a `<noscript>`'s content is raw text, in which `<!--` opens nothing ("noscript: If
 * parser's parser scripting disabled is false, then switch the tokenizer to the RAWTEXT state"). A script's own comment
 * is no markup either: no element is made of `<div id>` written in a `//` line of a `<script>`, as mojoPortal's ckeditor
 * samples write `// Replace the <textarea id="editor"> …`, read as an id `editor` that no element of the page holds.
 */
const HTML_MORE: Form[] = [
  { name: "an HTML comment closed by `--!>`, as HTML closes one", around: beside((text) => `<!--\n${text}\n--!>`) },
  { name: "`<!--` and `-->` inside a `<noscript>`'s text around it", hides: false, around: (gone, kept) => `<noscript><!--</noscript>\n${gone}\n${kept}\n<noscript>--></noscript>\n` }
];

/** A script's comments inside markup, for a construct that holds no `</script>` of its own. */
const SCRIPT_COMMENTS: Form[] = [
  { name: "a JavaScript line comment inside a `<script>`'s text", around: (gone, kept) => `<script>\n// ${gone}\n</script>\n${kept}\n` },
  { name: "a JavaScript block comment inside a `<script>`'s text", around: (gone, kept) => `<script>\n/* ${gone} */\n</script>\n${kept}\n` }
];

/*
 * The server's code inside ASP.NET markup, C# to the page parser: a C# comment there renders nothing, and `<!--` inside
 * a C# string opens no HTML comment. Razor's `@@` is an escaped `@` ("To escape an @ symbol in Razor markup, use a second
 * @ symbol"), so `@@*` opens no Razor comment.
 */
const WEB_FORMS_CODE: Form[] = [
  { name: "a C# comment inside a `<script runat=\"server\">` block", around: (gone, kept) => `<script runat="server">\n// ${gone}\n</script>\n${kept}\n` },
  { name: "`<!--` and `-->` inside C# strings of code blocks around it", hides: false, around: (gone, kept) => `<% var open = "<!--"; %>\n${gone}\n${kept}\n<% var close = "-->"; %>\n` }
];
const RAZOR_CODE: Form[] = [
  { name: "a C# line comment inside a Razor code block, `@{ // … }`", around: (gone, kept) => `@{\n  // ${gone}\n}\n${kept}\n` },
  { name: "a C# block comment inside a Razor code block, `@{ /* … */ }`", around: (gone, kept) => `@{\n  /* ${gone} */\n}\n${kept}\n` },
  { name: "`<!--` and `-->` inside C# strings of Razor code blocks around it", hides: false, around: (gone, kept) => `@{ var open = "<!--"; }\n${gone}\n${kept}\n@{ var close = "-->"; }\n` },
  { name: "`@@*` and `*@@`, escaped `@`s, around it", hides: false, around: (gone, kept) => `<p>@@*</p>\n${gone}\n${kept}\n<p>*@@</p>\n` }
];

const SQL_FORMS: Form[] = [
  { name: "a line comment, `--`", around: beside(perLine("-- ")) },
  { name: "a block comment, `/* … */`", around: beside((text) => `/* ${text} */`) },
  { name: "a nested block comment, as T-SQL nests them", around: beside((text) => `/* outer /* inner */ ${text} */`) },
  { name: "`--` inside a string on the line before", hides: false, around: (gone, kept) => `SELECT '--' AS a; ${gone}\n${kept}\n` },
  { name: "`/*` and `*/` inside strings around it", hides: false, around: (gone, kept) => `SELECT '/*' AS a;\n${gone}\n${kept}\nSELECT '*/' AS b;\n` },
  { name: "`--` inside a bracketed name on the line before", hides: false, around: (gone, kept) => `SELECT 1 AS [a--b]; ${gone}\n${kept}\n` },
  { name: "`/*` inside a quoted name before it", hides: false, around: (gone, kept) => `SELECT 1 AS "a/*b";\n${gone}\n${kept}\nSELECT 1 AS "c*/d";\n` }
];

const HASH_LINE: Form = { name: "a line comment, `#`", around: beside(perLine("# ")) };

const POWERSHELL_FORMS: Form[] = [
  HASH_LINE,
  { name: "a block comment, `<# … #>`", around: beside((text) => `<#\n${text}\n#>`) },
  { name: "`#` inside a string on the line before", hides: false, around: (gone, kept) => `$a = "#"; ${gone}\n${kept}\n` },
  { name: "`<#` and `#>` inside strings around it", hides: false, around: (gone, kept) => `$a = '<#'\n${gone}\n${kept}\n$b = '#>'\n` }
];

const XML_FORMS: Form[] = [
  { name: "an XML comment, `<!-- … -->`", around: beside((text) => `<!--\n${text}\n-->`) },
  { name: "`<!--` inside a CDATA section before it", hides: false, around: (gone, kept) => `<Note><![CDATA[ <!-- ]]></Note>\n${gone}\n${kept}\n<Note><![CDATA[ --> ]]></Note>\n` }
];

const RUBY_FORMS: Form[] = [
  HASH_LINE,
  { name: "an embedded document, `=begin … =end`", around: beside((text) => `=begin\n${text}\n=end`) },
  { name: "the data after `__END__`", around: (gone, kept) => `${kept}\n__END__\n${gone}\n` },
  { name: "`#` inside a string on the line before", hides: false, around: (gone, kept) => `a = "#"\n${gone}\n${kept}\n` }
];

/*
 * A reviewer's form of 2026-11-21, red when committed: a heredoc's text is a string, which Ruby never runs as code, so
 * a `require_relative`, a `def`, an `include` or the program's guard written in it is none; the reader's patterns run
 * over lines with only the comments and the data after `__END__` written over.
 */
const RUBY_HEREDOC: Form = { name: "a heredoc's text, which Ruby runs as no code", around: (gone, kept) => `text = <<~TEXT\n${gone}\nTEXT\n${kept}\n` };

/*
 * A reviewer's form of 2026-11-21, red when committed: an expandable here-string's text is literal to PowerShell, so a
 * `<#` and a `#>` in two of them open no block comment; PowerShell's parser (pwsh 7.7.0,
 * `[Parser]::ParseInput`) finds the dot-source between them, with no parse error. A literal here-string (`@' … '@`)
 * is read right; the bundled grammar misreads the expandable one.
 */
const POWERSHELL_HERE_STRINGS: Form = { name: "`<#` and `#>` inside expandable here-strings around it", hides: false, around: (gone, kept) => `$a = @"\n<#\n"@\n${gone}\n${kept}\n$b = @"\n#>\n"@\n` };

const within = (prelude: string, postlude: string, forms: Form[]): Form[] =>
  forms.map((form) => ({ ...form, around: (gone, kept) => `${prelude}\n${form.around(gone, kept)}\n${postlude}\n` }));

const csharpType = (namespace: string) => (name: string): string => `namespace ${namespace} { public class ${name} { public void Run() { } } }\n`;
const CSHARP_TARGETS = { "Lib/Kept.cs": csharpType("Lib")(KEPT), "Lib/Gone.cs": csharpType("Lib")(GONE) };
const CSHARP_STRINGS = C_STRINGS((value, at) => `string s${at} = "${value}";`);
/*
 * A reviewer's form of 2026-11-21, red when committed: a section `#if false` skips is not lexed at all (C#'s
 * "Conditional compilation directives": "Except for pre-processing directives, skipped source code is not subject to
 * lexical analysis"), so the compiler sees no name, key or job there under any configuration; the syntax tree parses
 * every branch, and DNN holds six such sections, one a whole file (`DotNetNuke.Web/Common/DotNetNukeSecurity.cs`).
 */
const CSHARP_IF_FALSE: Form = { name: "a section `#if false` skips, which C# does not lex", around: (gone, kept) => `#if false\n${gone}\n#endif\n${kept}\n` };
const CSHARP_MEMBER_FORMS = within("using System;\nusing Hangfire;\nusing Lib;\nnamespace App {\nclass Program {", "} }", [...C_LIKE, { name: "a documentation comment, `///`", around: beside(perLine("/// ")) }, ...CSHARP_STRINGS, CSHARP_IF_FALSE]);

const CASES: GuardCase[] = [
  // TypeScript and JavaScript: the TypeScript compiler's syntax tree.
  {
    reader: "TypeScript", construct: "an import", file: "src/main.ts",
    text: (name) => `import { a${name} } from "./${name}";`, fact: (name) => `to:src/${name}.ts`,
    files: { "src/Kept.ts": "export const aKept = 1;\n", "src/Gone.ts": "export const aGone = 1;\n" },
    forms: [...C_LIKE, { name: "a documentation comment, `/** … */`", around: beside((text) => `/** ${text} */`) }, ...C_STRINGS((value, at) => `const s${at} = "${value}";`),
      { name: "`/*` inside a regular expression before it", hides: false, around: (gone, kept) => `const r = /\\/\\*/;\n${gone}\n${kept}\n` }]
  },
  {
    reader: "JavaScript, the DOM heuristic", construct: "`document.getElementById`", file: "site/app.js",
    text: (name) => `document.getElementById("${name}");`, fact: (name) => `to:site/index.html#${name}`,
    files: { "site/index.html": `<div id="${KEPT}"></div>\n<div id="${GONE}"></div>\n` },
    forms: [...C_LIKE, ...C_STRINGS((value, at) => `const s${at} = "${value}";`)]
  },
  {
    reader: "JavaScript, the DOM heuristic", construct: "an element id in the markup it searches", file: "site/index.html", subject: "site/app.js",
    text: (name) => `<div id="${name}"></div>`, fact: (name) => `to:site/index.html#${name}`,
    files: { "site/app.js": `document.getElementById("${KEPT}");\ndocument.getElementById("${GONE}");\n` },
    forms: [HTML_COMMENT, ...HTML_STRINGS, ...HTML_MORE, ...SCRIPT_COMMENTS]
  },

  // C: tree-sitter.
  {
    reader: "C", construct: "an `#include`", file: "main.c",
    text: (name) => `#include "${name}.h"`, fact: (name) => `to:${name}.h`,
    files: { "Kept.h": "int kept(void);\n", "Gone.h": "int gone(void);\n" },
    forms: [...C_LIKE, ...C_STRINGS((value, at) => `static const char *s${at} = "${value}";`).filter((form) => !form.name.includes("line before"))]
  },

  // C#: tree-sitter for names; patterns over the text for the dependencies no compiler sees.
  {
    reader: "C#", construct: "a type named", file: "App/Program.cs",
    text: (name) => `${name} field${name};`, fact: (name) => `to:Lib/${name}.cs`,
    files: CSHARP_TARGETS, forms: CSHARP_MEMBER_FORMS
  },
  {
    reader: "C#", construct: "an `AppSettings` key", file: "App/Program.cs",
    text: (name) => `string a${name} = System.Configuration.ConfigurationManager.AppSettings["${name}"];`, fact: (name) => `to:App/Web.config#${name}`,
    files: { "App/Web.config": "<configuration />\n" }, forms: CSHARP_MEMBER_FORMS
  },
  {
    reader: "C#", construct: "an `IConfiguration` key", file: "App/Program.cs",
    text: (name) => `string c${name} = configuration["${name}"];`, fact: (name) => `to:App/appsettings.json#${name}`,
    files: { "App/appsettings.json": "{}\n" }, forms: CSHARP_MEMBER_FORMS
  },
  {
    reader: "C#", construct: "a type named to `Type.GetType`", file: "App/Program.cs",
    text: (name) => `Type t${name} = Type.GetType("Lib.${name}");`, fact: (name) => `to:Lib/${name}.cs`,
    files: CSHARP_TARGETS, forms: CSHARP_MEMBER_FORMS
  },
  {
    reader: "C#", construct: "a type named in a string", file: "App/Program.cs",
    text: (name) => `string n${name} = "Lib.${name}";`, fact: (name) => `to:Lib/${name}.cs`,
    files: CSHARP_TARGETS, forms: CSHARP_MEMBER_FORMS
  },
  {
    reader: "C#", construct: "a Hangfire job", file: "App/Program.cs",
    text: (name) => `void Job${name}() { BackgroundJob.Enqueue<Lib.${name}>(job => job.Run()); }`, fact: (name) => `to:Lib/${name}.cs`,
    files: CSHARP_TARGETS, forms: CSHARP_MEMBER_FORMS
  },
  {
    reader: "C#, SQL in a string", construct: "a table a query names", file: "App/Program.cs",
    text: (name) => `SELECT * FROM dbo.${name}`, fact: (name) => `to:db/${name}.sql`,
    files: { "db/Kept.sql": "CREATE TABLE dbo.Kept (id int);\n", "db/Gone.sql": "CREATE TABLE dbo.Gone (id int);\n" },
    forms: within("namespace App {\nclass Program {", "} }", [
      { name: "SQL's line comment, `--`, inside a verbatim string over lines", around: (gone, kept) => `string q = @"-- ${gone}\n${kept}";` },
      // In a regular string `\n` is a line break, which ends SQL's line comment (C#'s "String literals").
      { name: "SQL's line comment, `--`, ended by the escape `\\n` inside a regular string", around: (gone, kept) => `string q = "-- ${gone}\\n${kept}";` },
      { name: "SQL's block comment inside the string", around: (gone, kept) => `string q = "/* ${gone} */ ${kept}";` },
      { name: "C#'s line comment around the string", around: (gone, kept) => `// string g = "${gone}";\nstring q = "${kept}";` },
      // A reviewer's form of 2026-11-21, red when committed: in an interpolated string the grammar gives each escape a
      // node of its own (`escape_sequence`), which the string's parts leave out, so the line break is lost.
      { name: "SQL's line comment, `--`, ended by the escape `\\n` inside an interpolated string", around: (gone, kept) => `string q = $"-- ${gone}\\n${kept}";` }
    ])
  },

  // Java, Go, Python, Rust: tree-sitter.
  {
    reader: "Java", construct: "an import", file: "src/app/Main.java",
    text: (name) => `import lib.${name};`, fact: (name) => `to:src/lib/${name}.java`,
    files: { "src/lib/Kept.java": "package lib;\npublic class Kept {}\n", "src/lib/Gone.java": "package lib;\npublic class Gone {}\n" },
    forms: within("package app;", "public class Main {}", C_LIKE)
  },
  {
    reader: "Go", construct: "an import", file: "main.go",
    text: (name) => `import _ "example.com/m/${name.toLowerCase()}"`, fact: (name) => `to:${name.toLowerCase()}/${name.toLowerCase()}.go`,
    files: { "go.mod": "module example.com/m\n\ngo 1.22\n", "kept/kept.go": "package kept\n\nfunc Kept() {}\n", "gone/gone.go": "package gone\n\nfunc Gone() {}\n" },
    forms: within("package main", "func main() {}", C_LIKE)
  },
  {
    reader: "Python", construct: "an import", file: "main.py",
    text: (name) => `import ${name.toLowerCase()}`, fact: (name) => `to:${name.toLowerCase()}.py`,
    files: { "kept.py": "def kept():\n    pass\n", "gone.py": "def gone():\n    pass\n" },
    forms: [HASH_LINE, { name: "a string standing as a comment, `\"\"\" … \"\"\"`", around: beside((text) => `"""\n${text}\n"""`) },
      { name: "`#` inside a string on the line before", hides: false, around: (gone, kept) => `a = "#"; ${gone}\n${kept}\n` }]
  },
  {
    reader: "Rust", construct: "a module declared", file: "src/main.rs",
    text: (name) => `mod ${name.toLowerCase()};`, fact: (name) => `to:src/${name.toLowerCase()}.rs`,
    files: { "src/kept.rs": "pub fn kept() {}\n", "src/gone.rs": "pub fn gone() {}\n" },
    forms: [...C_LIKE, { name: "a nested block comment", around: beside((text) => `/* outer /* inner */ ${text} */`) }]
  },
  {
    reader: "Rust, a crate's name from its Cargo.toml", construct: "the package's name", file: "Cargo.toml", subject: "src/main.rs",
    text: (name) => `name = "${name.toLowerCase()}_lib"`, fact: (name) => `to:src/lib.rs#${name.toLowerCase()}`,
    files: { "src/lib.rs": "pub fn kept() {}\npub fn gone() {}\n", "src/main.rs": "use kept_lib::kept;\nuse gone_lib::gone;\nfn main() { kept(); gone(); }\n" },
    forms: within("[package]", "version = \"0.1.0\"", [
      HASH_LINE,
      { name: "a line comment holding `[`, `#`", around: beside((text) => `# ${text}, as [crates.io] showed it`) }
    ])
  },

  // Ruby: patterns over lines.
  {
    reader: "Ruby", construct: "a `require_relative`", file: "main.rb",
    text: (name) => `require_relative "${name.toLowerCase()}"`, fact: (name) => `to:${name.toLowerCase()}.rb`,
    files: { "kept.rb": "def kept; end\n", "gone.rb": "def gone; end\n" },
    forms: [...RUBY_FORMS, { name: "`=begin` inside a heredoc before it", hides: false, around: (gone, kept) => `doc = <<~TEXT\n=begin\nTEXT\n${gone}\n${kept}\n` }, RUBY_HEREDOC]
  },
  {
    reader: "Ruby", construct: "a method defined", file: "main.rb",
    text: (name) => `def ${name.toLowerCase()}\nend`, fact: (name) => `sym:${name.toLowerCase()}`,
    forms: [...RUBY_FORMS, RUBY_HEREDOC]
  },
  {
    reader: "Ruby", construct: "a mixin", file: "main.rb",
    text: (name) => `  include ${name}`, fact: (name) => `dep:${name}`,
    forms: within("class Host", "end", [...RUBY_FORMS.filter((form) => !form.name.includes("__END__")), RUBY_HEREDOC])
  },

  // PowerShell: tree-sitter, with `#requires` read from its comment as PowerShell reads it.
  {
    reader: "PowerShell", construct: "a dot-source", file: "main.ps1",
    text: (name) => `. "$PSScriptRoot/${name}.ps1"`, fact: (name) => `to:${name}.ps1`,
    files: { "Kept.ps1": "function Use-Kept { }\n", "Gone.ps1": "function Use-Gone { }\n" }, forms: [...POWERSHELL_FORMS, POWERSHELL_HERE_STRINGS]
  },
  {
    reader: "PowerShell", construct: "`Import-Module` by path", file: "main.ps1",
    text: (name) => `Import-Module "$PSScriptRoot/${name}.psm1"`, fact: (name) => `to:${name}.psm1`,
    files: { "Kept.psm1": "function Use-Kept { }\n", "Gone.psm1": "function Use-Gone { }\n" }, forms: POWERSHELL_FORMS
  },
  {
    reader: "PowerShell", construct: "`using module`", file: "main.ps1",
    text: (name) => `using module ./${name}.psm1`, fact: (name) => `to:${name}.psm1`,
    files: { "Kept.psm1": "function Use-Kept { }\n", "Gone.psm1": "function Use-Gone { }\n" }, forms: POWERSHELL_FORMS.slice(0, 2)
  },
  {
    reader: "PowerShell", construct: "`#requires -Modules`", file: "main.ps1",
    text: (name) => `#requires -Modules ${name}`, fact: (name) => `dep:${name}`,
    forms: [{ name: "a line comment, `#`, before it", around: beside(perLine("# ")) }, { name: "a block comment, `<# … #>`", around: beside((text) => `<#\n${text}\n#>`) }]
  },
  {
    reader: "PowerShell", construct: "a call to a function another file defines", file: "main.ps1",
    text: (name) => `Use-${name}`, fact: (name) => `to:lib/${name}.ps1#Use-${name}`,
    files: { "lib/Kept.ps1": "function Use-Kept { }\n", "lib/Gone.ps1": "function Use-Gone { }\n" }, forms: POWERSHELL_FORMS
  },
  {
    reader: "PowerShell", construct: "a function defined", file: "main.ps1",
    text: (name) => `function Use-${name} { }`, fact: (name) => `sym:Use-${name}`, forms: [...POWERSHELL_FORMS, POWERSHELL_HERE_STRINGS]
  },
  {
    reader: "PowerShell, a module manifest", construct: "a nested module", file: "Tool.psd1",
    text: (name) => `    '${name}.psm1'`, fact: (name) => `to:${name}.psm1`,
    files: { "Kept.psm1": "function Use-Kept { }\n", "Gone.psm1": "function Use-Gone { }\n" },
    forms: within("@{\n  ModuleVersion = '1.0'\n  NestedModules = @(", "  )\n}", POWERSHELL_FORMS.filter((form) => !form.name.includes("`#` inside")))
  },

  // SQL: the reader's own lexing (`openings.ts`).
  {
    reader: "SQL", construct: "a table a query names", file: "query.sql",
    text: (name) => `SELECT * FROM dbo.${name};`, fact: (name) => `dep:dbo.${name}`, forms: SQL_FORMS
  },
  {
    reader: "SQL", construct: "a table created", file: "schema.sql",
    text: (name) => `CREATE TABLE dbo.${name} (id int);`, fact: (name) => `sym:dbo.${name}`, forms: SQL_FORMS
  },
  {
    reader: "SQL", construct: "a procedure executed", file: "run.sql",
    text: (name) => `EXEC dbo.${name};`, fact: (name) => `dep:dbo.${name}`, forms: SQL_FORMS
  },

  // CSS: patterns over the text.
  {
    reader: "CSS", construct: "an `@import`", file: "site.css",
    text: (name) => `@import "${name}.css";`, fact: (name) => `to:${name}.css`,
    files: { "Kept.css": "", "Gone.css": "" },
    forms: [
      { name: "a comment, `/* … */`", around: beside((text) => `/* ${text} */`) },
      { name: "a comment over lines", around: beside((text) => `/*\n${text}\n*/`) },
      { name: "`/*` and `*/` inside strings around it", hides: false, around: (gone, kept) => `a::before { content: "/*"; }\n${gone}\n${kept}\nb::after { content: "*/"; }\n` },
      // A reviewer's form of 2026-11-21, red when committed: outside a string `\"` is an escaped character of a name
      // (CSS Syntax, "Consume an escaped code point"), no quote, so the comment after it on the line is a comment.
      { name: "a comment after an escaped quote in a selector, `.a\\\"b`", around: (gone, kept) => `.a\\"b { color: red; } /* ${gone} */\n${kept}\n` },
      // An unquoted `url(…)` runs to its `)`, opening no comment at a `/*` it holds (CSS Syntax, "Consume a url token").
      { name: "`/*` inside an unquoted `url(…)` before it", hides: false, around: (gone, kept) => `.a { background: url(//cdn.example/*.png); }\n${gone}\n${kept}\n.b { color: red; } /* end */\n` },
      // A string runs past an escaped quote ("Consume a string token"), so the `/*` after it is still the string's.
      { name: "an escaped quote and `/*` inside a string before it", hides: false, around: (gone, kept) => `a::before { content: "\\"/*"; }\n${gone}\n${kept}\nb::after { content: "*/"; }\n` }
    ]
  },
  {
    reader: "CSS", construct: "a `url()`", file: "site.css",
    text: (name) => `.${name.toLowerCase()} { background: url(${name}.png); }`, fact: (name) => `to:${name}.png`,
    files: { "Kept.png": "", "Gone.png": "" },
    forms: [
      { name: "a comment, `/* … */`", around: beside((text) => `/* ${text} */`) },
      { name: "`/*` and `*/` inside strings around it", hides: false, around: (gone, kept) => `a::before { content: "/*"; }\n${gone}\n${kept}\nb::after { content: "*/"; }\n` }
    ]
  },

  // HTML: patterns over the text.
  {
    reader: "HTML", construct: "a `<script src>`", file: "index.html",
    text: (name) => `<script src="${name}.js"></script>`, fact: (name) => `to:${name}.js`,
    files: { "Kept.js": "", "Gone.js": "" }, forms: [HTML_COMMENT, ...HTML_STRINGS, ...HTML_MORE]
  },
  {
    reader: "HTML", construct: "a stylesheet `<link href>`", file: "index.html",
    text: (name) => `<link rel="stylesheet" href="${name}.css">`, fact: (name) => `to:${name}.css`,
    files: { "Kept.css": "", "Gone.css": "" }, forms: [HTML_COMMENT, ...HTML_STRINGS, ...HTML_MORE, ...SCRIPT_COMMENTS]
  },
  {
    reader: "HTML", construct: "an element id", file: "index.html",
    text: (name) => `<div id="${name}"></div>`, fact: (name) => `sym:${name}`, forms: [HTML_COMMENT, ...HTML_STRINGS, ...HTML_MORE, ...SCRIPT_COMMENTS]
  },

  // ASP.NET markup: patterns over the text.
  {
    reader: "ASP.NET Web Forms", construct: "a `Register` directive", file: "Default.aspx",
    text: (name) => `<%@ Register TagPrefix="uc" TagName="${name}" Src="${name}.ascx" %>`, fact: (name) => `to:${name}.ascx`,
    files: { "Kept.ascx": "", "Gone.ascx": "" },
    forms: [
      { name: "a server comment, `<%-- … --%>`", around: beside((text) => `<%--\n${text}\n--%>`) },
      // The page parser reads a directive wherever it stands; only a server comment removes markup before parsing
      // (Microsoft's "Server-Side Comment Syntax"); an HTML comment is literal text sent to the browser.
      { ...HTML_COMMENT, hides: false }
    ]
  },
  {
    reader: "ASP.NET Web Forms", construct: "a `<script src>`", file: "Default.aspx",
    text: (name) => `<script src="${name}.js"></script>`, fact: (name) => `to:${name}.js`,
    files: { "Kept.js": "", "Gone.js": "" },
    forms: [{ name: "a server comment, `<%-- … --%>`", around: beside((text) => `<%--\n${text}\n--%>`) }, HTML_COMMENT, ...HTML_STRINGS, ...HTML_MORE, ...WEB_FORMS_CODE]
  },
  {
    reader: "ASP.NET Web Forms", construct: "an element id", file: "Default.aspx",
    text: (name) => `<div id="${name}"></div>`, fact: (name) => `sym:${name}`,
    forms: [{ name: "a server comment, `<%-- … --%>`", around: beside((text) => `<%--\n${text}\n--%>`) }, HTML_COMMENT, ...HTML_STRINGS, ...HTML_MORE, ...WEB_FORMS_CODE,
      // The page parser closes `<title />`, as DNN's `Default.aspx` writes it in its head, so it holds no text.
      { name: "a `<title />` the page parser closes, before it", hides: false, around: (gone, kept) => `<head runat="server"><title /></head>\n${gone}\n${kept}\n` }]
  },
  {
    reader: "ASP.NET Razor", construct: "a `<script src>`", file: "Index.cshtml",
    text: (name) => `<script src="${name}.js"></script>`, fact: (name) => `to:${name}.js`,
    files: { "Kept.js": "", "Gone.js": "" },
    forms: [{ name: "a Razor comment, `@* … *@`", around: beside((text) => `@*\n${text}\n*@`) }, HTML_COMMENT, ...HTML_STRINGS, ...HTML_MORE, ...RAZOR_CODE]
  },
  {
    reader: "ASP.NET Razor", construct: "an element id", file: "Index.cshtml",
    text: (name) => `<div id="${name}"></div>`, fact: (name) => `sym:${name}`,
    forms: [{ name: "a Razor comment, `@* … *@`", around: beside((text) => `@*\n${text}\n*@`) }, HTML_COMMENT, ...HTML_STRINGS, ...HTML_MORE, ...RAZOR_CODE]
  },

  // JSON with comments, and the shell lines a manifest's scripts hold.
  {
    reader: "JSON", construct: "a file named in a value", file: "config.json",
    text: (name) => `"${name.toLowerCase()}": "./${name}.js",`, fact: (name) => `to:${name}.js`,
    files: { "Kept.js": "", "Gone.js": "" },
    forms: within("{", "\"end\": 0\n}", [
      { name: "a line comment, `//`", around: beside(perLine("// ")) },
      { name: "a block comment, `/* … */`", around: beside((text) => `/* ${text} */`) },
      { name: "`/*` and `*/` inside strings around it", hides: false, around: (gone, kept) => `"a": "/*",\n${gone}\n${kept}\n"b": "*/",\n` },
      { name: "`//` inside a string on the line before", hides: false, around: (gone, kept) => `"c": "//", ${gone}\n${kept}\n` }
    ])
  },
  {
    reader: "JSON, a manifest's scripts", construct: "the file a script runs", file: "package.json",
    text: (name) => `node ${name}.js`, fact: (name) => `declares:command:${name}.js`,
    files: { "Kept.js": "", "Gone.js": "" },
    forms: [{ name: "the shell's comment, `#`", around: (gone, kept) => `{ "name": "p", "scripts": { "start": "${kept} # ${gone}" } }\n` }]
  },

  // TOML manifests (the TOML parser), go.mod (its own lexing), pom.xml (its own XML lexing).
  {
    reader: "Cargo.toml", construct: "a dependency", file: "Cargo.toml",
    text: (name) => `${name.toLowerCase()} = "1.0"`, fact: (name) => `dep:${name.toLowerCase()}@1.0`,
    forms: within("[package]\nname = \"app\"\nversion = \"0.1.0\"\n\n[dependencies]", "", [HASH_LINE, { name: "`#` inside a string before it", hides: false, around: (gone, kept) => `x = { version = "1#", optional = true }\n${gone}\n${kept}\n` }])
  },
  {
    reader: "pyproject.toml", construct: "a dependency", file: "pyproject.toml",
    text: (name) => `  "${name.toLowerCase()}",`, fact: (name) => `dep:${name.toLowerCase()}`,
    forms: within("[project]\nname = \"app\"\ndependencies = [", "]", [HASH_LINE])
  },
  {
    reader: "go.mod", construct: "a requirement", file: "go.mod",
    text: (name) => `\texample.com/${name.toLowerCase()} v1.0.0`, fact: (name) => `dep:example.com/${name.toLowerCase()}@v1.0.0`,
    forms: within("module example.com/m\n\ngo 1.22\n\nrequire (", ")", [{ name: "a line comment, `//`", around: beside(perLine("// ")) }])
  },
  {
    reader: "pom.xml", construct: "a dependency", file: "pom.xml",
    text: (name) => `<dependency><groupId>org.example</groupId><artifactId>${name.toLowerCase()}</artifactId><version>1.0</version></dependency>`,
    fact: (name) => `dep:org.example:${name.toLowerCase()}@1.0`,
    forms: within("<project><groupId>org.example</groupId><artifactId>app</artifactId><version>1</version><dependencies>", "</dependencies></project>", XML_FORMS)
  },

  // .NET project files, solutions and configuration: patterns over the text, after XML's comments are taken out.
  {
    reader: ".NET project file", construct: "a `<ProjectReference>`", file: "App/App.csproj",
    text: (name) => `<ProjectReference Include="../${name}/${name}.csproj" />`, fact: (name) => `to:${name}/${name}.csproj`,
    files: { "Kept/Kept.csproj": "<Project Sdk=\"Microsoft.NET.Sdk\" />\n", "Gone/Gone.csproj": "<Project Sdk=\"Microsoft.NET.Sdk\" />\n" },
    forms: within("<Project Sdk=\"Microsoft.NET.Sdk\">\n<ItemGroup>", "</ItemGroup>\n</Project>", XML_FORMS)
  },
  {
    reader: ".NET project file", construct: "a `<PackageReference>`", file: "App/App.csproj",
    text: (name) => `<PackageReference Include="${name}" Version="1.0.0" />`, fact: (name) => `dep:${name}@1.0.0`,
    forms: within("<Project Sdk=\"Microsoft.NET.Sdk\">\n<ItemGroup>", "</ItemGroup>\n</Project>", XML_FORMS)
  },
  {
    reader: ".NET solution, XML form", construct: "a project", file: "App.slnx",
    text: (name) => `<Project Path="${name}/${name}.csproj" />`, fact: (name) => `to:${name}/${name}.csproj`,
    files: { "Kept/Kept.csproj": "<Project Sdk=\"Microsoft.NET.Sdk\" />\n", "Gone/Gone.csproj": "<Project Sdk=\"Microsoft.NET.Sdk\" />\n" },
    forms: within("<Solution>", "</Solution>", XML_FORMS)
  },
  {
    reader: ".NET solution, text form", construct: "a project", file: "App.sln",
    text: (name) => `Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "${name}", "${name}\\${name}.csproj", "{11111111-1111-1111-1111-11111111111${name === KEPT ? "1" : "2"}}"\nEndProject`,
    fact: (name) => `to:${name}/${name}.csproj`,
    files: { "Kept/Kept.csproj": "<Project Sdk=\"Microsoft.NET.Sdk\" />\n", "Gone/Gone.csproj": "<Project Sdk=\"Microsoft.NET.Sdk\" />\n" },
    forms: within("Microsoft Visual Studio Solution File, Format Version 12.00", "Global\nEndGlobal", [HASH_LINE])
  },
  {
    reader: ".NET configuration", construct: "an application setting", file: "Web.config",
    text: (name) => `<add key="${name}" value="1" />`, fact: (name) => `sym:${name}`,
    forms: within("<configuration>\n<appSettings>", "</appSettings>\n</configuration>", XML_FORMS)
  }
];

/** What a file's reading yields, as strings a case can name: a dependency by its specifier, a link by its file and each of its symbols, a symbol by its name, an entry the file declares. */
function factsOf(result: SourceAnalysisResult): Set<string> {
  const facts = new Set<string>();
  for (const dependency of result.dependencies) {
    facts.add(`dep:${dependency.specifier}`);
    if (dependency.resolvedPath) {
      facts.add(`to:${dependency.resolvedPath}`);
      for (const symbol of dependency.symbols) facts.add(`to:${dependency.resolvedPath}#${symbol}`);
    }
  }
  for (const symbol of result.symbols) facts.add(`sym:${symbol.name}`);
  for (const entry of result.declares ?? []) facts.add(`declares:${entry.reason}:${entry.file}`);
  if (result.program) facts.add("program");
  return facts;
}

let scratch: string;
let workspaceCount = 0;

/** Writes the files into a workspace of their own and reads `subject` as the generator does: the symbol index first, from every file, then the subject with it. */
async function read(files: Record<string, string>, subject: string): Promise<Set<string>> {
  const workspaceRoot = path.join(scratch, `w${workspaceCount += 1}`);
  for (const [file, text] of Object.entries(files)) {
    await fs.mkdir(path.dirname(path.join(workspaceRoot, file)), { recursive: true });
    await fs.writeFile(path.join(workspaceRoot, file), text, "utf8");
  }
  const fileIndex: WorkspaceFileIndex = new Set(Object.keys(files));
  const targetFiles = Object.keys(files).map((file) => path.join(workspaceRoot, file));
  const { symbols } = await buildWorkspaceIndexes({ targetFiles, workspaceRoot, liveDocsRoot: ".live-documentation/source", docExtension: ".md", fileIndex });
  return factsOf(await analyzeSourceFile(path.join(workspaceRoot, subject), workspaceRoot, fileIndex, symbols));
}

beforeAll(async () => {
  scratch = await fs.mkdtemp(path.join(os.tmpdir(), "comment-guard-"));
});

afterAll(async () => {
  await fs.rm(scratch, { recursive: true, force: true });
});

/**
 * A construct a file holds at most once, so that no live one can stand beside the commented one: the file with it
 * live yields the fact, and each file with it commented yields none.
 */
interface AloneCase {
  reader: string;
  construct: string;
  file: string;
  live: string;
  fact: string;
  commented: Record<string, string>;
}

const ALONE: AloneCase[] = [
  {
    reader: "Ruby", construct: "the guard that runs the file as the program", file: "main.rb", fact: "program",
    live: "def main; end\nif __FILE__ == $0\n  main\nend\n",
    commented: {
      "a line comment, `#`": "def main; end\n# if __FILE__ == $0\n",
      "a comment after a statement": "def main; end\nmain # if __FILE__ == $0\n",
      "an embedded document, `=begin … =end`": "def main; end\n=begin\nif __FILE__ == $0\n  main\nend\n=end\n",
      "the data after `__END__`": "def main; end\n__END__\nif __FILE__ == $0\n  main\nend\n",
      // A reviewer's case of 2026-11-21, red when committed: the guard written in a heredoc's text is a string.
      "a heredoc's text": "def main; end\nUSAGE = <<~TEXT\nif __FILE__ == $0\n  main\nend\nTEXT\n"
    }
  }
];

describe("no reader reads what a comment holds", () => {
  for (const alone of ALONE) {
    describe(`${alone.reader}: ${alone.construct}`, () => {
      it("is read where it is written live", async () => {
        expect(Array.from(await read({ [alone.file]: alone.live }, alone.file))).toContain(alone.fact);
      });
      for (const [form, text] of Object.entries(alone.commented)) {
        it(`is not read inside ${form}`, async () => {
          expect(Array.from(await read({ [alone.file]: text }, alone.file))).not.toContain(alone.fact);
        });
      }
    });
  }

  for (const guardCase of CASES) {
    describe(`${guardCase.reader}: ${guardCase.construct}`, () => {
      for (const form of guardCase.forms) {
        const hides = form.hides ?? true;
        it(hides ? `reads nothing inside ${form.name}, and the construct beside it` : `reads on past ${form.name}`, async () => {
          await heldToLedger(LEDGERED(), async () => {
            const text = form.around(guardCase.text(GONE), guardCase.text(KEPT));
            const facts = await read({ ...guardCase.files, [guardCase.file]: text }, guardCase.subject ?? guardCase.file);
            const shown = `\n--- ${guardCase.file}\n${text}\n--- facts of ${guardCase.subject ?? guardCase.file}\n${Array.from(facts).sort().join("\n")}`;
            expect(facts.has(guardCase.fact(KEPT)), `the live construct's fact, ${guardCase.fact(KEPT)}${shown}`).toBe(true);
            expect(facts.has(guardCase.fact(GONE)), `${hides ? "the commented construct's fact is read" : "the construct after the marker is not read"}: ${guardCase.fact(GONE)}${shown}`).toBe(!hides);
          });
        });
      }
    });
  }
});

/*
 * A reviewer's cases of 2026-11-21, red when committed. Every comment step says that it writes a comment over "so that
 * positions keep", and `writtenOver` that "a position or a line found in the result is the same in the text"; each
 * writes over with `/[^\r\n]/gu`, which with the `u` flag takes a character outside the Basic Multilingual Plane, two
 * UTF-16 units of the text, as one, and writes one space for it. So every offset after such a character in a comment
 * is one less in the result than in the text, which is what the engine's positions count in.
 */
describe("every comment step keeps each position of the text", () => {
  const steps: Array<{ name: string; text: string; step: (text: string) => string }> = [
    { name: "`writtenOver` (C#, Ruby)", text: "/* a note 😀 */ after", step: (text) => writtenOver(text, [0, text.indexOf("*/") + 2]) },
    { name: "`withoutHtmlComments` (HTML, the DOM heuristic's markup)", text: "<!-- a note 😀 --> after", step: withoutHtmlComments },
    { name: "`withoutCssComments` (CSS)", text: "/* a note 😀 */ after", step: withoutCssComments },
    { name: "`withoutMarkupComments` (ASP.NET Web Forms)", text: "<%-- a note 😀 --%> after", step: (text) => withoutMarkupComments(text, false) }
  ];
  for (const { name, text, step } of steps) {
    it(`${name} writes a comment holding an emoji over in as many UTF-16 units as it holds`, () => {
      const result = step(text);
      expect(result.length).toBe(text.length);
      expect(result.indexOf("after")).toBe(text.indexOf("after"));
    });
  }
  it("`withoutXmlComments` (.NET project files and configuration) writes a comment holding an emoji over in as many UTF-16 units as it holds", () => {
    const text = "<!-- a note 😀 --> after";
    expect(withoutXmlComments(text).indexOf("after")).toBe(text.indexOf("after"));
  });
});

/*
 * C#'s string literals as the program holds them ("String literals"; "Interpolated strings"): each escape form the C#
 * reader decodes before it reads the SQL a string holds, held by whether `dbo.Kept` is then named. In a regular string
 * `\n`, `\x0a`, `\u000a` and `\U0000000a` are a line break, which ends SQL's line comment; in a verbatim one (`@"…"`,
 * `$@"…"`) a backslash is itself and `""` is one quote. Each case fails if its form is read otherwise.
 */
describe("C#'s strings, read as the program holds them before the SQL in them is read", () => {
  const forms: Array<{ name: string; literal: string; names: boolean }> = [
    { name: "`\\n` in a regular string", literal: String.raw`"-- note\nSELECT * FROM dbo.Kept"`, names: true },
    { name: "`\\x0a` in a regular string", literal: String.raw`"-- note\x0aSELECT * FROM dbo.Kept"`, names: true },
    { name: "`\\u000a` in a regular string", literal: String.raw`"-- note\u000aSELECT * FROM dbo.Kept"`, names: true },
    { name: "`\\U0000000a` in a regular string", literal: String.raw`"-- note\U0000000aSELECT * FROM dbo.Kept"`, names: true },
    { name: "`\\n` in an interpolated string", literal: String.raw`$"-- note\nSELECT * FROM dbo.Kept"`, names: true },
    { name: "`\\n` in a verbatim string, a backslash and an n", literal: String.raw`@"-- note\nSELECT * FROM dbo.Kept"`, names: false },
    { name: "`\\n` in a verbatim interpolated string, a backslash and an n", literal: String.raw`$@"-- note\nSELECT * FROM dbo.Kept"`, names: false },
    { name: "`\"\"` in a verbatim string, one quote", literal: String.raw`@"SELECT * FROM ""dbo"".""Kept"""`, names: true },
    { name: "`\"\"` in a verbatim interpolated string, one quote", literal: String.raw`$@"SELECT * FROM ""dbo"".""Kept"""`, names: true }
  ];
  for (const form of forms) {
    it(`reads ${form.name}`, async () => {
      const facts = await read({
        "db/Kept.sql": "CREATE TABLE dbo.Kept (id int);\n",
        "App/Program.cs": `namespace App {\nclass Program {\nstring q = ${form.literal};\n} }\n`
      }, "App/Program.cs");
      expect(facts.has("to:db/Kept.sql"), Array.from(facts).join("\n")).toBe(form.names);
    });
  }
});

describe("the ledger of known differences", () => {
  // Last in the file, after every case it may list has run.
  it("lists for this file only cases the file runs", () => {
    expect(listedButNotRun("commentGuard.test.ts")).toEqual([]);
  });
});
