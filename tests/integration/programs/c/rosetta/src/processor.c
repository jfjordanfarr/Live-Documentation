/**
 * @file processor.c
 * @brief Implementation of the core processing logic.
 */

#include "processor.h"
#include "helpers.h"
#include <stdlib.h>
#include <stdio.h>
#include <time.h>

/* Default configuration */
static const ProcessorConfig DEFAULT_CONFIG = {
    .batch_size = 100,
    .timeout = 5000,
    .strict = true
};

int run_processor(
    Record* records, 
    size_t count, 
    const ProcessorConfig* config,
    Report* out_report
) {
    if (!config) {
        config = &DEFAULT_CONFIG;
    }

    if (!validate_config(config)) {
        return -1;
    }

    /* Extract values from records */
    double* values = malloc(count * sizeof(double));
    if (!values && count > 0) return -1;

    for (size_t i = 0; i < count; ++i) {
        values[i] = records[i].value;
    }

    double total = sum_values(values, count);
    double avg = average_values(values, count);
    free(values);

    /* Build report */
    out_report->total = total;
    out_report->average = avg;
    out_report->records = records;
    out_report->record_count = count;
    out_report->generated_at = (uint64_t)time(NULL);

    return 0;
}

int summarize_report(const Report* report, char* buffer, size_t size) {
    char total_str[32], avg_str[32];
    format_value(report->total, total_str, sizeof(total_str));
    format_value(report->average, avg_str, sizeof(avg_str));
    
    return snprintf(buffer, size, 
        "Total: %s, Average: %s, Count: %zu",
        total_str, avg_str, report->record_count);
}

void free_report(Report* report) {
    /* Records are not owned by report in this implementation */
    report->records = NULL;
    report->record_count = 0;
}
