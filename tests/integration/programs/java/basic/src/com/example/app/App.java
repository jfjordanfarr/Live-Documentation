package com.example.app;

import com.example.data.Reader;
import com.example.format.ReportWriter;
import com.example.model.Record;

import java.util.List;

/**
 * Entry point for the reporting pipeline used by the fixture.
 * <p>
 * Coordinates dataset loading and formatting so Live Docs can surface cross-language edges.
 * </p>
 */
public final class App {
	private App() {}

	/**
	 * Runs the reporting pipeline for the supplied dataset.
	 *
	 * @param dataset dataset identifier used to load records
	 * @return formatted report summary
	 * @throws IllegalArgumentException if {@code dataset} is null or blank
	 * @see Reader#load(String)
	 * @see ReportWriter#write(java.util.List)
	 */
	public static String run(String dataset) {
		if (dataset == null || dataset.isBlank()) {
			throw new IllegalArgumentException("dataset must be provided");
		}
		List<Record> records = Reader.load(dataset);
		return ReportWriter.write(records);
	}
}
