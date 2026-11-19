// Roslyn probe: reads every .cs file under a root with Microsoft's own C# parser (syntax only, no build)
// and writes one JSON line per file: the types it declares (partial or not, with their members),
// the simple names it uses, configuration reads, and string literals handed to data-access calls.
using System.Text.Json;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

var root = Path.GetFullPath(args[0]);
var output = args[1];
using var writer = new StreamWriter(output);
var files = Directory.EnumerateFiles(root, "*.cs", SearchOption.AllDirectories)
    .Where(f => !f.Contains("/.git/") && !f.Contains("/.live-documentation/") && !f.Contains("/obj/") && !f.Contains("/bin/"))
    .OrderBy(f => f, StringComparer.Ordinal);
var parseOptions = new CSharpParseOptions(LanguageVersion.Latest, DocumentationMode.None, SourceCodeKind.Regular,
    new[] { "DEBUG", "TRACE", "NET48", "NETFRAMEWORK" });
foreach (var file in files)
{
    var text = File.ReadAllText(file);
    var tree = CSharpSyntaxTree.ParseText(text, parseOptions, file);
    var rootNode = tree.GetCompilationUnitRoot();
    var rel = Path.GetRelativePath(root, file).Replace('\\', '/');

    var types = new List<object>();
    foreach (var type in rootNode.DescendantNodes().OfType<BaseTypeDeclarationSyntax>())
    {
        var names = new List<string>();
        SyntaxNode? n = type;
        while (n != null)
        {
            switch (n)
            {
                case BaseTypeDeclarationSyntax t:
                    var arity = t is TypeDeclarationSyntax td && td.TypeParameterList != null ? "`" + td.TypeParameterList.Parameters.Count : "";
                    names.Insert(0, t.Identifier.ValueText + arity);
                    break;
                case BaseNamespaceDeclarationSyntax ns:
                    names.Insert(0, ns.Name.ToString().Replace(" ", ""));
                    break;
            }
            n = n.Parent;
        }
        var members = new List<string>();
        if (type is TypeDeclarationSyntax decl)
        {
            foreach (var m in decl.Members)
            {
                switch (m)
                {
                    case FieldDeclarationSyntax f: members.AddRange(f.Declaration.Variables.Select(v => v.Identifier.ValueText)); break;
                    case EventFieldDeclarationSyntax e: members.AddRange(e.Declaration.Variables.Select(v => v.Identifier.ValueText)); break;
                    case PropertyDeclarationSyntax p: members.Add(p.Identifier.ValueText); break;
                    case EventDeclarationSyntax ev: members.Add(ev.Identifier.ValueText); break;
                    case MethodDeclarationSyntax md when md.ExplicitInterfaceSpecifier == null: members.Add(md.Identifier.ValueText); break;
                    case BaseTypeDeclarationSyntax nt: members.Add(nt.Identifier.ValueText); break;
                    case DelegateDeclarationSyntax dd: members.Add(dd.Identifier.ValueText); break;
                }
            }
        }
        var line = type.GetLocation().GetLineSpan().StartLinePosition.Line + 1;
        types.Add(new
        {
            name = string.Join(".", names),
            kind = type.Kind().ToString(),
            partial = type.Modifiers.Any(SyntaxKind.PartialKeyword),
            line,
            members,
            baseTypes = type.BaseList?.Types.Select(b => b.Type.ToString()).ToList() ?? new List<string>()
        });
    }

    // Simple names this file uses.
    var used = new SortedSet<string>(StringComparer.Ordinal);
    foreach (var id in rootNode.DescendantNodes().OfType<SimpleNameSyntax>()) used.Add(id.Identifier.ValueText);

    // Configuration reads: ConfigurationManager / WebConfigurationManager .AppSettings / .ConnectionStrings.
    var configReads = new List<object>();
    foreach (var access in rootNode.DescendantNodes().OfType<ElementAccessExpressionSyntax>())
    {
        if (access.Expression is MemberAccessExpressionSyntax ma && (ma.Name.Identifier.ValueText is "AppSettings" or "ConnectionStrings"))
        {
            var arg = access.ArgumentList.Arguments.FirstOrDefault()?.Expression;
            configReads.Add(new
            {
                owner = ma.Expression.ToString(),
                collection = ma.Name.Identifier.ValueText,
                key = arg is LiteralExpressionSyntax lit && lit.IsKind(SyntaxKind.StringLiteralExpression) ? lit.Token.ValueText : null,
                expr = arg?.ToString(),
                line = access.GetLocation().GetLineSpan().StartLinePosition.Line + 1
            });
        }
    }
    foreach (var inv in rootNode.DescendantNodes().OfType<InvocationExpressionSyntax>())
    {
        if (inv.Expression is MemberAccessExpressionSyntax m2 && m2.Name.Identifier.ValueText == "Get"
            && m2.Expression is MemberAccessExpressionSyntax inner && inner.Name.Identifier.ValueText is "AppSettings" or "ConnectionStrings")
        {
            var arg = inv.ArgumentList.Arguments.FirstOrDefault()?.Expression;
            configReads.Add(new
            {
                owner = inner.Expression.ToString(),
                collection = inner.Name.Identifier.ValueText,
                key = arg is LiteralExpressionSyntax lit && lit.IsKind(SyntaxKind.StringLiteralExpression) ? lit.Token.ValueText : null,
                expr = arg?.ToString(),
                line = inv.GetLocation().GetLineSpan().StartLinePosition.Line + 1
            });
        }
    }

    // Data-access call sites: invocations or object creations that receive a string literal and look like data
    // access by their callee's text, or receive CommandType.StoredProcedure; and literals assigned to CommandText.
    var calls = new List<object>();
    foreach (var node in rootNode.DescendantNodes())
    {
        ArgumentListSyntax? argList = null; string callee = "";
        switch (node)
        {
            case InvocationExpressionSyntax i: argList = i.ArgumentList; callee = i.Expression.ToString(); break;
            case ObjectCreationExpressionSyntax o: argList = o.ArgumentList; callee = "new " + o.Type.ToString(); break;
            case AssignmentExpressionSyntax a when a.Left is MemberAccessExpressionSyntax lm && lm.Name.Identifier.ValueText == "CommandText":
                var rhs = a.Right;
                calls.Add(new { callee = a.Left.ToString() + " =", literals = rhs is LiteralExpressionSyntax rl && rl.IsKind(SyntaxKind.StringLiteralExpression) ? new[] { rl.Token.ValueText } : Array.Empty<string>(), argText = rhs.ToString().Length > 300 ? rhs.ToString()[..300] : rhs.ToString(), storedProcedure = false, line = a.GetLocation().GetLineSpan().StartLinePosition.Line + 1 });
                continue;
        }
        if (argList == null) continue;
        var literals = argList.Arguments.Select(x => x.Expression).OfType<LiteralExpressionSyntax>()
            .Where(l => l.IsKind(SyntaxKind.StringLiteralExpression)).Select(l => l.Token.ValueText).ToArray();
        var sp = argList.Arguments.Any(x => x.Expression.ToString().EndsWith("CommandType.StoredProcedure"));
        var interesting = sp || literals.Length > 0 && (callee.Contains("Sql") || callee.Contains("Execute") || callee.Contains("Command") || callee.Contains("Helper") || callee.Contains("Provider") || callee.Contains("Fill"));
        if (!interesting) continue;
        var argText = argList.ToString();
        calls.Add(new { callee, literals, argText = argText.Length > 300 ? argText[..300] : argText, storedProcedure = sp, line = node.GetLocation().GetLineSpan().StartLinePosition.Line + 1 });
    }

    writer.WriteLine(JsonSerializer.Serialize(new { path = rel, types, used, configReads, calls }));
}
