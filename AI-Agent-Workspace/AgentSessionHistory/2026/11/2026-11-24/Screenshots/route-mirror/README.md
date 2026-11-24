# Route Mirror, First-Card Framing, and Path-Strip Disambiguation (2026-11-24)

**Status:** Current verification evidence (captured 2026-11-24 at `1280×800` on `/samples/estate/` after `npm run build && npm run e2e:bundles`).

Verifies the three linked changes for Milestone 10 (`direction.md` Next #5):

1. **Routes drawn from their asked start by the mirror:** asking a path from the using end sets a transient, non-persisted, non-URL-serialized `state.pathReads = "usesFirst"` (`effectiveReads(state)` in `reading-direction.ts`), drawing `#map-viewport[data-reads="usesFirst"]` at reading scale (`k = 1`) with Mirror pressed and the sidebar legend exchanged (`Uses 🟢—🔵 Offers`). Clicking Mirror on an active path flips `state.pathReads` in place without touching `localStorage`; clearing the path resets `state.pathReads = null` and restores exploration's reading direction and camera.
2. **First card held whole in the frame:** `computePathFitTransform` frames the visual first card (with its immediate directory label when their union fits inside the vertical paddings) whole inside the unobstructed viewport (`below #path-report`, `above #controls` and `.perspective-controls`), clamped to content bounds, and `fitMapToPath` cancels any pending exploration arrival pull-back so routes stay at reading scale (`k = 1`).
3. **Colliding basenames disambiguated on the strip:** `disambiguateHopContexts` (`search/path-hops.ts`) adds the shortest distinguishing trailing directory path suffix beneath colliding basenames (`.pathfind-path-hop-context`) while leaving unique basenames uncluttered.

## Captures

| Screenshot | Route & State | `data-reads` | Mirror pressed | Scale | First card box vs unobstructed frame (`261..1280`, `162..731`) | Strip disambiguation |
| --- | --- | --- | --- | --- | --- | --- |
| [estate-page-to-table--rest.png](estate-page-to-table--rest.png) | `Default.aspx` → `dbo.Payment.sql` at rest | `usesFirst` | `true` | `1.000` | `Portal/Pages/Default.aspx`: `307..539`, `262..485` (whole) | `PaymentsController.cs` (`Portal/Controllers`, `Gateway/Controllers`), `App.config` (`Hub`, `PaymentService`) |
| [estate-table-to-page--rest.png](estate-table-to-page--rest.png) | `dbo.Payment.sql` → `Default.aspx` at rest | *(absent)* | `false` | `1.000` | `Database/SqlServer/dbo.Payment.sql`: `294..526`, `472..682` (whole, 49 px above controls) | `App.config` (`PaymentService`, `Hub`), `PaymentsController.cs` (`Gateway/Controllers`, `Portal/Controllers`) |
| [estate-page-to-table--fit.png](estate-page-to-table--fit.png) | `Default.aspx` → `dbo.Payment.sql` after Fit | `usesFirst` | `true` | `0.204` | Full 12-file chain left-to-right `Portal` → `Gateway` → `Hub` → `PaymentService` → `SqlServer` | Same 4 colliding hops |
| [estate-page-to-table--manual-unmirror.png](estate-page-to-table--manual-unmirror.png) | `Default.aspx` → `dbo.Payment.sql` after pressing Mirror | *(absent)* | `false` | `1.000` | `Default.aspx` held stationary at `307..539`, `262..485`; pins/legend swap back without rewriting `localStorage` | Same 4 colliding hops |
| [estate-way-down-portal-to-sqlserver--rest.png](estate-way-down-portal-to-sqlserver--rest.png) | World Map Way Down `portal` → `sqlserver` at rest | `usesFirst` | `true` | `1.000` | `Portal/Services/GatewayClient.cs`: `294..537`, `308..531` (whole) | `App.config` (`Hub`, `PaymentService`) |

## What the eye sees

- **Page → Table at rest (`estate-page-to-table--rest.png`):** Strip and 2D map agree left-to-right (`Default.aspx` → `portal.js` → `PaymentsController.cs`). Legend shows `Uses` (green, left) to `Offers` (blue, right) and the Mirror button is active. `Default.aspx` and its `Portal/Pages` folder label sit whole inside the unobstructed frame.
- **Table → Page at rest (`estate-table-to-page--rest.png`):** Compared with `2026-11-22/Screenshots/way-down/told-table-to-page--rest.png` (where `dbo.Payment.sql` was shoved beneath `#controls`), `dbo.Payment.sql` and its `Database/SqlServer` label sit completely clear above `.perspective-controls` and `#controls`, with `Payment.cs` and `PaymentService.cs` readable beside it and `App.config (PaymentService) is used by App.config (Hub)` disambiguated in the strip.
- **Fit on Page → Table (`estate-page-to-table--fit.png`):** All 12 files sweep cleanly left-to-right from `Portal` through `Gateway`, `Hub`, and `PaymentService` to `SqlServer`, matching the World Map board's left-to-right order.
- **Manual un-mirror (`estate-page-to-table--manual-unmirror.png`):** Pressing Mirror holds `Default.aspx` in place (`307..539`, `262..485`), flips its pin to the left edge with the wire entering from the left, restores the legend to `Offers` → `Uses`, and leaves `localStorage` untouched.
- **Way Down `portal` → `sqlserver` (`estate-way-down-portal-to-sqlserver--rest.png`):** Arrives mirrored at reading scale (`k = 1`, no exploration pull-back), framing `GatewayClient.cs` whole on the left and showing `PaymentsController.cs` and `GatewaySettings.cs` to its right with `App.config (Hub)` and `App.config (PaymentService)` distinguished on the strip.
