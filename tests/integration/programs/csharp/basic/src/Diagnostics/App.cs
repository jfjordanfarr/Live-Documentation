using Diagnostics.Data;
using Diagnostics.Models;
using Diagnostics.Services;

namespace Diagnostics.App;

public static class App
{
    public static void Run()
    {
    Repository repository = new();
    Formatter formatter = new();
    ReportService service = new(repository, formatter);

    Record record = repository.GetLatest();
    FormattedReport report = service.Process(record);
        formatter.Render(report);
    }
}
