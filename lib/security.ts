/**
 * lib/security.ts - Security Utility Functions
 * This file contains helpers to mitigate common web vulnerabilities.
 */

/**
 * Sanitizes a URL to prevent Cross-Site Scripting (XSS) attacks.
 * It specifically blocks 'javascript:' and 'data:' URIs which can be used to execute
 * malicious code when rendered in an 'href' attribute of an anchor tag.
 *
 * @param url - The raw URL string to sanitize
 * @returns A safe URL string or '#' if the input is malicious/invalid
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '#';

  // Remove any whitespace and convert to lowercase for protocol check
  const trimmedUrl = url.trim();
  const lowerUrl = trimmedUrl.toLowerCase();

  // Block common XSS vectors in href attributes
  if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:')) {
    console.warn('Blocked a potentially malicious URL:', trimmedUrl);
    return '#';
  }

  // Check for safe protocols
  // In this app, we mostly expect http, https, and possibly relative paths
  const isSafeProtocol =
    lowerUrl.startsWith('http://') ||
    lowerUrl.startsWith('https://') ||
    lowerUrl.startsWith('mailto:') ||
    lowerUrl.startsWith('tel:') ||
    lowerUrl.startsWith('/') ||
    lowerUrl.startsWith('#');

  if (!isSafeProtocol) {
    // If it doesn't match a known safe protocol, it might be a malformed
    // URL or another protocol (like ftp:), which we treat as unsafe for this context.
    return '#';
  }

  return trimmedUrl;
};
