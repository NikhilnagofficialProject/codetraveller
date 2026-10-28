import React from 'react';
import { getTalentIcons } from '../../utils/characterUtils.jsx';

const SummarySection = ({ character, assets }) => {
    // lookup for weapon icon
    const getWeaponIcon = () => {
        if (!assets?.weaponTypes || !character.weaponType) return null;
        const type = character.weaponType.toLowerCase().trim();
        // 1. Direct match
        if (assets.weaponTypes[type]) return assets.weaponTypes[type];
        // 2. Singular/Plural variants
        const variants = [type, type + 's', type.replace(/s$/, ''), type.replace(/s$/, '') + 's'];
        for (const v of variants) {
            if (assets.weaponTypes[v]) return assets.weaponTypes[v];
        }
        // 3. Partial match (last resort)
        const keys = Object.keys(assets.weaponTypes);
        const find = keys.find(k => k.includes(type) || type.includes(k));
        if (find) return assets.weaponTypes[find];

        return null;
    };

    const weaponIcon = getWeaponIcon();

    // Helper to parse talent priority into items with rank
    const parseTalents = (text) => {
        if (!text) return [];
        // Handle "1. Skill ~ 2. Burst" or "Skill > Burst" or "\n" separated
        const parts = text.split(/[>\n~]|(?=\d\.)/).map(p => p.trim()).filter(Boolean);
        return parts.map((p, i) => {
            const isNote = /Notes?:\s*/i.test(p);
            // Remove numbering and the "Notes:" prefix to keep UI clean
            const clean = p.replace(/^\d+\.\s*/, '').replace(/Notes?:\s*/i, '');
            return { name: clean, rank: i + 1, isNote };
        });
    };

    return (
        <div className="layout-row row-1">
            {/* Quick Summary Card */}
            <div className="card quick-summary main-col p-3">
                <div className="small-title mb-2">QUICK SUMMARY</div>
                <div className="summary-content">
                    <div className="summary-item mb-2">
                        <div className="label">Playstyle:</div>
                        <div className="d-flex align-items-center gap-2 mt-1">
                            {(() => {
                                const roles = character.officialRoles && character.officialRoles.length > 0 
                                    ? character.officialRoles 
                                    : [character.role || ''];
                                
                                return roles.map((r, idx) => {
                                    const roleStr = r.toLowerCase();
                                    let iconKey = '';
                                            if (roleStr.includes('dps') && !roleStr.includes('sub')) iconKey = 'dps';
                                            else if (roleStr.includes('sub') || roleStr.includes('off')) iconKey = 'off-field';
                                            else if (roleStr.includes('healer')) iconKey = 'healer';
                                            else if (roleStr.includes('tank') || roleStr.includes('shield') || roleStr.includes('shielder')) iconKey = 'tank';
                                            else if (roleStr.includes('support') || roleStr.includes('buffer')) iconKey = 'support';
                                            
                                            const iconUrl = assets?.roleIcons?.[iconKey];
                                            return iconUrl && <img key={idx} src={iconUrl} alt={r} style={{ width: '24px', height: '24px', filter: 'brightness(1.1)' }} title={r} />;
                                        });
                                    })()}
                                    <div className="value fw-bold text-primary">
                                        {character.role || 'General Build'}
                                    </div>
                                </div>
                    </div>

                    <div className="description-text small opacity-75 mb-3" style={{ whiteSpace: 'pre-line' }}>
                        {character.description?.split('\n').slice(0, 4).join('\n')}
                    </div>

                    <div className="summary-item mb-2">
                        <div className="label">Priority:</div>
                        <div className="value small">{character.priority || 'N/A'}</div>
                    </div>

                    {character.talents?.includes('Note') && (
                        <div className="summary-item">
                            <div className="label">NOTES:</div>
                            <div className="value x-small opacity-50">
                                {character.talents.split('Note:')[1]?.trim()}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Talent Priority Card */}
            <div className="card talent-card side-col p-3">
                <div className="small-title mb-3">TALENT PRIORITY</div>
                <div className="talent-grid d-flex flex-column gap-3">
                    {parseTalents(character.talents).slice(0, 3).map((talent, i) => (
                        <div key={i} className="talent-item d-flex align-items-center gap-3">
                            <div className="talent-icon-box position-relative">
                                <div className="talent-icon-box bg-dark bg-opacity-50 rounded-2 border border-white border-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                                    {getTalentIcons(talent.name, talent.isNote, weaponIcon)}
                                </div>
                                <div className="rank-badge position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '12px', height: '12px', fontSize: '7px', transform: 'translate(30%, 30%)' }}>
                                    {talent.rank}
                                </div>
                            </div>
                            <div className="talent-name fw-bold small">{talent.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Base Stats Card (Lv. 90) */}
            {character.baseStats && (
                <div className="card stats-card side-col p-3">
                    <div className="small-title mb-3">BASE STATS (LV.90)</div>
                    <div className="stats-list d-flex flex-column gap-2">
                        {[
                            { label: 'Base HP', value: character.baseStats.baseHp, icon: 'hp' },
                            { label: 'Base ATK', value: character.baseStats.baseAtk, icon: 'atk' },
                            { label: 'Base DEF', value: character.baseStats.baseDef, icon: 'def' },
                            { label: character.baseStats.ascensionStat, value: character.baseStats.ascensionValue, icon: character.baseStats.ascensionStat?.toLowerCase() }
                        ].map((s, idx) => {
                            const iconUrl = assets?.stats?.[s.icon] || assets?.stats?.[s.icon?.replace(' base', '')] || assets?.stats?.[s.icon?.replace(' bonus', '')];
                            return (
                                <div key={idx} className="d-flex align-items-center justify-content-between border-bottom border-white border-opacity-10 pb-1">
                                    <div className="d-flex align-items-center gap-2">
                                        {iconUrl && <img src={iconUrl} alt="" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} />}
                                        <div className="text-white-50" style={{ fontSize: '11px' }}>{s.label}</div>
                                    </div>
                                    <div className="fw-bold" style={{ fontSize: '11px' }}>{s.value}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SummarySection;
