import React from 'react';

const CharacterBanner = ({ character, themeColor }) => {
    const namecard = character.namecard || null;

    return (
        <div
            className="banner-container"
            style={{
                minHeight: '380px',
                background: namecard ? `url(${namecard}) center/cover no-repeat` : `linear-gradient(135deg, ${themeColor} 0%, #000 100%)`,
            }}
        >
            <div className="banner-overlay" />

            <div className="portrait-wrapper" style={{ borderColor: themeColor }}>
                <img src={character.portrait} alt={character.name} crossOrigin="anonymous" loading="eager" />
            </div>

            <div className="banner-name">{character.name}</div>

            <div className="banner-details">
                {character.element} • {character.weaponType || 'Weapon'} • {character.region} • Visual Guide for HoYoLAB
            </div>

            <div className="banner-footer">
                Visual post {'-'} created from CodeTraveller/Hoyolab + community sources
            </div>
        </div>
    );
};

export default CharacterBanner;
