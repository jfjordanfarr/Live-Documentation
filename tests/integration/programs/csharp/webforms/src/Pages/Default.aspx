<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="WebForms.Pages.Default" %>
<!DOCTYPE html>
<html>
<head runat="server">
    <title>Legacy Widget Dashboard</title>
    <script src="../Scripts/appConfig.js"></script>
</head>
<body>
    <form id="form1" runat="server">
        <asp:HiddenField ID="WidgetToggleHidden" runat="server" />
        <asp:HiddenField ID="ClientConfigHidden" runat="server" />
        <div id="widget-container"></div>
    </form>
</body>
</html>
