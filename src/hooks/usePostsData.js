import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

const cleanUrl = (url) => {
    if (!url) return null;
    url = url.trim();
    if (!url) return null;
    if (url.includes('google.com/url')) {
        try {
            const urlObj = new URL(url);
            const qParams = new URLSearchParams(urlObj.search);
            return qParams.get('q') || url;
        } catch (e) {
            return url;
        }
    }
    return url;
};

export const usePostsData = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPosts = useCallback(async (isBackground = false) => {
        if (isBackground) setRefreshing(true);
        else setLoading(true);

        try {
            const CSV_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTRe7S2uLO8jcpgYi-teDs6vdf7a6r6oZk-NXJTITK3z5-Ss0RukmknJCygBXOMdoWHOd7c-K7ITkWW/pub?gid=0&single=true&output=csv`;

            const response = await fetch(CSV_URL);
            const csvText = await response.text();

            // Use PapaParse for robust CSV parsing (handles multi-line fields, quotes, etc.)
            const result = await new Promise((resolve) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (res) => resolve(res)
                });
            });

            const rows = result.data;
            console.log(`[Posts] Total rows from sheet: ${rows.length}`);
            if (rows.length > 0) console.log('[Posts] Headers:', Object.keys(rows[0]));

            // Case-insensitive header lookup
            const getField = (row, ...keys) => {
                const headers = Object.keys(row);
                for (const k of keys) {
                    const found = headers.find(h => h.trim().toLowerCase() === k.toLowerCase());
                    if (found !== undefined && row[found] !== undefined && row[found] !== '') {
                        return row[found].trim();
                    }
                }
                return '';
            };

            const parseStat = (val) => {
                if (!val) return 0;
                const num = parseInt(String(val).replace(/,/g, ''), 10);
                return isNaN(num) ? 0 : num;
            };

            const parsedPosts = rows.map((row, idx) => {
                const title = getField(row, 'PostTitle', 'Title', 'title');
                if (!title) return null;   // skip rows with no title

                const rawUrl = getField(row, 'FullUrl', 'fullurl', 'url', 'URL');
                const imageStr = getField(row, 'CoverImageUrl', 'coverimageurl', 'image', 'Image');
                const rawContent = getField(row, 'Content', 'Description', 'Snippet', 'content') || '';
                const postId = getField(row, 'PostId', 'postid', 'id', 'ID') || String(idx + 1);

                let images = [];
                if (imageStr) {
                    images = imageStr.split(', ')
                        .map(s => s.trim())
                        .map(cleanUrl)
                        .filter(Boolean);
                }

                return {
                    postId,
                    subject: title,
                    content: rawContent,
                    cover_image_url: images.length > 0
                        ? images[0]
                        : (imageStr ? cleanUrl(imageStr) : `https://placehold.co/600x400/151725/FFF?text=${encodeURIComponent(title.substring(0, 20))}`),
                    images,
                    stat_view: parseStat(getField(row, 'Stat_View', 'stat_view', 'views', 'Views')),
                    stat_like: parseStat(getField(row, 'Stat_Like', 'stat_like', 'likes', 'Likes')),
                    stat_reply: parseStat(getField(row, 'Stat_Reply', 'stat_reply', 'replies', 'Replies', 'comments')),
                    collection: getField(row, 'CollectionTitle', 'collectiontitle', 'collection') || 'Uncategorized',
                    Builds: 'Genshin Impact',
                    url: cleanUrl(rawUrl)
                };
            }).filter(Boolean);

            console.log(`[Posts] Parsed ${parsedPosts.length} valid posts`);
            setPosts(parsedPosts);
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return { posts, loading, refreshing, refreshPosts: () => fetchPosts(true) };
};
