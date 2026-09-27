package com.rosetta.helpers;

import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Utility helpers for the Rosetta benchmark fixture.
 * 
 * Pure functions with no external dependencies - testing
 * that adapters correctly identify leaf nodes in the graph.
 */
public final class Helpers {
    private static final NumberFormat FORMATTER = NumberFormat.getInstance(Locale.US);
    private static final Pattern ID_PATTERN = Pattern.compile("^[a-zA-Z][a-zA-Z0-9_-]*$");

    static {
        FORMATTER.setMinimumFractionDigits(2);
        FORMATTER.setMaximumFractionDigits(2);
    }

    private Helpers() {}

    /** Formats a numeric value for display. */
    public static String format(double value) {
        return FORMATTER.format(value);
    }

    /** Validates that a string is a valid identifier. */
    public static boolean validate(String input) {
        return ID_PATTERN.matcher(input).matches();
    }

    /** Computes the sum of numeric values. */
    public static double sum(List<Double> values) {
        return values.stream().mapToDouble(Double::doubleValue).sum();
    }

    /** Computes the average of numeric values. */
    public static double average(List<Double> values) {
        if (values.isEmpty()) return 0.0;
        return sum(values) / values.size();
    }
}
