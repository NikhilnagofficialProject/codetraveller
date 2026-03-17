import React, { useState } from 'react';
import { useBuildsData } from '../hooks/useBuildsData';

import GenshinFilters from './GenshinFilters';

const rawImages = import.meta.glob('../assets/characters/portraits/*.webp', { eager: true, import: 'default' });

const imageMap = Object.keys(rawImages).reduce((acc, path) => {
    const fileName = path.split('/').pop().replace('.webp', '').toLowerCase();
    acc[fileName] = rawImages[path];
    return acc;
}, {});

const getCharacterImage = (name) => {
    if (!name) return 'https://via.placeholder.com/300x400?text=?';

    const key = name.toLowerCase();

    return imageMap[key] || 'https://via.placeholder.com/300x400?text=' + name;
};

const GenshinBuilds = ({ onCharacterClick }) => {
    const { builds, loading, error } = useBuildsData();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState({
        elements: [],
        weapons: [],
        regions: []
    });

    if (loading) return <div className="text-center text-white p-5">Loading builds data...</div>;
    if (error) return <div className="text-center text-danger p-5">Error loading builds.</div>;

    const filteredBuilds = builds.filter(b => {
        const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.element.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesElement = activeFilters.elements.length === 0 || activeFilters.elements.includes(b.element);
        const matchesWeapon = activeFilters.weapons.length === 0 || activeFilters.weapons.includes(b.weaponType);
        const matchesRegion = activeFilters.regions.length === 0 || activeFilters.regions.includes(b.region);

        return matchesSearch && matchesElement && matchesWeapon && matchesRegion;
    });

    const groupedBuilds = filteredBuilds.reduce((acc, build) => {
        const name = build.name;
        if (!acc[name]) {
            acc[name] = [];
        }
        acc[name].push(build);
        return acc;
    }, {});

    const displayBuilds = Object.values(groupedBuilds).map(group => group[0]);

    const getElementColor = (element) => {
        const map = {
            'pyro': '#ff7b00',
            'hydro': '#00aaff',
            'cryo': '#8be8ff',
            'electro': '#9b51e0',
            'anemo': '#7ef9ff',
            'geo': '#ffd700',
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
                        Optimized builds for your travelers
                    </p>
                </div>

                <input
                    type="text"
                    placeholder="Search character..."
                    className="form-control bg-dark border-secondary text-white rounded-pill"
                    style={{ maxWidth: '300px', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.1)' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <GenshinFilters activeFilters={activeFilters} onFilterChange={setActiveFilters} />

            <div className="row g-3">
                {displayBuilds.map((build) => (
                    <div key={build.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                        <div
                            className="card border-0 overflow-hidden shadow h-100 character-card"
                            onClick={() => onCharacterClick(groupedBuilds[build.name])}
                            style={{
                                cursor: 'pointer',
                                background: '#1f2937',
                                borderRadius: '12px',
                                transition: 'transform 0.2s',
                                position: 'relative',
                                aspectRatio: '3/4'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ position: 'absolute', inset: 0 }}>
                                <img
                                    src={getCharacterImage(build.characterIcon)}
                                    alt={build.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                                    loading="lazy"
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }} />
                            </div>

                            <div className="card-body d-flex flex-column justify-content-end p-3" style={{ position: 'relative', zIndex: 2 }}>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getElementColor(build.element) }} />
                                    <span className="text-uppercase text-white-50" style={{ fontSize: '10px', letterSpacing: '1px' }}>{build.element}</span>
                                </div>
                                <h5 className="card-title text-white fw-bold mb-1" style={{ fontSize: '1rem' }}>{build.name}</h5>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="text-warning small">
                                        {'★'.repeat(parseInt(build.rarity) || 4)}
                                    </div>
                                    {groupedBuilds[build.name].length > 1 && (
                                        <span className="badge bg-secondary ms-auto" style={{ fontSize: '10px' }}>
                                            {groupedBuilds[build.name].length} Builds
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {displayBuilds.length === 0 && (
                <div className="text-center py-5 text-muted">
                    No characters found matching "{searchTerm}" or selected filters.
                </div>
            )}
        </div>
    );
};

export default GenshinBuilds;
