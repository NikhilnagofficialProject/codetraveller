import React from 'react';
import { useNavigate } from 'react-router-dom';
import { parseTeams, getElementColor, getPlaceholder } from '../../utils/characterUtils.jsx';

const TeamSection = ({ character, assets }) => {
    const navigate = useNavigate();
    const { groups, notes } = parseTeams(character.teams);
    const themeColor = getElementColor(character.element);

    const cardStyle = {
        background: `linear-gradient(135deg, ${themeColor}15 0%, rgba(0,0,0,0.4) 100%)`,
        borderColor: `${themeColor}33`,
        borderTop: `3px solid ${themeColor}`
    };

    const getPortrait = (name) => {
        if (!name || !assets?.characters) return null;

        const clean = (str) => str.toLowerCase().trim();
        const search = clean(name);

        // 1. Exact Match (for "Traveler (Dendro)" etc.)
        if (assets.characters[search]?.portrait) return assets.characters[search].portrait;

        // 2. Dash/Underscore replacement match
        const normalized = search.replace(/[\s\-_]+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (assets.characters[normalized]?.portrait) return assets.characters[normalized].portrait;

        // 3. Name without Parentheses Match (e.g. "Traveler (Dendro)" -> "Traveler")
        const simpleName = search.replace(/\s*\(.*?\)/g, '').trim();
        if (assets.characters[simpleName]?.portrait) return assets.characters[simpleName].portrait;

        // 4. Manual Traveler Fallback
        if (search.includes('traveler')) {
            const tMatch = Object.keys(assets.characters).find(k => k.includes('traveler') || k.includes('lumine') || k.includes('aether'));
            if (tMatch) return assets.characters[tMatch].portrait;
        }

        // 5. Case-insensitive search through all keys
        const keys = Object.keys(assets.characters);
        const fuzzyMatch = keys.find(k => {
            const ck = clean(k);
            return ck.includes(search) || search.includes(ck);
        });

        return fuzzyMatch ? assets.characters[fuzzyMatch].portrait : null;
    };

    const handleCharClick = (name) => {
        const slug = name.toLowerCase().replace(/\s*\(.*?\)/g, '').trim().replace(/\s+/g, '-');
        navigate(`/builds/${slug}`);
        window.scrollTo(0, 0);
    };

    return (
        <div className="layout-row row-3">
            <div className="card teams-card full-width p-3" style={cardStyle}>
                <div className="small-title mb-4 text-center" style={{ color: themeColor }}>TEAMS</div>
                <div className="teams-grid-container">
                    {groups.map((group, gIdx) => (
                        <div key={gIdx} className="team-group-card mb-3 p-2 rounded-4 border border-white border-opacity-5">
                            <div className="team-title fw-bold mb-3" style={{ fontSize: '1.1em', color: themeColor }}>
                                {gIdx + 1}. {group.name}
                            </div>

                            <div className="variants-stack d-flex flex-column gap-2">
                                {group.variants.map((v, vIdx) => (
                                    <div key={vIdx} className="variant-row d-flex align-items-center gap-3 bg-dark bg-opacity-25 rounded-3 p-2">
                                        <div className={`variant-label-badge ${v.type.toLowerCase() === 'premium' ? 'bg-premium' : 'bg-f2p'}`}>
                                            {v.type.toUpperCase()}
                                        </div>

                                        <div className="variant-members-list d-flex gap-2">
                                            {v.slots.map((slot, sIdx) => (
                                                <div key={sIdx} className="member-slot-box d-flex align-items-center" style={{ minWidth: '42px' }}>
                                                    {slot.map((m, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="member-portrait-square position-relative pointer-hover"
                                                            style={{
                                                                width: '42px',
                                                                height: '42px',
                                                                marginLeft: idx > 0 ? '-15px' : '0',
                                                                zIndex: 10 - idx,
                                                                boxShadow: idx > 0 ? '-4px 0 10px rgba(0,0,0,0.5)' : 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                            title={`View ${m} build`}
                                                            onClick={() => handleCharClick(m)}
                                                        >
                                                            <img src={getPortrait(m) || getPlaceholder(42, 42, m[0])} alt={m} className="w-100 h-100 object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {notes.length > 0 && (
                    <div className="team-notes-list mt-2 opacity-50 border-top border-white border-opacity-10 pt-3">
                        {notes.map((n, i) => <div key={i} className="note-line mb-1" style={{ fontSize: '0.8em' }}><i className="bi bi-info-circle me-2"></i>{n}</div>)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamSection;
