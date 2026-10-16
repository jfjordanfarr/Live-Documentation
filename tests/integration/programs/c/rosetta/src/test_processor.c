/**
 * @file test_processor.c
 * @brief Unit tests for the Processor module.
 *
 * This test file exercises name-matched test detection:
 * test_processor.c should automatically back processor.c.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include "processor.h"
#include "models.h"

static int tests_run = 0;
static int tests_passed = 0;

#define ASSERT(condition, message) do { \
    tests_run++; \
    if (condition) { \
        tests_passed++; \
        printf("  PASS: %s\n", message); \
    } else { \
        printf("  FAIL: %s\n", message); \
    } \
} while (0)

void test_run_processor_processes_records_and_fills_report(void) {
    printf("test_run_processor_processes_records_and_fills_report:\n");

    Record records[3];
    records[0] = create_record("A", 100.0);
    records[1] = create_record("B", 200.0);
    records[2] = create_record("C", 150.0);

    Report report;
    int status = run_processor(records, 3, NULL, &report);

    ASSERT(status == 0, "run_processor should succeed");
    ASSERT(fabs(report.total - 450.0) < 0.001, "total should be 450");
    ASSERT(fabs(report.average - 150.0) < 0.001, "average should be 150");
    ASSERT(report.record_count == 3, "should have 3 records");

    free_report(&report);
}

void test_run_processor_handles_empty_record_set(void) {
    printf("test_run_processor_handles_empty_record_set:\n");

    Report report;
    int status = run_processor(NULL, 0, NULL, &report);

    ASSERT(status == 0, "run_processor should succeed on no records");
    ASSERT(fabs(report.total - 0.0) < 0.001, "total should be 0");
    ASSERT(report.record_count == 0, "should have 0 records");

    free_report(&report);
}

void test_summarize_report_formats_report(void) {
    printf("test_summarize_report_formats_report:\n");

    Report report;
    report.total = 450.0;
    report.average = 150.0;
    report.records = NULL;
    report.record_count = 0;
    report.generated_at = 0;

    char summary[128];
    int written = summarize_report(&report, summary, sizeof summary);

    ASSERT(written > 0, "summarize_report should write something");
    ASSERT(strlen(summary) > 0, "summary should not be empty");
    ASSERT(strstr(summary, "450") != NULL, "summary should contain the total");
}

int main(void) {
    printf("=== Processor Tests ===\n\n");

    test_run_processor_processes_records_and_fills_report();
    test_run_processor_handles_empty_record_set();
    test_summarize_report_formats_report();

    printf("\n=== Results: %d/%d passed ===\n", tests_passed, tests_run);
    return tests_passed == tests_run ? 0 : 1;
}
