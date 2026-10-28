import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import artifactsData from '../data/artifacts.json';
import characterRoles from '../data/characters.json';
import { getPlaceholder } from '../utils/characterUtils.jsx';

const WeaponDiscovery = ({ builds, assets }) => {
    const { weaponName } = useParams();
    const navigate = useNavigate();

    // Helper to get official role from characters.json
    const getOfficialRole = (name) => {
        if (!name) return 'Unknown';
        const clean = (n) => n.toLowerCase().trim().replace(/[\s\-_]+/g, '').replace(/[^a-z0-9]/g, '');
        const search = clean(name);
        
        // SPECIAL: Map all travelers to the traveler/aether role in JSON
        const isTraveler = search.includes('traveler') || search.includes('lumine') || search.includes('aether');

        for (const [role, chars] of Object.entries(characterRoles)) {
            if (Object.keys(chars).some(k => {
                const cleanK = clean(k);
                if (isTraveler && (cleanK === 'aether' || cleanK === 'lumine' || cleanK === 'traveler')) return true;
                return cleanK === search || search.includes(cleanK) || cleanK.includes(search);
            })) {
                const roleMap = {
                    'main_dps': 'Main DPS',
                    'sub_dps': 'Sub DPS',
                    'support': 'Support'
                };
                return roleMap[role] || role;
            }
        }
        return 'Unknown';
    };

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

    const getStatIcon = (name) => {
        if (!name || !assets?.stats) return null;
        const n = name.toLowerCase().trim();
        if (n.includes('crit rate')) return assets.stats['crit-rate'];
        if (n.includes('crit dmg')) return assets.stats['crit-dmg'];
        if (n.includes('energy recharge') || n === 'er') return assets.stats['er'];
        if (n.includes('elemental mastery') || n === 'em') return assets.stats['em'];
        if (n.includes('physical')) return assets.stats['physical dmg'];
        return assets.stats[n] || assets.stats[n.replace('%', '')];
    };

    const rarityStars = Array.from({ length: parseInt(weaponInfo.rarity) || 0 }).map((_, i) => (
        <span key={i} className="text-warning">★</span>
    )); return (
        <div className="weapon-discovery-page animate-fade-in text-white py-4 px-3 px-md-0">
            <div className="mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="btn-back-modern"
                >
                    <i className="bi bi-arrow-left me-2"></i>Back
                </button>
            </div>

            {/* Single Unified Hero Container */}
            <div className="weapon-detail-hero p-4 p-md-5 rounded-4 bg-dark bg-opacity-50 border border-white border-opacity-10 shadow-lg mb-5 position-relative overflow-hidden">
                <div className="weapon-glow" style={{
                    position: 'absolute', top: '-50%', left: '-20%', width: '100%', height: '200%',
                    background: `radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)`, zIndex: 0
                }} />

                <div className="row g-lg-5 position-relative" style={{ zIndex: 1 }}>
                    {/* Left Column: Identity & Stats */}
                    <div className="col-12 col-lg-5">
                        <div className="d-flex align-items-center gap-4 mb-4">
                            <div className="p-2 rounded-3 border border-white border-opacity-10 shadow-sm"
                                style={{ width: '110px', height: '110px', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
                                <img src={weaponInfo.image || getPlaceholder(90, 90, '?')} alt={weaponInfo.name} className="w-100 h-100 object-contain" />
                            </div>
                            <div>
                                <div className="rarity-stars text-warning small mb-1">
                                    {'★'.repeat(parseInt(weaponInfo.rarity) || 0)}
                                </div>
                                <h2 className="fw-bold mb-1 text-white" style={{ fontSize: '1.8rem' }}>{weaponInfo.name}</h2>
                                <div className="text-primary small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>{weaponInfo.type}</div>
                            </div>
                        </div>

                        <div className="hr-divider my-4 border-top border-white border-opacity-10 w-100" />

                        <div className="d-flex align-items-start gap-4">
                            <div className="stat-item flex-grow-1">
                                <div className="text-white-50 small text-uppercase tracking-wider fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Main Stat</div>
                                <div className="h1 fw-bold text-white mb-0" style={{ lineHeight: '1' }}>{weaponInfo.substatValue || '---'}</div>
                                <div className="d-flex align-items-center gap-2 text-primary small fw-bold mt-2">
                                    {getStatIcon(weaponInfo.substat) && <img src={getStatIcon(weaponInfo.substat)} alt="" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} />}
                                    {weaponInfo.substat}
                                </div>
                            </div>

                            <div className="vr bg-white opacity-10 mx-2" style={{ height: '70px' }} />

                            <div className="source-item flex-grow-1">
                                <div className="text-white-50 small text-uppercase tracking-wider fw-bold mb-2" style={{ fontSize: '0.7rem' }}>Source</div>
                                <div className="d-inline-flex align-items-center gap-2 bg-white bg-opacity-10 border border-white border-opacity-10 py-2 px-3 rounded-pill shadow-sm">
                                    <span className="text-white small fw-medium">{weaponInfo.howToGet || 'Gacha'}</span>
                                    {(() => {
                                        const type = weaponInfo.sourceType?.toLowerCase()?.trim();
                                        const howToGet = weaponInfo.howToGet?.toLowerCase()?.trim() || '';
                                        // Try direct sourceType match, then fuzzy howToGet match
                                        const iconUrl = weaponInfo.sourceIcon || 
                                                        assets?.sourceIcons?.[type] || 
                                                        Object.keys(assets?.sourceIcons || {}).find(key => howToGet.includes(key)) && assets.sourceIcons[Object.keys(assets.sourceIcons).find(key => howToGet.includes(key))];
                                        
                                        return iconUrl && (
                                            <img 
                                                src={iconUrl} 
                                                alt="" 
                                                style={{ width: '18px', height: '18px', objectFit: 'contain' }} 
                                            />
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-1 d-none d-lg-flex justify-content-center">
                        <div className="vr bg-white opacity-10 h-100"></div>
                    </div>

                    {/* Right Column: Passive & Story */}
                    <div className="col-12 col-lg-6 d-flex flex-column">
                        <div className="passive-section mb-4 p-4 rounded-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <div className="rounded-circle border border-warning" style={{ width: '12px', height: '12px', background: 'transparent' }}></div>
                                <h5 className="fw-bold mb-0 text-white text-uppercase tracking-wider" style={{ fontSize: '0.9rem' }}>Weapon Passive</h5>
                            </div>

                            <div className="passive-content">
                                <div className="fw-bold text-warning mb-2" style={{ fontSize: '1.1rem' }}>{weaponInfo.passiveName || 'Refinement Level 1'}</div>
                                <div className="text-white-50" style={{ fontSize: '1rem', lineHeight: '1.7' }}>
                                    {weaponInfo.description}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended List Section */}
            <div className="usage-section px-2">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="h4 fw-bold mb-0">Recommended for</div>
                    <div className="badge bg-white bg-opacity-10 rounded-pill px-3 py-1" style={{ fontSize: '12px' }}>{users.length} Characters</div>
                </div>

                {users.length > 0 ? (
                    <div className="character-grid row g-3">
                        {users.map((b, i) => {
                            const char = Array.isArray(b) ? b[0] : b;
                            const portrait = getPortrait(char.name) || getPortrait(char.uname) || getPlaceholder(100, 100, char.name[0]);
                            const elColor = (() => {
                                const map = {
                                    'pyro': '#ff7b00', 'hydro': '#00aaff', 'cryo': '#8be8ff',
                                    'electro': '#9b51e0', 'anemo': '#7ef9ff', 'geo': '#ffd700',
                                    'dendro': '#7fff00'
                                };
                                return map[char.element?.toLowerCase()] || '#ffffff';
                            })();

                            return (
                                <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2">
                                    <div
                                        className="character-card-mini p-3 text-center rounded-4 border hover-lift-sm pointer h-100 transition-all position-relative overflow-hidden"
                                        onClick={() => navigate(`/builds/${(char.uname || char.name).toLowerCase()}`)}
                                        style={{ 
                                            background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, ${elColor}10 100%)`, 
                                            borderColor: `${elColor}30`,
                                            backdropFilter: 'blur(10px)' 
                                        }}
                                    >
                                        <div className="portrait-box mx-auto mb-3 rounded-circle overflow-hidden border border-2 shadow-sm position-relative" 
                                            style={{ width: '80px', height: '80px', borderColor: `${elColor}50`, zIndex: 1 }}>
                                            <div className="position-absolute inset-0 opacity-20" style={{ background: elColor, filter: 'blur(10px)', zIndex: 0 }} />
                                            <img src={portrait} alt={char.name} className="w-100 h-100 object-cover position-relative" style={{ zIndex: 1 }} />
                                        </div>
                                        <div className="fw-bold text-white mb-1 truncate small text-capitalize">{char.name.replace(/_/g, ' ')}</div>
                                        <div className="text-uppercase fw-bold" style={{ fontSize: '9px', letterSpacing: '1.2px', color: elColor }}>{getOfficialRole(char.name)}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-5 opacity-25 rounded-4 border border-dashed border-white border-opacity-10">
                        <p className="mb-0">No characters found using this weapon yet.</p>
                    </div>
                )}
            </div>
            <style>{`
                .btn-back-modern {
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: white;
                    border-radius: 50px;
                    padding: 8px 30px;
                    font-size: 0.85rem;
                    display: inline-flex;
                    align-items: center;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .btn-back-modern:hover {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.3);
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
                }
                .hover-lift-sm:hover {
                    transform: translateY(-5px);
                    background: rgba(255, 255, 255, 0.05) !important;
                    border-color: rgba(255, 255, 255, 0.2) !important;
                }
                .truncate {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            `}</style>
        </div>
    );
};
export default WeaponDiscovery;
;
