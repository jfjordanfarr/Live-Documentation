// The PL/SQL oracle's emitter: what the ANTLR project's PL/SQL grammar (grammars-v4 sql/plsql, at the commit
// plsql-compare.ts pins) says about each file named on standard input, one path a line, relative to the root given
// as the only argument, printed as JSON:
//
//   parseErrors  the first errors the parser reports, when it cannot read the file; such a file says nothing else;
//   creates      every top-level CREATE of a package, package body, procedure, function, view, table, trigger, type,
//                type body, synonym or sequence, with its name and the line of its CREATE, and every procedure and
//                function a package spec or body holds, with the package that holds it;
//   references   every place a statement names an object: a table or view read or written (FROM, INSERT, UPDATE,
//                DELETE, MERGE, a foreign key's REFERENCES), a routine a call statement runs, and a function called
//                with arguments, each with the parts of its name as written and its line.
//
// The grammar does not resolve names: it cannot tell a package's member from a schema's function, a collection's
// element from a call, or a package's own procedure called by one part from a standalone one. The record says what
// is written, not what it is. It is built and run by plsql-compare.ts, never by the product.
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.atn.PredictionMode;
import org.antlr.v4.runtime.misc.ParseCancellationException;
import org.antlr.v4.runtime.tree.ParseTree;

public class PlSqlEmitter {
    private static List<String> creates = new ArrayList<>();
    private static List<String> refs = new ArrayList<>();

    private static String quote(String s) {
        StringBuilder b = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            if (c == '"' || c == '\\') b.append('\\').append(c);
            else if (c < 32) b.append(String.format("\\u%04x", (int) c));
            else b.append(c);
        }
        return b.append('"').toString();
    }

    private static String name(ParserRuleContext ctx) {
        return ctx == null ? "" : ctx.getText().replace("\"", "");
    }

    private static boolean under(ParserRuleContext ctx, Class<?> type) {
        for (ParserRuleContext p = ctx.getParent(); p != null; p = p.getParent()) if (type.isInstance(p)) return true;
        return false;
    }

    private static <T> T ancestor(ParserRuleContext ctx, Class<T> type) {
        for (ParserRuleContext p = ctx.getParent(); p != null; p = p.getParent()) if (type.isInstance(p)) return type.cast(p);
        return null;
    }

    private static void create(String kind, String name, ParserRuleContext at, String container) {
        creates.add("{\"kind\":" + quote(kind) + ",\"name\":" + quote(name) + ",\"line\":" + at.start.getLine() + (container == null ? "" : ",\"in\":" + quote(container)) + "}");
    }

    private static void ref(String how, String name, ParserRuleContext at) {
        refs.add("{\"how\":" + quote(how) + ",\"name\":" + quote(name) + ",\"line\":" + at.start.getLine() + "}");
    }

    private static String qualified(ParserRuleContext schema, String name) {
        return (schema != null ? name(schema) + "." : "") + name;
    }

    private static void walk(ParseTree tree) {
        if (tree instanceof ParserRuleContext ctx) {
            if (ctx instanceof PlSqlParser.Create_packageContext c) create("package", qualified(c.schema_object_name(), name(c.package_name(0))), c, null);
            else if (ctx instanceof PlSqlParser.Create_package_bodyContext c) create("package-body", qualified(c.schema_object_name(), name(c.package_name(0))), c, null);
            else if (ctx instanceof PlSqlParser.Create_procedure_bodyContext c) create("procedure", name(c.procedure_name()), c, null);
            else if (ctx instanceof PlSqlParser.Create_function_bodyContext c) create("function", name(c.function_name()), c, null);
            else if (ctx instanceof PlSqlParser.Create_viewContext c) create("view", qualified(c.schema_name(), name(c.v)), c, null);
            else if (ctx instanceof PlSqlParser.Create_tableContext c) create("table", qualified(c.schema_name(), name(c.table_name())), c, null);
            else if (ctx instanceof PlSqlParser.Create_triggerContext c) create("trigger", name(c.trigger_name()), c, null);
            else if (ctx instanceof PlSqlParser.Create_type_specContext c) create("type", c.type_definition() == null ? "" : name(c.type_definition().type_name()), c, null);
            else if (ctx instanceof PlSqlParser.Create_type_bodyContext c) create("type-body", c.type_body() == null ? "" : name(c.type_body().type_name()), c, null);
            else if (ctx instanceof PlSqlParser.Create_synonymContext c) create("synonym", name(c.synonym_name()), c, null);
            else if (ctx instanceof PlSqlParser.Create_sequenceContext c) create("sequence", name(c.sequence_name()), c, null);
            else if (ctx instanceof PlSqlParser.Procedure_specContext c && ancestor(c, PlSqlParser.Create_packageContext.class) != null)
                create("package-procedure", name(c.identifier()), c, name(ancestor(c, PlSqlParser.Create_packageContext.class).package_name(0)));
            else if (ctx instanceof PlSqlParser.Function_specContext c && ancestor(c, PlSqlParser.Create_packageContext.class) != null)
                create("package-function", name(c.identifier()), c, name(ancestor(c, PlSqlParser.Create_packageContext.class).package_name(0)));
            else if (ctx instanceof PlSqlParser.Procedure_bodyContext c && ancestor(c, PlSqlParser.Create_package_bodyContext.class) != null)
                create("package-procedure-body", name(c.identifier()), c, name(ancestor(c, PlSqlParser.Create_package_bodyContext.class).package_name(0)));
            else if (ctx instanceof PlSqlParser.Function_bodyContext c && ancestor(c, PlSqlParser.Create_package_bodyContext.class) != null)
                create("package-function-body", name(c.identifier()), c, name(ancestor(c, PlSqlParser.Create_package_bodyContext.class).package_name(0)));
            else if (ctx instanceof PlSqlParser.Tableview_nameContext c) {
                String how = under(c, PlSqlParser.References_clauseContext.class) ? "foreign-key"
                    : under(c, PlSqlParser.Insert_into_clauseContext.class) ? "insert"
                    : under(c, PlSqlParser.Merge_statementContext.class) ? "merge"
                    : under(c, PlSqlParser.Update_statementContext.class) && !under(c, PlSqlParser.Select_statementContext.class) ? "update"
                    : under(c, PlSqlParser.Delete_statementContext.class) && !under(c, PlSqlParser.Select_statementContext.class) ? "delete"
                    : under(c, PlSqlParser.Dml_table_expression_clauseContext.class) ? "select"
                    : "other:" + c.getParent().getClass().getSimpleName().replace("Context", "");
                ref(how, name(c), c);
            } else if (ctx instanceof PlSqlParser.Call_statementContext c) {
                StringBuilder full = new StringBuilder();
                for (var routine : c.routine_name()) { if (full.length() > 0) full.append('.'); full.append(name(routine)); }
                ref("execute", full.toString(), c);
            } else if (ctx instanceof PlSqlParser.General_elementContext c && !(c.getParent() instanceof PlSqlParser.General_elementContext)) {
                List<String> parts = new ArrayList<>();
                collect(c, parts);
                var last = lastPart(c);
                if (last != null && !last.function_argument().isEmpty()) ref(parts.size() >= 2 ? "call" : "call-one-part", String.join(".", parts), c);
            }
        }
        for (int i = 0; i < tree.getChildCount(); i++) walk(tree.getChild(i));
    }

    private static void collect(PlSqlParser.General_elementContext c, List<String> parts) {
        if (c.general_element() != null) collect(c.general_element(), parts);
        for (var part : c.general_element_part()) parts.add(part.id_expression().getText().replace("\"", ""));
    }

    private static PlSqlParser.General_element_partContext lastPart(PlSqlParser.General_elementContext c) {
        var parts = c.general_element_part();
        if (!parts.isEmpty()) return parts.get(parts.size() - 1);
        return c.general_element() == null ? null : lastPart(c.general_element());
    }

    public static void main(String[] args) throws Exception {
        Path root = Path.of(args[0]);
        var reader = new java.io.BufferedReader(new java.io.InputStreamReader(System.in, StandardCharsets.UTF_8));
        StringBuilder out = new StringBuilder("{\"files\":{");
        String line;
        boolean first = true;
        while ((line = reader.readLine()) != null) {
            if (line.isBlank()) continue;
            String text = Files.readString(root.resolve(line), StandardCharsets.UTF_8);
            creates = new ArrayList<>();
            refs = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            PlSqlLexer lexer = new PlSqlLexer(CharStreams.fromString(text));
            lexer.removeErrorListeners();
            CommonTokenStream tokens = new CommonTokenStream(lexer);
            PlSqlParser parser = new PlSqlParser(tokens);
            parser.removeErrorListeners();
            parser.getInterpreter().setPredictionMode(PredictionMode.SLL);
            parser.setErrorHandler(new BailErrorStrategy());
            ParseTree tree;
            try {
                tree = parser.sql_script();
            } catch (ParseCancellationException e) {
                tokens.seek(0);
                parser.reset();
                parser.setErrorHandler(new DefaultErrorStrategy());
                parser.getInterpreter().setPredictionMode(PredictionMode.LL);
                parser.addErrorListener(new BaseErrorListener() {
                    @Override public void syntaxError(Recognizer<?, ?> r, Object o, int l, int c, String msg, RecognitionException e) {
                        if (errors.size() < 5) errors.add("{\"line\":" + l + ",\"message\":" + quote(msg.length() > 160 ? msg.substring(0, 160) : msg) + "}");
                    }
                });
                tree = parser.sql_script();
            }
            if (errors.isEmpty()) walk(tree);
            if (!first) out.append(',');
            first = false;
            out.append(quote(line)).append(":{\"parseErrors\":[").append(String.join(",", errors)).append("],\"creates\":[").append(String.join(",", creates))
               .append("],\"references\":[").append(String.join(",", refs)).append("]}");
        }
        System.out.print(out.append("}}"));
    }
}
