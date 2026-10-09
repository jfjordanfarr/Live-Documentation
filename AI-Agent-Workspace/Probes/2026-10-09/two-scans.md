# Two scans, one board: the probe of the World Map's first ticket, October 9, 2026

_A design probe by the root Claude Code agent (Fable 5.1) on 2026-10-09, at the owner's word in [Turn 7 of the October 9 session](../../ChatHistory/2026/10/2026-10-09.1.record.md#turn-7): "I think we're aligned. I agree with this plan. Please proceed with it". It is the probe that ticket T1 of [the World Map's plan](../../../.mdmd/layer-3/world-map.mdmd.md) calls for after its talk closed. The probe's script is disposable and not committed; this record keeps the brief, the numbers and the pictures under `two-scans/`. Nothing here changes product code; what it finds is the brief of the build that follows, once the owner has seen it._

## The question

T1's talk decided that each thing on the board is scanned alone, and that the join over the things' graphs draws the wires between them. The estate sample has been drawn until now from one scan over the whole estate, carved into seven things by its board. So the probe asks: when each of the seven folders is scanned by itself and the seven graphs are joined over the same board, are the wires the same as the one-scan build's? Where they differ, is the difference a gap in what the docs write, which the build can fix, or a cost of the rule that facts are whole only inside a scan, which the person pays by choosing where to point?

## How it is built

1. **The oracle.** The estate fixture, `tests/integration/programs/csharp/estate`, is copied, scanned once with the generator, and joined to its board, exactly as the integration test does. Its wires are the one-scan build's: eleven, ten from the docs and one declared. The six hand-verified remote edges in its `expected/hand-verified-edges.json` are the ground truth beneath them.
2. **Seven scans.** Each folder a thing's `From` names (Portal, Gateway, Contracts, Hub, PaymentService, Database/SqlServer, Database/Oracle) is copied alone and scanned alone, into its own docs root. Nothing of one scan is visible to another.
3. **The estate's graph.** The seven graphs are merged into one, each file keyed by its address: the thing's name, then the file's path inside the thing, `portal/Services/GatewayClient.cs`, as T1 decided. A doc's edge that its scan left unlinked, because what it names lives in another thing, is then matched across things by what the docs carry: a route call to a route door by the openings module's own matching, an address to an address door exactly, a database object to its declared object by schema and name, a project reference to the project that publishes that name. Each match links the edge and keeps its basis. The merged graph's links between files are the join's wires between things, as today.
4. **The dropped project reference.** The manifest adapter writes a project reference only when the referenced project file lies inside the scan (`project.ts`, `resolveProjectReference`); outside, it is dropped. The probe reads the three `ProjectReference` lines itself and adds the unlinked labels the fix would write, so that the picture shows what the fix gives. This is simulated here and said so; the fix itself belongs to the build.
5. **The board.** The estate's board, with each `From` pointing at the thing's name in the merged graph instead of its folder on disk. The join, `deriveBoardGraph`, is unchanged.
6. **The comparison.** Every wire of both builds, keyed by its two things, its door and its basis, with the count of file edges behind it: present in both, in the one-scan build only, in the seven-scan build only.
7. **The drawing.** The estate sample's built bundle is copied, its data file replaced by the merged graph and the rewritten board, and the World Map opened over it with Playwright for pictures, the one-scan build beside it.

## What I expect, before running

- Addresses and database objects match across scans by name with no loss: the configuration and contract edges carry the full name on both sides.
- Routes may not. A server's HTTP client that calls a route prefers a server away from home, and when the scan holds none it links the server at home (`chooseServers` in the openings module). The Portal's `GatewayClient.cs` calls `POST api/payments`, which the Portal's own controller also serves for its browser script; scanned alone, the call may be linked to the Portal's own controller instead of left as a label, and the wire to the Gateway would then be missing. If so, that is a fork for the owner.
- The three wires from source to the shared Contracts library vanish in the seven-scan build, since a type reference to a class outside the scan resolves to nothing, and come back as one project-reference wire per project once the dropped reference is written. Type-level detail is the cost of carving where the facts are not whole, and the owner's rule, scan the solution root and carve inside it, is what avoids paying it.
- What a thing stands on is read from a doc's dependency lines, not from the graph's edges, so a project reference linked across things may still be listed as something the thing stands on until the build decides where that reading belongs.

## Findings

The probe ran on 2026-10-09 over the fixture as committed at `534f4951`. The numbers are the script's report, verbatim; the reading follows them.

### The scans

| Scan | Files | Edges | Linked | Unlinked with a basis |
| --- | ---: | ---: | ---: | ---: |
| the whole estate, once | 35 | 110 | 95 | 1 |
| `portal` from `Portal` | 11 | 27 | 23 | 0 |
| `gateway` from `Gateway` | 5 | 11 | 5 | 1 |
| `contracts` from `Contracts` | 6 | 16 | 14 | 0 |
| `hub` from `Hub` | 4 | 6 | 2 | 2 |
| `payments` from `PaymentService` | 6 | 15 | 8 | 2 |
| `sqlserver` from `Database/SqlServer` | 2 | 1 | 1 | 0 |
| `oracle` from `Database/Oracle` | 1 | 0 | 0 | 0 |

The whole estate's one unlinked label is the staging address of the payment service, which nothing serves in either build.

### What each scan wrote for a call it could not serve

- `portal/Services/GatewayClient.cs`: `PaymentsController.GET api/payments/{paymentId}` (contract) linked at home to `Controllers/PaymentsController.cs`; the one scan linked it to `Gateway/Controllers/PaymentsController.cs`
- `portal/Services/GatewayClient.cs`: `PaymentsController.POST api/payments` (contract) linked at home to `Controllers/PaymentsController.cs`; the one scan linked it to `Gateway/Controllers/PaymentsController.cs`
- `gateway/Web.config`: `net.tcp://hub.onprem.example:8731/PaymentHub` (configuration), unlinked
- `hub/App.config`: `net.tcp://payments-staging.onprem.example:8732/PaymentService` (configuration), unlinked
- `hub/App.config`: `net.tcp://payments.onprem.example:8732/PaymentService` (configuration), unlinked
- `payments/Data/Payment.cs`: `dbo.Payment` (contract), unlinked
- `payments/Data/PaymentsContext.cs`: `dbo.usp_PostPayment` (contract), unlinked

### Links made across things, by what the docs carry

- `gateway/Gateway.csproj`: `Contracts` to `contracts/Contracts.csproj`
- `gateway/Web.config`: `net.tcp://hub.onprem.example:8731/PaymentHub` (configuration) to `hub/App.config`
- `hub/App.config`: `net.tcp://payments.onprem.example:8732/PaymentService` (configuration) to `payments/App.config`
- `hub/Hub.csproj`: `Contracts` to `contracts/Contracts.csproj`
- `payments/Data/Payment.cs`: `dbo.Payment` (contract) to `sqlserver/dbo.Payment.sql`
- `payments/Data/PaymentsContext.cs`: `dbo.usp_PostPayment` (contract) to `sqlserver/dbo.usp_PostPayment.sql`
- `payments/PaymentService.csproj`: `Contracts` to `contracts/Contracts.csproj`

### The wires, one scan against seven

| Wire | One scan | Seven scans |
| --- | ---: | ---: |
| CLOUD to ON-PREM [declared] | 1 | 1 |
| gateway to contracts [source] | 13 | 1 |
| gateway to hub . `net.tcp://hub.onprem.example:8731/PaymentHub` (address) [configuration] | 1 | 1 |
| hub to contracts [source] | 13 | 1 |
| hub to payments . `net.tcp://payments.onprem.example:8732/PaymentService` (address) [configuration] | 1 | 1 |
| payments to contracts [source] | 11 | 1 |
| payments to sqlserver . `dbo.Payment` (table) [contract] | 1 | 1 |
| payments to sqlserver . `dbo.usp_PostPayment` (procedure) [contract] | 1 | 1 |
| portal to gateway . `GET api/payments/{paymentId}` (route) [contract] | 1 | absent |
| portal to gateway . `POST api/payments` (route) [contract] | 1 | absent |
| sqlserver to oracle . `CENTRAL.ACCOUNT` (table) [contract] | 1 | absent |

In both: 8. One scan only: 3. Seven scans only: 0.

### The six hand-verified remote edges, in each build

- one scan found, seven scans MISSING: `portal/Services/GatewayClient.cs` to `gateway/Controllers/PaymentsController.cs` (HTTP POST api/payments and GET api/payments/{paymentId} at Portal.GatewayBaseUrl)
- one scan found, seven scans found: `gateway/Web.config` to `hub/App.config` (client endpoint address net.tcp://hub.onprem.example:8731/PaymentHub matches the hub's service endpoint)
- one scan found, seven scans found: `hub/App.config` to `payments/App.config` (client endpoint address net.tcp://payments.onprem.example:8732/PaymentService matches the service endpoint)
- one scan found, seven scans found: `payments/Data/PaymentsContext.cs` to `sqlserver/dbo.usp_PostPayment.sql` (EXEC dbo.usp_PostPayment through Database.SqlQuery)
- one scan MISSING, seven scans MISSING: `payments/Data/PostPaymentRow.cs` to `sqlserver/dbo.usp_PostPayment.sql` (the procedure's result columns PaymentId, Status and AccountBalance)
- one scan found, seven scans found: `payments/Data/Payment.cs` to `sqlserver/dbo.Payment.sql` ([Table("Payment", Schema = "dbo")] maps the entity to the table)
- one scan found, seven scans MISSING: `sqlserver/dbo.usp_PostPayment.sql` to `oracle/CENTRAL.ACCOUNT.sql` (four-part name ORACLE_CENTRAL..CENTRAL.ACCOUNT through the linked server)

### What each thing stands on, in the seven-scan build

- `portal`: `Microsoft.AspNet.WebApi.Core@5.3.0`, `System.Configuration`, `System.Net.Http`, `System.Web`
- `gateway`: `Microsoft.AspNet.WebApi.Core@5.3.0`, `System.Configuration`, `System.ServiceModel`, `Contracts`
- `contracts`: `System.Runtime.Serialization`, `System.ServiceModel`
- `hub`: `System.ServiceModel`, `Contracts`
- `payments`: `EntityFramework@6.5.1`, `System.ComponentModel.DataAnnotations`, `System.Data`, `System.ServiceModel`, `Contracts`

### The pictures

- [The one-scan build at rest](two-scans/one-scan-world-map.png): the portal's calls reach the gateway's two route doors, and the SQL Server procedure reaches the Oracle table.
- [The seven-scan build at rest](two-scans/seven-scans-world-map.png): the same picture without those three wires; the portal has no door left, and the oracle drum stands alone. Everything else is drawn the same, the three project references included.
- [A road pinned in the seven-scan build](two-scans/seven-scans-road-pinned.png): the evidence line reads `payments/Data/Payment.cs → sqlserver/dbo.Payment.sql`, an address on each side.
- [Inside the portal in the seven-scan build](two-scans/seven-scans-inside-portal.png): the thing's files read `portal/Portal.csproj` and `portal/Web.config`; the address is the path, as T1 decided.
- [The same road pinned in the one-scan build](two-scans/one-scan-road-pinned.png), for comparison.

### The reading

1. **Addresses and database objects cross scans by name with no loss.** The gateway's client endpoint reached the hub, the hub's reached the payment service, the entity's table and the context's procedure reached SQL Server, each by the label the separate scan wrote and the door the other scan published. The expectation held.
2. **Routes did not, as expected.** Scanned alone, the portal's `GatewayClient.cs` had its two calls linked to the portal's own controller, which serves routes of the same shape for the portal's browser script, because `chooseServers` falls back to the server at home when no server away exists. So the separate scan wrote a wrong link instead of a label, the estate build had nothing to match, and the two portal-to-gateway wires are absent; inside the portal a false edge joins the client to its own controller. This is a fork for the owner, below.
3. **The SQL adapter drops a reference it cannot resolve.** `sql.ts` writes a dependency only for an object the scan declares; a name that matches nothing, the four-part name through the linked server here, is not written at all, so the SQL Server to Oracle wire is lost. The C# adapter keeps a called object it cannot resolve as a label; the SQL adapter keeps nothing. A second doc gap, and a fork on how wide the fix should be.
4. **The project reference the manifest adapter drops is confirmed dropped**, in all three projects that reference Contracts. Written as the referenced project's name, it matched the symbol the Contracts project file publishes, and the wire came back with the basis the one-scan build gives it, source. The fix is the build's.
5. **The wires to Contracts collapse from thirty-seven file-level edges to three.** A type reference to a class outside the scan resolves to nothing, so the thirteen, thirteen and eleven edges the one scan carries from source become one project-reference edge each. At the World Map's scale the picture is the same, one dashed road per project; the loss is inside, where the Local Map of the gateway no longer shows which classes use which contract, and a path across systems symbol to symbol (T12) cannot cross there. This is the cost of carving where the facts are not whole, and the owner's rule, scan the solution root and carve inside it, is how a person avoids paying it.
6. **What a thing stands on is read from the doc's lines, not the graph's edges.** With the project reference written as a line, `Contracts` is listed under the gateway, the hub and the payment service as something they stand on, although the estate build linked it to the contracts thing on the same board. The build must read what a thing stands on from the edges the estate build leaves unlinked, or the picture says both.
7. **Addresses as keys worked unchanged** through the join, the bundle and the client: `From: portal` resolved to the files under `portal/`, the evidence lines carry an address on each side, the inside of a thing shows its files by address, and the share link after entering the portal carries that state.
8. **Not T1's: the result-column mapping** from `PostPaymentRow.cs` to the procedure is missing in both builds; no adapter infers it, and the integration test did not notice because it checks for a wire between two things, not for each file-level edge. A gap of the oracle test's strictness, to tighten when the build writes its test.
9. **Nothing on the board shows an unserved call.** The staging address is a label in both builds and appears nowhere on the World Map; the fog's line on a door nothing serves as the edge of the known world is what this is.
10. **The generator warned about nothing**, since nothing nested; the warning for a nested scan is the build's, with its test.

## Forks for the owner

1. **A server's HTTP client that only its own project serves.** Today the openings module links the call to the server at home when no server away exists; the probe shows that a thing scanned alone then mislinks its outbound calls and hides them from the estate. The alternative: a server's client never links to its own project; a call nothing away serves stays a label with its basis, and the estate build matches it across things. What that costs: in a single scan, a process that calls its own routes over HTTP loses that edge, a rare shape and usually a smell. The agent recommends the alternative.
2. **How much the SQL adapter writes of what it cannot resolve.** Narrow: only a name through a linked server, the explicit evidence of another database. Wide: every object a script names that the scan does not declare, with the system schemas `sys` and `INFORMATION_SCHEMA` as builtins, which is what the owner's database project of record would need to show the tables of the other database it names. The agent recommends wide, since a filter that can only raise false negatives is a bug, and a label nothing serves costs the board nothing.

## What the build would contain, if the forks are settled

The manifest adapter writing an outbound project reference as the referenced project's name, with a test; the SQL adapter writing what it cannot resolve, with a test; the route fallback per the owner's word, with the estate's own case as the test; an estate graph in the engine, several graphs merged by address and their unlinked labels matched across things, with unit tests over small graphs and the estate as the integration test, the Contracts collapse stated in the test rather than hidden; what a thing stands on read from the unlinked edges; the bundle build taking a board whose things name folders, scanning each outermost `From` alone, joining and carrying the estate graph; the generator's warning when a scan would nest inside or around another, with a test; the boards design doc brought current; and T1 closed in the plan. The World Map's modules stay as they are, since the estate graph reaches them as one graph and one board.
