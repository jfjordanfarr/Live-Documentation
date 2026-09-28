# Openings

## Metadata

- Layer: 3
- Audience: Contributors

_Current as of 2026-09-28._

## Authored

### Purpose

Describe how the Live Docs carry what the World Map needs beyond imports: the openings a file serves, the openings a file calls, what a project stands on, and, on every edge that crosses a process boundary, the basis on which it was observed. This landed on 2026-09-28 as the first of the five growths the vision's step 3 lists. The estate program under `tests/integration/programs/csharp/estate/` is its measure.

### The model

- **An opening is a public symbol** of the file that serves it, and the symbol's kind says which: `route` (`GET api/payments/{paymentId}`), `address` (`net.tcp://hub.onprem.example:8731/PaymentHub`), `procedure`, `table`, `view`, `function`. It sits in the Public Symbols section beside the file's types and members, so that a link can land on it, exactly as a configuration file's keys and endpoint names already did.
- **A call is a dependency line** that links to that symbol, as an import links to a symbol, with one addition: a qualifier that says how the edge was observed. `(contract)` when both sides carry the same name, a route, a procedure, a table. `(configuration)` when both sides carry the same address in configuration. No qualifier means observed from source, as every edge inside a folder is. The graph index carries the same fact as `basis` on the edge. The vision calls these the tiers of an edge; in the docs and the index the word is basis.
- **A call nothing in the workspace serves** stays on the doc as the opening's name with its basis, an external dependency like an unresolved import: `` - `DELETE api/nothing/1` (contract) ``. A map can draw a door to something outside from it, which is what a database whose scripts are not in the estate looks like.
- **What a project stands on is the Live Doc of its manifest.** A `.csproj` publishes the project as a symbol of kind `library`, `program` or `web`, links each project reference to the project file it names, and lists package references as `name@version` and assembly references by name. A `packages.config` lists its packages. A `package.json` publishes its package, links workspace packages by name, and lists the rest as `name@range`. Reading manifests at render time would be a side channel; the documentation rules forbid one.

### How each kind is observed

| Fact                            | Where it is read                                                                                                                                                                       | Module                  | Becomes                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------- |
| A route served                  | `[RoutePrefix]`, `[Route]` on the class; `[HttpGet]` and the other verbs, `[AcceptVerbs]`, `[Route]` on the action; the verb from the action's name when no attribute gives one; `[controller]` and `[action]` tokens; a `~/` template ignores the prefix | `adapters/csharp.ts`    | a `route` symbol at the attribute      |
| A route called from C#          | `HttpClient` methods from `GetAsync` to `DeleteFromJsonAsync`, `new Uri(base, relative)`, `new HttpRequestMessage(HttpMethod.X, url)`; the URL folded through `const` members, computed parts as `{}` | `adapters/csharp.ts`    | a dependency, `contract`               |
| A route called from a script    | `fetch`, `axios`, jQuery's `$.ajax` family and `XMLHttpRequest.open`, over the TypeScript syntax tree; template literals and concatenations, computed parts as `{}`                  | `heuristics/routes.ts`  | a dependency, `contract`               |
| An address served               | `<service><endpoint address>`, a relative address joined to `<host><baseAddresses>`                                                                                                   | `adapters/dotnetConfig.ts` | an `address` symbol                 |
| An address called               | `<client><endpoint address>`, absolute addresses only                                                                                                                                 | `adapters/dotnetConfig.ts` | a dependency, `configuration`       |
| A database object served        | `CREATE [OR ALTER] PROCEDURE`, `TABLE`, `VIEW`, `FUNCTION` in a `.sql` script, brackets and quotes off                                                                                | `adapters/sql.ts`       | a `procedure`, `table`, `view` or `function` symbol |
| An object named from SQL        | `EXEC`, `INSERT INTO`, `DELETE FROM`, `UPDATE`, `FROM`, `JOIN`, `MERGE INTO`, `TRUNCATE TABLE`, `ALTER TABLE`, outside comments and strings                                            | `adapters/sql.ts`       | a dependency: `contract` through a linked server, source in the same database |
| An object named from C#         | any string expression that reads like SQL, folded through constants; `[Table("Payment", Schema = "dbo")]`                                                                             | `adapters/csharp.ts`    | a dependency, `contract`               |
| A connection name               | a `DbContext` subclass's `base("name=X")`, folded through constants                                                                                                                    | `adapters/csharp.ts`    | a dependency on the nearest configuration file, source |
| What a project stands on        | `ProjectReference`, `PackageReference`, `Reference`, `OutputType`, `Sdk`, `ProjectTypeGuids`; `packages.config`; `package.json` dependency blocks                                       | `adapters/project.ts`, `adapters/dotnetConfig.ts`, `adapters/json.ts` | a project or package symbol; links and externals |

The shared vocabulary, the route grammar, the object-name rules and the home of a file live in `openings.ts`. Adapters receive the workspace symbol index on the main pass, which is how a call finds the file that serves it; on the pass that builds the index they run without it.

### Matching rules

- **Routes.** The method must match when both sides know it. Segments match one by one: a served `{param}` takes any segment, a caller's computed `{}` cannot stand for a literal, and a served `{*}` takes the rest. Case does not matter.
- **Home and away.** A file's home is the directory of the nearest manifest above it among the workspace's files. A browser script calls its own site, so a server at home wins; a C# client calls other systems, so a server away from home wins. When only one side serves the route, it is taken, and several servers on the chosen side are all kept, since the files alone cannot say which answers. This is a presumption, and it decides the estate's one ambiguity: `api/payments` is served by both the portal and the gateway, the portal's script reaches its own controller and the portal's client reaches the gateway's. The survey's alternative, confirming the host from configuration, is a gap below.
- **Addresses** match by string equality.
- **Database objects** match on schema and object when both are written, on the object alone otherwise; server and database qualifiers are dropped; case does not matter.

### Measured against

`npm run oracle:compare -- tests/integration/programs/csharp/estate` on 2026-09-28: 37 of 37 compiler edges, unchanged; 17 of 20 hand-verified edges, from 8 that morning; 3 of 3 project references, a bucket the comparison gained the same day. The three hand-verified edges still missing are the ones no scan of the files honestly gives: a designer file's fields to the page's control ids, endpoint names the hub builds by concatenation at run time, and a row type matched to a procedure by its result columns.

### Not covered

- Convention routing (`MapHttpRoute` templates expanded per controller) and minimal APIs (`app.MapGet`); a Web API without attribute routing serves nothing the docs can see.
- WCF contracts by name as a fallback when the addresses in two configuration files differ, and hostnames in configuration to confirm an HTTP match instead of the home-and-away presumption.
- Contract files as a second source of served openings: OpenAPI, WSDL, gRPC, GraphQL, AsyncAPI. The survey names maintained parsers for all but WSDL 2.0.
- Lockfiles for resolved versions; SBOM files (CycloneDX, SPDX), which the owner named as the first iteration of the built-on layer; infrastructure files (ARM, Bicep, Terraform) for districts, tunnels and identities.
- A folder's kind beyond what its project file says: a folder of `.sql` scripts is a database, and nothing says so yet.
- What a person declares: districts, tunnels, edges no scan can see, and where the pieces sit. Open; the direction memory holds the proposal and the owner's words.

### From the survey

[The survey](../../AI-Agent-Workspace/Research/2026-09-28-system-scale-facts.md) found that every static tool matches an HTTP verb and a normalised path template and takes hosts from service names, that none reads .NET Framework configuration, and that none records how it knew. It recommends a small T-SQL scanner over the available parsers, whose support for `CREATE PROCEDURE` is undocumented, with SQL Server's ScriptDom as a possible oracle. Its vocabulary to borrow when the declared block is designed: CycloneDX's `component.type`, `services[].endpoints` and `dependencies[]`, Backstage's relation names, CALM's node types.

## System References

### Components

- [packages/engine/src/live-docs/openings.ts](../layer-4/packages/engine/src/live-docs/openings.ts.mdmd.md)
- [packages/engine/src/live-docs/heuristics/routes.ts](../layer-4/packages/engine/src/live-docs/heuristics/routes.ts.mdmd.md)
- [packages/engine/src/live-docs/adapters/csharp.ts](../layer-4/packages/engine/src/live-docs/adapters/csharp.ts.mdmd.md)
- [packages/engine/src/live-docs/adapters/dotnetConfig.ts](../layer-4/packages/engine/src/live-docs/adapters/dotnetConfig.ts.mdmd.md)
- [packages/engine/src/live-docs/adapters/sql.ts](../layer-4/packages/engine/src/live-docs/adapters/sql.ts.mdmd.md)
- [packages/engine/src/live-docs/adapters/project.ts](../layer-4/packages/engine/src/live-docs/adapters/project.ts.mdmd.md)
- [packages/engine/src/live-docs/adapters/json.ts](../layer-4/packages/engine/src/live-docs/adapters/json.ts.mdmd.md)
- [packages/engine/src/live-docs/compose.ts](../layer-4/packages/engine/src/live-docs/compose.ts.mdmd.md)
- [packages/engine/src/live-docs/graph.ts](../layer-4/packages/engine/src/live-docs/graph.ts.mdmd.md)
- [scripts/oracle/compare.ts](../layer-4/scripts/oracle/compare.ts.mdmd.md)

### Related

- [Polyglot Language Adapters](polyglot-adapters.mdmd.md)
- [Architectural Decisions](architectural-decisions.mdmd.md), under "Openings and the Basis of an Edge"
- [The vision](../layer-1/vision.mdmd.md), under "Where edges come from"

## Evidence

- [packages/engine/src/live-docs/openings.test.ts](../layer-4/packages/engine/src/live-docs/openings.test.ts.mdmd.md)
- [packages/engine/src/live-docs/heuristics/routes.test.ts](../layer-4/packages/engine/src/live-docs/heuristics/routes.test.ts.mdmd.md)
- [packages/engine/src/live-docs/adapters/csharp.test.ts](../layer-4/packages/engine/src/live-docs/adapters/csharp.test.ts.mdmd.md)
- [packages/engine/src/live-docs/adapters/dotnetConfig.test.ts](../layer-4/packages/engine/src/live-docs/adapters/dotnetConfig.test.ts.mdmd.md)
- [packages/engine/src/live-docs/adapters/sql.test.ts](../layer-4/packages/engine/src/live-docs/adapters/sql.test.ts.mdmd.md)
- [packages/engine/src/live-docs/adapters/project.test.ts](../layer-4/packages/engine/src/live-docs/adapters/project.test.ts.mdmd.md)
- [tests/integration/live-docs/oracle.test.ts](../layer-4/tests/integration/live-docs/oracle.test.ts.mdmd.md)
