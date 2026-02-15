
/**
 * security.ts - Security utilities for the application.
 * Focuses on preventing XSS and other common web vulnerabilities.
 */

/**
 * Sanitize a URL to prevent XSS attacks via javascript: or data: URIs.
 * Whitelists safe protocols: http, https, mailto, tel.
 * Returns 'about:blank' for unsafe URIs.
 */
export const sanitizeUrl = (url: string | undefined): string => {
  if (!url) return 'about:blank';

  const trimmedUrl = url.trim();

  // Regex to match safe protocols
  // Matches: http://, https://, mailto:, tel:
  const safeProtocolRegex = /^(https?|mailto|tel):/i;

  if (safeProtocolRegex.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // If it's a relative URL (doesn't start with a protocol or /), we can allow it if needed,
  // but for external sources from Gemini, we expect absolute URLs.
  // To be safe, we only allow absolute URLs with safe protocols or root-relative URLs.
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')) {
    return trimmedUrl;
  }

  // Log a warning if an unsafe URL was blocked (useful for debugging)
  console.warn(`Blocked unsafe URL: ${trimmedUrl}`);

  return 'about:blank';
};
