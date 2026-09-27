#ifndef PIPELINE_H
#define PIPELINE_H

#include <stddef.h>
#include "metrics.h"

/**
 * @brief Runs the metrics pipeline on a sample collection.
 *
 * @param samples Values to analyse.
 * @param count Number of entries contained in `samples`.
 * @return double Normalized metric returned by the pipeline stages.
 */
double run_pipeline(const double *samples, size_t count);

#endif
