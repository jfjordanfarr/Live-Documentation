# tests/integration/programs/csharp/estate/Portal/Pages/Default.aspx

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Portal/Pages/Default.aspx
- Generated At: 2026-10-02T20:20:05.227Z

## Authored
### Purpose
The portal's one page: a server form with two hidden fields the code-behind fills on load, the payment form the script drives, a status line, and the script tag that loads `portal.js`.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../../tests/integration/programs/csharp/estate/README.md)). Read by the ASP.NET markup adapter: the `@ Page` directive's `CodeBehind` and `Inherits` link it to the code-behind, the script tag to the script, and its element ids are its public symbols, so that the script's `getElementById` calls and the designer's fields have somewhere to land. The designer file's hop to those ids is one of the three the estate keeps missing.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GatewayBaseUrlHidden` {#symbol-gatewaybaseurlhidden}
- Type: variable

#### `paymentForm` {#symbol-paymentform}
- Type: variable

#### `PaymentsEnabledHidden` {#symbol-paymentsenabledhidden}
- Type: variable

#### `paymentStatus` {#symbol-paymentstatus}
- Type: variable

#### `serverForm` {#symbol-serverform}
- Type: variable
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Default.aspx`](./Default.aspx.cs.mdmd.md)
- [`portal`](../Scripts/portal.js.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
