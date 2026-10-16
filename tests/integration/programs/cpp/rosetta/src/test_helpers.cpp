/**
 * @file test_helpers.cpp
 * @brief Unit tests for the Helpers module.
 *
 * This test file exercises name-matched test detection:
 * test_helpers.cpp should automatically back helpers.cpp.
 */

#include <cmath>
#include <cstdio>
#include <vector>
#include "helpers.hpp"

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

void test_format_formats_numbers() {
    std::printf("test_format_formats_numbers:\n");

    check(rosetta::format_value(100.0) == "100.00", "format_value(100.0) should be '100.00'");
    check(rosetta::format_value(0.0) == "0.00", "format_value(0.0) should be '0.00'");
}

void test_sum_sums_values() {
    std::printf("test_sum_sums_values:\n");

    const std::vector<double> values{1.0, 2.0, 3.0, 4.0, 5.0};
    check(std::fabs(rosetta::sum_values(values) - 15.0) < 0.001, "sum should be 15");

    const std::vector<double> values2{100.0, 200.0, 300.0};
    check(std::fabs(rosetta::sum_values(values2) - 600.0) < 0.001, "sum should be 600");
}

void test_sum_returns_zero_for_empty() {
    std::printf("test_sum_returns_zero_for_empty:\n");

    check(std::fabs(rosetta::sum_values({}) - 0.0) < 0.001, "sum of empty should be 0");
}

void test_average_calculates_average() {
    std::printf("test_average_calculates_average:\n");

    const std::vector<double> values{10.0, 20.0, 30.0};
    check(std::fabs(rosetta::average_values(values) - 20.0) < 0.001, "average should be 20");
}

void test_average_returns_zero_for_empty() {
    std::printf("test_average_returns_zero_for_empty:\n");

    check(std::fabs(rosetta::average_values({}) - 0.0) < 0.001, "average of empty should be 0");
}

}  // namespace

int main() {
    std::printf("=== Helpers Tests ===\n\n");

    test_format_formats_numbers();
    test_sum_sums_values();
    test_sum_returns_zero_for_empty();
    test_average_calculates_average();
    test_average_returns_zero_for_empty();

    std::printf("\n=== Results: %d/%d passed ===\n", tests_passed, tests_run);
    return tests_passed == tests_run ? 0 : 1;
}
