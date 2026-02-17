/**
 * Sanitizes a URL to prevent XSS attacks by whitelisting safe protocols.
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';

  const sanitized = url.trim();

  // Whitelist of safe protocols: http, https, mailto, tel
  // This prevents javascript: and data: URIs from being used in href attributes
  if (
    /^(https?|mailto|tel):/i.test(sanitized)
  ) {
    return sanitized;
  }

  // Default to a safe fallback if the protocol is not whitelisted
  return 'about:blank';
};
