
/**
 * security.ts - Security utilities for the application.
 * Centralizes sanitization and validation logic to prevent common vulnerabilities.
 */

/**
 * Sanitizes a URL to prevent XSS attacks via javascript: or other dangerous protocols.
 * Allows only http:, https:, mailto:, tel:, and relative paths.
 * Returns 'about:blank' if the URL is deemed unsafe.
 */
export const sanitizeUrl = (url: string | undefined | null): string => {
  if (!url) return '';

  const trimmedUrl = url.trim();

  // Whitelist safe protocols and relative paths
  if (
    trimmedUrl.startsWith('http://') ||
    trimmedUrl.startsWith('https://') ||
    trimmedUrl.startsWith('mailto:') ||
    trimmedUrl.startsWith('tel:') ||
    trimmedUrl.startsWith('/') ||
    trimmedUrl.startsWith('./')
  ) {
    return trimmedUrl;
  }

  // If it doesn't match the whitelist, it's potentially dangerous (e.g., javascript:alert(1))
  console.warn(`Blocked potentially unsafe URL: ${trimmedUrl}`);
  return 'about:blank';
};
