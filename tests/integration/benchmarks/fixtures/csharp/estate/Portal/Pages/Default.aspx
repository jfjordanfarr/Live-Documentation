<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="Estate.Portal.Pages.Default" %>
<!DOCTYPE html>
<html>
<head runat="server">
  <title>Payments</title>
</head>
<body>
  <form id="serverForm" runat="server">
    <asp:HiddenField ID="PaymentsEnabledHidden" runat="server" />
    <asp:HiddenField ID="GatewayBaseUrlHidden"  runat="server" />
  </form>
  <form id="paymentForm">
    <input name="accountNumber" type="text" />
    <input name="amount"        type="number" step="0.01" />
    <button type="submit">Pay</button>
  </form>
  <p id="paymentStatus"></p>
  <script src="../Scripts/portal.js"></script>
</body>
</html>
