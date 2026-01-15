// Demonstrate using alias - a challenging import pattern for adapters
using RTypes = Rosetta.Types;
using Rosetta.Models;
using Rosetta.Helpers;

namespace Rosetta.Processor;

/// <summary>
/// Core processing logic for the Rosetta benchmark fixture.
/// 
/// This module exercises multiple import patterns:
/// - Using alias: <c>using RTypes = Rosetta.Types</c>
/// - Namespace imports: <c>using Rosetta.Models</c>
/// - Static imports from Helpers
/// </summary>
public static class Processor
{
    /// <summary>
    /// Default configuration for processing.
    /// </summary>
    private static readonly RTypes.ProcessorConfig DefaultConfig = 
        new(BatchSize: 100, Timeout: 5000, Strict: true);

    /// <summary>
    /// Processes a batch of records and generates a report.
    /// 
    /// Uses namespace alias (RTypes) to access ProcessorConfig,
    /// demonstrating how adapters should handle aliased imports.
    /// </summary>
    /// <param name="records">Records to process</param>
    /// <param name="config">Optional processing configuration</param>
    /// <returns>Summary report of processed records</returns>
    /// <exception cref="ArgumentException">Thrown when configuration is invalid</exception>
    public static Report Run(IEnumerable<Record> records, RTypes.ProcessorConfig? config = null)
    {
        config ??= DefaultConfig;

        if (!ModelFactory.ValidateConfig(config))
        {
            throw new ArgumentException("Invalid processor configuration");
        }

        var recordList = records.ToList();
        var values = recordList.Select(r => r.Value);
        var total = Helpers.Helpers.Sum(values);
        var avg = Helpers.Helpers.Average(recordList.Select(r => r.Value));

        return new Report(total, avg, recordList);
    }

    /// <summary>
    /// Creates a formatted summary string from a report.
    /// </summary>
    /// <param name="report">Report to summarize</param>
    /// <returns>Human-readable summary</returns>
    public static string Summarize(Report report) =>
        $"Total: {Helpers.Helpers.Format(report.Total)}, Average: {Helpers.Helpers.Format(report.Average)}, Count: {report.Records.Count}";
}
