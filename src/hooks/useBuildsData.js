import { useState, useEffect } from 'react';
import Papa from 'papaparse';

const BUILDS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1LXZyd2YouGf10nJsHDSZC-fp7gyraW7Odcel4EdcI18/export?format=csv&gid=1203618170';
const METADATA_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1LXZyd2YouGf10nJsHDSZC-fp7gyraW7Odcel4EdcI18/export?format=csv&gid=2033837238';

export const useBuildsData = () => {
    const [builds, setBuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [buildsResponse, metaResponse] = await Promise.all([
                    fetch(BUILDS_SHEET_URL),
                    fetch(METADATA_SHEET_URL)
                ]);

                if (!buildsResponse.ok || !metaResponse.ok) {
                    throw new Error('Failed to fetch data from one or more sheets');
                }

                const buildsCsv = await buildsResponse.text();
                const metaCsv = await metaResponse.text();

                const parseCsv = (csv) => {
                    return new Promise((resolve) => {
                        Papa.parse(csv, {
                            header: true,
                            skipEmptyLines: true,
                            complete: (res) => resolve(res.data)
                        });
                    });
                };

                const buildsRaw = await parseCsv(buildsCsv);
                const metaRaw = await parseCsv(metaCsv);

                const metaMap = {};
                metaRaw.forEach(row => {

                    const get = (k) => row[Object.keys(row).find(key => key.toLowerCase().includes(k.toLowerCase()))];

                    const name = get('name');
                    if (name) {
                        metaMap[name.toLowerCase()] = {
                            correctName: name.trim(),
                            region: get('region') || 'Unknown',
                            weaponType: get('weapon') || 'Unknown',
                            releaseDate: get('release') || ''
                        };
                    }
                });

                const processed = buildsRaw.map((row, index) => {
                    const headers = Object.keys(row);
                    const findCol = (k) => headers.find(h => h.toLowerCase().includes(k.toLowerCase()));



                    const nameCol = findCol('name') || findCol('character');
                    const elementCol = findCol('vision') || findCol('element');
                    const weaponCol = findCol('weapon');
                    const rarityCol = findCol('rarity') || findCol('star');

                    const rawName = row[nameCol] || 'Unknown';
                    const lowerName = rawName.toLowerCase().trim();



                    let element = row[elementCol] || 'Anemo';
                    if (element.trim().toLowerCase() === 'animo') {
                        element = 'Anemo';
                    }



                    const meta = metaMap[lowerName] || {};

                    let finalName = meta.correctName || rawName;

                    let imageBaseName = finalName;
                    if (lowerName.includes('traveler') || lowerName === 'aether' || lowerName === 'lumine') {
                        imageBaseName = 'Aether';
                    }

                    const formatForFile = (n) => {
                        return n.replace(/[^a-zA-Z0-9 ]/g, '')
                            .split(' ')
                            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                            .join('_');
                    };

                    const formattedImageName = formatForFile(imageBaseName);

                    return {
                        id: index,
                        name: finalName,
                        rarity: row[rarityCol] || '4',
                        element: element,
                        weapon: row[weaponCol] || '',
                        weaponType: meta.weaponType || 'Unknown',
                        region: meta.region || 'Unknown',
                        role: row[findCol('role')] || '',
                        notes: row[findCol('note')] || '',
                        priority: row[headers.find(h => h.toLowerCase().includes('priority') && !h.toLowerCase().includes('talent'))] || '',
                        description: row[findCol('description')] || '',
                        mainStats: row[findCol('Main Stat')] || '',
                        subStats: row[findCol('sub')] || '',
                        talents: row[findCol('talent')] || '',
                        artifacts: row[findCol('artifact')] || '',
                        teams: row[findCol('team')] || '',
                        characterIcon: formattedImageName
                    };
                }).filter(b => b.name && b.name !== 'Unknown');

                setBuilds(processed);
                setLoading(false);

            } catch (err) {
                console.error('Data Fetch Error:', err);
                setError(err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { builds, loading, error };
};
