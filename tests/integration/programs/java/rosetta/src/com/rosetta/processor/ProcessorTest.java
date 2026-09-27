package com.rosetta.processor;

import com.rosetta.models.Record;
import com.rosetta.models.Report;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for the Processor class.
 *
 * This test file exercises name-matched test detection:
 * ProcessorTest.java should automatically back Processor.java.
 */
public class ProcessorTest {

    @Nested
    @DisplayName("run()")
    class RunTests {

        @Test
        @DisplayName("processes records and returns report")
        void processesRecordsAndReturnsReport() {
            List<Record> records = Arrays.asList(
                Record.create(1, "A", 100.0),
                Record.create(2, "B", 200.0),
                Record.create(3, "C", 150.0)
            );

            Report report = Processor.run(records, null);

            assertEquals(450.0, report.getTotal(), 0.001);
            assertEquals(150.0, report.getAverage(), 0.001);
            assertEquals(3, report.getRecords().size());
        }

        @Test
        @DisplayName("handles empty record set")
        void handlesEmptyRecordSet() {
            Report report = Processor.run(Collections.emptyList(), null);

            assertEquals(0.0, report.getTotal(), 0.001);
            assertEquals(0, report.getRecords().size());
        }
    }

    @Nested
    @DisplayName("summarize()")
    class SummarizeTests {

        @Test
        @DisplayName("formats report as human-readable string")
        void formatsReportAsHumanReadableString() {
            Report report = new Report(450.0, 150.0, Collections.emptyList());

            String summary = Processor.summarize(report);

            assertNotNull(summary);
            assertFalse(summary.isEmpty());
        }
    }
}
