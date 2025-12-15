/**
 * safeFetch.ts — Localhost-only fetch wrapper for network isolation guarantee.
 *
 * This module enforces a strict network policy: only localhost addresses are permitted.
 * Any attempt to fetch from a non-localhost URL will throw a NetworkPolicyViolation error.
 *
 * This provides defense-in-depth for security-conscious environments (e.g., PCI-DSS)
 * where outbound internet access must be provably prevented.
 *
 * @module
 */

/**
 * Error thrown when a network request violates the localhost-only policy.
 */
export class NetworkPolicyViolation extends Error {
  constructor(
    message: string,
    public readonly attemptedHost: string
  ) {
    super(message);
    this.name = "NetworkPolicyViolation";
  }
}

/**
 * Localhost patterns that are considered safe.
 * - `localhost` — Standard loopback hostname
 * - `127.0.0.1` — IPv4 loopback
 * - `::1` — IPv6 loopback
 * - `*.localhost` — Subdomain convention (RFC 6761)
 */
const LOCALHOST_PATTERNS = ["localhost", "127.0.0.1", "::1"] as const;

/**
 * Determines whether a hostname is a localhost address.
 *
 * @param hostname - The hostname to check (e.g., "localhost", "127.0.0.1", "api.example.com")
 * @returns true if the hostname resolves to localhost, false otherwise
 */
export function isLocalhostHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();

  // Direct match
  if ((LOCALHOST_PATTERNS as readonly string[]).includes(normalized)) {
    return true;
  }

  // IPv6 loopback with brackets (as parsed from URL)
  if (normalized === "[::1]") {
    return true;
  }

  // Subdomain of localhost (e.g., "api.localhost")
  if (normalized.endsWith(".localhost")) {
    return true;
  }

  // IPv4 loopback range: 127.0.0.0/8
  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(normalized)) {
    return true;
  }

  return false;
}

/**
 * A fetch wrapper that enforces localhost-only network access.
 *
 * Use this instead of raw `fetch()` in any code that should never contact the open internet.
 * The wrapper validates the URL before making the request and throws if the host is not localhost.
 *
 * @param url - The URL to fetch (string or URL object)
 * @param init - Optional fetch init options (same as native fetch)
 * @returns A Promise resolving to the Response (same as native fetch)
 * @throws {NetworkPolicyViolation} If the URL's hostname is not localhost
 * @throws {Error} If fetch is not available (Node < 18)
 *
 * @example
 * ```typescript
 * // Safe: localhost request
 * const response = await safeFetch("http://localhost:11434/api/chat", { method: "POST" });
 *
 * // Throws NetworkPolicyViolation: blocked request to "api.openai.com"
 * const response = await safeFetch("https://api.openai.com/v1/chat");
 * ```
 */
export async function safeFetch(
  url: string | URL,
  init?: RequestInit
): Promise<Response> {
  const fetchFn: typeof fetch | undefined = (
    globalThis as typeof globalThis & { fetch?: typeof fetch }
  ).fetch;

  if (!fetchFn) {
    throw new Error(
      "Global fetch API is not available; upgrade to Node 18+ or provide a polyfill"
    );
  }

  const parsed = typeof url === "string" ? new URL(url) : url;
  const hostname = parsed.hostname;

  if (!isLocalhostHost(hostname)) {
    throw new NetworkPolicyViolation(
      `Network policy violation: blocked outbound request to "${hostname}". ` +
        `Live Documentation enforces localhost-only network access for security. ` +
        `See SECURITY.md for details.`,
      hostname
    );
  }

  return fetchFn(url, init);
}

/**
 * Validates a URL against the localhost-only policy without making a request.
 *
 * Useful for pre-validating user-provided endpoints before attempting to use them.
 *
 * @param url - The URL to validate (string or URL object)
 * @returns An object with `valid: true` if allowed, or `valid: false` with `reason` if blocked
 *
 * @example
 * ```typescript
 * const check = validateNetworkPolicy("https://api.openai.com/v1");
 * if (!check.valid) {
 *   console.error(`Blocked: ${check.reason}`);
 * }
 * ```
 */
export function validateNetworkPolicy(url: string | URL): {
  valid: true;
} | {
  valid: false;
  reason: string;
  hostname: string;
} {
  try {
    const parsed = typeof url === "string" ? new URL(url) : url;
    const hostname = parsed.hostname;

    if (isLocalhostHost(hostname)) {
      return { valid: true };
    }

    return {
      valid: false,
      reason: `Host "${hostname}" is not localhost. Only localhost, 127.0.0.1, and ::1 are permitted.`,
      hostname
    };
  } catch (error) {
    return {
      valid: false,
      reason: `Invalid URL: ${error instanceof Error ? error.message : String(error)}`,
      hostname: ""
    };
  }
}
