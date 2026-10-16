/**
 * @file helpers.hpp
 * @brief Utility helpers for the Rosetta benchmark fixture.
 *
 * Pure functions with no external dependencies - testing
 * that adapters correctly identify leaf nodes in the graph.
 */

#ifndef ROSETTA_HELPERS_HPP
#define ROSETTA_HELPERS_HPP

#include <string>
#include <vector>

namespace rosetta {

/**
 * Formats a numeric value with two decimal places.
 * @param value Value to format
 * @return The formatted text
 */
std::string format_value(double value);

/**
 * Validates that a string is a valid identifier.
 * @param input String to validate
 * @return true if valid identifier
 */
bool validate_id(const std::string& input);

/**
 * Computes the sum of numeric values.
 * @param values Values to sum
 * @return Sum of values
 */
double sum_values(const std::vector<double>& values);

/**
 * Computes the average of numeric values.
 * @param values Values to average
 * @return Average of values, 0 if there are none
 */
double average_values(const std::vector<double>& values);

}  // namespace rosetta

#endif /* ROSETTA_HELPERS_HPP */
