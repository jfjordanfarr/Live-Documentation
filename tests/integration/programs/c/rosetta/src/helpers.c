/**
 * @file helpers.c
 * @brief Implementation of utility helper functions.
 */

#include "helpers.h"
#include <stdio.h>
#include <ctype.h>
#include <string.h>

int format_value(double value, char* buffer, size_t size) {
    return snprintf(buffer, size, "%.2f", value);
}

bool validate_id(const char* input) {
    if (!input || !*input) return false;
    
    /* First character must be a letter */
    if (!isalpha((unsigned char)*input)) return false;
    
    /* Remaining characters must be alphanumeric, underscore, or hyphen */
    for (const char* p = input + 1; *p; ++p) {
        if (!isalnum((unsigned char)*p) && *p != '_' && *p != '-') {
            return false;
        }
    }
    return true;
}

double sum_values(const double* values, size_t count) {
    double total = 0.0;
    for (size_t i = 0; i < count; ++i) {
        total += values[i];
    }
    return total;
}

double average_values(const double* values, size_t count) {
    if (count == 0) return 0.0;
    return sum_values(values, count) / (double)count;
}
