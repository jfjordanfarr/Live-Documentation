package com.example.data;

import java.util.HashMap;
import java.util.Map;

/**
 * Catalog of dataset captions used by the reporting fixtures.
 */
public final class Catalog {
	private static final Map<String, String> CAPTIONS = new HashMap<>();

	private Catalog() {}

	static {
		CAPTIONS.put("baseline", "Baseline Dataset");
		CAPTIONS.put("spiky", "Spiky Dataset");
	}

	/**
	 * Describes the supplied dataset identifier.
	 *
	 * @param dataset dataset identifier to look up
	 * @return Caption describing the dataset or {@code Unknown Dataset}
	 */
	public static String describe(String dataset) {
		return CAPTIONS.getOrDefault(dataset, "Unknown Dataset");
	}
}
