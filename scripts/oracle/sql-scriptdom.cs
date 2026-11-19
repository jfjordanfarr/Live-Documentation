#:package Microsoft.SqlServer.TransactSql.ScriptDom@170.191.0
#:property Nullable=enable
#:property InvariantGlobalization=true
#:property PublishAot=false

// The T-SQL oracle for the SQL reader: Microsoft's own parser, ScriptDom, which SQL Server's tools
// use, reads every file named on standard input (one path per line, relative to the root given as
// the only argument) and prints, as JSON, what it says about each:
//
//   parseErrors  every error the parser reports, at its line and column; a file it cannot parse
//                says nothing else, since a parser that has given up is no oracle;
//   creates      every CREATE of a procedure, function, view, table, trigger, type, synonym or
//                sequence, with the name's parts as the parser unquotes them, the line and column of
//                the statement's first word, and where it stands: in the script itself, or inside the
//                body of a procedure, function or trigger, where it runs only when that runs;
//   references   every place a statement names a schema object, with how: executed, read from,
//                inserted into, updated, deleted from, merged into, called as a function, read as a
//                table-valued function, truncated, altered, dropped, referenced by a foreign key,
//                granted, used as a type, used as a sequence, selected into, a synonym's target, a
//                trigger's or an index's table, and any other place the parser holds a schema object
//                name, under the parent and property that hold it. Each says what the name stands
//                for when the statement around it decides that: a common table expression the
//                statement defines, a name standing for a table source of the statement's own FROM
//                (an alias, or a table's exposed name), or a temporary table or procedure (`#name`).
//                A column, a variable, a table variable and a SQL Server data type (`INT`, `NVARCHAR`,
//                `XML`: the parser's own `SqlDataTypeReference` and `XmlDataTypeReference`) are not
//                schema objects and are not listed;
//   dynamic      every EXEC of a string and every sp_executesql, whether its text is written out,
//                and, when it is, what the parser reads in that text: its creates and references.
//
// Nothing is trimmed to fit an analyzer: the comparison decides what it grades, and says so.
//
// Run at development time by `npm run oracle:sql`; it needs the .NET SDK and, on its first run,
// the package from NuGet. The file is read as .NET reads text, by its byte-order mark, so a UTF-16
// script is read as what it says.

using System.Collections;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.SqlServer.TransactSql.ScriptDom;
using SqlScriptDomOracle;

if (args.Length != 1)
{
    Console.Error.WriteLine("usage: dotnet run sql-scriptdom.cs -- <root>   (paths on standard input)");
    return 2;
}

var root  = Path.GetFullPath(args[0]);
var files = new SortedDictionary<string, FileFacts>(StringComparer.Ordinal);
string? line;
while ((line = Console.In.ReadLine()) != null)
{
    var relative = line.Trim();
    if (relative.Length == 0) continue;
    var text = File.ReadAllText(Path.Combine(root, relative));
    files[relative] = Reading.Read(text);
}

var assembly = typeof(TSql170Parser).Assembly;
var version  = assembly.GetCustomAttributes(typeof(System.Reflection.AssemblyInformationalVersionAttribute), false)
    .OfType<System.Reflection.AssemblyInformationalVersionAttribute>().FirstOrDefault()?.InformationalVersion ?? assembly.GetName().Version?.ToString();
var output = new Record($"Microsoft.SqlServer.TransactSql.ScriptDom {version} (TSql170Parser, quoted identifiers on)", files);
var options = new JsonSerializerOptions { WriteIndented = true, DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull, PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
Console.Out.Write(JsonSerializer.Serialize(output, options));
return 0;

// The types live in a namespace of their own, so that a reader of this repository that takes every C# file
// for one compilation, as the C# adapter does, never finds them in the global namespace.
namespace SqlScriptDomOracle
{
    /// <summary>A schema object's name as the parser holds it, each part unquoted; a part not written is null.</summary>
    record ObjectName(string? Server, string? Database, string? Schema, string Name);

    record ParseError(int Line, int Column, string Message);

    record Create(string Kind, ObjectName Name, int Line, int Column, string Scope);

    record Reference(string How, ObjectName Name, int Line, int Column, string? StandsFor = null, string? Context = null);

    record Dynamic(string How, int Line, int Column, bool Literal, string? Text, List<ParseError>? ParseErrors, List<Create>? Creates, List<Reference>? References);

    record FileFacts(List<ParseError> ParseErrors, List<Create> Creates, List<Reference> References, List<Dynamic> Dynamic);

    record Record(string Tool, SortedDictionary<string, FileFacts> Files);

    /// <summary>One file's, or one dynamic string's, reading.</summary>
    static class Reading
    {
        public static FileFacts Read(string text)
        {
            var parser = new TSql170Parser(true);
            using var reader = new StringReader(text);
            var tree   = parser.Parse(reader, out var parseErrors);
            var errors = parseErrors.Select(error => new ParseError(error.Line, error.Column, error.Message)).ToList();
            if (errors.Count > 0) return new FileFacts(errors, [], [], []);

            var walk = new Walk(tree);
            return new FileFacts(errors, walk.Creates, walk.References, walk.Dynamic);
        }
    }

    /// <summary>A node of the tree with the node and property that hold it.</summary>
    record Held(TSqlFragment Node, TSqlFragment? Parent, string? Property);

    sealed class Walk
    {
        public List<Create>    Creates    { get; } = [];
        public List<Reference> References { get; } = [];
        public List<Dynamic>   Dynamic    { get; } = [];

        readonly Dictionary<TSqlFragment, Held> held = new(ReferenceEqualityComparer.Instance);

        public Walk(TSqlFragment tree)
        {
            Hold(tree, null, null);
            var nodes    = held.Values.OrderBy(entry => entry.Node.StartOffset).ThenBy(entry => entry.Node.FragmentLength).ToList();
            var declared = new HashSet<TSqlFragment>(ReferenceEqualityComparer.Instance);
            foreach (var entry in nodes)
                if (ReadCreate(entry.Node) is { } name) declared.Add(name);
            foreach (var entry in nodes)
            {
                switch (entry.Node)
                {
                    case SchemaObjectName name when !declared.Contains(name):
                        ReadName(name, entry);
                        break;
                    case FunctionCall call:
                        ReadCall(call);
                        break;
                    case SecurityTargetObjectName target when target.MultiPartIdentifier != null:
                        References.Add(new Reference("grant", FromIdentifiers(target.MultiPartIdentifier.Identifiers), target.StartLine, target.StartColumn));
                        break;
                    case ExecuteSpecification execute:
                        ReadExecute(execute);
                        break;
                }
            }
        }

        /// <summary>Records every node under its parent and property, by reflection over the parser's public properties.</summary>
        void Hold(TSqlFragment node, TSqlFragment? parent, string? property)
        {
            if (held.ContainsKey(node)) return;
            held[node] = new Held(node, parent, property);
            foreach (var info in node.GetType().GetProperties())
            {
                if (info.GetIndexParameters().Length > 0 || info.Name == nameof(TSqlFragment.ScriptTokenStream)) continue;
                var value = info.GetValue(node);
                if (value is TSqlFragment child) Hold(child, node, info.Name);
                else if (value is IEnumerable list and not string)
                    foreach (var item in list)
                        if (item is TSqlFragment member) Hold(member, node, info.Name);
            }
        }

        TSqlFragment? ParentOf(TSqlFragment node) => held.TryGetValue(node, out var entry) ? entry.Parent : null;
        string? PropertyOf(TSqlFragment node) => held.TryGetValue(node, out var entry) ? entry.Property : null;

        IEnumerable<TSqlFragment> Ancestors(TSqlFragment node)
        {
            for (var parent = ParentOf(node); parent != null; parent = ParentOf(parent)) yield return parent;
        }

        /// <summary>Script, or module when a procedure's, function's or trigger's body holds the statement.</summary>
        string ScopeOf(TSqlFragment statement) =>
            Ancestors(statement).Any(node => node is ProcedureStatementBodyBase or TriggerStatementBody) ? "module" : "script";

        /// <summary>Records a CREATE and returns the name it gives its own object, which is no reference.</summary>
        SchemaObjectName? ReadCreate(TSqlFragment node)
        {
            (string kind, SchemaObjectName? name)? created = node switch
            {
                CreateProcedureStatement or CreateOrAlterProcedureStatement => ("procedure", ((ProcedureStatementBody)node).ProcedureReference?.Name),
                CreateFunctionStatement or CreateOrAlterFunctionStatement   => ("function", ((FunctionStatementBody)node).Name),
                CreateViewStatement or CreateOrAlterViewStatement           => ("view", ((ViewStatementBody)node).SchemaObjectName),
                CreateTableStatement table                                  => ("table", table.SchemaObjectName),
                CreateTriggerStatement or CreateOrAlterTriggerStatement     => ("trigger", ((TriggerStatementBody)node).Name),
                CreateTypeStatement type                                    => ("type", type.Name),
                CreateSynonymStatement synonym                              => ("synonym", synonym.Name),
                CreateSequenceStatement sequence                            => ("sequence", sequence.Name),
                _                                                           => null
            };
            if (created is not { name: not null } found) return null;
            Creates.Add(new Create(found.kind, FromName(found.name), node.StartLine, node.StartColumn, ScopeOf(node)));
            return found.name;
        }

        void ReadName(SchemaObjectName name, Held entry)
        {
            var parent = entry.Parent;
            if (parent is SqlDataTypeReference || parent is XmlDataTypeReference && entry.Property == nameof(XmlDataTypeReference.Name)) return;
            var (how, standsFor) = parent switch
            {
                NamedTableReference table              => (TableHow(table), StandsFor(table)),
                ProcedureReference procedure           => (ProcedureHow(procedure), null),
                SchemaObjectFunctionTableReference     => ("table-function", null),
                UserDataTypeReference                  => ("type", null),
                TruncateTableStatement                 => ("truncate", null),
                AlterTableStatement                    => ("alter-table", null),
                AlterFunctionStatement or AlterViewStatement or AlterTriggerStatement => ("alter", null),
                DropObjectsStatement or DropTypeStatement => ("drop", null),
                ForeignKeyConstraintDefinition         => ("foreign-key", null),
                NextValueForExpression                 => ("sequence", null),
                SelectStatement                        => ("into", null),
                CreateSynonymStatement                 => ("synonym-for", null),
                TriggerObject                          => ("trigger-on", null),
                CreateIndexStatement                   => ("index-on", null),
                _                                      => ("other", null)
            };
            var objectName = FromName(name);
            if (standsFor == null && objectName.Name.StartsWith('#')) standsFor = "temporary";
            References.Add(new Reference(how, objectName, name.StartLine, name.StartColumn, standsFor, how == "other" ? $"{parent?.GetType().Name}.{entry.Property}" : null));
        }

        /// <summary>How a table reference is used: as the target of the statement that holds it, or read.</summary>
        string TableHow(NamedTableReference table)
        {
            var parent = ParentOf(table);
            var property = PropertyOf(table);
            return parent switch
            {
                InsertSpecification when property == nameof(InsertSpecification.Target) => "insert",
                UpdateSpecification when property == nameof(UpdateSpecification.Target) => "update",
                DeleteSpecification when property == nameof(DeleteSpecification.Target) => "delete",
                MergeSpecification when property == nameof(MergeSpecification.Target)   => "merge",
                OutputIntoClause                                                         => "insert",
                _                                                                        => "select"
            };
        }

        /// <summary>A procedure's name is executed, or altered, or held somewhere else.</summary>
        string ProcedureHow(ProcedureReference procedure)
        {
            var parent = ParentOf(procedure);
            if (parent is ProcedureReferenceName && ParentOf(parent) is ExecutableProcedureReference) return "execute";
            if (parent is AlterProcedureStatement) return "alter";
            return "other";
        }

        /// <summary>What a one-part table name stands for when the statement around it decides: a CTE, a table source of its own FROM, or a temporary table.</summary>
        string? StandsFor(NamedTableReference table)
        {
            var name = table.SchemaObject;
            if (name.BaseIdentifier.Value.StartsWith('#')) return "temporary";
            if (name.Identifiers.Count != 1) return null;
            var value = name.BaseIdentifier.Value;

            foreach (var ancestor in Ancestors(table))
            {
                if (ancestor is StatementWithCtesAndXmlNamespaces { WithCtesAndXmlNamespaces: { } with }
                    && with.CommonTableExpressions.Any(cte => string.Equals(cte.ExpressionName.Value, value, StringComparison.OrdinalIgnoreCase)))
                    return "cte";
                if (ancestor is SelectFunctionReturnType or ViewStatementBody) break;
            }

            var parent   = ParentOf(table);
            var property = PropertyOf(table);
            FromClause? from = parent switch
            {
                UpdateSpecification update when property == nameof(UpdateSpecification.Target) => update.FromClause,
                DeleteSpecification delete when property == nameof(DeleteSpecification.Target) => delete.FromClause,
                _ => null
            };
            if (from != null && ExposedNames(from).Contains(value, StringComparer.OrdinalIgnoreCase)) return "table source";
            return null;
        }

        /// <summary>The names a FROM clause's table sources are known by: an alias, or a table's own name.</summary>
        IEnumerable<string> ExposedNames(FromClause from)
        {
            foreach (var node in held.Values.Select(entry => entry.Node).Where(node => node is TableReferenceWithAlias && Ancestors(node).Contains(from)))
            {
                var source = (TableReferenceWithAlias)node;
                if (source.Alias != null) yield return source.Alias.Value;
                else if (source is NamedTableReference named) yield return named.SchemaObject.BaseIdentifier.Value;
            }
        }

        /// <summary>A function called by a name with a schema (or a method of a column, which the text alone cannot tell apart); a name alone is SQL Server's own.</summary>
        void ReadCall(FunctionCall call)
        {
            if (call.CallTarget is not MultiPartIdentifierCallTarget target) return;
            var parts = target.MultiPartIdentifier.Identifiers.Append(call.FunctionName).ToList();
            References.Add(new Reference("call", FromIdentifiers(parts), call.StartLine, call.StartColumn));
        }

        void ReadExecute(ExecuteSpecification execute)
        {
            switch (execute.ExecutableEntity)
            {
                case ExecutableStringList strings:
                    Dynamic.Add(ReadString("exec-string", execute, strings.Strings));
                    break;
                case ExecutableProcedureReference procedure when procedure.ProcedureReference?.ProcedureReference?.Name is { } name
                    && string.Equals(name.BaseIdentifier.Value, "sp_executesql", StringComparison.OrdinalIgnoreCase):
                    var first = procedure.Parameters.FirstOrDefault()?.ParameterValue;
                    Dynamic.Add(ReadString("sp_executesql", execute, first == null ? [] : [first]));
                    break;
                case ExecutableProcedureReference procedure when procedure.ProcedureReference?.ProcedureVariable != null:
                    Dynamic.Add(new Dynamic("exec-variable", execute.StartLine, execute.StartColumn, false, null, null, null, null));
                    break;
            }
        }

        static Dynamic ReadString(string how, TSqlFragment at, IEnumerable<ScalarExpression> written)
        {
            var parts = written.ToList();
            if (parts.Count == 0 || !parts.All(part => part is StringLiteral))
                return new Dynamic(how, at.StartLine, at.StartColumn, false, null, null, null, null);
            var text  = string.Concat(parts.Cast<StringLiteral>().Select(part => part.Value));
            var inner = Reading.Read(text);
            return new Dynamic(how, at.StartLine, at.StartColumn, true, text, inner.ParseErrors, inner.Creates, inner.References);
        }

        static ObjectName FromName(SchemaObjectName name) =>
            new(name.ServerIdentifier?.Value, name.DatabaseIdentifier?.Value, name.SchemaIdentifier?.Value, name.BaseIdentifier.Value);

        /// <summary>A dotted name read from its last part back: object, schema, database, server.</summary>
        static ObjectName FromIdentifiers(IList<Identifier> identifiers)
        {
            var values = identifiers.Select(identifier => identifier?.Value).ToList();
            string? At(int fromEnd) => values.Count >= fromEnd ? NullIfEmpty(values[^fromEnd]) : null;
            return new ObjectName(At(4), At(3), At(2), values[^1] ?? "");
        }

        static string? NullIfEmpty(string? value) => string.IsNullOrEmpty(value) ? null : value;
    }
}
