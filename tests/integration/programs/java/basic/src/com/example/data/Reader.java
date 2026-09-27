package com.example.data;

import com.example.model.Record;

import java.util.ArrayList;
import java.util.List;

/**
 * Loads synthetic records for the fixtures.
 */
public final class Reader {
	private Reader() {}

	/**
	 * Loads records for the provided dataset identifier.
	 *
	 * @param dataset dataset identifier used to seed record values
	 * @return ordered list of synthetic records
	 * @example {@code Reader.load("baseline")}
	 */
	public static List<Record> load(String dataset) {
		List<Record> records = new ArrayList<>();
		records.add(new Record(dataset, 42));
		records.add(new Record(dataset, 27));
		return records;
	}
}
