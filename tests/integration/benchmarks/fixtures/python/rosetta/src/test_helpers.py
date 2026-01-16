"""
Unit tests for the helpers module.

This test file exercises name-matched test detection:
test_helpers.py should automatically back helpers.py.
"""

import pytest
from helpers import format_value, sum_values, average


class TestFormatValue:
    def test_formats_numbers_with_two_decimal_places(self):
        assert format_value(100) == "100.00"
        assert format_value(3.14159) == "3.14"
        assert format_value(0) == "0.00"


class TestSumValues:
    def test_sums_an_array_of_numbers(self):
        assert sum_values([1, 2, 3, 4, 5]) == 15
        assert sum_values([100, 200, 300]) == 600

    def test_returns_zero_for_empty_list(self):
        assert sum_values([]) == 0


class TestAverage:
    def test_calculates_average_of_numbers(self):
        assert average([10, 20, 30]) == 20
        assert average([100]) == 100

    def test_returns_zero_for_empty_list(self):
        assert average([]) == 0
