using System;
using Xunit;
using Rosetta.Helpers;

namespace Rosetta.Helpers.Tests
{
    /// <summary>
    /// Unit tests for the Helpers class.
    ///
    /// This test file exercises name-matched test detection:
    /// HelpersTests.cs should automatically back Helpers.cs.
    /// </summary>
    public class HelpersTests
    {
        public class FormatTests
        {
            [Fact]
            public void FormatsNumbersWithTwoDecimalPlaces()
            {
                Assert.Equal("100.00", Helpers.Format(100.0));
                Assert.Equal("0.00", Helpers.Format(0.0));
            }
        }

        public class SumTests
        {
            [Fact]
            public void SumsArrayOfNumbers()
            {
                var values = new double[] { 1.0, 2.0, 3.0, 4.0, 5.0 };
                Assert.Equal(15.0, Helpers.Sum(values), 3);
            }

            [Fact]
            public void ReturnsZeroForEmptyArray()
            {
                Assert.Equal(0.0, Helpers.Sum(Array.Empty<double>()), 3);
            }
        }

        public class AverageTests
        {
            [Fact]
            public void CalculatesAverageOfNumbers()
            {
                var values = new double[] { 10.0, 20.0, 30.0 };
                Assert.Equal(20.0, Helpers.Average(values), 3);
            }

            [Fact]
            public void ReturnsZeroForEmptyArray()
            {
                Assert.Equal(0.0, Helpers.Average(Array.Empty<double>()), 3);
            }
        }
    }
}
