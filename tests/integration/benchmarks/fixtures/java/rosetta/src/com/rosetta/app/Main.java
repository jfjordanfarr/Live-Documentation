package com.rosetta.app;

import com.rosetta.models.ModelFactory;
import com.rosetta.models.Record;
import com.rosetta.models.Report;
import com.rosetta.processor.Processor;

import java.util.Arrays;
import java.util.List;

/**
 * Entry point for the Rosetta benchmark fixture.
 * 
 * Demonstrates selective imports and serves as the
 * root node of the dependency graph.
 */
public final class Main {
    private Main() {}

    /**
     * Executes the Rosetta data pipeline.
     *
     * @param seed Starting seed value for generating records
     * @return Formatted summary of the processing results
     */
    public static String main(int seed) {
        // Create test records using the factory
        List<Record> records = Arrays.asList(
            ModelFactory.createRecord("alpha", seed),
            ModelFactory.createRecord("beta", seed * 2),
            ModelFactory.createRecord("gamma", seed * 3)
        );

        // Process and generate report
        Report report = Processor.run(records, null);

        // Return human-readable summary
        return Processor.summarize(report);
    }

    public static void main(String[] args) {
        System.out.println(main(10));
    }
}
