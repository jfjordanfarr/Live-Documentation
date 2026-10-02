# Estate fixture

A miniature of one payment chain as it runs at a legal enterprise: a cloud portal and gateway, an on-prem WCF hub and service, a SQL Server database, and the Oracle database behind it. Every project targets .NET Framework 4.8 and builds on Linux with the .NET SDK.

```
Portal (WebForms substrate, vanilla JS, Web API 2)
  |  HTTP, Portal.GatewayBaseUrl
Gateway (Web API 2)
  |  WCF over the IPSEC tunnel, client endpoint "PaymentHub"
Hub (WCF)  ... picks the service for the request's workload and environment
  |  WCF, client endpoint "PaymentService.<Workload>.<Environment>"
PaymentService (WCF, Entity Framework 6)
  |  EXEC dbo.usp_PostPayment
SQL Server, dbo.Payment
  |  ORACLE_CENTRAL..CENTRAL.ACCOUNT (linked server)
Oracle, CENTRAL.ACCOUNT
```

The `Contracts` project holds the WCF contracts and data contracts the gateway, hub and service share. The portal does not reference it: it talks JSON to the gateway and has its own request and result models, which is how the real portal works too.

## What the oracle sees

Two expectation files sit under `expected/`, and they measure different things.

- `compiler-edges.json` is produced by `npm run oracle:index -- <this directory>`. It runs `scip-dotnet` over `Estate.sln` in a temporary copy and records every file-to-file edge the C# compiler resolved, with the symbols that carry it, plus every document the index contained. Nothing is filtered. Regenerate it after changing any C# file.
- `hand-verified-edges.json` lists the hops no compiler can see, each with the evidence a reader can check in the two files: configuration keys, endpoint names and addresses, routes, element ids, stored-procedure and table names. Edges marked `remote` cross a deployment boundary.

`board.md` is the estate as a board: its projects and databases as things, two regions and the tunnel between them. `tests/integration/live-docs/board.test.ts` generates the docs over a copy of the fixture, joins the board to them, and checks that every `remote` edge above appears as a wire between two things.

`npm run oracle:compare -- <this directory>` runs the shipped generator over a copy of the fixture and prints where its Dependencies sections disagree with both files. It is a list, not a score.

## Things worth knowing

- `scip-dotnet` names a type by its innermost namespace only, so the portal's and the gateway's `Controllers.PaymentsController` share one symbol. The converter resolves such collisions by project visibility (a document sees its own project and the projects it references, transitively) and lists anything still ambiguous rather than picking one.
- The `.sql` files have no compiler. They are here so the chain ends where it really ends.
- `bin/`, `obj/` and `index.scip` are ignored; the fixture directory itself is never written to by the tooling.

Paths in the expectation JSON files are relative to their containing `expected/` directory (for example, `../Gateway/Web.config`). The oracle reader translates them back to fixture-relative paths for comparison; compiler symbols and hand-verified evidence retain their original meaning.
