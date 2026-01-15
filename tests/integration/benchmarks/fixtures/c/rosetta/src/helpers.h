/**
 * @file helpers.h
 * @brief Utility helpers for the Rosetta benchmark fixture.
 *
 * Pure functions with no external dependencies - testing
 * that adapters correctly identify leaf nodes in the graph.
 */

#ifndef ROSETTA_HELPERS_H
#define ROSETTA_HELPERS_H

#include <stddef.h>
#include <stdbool.h>

/**
 * Formats a numeric value into the provided buffer.
 * @param value Value to format
 * @param buffer Output buffer
 * @param size Buffer size
 * @return Number of characters written
 */
int format_value(double value, char* buffer, size_t size);

/**
 * Validates that a string is a valid identifier.
 * @param input String to validate
 * @return true if valid identifier
 */
bool validate_id(const char* input);

/**
 * Computes the sum of numeric values.
 * @param values Array of values
 * @param count Number of values
 * @return Sum of values
 */
double sum_values(const double* values, size_t count);

/**
 * Computes the average of numeric values.
 * @param values Array of values
 * @param count Number of values
 * @return Average of values, 0 if count is 0
 */
double average_values(const double* values, size_t count);

#endif /* ROSETTA_HELPERS_H */
