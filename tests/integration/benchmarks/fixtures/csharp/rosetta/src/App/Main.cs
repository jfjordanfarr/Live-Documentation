using Rosetta.Models;
using Rosetta.Processor;

namespace Rosetta.App;

/// <summary>
/// Entry point for the Rosetta benchmark fixture.
/// 
/// Demonstrates selective imports and serves as the
/// root node of the dependency graph.
/// </summary>
public static class Main
{
    /// <summary>
    /// Executes the Rosetta data pipeline.
    /// </summary>
    /// <param name="seed">Starting seed value for generating records</param>
    /// <returns>Formatted summary of the processing results</returns>
    public static string Run(int seed)
    {
        // Create test records using the factory
        var records = new[]
        {
            ModelFactory.CreateRecord("alpha", seed),
            ModelFactory.CreateRecord("beta", seed * 2),
            ModelFactory.CreateRecord("gamma", seed * 3)
        };

        // Process and generate report
        Report report = Processor.Processor.Run(records);

        // Return human-readable summary
        return Processor.Processor.Summarize(report);
    }
}
