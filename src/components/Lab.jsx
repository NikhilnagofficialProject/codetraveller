import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlaceholder, parseTeams, getElementColor, cleanArtifactLabelV2 } from '../utils/characterUtils.jsx';
import artifactsData from '../data/artifacts.json';

// Character Components for Models
import CharacterBanner from './character/CharacterBanner';
import SummarySection from './character/SummarySection';
import StableGearSection from './character/GearSection';
import StableTeamSection from './character/TeamSection';
import TestGearSection from './character/TestGearSection';
import TestTeamSection from './character/TestTeamSection';
import FlipCard from './common/FlipCard';

import './CharacterDetail.css';

const Lab = ({ builds, assets }) => {
    const navigate = useNavigate();
    const [selectedSample, setSelectedSample] = useState(0);

    // Find Columbina specifically
    const columbina = builds.find(b => b.name.toLowerCase().includes('columbina')) || builds[0];
    const char = columbina || {
        name: 'Columbina',
        element: 'Hydro',
        role: 'Main DPS',
        weapon: 'Wandering Evenstar; ~A Thousand Blazing Suns; ~Solar Pearl; The Widsith; ~Mappa Mare',
        artifacts: 'Blizzard Strayer (4pc); [Alternative]: Gilded Dreams (4pc)',
        rarity: '5',
        splashArt: 'https://static.wikia.nocookie.net/gensin-impact/images/d/d3/Character_Columbina_Portrait.png',
        teams: "Lunar-Charged: [Premium]: Columbina > Flins > Ineffa > Sucrose/Jahoda; [F2P]: Columbina > Raiden Shogun/Clorinde > Fischl/Ororon > Sucrose/Jahoda\nLunar Crystallize: [Premium]: Columbina > Zibai > Illuga > Zhongli/Chiori; [F2P]: Columbina > Navia/Noelle > Gorou/Albedo/ > Chiori/Mona\nNotes: Jahoda C6 is recommended in both Premium/F2P, if no C6 sucrose would be recommended."
    };

    const rawWeaponList = char.weapon.split(/[\n;]/).map(w => w.trim()).filter(w => w);
    
    // Smart grouping for Tree Structure
    const groupedWeapons = [];
    let lastParent = null;
    rawWeaponList.forEach((w, i) => {
        if (w.startsWith('~') && lastParent) {
            lastParent.children.push(w.replace('~', '').trim());
        } else {
            const newWeapon = { name: w, children: [], isBest: i === 0 };
            groupedWeapons.push(newWeapon);
            lastParent = newWeapon;
        }
    });

    const bestWeapon = groupedWeapons[0];
    const alternatives = groupedWeapons.slice(1);

    const getElementColor = (element) => {
        const map = {
            'pyro': '#ff7b00', 'hydro': '#00aaff', 'cryo': '#8be8ff',
            'electro': '#9b51e0', 'anemo': '#7ef9ff', 'geo': '#ffd700',
            'dendro': '#7fff00'
        };
        return map[element?.toLowerCase()] || '#ccc';
    };

    const elColor = getElementColor(char.element); 

    const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const getWeaponIcon = (name) => {
        if (!name || !assets?.weaponsMap) return null;
        const searchName = name.replace(/^\d+\.\s*/, '').replace(/\(\d+\)/, '').replace(/\[.*?\]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
        const matchKey = Object.keys(assets.weaponsMap).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(searchName));
        return matchKey ? assets.weaponsMap[matchKey].icon : null;
    };

    const getArtifactIcon = (name) => {
        if (!name || !assets?.artifacts) return null;
        const searchName = name.replace(/\(.*?pc\)/g, '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
        const matchKey = Object.keys(assets.artifacts).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(searchName));
        return matchKey ? assets.artifacts[matchKey] : null;
    };

    const samples = [
        { id: 0, title: 'Model 1: Tree Structure', description: 'Hierarchical grouping using parent-child relationships for side-grades.' },
        { id: 1, title: 'Model 2: Modular Gallery', description: 'Split card interface optimized for mobile and HoYoLAB sharing.' },
        { id: 2, title: 'Model 3: Official Card (Stable)', description: 'The current production layout used on character detail pages.' },
        { id: 3, title: 'Model 4: Experimental Style (Testing)', description: 'Modernized layout utilizing experimental sub-components.' },
        { id: 4, title: 'Model 5: Interactive Grid', description: 'Flip-card interface showcasing a high-end interactive database style.' },
        { id: 5, title: 'Model 6: Artifact Showcase', description: 'Premium artifact database with 3D glassmorphism cards grouped by bonus.' }
    ];

    const renderSample = () => {
        const props = { char, color: elColor, bestWeapon, alternatives, getWeaponIcon, getArtifactIcon, assets, hexToRgba };
        switch(selectedSample) {
            case 0: return <TreeStructure {...props} />;
            case 1: return <ModularGallery {...props} />;
            case 2: return <StableCard character={char} assets={assets} />;
            case 3: return <ExperimentalCard character={char} assets={assets} />;
            case 4: return <InteractiveGrid builds={builds} assets={assets} />;
            case 5: return <ArtifactShowcase assets={assets} />;
            default: return null;
        }
    };

    return (
        <div className="lab-page text-white py-5 animate-fade-in">
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold mb-2">Design Lab</h1>
                <p className="text-white-50">Experimental layouts for the character build card system.</p>
                
                <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap px-2">
                    {samples.map(s => (
                        <button 
                            key={s.id}
                            onClick={() => setSelectedSample(s.id)}
                            className={`btn rounded-pill px-4 py-2 transition-all flex-grow-1 flex-md-grow-0 ${selectedSample === s.id ? 'btn-primary shadow-lg scale-105' : 'btn-outline-light opacity-50'}`}
                            style={{ minWidth: '140px', maxWidth: '300px' }}
                        >
                            {s.title}
                        </button>
                    ))}
                    <button className="btn rounded-pill px-4 py-2 btn-outline-dashed border-secondary opacity-50 flex-grow-1 flex-md-grow-0" style={{ minWidth: '140px', maxWidth: '300px' }} disabled>
                        + Add New Model
                    </button>
                </div>
            </div>

            <div className="sample-container p-3 p-md-5 rounded-5 glass shadow-2xl mb-5 mx-auto" style={{ maxWidth: '1100px' }}>
                <div className="mb-4">
                    <h3 className="fw-bold mb-1">{samples[selectedSample].title}</h3>
                    <p className="text-white-50 small">{samples[selectedSample].description}</p>
                </div>
                
                <div className="p-4 rounded-4 border border-white border-opacity-5" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    {renderSample()}
                </div>
            </div>
            
            <div className="text-center">
                <button onClick={() => navigate('/builds')} className="btn btn-link text-white-50 text-decoration-none">
                    <i className="bi bi-arrow-left me-2"></i>Back to Builds
                </button>
            </div>
        </div>
    );
};

// Placeholder for future models
// Model 3: Stable Card Wrapper
const StableCard = ({ character, assets }) => {
    const themeColor = getElementColor(character.element);
    return (
        <div className={`sheet ${character.element?.toLowerCase() || 'anemo'} mx-auto`} style={{ width: '100%', maxWidth: '1080px' }}>
            <CharacterBanner character={character} themeColor={themeColor} />
            <div className="content">
                <SummarySection character={character} assets={assets} />
                <StableGearSection character={character} assets={assets} />
                <StableTeamSection character={character} assets={assets} />
            </div>
            <div className="watermark">
                CodeTraveller Design Lab • Stable Model Preview
            </div>
        </div>
    );
};

// Model 4: Experimental Card Wrapper
const ExperimentalCard = ({ character, assets }) => {
    const themeColor = getElementColor(character.element);
    const namecard = character.namecard || null;
    
    return (
        <div 
            className={`sheet ${character.element?.toLowerCase() || 'anemo'} mx-auto overflow-hidden`} 
            style={{ 
                width: '100%', 
                maxWidth: '1080px',
                background: namecard 
                    ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${namecard}) center/cover no-repeat`
                    : undefined
            }}
        >
            <div className="text-center py-5 position-relative" style={{ zIndex: 10 }}>
                <div className="text-uppercase fw-bold mb-1" style={{ color: themeColor, letterSpacing: '8px', fontSize: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Character Build</div>
                <h1 className="display-1 fw-black text-white mb-0" style={{ letterSpacing: '-4px', textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>{character.name}</h1>
                <div className="d-flex justify-content-center gap-3 mt-3">
                    <div className="badge rounded-pill px-4 py-2" style={{ background: themeColor, color: '#000', fontWeight: '800' }}>{character.element}</div>
                    <div className="badge rounded-pill px-4 py-2 bg-dark bg-opacity-50 border border-white border-opacity-20">{character.role}</div>
                </div>
            </div>

            <div className="content position-relative" style={{ zIndex: 1, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)' }}>
                <SummarySection character={character} assets={assets} />
                <TestGearSection character={character} assets={assets} />
                <TestTeamSection character={character} assets={assets} />
            </div>
            <div className="watermark py-3 text-center border-top border-white border-opacity-10" style={{ background: 'rgba(0,0,0,0.3)' }}>
                CodeTraveller Design Lab • Experimental Model Preview
            </div>
        </div>
    );
};

const ModelPlaceholder = () => (
    <div className="p-5 text-center opacity-50">
        <div className="h3">New Model Under Construction</div>
        <p>Coming soon: Modular / Split Card Layouts</p>
    </div>
);

const TreeStructure = ({ char, color, bestWeapon, alternatives, getWeaponIcon, hexToRgba }) => {
    // Safety check for hexToRgba if not passed from Lab
    const safeRgba = hexToRgba || ((hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    });

    return (
        <div className="d-flex flex-column gap-5">
            {/* Best Weapon - The Root Parent */}
            <div className="best-weapon-root p-4 rounded-4" style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, ${safeRgba(color, 0.1)} 100%)`, border: `1px solid ${safeRgba(color, 0.4)}`, boxShadow: `0 0 30px ${safeRgba(color, 0.1)}` }}>
                <div className="d-flex align-items-center gap-4">
                    <div className="p-1 rounded-3" style={{ width: '100px', height: '100px', background: 'rgba(0,0,0,0.3)', border: `2px solid ${safeRgba(color, 0.6)}` }}>
                        <img src={getWeaponIcon(bestWeapon.name) || getPlaceholder(100, 100, 'W')} className="w-100 h-100 object-contain" alt="" />
                    </div>
                    <div>
                        <div className="text-uppercase fw-bold mb-1" style={{ color, fontSize: '0.75rem', letterSpacing: '3px' }}>Ultimate Choice</div>
                        <div className="h3 fw-bold mb-1 text-white">{bestWeapon.name}</div>
                        <div className="text-white small">Premium recommendation for {char.name}</div>
                    </div>
                </div>
            </div>

            {/* Alternative Groups - The Branches */}
            <div className="alternatives-tree px-3">
                <h5 className="text-white-50 small text-uppercase tracking-widest mb-4">Alternative Grouping</h5>
                <div className="row g-4">
                    {alternatives.map((group, idx) => (
                        <div key={idx} className="col-md-6 col-lg-4">
                            <div className="tree-group position-relative ps-4">
                                {/* The Parent of this group */}
                                <div className="parent-weapon d-flex align-items-center gap-3 mb-3 p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div className="p-1 rounded-3" style={{ width: '50px', height: '50px', background: 'rgba(0,0,0,0.2)' }}>
                                        <img src={getWeaponIcon(group.name) || getPlaceholder(50, 50, 'A')} className="w-100 h-100 object-contain" alt="" />
                                    </div>
                                    <div className="fw-bold text-white small">{group.name}</div>
                                </div>

                                {/* The Children / Side-grades */}
                                {group.children.length > 0 && (
                                    <div className="children-branch ms-2 position-relative">
                                        {/* Vertical Branch Line */}
                                        <div className="position-absolute" style={{ left: '-15px', top: '-10px', bottom: '25px', width: '2px', background: `linear-gradient(to bottom, ${safeRgba(color, 0.4)}, transparent)` }} />
                                        
                                        {group.children.map((child, cIdx) => (
                                            <div key={cIdx} className="child-weapon d-flex align-items-center gap-2 mb-2 position-relative">
                                                {/* Horizontal Branch Hook */}
                                                <div className="position-absolute" style={{ left: '-15px', top: '50%', width: '10px', height: '2px', background: safeRgba(color, 0.4) }} />
                                                
                                                <div className="p-1 rounded-circle border border-white border-opacity-10" style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.05)' }}>
                                                    <img src={getWeaponIcon(child) || getPlaceholder(32, 32, 'S')} className="w-100 h-100 object-contain" alt="" />
                                                </div>
                                                <div className="text-white" style={{ fontSize: '11px' }}>{child}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ModularGallery = ({ char, color, bestWeapon, alternatives, getWeaponIcon, getArtifactIcon, assets, hexToRgba }) => {
    const [activeCard, setActiveCard] = useState('cover');
    const navigate = useNavigate();

    const getPortrait = (name) => {
        if (!name || !assets?.characters) return null;
        const clean = (str) => str.toLowerCase().trim();
        const search = clean(name);
        if (assets.characters[search]?.portrait) return assets.characters[search].portrait;
        const normalized = search.replace(/[\s\-_]+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (assets.characters[normalized]?.portrait) return assets.characters[normalized].portrait;
        const simpleName = search.replace(/\s*\(.*?\)/g, '').trim();
        if (assets.characters[simpleName]?.portrait) return assets.characters[simpleName].portrait;
        if (search.includes('traveler')) {
            const tMatch = Object.keys(assets.characters).find(k => k.includes('traveler') || k.includes('lumine') || k.includes('aether'));
            if (tMatch) return assets.characters[tMatch].portrait;
        }
        const keys = Object.keys(assets.characters);
        const fuzzyMatch = keys.find(k => {
            const ck = clean(k);
            return ck.includes(search) || search.includes(ck);
        });
        return fuzzyMatch ? assets.characters[fuzzyMatch].portrait : null;
    };

    const renderCard = () => {
        const cardStyle = { 
            background: char.namecard 
                ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${char.namecard}) center/cover no-repeat`
                : `linear-gradient(135deg, rgba(0,0,0,0.7), ${hexToRgba(color, 0.25)})`, 
            border: `1px solid ${hexToRgba(color, 0.4)}`, 
            minHeight: '600px',
            boxShadow: `0 20px 60px rgba(0,0,0,0.6)`,
            overflow: 'hidden',
            position: 'relative'
        };

        switch(activeCard) {
            case 'cover':
                // ... (same as before)
                return (
                    <div className="card-outer p-0 rounded-5 animate-fade-in position-relative h-100" style={cardStyle}>
                        {/* Dynamic Elemental Background */}
                        <div className="position-absolute w-100 h-100" style={{ 
                            background: `radial-gradient(circle at 50% 50%, ${hexToRgba(color, 0.35)} 0%, transparent 80%)`,
                            zIndex: 0
                        }} />
                        
                        <div className="d-flex flex-column h-100 position-relative" style={{ zIndex: 1, minHeight: '600px' }}>
                            {/* Splash Art Section */}
                            <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
                                <img 
                                    src={char.splashArt} 
                                    alt={char.name} 
                                    className="img-fluid animate-float" 
                                    style={{ 
                                        maxHeight: '480px', 
                                        filter: `drop-shadow(0 0 40px ${hexToRgba(color, 0.6)})`,
                                        objectFit: 'contain'
                                    }}
                                    onError={(e) => { e.target.src = char.portrait; }}
                                />
                            </div>
                            
                            {/* Character Identity Footer */}
                            <div className="p-5 text-center" style={{ 
                                background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.7) 50%, transparent)',
                                backdropFilter: 'blur(5px)'
                            }}>
                                <div className="text-uppercase fw-bold mb-2" style={{ color, letterSpacing: '5px', fontSize: '0.9rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Build Guide</div>
                                <h1 className="display-2 fw-black text-white mb-2" style={{ letterSpacing: '-3px', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>{char.name}</h1>
                                <div className="d-flex justify-content-center gap-4 align-items-center">
                                    <div className="badge rounded-pill px-4 py-2 fw-bold" style={{ background: color, color: '#000', fontSize: '1rem', boxShadow: `0 0 20px ${hexToRgba(color, 0.4)}` }}>{char.element}</div>
                                    <div className="stars text-warning h4 mb-0" style={{ textShadow: '0 0 10px rgba(255,193,7,0.5)' }}>{'★'.repeat(parseInt(char.rarity) || 5)}</div>
                                    <div className="badge rounded-pill px-4 py-2 border border-white border-opacity-30 fw-bold" style={{ backdropFilter: 'blur(10px)' }}>{char.role}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'gear':
                const artifactList = char.artifacts?.split(';').map(a => a.trim()).filter(a => a) || [];
                return (
                    <div className="card-outer p-4 rounded-5 animate-fade-in d-flex flex-column gap-4" style={cardStyle}>
                        <div className="text-center">
                            <div className="text-uppercase fw-bold mb-1" style={{ color, letterSpacing: '2px', fontSize: '0.7rem' }}>Equipment Guide</div>
                            <h2 className="fw-bold text-white">Weapons & Artifacts</h2>
                        </div>
                        
                        <div className="row g-4 overflow-auto px-2" style={{ maxHeight: '460px' }}>
                            <div className="col-12">
                                <TreeStructure char={char} color={color} bestWeapon={bestWeapon} alternatives={alternatives} getWeaponIcon={getWeaponIcon} hexToRgba={hexToRgba} />
                            </div>
                            <div className="col-12 mt-4">
                                <div className="p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${hexToRgba(color, 0.2)}` }}>
                                    <h5 className="fw-bold mb-3 text-white">Recommended Artifacts</h5>
                                    <div className="d-flex flex-column gap-3">
                                        {artifactList.map((art, idx) => (
                                            <div key={idx} className="p-2 rounded-3 d-flex align-items-center gap-3 border border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                <div className="p-1 rounded-2" style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.03)' }}>
                                                    <img src={getArtifactIcon(art) || getPlaceholder(45, 45, 'A')} className="w-100 h-100 object-contain" alt="" />
                                                </div>
                                                <div className="text-white fw-bold" style={{ fontSize: '13px' }}>{art}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'teams':
                const { groups, notes } = parseTeams(char.teams);
                return (
                    <div className="card-outer p-4 rounded-5 animate-fade-in d-flex flex-column h-100" style={cardStyle}>
                        <div className="text-center mb-4">
                            <div className="text-uppercase fw-bold mb-1" style={{ color, letterSpacing: '2px', fontSize: '0.7rem' }}>Synergy Guide</div>
                            <h2 className="fw-bold text-white">Team Compositions</h2>
                        </div>
                        
                        <div className="flex-grow-1 overflow-auto px-2 d-flex flex-column gap-4" style={{ maxHeight: '420px' }}>
                            {groups.map((group, gIdx) => (
                                <div key={gIdx} className="team-section">
                                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color }}>
                                        <span className="p-1 rounded bg-primary" style={{ width: '4px', height: '18px' }}></span>
                                        {group.name}
                                    </h5>
                                    <div className="d-flex flex-column gap-3">
                                        {group.variants.map((v, vIdx) => (
                                            <div key={vIdx} className="p-3 rounded-4 border border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                <div className="d-flex flex-wrap align-items-center gap-3" style={{ rowGap: '0.75rem' }}>
                                                    <div className={`badge rounded-pill px-2 ${v.type.toLowerCase() === 'premium' ? 'bg-warning text-dark' : 'bg-success text-white'}`} style={{ fontSize: '0.6rem', minWidth: '70px', textAlign: 'center' }}>
                                                        {v.type.toUpperCase()}
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2 flex-wrap flex-grow-1" style={{ rowGap: '0.5rem' }}>
                                                        {v.slots.map((slot, sIdx) => (
                                                            <React.Fragment key={sIdx}>
                                                                <div className="d-flex align-items-center position-relative" style={{ minWidth: '55px' }}>
                                                                    {slot.map((m, idx) => (
                                                                        <div 
                                                                            key={idx} 
                                                                            className="member-portrait-squircle"
                                                                            style={{ 
                                                                                width: '55px', 
                                                                                height: '55px', 
                                                                                marginLeft: idx > 0 ? '-18px' : '0',
                                                                                zIndex: 10 - idx,
                                                                                boxShadow: idx > 0 ? '-5px 0 12px rgba(0,0,0,0.5)' : 'none'
                                                                            }}
                                                                        >
                                                                            <div className="w-100 h-100 rounded-4 overflow-hidden border border-white border-opacity-10 p-1" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}>
                                                                                <img src={getPortrait(m) || `https://ui-avatars.com/api/?name=${m}&background=random&color=fff`} className="w-100 h-100 object-cover rounded-3" alt="" />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {sIdx < v.slots.length - 1 && <i className="bi bi-chevron-right text-white opacity-25" style={{ fontSize: '10px' }}></i>}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            
                            {notes.length > 0 && (
                                <div className="mt-auto p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-20">
                                    <h6 className="fw-bold mb-2" style={{ color }}>Notes:</h6>
                                    {notes.map((n, i) => (
                                        <div key={i} className="text-white mb-1 d-flex align-items-start gap-2" style={{ fontSize: '11px', lineHeight: '1.5' }}>
                                            <i className="bi bi-info-circle" style={{ color }}></i>
                                            <span>{n}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'notes':
                return (
                    <div className="card-outer p-4 rounded-5 animate-fade-in" style={cardStyle}>
                        <div className="text-center mb-4">
                            <div className="text-uppercase fw-bold mb-1" style={{ color, letterSpacing: '2px', fontSize: '0.7rem' }}>Expert Advice</div>
                            <h2 className="fw-bold text-white">Talents & Strategy</h2>
                        </div>
                        <div className="d-flex flex-column gap-3">
                            <div className="p-3 rounded-4 bg-dark bg-opacity-50 border border-white border-opacity-10">
                                <h5 className="fw-bold mb-2" style={{ color }}>Talent Priority</h5>
                                <div className="h4 text-white">{char.talents || 'N/A'}</div>
                            </div>
                            <div className="p-3 rounded-4 bg-dark bg-opacity-50 border border-white border-opacity-10">
                                <h5 className="fw-bold mb-2" style={{ color }}>Build Notes</h5>
                                <p className="text-white" style={{ fontSize: '13px', lineHeight: '1.6' }}>{char.description || 'No additional notes provided.'}</p>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="modular-gallery-view">
            {/* Gallery Tabs */}
            <div className="d-flex justify-content-center gap-3 mb-4">
                {[
                    { id: 'cover', label: 'Cover', icon: 'bi-image' },
                    { id: 'gear', label: 'Gear', icon: 'bi-shield-shaded' },
                    { id: 'teams', label: 'Teams', icon: 'bi-people' },
                    { id: 'notes', label: 'Notes', icon: 'bi-journal-text' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveCard(tab.id)}
                        className={`btn d-flex align-items-center gap-2 px-4 py-2 rounded-4 transition-all ${activeCard === tab.id ? 'btn-primary shadow-lg scale-105' : 'btn-dark border-secondary'}`}
                        style={{ background: activeCard === tab.id ? undefined : 'rgba(255,255,255,0.05)' }}
                    >
                        <i className={`bi ${tab.icon}`}></i>
                        <span className="fw-bold">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* The Active Card */}
            <div className="gallery-content">
                {renderCard()}
            </div>

            {/* Gallery Footer */}
            <div className="text-center mt-4">
                <button className="btn btn-sm btn-outline-primary rounded-pill px-4 py-2 border-2 fw-bold">
                    <i className="bi bi-download me-2"></i> Export Current Card
                </button>
            </div>
        </div>
    );
};

const InteractiveGrid = ({ builds, assets }) => {
    // Show a sample grid of 6 characters
    const samples = builds.slice(0, 6);
    
    return (
        <div className="row g-4">
            {samples.map((b, i) => (
                <div key={i} className="col-12 col-md-6 col-lg-4">
                    <FlipCard
                        height="400px"
                        borderRadius="24px"
                        front={
                            <div className="h-100 w-100 position-relative overflow-hidden">
                                <img 
                                    src={b.splashArt || b.portrait} 
                                    alt={b.name} 
                                    className="w-100 h-100 object-cover" 
                                    style={{ filter: 'brightness(0.8)' }}
                                />
                                <div className="position-absolute bottom-0 start-0 w-100 p-4 text-start" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                                    <div className="badge rounded-pill mb-2" style={{ background: getElementColor(b.element), color: '#000' }}>{b.element}</div>
                                    <h3 className="fw-black text-white mb-0">{b.name}</h3>
                                </div>
                            </div>
                        }
                        back={
                            <div className="d-flex flex-column h-100 w-100 text-start">
                                <div className="mb-auto">
                                    <div className="text-uppercase fw-bold text-primary small mb-2 tracking-widest">Build Overview</div>
                                    <div className="mb-3">
                                        <div className="text-white-50 small">Primary Role</div>
                                        <div className="fw-bold">{b.role}</div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="text-white-50 small">Best Weapon</div>
                                        <div className="fw-bold text-truncate">{b.weapon.split(';')[0]}</div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="text-white-50 small">Artifact Set</div>
                                        <div className="fw-bold text-truncate">{b.artifacts.split(';')[0]}</div>
                                    </div>
                                </div>
                                <button className="btn btn-primary rounded-pill w-100 fw-bold">
                                    View Full Guide
                                </button>
                            </div>
                        }
                    />
                </div>
            ))}
        </div>
    );
};

const ArtifactShowcase = ({ assets }) => {
    const navigate = useNavigate();
    
    // Group artifacts by their 2-piece effect
    const groupedArtifacts = useMemo(() => {
        const groups = {};
        
        Object.entries(artifactsData).forEach(([name, data]) => {
            const effect = data.effect2Pc || 'Utility / Specialized';
            // Simplify grouping by common keywords
            let key = 'Other';
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
            
            if (!groups[key]) groups[key] = [];
            groups[key].push({ ...data, id: name });
        });
        
        return groups;
    }, []);

    const getIcon = (name) => {
        if (!name || !assets?.artifacts) return null;
        const clean = (s) => s.toLowerCase().replace(/['’]s/g, '').replace(/[^a-z0-9]/g, '').trim();
        const search = clean(name);
        const keys = Object.keys(assets.artifacts);
        const match = keys.find(k => clean(k) === search || clean(k).includes(search) || search.includes(clean(k)));
        return match ? assets.artifacts[match] : null;
    };

    return (
        <div className="artifact-showcase py-4">
            {Object.entries(groupedArtifacts).map(([group, items], gIdx) => (
                <div key={gIdx} className="mb-5">
                    <h4 className="fw-bold mb-4 d-flex align-items-center gap-3" style={{ color: '#35ecc3' }}>
                        <span className="bg-primary bg-opacity-25 p-2 rounded-3" style={{ width: '40px', height: '40px', display: 'grid', placeItems: 'center' }}>
                            <i className="bi bi-layers-fill"></i>
                        </span>
                        {group}
                    </h4>
                    <div className="row g-4">
                        {items.map((art, iIdx) => {
                            const icon = getIcon(art.id);
                            return (
                                <div key={iIdx} className="col-12 col-md-6 col-lg-4">
                                    <div 
                                        className="artifact-premium-card p-4 rounded-4 border border-white border-opacity-10 h-100 transition-all hover-lift pointer"
                                        style={{ 
                                            background: 'rgba(255,255,255,0.03)',
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                        }}
                                        onClick={() => navigate(`/artifacts/${art.id}`)}
                                    >
                                        <div className="d-flex align-items-center gap-4 mb-4">
                                            <div className="art-icon-ring p-1 rounded-circle border-2 border-primary border-opacity-50" style={{ borderStyle: 'dashed' }}>
                                                <div className="p-2 bg-dark rounded-circle" style={{ width: '70px', height: '70px' }}>
                                                    <img src={icon || getPlaceholder(70, 70, '?')} alt="" className="w-100 h-100 object-contain" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-warning small mb-1">
                                                    {'★'.repeat(Math.max(...(art.rarity || [5])))}
                                                </div>
                                                <h5 className="fw-bold mb-0 text-white">{art.name}</h5>
                                            </div>
                                        </div>
                                        
                                        <div className="effects-stack d-flex flex-column gap-3">
                                            <div className="effect-box">
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className="badge bg-primary rounded-pill" style={{ fontSize: '0.6rem' }}>2PC</span>
                                                    <div className="text-white-50 fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>STAT BONUS</div>
                                                </div>
                                                <div className="fw-bold text-white-75 small" style={{ lineHeight: '1.4' }}>{art.effect2Pc}</div>
                                            </div>
                                            <div className="effect-box">
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className="badge bg-success rounded-pill" style={{ fontSize: '0.6rem' }}>4PC</span>
                                                    <div className="text-white-50 fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>SET EFFECT</div>
                                                </div>
                                                <div className="text-white-50" style={{ fontSize: '0.75rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {art.effect4Pc}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 pt-3 border-top border-white border-opacity-5 d-flex justify-content-between align-items-center">
                                            <span className="text-primary small fw-bold">View Characters</span>
                                            <i className="bi bi-arrow-right text-primary"></i>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Lab;
