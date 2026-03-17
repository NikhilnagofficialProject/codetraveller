import { useState, useEffect, useCallback } from 'react';
import { parseCSV } from '../utils/csvParser';

const cleanUrl = (url) => {
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

                let images = [];
                if (imageStr) {
                    images = imageStr.split(', ')
                        .map(s => s.trim())
                        .map(cleanUrl)
                        .filter(Boolean);
                }

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
                    url: cleanUrl(rawUrl)
                };
            }).filter(Boolean);

            setPosts(parsedPosts);
        } catch (error) {
            console.error("Failed to fetch posts", error);
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
