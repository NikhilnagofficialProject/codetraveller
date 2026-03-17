import { useState, useEffect } from 'react';
import characterMapping from '../utils/characterMapping';

const images = import.meta.glob('../assets/characters/portraits/*.webp', { eager: true });

export const useCalendarData = () => {
    const [events, setEvents] = useState({});
    const [loading, setLoading] = useState(true);

    const getCharacterImage = (characterName) => {
        const filename = characterMapping[characterName];
        if (!filename) return null;

        const key = `../assets/characters/portraits/${filename}`;
        return images[key]?.default || null;
    };

    useEffect(() => {
        const fetchCalendarData = async () => {
            try {
                const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTRe7S2uLO8jcpgYi-teDs6vdf7a6r6oZk-NXJTITK3z5-Ss0RukmknJCygBXOMdoWHOd7c-K7ITkWW/pub?gid=2033837238&single=true&output=csv`;

                const response = await fetch(SHEET_CSV_URL);
                const csvText = await response.text();

                const rows = csvText.split('\n').map(row => row.split(','));
                const headers = rows[0];

                const nameIndex = headers.findIndex(h => h.trim().toLowerCase() === 'name');
                const birthIndex = headers.findIndex(h => h.trim().toLowerCase() === 'date&monthofbirth');

                const parsedEvents = {};

                rows.slice(1).forEach(row => {
                    if (row.length <= Math.max(nameIndex, birthIndex)) return;

                    const name = row[nameIndex]?.trim();
                    const birthStr = row[birthIndex]?.trim();

                    if (name && birthStr) {
                        const dateParts = birthStr.split(' ');
                        if (dateParts.length >= 2) {
                            const monthName = dateParts[0];
                            const day = parseInt(dateParts[1]);
                            const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();

                            const key = `${monthIndex}-${day}`;

                            if (!parsedEvents[key]) {
                                parsedEvents[key] = [];
                            }

                            const imgSrc = getCharacterImage(name);
                            if (imgSrc) {
                                parsedEvents[key].push({
                                    character: name,
                                    image: imgSrc,
                                    dateDisplay: `${monthIndex + 1}/${day}`, // Simple display date
                                    monthIndex,
                                    day
                                });
                            }
                        }
                    }
                });

                setEvents(parsedEvents);
            } catch (error) {
                console.error("Failed to fetch calendar data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCalendarData();
    }, []);

    return { events, loading };
};
