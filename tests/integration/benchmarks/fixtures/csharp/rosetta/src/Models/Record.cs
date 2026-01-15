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
}
