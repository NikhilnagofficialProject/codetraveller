import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { toDirectDriveLink } from '../utils/driveUtils';
import Papa from 'papaparse';
=======
import characterMapping from '../utils/characterMapping';

const images = import.meta.glob('../assets/characters/portraits/*.webp', { eager: true });
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb

export const useCalendarData = () => {
    const [events, setEvents] = useState({});
    const [loading, setLoading] = useState(true);

<<<<<<< HEAD
    useEffect(() => {
        const fetchCalendarData = async () => {
            try {
                // Using the published CSV URL for the 'Genshin Data' tab
=======
    const getCharacterImage = (characterName) => {
        const filename = characterMapping[characterName];
        if (!filename) return null;

        const key = `../assets/characters/portraits/${filename}`;
        return images[key]?.default || null;
    };

    useEffect(() => {
        const fetchCalendarData = async () => {
            try {
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
                const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTRe7S2uLO8jcpgYi-teDs6vdf7a6r6oZk-NXJTITK3z5-Ss0RukmknJCygBXOMdoWHOd7c-K7ITkWW/pub?gid=2033837238&single=true&output=csv`;

                const response = await fetch(SHEET_CSV_URL);
                const csvText = await response.text();

<<<<<<< HEAD
                const results = Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true
                });

                const data = results.data;
                const parsedEvents = {};

                data.forEach(row => {
                    const name = row['Name'] || row['name'];
                    const birthStr = row['Date&MonthofBirth'] || row['DOB'];
                    const portraitUrl = row['Portrait'];
                    const uname = row['UName'] || '';

                    // Exclude Traveler and entries without birth dates
                    if (name && birthStr && !uname.toLowerCase().includes('traveler')) {
                        const dateParts = birthStr.trim().split(/\s+/);
                        if (dateParts.length >= 2) {
                            const monthName = dateParts[0];
                            const day = parseInt(dateParts[1]);
                            
                            try {
                                const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
                                if (isNaN(monthIndex)) return;

                                const key = `${monthIndex}-${day}`;

                                if (!parsedEvents[key]) {
                                    parsedEvents[key] = [];
                                }

                                parsedEvents[key].push({
                                    character: name,
                                    image: toDirectDriveLink(portraitUrl),
                                    dateDisplay: `${monthIndex + 1}/${day}`,
                                    monthIndex,
                                    day
                                });
                            } catch (e) {
                                console.warn(`Invalid date format for ${name}: ${birthStr}`);
=======
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
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
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
