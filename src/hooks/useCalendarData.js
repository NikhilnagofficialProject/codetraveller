import { useState, useEffect } from 'react';
import { toDirectDriveLink } from '../utils/driveUtils';
import Papa from 'papaparse';

export const useCalendarData = () => {
    const [events, setEvents] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCalendarData = async () => {
            try {
                // Using the published CSV URL for the 'Genshin Data' tab
                const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTRe7S2uLO8jcpgYi-teDs6vdf7a6r6oZk-NXJTITK3z5-Ss0RukmknJCygBXOMdoWHOd7c-K7ITkWW/pub?gid=2033837238&single=true&output=csv`;

                const response = await fetch(SHEET_CSV_URL);
                const csvText = await response.text();

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
