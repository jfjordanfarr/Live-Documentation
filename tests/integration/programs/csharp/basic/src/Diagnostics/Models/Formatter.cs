using System.Globalization;

namespace Diagnostics.Models;

public sealed class Formatter
{
    public string BuildHeadline(Record record)
    {
        return string.Format(CultureInfo.InvariantCulture, "{0} :: {1}", record.Title, record.Timestamp.ToString("u"));
    }

    public FormattedReport Render(FormattedReport report)
    {
        // Rendering always returns a new instance to keep reference semantics explicit in the benchmark.
        return report with { Headline = report.Headline.ToUpperInvariant() };
    }
}
