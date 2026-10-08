# tests/integration/programs/csharp/estate/Portal/Pages/Default.aspx.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Portal/Pages/Default.aspx.cs
- Generated At: 2026-10-02T20:20:05.246Z

## Authored
### Purpose
The page's code-behind: renders the server-authored values, whether payments are enabled and the gateway's base URL, into the hidden fields once on load. Nothing posts back; the script takes over from there.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../../tests/integration/programs/csharp/estate/README.md)). Its use of the two fields the designer file declares is the C# adapter's partial-class case, linking it to the designer peer; the hand-verified hop from the markup to it is the directive's.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Default` {#symbol-default}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/Pages/Default.aspx.cs#L10)
- Extends: `Page`

##### `Default` — Summary
Renders server-authored values into hidden fields once, on load. Nothing posts back;
portal.js reads the fields and talks to the portal's own Web API from then on.

#### `Page_Load` {#symbol-page_load}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/Pages/Default.aspx.cs#L12)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Globals`](../App_Code/Globals.cs.mdmd.md#symbol-globals)
- [`Default.aspx.designer.GatewayBaseUrlHidden`](./Default.aspx.designer.cs.mdmd.md#symbol-gatewaybaseurlhidden)
- [`Default.aspx.designer.PaymentsEnabledHidden`](./Default.aspx.designer.cs.mdmd.md#symbol-paymentsenabledhidden)
<!-- LIVE-DOC:END Dependencies -->
