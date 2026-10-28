import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { sanitizeString } from '../utils/securityUtils';
import { toDirectDriveLink } from '../utils/driveUtils';

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

const getField = (row, ...keys) => {
    if (!row) return null;
    const rowHeaders = Object.keys(row);

    for (const key of keys) {
        const target = key.toLowerCase().replace(/[^a-z0-9]/g, '');

        const matchingHeader = rowHeaders.find(h => {
            const cleanedHeader = h.toLowerCase().replace(/[^a-z0-9]/g, '');
            return cleanedHeader === target;
        });

        if (matchingHeader) {
            const val = row[matchingHeader];
            if (val !== undefined && val !== null && String(val).trim() !== '') {
                return String(val).trim();
            }
        }
    }
    return null;
};

const parseStat = (val) => {
    if (!val) return 0;
    const num = parseInt(String(val).replace(/,/g, ''), 10);
    return isNaN(num) ? 0 : num;
};

export const usePostsData = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPosts = useCallback(async (isBackground = false) => {
        const CACHE_KEY = 'codetraveller_posts_cache';
        const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

        if (!isBackground) {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { posts: cachedPosts, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_TIME) {
                    setPosts(cachedPosts);
                    setLoading(false);
                    return;
                }
            }
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        try {
            const CSV_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTRe7S2uLO8jcpgYi-teDs6vdf7a6r6oZk-NXJTITK3z5-Ss0RukmknJCygBXOMdoWHOd7c-K7ITkWW/pub?gid=0&single=true&output=csv`;

            const response = await fetch(CSV_URL);
            const csvText = await response.text();

            const result = await new Promise((resolve) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (res) => resolve(res)
                });
            });

            const rows = result.data;
            const parsedPosts = rows.map((row, idx) => {
                const title = getField(row, 'PostTitle', 'Title', 'title');
                if (!title) return null;

                const rawUrl = getField(row, 'FullUrl', 'fullurl', 'url', 'URL');
                const imageStr = getField(row, 'CoverImageURL', 'CoverImageUrl', 'coverimageurl', 'image', 'Image');
                const rawContent = getField(row, 'Content', 'Description', 'Snippet', 'content', 'content') || '';
                const postId = getField(row, 'PostId', 'postid', 'id', 'ID') || String(idx + 1);

                let images = [];
                if (imageStr) {
                    images = imageStr.split(',')
                        .map(s => s.trim())
                        .map(cleanUrl)
                        .map(url => toDirectDriveLink(url))
                        .filter(Boolean);
                }

                return {
                    postId,
                    subject: sanitizeString(title),
                    content: sanitizeString(rawContent),
                    cover_image_url: images.length > 0
                        ? images[0]
                        : (imageStr ? toDirectDriveLink(cleanUrl(imageStr)) : `https://placehold.co/600x400/151725/FFF?text=${encodeURIComponent(title.substring(0, 20))}`),
                    images,
                    stat_view: parseStat(getField(row, 'Stat_View', 'stat_view', 'views', 'Views')),
                    stat_like: parseStat(getField(row, 'Stat_Like', 'stat_like', 'likes', 'Likes')),
                    stat_reply: parseStat(getField(row, 'Stat_Reply', 'stat_reply', 'replies', 'Replies', 'comments')),
                    collection: sanitizeString(getField(row, 'CollectionTitle', 'collectiontitle', 'collection') || 'Uncategorized'),
                    Builds: 'Genshin Impact',
                    url: cleanUrl(rawUrl)
                };
            }).filter(Boolean);
            setPosts(parsedPosts);

            localStorage.setItem(CACHE_KEY, JSON.stringify({
                posts: parsedPosts,
                timestamp: Date.now()
            }));

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
