
/**
 * security.ts - Security utility functions
 * This file contains helpers for sanitizing inputs and preventing common web vulnerabilities.
 */

/**
 * Sanitizes a URL by whitelisting safe protocols.
 * Prevents XSS attacks via 'javascript:' or 'data:' URIs.
 *
 * @param url The URL to sanitize
 * @returns A safe URL string, or 'about:blank' if the input is malicious or invalid
 */
export function sanitizeUrl(url: string | undefined): string {
  if (!url) return 'about:blank';

  const trimmedUrl = url.trim();

  // Whitelist of safe protocols
  const safeProtocols = /^(https?|mailto|tel):/i;

  // If the URL matches a safe protocol, return it
  if (safeProtocols.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // If the URL is relative (starts with / or ./ or ../) and doesn't contain a protocol
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')) {
    // Check if it might be trying to trick the parser into being a protocol (e.g. "javascript:alert(1)")
    if (!trimmedUrl.includes(':')) {
      return trimmedUrl;
    }
  }

  // Fallback for unsafe or unknown protocols
  console.warn(`Blocked potentially unsafe URL: ${trimmedUrl}`);
  return 'about:blank';
}
