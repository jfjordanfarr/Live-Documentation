"""A small .NET Framework web project whose references are spelled in another case than its files are."""
import os
import sys

out = sys.argv[1]
FILES = {
    "Shop.Web/web.config": """<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <connectionStrings>
    <add name="ShopDb" connectionString="Server=SQL01;Database=Shop" providerName="System.Data.SqlClient" />
  </connectionStrings>
  <appSettings>
    <add key="AuditMode" value="Full" />
  </appSettings>
</configuration>
""",
    "Shop.Web/Repository.cs": """using System.Configuration;
namespace Shop.Web
{
    public class Repository
    {
        public string Connection => ConfigurationManager.ConnectionStrings["ShopDb"].ConnectionString;
        public string Audit => ConfigurationManager.AppSettings["AuditMode"];
    }
}
""",
    "Shop.Web/Pages/Default.aspx": """<%@ Page Language="C#" CodeBehind="default.aspx.cs" Inherits="Shop.Web.Pages.DefaultPage" %>
<html><body><form runat="server"></form></body></html>
""",
    "Shop.Web/Pages/Default.aspx.cs": """namespace Shop.Web.Pages
{
    public partial class DefaultPage : System.Web.UI.Page { }
}
""",
    "Shop.Web/Shop.Web.csproj": """<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup><TargetFramework>net48</TargetFramework></PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\\shop.data\\shop.data.csproj" />
  </ItemGroup>
</Project>
""",
    "Shop.Data/Shop.Data.csproj": """<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup><TargetFramework>net48</TargetFramework></PropertyGroup>
</Project>
""",
    "Scripts/Deploy.ps1": """. "$PSScriptRoot\\common.ps1"
Invoke-Common
""",
    "Scripts/Common.ps1": """function Invoke-Common { }
""",
    "Vendor/Lib.cs": """namespace Vendor { public class Lib { } }
""",
    ".live-docs.config.json": """{ "exclude": ["vendor/**"] }
""",
}
for relative, text in FILES.items():
    target = os.path.join(out, relative)
    os.makedirs(os.path.dirname(target), exist_ok=True)
    with open(target, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(text)
