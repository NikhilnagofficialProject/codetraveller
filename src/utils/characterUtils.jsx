import React from 'react';

export const getPlaceholder = (w, h, text) => {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect fill="#333" width="${w}" height="${h}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#777" font-family="sans-serif" font-size="20">
    ${text || '?'}
  </text>
</svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const getWeaponImage = (weaponName, weaponsMap) => {
    if (!weaponName) return getPlaceholder(150, 150, 'Weapon');
    const lower = weaponName.toLowerCase().trim();
    
    // Check for object or string entry
    const getUrl = (val) => typeof val === 'string' ? val : val?.image;
    
    if (weaponsMap?.[lower]) return getUrl(weaponsMap[lower]);
    const clean = lower.replace(/^\d+\.\s*/, '').split('(')[0].trim();
    return getUrl(weaponsMap?.[clean]) || getPlaceholder(150, 150, 'Weapon');
};

export const parseWeapons = (rawText) => {
    if (!rawText) return [];
    const lines = rawText.split(/\n/);
    const groups = [];
    let currentMain = null;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;
        
        // Extract rarity e.g. (5) or (5*) -> 5★
        const rarityMatch = trimmed.match(/\((\d+)\*?\)/);
        const rarity = rarityMatch ? `${rarityMatch[1]}★` : '';
        
        // Extract tags [Best], [F2P], etc.
        const tags = trimmed.match(/\[(.*?)\]/g)?.map(t => t.replace(/[\[\]]/g, '')) || [];
        const category = tags.join(' / ');

        if (trimmed.startsWith('~')) {
            if (currentMain) {
                const cleanName = trimmed.replace(/^~/, '').replace(/\[.*?\]/g, '').replace(/\(\d+\*?\)/, '').trim();
                currentMain.alts.push({ 
                    name: cleanName, 
                    rarity,
                    category: category || 'Alternative', 
                    raw: trimmed 
                });
            }
        } else {
            const cleanName = trimmed.replace(/^\d+\.\s*/, '').replace(/\[.*?\]/g, '').replace(/\(\d+\*?\)/, '').trim();
            currentMain = { 
                name: cleanName, 
                rarity,
                note: tags.join(' '), 
                alts: [], 
                raw: trimmed 
            };
            groups.push(currentMain);
        }
    });
    return groups.filter(g => g.name);
};

export const getTalentIcons = (text, isNote = false, weaponIconUrl = null) => {
    const t = text.toLowerCase();
    const icons = [];
    
    // If it's a note, ONLY show the note symbol and ignore other keywords
    if (isNote || t.includes('note') || t.startsWith('~')) {
        return [<svg key="note" viewBox="0 0 24 24" fill="currentColor" style={{ width: '70%', height: '70%' }}><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>];
    }
    
    if (t.includes('normal') || t.includes('attack') || t.includes('na')) {
        if (weaponIconUrl) {
            return [<img key="na" src={weaponIconUrl} alt="NA" style={{ width: '70%', height: '70%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />];
        }
        icons.push(<svg key="na" viewBox="0 0 24 24" fill="currentColor" style={{ width: '70%', height: '70%', transform: 'rotate(45deg)' }}><path d="M5.12 14l-.88.88-2.12-2.12 2.12-2.12-.88-.88 2.12-2.12 1.41 1.41 8.49-8.49 1.41 1.41-8.49 8.49 1.41 1.41-2.12 2.12-.88-.88 2.12-2.12-.88-.88zM20.3 16.96l-7.78-7.78-1.41 1.41 7.78 7.78 1.41-1.41zM18.89 19.78l-7.78-7.78-1.41 1.41 7.78 7.78 1.41-1.41z" /></svg>);
    }
    if (t.includes('skill') || (t.includes('elemental') && !t.includes('burst') && !t.includes('q'))) {
        icons.push(<svg key="skill" viewBox="0 0 24 24" fill="currentColor" style={{ width: '70%', height: '70%' }}><path d="M12 2L9.19 8.63 2 9.19l5.57 4.51L6.1 21 12 17.27 17.9 21l-1.48-7.3L22 9.19l-7.19-.56L12 2z" /></svg>);
    }
    if (t.includes('burst') || t.includes('q')) {
        icons.push(<svg key="burst" viewBox="0 0 24 24" fill="currentColor" style={{ width: '70%', height: '70%' }}><path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.5 2.54l2.63 1.53c.56-1.24.87-2.6.87-4.07 0-5.17-3.95-9.44-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.05.51-9 4.78-9 9.95 0 5.52 4.48 10 10 10 2.23 0 4.29-.73 5.95-1.99l-2.65-1.52c-1.03.68-2.22 1.06-3.3 1.06zm-1-6.47V7.88c-.62.33-1.18.78-1.63 1.33l1.63 3.32zm2.63-2.12c-.45-.55-1.01-1-1.63-1.33v4.65l1.63-3.32z" /></svg>);
    }
    return icons.length > 0 ? icons : [<svg key="generic" viewBox="0 0 24 24" fill="currentColor" style={{ width: '70%', height: '70%' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>];
};

export const cleanArtifactLabelV2 = (text) => {
    if (!text) return '';
    // Remove prefixes like ~ or 1.
    let clean = text.replace(/^[~*\d.\s]+/, '');
    
    // Remove common prefixes/suffixes like 2pc, 4pc, set, etc globally
    clean = clean.replace(/\b(?:2pc|4pc|2-set|4-set|set)\b/gi, '').trim();

    // Handle specific common stat-based names before general cleaning
    let processed = clean
        .replace(/(?:\+?18%?\s*ATK|ATK\s*\+?18%?)(?:\s*set)?/gi, "Gladiator's")
        .replace(/(?:\+?80\s*EM|EM\s*\+?80)(?:\s*set)?/gi, "Gilded")
        .replace(/(?:\+?20%?\s*ER|ER\s*\+?20%?)(?:\s*set)?/gi, "Emblem")
        .replace(/(?:\+?15%?\s*Hydro|Hydro\s*\+?15%?)(?:\s*set)?/gi, "Heart of Depth")
        .replace(/(?:\+?15%?\s*Anemo|Anemo\s*\+?15%?)(?:\s*set)?/gi, "Viridescent")
        .replace(/(?:\+?15%?\s*Pyro|Pyro\s*\+?15%?)(?:\s*set)?/gi, "Crimson Witch")
        .replace(/(?:\+?15%?\s*Cryo|Cryo\s*\+?15%?)(?:\s*set)?/gi, "Blizzard Strayer")
        .replace(/(?:\+?20%?\s*HP|HP\s*\+?20%?)(?:\s*set)?/gi, "Tenacity")
        .replace(/(?:\+?15%?\s*Healing|Healing\s*\+?15%?)(?:\s*set)?/gi, "Maiden");

    // Remove (4), [Tags], etc.
    return processed.replace(/\s*\(.*?\)/g, '').replace(/\s*\[.*?\]/g, '').split('/')[0].trim();
};

export const extractArtifactNote = (text) => {
    if (!text) return null;
    const match = text.match(/\[(.*?)\]/);
    return match ? match[1] : null;
};

export const parseMainStats = (text) => {
    if (!text) return [];
    const lines = text.split('\n').filter(l => l.trim());
    
    const cleanVal = (v) => v.replace(/^(Sands|Goblet|Circlet|Time|Cup|Hat|Head|Sands of Eon|Goblet of Eonothem|Circlet of Logos)\s*[:\-]\s*/i, '').trim();

    // If it's a simple list like "ATK / Pyro / Crit"
    if (lines.length === 1 && lines[0].includes('/')) {
        const parts = lines[0].split('/').map(p => p.trim());
        const labels = ['Sands', 'Goblet', 'Circlet'];
        return parts.map((val, i) => ({ 
            label: labels[i] || 'Stat', 
            value: cleanVal(val) 
        }));
    }

    return lines.map(line => {
        const parts = line.split(':');
        if (parts.length > 1) {
            let label = parts[0].trim();
            // Normalize labels for icon matching
            if (/sands|time/i.test(label)) label = 'Sands';
            else if (/goblet|cup/i.test(label)) label = 'Goblet';
            else if (/circlet|hat|head/i.test(label)) label = 'Circlet';
            return { label, value: cleanVal(parts[1].trim()) };
        }
        // Try fallback if no colon but dash
        const dashParts = line.split('-');
        if (dashParts.length > 1) {
             let label = dashParts[0].trim();
             if (/sands|time/i.test(label)) label = 'Sands';
             else if (/goblet|cup/i.test(label)) label = 'Goblet';
             else if (/circlet|hat|head/i.test(label)) label = 'Circlet';
             return { label, value: cleanVal(dashParts[1].trim()) };
        }
        return { label: 'Stat', value: cleanVal(line.trim()) };
    }).slice(0, 3);
};

export const parseTeams = (text) => {
    if (!text) return { groups: [], notes: [] };
    const lines = text.split('\n').filter(l => l.trim());
    const groups = [];
    const globalNotes = [];
    let currentGroup = null;

    lines.forEach(line => {
        const trimmed = line.trim();
        // Handle Notes
        if (trimmed.startsWith('~') || trimmed.match(/^Notes?:\s*/i)) {
            globalNotes.push(trimmed.replace(/^~\s*/, '').replace(/^Notes?:\s*/i, '').trim());
            return;
        }

        // Handle Team Heading (e.g. "1. Team Name")
        if (/^\d+\./.test(trimmed)) {
            currentGroup = { 
                name: trimmed.replace(/^\d+\.\s*/, '').replace(/:$/, '').trim(), 
                variants: [] 
            };
            groups.push(currentGroup);
            return;
        }

        // Handle Variants (e.g. "[Premium] : Aino>Flins")
        if (trimmed.includes(':') || trimmed.includes('>')) {
            if (!currentGroup) {
                currentGroup = { name: 'Teams', variants: [] };
                groups.push(currentGroup);
            }

            let type = 'Standard';
            let memberStr = trimmed;

            // Extract type from [Type] : or Label :
            const variantMatch = trimmed.match(/^\[(.*?)\]\s*:\s*(.*)/) || trimmed.match(/^(.*?)\s*:\s*(.*)/);
            if (variantMatch) {
                type = variantMatch[1].trim();
                memberStr = variantMatch[2].trim();
            }

            // Split by > (slots) and then handle / (alternatives)
            const slots = memberStr.split('>').map(slot => {
                // Handle character names with potential (Parentheses) like Traveler (Dendro)
                return slot.split('/').map(m => m.trim()).filter(m => m);
            }).filter(s => s.length > 0);

            currentGroup.variants.push({ type, slots });
        }
    });

    return { groups, notes: globalNotes };
};
export const getElementColor = (el) => {
    const map = { pyro: '#ff7b00', hydro: '#00aaff', cryo: '#8be8ff', electro: '#9b51e0', anemo: '#7ef9ff', geo: '#ffd700', dendro: '#7fff00' };
    return map[el?.toLowerCase()] || '#ccc';
};
