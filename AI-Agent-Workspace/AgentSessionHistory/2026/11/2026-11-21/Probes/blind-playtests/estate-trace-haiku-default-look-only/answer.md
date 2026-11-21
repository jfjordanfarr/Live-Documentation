Based on the map, a payment goes through these pieces in order:

1. **portal** (web, cloud): the web page that receives the submission.
2. **gateway** (web, cloud): its `POST api/payments` endpoint takes the request and calls hub. This hop crosses from cloud to on-prem over the IPsec tunnel.
3. **hub** (service, on-prem): forwards the request to payments.
4. **payments** (service, on-prem, `PaymentService`): handles the payment and calls sqlserver.
5. **sqlserver** (database, on-prem): stores the payment. It offers `dbo.Payment` and the `dbo.usp_PostPayment` procedure, so `dbo.Payment` is where the payment is stored.
6. **oracle** (database, on-prem): sqlserver calls it, and it offers `CENTRAL.ACCOUNT`. The map doesn't say what gets written there.

This comes from the static call relationships shown in the hover tooltips, not from a live trace, so the map can't confirm what happens at runtime. I didn't change anything in the map. I only hovered over and clicked nodes and switched between the World Map and Local Map tabs.
