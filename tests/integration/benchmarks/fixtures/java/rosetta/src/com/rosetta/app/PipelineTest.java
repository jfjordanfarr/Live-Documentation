package com.rosetta.app;

import com.rosetta.models.ModelFactory;
import com.rosetta.models.Record;
import com.rosetta.models.Report;
import com.rosetta.processor.Processor;
import com.rosetta.types.ProcessorConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for the complete data processing pipeline.
 *
 * This test file exercises NON-name-matched test detection:
 * PipelineTest.java imports Processor and Record/Report, so those files
 * should appear as "test-backed" in the Explorer even without
 * a directly name-matched test file.
 */
public class PipelineTest {

    @Nested
    @DisplayName("Pipeline Integration")
    class PipelineIntegration {

        @Test
        @DisplayName("processes records through complete pipeline")
        void processesRecordsThroughCompletePipeline() {
            // Create test records using models factory
            List<Record> records = Arrays.asList(
                    Record.create(1, "Alpha", 100.0),
                    Record.create(2, "Beta", 200.0),
                    Record.create(3, "Gamma", 300.0));

            // Process through processor
            Report report = Processor.run(records, null);

            // Verify report structure
            assertEquals(600.0, report.getTotal(), 0.001);
            assertEquals(200.0, report.getAverage(), 0.001);
            assertEquals(3, report.getRecords().size());

            // Verify summarization
            String summary = Processor.summarize(report);
            assertTrue(summary.contains("600"));
        }

        @Test
        @DisplayName("validates configuration before processing")
        void validatesConfigurationBeforeProcessing() {
            ProcessorConfig validConfig = new ProcessorConfig(100, 5000, true);
            ProcessorConfig invalidConfig = new ProcessorConfig(-1, 0, false);

            assertTrue(ModelFactory.validateConfig(validConfig));
            assertFalse(ModelFactory.validateConfig(invalidConfig));
        }

        @Test
        @DisplayName("handles edge cases in pipeline")
        void handlesEdgeCasesInPipeline() {
            // Empty input
            Report emptyReport = Processor.run(Collections.emptyList(), null);
            assertEquals(0.0, emptyReport.getTotal(), 0.001);

            // Single record
            List<Record> singleRecord = Arrays.asList(Record.create(1, "Solo", 42.0));
            Report singleReport = Processor.run(singleRecord, null);
            assertEquals(42.0, singleReport.getAverage(), 0.001);
        }
    }
}
