/**
 * security.ts - Centralized security utilities for the application.
 */

/**
 * Sanitizes a URL to prevent XSS attacks via javascript: or data: URIs.
 * Only allows safe protocols: http, https, mailto, tel.
 */
export function sanitizeUrl(url: string): string {
    if (!url) return 'about:blank';

    const sanitized = url.trim();

    // Whitelist safe protocols
    if (/^(https?|mailto|tel):/i.test(sanitized)) {
        return sanitized;
    }

    // Block potentially dangerous protocols
    if (/^(javascript|data):/i.test(sanitized)) {
        return 'about:blank';
    }

    // Allow relative paths starting with / or ./ or ../
    if (sanitized.startsWith('/') || sanitized.startsWith('./') || sanitized.startsWith('../')) {
        return sanitized;
    }

    // Default to about:blank if protocol is unknown or not in whitelist
    return 'about:blank';
}
