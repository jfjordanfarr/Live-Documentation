package com.rosetta.types;

/**
 * Status enumeration for records.
 */
public enum Status {
    PENDING("pending"),
    ACTIVE("active"),
    COMPLETE("complete");

    private final String value;

    Status(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
