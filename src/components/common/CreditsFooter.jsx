import React from 'react';

const CreditsFooter = ({ isSmall = false }) => (
    <div className="text-end">
        <div className="text-white-50" style={{ fontSize: isSmall ? '0.5rem' : '0.6rem', letterSpacing: '0.5px' }}>
            <span className="fw-bold text-info">©COGNOSPHERE</span> | Image by: <span className="text-white">HoYoLAB</span> | Calendar created by: <span className="text-white">CodeTraveller/HoYoLAB</span>
        </div>
    </div>
);

export default CreditsFooter;
