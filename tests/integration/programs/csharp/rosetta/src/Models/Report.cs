namespace Rosetta.Models;

/// <summary>
/// Summary report produced by the processor.
/// </summary>
public class Report
{
    public double Total { get; }
    public double Average { get; }
    public IReadOnlyList<Record> Records { get; }
    public DateTime GeneratedAt { get; }

    public Report(double total, double average, IEnumerable<Record> records)
    {
        Total = total;
        Average = average;
        Records = records.ToList().AsReadOnly();
        GeneratedAt = DateTime.UtcNow;
    }
}
