using Rosetta.Types;

namespace Rosetta.Models;

/// <summary>
/// A data record to be processed.
/// </summary>
public class Record : Entry
{
    public double Value { get; }
    public List<string> Tags { get; }

    public Record(string id, double value) 
        : base(id, DateTime.UtcNow, Status.Pending)
    {
        Value = value;
        Tags = new List<string>();
    }

    /// <summary>
    /// Factory method for creating records with sensible defaults.
    /// </summary>
    public static Record Create(int id, string name, double value) => 
        new($"{name}-{id}", value);

    /// <summary>
    /// Validates configuration is within acceptable bounds.
    /// Delegates to ModelFactory.ValidateConfig for actual validation.
    /// </summary>
    public static bool ValidateConfig(ProcessorConfig config) =>
        ModelFactory.ValidateConfig(config);
}
