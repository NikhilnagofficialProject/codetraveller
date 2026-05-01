import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getWeaponImage, getPlaceholder } from '../../utils/characterUtils.jsx';

const WeaponTree = ({ weaponGroups, assets, themeColor }) => {
    const navigate = useNavigate();

    // The first group is the "Best" weapon
    const bestWeapon = weaponGroups[0];
    const secondaryGroups = weaponGroups.slice(1);

    if (!bestWeapon) return null;

    return (
        <div className="weapon-tree-container d-flex flex-column gap-3 w-100">
            {/* Best Weapon - Featured */}
            <div 
                className="best-weapon-box p-3 rounded-4 position-relative overflow-hidden pointer-hover" 
                style={{ 
                    background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, ${themeColor}10 100%)`, 
                    border: `1px solid ${themeColor}40`,
                    boxShadow: `0 0 20px ${themeColor}05`
                }}
                onClick={() => navigate(`/weapons/${bestWeapon.name}`)}
            >
                <div className="d-flex align-items-center gap-3">
                    <div className="weapon-icon-main p-1 rounded-3" style={{ width: '70px', height: '70px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${themeColor}60` }}>
                        <img src={getWeaponImage(bestWeapon.name, assets?.weaponsMap)} alt={bestWeapon.name} className="w-100 h-100 object-contain" crossOrigin="anonymous" />
                    </div>
                    <div className="flex-grow-1">
                        <div className="text-uppercase fw-bold mb-1" style={{ color: themeColor, fontSize: '0.75rem', letterSpacing: '2px' }}>Best in Slot</div>
                        <div className="h4 fw-bold mb-1 text-white line-clamp-1">{bestWeapon.name}</div>
                        <div className="stars text-warning" style={{ fontSize: '12px' }}>{bestWeapon.rarity}</div>
                    </div>
                </div>
                {/* Optional children for best weapon */}
                {bestWeapon.alts && bestWeapon.alts.length > 0 && (
                    <div className="best-alts-branch ms-4 mt-2 ps-2 border-start border-white border-opacity-20">
                        {bestWeapon.alts.map((alt, idx) => (
                            <div key={idx} className="alt-mini d-flex align-items-center gap-2 mb-1">
                                <img src={getWeaponImage(alt.name, assets?.weaponsMap)} style={{ width: '20px', height: '20px', objectFit: 'contain' }} alt="" />
                                <span className="text-white fw-medium" style={{ fontSize: '11px' }}>{alt.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Alternatives Grid/Tree */}
            {secondaryGroups.length > 0 && (
                <div className="alternatives-grid mt-2">
                    <div className="text-uppercase fw-bold text-white opacity-75 mb-3 text-center" style={{ fontSize: '0.75rem', letterSpacing: '2px' }}>Alternative Options</div>
                    <div className="row g-3">
                        {secondaryGroups.map((group, idx) => (
                            <div key={idx} className="col-6">
                                <div className="tree-group-box h-100">
                                    {/* Parent alternative */}
                                    <div 
                                        className="parent-alt d-flex align-items-center gap-2 p-2 rounded-3 pointer-hover mb-2" 
                                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                                        onClick={() => navigate(`/weapons/${group.name}`)}
                                    >
                                        <div className="p-1 rounded-2 bg-dark" style={{ width: '40px', height: '40px' }}>
                                            <img src={getWeaponImage(group.name, assets?.weaponsMap)} className="w-100 h-100 object-contain" alt="" crossOrigin="anonymous" />
                                        </div>
                                        <div className="flex-grow-1 overflow-hidden">
                                            <div className="fw-bold text-white line-clamp-1" style={{ fontSize: '11px' }}>{group.name}</div>
                                            <div className="text-warning" style={{ fontSize: '10px' }}>{group.rarity}</div>
                                        </div>
                                    </div>

                                    {/* Children side-grades */}
                                    {group.alts && group.alts.length > 0 && (
                                        <div className="children-list position-relative ps-2 ms-1">
                                            {/* Branch Line */}
                                            <div className="position-absolute" style={{ left: '0', top: '-10px', bottom: '15px', width: '2px', background: `linear-gradient(to bottom, ${themeColor}60, transparent)` }} />
                                            
                                            {group.alts.map((child, cIdx) => (
                                                <div 
                                                    key={cIdx} 
                                                    className="child-alt d-flex align-items-center gap-2 mb-2 position-relative pointer-hover hov-scale-sm"
                                                    onClick={() => navigate(`/weapons/${child.name}`)}
                                                >
                                                    {/* Horizontal Hook */}
                                                    <div className="position-absolute" style={{ left: '-12px', top: '50%', width: '10px', height: '2px', background: `${themeColor}60` }} />
                                                    
                                                    <div className="rounded-circle bg-dark bg-opacity-50 p-1 border border-white border-opacity-10" style={{ width: '28px', height: '28px' }}>
                                                        <img src={getWeaponImage(child.name, assets?.weaponsMap)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" crossOrigin="anonymous" />
                                                    </div>
                                                    <div className="text-white fw-medium" style={{ fontSize: '11px' }}>{child.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeaponTree;
