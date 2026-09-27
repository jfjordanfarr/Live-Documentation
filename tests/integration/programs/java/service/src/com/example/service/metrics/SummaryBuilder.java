package com.example.service.metrics;

import com.example.service.model.Sample;
import com.example.service.model.Summary;

import java.util.List;

public final class SummaryBuilder {
	public Summary create(List<Sample> samples) {
		double total = samples.stream().mapToDouble(Sample::value).sum();
		double average = samples.isEmpty() ? 0.0 : total / samples.size();
		boolean alert = average > 40.0;
		return new Summary("generated", average, alert);
	}
}
