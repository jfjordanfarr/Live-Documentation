/**
 * @file main.c
 * @brief Entry point for the Rosetta benchmark fixture.
 *
 * Demonstrates header includes and serves as the
 * root node of the dependency graph.
 */

#include "models.h"
#include "processor.h"
#include <stdio.h>
#include <stdlib.h>

/**
 * Executes the Rosetta data pipeline.
 * @param seed Starting seed value for generating records
 * @return Pointer to summary string (caller must free)
 */
char* rosetta_main(int seed) {
    /* Create test records using the factory */
    Record records[3];
    records[0] = create_record("alpha", (double)seed);
    records[1] = create_record("beta", (double)(seed * 2));
    records[2] = create_record("gamma", (double)(seed * 3));

    /* Process and generate report */
    Report report;
    if (run_processor(records, 3, NULL, &report) != 0) {
        return NULL;
    }

    /* Generate summary */
    char* buffer = malloc(256);
    if (buffer) {
        summarize_report(&report, buffer, 256);
    }

    free_report(&report);
    return buffer;
}

int main(void) {
    char* summary = rosetta_main(10);
    if (summary) {
        printf("%s\n", summary);
        free(summary);
    }
    return 0;
}
