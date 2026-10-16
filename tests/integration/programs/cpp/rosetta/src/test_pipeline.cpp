/**
 * @file test_pipeline.cpp
 * @brief Integration tests for the complete data processing pipeline.
 *
 * This test file exercises NON-name-matched test detection:
 * test_pipeline.cpp includes processor and models, so those files
 * should appear as "test-backed" in the Explorer even without
 * a directly name-matched test file.
 */

#include <cmath>
#include <cstdio>
#include <optional>
#include <string>
#include <vector>
#include "processor.hpp"
#include "models.hpp"
#include "types.hpp"

namespace {

int tests_run = 0;
int tests_passed = 0;

void check(bool condition, const char* message) {
    tests_run++;
    if (condition) {
        tests_passed++;
        std::printf("  PASS: %s\n", message);
    } else {
        std::printf("  FAIL: %s\n", message);
    }
}

void test_processes_records_through_complete_pipeline() {
    std::printf("test_processes_records_through_complete_pipeline:\n");

    // Create test records using the models factory
    std::vector<rosetta::Record> records;
    records.push_back(rosetta::create_record("Alpha", 100.0));
    records.push_back(rosetta::create_record("Beta", 200.0));
    records.push_back(rosetta::create_record("Gamma", 300.0));

    // Process through the processor
    const std::optional<rosetta::Report> report = rosetta::run_processor(records, nullptr);

    // Verify report structure
    check(report.has_value(), "run_processor should produce a report");
    check(report && std::fabs(report->total - 600.0) < 0.001, "total should be 600");
    check(report && std::fabs(report->average - 200.0) < 0.001, "average should be 200");
    check(report && report->records.size() == 3, "should have 3 records");

    // Verify summarization
    const std::string summary = report ? rosetta::summarize_report(*report) : "";
    check(summary.find("600") != std::string::npos, "summary should contain '600'");
}

void test_validates_configuration_before_processing() {
    std::printf("test_validates_configuration_before_processing:\n");

    const rosetta::ProcessorConfig valid_config{100, 5000, true};
    const rosetta::ProcessorConfig invalid_config{-1, 0, false};

    check(rosetta::validate_config(valid_config), "valid config should pass");
    check(!rosetta::validate_config(invalid_config), "invalid config should fail");
    check(!rosetta::run_processor({}, &invalid_config).has_value(), "processing under an invalid config should fail");
}

void test_handles_edge_cases_in_pipeline() {
    std::printf("test_handles_edge_cases_in_pipeline:\n");

    // Empty input
    const std::optional<rosetta::Report> empty_report = rosetta::run_processor({}, nullptr);
    check(empty_report && std::fabs(empty_report->total - 0.0) < 0.001, "empty total should be 0");

    // Single record
    const std::vector<rosetta::Record> single_record{rosetta::create_record("Solo", 42.0)};
    const std::optional<rosetta::Report> single_report = rosetta::run_processor(single_record, nullptr);
    check(single_report && std::fabs(single_report->average - 42.0) < 0.001, "single average should be 42");
}

}  // namespace

int main() {
    std::printf("=== Pipeline Integration Tests ===\n\n");

    test_processes_records_through_complete_pipeline();
    test_validates_configuration_before_processing();
    test_handles_edge_cases_in_pipeline();

    std::printf("\n=== Results: %d/%d passed ===\n", tests_passed, tests_run);
    return tests_passed == tests_run ? 0 : 1;
}
