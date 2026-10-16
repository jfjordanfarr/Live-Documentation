/**
 * @file test_helpers.c
 * @brief Unit tests for the Helpers module.
 *
 * This test file exercises name-matched test detection:
 * test_helpers.c should automatically back helpers.c.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include "helpers.h"

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

void test_format_value_formats_numbers(void) {
    printf("test_format_value_formats_numbers:\n");

    char buffer[32];
    int written = format_value(100.0, buffer, sizeof buffer);
    ASSERT(strcmp(buffer, "100.00") == 0, "format_value(100.0) should be '100.00'");
    ASSERT(written == 6, "format_value(100.0) should write six characters");

    format_value(0.0, buffer, sizeof buffer);
    ASSERT(strcmp(buffer, "0.00") == 0, "format_value(0.0) should be '0.00'");
}

void test_validate_id_accepts_identifiers(void) {
    printf("test_validate_id_accepts_identifiers:\n");

    ASSERT(validate_id("alpha_1"), "alpha_1 should be a valid identifier");
    ASSERT(!validate_id("1alpha"), "an identifier may not start with a digit");
    ASSERT(!validate_id(""), "an empty string is not an identifier");
}

void test_sum_values_sums_array(void) {
    printf("test_sum_values_sums_array:\n");

    double values[] = {1.0, 2.0, 3.0, 4.0, 5.0};
    double result = sum_values(values, 5);
    ASSERT(fabs(result - 15.0) < 0.001, "sum should be 15");

    double values2[] = {100.0, 200.0, 300.0};
    double result2 = sum_values(values2, 3);
    ASSERT(fabs(result2 - 600.0) < 0.001, "sum should be 600");
}

void test_sum_values_returns_zero_for_empty(void) {
    printf("test_sum_values_returns_zero_for_empty:\n");

    double result = sum_values(NULL, 0);
    ASSERT(fabs(result - 0.0) < 0.001, "sum of empty should be 0");
}

void test_average_values_calculates_average(void) {
    printf("test_average_values_calculates_average:\n");

    double values[] = {10.0, 20.0, 30.0};
    double result = average_values(values, 3);
    ASSERT(fabs(result - 20.0) < 0.001, "average should be 20");
}

void test_average_values_returns_zero_for_empty(void) {
    printf("test_average_values_returns_zero_for_empty:\n");

    double result = average_values(NULL, 0);
    ASSERT(fabs(result - 0.0) < 0.001, "average of empty should be 0");
}

int main(void) {
    printf("=== Helpers Tests ===\n\n");

    test_format_value_formats_numbers();
    test_validate_id_accepts_identifiers();
    test_sum_values_sums_array();
    test_sum_values_returns_zero_for_empty();
    test_average_values_calculates_average();
    test_average_values_returns_zero_for_empty();

    printf("\n=== Results: %d/%d passed ===\n", tests_passed, tests_run);
    return tests_passed == tests_run ? 0 : 1;
}
