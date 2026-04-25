import React from 'react';
import CreditsFooter from '../common/CreditsFooter';

const ArtisticView = ({ 
    currentDate, 
    events, 
    assets, 
    isMobile, 
    artisticRatio, 
    changeMonth, 
    calendarRef, 
    monthNames, 
    renderDays 
}) => {
    const monthIndex = currentDate.getMonth();
    const monthPrefix = monthNames[monthIndex].toLowerCase().substring(0, 3);
    const wallpaperData = assets?.wallpapers?.[monthPrefix];
    const wallpaper = isMobile ? wallpaperData?.mobile : wallpaperData?.windows;

    const currentMonthBirthdays = [];
    Object.entries(events).forEach(([key, dayEvents]) => {
        const [m, d] = key.split('-').map(Number);
        if (m === monthIndex) {
            dayEvents.forEach(ev => currentMonthBirthdays.push({ ...ev, day: d }));
        }
    });
    currentMonthBirthdays.sort((a, b) => a.day - b.day);

    const iconSize = isMobile ? (currentMonthBirthdays.length > 9 ? '35px' : '42px') : '32px';

    return (
        <div 
            ref={calendarRef}
            className="position-relative rounded-4 overflow-hidden shadow-lg mx-auto d-flex flex-column justify-content-between p-3"
            style={{
                aspectRatio: isMobile ? '8/16' : artisticRatio,
                background: wallpaper ? `url(${wallpaper}) center/cover no-repeat` : '#151725',
                width: '100%',
                maxWidth: isMobile ? '440px' : (artisticRatio === '12/9' ? '900px' : '1200px'),
                minHeight: isMobile ? '700px' : '600px'
            }}
        >
            <div className="position-absolute w-100 h-100 top-0 start-0 no-capture" style={{ background: 'linear-gradient(rgba(0,0,0,0.5) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.7) 100%)', pointerEvents: 'none', zIndex: 0 }}></div>

            {/* Birthdays List */}
            <div className="position-relative z-1 pt-2 w-100">
                <div className="p-2 pb-3 rounded-4 mx-auto" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', width: 'fit-content', maxWidth: '95%' }}>
                    <div className="small fw-bold text-white-50 mb-1 border-bottom border-secondary border-opacity-25 pb-1 text-center" style={{ fontSize: '0.55rem', letterSpacing: '1px' }}>MONTHLY BIRTHDAYS</div>
                    <div className="d-flex flex-wrap g-2 justify-content-center gap-2">
                        {currentMonthBirthdays.map((b, i) => (
                            <div key={i} className="text-center px-1" style={{ minWidth: isMobile ? '60px' : '50px' }}>
                                <div className="position-relative d-inline-block">
                                    <img src={b.image} alt="" className="rounded-circle border border-info" style={{ width: iconSize, height: iconSize, objectFit: 'cover' }} />
                                    <div className="position-absolute bottom-0 end-0 bg-info text-black rounded-pill px-1 fw-bold" style={{ fontSize: '8px', border: '1px solid black', transform: 'translate(20%, 20%)' }}>{b.day}</div>
                                </div>
                                <div className="text-white fw-bold mt-1 text-truncate" style={{ fontSize: '0.5rem' }}>{b.character}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="position-relative z-1 w-100 d-flex flex-column align-items-start">
                <div className="p-2 p-md-3 rounded-4 mb-2" style={{ width: '100%', maxWidth: '280px', background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="d-flex align-items-baseline gap-2 mb-1">
                        <h2 className="m-0 fw-bold text-white lh-1" style={{ fontSize: '1.4rem' }}>{monthNames[monthIndex]}</h2>
                        <h4 className="m-0 fw-light text-white-50 lh-1" style={{ fontSize: '0.9rem' }}>{currentDate.getFullYear()}</h4>
                    </div>
                    <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} className={`text-center small fw-bold py-1 ${i === 0 || i === 6 ? 'text-info' : 'text-white'}`} style={{ fontSize: '0.7rem' }}>{d}</div>
                        ))}
                        {renderDays(true)}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="d-flex justify-content-between align-items-end w-100">
                    <div className="d-flex gap-2 no-capture">
                        <button className="btn btn-sm btn-outline-light rounded-circle p-0" style={{ width: '28px', height: '28px', opacity: 0.6 }} onClick={() => changeMonth(-1)}>❮</button>
                        <button className="btn btn-sm btn-outline-light rounded-circle p-0" style={{ width: '28px', height: '28px', opacity: 0.6 }} onClick={() => changeMonth(1)}>❯</button>
                    </div>
                    <CreditsFooter isSmall={isMobile} />
                </div>
            </div>
        </div>
    );
};

export default ArtisticView;
