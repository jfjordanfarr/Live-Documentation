# frozen_string_literal: true

# Unit tests for the Processor module.
#
# This test file exercises name-matched test detection:
# processor_spec.rb should automatically back processor.rb.

require_relative '../lib/processor'
require_relative '../lib/models'

RSpec.describe Processor do
  describe '.run' do
    it 'processes records and returns report' do
      records = [
        Models.create_record(1, 'A', 100),
        Models.create_record(2, 'B', 200),
        Models.create_record(3, 'C', 150)
      ]

      report = Processor.run(records, nil)

      expect(report.total).to be_within(0.001).of(450)
      expect(report.average).to be_within(0.001).of(150)
      expect(report.records.length).to eq(3)
    end

    it 'handles empty record set' do
      report = Processor.run([], nil)

      expect(report.total).to be_within(0.001).of(0)
      expect(report.records.length).to eq(0)
    end
  end

  describe '.summarize' do
    it 'formats report as human-readable string' do
      report = Models::Report.new(450, 150, [])

      summary = Processor.summarize(report)

      expect(summary).not_to be_empty
    end
  end
end
