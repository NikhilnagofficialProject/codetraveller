import React, { useState, useEffect, useRef } from 'react';
import characterMapping from '../utils/characterMapping';
import { toPng } from 'html-to-image';

const portraitImages = import.meta.glob('../assets/characters/portraits/*.webp', { eager: true });
const mobileWallpapers = import.meta.glob('../assets/calendar/mobile/*.webp', { eager: true });
const windowsWallpapers = import.meta.glob('../assets/calendar/windows/*.webp', { eager: true });

const Calendar = () => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);
    const [events, setEvents] = useState({});
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showArtisticDesktop, setShowArtisticDesktop] = useState(false);
    const calendarRef = useRef(null);

    const [artisticRatio, setArtisticRatio] = useState('16/9');

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setIsMobile(width * 1.5 < height || width < 768);

            const screenRatio = width / height;
            if (screenRatio < 0.8) {
                setArtisticRatio('9/18'); // Tall Mobile
            } else if (screenRatio < 1.3) {
                setArtisticRatio('12/10'); // Tablet/iPad
            } else {
                setArtisticRatio('16/9'); // Desktop
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getCharacterImage = (characterName) => {
        const filename = characterMapping[characterName];
        if (!filename) return null;

        const key = `../assets/characters/portraits/${filename}`;
        return portraitImages[key]?.default || null;
    };

    const getWallpaper = (isMobileView) => {
        const monthIndex = currentDate.getMonth();
        const monthName = monthKeys[monthIndex];
        const folder = isMobileView ? 'mobile' : 'windows';
        const wallpapers = isMobileView ? mobileWallpapers : windowsWallpapers;

        const fileName = Object.keys(wallpapers).find(path => {
            const file = path.split('/').pop().toLowerCase();
            if (monthName === 'nov' && file.startsWith('nev')) return true;
            return file.startsWith(monthName);
        });

        return fileName ? (wallpapers[fileName]?.default || wallpapers[fileName]) : null;
    };

    const handleDownload = async () => {
        if (!calendarRef.current) return;

        setIsDownloading(true);
        try {
            const filter = (node) => {
                if (node.classList && node.classList.contains('no-capture')) {
                    return false;
                }
                return true;
            };

            const dataUrl = await toPng(calendarRef.current, {
                quality: 1,
                pixelRatio: 3, // Premium 4K-ready quality
                cacheBust: true,
                filter: filter
            });
            const link = document.createElement('a');
            link.download = `HoyoBlog-Calendar-${monthNames[currentDate.getMonth()]}-${currentDate.getFullYear()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Download failed', error);
        } finally {
            setIsDownloading(false);
        }
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
                                    type: 'Birthday'
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

    const getDaysInMonth = (date) => {
        const month = date.getMonth();
        return new Date(date.getFullYear(), month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const month = date.getMonth();
        return new Date(date.getFullYear(), month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(newDate);
    };

    const getMonthBirthdays = () => {
        const monthIndex = currentDate.getMonth();
        const birthdays = [];
        Object.entries(events).forEach(([key, dayEvents]) => {
            const [m, d] = key.split('-').map(Number);
            if (m === monthIndex) {
                dayEvents.forEach(ev => {
                    birthdays.push({ ...ev, day: d });
                });
            }
        });
        return birthdays.sort((a, b) => a.day - b.day);
    };

    const renderDays = (isMinimal = false) => {
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty" style={{
                backgroundColor: isMinimal ? 'transparent' : 'rgba(255,255,255,0.02)',
                minHeight: isMinimal ? '35px' : '80px'
            }}></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const eventKey = `${currentDate.getMonth()}-${day}`;
            const dayEvents = events[eventKey] || [];
            const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

            const dayOfWeek = (firstDay + day - 1) % 7;
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            days.push(
                <div
                    key={day}
                    className={`calendar-day p-1 position-relative ${!isMinimal ? 'border border-secondary border-opacity-10' : ''} ${isToday && !isMinimal ? 'bg-primary bg-opacity-10' : ''}`}
                    style={{
                        minHeight: isMinimal ? '40px' : '100px',
                        backgroundColor: isMinimal ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <span
                        className={`fw-bold ${isMinimal ? (isWeekend ? 'text-info' : 'text-white') : 'text-white'}`}
                        style={{
                            fontSize: isMinimal ? '0.9rem' : '0.9rem',
                            opacity: isToday ? 1 : (isMinimal ? 0.9 : 0.4),
                            position: isMinimal ? 'static' : 'absolute',
                            top: isMinimal ? 'auto' : '0',
                            right: isMinimal ? 'auto' : '0',
                            margin: isMinimal ? '0' : '1px'
                        }}
                    >
                        {day}
                    </span>

                    {isMinimal && dayEvents.length > 0 && (
                        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-1">
                            <div className="rounded-circle bg-info" style={{ width: '4px', height: '4px', boxShadow: '0 0 5px rgba(0, 255, 255, 0.5)' }}></div>
                        </div>
                    )}

                    {!isMinimal && !loading && dayEvents.length > 0 && (
                        <div className="d-flex flex-wrap gap-1 justify-content-center align-items-center h-100 pt-2">
                            {dayEvents.map((ev, idx) => (
                                <div key={idx} className="rounded-circle overflow-hidden border border-1 border-primary" style={{ width: '32px', height: '32px' }}>
                                    <img src={ev.image} alt={ev.character} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    const currentMonthBirthdays = getMonthBirthdays();
    const wallpaper = getWallpaper(isMobile);

    const ArtisticGrid = () => (
        <div
            className="minimalist-calendar-overlay p-2 p-md-3 rounded-4"
            style={{
                width: '100%',
                maxWidth: '280px',
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxSizing: 'border-box'
            }}
        >
            <div className="d-flex align-items-baseline gap-2 mb-1">
                <h2 className="m-0 fw-bold text-white lh-1" style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', letterSpacing: '1px' }}>
                    {monthNames[currentDate.getMonth()]}
                </h2>
                <h4 className="m-0 fw-light text-white-50 lh-1" style={{ fontSize: '1rem' }}>
                    {currentDate.getFullYear()}
                </h4>
            </div>

            <div className="d-grid mb-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '0' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className={`text-center small fw-bold py-1 ${i === 0 || i === 6 ? 'text-info' : 'text-white'}`} style={{ fontSize: '0.7rem' }}>{d}</div>
                ))}
                {renderDays(true)}
            </div>
        </div>
    );

    const CreditsFooter = ({ isSmall = false }) => (
        <div className="text-end">
            <div className="text-white-50" style={{ fontSize: isSmall ? '0.5rem' : '0.6rem', letterSpacing: '0.5px' }}>
                <span className="fw-bold text-info">©COGNOSPHERE</span> | Image by: <span className="text-white">HoYoLAB</span> | Calendar created by: <span className="text-white">CodeTraveller/HoYoLAB</span>
            </div>
        </div>
    );

    const ArtisticBirthdayList = ({ columns }) => {
        const count = currentMonthBirthdays.length;

        // Premium Scaling Logic: 3-per-row on mobile, 5-per-row on desktop
        const iconSize = isMobile
            ? (count > 9 ? '35px' : '42px')
            : (count > 12 ? '28px' : (count > 8 ? '32px' : '36px'));

        const fontSize = isMobile
            ? '0.6rem'
            : (count > 12 ? '0.4rem' : (count > 8 ? '0.45rem' : '0.5rem'));

        const columnClass = columns || (isMobile ? "row-cols-3" : "row-cols-md-4 row-cols-lg-5");

        return (
            <div
                className="p-2 pb-3 rounded-4 mx-auto"
                style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    maxWidth: '95%',
                    width: 'fit-content',
                    boxSizing: 'border-box'
                }}
            >
                <div className="small fw-bold text-white-50 mb-1 border-bottom border-secondary border-opacity-25 pb-1 text-center" style={{ fontSize: '0.55rem', letterSpacing: '1px' }}>MONTHLY BIRTHDAYS</div>
                <div className={`row g-2 justify-content-center ${columnClass} mx-0`} style={{ flexWrap: 'wrap' }}>
                    {currentMonthBirthdays.map((b, i) => (
                        <div key={i} className="col text-center px-1" style={{ minWidth: isMobile ? '80px' : (count > 12 ? '45px' : '55px') }}>
                            <div className="position-relative d-inline-block">
                                <img src={b.image} alt="" className="rounded-circle border border-info shadow-sm" style={{ width: iconSize, height: iconSize, objectFit: 'cover' }} />
                                <div className="position-absolute bottom-0 end-0 bg-info text-black rounded-pill px-1 fw-bold" style={{ fontSize: isMobile ? '9px' : '7px', border: '1px solid black', transform: 'translate(20%, 20%)' }}>{b.day}</div>
                            </div>
                            <div className="text-white fw-bold mt-1 text-truncate px-1" style={{ fontSize: fontSize }}>{b.character}</div>
                        </div>
                    ))}
                    {count === 0 && (
                        <div className="text-white-50 small text-center py-2 w-100">No birthdays this month</div>
                    )}
                </div>
            </div>
        );
    };

    if (isMobile) {
        return (
            <div className="position-relative">
                <div
                    ref={calendarRef}
                    className="calendar-wrapper mobile-wallpaper-mode position-relative rounded-4 overflow-hidden shadow-lg animate-fade-in mx-auto d-flex flex-column justify-content-between p-3"
                    style={{
                        aspectRatio: '8/16',
                        background: wallpaper ? `url(${wallpaper}) center/cover no-repeat` : '#151725',
                        width: '100%',
                        maxWidth: '440px',
                        padding: '1.25rem'
                    }}
                >
                    <div className="position-absolute w-100 h-100 top-0 start-0 no-capture" style={{ background: 'linear-gradient(rgba(0,0,0,0.6) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.8) 100%)', pointerEvents: 'none', zIndex: 0 }}></div>

                    <div className="position-relative z-1 pt-2 w-100">
                        <ArtisticBirthdayList />
                    </div>

                    <div className="position-relative z-1 w-100 d-flex flex-column align-items-start">
                        <div className="mb-2 w-100">
                            <ArtisticGrid />
                        </div>

                        <div className="d-flex justify-content-between align-items-end pt-1 w-100">
                            <div className="d-flex gap-2 no-capture">
                                <button className="btn btn-sm btn-outline-light rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', opacity: 0.6 }} onClick={() => changeMonth(-1)}>❮</button>
                                <button className="btn btn-sm btn-outline-light rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', opacity: 0.6 }} onClick={() => changeMonth(1)}>❯</button>
                            </div>
                            <div style={{ transform: 'translateY(2px)' }}>
                                <CreditsFooter isSmall={true} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-3 animate-fade-in no-capture">
                    <button
                        className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                        onClick={handleDownload}
                        disabled={isDownloading}
                    >
                        {isDownloading ? 'Generating...' : '📥 Download Wallpaper'}
                    </button>
                </div>
            </div>
        );
    }

    if (showArtisticDesktop) {
        const desktopWallpaper = getWallpaper(false);
        return (
            <div className="position-relative">
                <div
                    ref={calendarRef}
                    className="calendar-wrapper desktop-wallpaper-mode position-relative rounded-4 overflow-hidden shadow-lg animate-fade-in mx-auto d-flex flex-column justify-content-between"
                    style={{
                        aspectRatio: artisticRatio,
                        background: desktopWallpaper ? `url(${desktopWallpaper}) center/cover no-repeat` : '#151725',
                        width: '100%',
                        maxWidth: artisticRatio === '12/9' ? '900px' : '1200px',
                        padding: artisticRatio === '12/9' ? '1.5rem' : '2.5rem'
                    }}
                >
                    <div className="position-absolute w-100 h-100 top-0 start-0 no-capture" style={{ background: 'linear-gradient(rgba(0,0,0,0.4) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none', zIndex: 0 }}></div>

                    <div className="position-relative z-1 w-100 d-flex justify-content-center pt-2">
                        <div style={{ maxWidth: '800px', width: '100%' }}>
                            <ArtisticBirthdayList />
                        </div>
                    </div>

                    <div className="position-relative z-1 w-100 d-flex flex-column align-items-start">
                        <ArtisticGrid />

                        <div className="d-flex justify-content-between align-items-end pt-3 gap-4 w-100">
                            <div className="d-flex gap-2 no-capture">
                                <button className="btn btn-sm btn-outline-light rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', opacity: 0.6 }} onClick={() => changeMonth(-1)}>❮</button>
                                <button className="btn btn-sm btn-outline-light rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', opacity: 0.6 }} onClick={() => changeMonth(1)}>❯</button>
                            </div>
                            <div style={{ transform: 'translateY(4px)' }}>
                                <CreditsFooter />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-center gap-3 mt-4 no-capture">
                    <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowArtisticDesktop(false)}>
                        Back to Dashboard
                    </button>
                    <button
                        className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                        onClick={handleDownload}
                        disabled={isDownloading}
                    >
                        {isDownloading ? 'Generating...' : '📥 Download PC Wallpaper'}
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
                                <div className="d-flex gap-2">
                                    <button className="btn btn-outline-secondary btn-sm" onClick={() => changeMonth(-1)}>&lt; Prev</button>
                                    <button className="btn btn-outline-secondary btn-sm" onClick={() => changeMonth(1)}>Next &gt;</button>
                                </div>
                                <h2 className="m-0 fw-bold header-title" style={{ letterSpacing: '1px' }}>
                                    {monthNames[currentDate.getMonth()]} <span className="text-secondary">{currentDate.getFullYear()}</span>
                                </h2>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-outline-info btn-sm rounded-pill px-3" onClick={() => setShowArtisticDesktop(true)}>
                                        Artistic View
                                    </button>
                                    <button
                                        className="btn btn-primary btn-sm fw-bold px-3 rounded-pill"
                                        onClick={() => setShowArtisticDesktop(true)}
                                    >
                                        Download Wallpaper
                                    </button>
                                </div>
                            </div>

                            <div className="d-grid mb-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div key={d} className="text-center text-uppercase fw-bold text-secondary small py-2">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            <div className="d-grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                                {renderDays()}
                            </div>
                        </div>

                        <div className="col-lg-3 border-start border-secondary border-opacity-10 ps-4">
                            <h5 className="mb-4 text-secondary fw-bold border-bottom border-secondary border-opacity-25 pb-2">
                                {monthNames[currentDate.getMonth()]} Birthdays
                            </h5>
                            <div className="d-flex flex-column gap-3" style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
                                {loading ? (
                                    <div className="text-center text-secondary py-5">Loading...</div>
                                ) : (
                                    currentMonthBirthdays.length > 0 ? (
                                        currentMonthBirthdays.map((ev, idx) => (
                                            <div key={idx} className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                                <div className="position-relative">
                                                    <img
                                                        src={ev.image}
                                                        alt={ev.character}
                                                        className="rounded-circle border border-2 border-primary"
                                                        style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                                                    />
                                                    <div className="position-absolute bottom-0 end-0 bg-primary text-white rounded-pill px-1 fw-bold" style={{ fontSize: '10px', transform: 'translate(25%, 25%)' }}>
                                                        {ev.day}
                                                    </div>
                                                </div>
                                                <div className="flex-grow-1 min-w-0">
                                                    <div className="fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>{ev.character}</div>
                                                    <div className="small text-secondary">{monthNames[currentDate.getMonth()]} {ev.day}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted small py-5">No birthdays this month.</div>
                                    )
                                )}
                            </div>

                            <div className="mt-4 pt-3 border-top border-secondary border-opacity-10 text-center">
                                <small className="text-secondary d-block mb-3">Save as high-res Wallpaper</small>
                                <button
                                    className="btn btn-outline-primary btn-sm rounded-pill px-4"
                                    onClick={() => setShowArtisticDesktop(true)}
                                >
                                    Export Artistic PNG
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-3 opacity-50">
                <CreditsFooter />
            </div>
        </div>
    );
};

export default Calendar;
