package com.example.format;

import com.example.data.Catalog;
import com.example.model.Record;

import java.util.List;

/**
 * Formats {@link Record} collections into human-readable summaries.
 */
public final class ReportWriter {
	private ReportWriter() {}

	/**
	 * Writes a summary string for the supplied records.
	 *
	 * @param records record collection to summarise
	 * @return catalog description combined with the aggregate value
	 * @see Catalog#describe(String)
	 */
	public static String write(List<Record> records) {
		String label = records.isEmpty() ? "empty" : records.get(0).dataset();
		int total = records.stream().mapToInt(Record::value).sum();
		return Catalog.describe(label) + ":" + total;
	}
}
