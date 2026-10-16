/**
 * @file test_processor.cpp
 * @brief Unit tests for the Processor module.
 *
 * This test file exercises name-matched test detection:
 * test_processor.cpp should automatically back processor.cpp.
 */

#include <cmath>
#include <cstdio>
#include <optional>
#include <string>
#include <vector>
#include "processor.hpp"
#include "models.hpp"

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

void test_run_processes_records_and_returns_report() {
    std::printf("test_run_processes_records_and_returns_report:\n");

    std::vector<rosetta::Record> records;
    records.push_back(rosetta::create_record("A", 100.0));
    records.push_back(rosetta::create_record("B", 200.0));
    records.push_back(rosetta::create_record("C", 150.0));

    const std::optional<rosetta::Report> report = rosetta::run_processor(records, nullptr);

    check(report.has_value(), "run_processor should produce a report");
    check(report && std::fabs(report->total - 450.0) < 0.001, "total should be 450");
    check(report && std::fabs(report->average - 150.0) < 0.001, "average should be 150");
    check(report && report->records.size() == 3, "should have 3 records");
}

void test_run_handles_empty_record_set() {
    std::printf("test_run_handles_empty_record_set:\n");

    const std::optional<rosetta::Report> report = rosetta::run_processor({}, nullptr);

    check(report.has_value(), "run_processor should produce a report");
    check(report && std::fabs(report->total - 0.0) < 0.001, "total should be 0");
    check(report && report->records.empty(), "should have 0 records");
}

void test_summarize_formats_report() {
    std::printf("test_summarize_formats_report:\n");

    rosetta::Report report;
    report.total = 450.0;
    report.average = 150.0;

    const std::string summary = rosetta::summarize_report(report);

    check(!summary.empty(), "summary should not be empty");
    check(summary == "Total: 450.00, Average: 150.00, Count: 0", "summary should name the total, average and count");
}

void test_free_report_releases_records() {
    std::printf("test_free_report_releases_records:\n");

    std::vector<rosetta::Record> records;
    records.push_back(rosetta::create_record("A", 1.0));
    std::optional<rosetta::Report> report = rosetta::run_processor(records, nullptr);

    check(report && report->records.size() == 1, "report should hold the record before free_report");
    if (report) {
        rosetta::free_report(*report);
    }
    check(report && report->records.empty(), "free_report should release the records");
}

}  // namespace

int main() {
    std::printf("=== Processor Tests ===\n\n");

    test_run_processes_records_and_returns_report();
    test_run_handles_empty_record_set();
    test_summarize_formats_report();
    test_free_report_releases_records();

    std::printf("\n=== Results: %d/%d passed ===\n", tests_passed, tests_run);
    return tests_passed == tests_run ? 0 : 1;
}
