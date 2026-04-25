import { useState, useEffect, useCallback } from 'react';
<<<<<<< HEAD
import Papa from 'papaparse';

const cleanUrl = (url) => {
    if (!url) return null;
    url = url.trim();
    if (!url) return null;
=======
import { parseCSV } from '../utils/csvParser';

const cleanUrl = (url) => {
    if (!url) return null;
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
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

<<<<<<< HEAD
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
=======
            const rows = parseCSV(csvText);
            const headers = rows[0];

            const idIndex = headers.findIndex(h => h.trim().toLowerCase() === 'postid');
            const titleIndex = headers.findIndex(h => h.trim().toLowerCase() === 'posttitle');
            const urlIndex = headers.findIndex(h => h.trim().toLowerCase() === 'fullurl');
            const imageIndex = headers.findIndex(h => h.trim().toLowerCase() === 'coverimageurl');
            const contentIndex = headers.findIndex(h => {
                const val = h.trim().toLowerCase();
                return val === 'content' || val === 'description' || val === 'snippet';
            });

            const viewIndex = headers.findIndex(h => {
                const val = h.trim().toLowerCase();
                return val === 'stat_view' || val === 'views' || val === 'view';
            });
            const likeIndex = headers.findIndex(h => {
                const val = h.trim().toLowerCase();
                return val === 'stat_like' || val === 'likes' || val === 'like';
            });
            const replyIndex = headers.findIndex(h => {
                const val = h.trim().toLowerCase();
                return val === 'stat_reply' || val === 'replies' || val === 'reply' || val === 'comments';
            });

            const collectionIndex = headers.findIndex(h => h.trim().toLowerCase() === 'collectiontitle');

            const parsedPosts = rows.slice(1).map((row, idx) => {
                const title = row[titleIndex]?.trim();
                if (!title) return null;

                const rawUrl = row[urlIndex]?.trim();
                const imageStr = row[imageIndex]?.trim();
                const rawContent = row[contentIndex]?.trim() || '';
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb

                let images = [];
                if (imageStr) {
                    images = imageStr.split(', ')
                        .map(s => s.trim())
                        .map(cleanUrl)
                        .filter(Boolean);
                }

<<<<<<< HEAD
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
=======
                const parseStat = (val) => {
                    if (!val) return 0;
                    const num = parseInt(val.replace(/,/g, ''), 10);
                    return isNaN(num) ? 0 : num;
                };

                return {
                    postId: row[idIndex]?.trim() || idx,
                    subject: title,
                    content: rawContent,
                    cover_image_url: images.length > 0 ? images[0] : (
                        imageStr ? cleanUrl(imageStr) : `https://placehold.co/600x400/151725/FFF?text=${encodeURIComponent(title.substring(0, 20))}`
                    ),
                    images: images,
                    stat_view: parseStat(row[viewIndex]),
                    stat_like: parseStat(row[likeIndex]),
                    stat_reply: parseStat(row[replyIndex]),
                    collection: row[collectionIndex]?.trim() || 'Uncategorized',
                    Builds: "Genshin Impact",
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
                    url: cleanUrl(rawUrl)
                };
            }).filter(Boolean);

<<<<<<< HEAD
            console.log(`[Posts] Parsed ${parsedPosts.length} valid posts`);
            setPosts(parsedPosts);
        } catch (error) {
            console.error('Failed to fetch posts', error);
=======
            setPosts(parsedPosts);
        } catch (error) {
            console.error("Failed to fetch posts", error);
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
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
