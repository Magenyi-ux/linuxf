/**
 * security.ts - Centralized security utilities for the application.
 */

/**
 * Sanitizes a URL to prevent XSS attacks via javascript: or data: URIs.
 * Only allows safe protocols: http, https, mailto, and tel.
 */
export const sanitizeUrl = (url: string | undefined | null): string => {
  if (!url) return '#';

  const trimmedUrl = url.trim();

  // Regex to check if the URL starts with a safe protocol
  // ^[a-z0-9+.-]+: matches the protocol part
  const safeProtocolRegex = /^(https?|mailto|tel):/i;

  if (safeProtocolRegex.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // If it's a relative path (starts with / or ./ or ../), it's generally safe for this app
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')) {
    return trimmedUrl;
  }

  console.warn(`Blocked potentially unsafe URL: ${trimmedUrl}`);
  return 'about:blank';
};
