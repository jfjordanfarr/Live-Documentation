package com.acme.warehouse.model;

import java.util.Objects;

/** Something the warehouse keeps, identified by its SKU. */
public final class Item {
    private final String sku;
    private final String name;
    private final Unit unit;

    public Item(String sku, String name, Unit unit) {
        this.sku = Objects.requireNonNull(sku);
        this.name = Objects.requireNonNull(name);
        this.unit = unit;
    }

    public String sku() {
        return sku;
    }

    public String name() {
        return name;
    }

    public Unit unit() {
        return unit;
    }

    /** The item as a report line, formatted by the package-private helper below. */
    public String describe(Quantity quantity) {
        return ItemFormatter.line(this, quantity);
    }

    @Override
    public boolean equals(Object other) {
        return other instanceof Item item && item.sku.equals(sku);
    }

    @Override
    public int hashCode() {
        return sku.hashCode();
    }
}

/** Formats items; shares the file with {@link Item} and is visible only in this package. */
class ItemFormatter {
    static String line(Item item, Quantity quantity) {
        return item.sku() + "  " + item.name() + "  " + quantity.amount() + " " + quantity.unit().label();
    }
}
