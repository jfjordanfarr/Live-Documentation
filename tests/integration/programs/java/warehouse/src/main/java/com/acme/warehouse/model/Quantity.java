package com.acme.warehouse.model;

/**
 * An amount of stock in some unit.
 *
 * @param amount how much
 * @param unit   what the amount counts
 */
public record Quantity(double amount, Unit unit) {

    /** A quantity of nothing, in the given unit. */
    public static Quantity none(Unit unit) {
        return new Quantity(0, unit);
    }

    /** This quantity plus another of the same unit. */
    public Quantity plus(Quantity other) {
        if (other.unit() != unit) {
            throw new IllegalArgumentException("units differ: " + unit + " and " + other.unit());
        }
        return new Quantity(amount + other.amount(), unit);
    }
}
