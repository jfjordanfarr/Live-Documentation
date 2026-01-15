package com.rosetta.processor;

import com.rosetta.models.*;
import com.rosetta.types.ProcessorConfig;
import com.rosetta.helpers.Helpers;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Core processing logic for the Rosetta benchmark fixture.
 * 
 * This module exercises multiple import patterns:
 * - Wildcard import: {@code import com.rosetta.models.*}
 * - Selective imports from helpers
 * - Type imports from types package
 */
public final class Processor {
    /** Default configuration for processing. */
    private static final ProcessorConfig DEFAULT_CONFIG = 
        new ProcessorConfig(100, 5000, true);

    private Processor() {}

    /**
     * Processes a batch of records and generates a report.
     * 
     * Uses wildcard import (models.*) to access Record and Report types,
     * demonstrating how adapters should handle wildcard imports.
     *
     * @param records Records to process
     * @param config  Processing configuration (optional, uses default if null)
     * @return Summary report of processed records
     * @throws IllegalArgumentException if configuration is invalid
     */
    public static Report run(List<Record> records, ProcessorConfig config) {
        if (config == null) {
            config = DEFAULT_CONFIG;
        }
        
        if (!ModelFactory.validateConfig(config)) {
            throw new IllegalArgumentException("Invalid processor configuration");
        }

        List<Double> values = records.stream()
            .map(Record::getValue)
            .collect(Collectors.toList());
        
        double total = Helpers.sum(values);
        double avg = Helpers.average(values);

        return new Report(total, avg, records);
    }

    /**
     * Creates a formatted summary string from a report.
     *
     * @param report Report to summarize
     * @return Human-readable summary
     */
    public static String summarize(Report report) {
        return String.format("Total: %s, Average: %s, Count: %d",
            Helpers.format(report.getTotal()),
            Helpers.format(report.getAverage()),
            report.getRecords().size());
    }
}
