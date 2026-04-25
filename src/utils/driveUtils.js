/**
 * Converts a Google Drive sharing link into a direct image URL.
 * Uses lh3.googleusercontent.com which works for publicly shared files
 * without "access denied" errors from the thumbnail API.
 */
export const toDirectDriveLink = (url) => {
    if (!url) return '';
    if (typeof url !== 'string') return '';
    url = url.trim();
    if (!url) return '';

    // If it's already an lh3 link, return as is
    if (url.includes('lh3.googleusercontent.com')) return url;

    // Not a drive link — return as-is (e.g. external image URLs)
    if (!url.includes('drive.google.com')) return url;

    let id = '';

    // Case 1: /file/d/ID/...
    const fileDMatch = url.match(/\/file\/d\/([^/?#]+)/);
    if (fileDMatch) {
        id = fileDMatch[1];
    } else {
        // Case 2: ?id=ID  or  &id=ID
        const idParamMatch = url.match(/[?&]id=([^&]+)/);
        if (idParamMatch) {
            id = idParamMatch[1];
        }
    }

    if (id) {
        // Using images.weserv.nl proxy to bypass Google Drive's 429 rate limits and CORS restrictions.
        // Adding =s1000 ensures the image is served at a good quality and can help avoid some 500 errors.
        return `https://images.weserv.nl/?url=https://lh3.googleusercontent.com/d/${id}=s1000`;
    }

    return url;
};
