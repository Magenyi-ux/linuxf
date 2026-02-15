/**
 * lib/security.ts - Security utility functions
 * Centralized location for security-related logic to ensure consistent
 * protection across the application.
 */

/**
 * Sanitizes a URL to prevent Cross-Site Scripting (XSS) attacks.
 * It only allows safe protocols: http, https, mailto, tel.
 * If the URL is malicious (e.g., javascript: or data:), it returns 'about:blank'.
 *
 * @param url The raw URL string to be sanitized
 * @returns A safe version of the URL or 'about:blank' if unsafe
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';

  const trimmedUrl = url.trim();

  // Whitelist of safe protocols
  // Matches http://, https://, mailto:, and tel: (case-insensitive)
  const safeProtocolRegex = /^(https?|mailto|tel):/i;

  if (safeProtocolRegex.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // Allow relative paths starting with /
  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl;
  }

  // If it's a suspicious URL (like javascript: or data:), return a safe fallback
  // 'about:blank' is the standard safe fallback for blocked URLs
  console.warn(`[Sentinel] Blocked potentially malicious URL: ${trimmedUrl}`);
  return 'about:blank';
};
