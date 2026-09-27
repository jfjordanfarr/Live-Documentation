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

void test_format_formats_numbers(void) {
    printf("test_format_formats_numbers:\n");

    char* result1 = format(100.0);
    ASSERT(strcmp(result1, "100.00") == 0, "format(100.0) should be '100.00'");
    free(result1);

    char* result2 = format(0.0);
    ASSERT(strcmp(result2, "0.00") == 0, "format(0.0) should be '0.00'");
    free(result2);
}

void test_sum_sums_array(void) {
    printf("test_sum_sums_array:\n");

    double values[] = {1.0, 2.0, 3.0, 4.0, 5.0};
    double result = sum(values, 5);
    ASSERT(fabs(result - 15.0) < 0.001, "sum should be 15");

    double values2[] = {100.0, 200.0, 300.0};
    double result2 = sum(values2, 3);
    ASSERT(fabs(result2 - 600.0) < 0.001, "sum should be 600");
}

void test_sum_returns_zero_for_empty(void) {
    printf("test_sum_returns_zero_for_empty:\n");

    double result = sum(NULL, 0);
    ASSERT(fabs(result - 0.0) < 0.001, "sum of empty should be 0");
}

void test_average_calculates_average(void) {
    printf("test_average_calculates_average:\n");

    double values[] = {10.0, 20.0, 30.0};
    double result = average(values, 3);
    ASSERT(fabs(result - 20.0) < 0.001, "average should be 20");
}

void test_average_returns_zero_for_empty(void) {
    printf("test_average_returns_zero_for_empty:\n");

    double result = average(NULL, 0);
    ASSERT(fabs(result - 0.0) < 0.001, "average of empty should be 0");
}

int main(void) {
    printf("=== Helpers Tests ===\n\n");

    test_format_formats_numbers();
    test_sum_sums_array();
    test_sum_returns_zero_for_empty();
    test_average_calculates_average();
    test_average_returns_zero_for_empty();

    printf("\n=== Results: %d/%d passed ===\n", tests_passed, tests_run);
    return tests_passed == tests_run ? 0 : 1;
}
