import React from 'react';
import { useNavigate } from 'react-router-dom';
import { parseWeapons, cleanArtifactLabelV2, getPlaceholder, parseMainStats, extractArtifactNote, getElementColor } from '../../utils/characterUtils.jsx';
import WeaponTree from './WeaponTree';

const GearSection = ({ character, assets }) => {
    const navigate = useNavigate();
    const weaponGroups = parseWeapons(character.weapon);
    const mainWeapons = weaponGroups.filter(g => g.name);
    const mainStats = parseMainStats(character.mainStats);
    
    const getArtifactIcon = (name) => {
        if (!name || !assets?.artifacts) return null;
        const clean = (str) => str.toLowerCase().replace(/'s/g, '').replace(/[^a-z0-9]/g, '').trim();
        const search = clean(name);
        if (!search) return null;
        const keys = Object.keys(assets.artifacts);
        if (assets.artifacts[name.toLowerCase().trim()]) return assets.artifacts[name.toLowerCase().trim()];
        const match = keys.find(k => {
            const ck = clean(k);
            return ck.includes(search) || search.includes(ck);
        });
        return match ? assets.artifacts[match] : null;
    };

    const getStatIcon = (label) => {
        if (!label || !assets?.artifactTypes) return null;
        const key = label.toLowerCase().trim();
        if (key.includes('sand') || key.includes('time') || key.includes('hour')) return assets.artifactTypes['sands'] || assets.artifactTypes['sand'];
        if (key.includes('goblet') || key.includes('cup')) return assets.artifactTypes['goblet'] || assets.artifactTypes['cup'];
        if (key.includes('circlet') || key.includes('hat') || key.includes('head')) return assets.artifactTypes['circlet'] || assets.artifactTypes['hat'];
        return assets.artifactTypes[key] || null;
    };

    const subStatsRaw = character.subStats || '';
    const subStatsParts = subStatsRaw.split(/[\n;]/).filter(s => s.trim());
    const subStats = subStatsParts.filter(s => !s.toLowerCase().includes('note'));
    const subStatsNote = subStatsParts.find(s => s.toLowerCase().includes('note'))?.replace(/Notes?:\s*/i, '').trim();

    return (
        <div className="layout-row row-2">
            <div className="card weapons-card main-col p-3">
                <div className="small-title mb-3 text-center">WEAPONS</div>
                <div className="weapons-content">
                    <WeaponTree 
                        weaponGroups={weaponGroups} 
                        assets={assets} 
                        themeColor={getElementColor(character.element)} 
                    />
                </div>
            </div>

            <div className="card artifacts-card side-col p-3">
                <div className="small-title mb-2 text-center">ARTIFACTS</div>
                <div className="artifact-grid d-flex flex-wrap justify-content-center gap-3 mb-4">
                    {(() => {
                        const raw = character.artifacts || '';
                        const lines = raw.split(/[\n;]/).filter(l => l.trim()).slice(0, 15);
                        
                        return lines.map((line, i) => {
                            const sanitizedLine = line.replace(/^\d+\.\s*/, '').trim();
                            if (!sanitizedLine) return null;

                            const is2pc = line.includes('(2)');
                            const is4pc = line.includes('(4)');
                            const isHeading = !is2pc && !is4pc;

                            if (isHeading) {
                                return (
                                    <div key={i} className="artifact-sub-heading w-100 text-center opacity-75 fw-bold">
                                        {sanitizedLine.replace(/^[—\s-]+|[—\s-]+$/g, '')}
                                    </div>
                                );
                            }

                            const typeLabel = is2pc ? '2pc' : '4pc';
                            const artNote = extractArtifactNote(sanitizedLine);
                            const parts = sanitizedLine
                                .replace(/\[.*?\]/g, '')
                                .split('/')
                                .map(p => p.trim().replace(/\(\d+\)/g, '').trim())
                                .filter(p => p);
                            
                            const getDisplayName = (artName) => {
                                const clean = cleanArtifactLabelV2(artName).toLowerCase().trim();
                                const shortName = assets.artifactShortNames?.[clean] || 
                                                 assets.artifactShortNames?.[clean.replace(/\s+/g, '-')] ||
                                                 assets.artifactShortNames?.[clean.replace(/['’]s/g, '').replace(/[^a-z0-9]/g, '')];
                                return (shortName || cleanArtifactLabelV2(artName)).replace(/-/g, ' ');
                            };

                            if (parts.length > 1 && is2pc) {
                                // Smart variant mapping for "Choose Two" with same stats
                                const STAT_VARIANTS = {
                                    "Gladiator's Finale": ["Shimenawa's Reminiscence", "Vermillion Hereafter", "Echoes of an Offering", "Nighttime Whispers in the Echoing Woods", "A Day Carved From Rising Winds", "Fragment of Harmonic Whimsy"],
                                    "Wanderer's Troupe": ["Gilded Dreams", "Flower of Paradise Lost", "Aubade of Morningstar and Moon", "Night of the Sky's Unveiling"],
                                    "Emblem of Severed Fate": ["Silken Moon's Serenade", "The Exile", "Scholar"],
                                    "Viridescent Venerer": ["Desert Pavilion Chronicle"],
                                    "Heart of Depth": ["Nymph's Dream"],
                                    "Tenacity of the Millelith": ["Vourukasha's Glow"],
                                    "Crimson Witch of Flames": ["Unfinished Reverie"],
                                    "Deepwood Memories": ["Gilded Dreams"]
                                };

                                const uniqueParts = [];
                                const usedIcons = new Set();

                                parts.forEach((p, idx) => {
                                    let artName = cleanArtifactLabelV2(p);
                                    let iconUrl = getArtifactIcon(artName);

                                    // If this icon is already used in this pill, try a variant
                                    if (usedIcons.has(iconUrl) && STAT_VARIANTS[artName]) {
                                        for (const variant of STAT_VARIANTS[artName]) {
                                            const vUrl = getArtifactIcon(variant);
                                            if (vUrl && !usedIcons.has(vUrl)) {
                                                artName = variant;
                                                iconUrl = vUrl;
                                                break;
                                            }
                                        }
                                    }

                                    usedIcons.add(iconUrl);
                                    uniqueParts.push({ name: artName, url: iconUrl });
                                });

                                return (
                                    <div key={i} className="artifact-pill combo-pill text-center">
                                        <div className="d-flex justify-content-center mb-1">
                                            {uniqueParts.slice(0, 3).map((p, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className="art-icon-box mini pointer-hover" 
                                                    style={{ width: '30px', height: '30px', marginLeft: idx > 0 ? '-10px' : '0' }}
                                                    onClick={() => navigate(`/artifacts/${p.name}`)}
                                                    title={`See who else uses ${p.name}`}
                                                >
                                                    <img src={p.url || getPlaceholder(30, 30, '?')} alt="" className="w-100 h-100 object-contain rounded-circle" crossOrigin="anonymous" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="art-name-label opacity-75 fw-bold">
                                            {uniqueParts.map(p => getDisplayName(p.name)).join(' / ')}
                                        </div>
                                        {artNote && <div className="artifact-note mx-auto">{artNote}</div>}
                                    </div>
                                );
                            }

                            const firstArt = parts[0];
                            const iconUrl = getArtifactIcon(cleanArtifactLabelV2(firstArt));
                            return (
                                <div 
                                    key={i} 
                                    className="artifact-pill text-center pointer-hover"
                                    onClick={() => navigate(`/artifacts/${cleanArtifactLabelV2(firstArt)}`)}
                                    title={`See who else uses ${cleanArtifactLabelV2(firstArt)}`}
                                >
                                    <div className="art-icon-box mx-auto mb-1 position-relative" style={{ width: '44px', height: '44px' }}>
                                        <img src={iconUrl || getPlaceholder(44, 44, '?')} alt="" className="w-100 h-100 object-contain" crossOrigin="anonymous" />
                                        <div className="art-count position-absolute top-0 end-0 bg-dark rounded px-1 fw-bold" style={{ fontSize: '0.6em', border: '1px solid rgba(255,255,255,0.1)' }}>{typeLabel}</div>
                                    </div>
                                    <div className="art-name-label opacity-75 fw-bold">
                                        {getDisplayName(firstArt)}
                                    </div>
                                    {artNote && <div className="artifact-note mx-auto">{artNote}</div>}
                                </div>
                            );
                        });
                    })()}
                </div>

                <div className="stats-stack border-top border-white border-opacity-10 pt-3 d-flex flex-column gap-3">
                    <div className="main-stats-section">
                        <div className="small-title mb-2 text-center">MAIN STATS</div>
                        <div className="d-flex justify-content-center gap-4">
                            {mainStats.map((stat, k) => (
                                <div key={k} className="stat-pill-v text-center">
                                    <img src={getStatIcon(stat.label)} alt="" className="stat-type-icon mx-auto mb-1" style={{ width: '28px', height: '28px' }} onError={(e) => e.target.style.display = 'none'} />
                                    <div className="stat-value fw-bold">{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="sub-stats-section">
                        <div className="small-title mb-2 text-center" style={{ opacity: 0.5 }}>SUB STATS</div>
                        <div className="sub-stats-box d-flex flex-wrap justify-content-center gap-1">
                            {subStats.map((stat, k) => (
                                <div key={k} className="sub-stat-pill">
                                    {stat.trim()}
                                </div>
                            ))}
                        </div>
                    </div>

                    {subStatsNote && (
                        <div className="build-notes text-center opacity-50 px-2">
                            <i className="bi bi-info-circle me-1"></i>
                            {subStatsNote}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GearSection;
