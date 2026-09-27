# frozen_string_literal: true

# Integration tests for the complete data processing pipeline.
#
# This test file exercises NON-name-matched test detection:
# pipeline_spec.rb imports processor and models, so those files
# should appear as "test-backed" in the Explorer even without
# a directly name-matched test file.

require_relative '../lib/processor'
require_relative '../lib/models'
require_relative '../lib/types'

RSpec.describe 'Pipeline Integration' do
  describe 'complete pipeline' do
    it 'processes records through complete pipeline' do
      # Create test records using models factory
      records = [
        Models.create_record(1, 'Alpha', 100),
        Models.create_record(2, 'Beta', 200),
        Models.create_record(3, 'Gamma', 300)
      ]

      # Process through processor
      report = Processor.run(records, nil)

      # Verify report structure
      expect(report.total).to be_within(0.001).of(600)
      expect(report.average).to be_within(0.001).of(200)
      expect(report.records.length).to eq(3)

      # Verify summarization
      summary = Processor.summarize(report)
      expect(summary).to include('600')
    end
  end

  describe 'configuration validation' do
    it 'validates configuration before processing' do
      valid_config = Types::ProcessorConfig.new(100, 5000, true)
      invalid_config = Types::ProcessorConfig.new(-1, 0, false)

      expect(Models.validate_config(valid_config)).to be true
      expect(Models.validate_config(invalid_config)).to be false
    end
  end

  describe 'edge cases' do
    it 'handles edge cases in pipeline' do
      # Empty input
      empty_report = Processor.run([], nil)
      expect(empty_report.total).to be_within(0.001).of(0)

      # Single record
      single_record = [Models.create_record(1, 'Solo', 42)]
      single_report = Processor.run(single_record, nil)
      expect(single_report.average).to be_within(0.001).of(42)
    end
  end
end
