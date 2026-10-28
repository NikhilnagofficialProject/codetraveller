import { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/driveUtils';
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
                const MONTH_MAP = {
                    'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
                    'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11,
                    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
                };

                data.forEach(row => {
                    const name = row['Name'] || row['name'];
                    const birthStr = row['Date&MonthofBirth'] || row['DOB'];
                    const portraitUrl = row['Portrait'];
                    const uname = row['UName'] || '';

                    if (name && birthStr && !uname.toLowerCase().includes('traveler')) {
                        const dateParts = birthStr.trim().split(/\s+/);
                        if (dateParts.length >= 2) {
                            let monthName = dateParts[0].toLowerCase().trim();
                            let day = parseInt(dateParts[1]);
                            let monthIndex = MONTH_MAP[monthName];

                            if (monthIndex === undefined) {
                                // Try the other way around: Day Month (e.g. "12 January")
                                monthName = dateParts[1]?.toLowerCase().trim();
                                day = parseInt(dateParts[0]);
                                monthIndex = MONTH_MAP[monthName];
                            }

                            if (monthIndex !== undefined && !isNaN(day)) {
                                const key = `${monthIndex}-${day}`;

                                if (!parsedEvents[key]) {
                                    parsedEvents[key] = [];
                                }

                                parsedEvents[key].push({
                                    character: name,
                                    image: getImageUrl(portraitUrl) || `https://ui-avatars.com/api/?name=${name}&background=random&color=fff`,
                                    dateDisplay: `${monthIndex + 1}/${day}`,
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
