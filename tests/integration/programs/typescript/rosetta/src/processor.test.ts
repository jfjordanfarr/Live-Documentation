/**
 * Unit tests for the processor module.
 * 
 * This test file exercises name-matched test detection:
 * processor.test.ts should automatically back processor.ts.
 */

import { run, summarize } from "./processor";
import { createRecord, Report } from "./models";

describe("processor", () => {
  describe("run", () => {
    it("processes records and returns a report", () => {
      const records = [
        createRecord(1, "A", 100),
        createRecord(2, "B", 200),
        createRecord(3, "C", 150)
      ];

      const report = run(records);

      expect(report.total).toBe(450);
      expect(report.average).toBe(150);
      expect(report.records).toHaveLength(3);
    });

    it("handles empty record set", () => {
      const report = run([]);

      expect(report.total).toBe(0);
      expect(report.records).toHaveLength(0);
    });
  });

  describe("summarize", () => {
    it("formats report as human-readable string", () => {
      const report: Report = {
        total: 450,
        average: 150,
        records: [],
        generatedAt: new Date()
      };

      const summary = summarize(report);

      expect(summary).toContain("Total");
      expect(summary).toContain("450");
      expect(summary).toContain("Average");
    });
  });
});
