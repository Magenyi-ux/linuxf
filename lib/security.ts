
/**
 * security.ts - Security utility functions for the application.
 */

/**
 * Sanitizes a URL to prevent XSS attacks via javascript: or data: protocols.
 * Only allows a whitelist of safe protocols.
 *
 * @param url The URL to sanitize
 * @returns A safe URL or 'about:blank' if the URL is dangerous
 */
export const sanitizeUrl = (url: string | undefined): string => {
  if (!url) return 'about:blank';

  const trimmedUrl = url.trim();

  // Whitelist of safe protocols
  const safeProtocolRegex = /^(https?|mailto|tel):/i;

  // If the URL matches a safe protocol, it's considered safe
  if (safeProtocolRegex.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // Relative URLs starting with / or ./ or ../ are also generally safe
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')) {
    return trimmedUrl;
  }

  // Fallback for potentially dangerous URLs
  console.warn(`Blocked potentially dangerous URL: ${trimmedUrl}`);
  return 'about:blank';
};
