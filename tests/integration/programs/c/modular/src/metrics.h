#ifndef METRICS_H
#define METRICS_H

#include <stddef.h>

/**
 * @brief Computes the arithmetic mean for a sample window.
 *
 * @param values Pointer to the contiguous collection of samples.
 * @param count Number of entries available in `values`.
 * @return double Average value or 0.0 when `count` is zero.
 */
double compute_average(const double *values, size_t count);

/**
 * @brief Restricts a value to the provided inclusive range.
 *
 * @param value Candidate value.
 * @param lower Minimum allowed value.
 * @param upper Maximum allowed value.
 * @return double Value clamped to the requested bounds.
 */
double clamp(double value, double lower, double upper);

#endif
