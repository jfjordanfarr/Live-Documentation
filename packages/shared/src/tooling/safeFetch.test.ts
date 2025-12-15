import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  safeFetch,
  isLocalhostHost,
  validateNetworkPolicy,
  NetworkPolicyViolation
} from "./safeFetch";

describe("isLocalhostHost", () => {
  it("returns true for 'localhost'", () => {
    expect(isLocalhostHost("localhost")).toBe(true);
  });

  it("returns true for 'LOCALHOST' (case-insensitive)", () => {
    expect(isLocalhostHost("LOCALHOST")).toBe(true);
  });

  it("returns true for '127.0.0.1'", () => {
    expect(isLocalhostHost("127.0.0.1")).toBe(true);
  });

  it("returns true for IPv4 loopback range (127.x.x.x)", () => {
    expect(isLocalhostHost("127.0.0.2")).toBe(true);
    expect(isLocalhostHost("127.255.255.255")).toBe(true);
  });

  it("returns true for '::1' (IPv6 loopback)", () => {
    expect(isLocalhostHost("::1")).toBe(true);
  });

  it("returns true for subdomains of localhost", () => {
    expect(isLocalhostHost("api.localhost")).toBe(true);
    expect(isLocalhostHost("test.api.localhost")).toBe(true);
  });

  it("returns false for external hostnames", () => {
    expect(isLocalhostHost("api.openai.com")).toBe(false);
    expect(isLocalhostHost("example.com")).toBe(false);
    expect(isLocalhostHost("ollama.ai")).toBe(false);
  });

  it("returns false for IP addresses that are not loopback", () => {
    expect(isLocalhostHost("192.168.1.1")).toBe(false);
    expect(isLocalhostHost("10.0.0.1")).toBe(false);
    expect(isLocalhostHost("8.8.8.8")).toBe(false);
  });

  it("returns false for hostnames containing 'localhost' as substring", () => {
    expect(isLocalhostHost("notlocalhost.com")).toBe(false);
    expect(isLocalhostHost("localhost.evil.com")).toBe(false);
  });
});

describe("validateNetworkPolicy", () => {
  it("returns valid: true for localhost URLs", () => {
    expect(validateNetworkPolicy("http://localhost:11434/api/chat")).toEqual({
      valid: true
    });
    expect(validateNetworkPolicy("http://127.0.0.1:8080/")).toEqual({
      valid: true
    });
    expect(validateNetworkPolicy(new URL("http://[::1]:3000/"))).toEqual({
      valid: true
    });
  });

  it("returns valid: false for external URLs", () => {
    const result = validateNetworkPolicy("https://api.openai.com/v1/chat");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.hostname).toBe("api.openai.com");
      expect(result.reason).toContain("not localhost");
    }
  });

  it("returns valid: false for invalid URLs", () => {
    const result = validateNetworkPolicy("not-a-url");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("Invalid URL");
    }
  });
});

describe("safeFetch", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Mock fetch to avoid actual network calls
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("allows requests to localhost", async () => {
    const response = await safeFetch("http://localhost:11434/api/chat");
    expect(response.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:11434/api/chat",
      undefined
    );
  });

  it("allows requests to 127.0.0.1", async () => {
    const response = await safeFetch("http://127.0.0.1:8080/api/test", {
      method: "POST"
    });
    expect(response.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8080/api/test",
      { method: "POST" }
    );
  });

  it("throws NetworkPolicyViolation for external hosts", async () => {
    await expect(
      safeFetch("https://api.openai.com/v1/chat/completions")
    ).rejects.toThrow(NetworkPolicyViolation);

    await expect(
      safeFetch("https://api.openai.com/v1/chat/completions")
    ).rejects.toThrow(/blocked outbound request to "api.openai.com"/);

    // Verify fetch was never called
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("throws NetworkPolicyViolation for Ollama cloud endpoints", async () => {
    // Ollama's cloud service (if they have one)
    await expect(safeFetch("https://ollama.ai/api/chat")).rejects.toThrow(
      NetworkPolicyViolation
    );
  });

  it("includes helpful error message with SECURITY.md reference", async () => {
    try {
      await safeFetch("https://evil.com/exfiltrate");
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(NetworkPolicyViolation);
      expect((error as Error).message).toContain("SECURITY.md");
    }
  });

  it("throws regular Error if fetch is unavailable", async () => {
    // @ts-expect-error — intentionally removing fetch
    globalThis.fetch = undefined;

    await expect(safeFetch("http://localhost:11434/api/chat")).rejects.toThrow(
      /Global fetch API is not available/
    );
  });
});

describe("NetworkPolicyViolation", () => {
  it("includes the attempted host in the error", () => {
    const error = new NetworkPolicyViolation(
      "Blocked request",
      "api.openai.com"
    );
    expect(error.name).toBe("NetworkPolicyViolation");
    expect(error.attemptedHost).toBe("api.openai.com");
    expect(error.message).toBe("Blocked request");
  });
});
