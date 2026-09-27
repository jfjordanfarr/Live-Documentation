#include "pipeline.h"
#include "metrics.h"
#include "logger.h"

/**
 * @brief Keeps normalized samples within a 0-100 range.
 *
 * @param value Candidate value.
 * @return double Clamped value used for alerts.
 */
static double normalize(double value) {
	return clamp(value, 0.0, 100.0);
}

/**
 * @brief Computes a bounded average and notifies the logger.
 *
 * @param samples Values to inspect.
 * @param count Number of entries in `samples`.
 * @return double Bounded average used by the caller.
 */
double run_pipeline(const double *samples, size_t count) {
	double average = compute_average(samples, count);
	double bounded = normalize(average);

	if (bounded > 50.0) {
		log_message("threshold exceeded");
	} else {
		log_message("within range");
	}

	return bounded;
}
