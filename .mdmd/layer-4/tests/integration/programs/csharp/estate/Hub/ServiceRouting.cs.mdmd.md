# tests/integration/programs/csharp/estate/Hub/ServiceRouting.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Hub/ServiceRouting.cs
- Generated At: 2026-10-02T20:20:05.003Z

## Authored
### Purpose
Names the client endpoint that serves a workload and environment: the prefix `PaymentService`, the workload and the environment, joined with dots, which is how `App.config` names its client endpoints.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). The name exists only at run time, which is the point: an endpoint name no scan reads is the estate's reminder that a hand-verified hop may stay missing honestly.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ServiceRouting` {#symbol-servicerouting}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Hub/ServiceRouting.cs#L4)

##### `ServiceRouting` — Summary
Names the client endpoint (App.config, system.serviceModel/client) that serves a workload and environment.

#### `EndpointPrefix` {#symbol-endpointprefix}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Hub/ServiceRouting.cs#L6)

#### `EndpointNameFor` {#symbol-endpointnamefor}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Hub/ServiceRouting.cs#L8)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
