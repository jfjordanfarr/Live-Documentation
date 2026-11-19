# A cycle's returning connection, as a blind tester saw it

Historical evidence, November 19, 2026 (UTC). The owner asked for "specific screenshots just to make sure we're talking about the same thing" ([Turn 22 of the day's record](../../2026-11-18.1.record.md#turn-22)), of the playtests' finding that half the testers read a cycle's returning connection as a file linking to itself. Both pictures are enlargements, four times, cut from [the picture one tester was shown](../../Probes/blind-playtests/estate-directory-opus-medium-look-only-2/shots/006-click.png): the estate sample's 2D Local Map with the directories `PaymentService` and `PaymentService/Data` opened, at 1280 by 800.

| Picture | What it shows |
| --- | --- |
| [01-app-config-returning-connection.png](01-app-config-returning-connection.png) | `App.config`: a short green line leaves its left port and curls back to the same port, over the words "1 connection returns in a cycle". The connection it stands for comes from `PaymentService.cs`. |
| [02-paymentservice-returning-connection.png](02-paymentservice-returning-connection.png) | `PaymentService.cs`: the other end of the same connection, a short blue line curling from its right port back to itself, over the same words. |

The cycle is `PaymentService.cs` to `PaymentsContext.cs` to `App.config` and back to `PaymentService.cs`. Neither stub says which file the connection goes to or comes from; [the playtests' record](../../Probes/blind-playtests/README.md) has the testers' readings.
