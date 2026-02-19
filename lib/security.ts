/**
 * Sanitizes a URL to prevent XSS attacks via javascript: or data: URIs.
 * Only allows safe protocols (http, https, mailto, tel) and relative paths.
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return "about:blank";

  const trimmedUrl = url.trim();

  // Whitelist safe protocols
  const safeProtocols = ["http:", "https:", "mailto:", "tel:"];

  try {
    // Attempt to parse as an absolute URL
    const parsedUrl = new URL(trimmedUrl, window.location.origin);

    // Check if the protocol is in our safe list
    if (safeProtocols.includes(parsedUrl.protocol)) {
      return trimmedUrl;
    }

    // Check if it's a relative path (starting with / or ./)
    if (trimmedUrl.startsWith("/") || trimmedUrl.startsWith("./")) {
      return trimmedUrl;
    }
  } catch (e) {
    // If URL parsing fails, check if it's a relative path
    if (trimmedUrl.startsWith("/") || trimmedUrl.startsWith("./")) {
      return trimmedUrl;
    }
  }

  // Fallback to a safe URI
  return "about:blank";
};
