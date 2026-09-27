# tests/integration/benchmarks/fixtures/csharp/estate/PaymentService/Data/PaymentsContext.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/csharp/estate/PaymentService/Data/PaymentsContext.cs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-csharp-estate-paymentservice-data-paymentscontext-cs
- Generated At: 2026-09-27T10:09:18.499Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T10:09:18.499Z","inputHash":"e54a1472279bce98"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PaymentsContext (class)` {#symbol-paymentscontext-class}
- Type: class
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/PaymentService/Data/PaymentsContext.cs#L12)
- Extends: `DbContext`

##### `PaymentsContext (class)` — Summary
Entity Framework context over the on-prem Payments database. The connection string
is App.config's "PaymentsDb". Posting a payment calls dbo.usp_PostPayment, which is
where the linked-server read of the Oracle account balance happens.

#### `ConnectionName` {#symbol-connectionname}
- Type: field
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/PaymentService/Data/PaymentsContext.cs#L14)

#### `PostPaymentProcedure` {#symbol-postpaymentprocedure}
- Type: field
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/PaymentService/Data/PaymentsContext.cs#L15)

#### `PaymentsContext (constructor)` {#symbol-paymentscontext-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/PaymentService/Data/PaymentsContext.cs#L17)

#### `Payments` {#symbol-payments}
- Type: property
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/PaymentService/Data/PaymentsContext.cs#L21)

#### `PostPayment` {#symbol-postpayment}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/PaymentService/Data/PaymentsContext.cs#L23)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
