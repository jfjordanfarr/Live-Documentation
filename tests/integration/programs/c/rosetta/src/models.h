/**
 * @file models.h
 * @brief Domain models for the Rosetta benchmark fixture.
 *
 * Defines Record and Report types used throughout the pipeline.
 */

#ifndef ROSETTA_MODELS_H
#define ROSETTA_MODELS_H

#include "types.h"
#include <stddef.h>

/**
 * A data record to be processed.
 */
typedef struct {
    Entry entry;
    double value;
    char tags[8][32];
    size_t tag_count;
} Record;

/**
 * Summary report produced by the processor.
 */
typedef struct {
    double total;
    double average;
    Record* records;
    size_t record_count;
    uint64_t generated_at;
} Report;

/**
 * Factory for creating records with sensible defaults.
 * @param id Record identifier
 * @param value Numeric value
 * @return Initialized record
 */
Record create_record(const char* id, double value);

/**
 * Validates configuration is within acceptable bounds.
 * @param config Configuration to validate
 * @return true if valid, false otherwise
 */
bool validate_config(const ProcessorConfig* config);

#endif /* ROSETTA_MODELS_H */
