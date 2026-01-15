/**
 * @file models.c
 * @brief Implementation of domain model functions.
 */

#include "models.h"
#include <string.h>
#include <time.h>

Record create_record(const char* id, double value) {
    Record record = {0};
    
    strncpy(record.entry.id, id, sizeof(record.entry.id) - 1);
    record.entry.timestamp = (uint64_t)time(NULL);
    record.entry.status = STATUS_PENDING;
    record.value = value;
    record.tag_count = 0;
    
    return record;
}

bool validate_config(const ProcessorConfig* config) {
    return config->batch_size > 0 && 
           config->timeout > 0 && 
           config->batch_size <= 1000;
}
