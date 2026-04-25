import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import ArtisticView from './calendar/ArtisticView';
import CreditsFooter from './common/CreditsFooter';
import { useCalendarData } from '../hooks/useCalendarData';

const Calendar = ({ assets }) => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showArtisticDesktop, setShowArtisticDesktop] = useState(false);
    const [artisticRatio, setArtisticRatio] = useState('16/9');
    const calendarRef = useRef(null);

    const { events, loading } = useCalendarData();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setIsMobile(width * 1.5 < height || width < 768);
            const screenRatio = width / height;
            setArtisticRatio(screenRatio < 0.8 ? '9/18' : (screenRatio < 1.3 ? '12/10' : '16/9'));
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const handleDownload = async () => {
        if (!calendarRef.current) return;
        setIsDownloading(true);
        try {
            const dataUrl = await toPng(calendarRef.current, {
                quality: 1, pixelRatio: 3, cacheBust: true,
                filter: (node) => !node.classList?.contains('no-capture')
            });
            const link = document.createElement('a');
            link.download = `HoyoBlog-Calendar-${monthNames[currentDate.getMonth()]}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Download failed', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const renderDays = (isMinimal = false) => {
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} style={{ minHeight: isMinimal ? '35px' : '80px', backgroundColor: 'rgba(255,255,255,0.02)' }}></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const eventKey = `${currentDate.getMonth()}-${day}`;
            const dayEvents = events[eventKey] || [];
            const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth();

            days.push(
                <div key={day} className={`calendar-day p-1 position-relative ${isToday && !isMinimal ? 'bg-primary bg-opacity-10' : ''}`} style={{
                    minHeight: isMinimal ? '40px' : '100px',
                    backgroundColor: isMinimal ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    border: isMinimal ? 'none' : '1px solid rgba(255,255,255,0.05)'
                }}>
                    <span className="fw-bold text-white" style={{ fontSize: '0.9rem', opacity: isToday ? 1 : (isMinimal ? 0.9 : 0.4), position: isMinimal ? 'static' : 'absolute', top: '1px', right: '2px' }}>{day}</span>
                    {dayEvents.length > 0 && (
                        <div className={`d-flex flex-wrap gap-1 justify-content-center ${isMinimal ? 'mt-1' : 'pt-2'}`}>
                            {isMinimal ? <div className="rounded-circle bg-info" style={{ width: '4px', height: '4px' }}></div> :
                                dayEvents.map((ev, idx) => (
                                    <div key={idx} className="rounded-circle overflow-hidden border border-1 border-primary" style={{ width: '30px', height: '30px' }}>
                                        <img src={ev.image} alt="" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    const currentMonthBirthdays = [];
    Object.entries(events).forEach(([key, dayEvents]) => {
        if (key.startsWith(`${currentDate.getMonth()}-`)) {
            const day = parseInt(key.split('-')[1]);
            dayEvents.forEach(ev => currentMonthBirthdays.push({ ...ev, day }));
        }
    });
    currentMonthBirthdays.sort((a, b) => a.day - b.day);

    if (isMobile || showArtisticDesktop) {
        return (
            <div className="position-relative">
                <ArtisticView 
                    currentDate={currentDate} 
                    events={events} 
                    assets={assets} 
                    isMobile={isMobile} 
                    artisticRatio={artisticRatio} 
                    changeMonth={changeMonth} 
                    calendarRef={calendarRef} 
                    monthNames={monthNames} 
                    renderDays={renderDays} 
                />
                <div className="text-center mt-3 no-capture">
                    {showArtisticDesktop && <button className="btn btn-outline-secondary rounded-pill px-4 me-3" onClick={() => setShowArtisticDesktop(false)}>Back</button>}
                    <button className="btn btn-primary rounded-pill px-4 py-2 fw-bold" onClick={handleDownload} disabled={isDownloading}>
                        {isDownloading ? 'Generating...' : '📥 Download Wallpaper'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="calendar-container animate-fade-in">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ backgroundColor: '#151725' }}>
                <div className="card-body p-4 text-white">
                    <div className="row g-4">
                        <div className="col-lg-9">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="d-flex gap-2"><button className="btn btn-outline-secondary btn-sm" onClick={() => changeMonth(-1)}>&lt; Prev</button><button className="btn btn-outline-secondary btn-sm" onClick={() => changeMonth(1)}>Next &gt;</button></div>
                                <h2 className="m-0 fw-bold">{monthNames[currentDate.getMonth()]} <span className="text-secondary">{currentDate.getFullYear()}</span></h2>
                                <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setShowArtisticDesktop(true)}>Artistic & Download</button>
                            </div>
                            <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center text-uppercase fw-bold text-secondary small py-2">{d}</div>)}
                                {renderDays()}
                            </div>
                        </div>
                        <div className="col-lg-3 border-start border-secondary border-opacity-10 ps-4">
                            <h5 className="mb-4 text-secondary fw-bold border-bottom border-secondary border-opacity-25 pb-2">Birthdays</h5>
                            <div className="d-flex flex-column gap-3" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {loading ? <div className="text-center py-5">Loading...</div> :
                                    currentMonthBirthdays.length > 0 ? currentMonthBirthdays.map((ev, idx) => (
                                        <div key={idx} className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                            <div className="position-relative"><img src={ev.image} className="rounded-circle border border-primary" style={{ width: '45px', height: '45px', objectFit: 'cover' }} /><div className="position-absolute bottom-0 end-0 bg-primary text-white rounded-pill px-1 fw-bold" style={{ fontSize: '10px' }}>{ev.day}</div></div>
                                            <div className="flex-grow-1 min-w-0"><div className="fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>{ev.character}</div><div className="small text-secondary">{monthNames[currentDate.getMonth()]} {ev.day}</div></div>
                                        </div>
                                    )) : <div className="text-center text-muted small py-5">No birthdays.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <CreditsFooter />
        </div>
    );
};

export default Calendar;
