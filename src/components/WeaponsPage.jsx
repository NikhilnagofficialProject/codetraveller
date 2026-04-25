import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlaceholder } from '../utils/characterUtils.jsx';

const WeaponsPage = ({ assets }) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState({
        types: [],
        rarities: [],
        sources: []
    });

    const toggleFilter = (category, value) => {
        setActiveFilters(prev => {
            const current = prev[category];
            const newValues = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [category]: newValues };
        });
    };

    const weapons = useMemo(() => {
        if (!assets?.weaponsMap) return [];
        return Object.values(assets.weaponsMap).filter(w => {
            const matchesSearch = w.name?.toLowerCase().includes(search.toLowerCase());
            const matchesType = activeFilters.types.length === 0 || activeFilters.types.includes(w.type);
            const matchesRarity = activeFilters.rarities.length === 0 || activeFilters.rarities.includes(parseInt(w.rarity));
            const matchesSource = activeFilters.sources.length === 0 || activeFilters.sources.some(s => 
                w.howToGet?.toLowerCase().includes(s.toLowerCase())
            );
            return matchesSearch && matchesType && matchesRarity && matchesSource;
        });
    }, [assets, search, activeFilters]);

    const weaponTypes = ['Sword', 'Claymore', 'Polearm', 'Bow', 'Catalyst'];
    const rarities = [5, 4, 3];
    const sources = ['BP', 'Craftable', 'Event', 'Exploration', 'Fishing', 'Gacha', 'Quest', 'Shop'];

    return (
        <div className="weapons-page animate-fade-in py-4 text-white">
            <div className="page-header mb-5 text-center">
                <h1 className="display-4 fw-bold mb-2">Weapon Database</h1>
                <p className="opacity-50">Explore the full collection of weapons and their stats.</p>
            </div>

            {/* Premium Filter Bar */}
            <div className="d-flex flex-column align-items-center gap-4 mb-5">
                <div className="d-flex flex-wrap gap-4 justify-content-center bg-dark bg-opacity-25 p-3 rounded-4 border border-white border-opacity-10">
                    {/* Search */}
                    <div className="input-group bg-dark bg-opacity-50 border border-white border-opacity-10 rounded-pill px-3 py-1" style={{ width: '300px' }}>
                        <span className="input-group-text bg-transparent border-0 text-white-50"><i className="bi bi-search"></i></span>
                        <input
                            type="text"
                            className="form-control bg-transparent border-0 text-white shadow-none"
                            placeholder="Search weapons..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="vr bg-secondary mx-2 d-none d-md-block opacity-25" />

                    {/* Type Filters */}
                    <div className="d-flex gap-2 flex-wrap justify-content-center">
                        {weaponTypes.map(t => {
                            const isActive = activeFilters.types.includes(t);
                            const iconUrl = assets?.weaponTypes?.[t.toLowerCase()];
                            return (
                                <button
                                    key={t}
                                    onClick={() => toggleFilter('types', t)}
                                    className={`btn p-1 rounded-3 d-flex align-items-center justify-content-center transition-all ${isActive ? 'bg-white text-black shadow-sm scale-110' : 'bg-dark text-white-50 opacity-75'}`}
                                    style={{ width: '40px', height: '40px', border: '1px solid rgba(255,255,255,0.1)' }}
                                    title={t}
                                >
                                    {iconUrl ? (
                                        <img src={iconUrl} alt={t} className="w-100 h-100 object-contain p-1" style={{ filter: isActive ? 'none' : 'brightness(0) invert(1)' }} />
                                    ) : (
                                        <span style={{ fontSize: '9px', fontWeight: 'bold' }}>{t.substring(0, 3).toUpperCase()}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="vr bg-secondary mx-2 d-none d-md-block opacity-25" />

                    {/* Rarity Filters */}
                    <div className="d-flex gap-2 flex-wrap justify-content-center">
                        {rarities.map(star => {
                            const isActive = activeFilters.rarities.includes(star);
                            return (
                                <button
                                    key={star}
                                    onClick={() => toggleFilter('rarities', star)}
                                    className={`btn p-1 rounded-3 d-flex align-items-center justify-content-center transition-all ${isActive ? 'bg-white text-black shadow-sm scale-110' : 'bg-dark text-white-50 opacity-75'}`}
                                    style={{ width: '40px', height: '40px', border: '1px solid rgba(255,255,255,0.1)' }}
                                    title={`${star}-Star`}
                                >
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{star}★</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="vr bg-secondary mx-2 d-none d-md-block opacity-25" />

                    {/* Source Filters */}
                    <div className="d-flex gap-2 flex-wrap justify-content-center">
                        {sources.map(s => {
                            const isActive = activeFilters.sources.includes(s);
                            return (
                                <button
                                    key={s}
                                    onClick={() => toggleFilter('sources', s)}
                                    className={`btn btn-sm rounded-pill px-3 transition-all ${isActive ? 'btn-primary shadow-sm scale-105' : 'bg-dark text-white-50 opacity-75'}`}
                                    style={{ border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', height: '32px' }}
                                >
                                    {s}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="row g-4 justify-content-center">
                {weapons.length > 0 ? weapons.map((w, i) => (
                    <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2 d-flex justify-content-center">
                        <div
                            className="weapon-card-v p-3 text-center rounded-4 border border-white border-opacity-10 bg-dark bg-opacity-25 hover-lift pointer position-relative overflow-hidden d-flex flex-column align-items-center"
                            onClick={() => navigate(`/weapons/${w.name}`)}
                            style={{ width: '100%', maxWidth: '180px', minHeight: '180px', aspectRatio: '1/1.2' }}
                        >
                            <div className="rarity-badge position-absolute top-0 end-0 p-2 opacity-50" style={{ fontSize: '10px' }}>
                                {w.rarity}★
                            </div>
                            <div className="weapon-icon-box mx-auto mb-3" style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                                <img src={w.image || getPlaceholder(80, 80, '?')} alt={w.name} className="w-100 h-100 object-contain" />
                            </div>
                            <div className="fw-bold small mb-1" style={{ 
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', 
                                overflow: 'hidden', minHeight: '32px', lineHeight: '1.2'
                            }}>
                                {w.name}
                            </div>
                            <div className="text-primary mt-auto" style={{ fontSize: '10px' }}>{w.type}</div>
                        </div>
                    </div>
                )) : (
                    <div className="col-12 text-center py-5 opacity-25">
                        <i className="bi bi-search display-1 mb-3 d-block"></i>
                        <p>No weapons match your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeaponsPage;
