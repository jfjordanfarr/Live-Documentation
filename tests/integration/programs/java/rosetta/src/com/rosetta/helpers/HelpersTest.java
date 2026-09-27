package com.rosetta.helpers;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for the Helpers class.
 *
 * This test file exercises name-matched test detection:
 * HelpersTest.java should automatically back Helpers.java.
 */
public class HelpersTest {

    @Nested
    @DisplayName("format()")
    class FormatTests {

        @Test
        @DisplayName("formats numbers with two decimal places")
        void formatsNumbersWithTwoDecimalPlaces() {
            assertEquals("100.00", Helpers.format(100.0));
            assertEquals("0.00", Helpers.format(0.0));
            assertEquals("123.46", Helpers.format(123.456));
        }
    }

    @Nested
    @DisplayName("sum()")
    class SumTests {

        @Test
        @DisplayName("sums a list of numbers")
        void sumsListOfNumbers() {
            List<Double> values = Arrays.asList(1.0, 2.0, 3.0, 4.0, 5.0);
            assertEquals(15.0, Helpers.sum(values), 0.001);
        }

        @Test
        @DisplayName("returns 0 for empty array")
        void returnsZeroForEmptyArray() {
            assertEquals(0.0, Helpers.sum(Collections.emptyList()), 0.001);
        }
    }

    @Nested
    @DisplayName("average()")
    class AverageTests {

        @Test
        @DisplayName("calculates average of numbers")
        void calculatesAverageOfNumbers() {
            List<Double> values = Arrays.asList(10.0, 20.0, 30.0);
            assertEquals(20.0, Helpers.average(values), 0.001);
        }

        @Test
        @DisplayName("returns 0 for empty array")
        void returnsZeroForEmptyArray() {
            assertEquals(0.0, Helpers.average(Collections.emptyList()), 0.001);
        }
    }
}
