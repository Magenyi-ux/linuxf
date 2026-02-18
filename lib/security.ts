
/**
 * security.ts - Security utilities for the application.
 * Centralizes security-related functions like input sanitization and URL validation.
 */

/**
 * Sanitizes a URL to prevent XSS through malicious protocols like javascript:
 * @param url The URL to sanitize
 * @returns A safe URL or 'about:blank' if the URL is dangerous
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';

  // Standardize the URL
  const trimmedUrl = url.trim();

  // Whitelist safe protocols
  const safeProtocols = /^(https?|mailto|tel):/i;

  // If it starts with a safe protocol, it's fine
  if (safeProtocols.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // Handle relative URLs (starting with / or ./)
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./')) {
    return trimmedUrl;
  }

  // Block dangerous protocols like javascript:, data:, vbscript:, etc.
  // Also block URLs that don't match our safe patterns
  console.warn(`Blocked potentially malicious URL: ${trimmedUrl}`);
  return 'about:blank';
};
