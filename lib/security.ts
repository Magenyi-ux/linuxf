
/**
 * security.ts - Security utilities for the application.
 */

/**
 * Sanitizes a URL to prevent XSS attacks via javascript: or other malicious URI schemes.
 * Only allows safe protocols: http, https, mailto, tel, and relative paths.
 *
 * @param url The URL to sanitize
 * @returns The sanitized URL or 'about:blank' if the URL is malicious
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';

  const trimmedUrl = url.trim();

  // Allow relative paths starting with / or ./
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./')) {
    return trimmedUrl;
  }

  // Whitelist safe protocols
  const safeProtocolRegex = /^(https?|mailto|tel):/i;
  if (safeProtocolRegex.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // If it doesn't match any safe pattern, return about:blank
  console.warn(`Blocked potentially malicious URL: ${trimmedUrl}`);
  return 'about:blank';
};
