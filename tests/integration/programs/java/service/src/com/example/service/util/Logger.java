package com.example.service.util;

public final class Logger {
	private Logger() {}

	public static void info(String message) {
		System.out.println("INFO " + message);
	}
}
