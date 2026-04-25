import React, { useState } from 'react';
import GenshinFilters from './GenshinFilters';

const GenshinBuilds = ({ builds, assets, loading, error, onCharacterClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState({
        elements: [],
        weapons: [],
        regions: [],
        rarities: []
    });

    if (loading) return (
        <div className="text-center text-white p-5 animate-pulse">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <div>Loading character builds database...</div>
        </div>
    );

    if (error) return <div className="text-center text-danger p-5">Error loading database. Please check your connection.</div>;

    const filteredBuilds = builds.filter(b => {
        const matchesSearch =
            b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.element.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesElement = activeFilters.elements.length === 0 || activeFilters.elements.some(f => f.toLowerCase() === b.element?.toLowerCase());
        const matchesWeapon = activeFilters.weapons.length === 0 || activeFilters.weapons.some(f => f.toLowerCase() === b.weaponType?.toLowerCase());
        const matchesRegion = activeFilters.regions.length === 0 || activeFilters.regions.some(f => f.toLowerCase() === b.region?.toLowerCase());
        const matchesRarity = activeFilters.rarities.length === 0 || activeFilters.rarities.includes(parseInt(String(b.rarity).trim()));

        return matchesSearch && matchesElement && matchesWeapon && matchesRegion && matchesRarity;
    }).sort((a, b) => a.name.localeCompare(b.name));

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

                <div className="position-relative" style={{ maxWidth: '300px', width: '100%' }}>
                    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50"></i>
                    <input
                        type="text"
                        placeholder="Search name or element..."
                        className="form-control bg-dark border-secondary text-white rounded-pill ps-5"
                        style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.1)' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <GenshinFilters activeFilters={activeFilters} assets={assets} onFilterChange={setActiveFilters} />

            <div className="row g-3">
                {filteredBuilds.map((build) => (
                    <div key={build.id} className="col-6 col-sm-4 col-md-3 col-lg-2 d-flex justify-content-center">
                        <div
                            className="card border-0 overflow-hidden shadow character-card"
                            onClick={() => onCharacterClick([build])}
                            style={{
                                cursor: 'pointer',
                                background: '#1f2937',
                                borderRadius: '12px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                aspectRatio: '3/4',
                                border: '1px solid rgba(255,255,255,0.05)',
                                width: '100%',
                                maxWidth: '200px'
                            }}
                        >
                            <div style={{ position: 'absolute', inset: 0 }}>
                                <img
                                    src={build.portrait || 'https://placehold.co/400x600/151725/FFF?text=No+Image'}
                                    alt={build.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                                    loading="lazy"
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 10%, transparent 70%)' }} />
                            </div>

                            <div className="card-body d-flex flex-column justify-content-end p-3" style={{ position: 'relative', zIndex: 2 }}>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getElementColor(build.element) }} />
                                    <span className="text-uppercase text-white-50" style={{ fontSize: '10px', letterSpacing: '1px' }}>{build.element}</span>
                                </div>
                                <h5 className="card-title text-white fw-bold mb-1" style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{build.name}</h5>
                                <div className="text-warning small" style={{ letterSpacing: '2px' }}>
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

export default GenshinBuilds;
