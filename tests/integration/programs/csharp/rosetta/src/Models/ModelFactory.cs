using Rosetta.Types;

namespace Rosetta.Models;

/// <summary>
/// Factory and validation utilities for domain models.
/// </summary>
public static class ModelFactory
{
    /// <summary>
    /// Factory for creating records with sensible defaults.
    /// </summary>
    public static Record CreateRecord(string id, double value) => new(id, value);

    /// <summary>
    /// Validates configuration is within acceptable bounds.
    /// </summary>
    public static bool ValidateConfig(ProcessorConfig config) =>
        config.BatchSize > 0 && 
        config.Timeout > 0 && 
        config.BatchSize <= 1000;
}
