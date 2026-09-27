using Diagnostics.Data;
using Diagnostics.Models;

namespace Diagnostics.Services;

public sealed class ReportService
{
    private readonly Repository _repository;
    private readonly Formatter _formatter;

    public ReportService(Repository repository, Formatter formatter)
    {
        _repository = repository;
        _formatter = formatter;
    }

    public FormattedReport Process(Record record)
    {
        var headline = _formatter.BuildHeadline(record);
        return new FormattedReport(headline, record);
    }

    public FormattedReport ProcessLatest()
    {
        var record = _repository.GetLatest();
        return Process(record);
    }
}
