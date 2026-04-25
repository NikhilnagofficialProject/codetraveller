export const cleanHoyoContent = (text) => {
    if (!text) return '';

    let cleaned = text;

    // 1. Try to parse as JSON if it looks like an object or array
    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
        try {
            const data = JSON.parse(text);

            // Handle Structured Content (Array of inserts)
            if (Array.isArray(data)) {
                return data
                    .map(item => {
                        if (typeof item.insert === 'string') return item.insert;
                        return '';
                    })
                    .join('')
                    .trim();
            }

            // Handle Object with 'content' (full) or 'describe' (snippet)
            if (typeof data === 'object' && data !== null) {
                // Prioritize 'content' or 'subject' over 'describe' which is often a snippet
                cleaned = data.content || data.subject || data.describe || text;

                // If it picked an object/array accidentally (rare), convert to string
                if (typeof cleaned !== 'string') {
                    cleaned = JSON.stringify(cleaned);
                }
            }
        } catch (e) {
            // Fallback to regex cleaning if JSON parse fails
        }
    }

    // 2. Strip raw JSON keys and structural artifacts (Fallback/Legacy)
    // We use more specific regex to avoid over-cleaning or leaving garbage
    cleaned = cleaned.replace(/"describe":\s*"[^"]*"/g, ''); // Remove describe snippet if still present
    cleaned = cleaned.replace(/"imgs":\s*\[[^\]]*\]/g, ''); // Remove image arrays
    cleaned = cleaned.replace(/"insert":/g, '');
    cleaned = cleaned.replace(/"attributes":\s*{[^}]*}/g, ''); // Remove formatting attributes

    // 3. Handle literal escape sequences (convert to real characters)
    cleaned = cleaned.replace(/\\n/g, '\n');
    cleaned = cleaned.replace(/\\r/g, '\r');
    cleaned = cleaned.replace(/\\t/g, '\t');
    cleaned = cleaned.replace(/\\"/g, '"');

    // 4. Remove JSON-style braces/brackets and quotes at boundaries
    cleaned = cleaned.replace(/^[\[{\s"]+/, '');
    cleaned = cleaned.replace(/[\]}\s"]+$/, '');

    return cleaned.trim();
};