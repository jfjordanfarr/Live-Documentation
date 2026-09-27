// Drives the payment form without postbacks. Server-authored values arrive through
// the hidden fields that Default.aspx.cs fills on load.
(function () {
  "use strict";

  function serverValue(id) {
    return document.getElementById(id).value;
  }

  var paymentsEnabled = serverValue("PaymentsEnabledHidden") === "True";
  var gatewayBaseUrl  = serverValue("GatewayBaseUrlHidden");

  function postPayment(accountNumber, amount) {
    return fetch("api/payments", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ accountNumber: accountNumber, amount: amount })
    }).then(function (response) { return response.json(); });
  }

  function getPayment(paymentId) {
    return fetch("api/payments/" + encodeURIComponent(paymentId))
      .then(function (response) { return response.json(); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("paymentForm");
    if (!paymentsEnabled) {
      form.hidden = true;
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      postPayment(form.elements.accountNumber.value, Number(form.elements.amount.value))
        .then(function (result) {
          document.getElementById("paymentStatus").textContent =
            result.status + " (balance " + result.accountBalance + ")";
        });
    });
  });

  window.estatePortal = { postPayment: postPayment, getPayment: getPayment, gatewayBaseUrl: gatewayBaseUrl };
})();
