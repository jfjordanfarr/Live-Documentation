package com.acme.warehouse.model;

/** How a quantity is counted. */
public enum Unit {
    EACH,
    KILOGRAM;

    /** The unit's short label for reports. */
    public String label() {
        return this == EACH ? "ea" : "kg";
    }
}
