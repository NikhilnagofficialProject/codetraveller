import React from 'react';

<<<<<<< HEAD
const GenshinFilters = ({ activeFilters, assets, onFilterChange }) => {
=======
const icons = import.meta.glob('../assets/icons/*.webp', { eager: true, import: 'default' });

const getIcon = (name) => {
    const path = `../assets/icons/${name}.webp`;
    return icons[path] || null;
};

const GenshinFilters = ({ activeFilters, onFilterChange }) => {
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
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
        <div className="mb-4">
            <div className="d-flex flex-wrap gap-4 justify-content-center justify-content-md-start">

                <div className="d-flex gap-2 flex-wrap justify-content-center">
                    {elements.map(el => {
                        const isActive = activeFilters.elements?.includes(el);
                        return (
                            <button
                                key={el}
                                onClick={() => toggleFilter('elements', el)}
                                className={`btn p-2 rounded-circle d-flex align-items-center justify-content-center transition-all ${isActive ? 'shadow-lg scale-110' : 'opacity-75'}`}
                                style={{
                                    width: '40px', height: '40px',
                                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
                                    border: `1px solid ${isActive ? getElementColor(el) : 'transparent'}`,
                                    transition: 'all 0.2s'
                                }}
                                title={el}
                            >
<<<<<<< HEAD
=======

>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
                                <span
                                    className="rounded-circle"
                                    style={{
                                        width: '100%', height: '100%',
                                        backgroundColor: getElementColor(el),
                                        boxShadow: `0 0 10px ${getElementColor(el)}`
                                    }}
                                />
                            </button>
                        );
                    })}
                </div>

                <div className="vr bg-secondary mx-2 d-none d-md-block" />

                <div className="d-flex gap-2 flex-wrap justify-content-center">
                    {weapons.map(w => {
                        const isActive = activeFilters.weapons?.includes(w);
<<<<<<< HEAD
                        const iconUrl = assets?.weaponTypes?.[w.toLowerCase()];
=======
                        const iconUrl = getIcon(`Icon_${w}`);
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
                        return (
                            <button
                                key={w}
                                onClick={() => toggleFilter('weapons', w)}
<<<<<<< HEAD
                                className={`btn p-1 rounded-3 d-flex align-items-center justify-content-center ${isActive ? 'bg-white text-black shadow-sm' : 'bg-dark text-white-50'}`}
                                style={{ width: '40px', height: '40px', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}
=======
                                className={`btn p-1 rounded-3 d-flex align-items-center justify-content-center ${isActive ? 'bg-white text-black' : 'bg-dark text-white-50'}`}
                                style={{ width: '40px', height: '40px', border: '1px solid rgba(255,255,255,0.1)' }}
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
                                title={w}
                            >
                                {iconUrl ? (
                                    <img src={iconUrl} alt={w} className="w-100 h-100 object-contain p-1" />
                                ) : (
<<<<<<< HEAD
                                    <span style={{ fontSize: '9px', fontWeight: 'bold' }}>{w.substring(0, 3).toUpperCase()}</span>
=======
                                    <span style={{ fontSize: '10px' }}>{w}</span>
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="vr bg-secondary mx-2 d-none d-md-block" />

                <div className="d-flex gap-2 flex-wrap justify-content-center">
<<<<<<< HEAD
                    {['Mondstadt', 'Liyue', 'Inazuma', 'Sumeru', 'Fontaine', 'Natlan', 'Nod-Krai', 'Snezhnaya', 'Unknown'].map(r => {
                        const isActive = activeFilters.regions?.includes(r);
                        const iconUrl = assets?.regions?.[r.toLowerCase()];
=======
                    {['Mondstadt', 'Liyue', 'Inazuma', 'Sumeru', 'Fontaine', 'Natlan', 'Snezhnaya'].map(r => {
                        const isActive = activeFilters.regions?.includes(r);
                        const iconUrl = getIcon(`Icon_Region_${r}`);
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
                        return (
                            <button
                                key={r}
                                onClick={() => toggleFilter('regions', r)}
<<<<<<< HEAD
                                className={`btn p-1 rounded-3 d-flex align-items-center justify-content-center ${isActive ? 'bg-white shadow-sm' : 'bg-dark'}`}
                                style={{ width: '40px', height: '40px', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}
=======
                                className={`btn p-1 rounded-3 d-flex align-items-center justify-content-center ${isActive ? 'bg-white' : 'bg-dark'}`}
                                style={{ width: '40px', height: '40px', border: '1px solid rgba(255,255,255,0.1)' }}
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
                                title={r}
                            >
                                {iconUrl ? (
                                    <img src={iconUrl} alt={r} className="w-100 h-100 object-contain p-1" />
                                ) : (
<<<<<<< HEAD
                                    <span style={{ fontSize: '9px', fontWeight: 'bold', color: isActive ? 'black' : 'rgba(255,255,255,0.5)' }}>{r.charAt(0)}</span>
=======
                                    <span style={{ fontSize: '10px' }}>{r.charAt(0)}</span>
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
                                )}
                            </button>
                        );
                    })}
                </div>
<<<<<<< HEAD

                <div className="vr bg-secondary mx-2 d-none d-md-block" />

                <div className="d-flex gap-2 flex-wrap justify-content-center">
                    {[4, 5].map(star => {
                        const isActive = activeFilters.rarities?.includes(star);
                        return (
                            <button
                                key={star}
                                onClick={() => toggleFilter('rarities', star)}
                                className={`btn p-1 rounded-3 d-flex align-items-center justify-content-center ${isActive ? 'bg-white text-black shadow-sm' : 'bg-dark text-white-50'}`}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    transition: 'all 0.2s'
                                }}
                                title={`${star}-Star`}
                            >
                                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{star}★</span>
                            </button>
                        );
                    })}
                </div>

=======
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
            </div>
        </div>
    );
};

export default GenshinFilters;
