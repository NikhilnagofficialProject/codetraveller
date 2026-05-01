import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWeaponImage } from '../../utils/characterUtils.jsx';

const AlternativeWeaponDropdown = ({ mainWeapon, assets }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const alts = mainWeapon.alts || [];

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (e) => {
        setIsOpen(!isOpen);
    };

    const handleMouseEnter = () => {
        if (window.matchMedia('(hover: hover)').matches) {
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (window.matchMedia('(hover: hover)').matches) {
            setIsOpen(false);
        }
    };

    const renderWeaponItem = (w, isClickable = false) => (
        <div className={`weapon-item text-center ${isClickable ? 'pointer' : ''}`} style={{ width: '80px' }} onClick={isClickable ? handleToggle : undefined}>
            <div 
                className={`weapon-icon-box mx-auto mb-1 rounded-3 border border-white border-opacity-10 overflow-hidden position-relative pointer-hover ${isClickable ? 'shadow-lg' : 'bg-dark bg-opacity-25'}`} 
                style={{ width: '64px', height: '64px', background: isClickable ? 'rgba(255,255,255,0.05)' : undefined }}
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/weapons/${w.name}`);
                }}
                title={`See who else uses ${w.name}`}
            >
                <img src={getWeaponImage(w.name, assets?.weaponsMap)} alt={w.name} className="w-100 h-100 object-contain" crossOrigin="anonymous" />
                {isClickable && alts.length > 0 && (
                    <div className="alt-badge position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow no-capture" style={{ width: '20px', height: '20px', fontSize: '10px', transform: 'translate(25%, 25%)', border: '2px solid #111' }}>
                        {alts.length}
                    </div>
                )}
            </div>
            <div className="weapon-name fw-bold" style={{ fontSize: '10px', lineHeight: '1.2', marginTop: '4px' }}>{w.name} {w.rarity}</div>
            {w.note && <div className="artifact-note mx-auto" style={{ fontSize: '7px', opacity: 0.6 }}>{w.note}</div>}
        </div>
    );

    if (!alts.length) {
        return renderWeaponItem(mainWeapon);
    }

    return (
        <div 
            className={`alt-dropdown-wrapper position-relative ${isOpen ? 'z-index-up' : ''}`} 
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {renderWeaponItem(mainWeapon, true)}

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="alt-dropdown-menu animate-fade-in">
                    <div className="alt-dropdown-header x-small opacity-50 mb-2">ALTERNATIVES</div>
                    <div className="alt-dropdown-list d-flex flex-column gap-2">
                        {alts.map((alt, index) => (
                            <div key={index} className="alt-dropdown-item d-flex align-items-center gap-2 p-1 rounded-2">
                                <div 
                                    className="alt-item-icon rounded-circle overflow-hidden border border-white border-opacity-10 bg-dark pointer-hover" 
                                    style={{ width: '32px', height: '32px' }}
                                    onClick={() => navigate(`/weapons/${alt.name}`)}
                                    title={`See who else uses ${alt.name}`}
                                >
                                    <img src={getWeaponImage(alt.name, assets?.weaponsMap)} alt="" className="w-100 h-100 object-contain" crossOrigin="anonymous" />
                                </div>
                                <div className="alt-item-info flex-grow-1 d-flex flex-column justify-content-center">
                                    <div className="alt-item-name weapon-name fw-bold mb-1" style={{ fontSize: '10px' }}>
                                        {alt.name} <span className="opacity-75" style={{ fontSize: '9px' }}>{alt.rarity}</span>
                                    </div>
                                    {alt.category && (
                                        <div className="alt-item-tag opacity-50 fw-medium" style={{ fontSize: '8px', textTransform: 'uppercase' }}>
                                            {alt.category}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Static List for Download/Export only */}
            <div className="export-alts-list no-capture-except-download d-none flex-wrap gap-2 mt-2 justify-content-center">
                {alts.map((alt, index) => (
                    <div key={index} className="export-alt-item d-flex align-items-center gap-1 bg-dark bg-opacity-25 p-1 rounded-2 border border-white border-opacity-10" style={{ width: '100px' }}>
                        <div 
                            className="alt-item-icon rounded-circle overflow-hidden bg-dark pointer-hover" 
                            style={{ width: '24px', height: '24px', flexShrink: 0 }}
                            onClick={() => navigate(`/weapons/${alt.name}`)}
                        >
                            <img src={getWeaponImage(alt.name, assets?.weaponsMap)} alt="" className="w-100 h-100 object-contain" crossOrigin="anonymous" />
                        </div>
                        <div className="alt-item-info overflow-hidden">
                            <div className="alt-item-name weapon-name fw-bold" style={{ fontSize: '8px' }}>{alt.name}</div>
                            <div className="alt-item-tag opacity-50" style={{ fontSize: '6px' }}>{alt.rarity} {alt.category}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlternativeWeaponDropdown;
