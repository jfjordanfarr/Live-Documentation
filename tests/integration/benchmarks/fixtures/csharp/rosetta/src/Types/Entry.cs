namespace Rosetta.Types;

/// <summary>
/// A timestamped entry in the data pipeline.
/// </summary>
public class Entry
{
    public string Id { get; }
    public DateTime Timestamp { get; }
    public Status Status { get; }

    public Entry(string id, DateTime timestamp, Status status)
    {
        Id = id;
        Timestamp = timestamp;
        Status = status;
    }
}
