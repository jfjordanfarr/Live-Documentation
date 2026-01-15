package com.rosetta.models;

import java.time.Instant;
import java.util.List;

/**
 * Summary report produced by the processor.
 */
public class Report {
    private final double total;
    private final double average;
    private final List<Record> records;
    private final Instant generatedAt;

    public Report(double total, double average, List<Record> records) {
        this.total = total;
        this.average = average;
        this.records = records;
        this.generatedAt = Instant.now();
    }

    public double getTotal() { return total; }
    public double getAverage() { return average; }
    public List<Record> getRecords() { return records; }
    public Instant getGeneratedAt() { return generatedAt; }
}
