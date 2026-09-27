package com.example.service.data;

import com.example.service.model.Sample;
import com.example.service.util.Logger;

import java.util.List;

public final class Repository {
	private final SourceRegistry registry;

	public Repository(SourceRegistry registry) {
		this.registry = registry;
	}

	public List<Sample> fetch(String dataset) {
		Logger.info("fetching dataset " + dataset);
		return registry.resolve(dataset);
	}
}
