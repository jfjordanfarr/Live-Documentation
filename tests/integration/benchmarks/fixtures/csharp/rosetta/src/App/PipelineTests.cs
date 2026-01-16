using System.Collections.Generic;
using Xunit;
using Rosetta.Models;
using Rosetta.Processor;
using Rosetta.Types;

namespace Rosetta.App.Tests
{
    /// <summary>
    /// Integration tests for the complete data processing pipeline.
    ///
    /// This test file exercises NON-name-matched test detection:
    /// PipelineTests.cs imports Processor and Record/Report, so those files
    /// should appear as "test-backed" in the Explorer even without
    /// a directly name-matched test file.
    /// </summary>
    public class PipelineTests
    {
        public class PipelineIntegration
        {
            [Fact]
            public void ProcessesRecordsThroughCompletePipeline()
            {
                // Create test records using models factory
                var records = new List<Record>
                {
                    Record.Create(1, "Alpha", 100.0),
                    Record.Create(2, "Beta", 200.0),
                    Record.Create(3, "Gamma", 300.0)
                };

                // Process through processor
                var report = Processor.Processor.Run(records, null);

                // Verify report structure
                Assert.Equal(600.0, report.Total, 3);
                Assert.Equal(200.0, report.Average, 3);
                Assert.Equal(3, report.Records.Count);

                // Verify summarization
                var summary = Processor.Processor.Summarize(report);
                Assert.Contains("600", summary);
            }

            [Fact]
            public void ValidatesConfigurationBeforeProcessing()
            {
                var validConfig = new ProcessorConfig(100, 5000, true);
                var invalidConfig = new ProcessorConfig(-1, 0, false);

                Assert.True(Record.ValidateConfig(validConfig));
                Assert.False(Record.ValidateConfig(invalidConfig));
            }

            [Fact]
            public void HandlesEdgeCasesInPipeline()
            {
                // Empty input
                var emptyReport = Processor.Processor.Run(new List<Record>(), null);
                Assert.Equal(0.0, emptyReport.Total, 3);

                // Single record
                var singleRecord = new List<Record> { Record.Create(1, "Solo", 42.0) };
                var singleReport = Processor.Processor.Run(singleRecord, null);
                Assert.Equal(42.0, singleReport.Average, 3);
            }
        }
    }
}
