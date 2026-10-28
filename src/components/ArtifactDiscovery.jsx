import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaceholder } from '../utils/characterUtils.jsx';
import artifactsData from '../data/artifacts.json';
import characterRoles from '../data/characters.json';

const ArtifactDiscovery = ({ builds, assets }) => {
    const { setName } = useParams();
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

    // Find set details from local JSON
    const setDetails = useMemo(() => {
        if (!setName) return null;
        const clean = (s) => s.toLowerCase().replace(/['’]s/g, '').replace(/[^a-z0-9]/g, '').trim();
        const search = clean(setName);
        
        // 1. Direct match
        if (artifactsData[setName]) return artifactsData[setName];
        
        // 2. Case-insensitive / normalized match
        const foundKey = Object.keys(artifactsData).find(k => clean(k) === search);
        if (foundKey) return artifactsData[foundKey];
        
        return null;
    }, [setName]);

    const getArtifactIcon = (name) => {
        if (!name || !assets?.artifacts) return null;
        const clean = (str) => str.toLowerCase().replace(/'s/g, '').replace(/[^a-z0-9]/g, '').trim();
        const search = clean(name);
        const keys = Object.keys(assets.artifacts);
        const match = keys.find(k => clean(k) === search || clean(k).includes(search) || search.includes(clean(k)));
        return match ? assets.artifacts[match] : null;
    };

    // Find all characters using this artifact set
    const users = useMemo(() => {
        if (!builds || !setName || !assets) return [];
        
        const clean = (s) => s.toLowerCase().replace(/['’]s/g, '').replace(/[^a-z0-9]/g, '').trim();
        const searchBase = clean(setName);
        const searchShort = assets.artifactShortNames?.[setName.toLowerCase().trim()]?.toLowerCase() || '';
        
        return builds.filter(b => {
            const charData = Array.isArray(b) ? b[0] : b;
            const artifactStr = charData.artifacts || '';
            
            // STRICT FILTER: Check if the set name even exists in assets
            if (!getArtifactIcon(setName)) return false;

            // Get only the PRIMARY recommendations (handle numbered lists)
            // We'll take the first few lines and clean them
            const lines = artifactStr.split(/[\n;]/).map(l => l.trim()).filter(l => l);
            if (lines.length === 0) return false;

            // Check the first 2-3 lines (Primary choices)
            const primaryChoices = lines.slice(0, 2).map(l => {
                // Remove numbering like "1. ", "2) ", etc.
                return l.replace(/^\d+[\.\)]\s*/, '').replace(/\[Alternative\].*$/i, '').trim();
            });

            return primaryChoices.some(choice => {
                const cleanedChoice = clean(choice);
                const choiceShort = assets.artifactShortNames?.[choice.toLowerCase().trim()]?.toLowerCase() || '';
                
                // Precise Match Logic
                // 1. Exact Name match (cleaned)
                if (cleanedChoice === searchBase) return true;
                
                // 2. Contains match (but must be significant, not just a fragment)
                if (cleanedChoice.length > 5 && cleanedChoice.includes(searchBase) && (cleanedChoice.includes('4') || cleanedChoice.includes('2'))) return true;
                if (searchBase.length > 5 && searchBase.includes(cleanedChoice)) return true;

                // 3. Short name match (e.g. "VV" == "VV")
                if (searchShort && choiceShort && searchShort === choiceShort) return true;
                
                return false;
            });
        });
    }, [builds, setName, assets]);

    const iconUrl = getArtifactIcon(setName);

    return (
        <div className="artifact-discovery-page animate-fade-in text-white py-4">
            {/* If set doesn't exist in assets, don't show the header info */}
            {!getArtifactIcon(setName) ? (
                <div className="text-center py-5 opacity-50">
                    <div className="mb-4">
                        <i className="bi bi-shield-slash display-1 mb-3 d-block text-primary"></i>
                        <h2 className="fw-bold">Asset Not Found</h2>
                        <p>This artifact set is not registered in your spreadsheet assets.</p>
                    </div>
                    <button onClick={() => navigate('/artifacts')} className="btn btn-outline-primary rounded-pill px-4">
                        <i className="bi bi-arrow-left me-2"></i> Back to Database
                    </button>
                </div>
            ) : (
                <>
                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-4 mb-5 p-4 rounded-4 bg-dark bg-opacity-50 border border-white border-opacity-10 shadow-lg">
                        <div className="artifact-header-icon p-2 bg-dark rounded-circle border border-white border-opacity-10 shadow flex-shrink-0" style={{ width: '100px', height: '100px' }}>
                            <img src={iconUrl || getPlaceholder(80, 80, '?')} alt={setName} className="w-100 h-100 object-contain" />
                        </div>
                        <div className="flex-grow-1">
                            <h1 className="display-6 fw-bold mb-1 text-capitalize">{setName.replace(/-/g, ' ')}</h1>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                {setDetails?.rarity && (
                                    <div className="rarity-stars text-warning" style={{ fontSize: '0.9rem' }}>
                                        {'★'.repeat(Math.max(...setDetails.rarity))}
                                    </div>
                                )}
                                <p className="opacity-75 mb-0">Characters using this artifact set: <span className="text-primary fw-bold">{users.length}</span></p>
                            </div>
                            <button onClick={() => navigate(-1)} className="btn btn-sm btn-outline-secondary rounded-pill px-3">
                                <i className="bi bi-arrow-left me-1"></i> Back
                            </button>
                        </div>
                    </div>

                    {setDetails && (
                        <div className="artifact-effects-section mb-5">
                            <div className="row g-4">
                                <div className="col-12 col-lg-6">
                                    <div className="effect-card h-100 p-4 rounded-4 border border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <span className="badge bg-primary rounded-pill px-3 py-2">2-Piece Set</span>
                                        </div>
                                        <p className="lead mb-0" style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.6' }}>
                                            {setDetails.effect2Pc}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-6">
                                    <div className="effect-card h-100 p-4 rounded-4 border border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <span className="badge bg-success rounded-pill px-3 py-2">4-Piece Set</span>
                                        </div>
                                        <p className="mb-0 opacity-90" style={{ lineHeight: '1.6' }}>
                                            {setDetails.effect4Pc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="section-title mb-4 opacity-50 text-uppercase tracking-widest small fw-bold">
                        Recommended For
                    </div>

                    {users.length > 0 ? (
                        <div className="character-grid row g-4">
                                {users.map((b, i) => {
                                    const char = Array.isArray(b) ? b[0] : b;
                                    
                                    // Robust portrait lookup
                                    const getPortrait = (name) => {
                                        if (!name || !assets?.characters) return null;
                                        const clean = (n) => n.toLowerCase().trim();
                                        const search = clean(name);
                                        
                                        // SPECIAL: Priority for Lumine over Aether for Traveler builds
                                        if (search.includes('traveler')) {
                                            const keys = Object.keys(assets.characters);
                                            const lumineKey = keys.find(k => k.includes('lumine'));
                                            if (lumineKey) return assets.characters[lumineKey].portrait;
                                        }

                                        if (assets.characters[search]?.portrait) return assets.characters[search].portrait;
                                        const normalized = search.replace(/[\s\-_]+/g, '-').replace(/[^a-z0-9-]/g, '');
                                        if (assets.characters[normalized]?.portrait) return assets.characters[normalized].portrait;
                                        const simpleName = search.replace(/\s*\(.*?\)/g, '').trim();
                                        if (assets.characters[simpleName]?.portrait) return assets.characters[simpleName].portrait;
                                        return null;
                                    };

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
                                <div key={i} className="col-6 col-md-4 col-lg-3 col-xl-2 d-flex justify-content-center">
                                    <div 
                                        className="character-card-mini p-2 text-center rounded-4 border hover-lift pointer d-flex flex-column position-relative overflow-hidden"
                                        onClick={() => navigate(`/builds/${(char.uname || char.name).toLowerCase()}`)}
                                        style={{ 
                                            width: '100%', maxWidth: '160px', aspectRatio: '1/1.3',
                                            background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, ${elColor}10 100%)`, 
                                            borderColor: `${elColor}30`,
                                            backdropFilter: 'blur(10px)'
                                        }}
                                    >
                                        <div className="portrait-box mx-auto mb-2 rounded-circle overflow-hidden border border-2 shadow-sm position-relative" 
                                            style={{ width: '80px', height: '80px', borderColor: `${elColor}50`, zIndex: 1 }}>
                                            <div className="position-absolute inset-0 opacity-20" style={{ background: elColor, filter: 'blur(10px)', zIndex: 0 }} />
                                            <img src={portrait} alt={char.name} className="w-100 h-100 object-cover position-relative" style={{ zIndex: 1 }} />
                                        </div>
                                        <div className="fw-bold text-white small text-truncate w-100 text-capitalize">{char.name.replace(/_/g, ' ')}</div>
                                        <div className="fw-bold" style={{ fontSize: '10px', color: elColor, letterSpacing: '1px', textTransform: 'uppercase' }}>{getOfficialRole(char.name)}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-5 opacity-50">
                        <i className="bi bi-search display-1 mb-3 d-block"></i>
                        <h4>No characters found using this set yet.</h4>
                    </div>
                )}
            </>
            )}
        </div>
    );
};

export default ArtifactDiscovery;
