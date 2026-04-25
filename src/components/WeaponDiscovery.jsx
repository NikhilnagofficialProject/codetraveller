import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaceholder } from '../utils/characterUtils.jsx';

const WeaponDiscovery = ({ builds, assets }) => {
    const { weaponName } = useParams();
    const navigate = useNavigate();

    const weaponInfo = useMemo(() => {
        if (!weaponName || !assets?.weaponsMap) return null;
        const clean = (n) => n.toLowerCase().trim();
        const search = clean(weaponName);
        
        const keys = Object.keys(assets.weaponsMap);
        const match = keys.find(k => clean(k) === search || clean(k).includes(search) || search.includes(clean(k)));
        return match ? assets.weaponsMap[match] : null;
    }, [weaponName, assets]);

    // Find all characters using this weapon
    const users = useMemo(() => {
        if (!builds || !weaponName) return [];
        const searchName = weaponName.toLowerCase().trim();
        return builds.filter(b => {
            const charData = Array.isArray(b) ? b[0] : b;
            return (charData.weapon || '').toLowerCase().includes(searchName);
        });
    }, [builds, weaponName]);

    const getPortrait = (name) => {
        if (!name || !assets?.characters) return null;
        const clean = (n) => n.toLowerCase().trim();
        const search = clean(name);
        if (assets.characters[search]?.portrait) return assets.characters[search].portrait;
        const normalized = search.replace(/[\s\-_]+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (assets.characters[normalized]?.portrait) return assets.characters[normalized].portrait;
        const simpleName = search.replace(/\s*\(.*?\)/g, '').trim();
        if (assets.characters[simpleName]?.portrait) return assets.characters[simpleName].portrait;
        return null;
    };

    if (!weaponInfo) {
        return (
            <div className="text-center py-5 text-white opacity-50">
                <i className="bi bi-exclamation-triangle display-1 mb-3 d-block"></i>
                <h4>Weapon not found in database.</h4>
                <button onClick={() => navigate(-1)} className="btn btn-primary rounded-pill mt-3 px-4">Go Back</button>
            </div>
        );
    }

    const rarityStars = Array.from({ length: parseInt(weaponInfo.rarity) || 0 }).map((_, i) => (
        <span key={i} className="text-warning">★</span>
    ));

    return (
        <div className="weapon-discovery-page animate-fade-in text-white py-4">
            {/* Header / Hero Section */}
            <div className="weapon-detail-hero d-flex flex-column flex-md-row align-items-center gap-5 mb-5 p-4 rounded-4 bg-dark bg-opacity-50 border border-white border-opacity-10 shadow-lg position-relative overflow-hidden">
                <div className="weapon-glow" style={{ 
                    position: 'absolute', top: '-50%', left: '-20%', width: '100%', height: '200%', 
                    background: `radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)`, zIndex: 0 
                }} />
                
                <div className="weapon-image-large p-3 bg-dark bg-opacity-75 rounded-4 border border-white border-opacity-10 shadow-lg position-relative" style={{ width: '180px', height: '180px', zIndex: 1 }}>
                    <img src={weaponInfo.image || getPlaceholder(150, 150, '?')} alt={weaponInfo.name} className="w-100 h-100 object-contain" />
                </div>

                <div className="weapon-info-content flex-grow-1 position-relative" style={{ zIndex: 1 }}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 px-2 py-1" style={{ fontSize: '10px' }}>
                            {weaponInfo.type || 'Weapon'}
                        </span>
                        <div className="rarity-stars" style={{ fontSize: '14px' }}>{rarityStars}</div>
                    </div>
                    <h1 className="display-5 fw-bold mb-3">{weaponInfo.name}</h1>
                    
                    <div className="weapon-stats-row d-flex flex-wrap gap-4 mb-4">
                        {weaponInfo.substat && (
                            <div className="stat-item">
                                <div className="text-white-50 small mb-1">{weaponInfo.substat}</div>
                                <div className="h4 fw-bold mb-0 text-primary">{weaponInfo.substatValue || '---'}</div>
                            </div>
                        )}
                        {weaponInfo.howToGet && (
                            <div className="stat-item border-start border-white border-opacity-10 ps-4">
                                <div className="text-white-50 small mb-1">Source</div>
                                <div className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 py-1 px-2" style={{ fontSize: '10px' }}>
                                    {weaponInfo.howToGet}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="weapon-passive-box p-3 rounded-3 border border-white border-opacity-10" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(5px)' }}>
                        <div className="passive-name fw-bold text-warning mb-1" style={{ fontSize: '1.1em', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                            {weaponInfo.passiveName || 'Weapon Passive'}
                        </div>
                        <div className="passive-desc text-white-50" style={{ fontSize: '0.95em', lineHeight: '1.6' }}>
                            {weaponInfo.description || 'Description not available for this weapon.'}
                        </div>
                    </div>
                    
                    <button onClick={() => navigate(-1)} className="btn btn-sm btn-link text-white-50 text-decoration-none mt-3 p-0 hover-white">
                        <i className="bi bi-arrow-left me-1"></i> Back to Previous
                    </button>
                </div>
            </div>

            {/* User List Section */}
            <div className="usage-section">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="h4 fw-bold mb-0">Recommended for</div>
                    <div className="badge bg-white bg-opacity-10 rounded-pill px-3">{users.length} Characters</div>
                </div>

                {users.length > 0 ? (
                    <div className="character-grid row g-3">
                        {users.map((b, i) => {
                            const char = Array.isArray(b) ? b[0] : b;
                            const portrait = getPortrait(char.name) || getPortrait(char.uname) || getPlaceholder(100, 100, char.name[0]);
                            
                            return (
                                <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2">
                                    <div 
                                        className="character-card-mini p-2 text-center rounded-4 border border-white border-opacity-10 bg-dark bg-opacity-25 hover-lift pointer"
                                        onClick={() => navigate(`/builds/${(char.uname || char.name).toLowerCase()}`)}
                                    >
                                        <div className="portrait-box mx-auto mb-2 rounded-circle overflow-hidden border border-2 border-white border-opacity-10 shadow-sm" style={{ width: '70px', height: '70px' }}>
                                            <img src={portrait} alt={char.name} className="w-100 h-100 object-cover" />
                                        </div>
                                        <div className="fw-bold x-small truncate">{char.name}</div>
                                        <div className="opacity-50" style={{ fontSize: '9px' }}>{char.role}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-5 opacity-25">
                        <p>No characters found using this weapon yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeaponDiscovery;
