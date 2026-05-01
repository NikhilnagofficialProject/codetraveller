import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlaceholder } from '../utils/characterUtils.jsx';

const WeaponsPage = ({ assets }) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState({
        types: [],
        rarities: [],
        sources: [],
        stats: []
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
            const matchesStat = activeFilters.stats.length === 0 || activeFilters.stats.includes(w.substat);

            return matchesSearch && matchesType && matchesRarity && matchesSource && matchesStat;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [assets, search, activeFilters]);

    const weaponTypes = ['Sword', 'Claymore', 'Polearm', 'Bow', 'Catalyst'];
    const rarities = [5, 4, 3];
    const mainStats = ['ATK', 'CRIT Rate', 'CRIT DMG', 'Energy Recharge', 'Elemental Mastery', 'HP', 'DEF', 'Physical DMG'];
    const sources = ['BP', 'Craftable', 'Event', 'Exploration', 'Fishing', 'Gacha', 'Quest', 'Shop'];

    // Helper to match display name to sheet asset key
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

    return (
        <div className="weapons-page animate-fade-in py-4 text-white">
            <div className="page-header mb-5 d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
                <div>
                    <h1 className="display-5 fw-bold mb-1" style={{ background: 'linear-gradient(45deg, #fff 30%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Weapon Database</h1>
                    <p className="opacity-50 mb-0">Optimized guide from the CodeTraveller and community</p>
                </div>

                {/* Search Bar */}
                <div className="input-group bg-dark bg-opacity-50 border border-white border-opacity-10 rounded-pill px-3 py-1" style={{ maxWidth: '350px', backdropFilter: 'blur(10px)' }}>
                    <span className="input-group-text bg-transparent border-0 text-white-50"><i className="bi bi-search"></i></span>
                    <input
                        type="text"
                        className="form-control bg-transparent border-0 text-white shadow-none"
                        placeholder="Search weapons..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Premium Filter Bar */}
            <div className="filter-container mb-5">
                <div className="d-flex flex-column gap-4">
                    {/* Row 1: Types, Rarities & Sources */}
                    <div className="d-flex flex-wrap gap-4 align-items-center">
                        {/* Weapon Types */}
                        <div className="d-flex gap-2 flex-wrap">
                            {weaponTypes.map(t => {
                                const isActive = activeFilters.types.includes(t);
                                const iconUrl = assets?.weaponTypes?.[t.toLowerCase()];
                                return (
                                    <button
                                        key={t}
                                        onClick={() => toggleFilter('types', t)}
                                        className={`btn p-1 rounded-3 d-flex align-items-center justify-content-center transition-all ${isActive ? 'shadow-lg scale-110' : 'bg-dark bg-opacity-50 text-white-50 opacity-75'}`}
                                        style={{
                                            width: '48px', height: '48px',
                                            border: `1px solid ${isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                            background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
                                            backdropFilter: 'blur(5px)'
                                        }}
                                        title={t}
                                    >
                                        {iconUrl ? (
                                            <img src={iconUrl} alt={t} className="w-100 h-100 object-contain p-1" style={{ filter: 'brightness(0) invert(1)' }} />
                                        ) : (
                                            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{t.substring(0, 3).toUpperCase()}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="vr bg-white opacity-10 mx-1 d-none d-md-block" style={{ height: '35px' }} />

                        {/* Rarities */}
                        <div className="d-flex gap-2 flex-wrap">
                            {rarities.map(star => {
                                const isActive = activeFilters.rarities.includes(star);
                                return (
                                    <button
                                        key={star}
                                        onClick={() => toggleFilter('rarities', star)}
                                        className={`btn p-1 rounded-3 d-flex align-items-center justify-content-center transition-all ${isActive ? 'shadow-lg scale-110' : 'bg-dark bg-opacity-50 text-white-50 opacity-75'}`}
                                        style={{
                                            width: '48px', height: '48px',
                                            border: `1px solid ${isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                            background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
                                            backdropFilter: 'blur(5px)'
                                        }}
                                        title={`${star}-Star`}
                                    >
                                        <span style={{
                                            fontSize: star === 5 ? '10px' : '11px',
                                            fontWeight: 'bold', color: 'white',
                                            letterSpacing: '-1px'
                                        }}>
                                            {'★'.repeat(star)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="vr bg-white opacity-10 mx-1 d-none d-md-block" style={{ height: '35px' }} />

                        {/* Sources */}
                        <div className="d-flex gap-2 flex-wrap">
                            {sources.map(s => {
                                const isActive = activeFilters.sources.includes(s);
                                const iconUrl = assets?.sourceIcons?.[s.toLowerCase()];

                                return (
                                    <button
                                        key={s}
                                        onClick={() => toggleFilter('sources', s)}
                                        className={`btn p-1 rounded-3 d-flex align-items-center justify-content-center transition-all ${isActive ? 'shadow-lg scale-110' : 'bg-dark bg-opacity-50 text-white-50 opacity-75'}`}
                                        style={{
                                            width: '48px', height: '48px',
                                            border: `1px solid ${isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                            background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
                                            backdropFilter: 'blur(5px)'
                                        }}
                                        title={s}
                                    >
                                        {iconUrl ? (
                                            <img src={iconUrl} alt={s} className="w-100 h-100 object-contain p-1" style={{ filter: 'brightness(0) invert(1)' }} />
                                        ) : (
                                            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{s.substring(0, 3).toUpperCase()}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Row 2: Main Stats */}
                    <div className="d-flex flex-wrap gap-2 pt-1">
                        {mainStats.map(s => {
                            const isActive = activeFilters.stats.includes(s);
                            const iconUrl = getStatIcon(s);

                            return (
                                <button
                                    key={s}
                                    onClick={() => toggleFilter('stats', s)}
                                    className={`btn p-1 rounded-3 d-flex align-items-center justify-content-center transition-all ${isActive ? 'shadow-lg scale-110' : 'bg-dark bg-opacity-50 text-white-50 opacity-75'}`}
                                    style={{
                                        width: '42px', height: '42px',
                                        border: `1px solid ${isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                        background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
                                        backdropFilter: 'blur(5px)'
                                    }}
                                    title={s}
                                >
                                    {iconUrl ? (
                                        <img src={iconUrl} alt={s} className="w-100 h-100 object-contain p-1" style={{ filter: 'brightness(0) invert(1)' }} />
                                    ) : (
                                        <span style={{ fontSize: '9px', fontWeight: 'bold' }}>{s.substring(0, 3).toUpperCase()}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="row g-4 justify-content-center">
                {weapons.length > 0 ? weapons.map((w, i) => {
                    const statIcon = getStatIcon(w.substat);
                    
                    const sourceType = w.sourceType?.toLowerCase()?.trim();
                    const howToGet = w.howToGet?.toLowerCase()?.trim() || '';
                    const sourceIcon = w.sourceIcon || 
                                      assets?.sourceIcons?.[sourceType] || 
                                      Object.keys(assets?.sourceIcons || {}).find(key => howToGet.includes(key)) && assets.sourceIcons[Object.keys(assets.sourceIcons).find(key => howToGet.includes(key))];
                    
                    return (
                        <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2 d-flex justify-content-center">
                            <div
                                className="weapon-card-v p-3 text-center rounded-4 border border-white border-opacity-10 bg-dark bg-opacity-25 hover-lift pointer position-relative overflow-hidden d-flex flex-column align-items-center"
                                onClick={() => navigate(`/weapons/${w.name}`)}
                                style={{ width: '100%', maxWidth: '180px', minHeight: '210px' }}
                            >
                                <div className="rarity-badge position-absolute top-0 end-0 p-2 opacity-75" style={{ fontSize: '8px', color: '#ffc107', letterSpacing: '-1px' }}>
                                    {'★'.repeat(parseInt(w.rarity) || 0)}
                                </div>
                                <div className="weapon-icon-box mx-auto mb-3" style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                                    <img src={w.image || getPlaceholder(80, 80, '?')} alt={w.name} className="w-100 h-100 object-contain" />
                                </div>
                                <div className="fw-bold small mb-2 text-white" style={{
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden', minHeight: '32px', lineHeight: '1.2'
                                }}>
                                    {w.name}
                                </div>

                                <div className="mt-auto w-100">
                                    <div className="d-flex align-items-center justify-content-center gap-1 opacity-75 mb-1">
                                        {statIcon && <img src={statIcon} alt="" style={{ width: '12px', height: '12px', filter: 'brightness(0) invert(1)' }} />}
                                        <div className="text-primary" style={{ fontSize: '10px', fontWeight: 'bold' }}>{w.substat}</div>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center gap-1 opacity-50">
                                        {sourceIcon && <img src={sourceIcon} alt="" style={{ width: '12px', height: '12px', objectFit: 'contain' }} />}
                                        <div style={{ fontSize: '9px' }}>{w.sourceType || w.howToGet || 'Unknown'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
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
