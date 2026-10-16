/**
 * @file helpers.cpp
 * @brief Implementation of utility helper functions.
 */

#include "helpers.hpp"
#include <cctype>
#include <cstddef>
#include <cstdio>

namespace rosetta {

std::string format_value(double value) {
    char buffer[64];
    std::snprintf(buffer, sizeof(buffer), "%.2f", value);
    return std::string(buffer);
}

bool validate_id(const std::string& input) {
    if (input.empty()) return false;

    // First character must be a letter
    if (!std::isalpha(static_cast<unsigned char>(input[0]))) return false;

    // Remaining characters must be alphanumeric, underscore, or hyphen
    for (std::size_t i = 1; i < input.size(); ++i) {
        const unsigned char c = static_cast<unsigned char>(input[i]);
        if (!std::isalnum(c) && c != '_' && c != '-') {
            return false;
        }
    }
    return true;
}

double sum_values(const std::vector<double>& values) {
    double total = 0.0;
    for (double value : values) {
        total += value;
    }
    return total;
}

double average_values(const std::vector<double>& values) {
    if (values.empty()) return 0.0;
    return sum_values(values) / static_cast<double>(values.size());
}

}  // namespace rosetta
