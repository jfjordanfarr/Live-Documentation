package com.rosetta.models;

import com.rosetta.types.ProcessorConfig;

/**
 * Factory and validation utilities for domain models.
 */
public final class ModelFactory {
    private ModelFactory() {}

    /**
     * Factory for creating records with sensible defaults.
     */
    public static Record createRecord(String id, double value) {
        return new Record(id, value);
    }

    /**
     * Validates configuration is within acceptable bounds.
     */
    public static boolean validateConfig(ProcessorConfig config) {
        return config.getBatchSize() > 0 &&
               config.getTimeout() > 0 &&
               config.getBatchSize() <= 1000;
    }
}
