/**
 * Converts a Google Drive sharing link into a direct image URL.
 * Uses lh3.googleusercontent.com which works for publicly shared files
 * without "access denied" errors from the thumbnail API.
 */
export const toDirectDriveLink = (url, bypassProxy = false) => {
    if (!url) return '';
    if (typeof url !== 'string') return '';
    url = url.trim();
    if (!url) return '';

    // If it's already an lh3 link, ensure https and return as is
    if (url.includes('lh3.googleusercontent.com')) return url.replace(/^http:\/\//i, 'https://');

    // Not a drive link — ensure https if it's an external URL
    if (!url.includes('drive.google.com') && !url.includes('drive.usercontent.google.com')) {
        return url.replace(/^http:\/\//i, 'https://');
    }

    let id = '';

    // Case 1: /file/d/ID/... or /d/ID/...
    const fileDMatch = url.match(/\/(?:file\/)?d\/([^/?#]+)/);
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
        const baseUrl = `https://lh3.googleusercontent.com/d/${id}`;
        const quality = bypassProxy ? '2000' : '1000';
        // We use weserv proxy because it provides CORS headers required for the 'Artistic Downloader'
        return `https://images.weserv.nl/?url=${encodeURIComponent(baseUrl + '=s' + quality)}&ssl=1`;
    }

    return url;
};
