using System.Collections.Generic;
using Xunit;
using Rosetta.Models;
using Rosetta.Processor;

namespace Rosetta.Processor.Tests
{
    /// <summary>
    /// Unit tests for the Processor class.
    ///
    /// This test file exercises name-matched test detection:
    /// ProcessorTests.cs should automatically back Processor.cs.
    /// </summary>
    public class ProcessorTests
    {
        public class RunTests
        {
            [Fact]
            public void ProcessesRecordsAndReturnsReport()
            {
                var records = new List<Record>
                {
                    Record.Create(1, "A", 100.0),
                    Record.Create(2, "B", 200.0),
                    Record.Create(3, "C", 150.0)
                };

                var report = Processor.Run(records, null);

                Assert.Equal(450.0, report.Total, 3);
                Assert.Equal(150.0, report.Average, 3);
                Assert.Equal(3, report.Records.Count);
            }

            [Fact]
            public void HandlesEmptyRecordSet()
            {
                var report = Processor.Run(new List<Record>(), null);

                Assert.Equal(0.0, report.Total, 3);
                Assert.Empty(report.Records);
            }
        }

        public class SummarizeTests
        {
            [Fact]
            public void FormatsReportAsHumanReadableString()
            {
                var report = new Report(450.0, 150.0, new List<Record>());

                var summary = Processor.Summarize(report);

                Assert.NotNull(summary);
                Assert.NotEmpty(summary);
            }
        }
    }
}
