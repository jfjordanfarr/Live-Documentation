package com.example.model;

/**
 * Immutable metric record used by the reporting fixtures.
 *
 * @param dataset dataset identifier associated with each metric
 * @param value metric value captured for the dataset
 */
public record Record(String dataset, int value) {}
