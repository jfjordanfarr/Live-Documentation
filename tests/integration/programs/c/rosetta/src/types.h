/**
 * @file types.h
 * @brief Shared type definitions for the Rosetta benchmark fixture.
 *
 * This file defines base types that other modules depend on,
 * testing how adapters resolve header includes.
 */

#ifndef ROSETTA_TYPES_H
#define ROSETTA_TYPES_H

#include <stdint.h>
#include <stdbool.h>

/**
 * Status enumeration for records.
 */
typedef enum {
    STATUS_PENDING,
    STATUS_ACTIVE,
    STATUS_COMPLETE
} Status;

/**
 * A timestamped entry in the data pipeline.
 */
typedef struct {
    char id[64];
    uint64_t timestamp;
    Status status;
} Entry;

/**
 * Configuration for processing operations.
 */
typedef struct {
    int batch_size;
    int timeout;
    bool strict;
} ProcessorConfig;

#endif /* ROSETTA_TYPES_H */
