namespace Estate.Hub
{
    /// <summary>Names the client endpoint (App.config, system.serviceModel/client) that serves a workload and environment.</summary>
    public static class ServiceRouting
    {
        public const string EndpointPrefix = "PaymentService";

        public static string EndpointNameFor(string workload, string environment)
        {
            return EndpointPrefix + "." + workload + "." + environment;
        }
    }
}
