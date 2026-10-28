import React, { useState, useMemo } from 'react';
import GenshinFilters from './GenshinFilters';

const GenshinBuilds = ({ builds, assets, loading, error, onCharacterClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState({
        elements: [],
        weapons: [],
        regions: [],
        rarities: []
    });

    const filteredBuilds = useMemo(() => {
        if (!builds) return [];
        return builds.filter(b => {
            const matchesSearch =
                b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.element.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesElement = activeFilters.elements.length === 0 || activeFilters.elements.some(f => f.toLowerCase() === b.element?.toLowerCase());
            const matchesWeapon = activeFilters.weapons.length === 0 || activeFilters.weapons.some(f => f.toLowerCase() === b.weaponType?.toLowerCase());
            const matchesRegion = activeFilters.regions.length === 0 || activeFilters.regions.some(f => f.toLowerCase() === b.region?.toLowerCase());
            const matchesRarity = activeFilters.rarities.length === 0 || activeFilters.rarities.includes(parseInt(String(b.rarity).trim()));

            return matchesSearch && matchesElement && matchesWeapon && matchesRegion && matchesRarity;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [builds, searchTerm, activeFilters]);

    if (loading) return (
        <div className="text-center text-white p-5 animate-pulse">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <div>Loading character builds database...</div>
        </div>
    );

    if (error) return <div className="text-center text-danger p-5">Error loading database. Please check your connection.</div>;

    const getElementColor = (element) => {
        const map = {
            'pyro': '#ff7b00', 'hydro': '#00aaff', 'cryo': '#8be8ff',
            'electro': '#9b51e0', 'anemo': '#7ef9ff', 'geo': '#ffd700',
            'dendro': '#7fff00'
        };
        return map[element?.toLowerCase()] || '#ccc';
    };

    return (
        <div className="container-fluid p-0 animate-fade-in">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="mb-0 fw-bold text-white" style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Character Builds
                    </h2>
                    <p className="text-white-50 small mb-0">
                        Optimized guides from the CodeTraveller community
                    </p>
                </div>

                <div className="position-relative" style={{ maxWidth: '400px', width: '100%' }}>
                    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50"></i>
                    <input
                        type="text"
                        placeholder="Search characters or elements..."
                        className="form-control premium-input rounded-pill ps-5 py-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <GenshinFilters activeFilters={activeFilters} assets={assets} onFilterChange={setActiveFilters} />

            <div className="builds-grid mt-4">
                {filteredBuilds.map((build) => (
                    <div key={build.id} className="d-flex justify-content-center">
                        <div
                            className="card border-0 overflow-hidden shadow-lg character-card glass hover-grow"
                            onClick={() => onCharacterClick([build])}
                            style={{
                                cursor: 'pointer',
                                borderRadius: '20px',
                                position: 'relative',
                                aspectRatio: '3/4',
                                width: '100%',
                                background: `linear-gradient(135deg, rgba(21, 23, 37, 0.4) 0%, ${getElementColor(build.element)}20 100%)`
                            }}
                        >
                            <div style={{ position: 'absolute', inset: 0 }}>
                                <img
                                    src={build.portrait || 'https://placehold.co/400x600/151725/FFF?text=No+Image'}
                                    alt={build.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                                    loading="lazy"
                                />
                                <div style={{ 
                                    position: 'absolute', inset: 0, 
                                    background: `linear-gradient(to top, rgba(12, 15, 29, 0.9) 10%, transparent 60%), linear-gradient(to top right, ${getElementColor(build.element)}15, transparent)` 
                                }} />
                                
                                {/* Role Icons Badge */}
                                <div className="position-absolute top-0 end-0 m-2 d-flex flex-column gap-1" style={{ zIndex: 3 }}>
                                    {(() => {
                                        const roles = build.officialRoles && build.officialRoles.length > 0 
                                            ? build.officialRoles 
                                            : [build.role || ''];
                                        
                                        return roles.map((r, idx) => {
                                            const roleStr = r.toLowerCase();
                                            let iconKey = '';
                                            if (roleStr.includes('dps') && !roleStr.includes('sub')) iconKey = 'dps';
                                            else if (roleStr.includes('sub') || roleStr.includes('off')) iconKey = 'off-field';
                                            else if (roleStr.includes('healer')) iconKey = 'healer';
                                            else if (roleStr.includes('tank') || roleStr.includes('shield') || roleStr.includes('shielder')) iconKey = 'tank';
                                            else if (roleStr.includes('support') || roleStr.includes('buffer')) iconKey = 'support';
                                            
                                            const iconUrl = assets?.roleIcons?.[iconKey];
                                            if (!iconUrl) return null;

                                            return (
                                                <div 
                                                    key={idx} 
                                                    className="rounded-circle bg-dark bg-opacity-75 border border-white border-opacity-10 d-flex align-items-center justify-content-center" 
                                                    style={{ 
                                                        width: idx === 0 ? '32px' : '24px', 
                                                        height: idx === 0 ? '32px' : '24px', 
                                                        backdropFilter: 'blur(8px)',
                                                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                                        padding: idx === 0 ? '6px' : '4px'
                                                    }}
                                                    title={r}
                                                >
                                                    <img src={iconUrl} alt={r} className="w-100 h-100 object-contain" style={{ filter: 'brightness(1.2)' }} />
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>

                            <div className="card-body d-flex flex-column justify-content-end p-3" style={{ position: 'relative', zIndex: 2 }}>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getElementColor(build.element), boxShadow: `0 0 10px ${getElementColor(build.element)}` }} />
                                    <span className="text-uppercase fw-black" style={{ fontSize: '9px', letterSpacing: '1.5px', color: getElementColor(build.element) }}>{build.element}</span>
                                </div>
                                <h5 className="card-title text-white fw-bold mb-0" style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{build.name}</h5>
                                <div className="text-warning opacity-75" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                                    {'★'.repeat(Math.min(5, Math.max(4, parseInt(String(build.rarity).trim()) || 4)))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            {filteredBuilds.length === 0 && (
                <div className="text-center py-5 text-muted bg-dark bg-opacity-25 rounded-4 mt-4">
                    <i className="bi bi-emoji-frown d-block fs-1 mb-3"></i>
                    No characters found matching "{searchTerm}"
                </div>
            )}
        </div>
    );
};

export default React.memo(GenshinBuilds);
