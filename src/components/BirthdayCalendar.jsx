import React, { useMemo } from 'react';
import { useCalendarData } from '../hooks/useCalendarData';

const BirthdayCalendar = ({ assets, onViewAll }) => {
    const { events, loading } = useCalendarData();
    const cakeLogo = assets?.logos?.cake;


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
        <div className="container mt-2 mb-4 animate-fade-in">
            <div 
                className="rounded-4 p-3 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3"
                style={{ 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }}
            >
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <div className="d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                        {cakeLogo ? (
                            <img src={cakeLogo} alt="Cake" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '100%', height: '100%' }}>
                                <i className="bi bi-calendar-event text-white" style={{ fontSize: '0.9rem' }}></i>
                            </div>
                        )}
                    </div>
                    <h6 className="mb-0 fw-bold text-white-50 small text-uppercase" style={{ letterSpacing: '1px' }}>Upcoming Birthdays</h6>
                </div>

                <div className="d-flex align-items-center flex-grow-1 justify-content-center justify-content-md-start gap-4 overflow-hidden px-md-4">
                    {loading ? (
                        <div className="text-white-50 small animate-pulse">Scanning constellations...</div>
                    ) : (
                        upcomingBirthdays.length > 0 ? (
                            upcomingBirthdays.map((bday, idx) => (
                                <div key={idx} className="d-flex align-items-center gap-2" style={{ minWidth: 'auto' }}>
                                    <div className="position-relative">
                                        <img
                                            src={bday.image}
                                            alt={bday.character}
                                            className="rounded-circle border border-2 border-primary"
                                            style={{ width: '45px', height: '45px', objectFit: 'cover', padding: '2px' }}
                                        />
                                        <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle" style={{ width: '12px', height: '12px', border: '2px solid #0c0f1d' }}></div>
                                    </div>
                                    <div className="overflow-hidden d-none d-md-block" style={{ minWidth: '80px' }}>
                                        <div className="fw-bold text-white small text-truncate" style={{ fontSize: '0.85rem' }}>{bday.character}</div>
                                        <div className="text-primary fw-bold" style={{ fontSize: '0.75rem' }}>{bday.dateDisplay}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-white-50 small">No upcoming festivals found.</div>
                        )
                    )}
                </div>


                <button 
                    onClick={onViewAll}
                    className="btn btn-link text-primary text-decoration-none fw-bold small p-0 flex-shrink-0 hov-scale"
                    style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}
                >
                    VIEW ALL <i className="bi bi-chevron-right ms-1"></i>
                </button>
            </div>

            <style>{`
                .hov-scale:hover { transform: scale(1.05); color: white !important; }
                .animate-pulse { animation: pulse 2s infinite; }
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
            `}</style>
        </div>
    );

};

export default BirthdayCalendar;
