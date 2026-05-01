import React from 'react';

const GenshinFilters = ({ activeFilters, assets, onFilterChange }) => {
    const toggleFilter = (category, value) => {
        const current = activeFilters[category] || [];
        const newValues = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        onFilterChange({ ...activeFilters, [category]: newValues });
    };

    const elements = ['Pyro', 'Hydro', 'Cryo', 'Electro', 'Anemo', 'Geo', 'Dendro'];
    const weapons = ['Sword', 'Claymore', 'Polearm', 'Bow', 'Catalyst'];

    const getElementColor = (el) => {
        const colors = {
            Pyro: '#ff7b00', Hydro: '#00aaff', Cryo: '#8be8ff',
            Electro: '#9b51e0', Anemo: '#7ef9ff', Geo: '#ffd700', Dendro: '#7fff00'
        };
        return colors[el] || '#fff';
    };

    return (
        <div className="mb-5">
            <div className="d-flex flex-wrap gap-4 align-items-center">
                
                {/* Elements */}
                <div className="d-flex gap-2 flex-wrap">
                    {elements.map(el => {
                        const isActive = activeFilters.elements?.includes(el);
                        const color = getElementColor(el);
                        return (
                            <button
                                key={el}
                                onClick={() => toggleFilter('elements', el)}
                                className={`btn p-1 rounded-circle d-flex align-items-center justify-content-center transition-all ${isActive ? 'shadow-lg scale-110' : 'opacity-75'}`}
                                style={{
                                    width: '44px', height: '44px',
                                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
                                    border: `2px solid ${isActive ? color : 'transparent'}`,
                                    backdropFilter: 'blur(5px)'
                                }}
                                title={el}
                            >
                                <span
                                    className="rounded-circle"
                                    style={{
                                        width: '80%', height: '80%',
                                        backgroundColor: color,
                                        boxShadow: isActive ? `0 0 15px ${color}` : 'none'
                                    }}
                                />
                            </button>
                        );
                    })}
                </div>

                <div className="vr bg-white opacity-10 d-none d-md-block" style={{ height: '35px' }} />

                {/* Weapons */}
                <div className="d-flex gap-2 flex-wrap">
                    {weapons.map(w => {
                        const isActive = activeFilters.weapons?.includes(w);
                        const iconUrl = assets?.weaponTypes?.[w.toLowerCase()];
                        return (
                            <button
                                key={w}
                                onClick={() => toggleFilter('weapons', w)}
                                className={`btn p-1 rounded-3 d-flex align-items-center justify-content-center transition-all ${isActive ? 'shadow-lg scale-110' : 'bg-dark bg-opacity-50 text-white-50 opacity-75'}`}
                                style={{ 
                                    width: '48px', height: '48px', 
                                    border: `1px solid ${isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                    background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
                                    backdropFilter: 'blur(5px)'
                                }}
                                title={w}
                            >
                                {iconUrl ? (
                                    <img src={iconUrl} alt={w} className="w-100 h-100 object-contain p-1" style={{ filter: 'brightness(0) invert(1)' }} />
                                ) : (
                                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{w.substring(0, 3).toUpperCase()}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="vr bg-white opacity-10 d-none d-md-block" style={{ height: '35px' }} />

                {/* Rarities (Moved to first line/row priority) */}
                <div className="d-flex gap-2 flex-wrap">
                    {[5, 4].map(star => {
                        const isActive = activeFilters.rarities?.includes(star);
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

                <div className="vr bg-white opacity-10 d-none d-md-block" style={{ height: '35px' }} />

                {/* Regions */}
                <div className="d-flex gap-2 flex-wrap">
                    {['Mondstadt', 'Liyue', 'Inazuma', 'Sumeru', 'Fontaine', 'Natlan', 'Nod-Krai', 'Snezhnaya', 'Unknown'].map(r => {
                        const isActive = activeFilters.regions?.includes(r);
                        const iconUrl = assets?.regions?.[r.toLowerCase()];
                        return (
                            <button
                                key={r}
                                onClick={() => toggleFilter('regions', r)}
                                className={`btn p-1 rounded-3 d-flex align-items-center justify-content-center transition-all ${isActive ? 'shadow-lg scale-110' : 'bg-dark bg-opacity-50 text-white-50 opacity-75'}`}
                                style={{ 
                                    width: '48px', height: '48px', 
                                    border: `1px solid ${isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                    background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
                                    backdropFilter: 'blur(5px)'
                                }}
                                title={r}
                            >
                                {iconUrl ? (
                                    <img src={iconUrl} alt={r} className="w-100 h-100 object-contain p-1" style={{ filter: 'brightness(0) invert(1)' }} />
                                ) : (
                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'white' }}>{r.charAt(0)}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default GenshinFilters;
