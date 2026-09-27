using System.Configuration;

namespace Estate.Gateway
{
    /// <summary>Which workload and environment this gateway deployment serves, from Web.config.</summary>
    public static class GatewaySettings
    {
        public const string WorkloadKey    = "Gateway.Workload";
        public const string EnvironmentKey = "Gateway.Environment";

        public static string Workload    => ConfigurationManager.AppSettings[WorkloadKey];
        public static string Environment => ConfigurationManager.AppSettings[EnvironmentKey];
    }
}
