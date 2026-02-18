/**
 * security.ts - Security utilities for the application.
 */

/**
 * Sanitizes a URL to prevent XSS attacks via malicious protocols like 'javascript:'.
 * Whitelists safe protocols (http, https, mailto, tel) and relative paths.
 */
export const sanitizeUrl = (url: string | undefined): string => {
  if (!url) return 'about:blank';

  // Normalize the URL
  const trimmedUrl = url.trim();

  // Whitelist safe protocols and relative paths
  // Regex matches:
  // 1. http:// or https://
  // 2. mailto: or tel:
  // 3. Relative paths starting with /, ./, or ../
  const safeProtocolRegex = /^(https?|mailto|tel):|^(?:\/|\.\/|\.\.\/)/i;

  if (safeProtocolRegex.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // If the URL uses an unsafe protocol or is malformed, return 'about:blank'
  console.warn(`Blocked potentially malicious URL: ${trimmedUrl}`);
  return 'about:blank';
};
