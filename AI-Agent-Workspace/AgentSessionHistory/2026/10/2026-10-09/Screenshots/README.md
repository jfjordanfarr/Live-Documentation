# Screenshots, October 9, 2026

Pictures of the built Explorer taken by the agent after changing it, as [AGENTS.md](../../../AGENTS.md) asks. This folder's pictures belong to [Turn 10 of the October 9 session](../../ChatHistory/2026/10/2026-10-09.1.record.md#turn-10), the build of the World Map's first ticket: the estate sample's seven things scanned alone and read into one graph by the bundle builder through `readEstateGraph`, which [the probe](../../Probes/2026-10-09/two-scans.md) had only simulated. Every picture is of that seven-scan estate bundle at 1,400 by 900 CSS pixels, built by a disposable script from a copy of the fixture, generated once per thing, and served from the scratchpad; the one-scan pictures to compare with are the probe's.

## The seven-scan estate through the real builder

| Capture | State |
| --- | --- |
| [estate-seven-scans-world-map.png](estate-seven-scans-world-map.png) | The World Map at rest over the seven scans, the same ten roads as the one-scan build's: the portal's two route calls reach the gateway again, and the SQL Server procedure reaches the Oracle table, the two wires the probe had lost to the home fallback and the SQL adapter's silence. Nothing in the viewer changed; the builder handed it one graph and one board as before. |
| [estate-seven-scans-portal-gateway-pinned.png](estate-seven-scans-portal-gateway-pinned.png) | The portal-to-gateway road pinned: "portal calls gateway, from a contract, POST api/payments · route", its one evidence line `Portal/Services/GatewayClient.cs → Gateway/Controllers/PaymentsController.cs`, a link the estate graph made across two scans from the route name the portal's scan had linked at home. |
| [estate-seven-scans-local-map-procedure.png](estate-seven-scans-local-map-procedure.png) | The Local Map at `Database/SqlServer/dbo.usp_PostPayment.sql`: its inputs are the Oracle table under the group ORACLE and the payment table under SQLSERVER, its output the payments context under DATA, three things of the estate around one file, each scanned alone. The Find Path box above would run across them, since it is one graph. |
