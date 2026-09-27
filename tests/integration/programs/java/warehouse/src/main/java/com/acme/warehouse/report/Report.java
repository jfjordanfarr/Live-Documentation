package com.acme.warehouse.report;

import java.util.ArrayList;
import java.util.List;

import com.acme.warehouse.model.Item;
import com.acme.warehouse.model.Quantity;

/** A stock report: one line per {@link Item}, built with {@link Builder}. */
public final class Report {
    private final List<String> lines;

    private Report(List<String> lines) {
        this.lines = lines;
    }

    /** The report's lines in the order they were added. */
    public List<String> lines() {
        return lines;
    }

    /** Collects lines for a {@link Report}. */
    public static final class Builder {
        private final List<String> lines = new ArrayList<>();

        /** Adds a line for the item and how much of it is on hand. */
        public Builder add(Item item, Quantity onHand) {
            lines.add(item.describe(onHand));
            return this;
        }

        public Report build() {
            return new Report(List.copyOf(lines));
        }
    }
}
