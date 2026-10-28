export const getImageUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    url = url.trim();
    if (!url) return '';

    // 1. Cloudinary — pass through as-is, just ensure HTTPS
    if (url.includes('res.cloudinary.com')) {
        return url.replace(/^http:\/\//i, 'https://');
    }

    // 2. Google Drive — proxy through weserv to fix CORS
    if (
        url.includes('drive.google.com') ||
        url.includes('drive.usercontent.google.com') ||
        url.includes('lh3.googleusercontent.com')
    ) {
        let id = '';
        const fileDMatch = url.match(/\/(?:file\/)?d\/([^/?#]+)/);
        const idParamMatch = url.match(/[?&]id=([^&]+)/);
        const lh3Match = url.match(/lh3\.googleusercontent\.com\/d\/([^=?]+)/);

        if (fileDMatch) id = fileDMatch[1];
        else if (idParamMatch) id = idParamMatch[1];
        else if (lh3Match) id = lh3Match[1];

        if (id) {
            const base = `https://lh3.googleusercontent.com/d/${id}=s0`;
            return `https://images.weserv.nl/?url=${encodeURIComponent(base)}&ssl=1&q=100`;
        }
    }

    // 3. Everything else (HoyoLab, external CDNs etc.) — just enforce HTTPS
    return url.replace(/^http:\/\//i, 'https://');
};

// Aliases kept so nothing else in the codebase breaks
export const toDirectDriveLink = (url) => getImageUrl(url);
export const getOptimizedImage = (_folder, _fileName, driveFallbackUrl) => getImageUrl(driveFallbackUrl);