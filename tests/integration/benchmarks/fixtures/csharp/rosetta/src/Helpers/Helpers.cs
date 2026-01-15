using System.Globalization;
using System.Text.RegularExpressions;

namespace Rosetta.Helpers;

/// <summary>
/// Utility helpers for the Rosetta benchmark fixture.
/// 
/// Pure functions with no external dependencies - testing
/// that adapters correctly identify leaf nodes in the graph.
/// </summary>
public static partial class Helpers
{
    private static readonly Regex IdPattern = GetIdPattern();

    /// <summary>
    /// Formats a numeric value for display.
    /// </summary>
    public static string Format(double value) =>
        value.ToString("N2", CultureInfo.InvariantCulture);

    /// <summary>
    /// Validates that a string is a valid identifier.
    /// </summary>
    public static bool Validate(string input) =>
        IdPattern.IsMatch(input);

    /// <summary>
    /// Computes the sum of numeric values.
    /// </summary>
    public static double Sum(IEnumerable<double> values) =>
        values.Sum();

    /// <summary>
    /// Computes the average of numeric values.
    /// </summary>
    public static double Average(IEnumerable<double> values)
    {
        var list = values.ToList();
        return list.Count == 0 ? 0.0 : Sum(list) / list.Count;
    }

    [GeneratedRegex(@"^[a-zA-Z][a-zA-Z0-9_-]*$")]
    private static partial Regex GetIdPattern();
}
