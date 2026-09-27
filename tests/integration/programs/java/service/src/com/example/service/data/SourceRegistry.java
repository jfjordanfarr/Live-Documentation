package com.example.service.data;

import com.example.service.model.Sample;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class SourceRegistry {
	private final Map<String, List<Sample>> sources = new HashMap<>();

	public SourceRegistry() {
		sources.put("baseline", createSample(44, 18, 32));
		sources.put("noisy", createSample(5, 75, 11));
	}

	public List<Sample> resolve(String dataset) {
		return sources.getOrDefault(dataset, createSample(10));
	}

	private List<Sample> createSample(int... values) {
		List<Sample> samples = new ArrayList<>();
		for (int value : values) {
			samples.add(new Sample("generated", value));
		}
		return samples;
	}
}
