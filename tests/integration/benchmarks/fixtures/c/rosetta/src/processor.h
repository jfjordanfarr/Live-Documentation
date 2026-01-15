/**
 * @file processor.h
 * @brief Core processing logic for the Rosetta benchmark fixture.
 *
 * This module exercises multiple include patterns:
 * - Direct header includes
 * - Transitive includes through models.h
 */

#ifndef ROSETTA_PROCESSOR_H
#define ROSETTA_PROCESSOR_H

#include "models.h"
#include "types.h"

/**
 * Processes a batch of records and generates a report.
 *
 * @param records Array of records to process
 * @param count Number of records
 * @param config Processing configuration (may be NULL for defaults)
 * @param out_report Output report structure
 * @return 0 on success, -1 on error
 */
int run_processor(
    Record* records, 
    size_t count, 
    const ProcessorConfig* config,
    Report* out_report
);

/**
 * Creates a formatted summary string from a report.
 *
 * @param report Report to summarize
 * @param buffer Output buffer
 * @param size Buffer size
 * @return Number of characters written
 */
int summarize_report(const Report* report, char* buffer, size_t size);

/**
 * Frees resources allocated by a report.
 * @param report Report to free
 */
void free_report(Report* report);

#endif /* ROSETTA_PROCESSOR_H */
