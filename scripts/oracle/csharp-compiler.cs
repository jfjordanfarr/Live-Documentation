#:package Microsoft.CodeAnalysis.CSharp@4.12.0
#:property Nullable=enable
#:property InvariantGlobalization=true
#:property PublishAot=false

// The C# oracle for the C# reader: the compiler's own binding, Roslyn, over a folder's C# files. One compilation for
// each project (a .csproj folder; its .cs files not under a nested project folder, bin or obj), each referencing the
// compilations of the projects it references; no framework or package references, so a name reached only through a
// framework type does not bind. Every simple name in a file is bound, and a source symbol declared in another file of
// the folder is an edge to each file declaring it (every part of a partial type), named by whether a type or only a
// member carried it. A namespace is no edge: every file that opens one declares it.
//
// The projects' references come on standard input as JSON, {"references": {"<project>": ["<project>", ...] | null}},
// the paths relative to the folder given as the only argument: MSBuild's evaluation, as the caller asked it. A project
// given null is one MSBuild could not evaluate, and its references are its XML's <ProjectReference> elements, read by
// System.Xml, so that a comment is no element, every condition taken as met. Every project's XML elements are printed
// too, so that the caller can tell a reference under a condition the default configuration does not meet.
//
// It prints, as JSON: the tool, the projects with how each one's references were read, the counts of names bound, every
// edge, every file's declared type names (simple, without type parameters), by which the caller tells a namesake, and
// every documentation comment's `cref` (on whatever element carries it) with the compiler's resolution of it: the
// symbol's kind and name and the files that declare it, every candidate where it cannot choose, or none. A `cref` in a
// section the preprocessor symbols above leave inactive is not parsed, and is not among them. Added on 2026-11-22, so
// that an author's documentation reference, which the owner asked to be honoured, is measured before a reader draws it.
// Written on 2026-11-21 from the November 19 probe's compiler-edges program (Probes/dotnet-gaps), whose references were
// read by a pattern that took a commented-out reference for a real one.
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

var root = Path.GetFullPath(args[0]);
string Rel(string p) => Path.GetRelativePath(root, p).Replace('\\', '/');
bool Skipped(string p) => p.Contains("/.git/") || p.Contains("/.live-documentation/") || p.Contains("/obj/") || p.Contains("/bin/") || p.Contains("/node_modules/") || p.Contains("/expected/");

var input = JsonDocument.Parse(Console.In.ReadToEnd()).RootElement.GetProperty("references");
var projectFiles = Directory.EnumerateFiles(root, "*.csproj", SearchOption.AllDirectories).Where(p => !Skipped(p)).OrderBy(p => p, StringComparer.Ordinal).ToList();
var projectDirs = projectFiles.Select(p => Path.GetDirectoryName(p)!).ToHashSet();
var csFiles = Directory.EnumerateFiles(root, "*.cs", SearchOption.AllDirectories).Where(p => !Skipped(p)).OrderBy(p => p, StringComparer.Ordinal).ToList();
string? ProjectOf(string file)
{
    var d = Path.GetDirectoryName(file);
    while (d != null && d.Length >= root.Length) { if (projectDirs.Contains(d)) return d; d = Path.GetDirectoryName(d); }
    return null;
}
var filesByProject = csFiles.GroupBy(f => ProjectOf(f) ?? root).ToDictionary(g => g.Key, g => g.ToList());

// A project's <ProjectReference> elements by System.Xml: a comment is no element, and every condition is taken as met.
List<string> XmlReferences(string projectFile)
{
    var found = new List<string>();
    try
    {
        foreach (var element in XDocument.Load(projectFile).Descendants().Where(e => e.Name.LocalName == "ProjectReference"))
        {
            var include = element.Attribute("Include")?.Value;
            if (include != null) found.Add(Rel(Path.GetFullPath(Path.Combine(Path.GetDirectoryName(projectFile)!, include.Replace('\\', '/')))));
        }
    }
    catch (System.Xml.XmlException) { }
    return found.Distinct().OrderBy(r => r, StringComparer.Ordinal).ToList();
}

var projects = new List<object>();
var refs = new Dictionary<string, List<string>>();
foreach (var p in projectFiles)
{
    var rel = Rel(p);
    var xml = XmlReferences(p);
    List<string> taken;
    string readBy;
    if (input.TryGetProperty(rel, out var given) && given.ValueKind == JsonValueKind.Array)
    {
        taken = given.EnumerateArray().Select(e => e.GetString()!).ToList();
        readBy = "msbuild";
    }
    else
    {
        taken = xml;
        readBy = "xml";
    }
    refs[Path.GetDirectoryName(p)!] = taken.Select(r => Path.GetDirectoryName(Path.Combine(root, r))!).Where(projectDirs.Contains).Distinct().ToList();
    projects.Add(new { project = rel, readBy, references = taken, xmlReferences = xml });
}

// Documentation comments are parsed (not diagnosed), so that each `cref` is a node the semantic model resolves; the
// code's names are walked without descending into trivia, so the edges are those the code binds, as before.
var parseOptions = new CSharpParseOptions(LanguageVersion.Latest, DocumentationMode.Parse, SourceCodeKind.Regular, new[] { "DEBUG", "TRACE", "NET48", "NETFRAMEWORK" });
var compilations = new Dictionary<string, CSharpCompilation>();
var visiting = new HashSet<string>();
CSharpCompilation Build(string dir)
{
    if (compilations.TryGetValue(dir, out var done)) return done;
    visiting.Add(dir);
    var references = new List<MetadataReference>();
    foreach (var r in refs.GetValueOrDefault(dir) ?? new List<string>())
        if (!visiting.Contains(r) && filesByProject.ContainsKey(r)) references.Add(Build(r).ToMetadataReference());
    var trees = (filesByProject.GetValueOrDefault(dir) ?? new List<string>()).Select(f => CSharpSyntaxTree.ParseText(File.ReadAllText(f), parseOptions, f)).ToList();
    var name = Regex.Replace(Rel(dir), "[^A-Za-z0-9_.]", "_");
    var compilation = CSharpCompilation.Create(name.Length == 0 ? "root" : name, trees, references, new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, allowUnsafe: true));
    visiting.Remove(dir);
    compilations[dir] = compilation;
    return compilation;
}

long names = 0, bound = 0;
var edges = new List<object>();
var crefs = new List<object>();
var declared = new SortedDictionary<string, string[]>(StringComparer.Ordinal);
foreach (var dir in filesByProject.Keys.OrderBy(d => d, StringComparer.Ordinal))
{
    var compilation = Build(dir);
    foreach (var tree in compilation.SyntaxTrees)
    {
        var model = compilation.GetSemanticModel(tree, ignoreAccessibility: true);
        var from = Rel(tree.FilePath);
        declared[from] = tree.GetRoot().DescendantNodes().OfType<BaseTypeDeclarationSyntax>().Select(t => t.Identifier.Text)
            .Concat(tree.GetRoot().DescendantNodes().OfType<DelegateDeclarationSyntax>().Select(d => d.Identifier.Text)).Distinct().OrderBy(n => n, StringComparer.Ordinal).ToArray();
        var byTarget = new SortedDictionary<string, (SortedSet<string> type, SortedSet<string> member)>(StringComparer.Ordinal);
        foreach (var node in tree.GetRoot().DescendantNodes().OfType<SimpleNameSyntax>())
        {
            names++;
            var info = model.GetSymbolInfo(node);
            var symbol = info.Symbol ?? (info.CandidateSymbols.Length == 1 ? info.CandidateSymbols[0] : null);
            if (symbol == null) continue;
            bound++;
            if (symbol is INamespaceSymbol) continue;
            if (symbol is IMethodSymbol { ReducedFrom: not null } reduced) symbol = reduced.ReducedFrom;
            if (symbol is IMethodSymbol { MethodKind: MethodKind.Constructor } ctor) symbol = ctor.ContainingType;
            if (symbol is INamedTypeSymbol named && !SymbolEqualityComparer.Default.Equals(named, named.OriginalDefinition)) symbol = named.OriginalDefinition;
            var isType = symbol is INamedTypeSymbol;
            foreach (var reference in symbol.DeclaringSyntaxReferences)
            {
                var to = reference.SyntaxTree.FilePath;
                if (string.IsNullOrEmpty(to) || to == tree.FilePath) continue;
                var key = Rel(to);
                if (!byTarget.TryGetValue(key, out var sets)) byTarget[key] = sets = (new SortedSet<string>(StringComparer.Ordinal), new SortedSet<string>(StringComparer.Ordinal));
                (isType ? sets.type : sets.member).Add(isType ? symbol.Name : $"{symbol.ContainingType?.Name}.{symbol.Name}");
            }
        }
        foreach (var (to, sets) in byTarget) edges.Add(new { from, to, type = sets.type, member = sets.member });

        // Every documentation reference: a `cref` on any element of a documentation comment, resolved as the compiler
        // resolves it for its documentation file. A symbol the compiler cannot choose among (`cref="M"` with overloads,
        // its warning CS0419) is kept with every candidate; a reference it resolves to nothing (CS1574) has no symbol.
        foreach (var attribute in tree.GetRoot().DescendantNodes(descendIntoTrivia: true).OfType<XmlCrefAttributeSyntax>())
        {
            var element = attribute.Parent switch
            {
                XmlElementStartTagSyntax start => start.Name.ToString(),
                XmlEmptyElementSyntax empty => empty.Name.ToString(),
                _ => "?"
            };
            var info = model.GetSymbolInfo(attribute.Cref);
            var found = info.Symbol != null ? new[] { info.Symbol } : info.CandidateSymbols.ToArray();
            var resolved = found.Select(s =>
            {
                if (s is INamedTypeSymbol named && !SymbolEqualityComparer.Default.Equals(named, named.OriginalDefinition)) s = named.OriginalDefinition;
                var files = s.DeclaringSyntaxReferences.Select(r => r.SyntaxTree.FilePath).Where(f => !string.IsNullOrEmpty(f)).Select(Rel).Distinct().OrderBy(f => f, StringComparer.Ordinal).ToArray();
                return new { kind = s.Kind.ToString(), symbol = s.ToDisplayString(), files };
            }).OrderBy(r => r.symbol, StringComparer.Ordinal).ToArray();
            crefs.Add(new
            {
                from,
                line = attribute.GetLocation().GetLineSpan().StartLinePosition.Line + 1,
                element,
                written = attribute.Cref.ToString(),
                outcome = info.Symbol != null ? "resolved" : found.Length > 0 ? info.CandidateReason.ToString() : "unresolved",
                resolved
            });
        }
    }
}

var version = typeof(CSharpCompilation).Assembly.GetName().Version;
Console.WriteLine(JsonSerializer.Serialize(new { tool = $"Microsoft.CodeAnalysis.CSharp {version}", projects, files = csFiles.Count, names, bound, edges, declared, crefs }));
