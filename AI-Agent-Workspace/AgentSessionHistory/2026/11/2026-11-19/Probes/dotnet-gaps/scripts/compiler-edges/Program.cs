// Compiler edges: file-to-file edges the C# compiler binds, from syntax trees alone (no framework references).
// One compilation per project (.csproj/.vbproj folder; its .cs files not under a nested project folder, bin or obj),
// each referencing the compilations of its ProjectReferences. Every simple name in a file is bound; a source symbol
// declared in another file of the corpus is an edge to each file declaring it (all parts of a partial type), labelled
// with whether a type or only a member carried it. Writes JSON lines {from, to, type: [...], member: [...]}.
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

var root = Path.GetFullPath(args[0]);
using var writer = new StreamWriter(args[1]);
string Rel(string p) => Path.GetRelativePath(root, p).Replace('\\', '/');
bool Skipped(string p) => p.Contains("/.git/") || p.Contains("/.live-documentation/") || p.Contains("/obj/") || p.Contains("/bin/") || p.Contains("/node_modules/");

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
var foldedProjects = projectFiles.GroupBy(p => p.ToLowerInvariant()).ToDictionary(g => g.Key, g => g.First());
var refs = new Dictionary<string, List<string>>();
foreach (var p in projectFiles)
{
    var dir = Path.GetDirectoryName(p)!;
    var text = File.ReadAllText(p);
    var list = new List<string>();
    foreach (Match m in Regex.Matches(text, "<ProjectReference\\b[^>]*?\\bInclude\\s*=\\s*\"([^\"]+)\"", RegexOptions.IgnoreCase))
    {
        var target = Path.GetFullPath(Path.Combine(dir, m.Groups[1].Value.Replace('\\', '/')));
        if (foldedProjects.TryGetValue(target.ToLowerInvariant(), out var hit)) list.Add(Path.GetDirectoryName(hit)!);
    }
    refs[dir] = list.Distinct().ToList();
}
var parseOptions = new CSharpParseOptions(LanguageVersion.Latest, DocumentationMode.None, SourceCodeKind.Regular, new[] { "DEBUG", "TRACE", "NET48", "NETFRAMEWORK" });
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
long names = 0, bound = 0, candidatesOnly = 0;
foreach (var dir in filesByProject.Keys.OrderBy(d => d, StringComparer.Ordinal))
{
    var compilation = Build(dir);
    foreach (var tree in compilation.SyntaxTrees)
    {
        var model = compilation.GetSemanticModel(tree, ignoreAccessibility: true);
        var from = Rel(tree.FilePath);
        var edges = new SortedDictionary<string, (SortedSet<string> type, SortedSet<string> member)>(StringComparer.Ordinal);
        foreach (var node in tree.GetRoot().DescendantNodes().OfType<SimpleNameSyntax>())
        {
            names++;
            var info = model.GetSymbolInfo(node);
            var symbol = info.Symbol;
            if (symbol == null && info.CandidateSymbols.Length == 1) { symbol = info.CandidateSymbols[0]; candidatesOnly++; }
            if (symbol == null) continue;
            bound++;
            // A namespace is declared by every file that opens it; naming one is not a use of any of them.
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
                if (!edges.TryGetValue(key, out var sets)) edges[key] = sets = (new SortedSet<string>(StringComparer.Ordinal), new SortedSet<string>(StringComparer.Ordinal));
                (isType ? sets.type : sets.member).Add(isType ? symbol.Name : $"{symbol.ContainingType?.Name}.{symbol.Name}");
            }
        }
        foreach (var (to, sets) in edges)
            writer.WriteLine(JsonSerializer.Serialize(new { from, to, type = sets.type, member = sets.member }));
    }
}
Console.Error.WriteLine($"projects {filesByProject.Count}, files {csFiles.Count}, simple names {names}, bound {bound} (of which a single candidate {candidatesOnly})");
