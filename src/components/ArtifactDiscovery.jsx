import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaceholder, cleanArtifactLabelV2 } from '../utils/characterUtils.jsx';

const ArtifactDiscovery = ({ builds, assets }) => {
    const { setName } = useParams();
    const navigate = useNavigate();

    // Find all characters using this artifact set
    const users = useMemo(() => {
        if (!builds || !setName || !assets) return [];
        
        const clean = (s) => s.toLowerCase()
            .replace(/['’]s/g, '') // Remove possessives
            .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric
            .trim();
        
        const searchBase = clean(setName);
        const searchShort = assets.artifactShortNames?.[setName.toLowerCase().trim()]?.toLowerCase() || '';
        
        return builds.filter(b => {
            const charData = Array.isArray(b) ? b[0] : b;
            const artifactStr = charData.artifacts || '';
            
            // Split by common delimiters (added comma and plus)
            const individualArts = artifactStr.split(/[\n;/+,]/).filter(s => s.trim());
            
            return individualArts.some(art => {
                const cleanedArt = clean(art);
                const artShort = assets.artifactShortNames?.[art.toLowerCase().trim()]?.toLowerCase() || '';
                
                // 1. Exact or partial name match
                if (cleanedArt.includes(searchBase) || searchBase.includes(cleanedArt)) return true;
                
                // 2. Short name match (e.g. "VV" matching "Viridescent Venerer")
                if (searchShort && cleanedArt.includes(searchShort)) return true;
                if (artShort && searchBase.includes(artShort)) return true;
                
                return false;
            });
        });
    }, [builds, setName, assets]);

    const getArtifactIcon = (name) => {
        if (!name || !assets?.artifacts) return null;
        const clean = (str) => str.toLowerCase().replace(/'s/g, '').replace(/[^a-z0-9]/g, '').trim();
        const search = clean(name);
        
        const keys = Object.keys(assets.artifacts);
        const match = keys.find(k => clean(k) === search || clean(k).includes(search) || search.includes(clean(k)));
        return match ? assets.artifacts[match] : null;
    };

    const iconUrl = getArtifactIcon(setName);

    return (
        <div className="artifact-discovery-page animate-fade-in text-white py-4">
            <div className="d-flex align-items-center gap-4 mb-5 p-4 rounded-4 bg-dark bg-opacity-50 border border-white border-opacity-10 shadow-lg">
                <div className="artifact-header-icon p-2 bg-dark rounded-circle border border-white border-opacity-10 shadow" style={{ width: '100px', height: '100px' }}>
                    <img src={iconUrl || getPlaceholder(80, 80, '?')} alt={setName} className="w-100 h-100 object-contain" />
                </div>
                <div>
                    <h1 className="display-6 fw-bold mb-1 text-capitalize">{setName.replace(/-/g, ' ')}</h1>
                    <p className="opacity-75 mb-0">Characters using this artifact set: <span className="text-primary fw-bold">{users.length}</span></p>
                    <button onClick={() => navigate(-1)} className="btn btn-sm btn-outline-secondary rounded-pill mt-3 px-3">
                        <i className="bi bi-arrow-left me-1"></i> Back
                    </button>
                </div>
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
                                        <div className="fw-bold text-white small text-truncate w-100">{char.name}</div>
                                        <div className="fw-bold" style={{ fontSize: '10px', color: elColor, letterSpacing: '1px', textTransform: 'uppercase' }}>{char.role}</div>
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
        </div>
    );
};

export default ArtifactDiscovery;
