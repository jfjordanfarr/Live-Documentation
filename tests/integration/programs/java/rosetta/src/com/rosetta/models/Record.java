package com.rosetta.models;

import com.rosetta.types.Entry;
import com.rosetta.types.Status;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * A data record to be processed.
 */
public class Record extends Entry {
    private final double value;
    private final List<String> tags;

    public Record(String id, double value) {
        super(id, Instant.now(), Status.PENDING);
        this.value = value;
        this.tags = new ArrayList<>();
    }

    /**
     * Static factory for creating records (used by tests).
     */
    public static Record create(int index, String id, double value) {
        return new Record(id, value);
    }

    public double getValue() {
        return value;
    }

    public List<String> getTags() {
        return tags;
    }
}
