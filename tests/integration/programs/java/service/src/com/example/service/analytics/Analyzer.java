package com.example.service.analytics;

import com.example.service.metrics.SummaryBuilder;
import com.example.service.model.Sample;
import com.example.service.model.Summary;
import com.example.service.util.Logger;

import java.util.List;

public final class Analyzer {
	private final SummaryBuilder builder;

	public Analyzer(SummaryBuilder builder) {
		this.builder = builder;
	}

	public Summary evaluate(List<Sample> samples) {
		Logger.info("evaluating " + samples.size() + " samples");
		Summary summary = builder.create(samples);
		Logger.info("average " + summary.average());
		return summary;
	}
}
