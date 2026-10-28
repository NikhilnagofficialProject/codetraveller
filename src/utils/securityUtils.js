/**
 * Utility functions for data sanitization and security.
 */

/**
 * Strips HTML tags and potential script injections from a string.
 * Used for sanitizing data fetched from external CSV sources.
 * 
 * @param {string} str - The string to sanitize.
 * @returns {string} - The sanitized string.
 */
export const sanitizeString = (str) => {
    if (!str || typeof str !== 'string') return '';
    
    // 1. Basic HTML stripping (aggressive)
    let sanitized = str.replace(/<[^>]*>?/gm, '');
    
    // 2. Remove common dangerous patterns if they escaped the tag strip
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/onclick/gi, '');
    sanitized = sanitized.replace(/onerror/gi, '');
    
    return sanitized.trim();
};

/**
 * Enforces HTTPS on a URL string.
 * @param {string} url 
 * @returns {string}
 */
export const enforceHttps = (url) => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('http://')) {
        return url.replace('http://', 'https://');
    }
    return url;
};
