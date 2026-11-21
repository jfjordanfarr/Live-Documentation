# `tests/integration/programs/csharp/estate/expected/csharp-compiler.json`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/programs/csharp/estate/expected/csharp-compiler.json`
- Generated At: 2026-11-21T07:25:48.456Z

## Authored
### Purpose
The C# compiler's binding of the `estate` C# sample, written by `npm run oracle:csharp -- tests/integration/programs/csharp/estate --write`: each project's references as MSBuild evaluated them, every edge a bound name makes by a type or only a member, and each file's declared type names. `csharp-oracle.test.ts` holds the C# adapter to it without .NET.

### Notes
- Never hand-edited. Regenerate with `oracle:csharp --write` after changing the program. First kept on 2026-11-21, in the joining of the readers ([the work item](../../../../../../../../AI-Agent-Workspace/Work/readers-on-main.md)), when the reader and the compiler agreed on every C# file pair of the sample, as scip-dotnet's record `compiler-edges.json` beside it does.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `tool` {#symbol-tool}
- Type: key

#### `projects` {#symbol-projects}
- Type: key

#### `files` {#symbol-files}
- Type: key

#### `names` {#symbol-names}
- Type: key

#### `bound` {#symbol-bound}
- Type: key

#### `edges` {#symbol-edges}
- Type: key

#### `declared` {#symbol-declared}
- Type: key

#### `declared:Contracts/IPaymentHub.cs` {#symbol-declaredcontractsipaymenthubcs}
- Type: key

#### `declared:Contracts/IPaymentService.cs` {#symbol-declaredcontractsipaymentservicecs}
- Type: key

#### `declared:Contracts/PaymentQuery.cs` {#symbol-declaredcontractspaymentquerycs}
- Type: key

#### `declared:Contracts/PaymentRequest.cs` {#symbol-declaredcontractspaymentrequestcs}
- Type: key

#### `declared:Contracts/PaymentResult.cs` {#symbol-declaredcontractspaymentresultcs}
- Type: key

#### `declared:Gateway/Controllers/PaymentsController.cs` {#symbol-declaredgatewaycontrollerspaymentscontrollercs}
- Type: key

#### `declared:Gateway/GatewaySettings.cs` {#symbol-declaredgatewaygatewaysettingscs}
- Type: key

#### `declared:Gateway/Wcf/HubProxy.cs` {#symbol-declaredgatewaywcfhubproxycs}
- Type: key

#### `declared:Hub/PaymentHub.cs` {#symbol-declaredhubpaymenthubcs}
- Type: key

#### `declared:Hub/ServiceRouting.cs` {#symbol-declaredhubserviceroutingcs}
- Type: key

#### `declared:PaymentService/Data/Payment.cs` {#symbol-declaredpaymentservicedatapaymentcs}
- Type: key

#### `declared:PaymentService/Data/PaymentsContext.cs` {#symbol-declaredpaymentservicedatapaymentscontextcs}
- Type: key

#### `declared:PaymentService/Data/PostPaymentRow.cs` {#symbol-declaredpaymentservicedatapostpaymentrowcs}
- Type: key

#### `declared:PaymentService/PaymentService.cs` {#symbol-declaredpaymentservicepaymentservicecs}
- Type: key

#### `declared:Portal/App_Code/Globals.cs` {#symbol-declaredportalapp_codeglobalscs}
- Type: key

#### `declared:Portal/Controllers/PaymentsController.cs` {#symbol-declaredportalcontrollerspaymentscontrollercs}
- Type: key

#### `declared:Portal/Models/PaymentRequestModel.cs` {#symbol-declaredportalmodelspaymentrequestmodelcs}
- Type: key

#### `declared:Portal/Models/PaymentResultModel.cs` {#symbol-declaredportalmodelspaymentresultmodelcs}
- Type: key

#### `declared:Portal/Pages/Default.aspx.cs` {#symbol-declaredportalpagesdefaultaspxcs}
- Type: key

#### `declared:Portal/Pages/Default.aspx.designer.cs` {#symbol-declaredportalpagesdefaultaspxdesignercs}
- Type: key

#### `declared:Portal/Services/GatewayClient.cs` {#symbol-declaredportalservicesgatewayclientcs}
- Type: key

#### `sources` {#symbol-sources}
- Type: key

#### `sources:Contracts/Contracts.csproj` {#symbol-sourcescontractscontractscsproj}
- Type: key

#### `sources:Contracts/IPaymentHub.cs` {#symbol-sourcescontractsipaymenthubcs}
- Type: key

#### `sources:Contracts/IPaymentService.cs` {#symbol-sourcescontractsipaymentservicecs}
- Type: key

#### `sources:Contracts/PaymentQuery.cs` {#symbol-sourcescontractspaymentquerycs}
- Type: key

#### `sources:Contracts/PaymentRequest.cs` {#symbol-sourcescontractspaymentrequestcs}
- Type: key

#### `sources:Contracts/PaymentResult.cs` {#symbol-sourcescontractspaymentresultcs}
- Type: key

#### `sources:Gateway/Controllers/PaymentsController.cs` {#symbol-sourcesgatewaycontrollerspaymentscontrollercs}
- Type: key

#### `sources:Gateway/Gateway.csproj` {#symbol-sourcesgatewaygatewaycsproj}
- Type: key

#### `sources:Gateway/GatewaySettings.cs` {#symbol-sourcesgatewaygatewaysettingscs}
- Type: key

#### `sources:Gateway/Wcf/HubProxy.cs` {#symbol-sourcesgatewaywcfhubproxycs}
- Type: key

#### `sources:Hub/Hub.csproj` {#symbol-sourceshubhubcsproj}
- Type: key

#### `sources:Hub/PaymentHub.cs` {#symbol-sourceshubpaymenthubcs}
- Type: key

#### `sources:Hub/ServiceRouting.cs` {#symbol-sourceshubserviceroutingcs}
- Type: key

#### `sources:PaymentService/Data/Payment.cs` {#symbol-sourcespaymentservicedatapaymentcs}
- Type: key

#### `sources:PaymentService/Data/PaymentsContext.cs` {#symbol-sourcespaymentservicedatapaymentscontextcs}
- Type: key

#### `sources:PaymentService/Data/PostPaymentRow.cs` {#symbol-sourcespaymentservicedatapostpaymentrowcs}
- Type: key

#### `sources:PaymentService/PaymentService.cs` {#symbol-sourcespaymentservicepaymentservicecs}
- Type: key

#### `sources:PaymentService/PaymentService.csproj` {#symbol-sourcespaymentservicepaymentservicecsproj}
- Type: key

#### `sources:Portal/App_Code/Globals.cs` {#symbol-sourcesportalapp_codeglobalscs}
- Type: key

#### `sources:Portal/Controllers/PaymentsController.cs` {#symbol-sourcesportalcontrollerspaymentscontrollercs}
- Type: key

#### `sources:Portal/Models/PaymentRequestModel.cs` {#symbol-sourcesportalmodelspaymentrequestmodelcs}
- Type: key

#### `sources:Portal/Models/PaymentResultModel.cs` {#symbol-sourcesportalmodelspaymentresultmodelcs}
- Type: key

#### `sources:Portal/Pages/Default.aspx.cs` {#symbol-sourcesportalpagesdefaultaspxcs}
- Type: key

#### `sources:Portal/Pages/Default.aspx.designer.cs` {#symbol-sourcesportalpagesdefaultaspxdesignercs}
- Type: key

#### `sources:Portal/Portal.csproj` {#symbol-sourcesportalportalcsproj}
- Type: key

#### `sources:Portal/Services/GatewayClient.cs` {#symbol-sourcesportalservicesgatewayclientcs}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
