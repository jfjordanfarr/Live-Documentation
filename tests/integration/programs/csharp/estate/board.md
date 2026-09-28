# Payments estate

## Metadata
- Layer: 3

## Authored
### Purpose
The consumer payment path from the portal to the ledger, as the business asks about it: a cloud portal and gateway, an on-prem hub and service, SQL Server, and the Oracle database behind it.

### Notes
Written by hand as the first board. The integration tests generate the docs over a copy of this fixture, join this board to them, and check that every remote hand-verified edge appears as a wire between two things here. Nothing in this file is a scan.

## Declared

### Things

#### `CLOUD`
- Kind: cloud
- Holds: `portal`, `gateway`

#### `ON-PREM`
- Kind: on-prem
- Holds: `hub`, `payments`, `sqlserver`, `oracle`

#### `portal`
- Kind: web
- From: `Portal`

#### `gateway`
- Kind: web
- From: `Gateway`

#### `contracts`
- Kind: library
- From: `Contracts`

#### `hub`
- Kind: service
- From: `Hub`

#### `payments`
- Kind: service
- From: `PaymentService`

#### `sqlserver`
- Kind: database
- From: `Database/SqlServer`

#### `oracle`
- Kind: database
- From: `Database/Oracle`
- Serves: `CENTRAL.ACCOUNT` (table)

### Connections
- `CLOUD` to `ON-PREM` over `IPsec tunnel`

## Layout
- `portal` at 1, 1
- `gateway` at 4, 1
- `contracts` at 7, 4
- `hub` at 10, 1
- `payments` at 13, 1
- `sqlserver` at 16, 1
- `oracle` at 19, 1
