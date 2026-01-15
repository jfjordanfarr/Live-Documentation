namespace Rosetta.Types;

/// <summary>
/// Configuration for processing operations.
/// </summary>
public record ProcessorConfig(int BatchSize, int Timeout, bool Strict);
