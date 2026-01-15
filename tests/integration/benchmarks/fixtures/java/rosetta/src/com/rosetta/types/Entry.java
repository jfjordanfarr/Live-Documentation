package com.rosetta.types;

import java.time.Instant;

/**
 * A timestamped entry in the data pipeline.
 */
public class Entry {
    private final String id;
    private final Instant timestamp;
    private final Status status;

    public Entry(String id, Instant timestamp, Status status) {
        this.id = id;
        this.timestamp = timestamp;
        this.status = status;
    }

    public String getId() { return id; }
    public Instant getTimestamp() { return timestamp; }
    public Status getStatus() { return status; }
}
