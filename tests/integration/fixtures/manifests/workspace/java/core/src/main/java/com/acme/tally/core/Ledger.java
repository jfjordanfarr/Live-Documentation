package com.acme.tally.core;

/** The running total of what the shelves hold. */
public final class Ledger {
    private int total;

    public void add(int count) {
        total += count;
    }

    public int total() {
        return total;
    }
}
