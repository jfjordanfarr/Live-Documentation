package com.rosetta.types;

/**
 * Configuration for processing operations.
 */
public class ProcessorConfig {
    private final int batchSize;
    private final int timeout;
    private final boolean strict;

    public ProcessorConfig(int batchSize, int timeout, boolean strict) {
        this.batchSize = batchSize;
        this.timeout = timeout;
        this.strict = strict;
    }

    public int getBatchSize() { return batchSize; }
    public int getTimeout() { return timeout; }
    public boolean isStrict() { return strict; }
}
