# frozen_string_literal: true

# Unit tests for the Helpers module.
#
# This test file exercises name-matched test detection:
# helpers_spec.rb should automatically back helpers.rb.

require_relative '../lib/helpers'

RSpec.describe Helpers do
  describe '.format' do
    it 'formats numbers with two decimal places' do
      expect(Helpers.format(100)).to eq('100.00')
      expect(Helpers.format(0)).to eq('0.00')
    end
  end

  describe '.sum' do
    it 'sums an array of numbers' do
      expect(Helpers.sum([1, 2, 3, 4, 5])).to be_within(0.001).of(15)
      expect(Helpers.sum([100, 200, 300])).to be_within(0.001).of(600)
    end

    it 'returns 0 for empty array' do
      expect(Helpers.sum([])).to be_within(0.001).of(0)
    end
  end

  describe '.average' do
    it 'calculates average of numbers' do
      expect(Helpers.average([10, 20, 30])).to be_within(0.001).of(20)
    end

    it 'returns 0 for empty array' do
      expect(Helpers.average([])).to be_within(0.001).of(0)
    end
  end
end
