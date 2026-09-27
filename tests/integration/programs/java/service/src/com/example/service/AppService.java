package com.example.service;

import com.example.service.analytics.Analyzer;
import com.example.service.data.Repository;
import com.example.service.model.Summary;

public final class AppService {
	private final Repository repository;
	private final Analyzer analyzer;

	public AppService(Repository repository, Analyzer analyzer) {
		this.repository = repository;
		this.analyzer = analyzer;
	}

	public Summary generate(String dataset) {
		return analyzer.evaluate(repository.fetch(dataset));
	}
}
