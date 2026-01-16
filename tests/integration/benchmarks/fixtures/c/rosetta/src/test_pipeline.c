/**
 * @file test_pipeline.c
 * @brief Integration tests for the complete data processing pipeline.
 *
 * This test file exercises NON-name-matched test detection:
 * test_pipeline.c imports processor and models, so those files
 * should appear as "test-backed" in the Explorer even without
 * a directly name-matched test file.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include "processor.h"
#include "models.h"
#include "types.h"

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

void test_processes_records_through_complete_pipeline(void) {
    printf("test_processes_records_through_complete_pipeline:\n");

    /* Create test records using models factory */
    Record records[3];
    records[0] = create_record(1, "Alpha", 100.0);
    records[1] = create_record(2, "Beta", 200.0);
    records[2] = create_record(3, "Gamma", 300.0);

    /* Process through processor */
    Report report = run(records, 3, NULL);

    /* Verify report structure */
    ASSERT(fabs(report.total - 600.0) < 0.001, "total should be 600");
    ASSERT(fabs(report.average - 200.0) < 0.001, "average should be 200");
    ASSERT(report.record_count == 3, "should have 3 records");

    /* Verify summarization */
    char* summary = summarize(&report);
    ASSERT(strstr(summary, "600") != NULL, "summary should contain '600'");
    free(summary);
}

void test_validates_configuration_before_processing(void) {
    printf("test_validates_configuration_before_processing:\n");

    ProcessorConfig valid_config = {100, 5000, 1};
    ProcessorConfig invalid_config = {-1, 0, 0};

    ASSERT(validate_config(&valid_config) == 1, "valid config should pass");
    ASSERT(validate_config(&invalid_config) == 0, "invalid config should fail");
}

void test_handles_edge_cases_in_pipeline(void) {
    printf("test_handles_edge_cases_in_pipeline:\n");

    /* Empty input */
    Report empty_report = run(NULL, 0, NULL);
    ASSERT(fabs(empty_report.total - 0.0) < 0.001, "empty total should be 0");

    /* Single record */
    Record single_record[1];
    single_record[0] = create_record(1, "Solo", 42.0);
    Report single_report = run(single_record, 1, NULL);
    ASSERT(fabs(single_report.average - 42.0) < 0.001, "single average should be 42");
}

int main(void) {
    printf("=== Pipeline Integration Tests ===\n\n");

    test_processes_records_through_complete_pipeline();
    test_validates_configuration_before_processing();
    test_handles_edge_cases_in_pipeline();

    printf("\n=== Results: %d/%d passed ===\n", tests_passed, tests_run);
    return tests_passed == tests_run ? 0 : 1;
}
