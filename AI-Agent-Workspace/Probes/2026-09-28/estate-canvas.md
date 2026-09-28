# Probe C: systems on a canvas, the estate

_The builder's findings for probe C, verbatim, including the section added after the chain was flipped to read provision left to right. Screenshot numbers refer to the builder's `shots/` folder; the three kept here are `shots/estate-11-provision-canvas-at-rest.png` (11), `shots/estate-02-hover-tier2-gateway-hub.png` (02) and `shots/estate-14-provision-gateway-open.png` (14)._

## What was built and how to drive it

`build.cjs` reads `.mdmd/index.json`, keeps the 29 files under the estate prefix (27 drawn; the two `expected/*.json` are the oracle's, not a system) and embeds them with `hand-verified-edges.json`, the `projects` array of `compiler-edges.json` and the five `.csproj` files into `index.html`. Nothing else is loaded, so this says nothing about 549 files.

Three scales, one camera; text, pins and dashes keep one pixel size at every scale (CSS2D labels, screen-space sprites, dashes rescaled from camera distance). Boxes are sized by a layered layout of their files, callers left, callees right. Wall pins: one per wire per partner, plus a dangling pin for every `service`, `endpoint` or `connection-string` symbol no wire could use. Tier 1 solid, tier 2 dashed and heavier, tier 3 dotted; every wire is the blue-to-green gradient. Hover fades all but the wire's two boxes and shows the `via` text.

`window.probe`: `level('canvas')`, `open(name)`, `focus(file)`, `out()`, `hover(wireId | 'tunnel' | null)`, `hoverBox(name)`, `orbit(deg)`, `instant(true)`, `state()`. Double-click opens a box or focuses a card; crumbs go out; `shoot.cjs` makes every shot.

## What depth bought

- **The chain stays a line.** Contracts is a library, not a hop. Behind and above the zones (`01`, `07`) its three tier-1 wires arc over the chain, and Portal to Oracle reads uninterrupted.
- **Back-connections are real wires.** A wire that would run right to left or cross a card dips behind the cards, which occlude it (`08`: App.config's wire to the right wall; `09`: portal.js back to Default.aspx). The corset's rule at the folder scale, with no stubs.
- **The card comes to you** (`04`): the focused card lifts toward the camera and unfolds; only its own column slides. Box, other cards, Portal and the tunnel stay put.
- **Declared reads without words**: a dotted cylinder the dashed wire passes through (`01`, `02c`) is plainly not a wire.
- **Transitions keep bearings** (`04` -> `05` -> `06`): the same wall pins, neighbours and crumbs.

## What it cost

- **Perspective breaks the law.** Callee-to-the-right holds only within a plane: Contracts behind PaymentService and 30 units to its right projected to its *left*, so its wire arrived as a back-connection.
- **Occlusion.** HTML labels never occlude: at 30 degrees (`07`) "tunnel · declared" lands on "Hub"; Contracts' barnacle list hangs into SqlServer's label. Symbol rows need baked textures.
- **Scale invariance is work.** World-sized pins were four times bigger at the box scale, dashes likewise; a per-box camera distance made Portal's cards too narrow for their names, so every box is now seen at one px-per-unit and Portal fills the screen.
- **Disorientation.** Opening a box puts the camera inside the zone volume; above 5% face opacity the world turned blue. Elevation drops 21, 9, 4 degrees across scales so cards read frontally, so each transition also tilts.
- **Performance** is not measured by 27 files.

## Facts the picture needed that the docs do not carry

1. **HTTP routes.** The `Gateway/Controllers/PaymentsController.cs` doc has `Post`, `Get`, `Extends: ApiController`; not `[HttpPost] [Route("api/payments")]` nor `[HttpGet] [Route("api/payments/{paymentId}")]`. Wanted at Gateway's left wall (its pin is unlabelled) and at the card scale (`04`), where the Portal wire lands on `Internals` instead of `Post` and `Get`.
2. **The client side of those routes.** The `Portal/Services/GatewayClient.cs` doc lists methods; `"api/payments"`, `"api/payments/" + paymentId` and their base `Portal.GatewayBaseUrl` appear only in summary prose. Wanted at Portal's right wall pin and at the blue pins of `PostPaymentAsync` and `GetPaymentAsync`.
3. **Endpoint addresses.** The docs name `PaymentHub` (kind `endpoint`) in Gateway/Web.config and `Estate.Hub.PaymentHub` (kind `service`) in Hub/App.config, so both ends have labelled pins; `net.tcp://hub.onprem.example:8731/PaymentHub` is in neither, so the wire came from the hand-verified file. Hub/App.config's doc names `PaymentService.Consumer.Production` and `.Staging` without addresses, so the picture cannot say which the wire is: `08` shows an unlabelled wire pin beside two named, dangling pins. The kind pair `endpoint`/`service` gave the direction; the address would let the docs draw the wire.
4. **The connection string's target.** `PaymentsDb` is a `connection-string` symbol; `Server=sql.onprem.example;Database=Payments` is not, so it dangles on PaymentService's right wall while the SqlServer wire uses a separate unlabelled pin.
5. **Procedure and table names.** `PostPaymentProcedure`'s value `dbo.usp_PostPayment`, `[Table("Payment", Schema = "dbo")]` on `Payment`, and `PostPaymentRow`'s result columns exist only as prose or not at all. Wanted at the `PostPayment` row's blue pin, the `Payment` class row and the PaymentService-to-SqlServer wire (`02b`).
6. **Anything in SQL.** No `.sql` file has a Live Doc, so SqlServer and Oracle are ghost boxes whose files are known only as `to` paths of hand-verified edges (`10`), and `FROM ORACLE_CENTRAL..CENTRAL.ACCOUNT` is unobservable. Wanted at both boxes' contents, walls and the SqlServer-to-Oracle wire.
7. **Which files form a system.** Derived from path segments; the truth is `Estate.sln` and the SDK-style `.csproj` globs. Wanted at every box boundary.
8. **Project references.** `<ProjectReference>` (also `compiler-edges.json` `projects[].references`) is the declared tier-1 fact; the picture aggregated 19 file edges instead. Wanted at Contracts' left wall.
9. **Packages and versions.** `EntityFramework 6.5.1`, `Microsoft.AspNet.WebApi.Core 5.3.0`, `System.*` references, `net48`: from `.csproj` only. Wanted at the barnacles.
10. **Zones.** Nothing in the data says cloud or on-prem; the README and a comment in Gateway/Web.config do. Wanted at the two volumes, and for Contracts, which has no zone because it is not deployed, which the data cannot say either.
11. **The tunnel.** Declared on the page. Wanted between the zones.
12. **An edge's tier.** The index has none. `Gateway/Web.config -> Contracts/IPaymentHub.cs` is observed from configuration (`contract=`) but is a plain Dependency, drawn solid. Wanted at every wire's line style.
13. **Evidence.** The hover panel's `via` text is entirely the hand-verified file's.
14. **The symbol a remote edge touches.** Hand-verified edges name files only, so at the card scale every tier-2 wire lands on `Internals`.

## Transition points

- **Canvas to box.** The front face goes to zero, wall pins do not move, wires to other boxes stay, all else fades to 0.32 (`03`). What pulls you in: a closed box's unlabelled wall pins and file count.
- **Box to card.** The card lifts and unfolds; wires leave its rows and still end at the same wall pins (`04`). What pulls you in: folded cards carry row marks that are illegible by design.
- **Out again.** The wire into a wall continues onto the canvas, so the next scale out is visible at the wall.
- **One scale in from the card** (a row's own references) and **one scale out from the canvas** (an estate of snapshots) were not built; the canvas has no place for where a snapshot came from.

## Keep and throw away

Keep: the wall pin as a junction shared by two scales; constant-pixel text, pins and dashes; solid/dashed/dotted for tiers (enough with eight wires; weight added nothing visible); dangling pins; ghost cards and boxes; the evidence panel; barnacle tiles plus a list; zones as volumes.

Throw away: CSS2D for symbol rows; wires dipping behind cards (a hack standing in for a router); height as layout for Contracts; the zone tints if a third hue is unwelcome.

## Open questions

1. The addendum's law (caller left, callee right) is the reverse of the Local Map today, whose left column is "Dependencies (Inputs)" (`layout-math.ts`, class `outbound`). One of them changes.
2. Is Contracts a box or a barnacle? A linked library is cruft on three boxes, not a deployment.
3. Wall pins: one per partner (built), or one per endpoint (what the wall wants, possible only where the docs name a service or endpoint)?
4. Should `expected/*.json` be in the index at all?
5. Is a dangling `PaymentService.Consumer.Staging`, which nothing answers to, signal or noise?

## Which way the chain reads

`probe.direction("provision")`, now the default, and `"call"` lay out the same data two ways; shots `11` to `15` are `01`, `02` and `04` to `06` under provision. Under call the chain reads Portal to Oracle, a wire leaves the caller's blue right wall and lands on the callee's green left wall, callers sit left of callees inside a box, and Contracts hangs behind the far right as the thing everyone calls. Under provision the chain reads Oracle to Portal, a wire leaves the provider's blue right wall and lands on the consumer's green left wall, a file's dependencies sit to its left and its dependents to its right (the Local Map's law), each box's endpoints are on its right wall as the vision's table has them, and Contracts moves behind the far left as the root everything is built on. Nothing else moves: tiers, pins, evidence and the tunnel are the same objects. Provision is the truer picture. It is the owner's sentence read literally: the account balance comes out of Oracle, through the procedure, the entity, the hub and the route, and into the page; what a box offers leaves its right wall and what it needs arrives at its left, so a system reads like a machine with inputs and outputs; and it is the law the file scale already obeys, so a wire means one thing at every scale. Its cost is that the person's click sits at the far right, so a non-software reader has to be told the map runs from the system of record outward, and the hover panel still reads "Gateway → Hub" in the hand-verified file's "from depends on to" convention, against the drawn direction.
