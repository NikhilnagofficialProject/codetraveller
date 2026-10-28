import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlaceholder } from '../utils/characterUtils.jsx';
import artifactsData from '../data/artifacts.json';

const ArtifactsPage = ({ assets }) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const getIcon = (name) => {
        if (!name || !assets?.artifacts) return null;
        const clean = (s) => s.toLowerCase().replace(/['’]s/g, '').replace(/[^a-z0-9]/g, '').trim();
        const search = clean(name);
        const keys = Object.keys(assets.artifacts);
        const match = keys.find(k => clean(k) === search || clean(k).includes(search) || search.includes(clean(k)));
        return match ? assets.artifacts[match] : null;
    };

    // Group artifacts by their 2-piece effect
    const groupedArtifacts = useMemo(() => {
        const groups = {};
        
        Object.entries(artifactsData).forEach(([name, data]) => {
            const icon = getIcon(name);
            
            // STRICT FILTER: Only show if it exists in your Assets tab
            if (!icon) return;

            // Apply search filter
            if (search && !name.toLowerCase().includes(search.toLowerCase()) && 
                !data.effect2Pc?.toLowerCase().includes(search.toLowerCase())) {
                return;
            }

            const effect = data.effect2Pc || 'Utility / Specialized';
            // Simplify grouping by common keywords
            let key = 'Other / Specialized';
            if (effect.includes('ATK')) key = 'ATK Bonus';
            else if (effect.includes('EM') || effect.includes('Mastery')) key = 'Elemental Mastery';
            else if (effect.includes('ER') || effect.includes('Recharge')) key = 'Energy Recharge';
            else if (effect.includes('HP')) key = 'HP Bonus';
            else if (effect.includes('DEF')) key = 'DEF Bonus';
            else if (effect.includes('DMG Bonus')) {
                const element = effect.match(/(\w+)\s*DMG/);
                key = element ? `${element[1]} DMG` : 'Elemental DMG';
            }
            else if (effect.includes('Healing')) key = 'Healing Bonus';
            else if (effect.includes('Physical')) key = 'Physical DMG';
            else if (effect.includes('CRIT')) key = 'CRIT Bonus';
            
            if (!groups[key]) groups[key] = [];
            groups[key].push({ ...data, id: name, displayName: name.replace(/[-_]/g, ' ') });
        });
        
        // Sort groups to keep most common ones first
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            if (a === 'Other / Specialized') return 1;
            if (b === 'Other / Specialized') return -1;
            return a.localeCompare(b);
        });

        const sortedGroups = {};
        sortedKeys.forEach(k => { sortedGroups[k] = groups[k]; });
        return sortedGroups;
    }, [search]);

    return (
        <div className="artifacts-page animate-fade-in py-4 text-white">
            <div className="page-header mb-5 text-center">
                <h1 className="display-4 fw-bold mb-2">Artifact Database</h1>
                <p className="opacity-50">Master your equipment with full set details and character synergy.</p>
            </div>

            {/* Search Bar */}
            <div className="row g-3 mb-5 justify-content-center">
                <div className="col-12 col-md-6 col-lg-5">
                    <div className="input-group bg-dark bg-opacity-50 border border-white border-opacity-10 rounded-pill px-3 py-1 shadow-sm">
                        <span className="input-group-text bg-transparent border-0 text-white-50"><i className="bi bi-search"></i></span>
                        <input 
                            type="text" 
                            className="form-control bg-transparent border-0 text-white shadow-none" 
                            placeholder="Search by name or effect (e.g. ATK)..." 
                            value={search}
                            onChange={(e) => setSearch(e.value || e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {Object.keys(groupedArtifacts).length > 0 ? (
                Object.entries(groupedArtifacts).map(([group, items], gIdx) => (
                    <div key={gIdx} className="mb-5 animate-slide-up" style={{ animationDelay: `${gIdx * 0.1}s` }}>
                        <h4 className="fw-bold mb-4 d-flex align-items-center gap-3" style={{ color: '#35ecc3' }}>
                            <span className="bg-primary bg-opacity-10 p-2 rounded-3 border border-primary border-opacity-20" style={{ width: '40px', height: '40px', display: 'grid', placeItems: 'center' }}>
                                <i className="bi bi-collection"></i>
                            </span>
                            {group}
                        </h4>
                        <div className="row g-4">
                            {items.map((art, iIdx) => {
                                const icon = getIcon(art.id);
                                return (
                                    <div key={iIdx} className="col-12 col-md-6 col-lg-4">
                                        <div 
                                            className="artifact-premium-card p-4 rounded-4 border border-white border-opacity-10 h-100 transition-all hover-lift pointer overflow-hidden position-relative"
                                            style={{ 
                                                background: 'rgba(255,255,255,0.03)',
                                                backdropFilter: 'blur(12px)',
                                                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                                            }}
                                            onClick={() => navigate(`/artifacts/${art.id}`)}
                                        >
                                            {/* Decorative Background Glow */}
                                            <div className="position-absolute" style={{ 
                                                top: '-20%', right: '-20%', width: '100px', height: '100px', 
                                                background: 'rgba(53, 236, 195, 0.05)', filter: 'blur(40px)', zIndex: 0 
                                            }} />

                                            <div className="d-flex align-items-center gap-4 mb-4 position-relative" style={{ zIndex: 1 }}>
                                                <div className="art-icon-ring p-1 rounded-circle border-2 border-primary border-opacity-30" style={{ borderStyle: 'dashed' }}>
                                                    <div className="p-2 bg-dark rounded-circle shadow-inner" style={{ width: '70px', height: '70px' }}>
                                                        <img src={icon || getPlaceholder(70, 70, '?')} alt="" className="w-100 h-100 object-contain" crossOrigin="anonymous" />
                                                    </div>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="text-warning mb-1" style={{ fontSize: '0.7rem', letterSpacing: '2px' }}>
                                                        {'★'.repeat(Math.max(...(art.rarity || [5])))}
                                                    </div>
                                                    <h5 className="fw-bold mb-0 text-white truncate-2 text-capitalize">{art.displayName}</h5>
                                                </div>
                                            </div>
                                            
                                            <div className="effects-stack d-flex flex-column gap-3 position-relative" style={{ zIndex: 1 }}>
                                                <div className="effect-box">
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <span className="badge bg-primary rounded-pill" style={{ fontSize: '0.55rem' }}>2PC</span>
                                                        <div className="text-white-50 fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>STAT BONUS</div>
                                                    </div>
                                                    <div className="fw-bold text-white-75 small" style={{ lineHeight: '1.4' }}>{art.effect2Pc}</div>
                                                </div>
                                                <div className="effect-box">
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <span className="badge bg-success rounded-pill" style={{ fontSize: '0.55rem' }}>4PC</span>
                                                        <div className="text-white-50 fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>SET EFFECT</div>
                                                    </div>
                                                    <div className="text-white-50" style={{ fontSize: '0.7rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        {art.effect4Pc}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 pt-3 border-top border-white border-opacity-5 d-flex justify-content-between align-items-center position-relative" style={{ zIndex: 1 }}>
                                                <span className="text-primary small fw-bold text-uppercase tracking-wider">Explore Synergy</span>
                                                <i className="bi bi-chevron-right text-primary"></i>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-12 text-center py-5 opacity-25">
                    <i className="bi bi-search display-1 mb-3 d-block"></i>
                    <p>No artifact sets match your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default ArtifactsPage;
