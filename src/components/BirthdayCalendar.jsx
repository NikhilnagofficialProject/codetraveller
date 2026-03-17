import React, { useMemo } from 'react';
import { useCalendarData } from '../hooks/useCalendarData';

const BirthdayCalendar = ({ onViewAll }) => {
    const { events, loading } = useCalendarData();

    const upcomingBirthdays = useMemo(() => {
        if (loading || Object.keys(events).length === 0) return [];

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();

        let upcoming = [];

        Object.entries(events).forEach(([key, dayEvents]) => {
            const [m, d] = key.split('-').map(Number);

            dayEvents.forEach(event => {
                upcoming.push({ ...event, m, d });
            });
        });

        upcoming = upcoming.filter(e => {
            if (e.m > currentMonth) return true;
            if (e.m === currentMonth && e.d >= currentDay) return true;
            return false;
        });

        upcoming.sort((a, b) => {
            if (a.m !== b.m) return a.m - b.m;
            return a.d - b.d;
        });

        return upcoming.slice(0, 3);
    }, [events, loading]);

    return (
        <div className="card border-0 shadow-sm mt-3" style={{ backgroundColor: '#1b1b1b', color: '#fff' }}>
            <div className="card-header border-0 bg-transparent fw-bold text-white d-flex justify-content-between align-items-center">
                <span>Calendar</span>
                <small
                    className="text-secondary"
                    style={{ cursor: 'pointer' }}
                    onClick={onViewAll}
                >
                    View all &gt;
                </small>
            </div>
            <div className="card-body pt-0">
                <div className="list-group list-group-flush">
                    {loading ? (
                        <div className="text-center text-secondary py-3">Loading...</div>
                    ) : (
                        upcomingBirthdays.length > 0 ? (
                            upcomingBirthdays.map((bday, idx) => (
                                <div key={idx} className="list-group-item bg-transparent border-secondary text-white d-flex align-items-center px-0">
                                    <img
                                        src={bday.image}
                                        alt={bday.character}
                                        className="rounded-circle me-3 border border-1 border-secondary"
                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    />
                                    <div className="flex-grow-1">
                                        <div className="fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>{bday.character}</div>
                                        <div className="small text-secondary">{bday.dateDisplay}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-secondary small">No upcoming birthdays soon.</div>
                        )
                    )}
                    <div className="text-center mt-3">
                        <small className="text-secondary">Upcoming Birthdays</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BirthdayCalendar;
