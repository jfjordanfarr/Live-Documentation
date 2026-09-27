using System;
using System.Collections.Generic;

using Diagnostics.Models;

namespace Diagnostics.Data;

public sealed class Repository
{
    private readonly List<Record> _records =
    [
        new Record("Initial sync", "Seed data imported", DateTimeOffset.UtcNow.AddDays(-2)),
        new Record("Second sync", "Metrics recalculated", DateTimeOffset.UtcNow.AddDays(-1))
    ];

    public Record GetLatest()
    {
        return _records[^1];
    }
}
