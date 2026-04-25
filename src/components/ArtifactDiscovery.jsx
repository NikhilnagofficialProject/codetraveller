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
                        
                        return (
                            <div key={i} className="col-6 col-md-4 col-lg-3 col-xl-2 d-flex justify-content-center">
                                <div 
                                    className="character-card-mini p-2 text-center rounded-4 border border-white border-opacity-10 bg-dark bg-opacity-25 hover-lift pointer d-flex flex-column"
                                    onClick={() => navigate(`/builds/${(char.uname || char.name).toLowerCase()}`)}
                                    style={{ width: '100%', maxWidth: '160px', aspectRatio: '1/1.3' }}
                                >
                                    <div className="portrait-box mx-auto mb-2 rounded-circle overflow-hidden border border-2 border-white border-opacity-10 shadow-sm" style={{ width: '80px', height: '80px' }}>
                                        <img src={portrait} alt={char.name} className="w-100 h-100 object-cover" />
                                    </div>
                                    <div className="fw-bold small text-truncate w-100">{char.name}</div>
                                    <div className="opacity-50" style={{ fontSize: '10px' }}>{char.role}</div>
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
