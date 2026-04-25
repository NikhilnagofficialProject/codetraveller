<<<<<<< HEAD
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { getElementColor } from '../utils/characterUtils.jsx';
import CharacterBanner from './character/CharacterBanner';
import SummarySection from './character/SummarySection';
import GearSection from './character/GearSection';
import TeamSection from './character/TeamSection';
import './CharacterDetail.css';

const CharacterDetail = ({ character: initialCharacter, assets, onBack }) => {
    // Current setup handles array of builds for same character
    const builds = Array.isArray(initialCharacter) ? initialCharacter : [initialCharacter];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const cardRef = useRef(null);

    const character = builds[currentIndex];
    if (!character) return null;

    const themeColor = getElementColor(character.element);

    const handleDownload = async () => {
        if (!cardRef.current || isDownloading) return;
        setIsDownloading(true);
        
        try {
            const original = cardRef.current;
            
            // Create a temporary container for the high-res capture
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.style.width = '1200px';
            document.body.appendChild(container);

            // Clone the sheet and set up for download mode
            const clone = original.cloneNode(true);
            clone.classList.add('downloading');
            clone.style.width = '1200px';
            container.appendChild(clone);

            // Wait for images to load in the clone
            await new Promise(r => setTimeout(r, 800));

            const canvas = await html2canvas(clone, {
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#0a0b10',
                scale: 2, // 2x resolution is perfect for html2canvas
                logging: false,
                onclone: (clonedDoc) => {
                    // Ensure the 'downloading' class is active in the html2canvas internal clone
                    const sheet = clonedDoc.querySelector('.sheet');
                    if (sheet) sheet.classList.add('downloading');
                }
            });

            const dataUrl = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.download = `${character.name}-Build-Card.png`;
            link.href = dataUrl;
            link.click();

            // Cleanup
            document.body.removeChild(container);
        } catch (err) {
            console.error('Export failed:', err);
=======
import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import Papa from 'papaparse';
import './CharacterDetail.css';

import IconCharacter from '../assets/icons/Icon_Character.webp';
import IconNotes from '../assets/icons/Icon_notes.webp';

const weaponGlob = import.meta.glob('/src/assets/weapons/*.{webp,png,jpg}', { eager: true });
const ARTIFACT_IMAGES = import.meta.glob('../assets/artifacts/flowers/*.webp', { eager: true, import: 'default' });

const getPlaceholder = (w, h, text) => {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect fill="#333" width="${w}" height="${h}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#777" font-family="sans-serif" font-size="20">
    ${text || '?'}
  </text>
</svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const getWeaponImage = (weaponName) => {
    if (!weaponName) return null;

    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanRaw = weaponName.replace(/^\d+\.\s*/, '').split('(')[0];
    const target = normalize(cleanRaw);

    for (const path in weaponGlob) {
        const filename = path.split('/').pop().split('.')[0];
        if (normalize(filename) === target) {
            return weaponGlob[path]?.default || weaponGlob[path];
        }
    }
    return getPlaceholder(150, 150, 'Weapon');
};

const parseWeapons = (rawText) => {
    if (!rawText) return [];
    const lines = rawText.split(/\n/);
    const groups = [];
    let currentMain = null;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.startsWith('~')) {
            if (currentMain) {
                const tags = trimmed.match(/\[(.*?)\]/g)?.map(t => t.replace(/[\[\]]/g, '')) || [];
                const cleanName = trimmed.replace(/^~/, '').replace(/\[.*?\]/g, '').replace(/\(\d+\*\)/, '').trim();

                let category = 'Alternative';
                if (tags.some(t => /BIS|Best/i.test(t))) category = 'Best';
                else if (tags.some(t => /ALT|Similar/i.test(t))) category = 'Alternative';
                else if (tags.some(t => /F2P/i.test(t))) category = 'F2P';
                else if (tags.some(t => /Craft/i.test(t))) category = 'Craftable';
                else if (tags.some(t => /BP/i.test(t))) category = 'Battle Pass';

                currentMain.alts.push({ name: cleanName, category, raw: trimmed });
            }
        } else {
            const tags = trimmed.match(/\[(.*?)\]/g)?.map(t => t.replace(/[\[\]]/g, '')) || [];
            const cleanName = trimmed.replace(/^\d+\.\s*/, '').replace(/\[.*?\]/g, '').replace(/\(\d+\*\)/, '').trim();
            let note = tags.join(' ');
            if (trimmed.toUpperCase().includes('[BIS]')) note = 'BiS';

            currentMain = {
                name: cleanName,
                note: note,
                alts: [],
                raw: trimmed
            };
            groups.push(currentMain);
        }
    });

    return groups.filter(g => g.name);
};

const characterImages = import.meta.glob('../assets/characters/portraits/*.webp', { eager: true, import: 'default' });
const namecardImages = import.meta.glob('../assets/characters/namecards/*.webp', { eager: true, import: 'default' });

const imageMap = Object.keys(characterImages).reduce((acc, path) => {
    const key = path.split('/').pop().replace('.webp', '').toLowerCase().replace(/[^a-z0-9]/g, '');
    acc[key] = characterImages[path];
    return acc;
}, {});

const getCharacterImage = (name) => {
    if (!name) return getPlaceholder(300, 400, '?');

    let lowerName = name.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (lowerName.includes('traveler') || lowerName === 'aether' || lowerName === 'lumine') {
        lowerName = 'aether';
    }

    return imageMap[lowerName] || getPlaceholder(300, 400, name);
};

const getNamecardImage = (character) => {
    if (!character) return null;
    let key;

    if (character.name === 'Aether' || character.name === 'Lumine' || character.name.includes('Traveler')) {
        key = `${character.element}_Traveler_Namecard.webp`;
    } else {
        key = `${character.characterIcon}_Namecard.webp`;
    }

    const path = `../assets/characters/namecards/${key}`;
    return namecardImages[path] || null;
};

const getTalentIcons = (text, isNote = false) => {
    const t = text.toLowerCase();
    const icons = [];

    if (isNote || t.includes('note') || t.startsWith('~')) {
        icons.push(<img key="note" src={IconNotes} alt="Note" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />);
    }

    if (t.includes('normal') || t.includes('attack') || t.includes('na')) {
        icons.push(
            <svg key="na" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'rotate(45deg)' }}>
                <path d="M5.12 14l-.88.88-2.12-2.12 2.12-2.12-.88-.88 2.12-2.12 1.41 1.41 8.49-8.49 1.41 1.41-8.49 8.49 1.41 1.41-2.12 2.12-.88-.88 2.12-2.12-.88-.88zM20.3 16.96l-7.78-7.78-1.41 1.41 7.78 7.78 1.41-1.41zM18.89 19.78l-7.78-7.78-1.41 1.41 7.78 7.78 1.41-1.41z" />
            </svg>
        );
    }
    if (t.includes('skill') || (t.includes('elemental') && !t.includes('burst') && !t.includes('q'))) {
        icons.push(
            <svg key="skill" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9.19 8.63 2 9.19l5.57 4.51L6.1 21 12 17.27 17.9 21l-1.48-7.3L22 9.19l-7.19-.56L12 2z" />
            </svg>
        );
    }
    if (t.includes('burst') || t.includes('q')) {
        icons.push(
            <svg key="burst" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.5 2.54l2.63 1.53c.56-1.24.87-2.6.87-4.07 0-5.17-3.95-9.44-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.05.51-9 4.78-9 9.95 0 5.52 4.48 10 10 10 2.23 0 4.29-.73 5.95-1.99l-2.65-1.52c-1.03.68-2.22 1.06-3.3 1.06zm-1-6.47V7.88c-.62.33-1.18.78-1.63 1.33l1.63 3.32zm2.63-2.12c-.45-.55-1.01-1-1.63-1.33v4.65l1.63-3.32z" />
            </svg>
        );
    }

    if (icons.length === 0 && (t.includes('lvl') || t.includes('level') || t.includes('char'))) {
        icons.push(<img key="char" src={IconCharacter} alt="Level" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />);
    }

    if (icons.length === 0) {
        icons.push(
            <svg key="generic" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
        );
    }

    return icons;
};

const cleanArtifactLabelV2 = (text) => {
    if (!text) return '';

    let processed = text
        .replace(/(?:\+?18%?\s*ATK|ATK\s*\+?18%?)(?:\s*set)?/gi, "Gladiator's")
        .replace(/(?:\+?80\s*EM|EM\s*\+?80)(?:\s*set)?/gi, "Gilded")
        .replace(/(?:\+?20%?\s*ER|ER\s*\+?20%?)(?:\s*set)?/gi, "Emblem")
        .replace(/(?:\+?15%?\s*Hydro|Hydro\s*\+?15%?)(?:\s*set)?/gi, "Heart of Depth")
        .replace(/(?:\+?15%?\s*Anemo|Anemo\s*\+?15%?)(?:\s*set)?/gi, "Viridescent")
        .replace(/(?:\+?15%?\s*Pyro|Pyro\s*\+?15%?)(?:\s*set)?/gi, "Crimson Witch")
        .replace(/(?:\+?15%?\s*Electro|Electro\s*\+?15%?)(?:\s*set)?/gi, "Thundering Fury")
        .replace(/(?:\+?15%?\s*Cryo|Cryo\s*\+?15%?)(?:\s*set)?/gi, "Blizzard")
        .replace(/(?:\+?15%?\s*Geo|Geo\s*\+?15%?)(?:\s*set)?/gi, "Petra")
        .replace(/(?:\+?15%?\s*Dendro|Dendro\s*\+?15%?)(?:\s*set)?/gi, "Deepwood")
        .replace(/(?:\+?25%?\s*Phys|Phys\s*\+?25%?)(?:\s*set)?/gi, "Pale Flame");

    const emKeywords = ["Gilded", "Wanderer", "Flower of Paradise", "Aubade"];
    const emSetCount = (processed.match(/Gilded|Wanderer|Paradise|Aubade/gi) || []).length;

    if (emSetCount >= 2) {
        return "Gilded (2) / Wanderer's Troupe (2) / Flower of Paradise Lost (2) / Aubade (2)";
    }

    const matches = [...processed.matchAll(/([a-zA-Z\s\-']+)(\(\d\))/g)];

    if (matches.length === 0) return processed;

    return matches.map(m => {
        const name = m[1];
        const count = m[2];
        const parts = name.trim().split(/\s+/);
        let label = parts[0];
        if (label.toLowerCase() === 'the' && parts.length > 1) {
            label = parts[1];
        }
        return `${label} ${count}`;
    }).join(' / ');
};

const CharacterDetail = ({ character: initialCharacter, onBack }) => {
    const builds = Array.isArray(initialCharacter) ? initialCharacter : [initialCharacter];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const character = builds[currentIndex];
    if (!character) return null;

    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const nextBuild = () => setCurrentIndex((prev) => (prev + 1) % builds.length);
    const prevBuild = () => setCurrentIndex((prev) => (prev - 1 + builds.length) % builds.length);

    const cardRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsDownloading(true);
        try {
            const container = document.createElement('div');
            container.className = 'character-detail-container';
            Object.assign(container.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '1500px',
                height: '0',
                overflow: 'hidden',
                zIndex: '-9999'
            });
            document.body.appendChild(container);

            const original = cardRef.current;
            const clone = original.cloneNode(true);

            clone.classList.add('download-mode');
            Object.assign(clone.style, {
                width: '1500px',
                position: 'static',
                transform: 'none',
                margin: '0',
                opacity: '1'
            });
            container.appendChild(clone);

            await new Promise(resolve => setTimeout(resolve, 200));

            const dataUrl = await toPng(clone, {
                quality: 0.95,
                pixelRatio: 2,
                width: 1500,
                style: { margin: 0 }
            });

            document.body.removeChild(container);

            const link = document.createElement('a');
            const roleSuffix = character.role ? `-${character.role.replace(/[^a-zA-Z0-9]/g, '')}` : '';
            link.download = `${character.name}${roleSuffix}-Build.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Capture failed:', err);
            alert('Failed to download image.');
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
        } finally {
            setIsDownloading(false);
        }
    };

<<<<<<< HEAD
    return (
        <div className="character-detail-container animate-fade-in text-white">
            {/* Header / Controls */}
            <div className="d-flex justify-content-between align-items-center mb-4 no-capture">
                <button onClick={onBack} className="btn btn-dark border-secondary rounded-pill px-4 shadow-sm">
                    <i className="bi bi-arrow-left"></i> Back
                </button>

                {builds.length > 1 && (
                    <div className="d-flex align-items-center gap-3 bg-dark bg-opacity-75 px-4 py-1 rounded-pill border border-white border-opacity-10">
                        <button onClick={() => setCurrentIndex((prev) => (prev - 1 + builds.length) % builds.length)} className="btn btn-sm btn-link text-white shadow-none border-0">
                            <i className="bi bi-chevron-left"></i>
                        </button>
                        <div className="text-center">
                            <div className="small fw-bold text-uppercase">{character.role}</div>
                            <div style={{ fontSize: '10px', opacity: 0.5 }}>{currentIndex + 1} / {builds.length}</div>
                        </div>
                        <button onClick={() => setCurrentIndex((prev) => (prev + 1) % builds.length)} className="btn btn-sm btn-link text-white shadow-none border-0">
=======
    const renderList = (text) => {
        if (!text) return 'None';
        return text.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
        ));
    };

    const namecard = getNamecardImage(character);

    const getElementColor = (el) => {
        const map = {
            'pyro': '#ff7b00',
            'hydro': '#00aaff',
            'cryo': '#8be8ff',
            'electro': '#9b51e0',
            'anemo': '#7ef9ff',
            'geo': '#ffd700',
            'dendro': '#7fff00'
        };
        return map[el?.toLowerCase()] || '#ccc';
    };

    const themeColor = getElementColor(character.element);

    const parseTeams = (text) => {
        if (!text) return { groups: [], notes: [] };
        const lines = text.split('\n').filter(l => l.trim());
        const groups = [];
        const globalNotes = [];
        let currentGroup = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('~') || trimmed.match(/^Notes?:\s*/i)) {
                const noteText = trimmed.replace(/^~\s*/, '').replace(/^Notes?:\s*/i, '').trim();
                if (noteText && !globalNotes.includes(noteText)) {
                    globalNotes.push(noteText);
                }
            }
            else if (/^\d+\./.test(trimmed)) {
                currentGroup = { name: trimmed.replace(/^\d+\.\s*/, ''), variants: [], notes: [] };
                groups.push(currentGroup);
            }
            else if (trimmed.startsWith('[')) {
                const match = trimmed.match(/^\[(.*?)\]\s*[:]?\s*(.*)/);
                if (match) {
                    const type = match[1];
                    const membersStr = match[2];
                    if (!currentGroup) {
                        currentGroup = { name: 'Teams', variants: [], notes: [] };
                        groups.push(currentGroup);
                    }
                    currentGroup.variants.push({ type, members: membersStr.split('>').map(m => m.trim()) });
                }
            }
            else if (trimmed.includes('>')) {
                if (!currentGroup) {
                    currentGroup = { name: 'Teams', variants: [], notes: [] };
                    groups.push(currentGroup);
                }
                const legacyMatch = trimmed.match(/^(.*?)\s*[:]\s*(.*)/);
                if (legacyMatch) {
                    currentGroup.variants.push({ type: legacyMatch[1], members: legacyMatch[2].split('>').map(m => m.trim()) });
                } else {
                    currentGroup.variants.push({ type: 'Standard', members: trimmed.split('>').map(m => m.trim()) });
                }
            }
        });

        if (groups.length === 0 && text && globalNotes.length === 0) {
            return {
                groups: [{
                    name: 'Teams',
                    variants: lines.map((l, i) => ({
                        type: `Option ${i + 1}`,
                        members: l.split('>').map(m => m.trim())
                    }))
                }],
                notes: []
            };
        }

        return { groups, notes: globalNotes };
    };

    return (
        <div className="character-detail-container animate-fade-in text-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <button
                    onClick={onBack}
                    className="btn btn-dark border-secondary d-flex align-items-center gap-2 rounded-pill px-4 py-2 shadow-sm hover-scale"
                    style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <i className="bi bi-arrow-left"></i> Back to Builds
                </button>

                {builds.length > 1 && (
                    <div className="d-flex align-items-center gap-3 bg-dark bg-opacity-75 px-4 py-2 rounded-pill border border-white border-opacity-10 shadow-lg">
                        <button onClick={prevBuild} className="btn btn-sm btn-outline-light rounded-circle shadow-none border-0 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                            <i className="bi bi-chevron-left"></i>
                        </button>
                        <div className="text-center" style={{ minWidth: '140px' }}>
                            <div className="small fw-bold text-uppercase text-white" style={{ letterSpacing: '1px' }}>
                                {character.role || `Build ${currentIndex + 1}`}
                            </div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                                {currentIndex + 1} / {builds.length}
                            </div>
                        </div>
                        <button onClick={nextBuild} className="btn btn-sm btn-outline-light rounded-circle shadow-none border-0 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
                            <i className="bi bi-chevron-right"></i>
                        </button>
                    </div>
                )}

<<<<<<< HEAD
                <button onClick={handleDownload} className="btn btn-primary rounded-pill px-4 fw-bold" disabled={isDownloading}>
                    {isDownloading ? 'Generating...' : '📥 Download Card'}
                </button>
            </div>

            {/* The actual Card for capture */}
            <div ref={cardRef} className={`sheet ${character.element?.toLowerCase() || 'anemo'}`}>
                <CharacterBanner character={character} themeColor={themeColor} />
                
                <div className="content">
                    <SummarySection character={character} assets={assets} />
                    <GearSection character={character} assets={assets} />
                    <TeamSection character={character} assets={assets} />
=======
                <button
                    onClick={handleDownload}
                    className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 py-2 fw-bold shadow hover-scale"
                    disabled={isDownloading}
                >
                    {isDownloading ? (
                        <>
                            <span className="spinner-border spinner-border-sm" aria-hidden="true"></span> Generating...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-download"></i> Download Card
                        </>
                    )}
                </button>
            </div>

            <div ref={cardRef} className={`sheet ${character.element?.toLowerCase() || 'anemo'}`}>

                <div
                    className="banner centered"
                    style={{
                        minHeight: '320px',
                        background: namecard ? `url(${namecard}) center/cover no-repeat` : `linear-gradient(135deg, ${themeColor} 0%, #000 100%)`,
                        position: 'relative'
                    }}
                >
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 100%)' }} />

                    <div className="portrait" style={{ position: 'relative', zIndex: 1, borderColor: themeColor }}>
                        <img
                            src={getCharacterImage(character.characterIcon)}
                            alt={character.name}
                            crossOrigin="anonymous"
                        />
                    </div>

                    <div className="headline" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                        <div
                            className="title"
                            contentEditable={false}
                            suppressContentEditableWarning={true}
                            style={{ outline: 'none' }}
                        >
                            {character.name}
                        </div>
                        <div
                            className="subtitle"
                            contentEditable={false}
                            suppressContentEditableWarning={true}
                            style={{ outline: 'none' }}
                        >
                            {character.element} • {character.weaponType || 'Weapon'} • Visual Guide for HoYoLAB
                        </div>
                        <div style={{ marginTop: '12px', textAlign: 'center' }}>
                            <span
                                className="patch"
                                contentEditable={false}
                                suppressContentEditableWarning={true}
                                style={{ outline: 'none' }}
                            >
                                Visual post — created from CodeTraveller/Hoyolab + community sources
                            </span>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="layout-row row-1">
                        <div className="card quick-summary main-col">
                            <div className="small-title">Quick Summary</div>
                            <div className="bullets">
                                {(() => {
                                    const rawDesc = character.description || '';
                                    const rawNotes = character.notes || '';

                                    const cleanText = (text) => {
                                        if (!text) return '';
                                        return text
                                            .replace(/Weapon(?:s)?:\s*[\s\S]*?(?=(?:\n[A-Z\s\-]+(?:\(ER|DPS|SUPPORT))|(?:\nNotes:)|$)/gi, '')
                                            .replace(/Artifact(?:s)?:\s*[\s\S]*?(?=(?:\n[A-Z\s\-]+(?:\(ER|DPS|SUPPORT))|(?:\nNotes:)|$)/gi, '')
                                            .trim();
                                    };

                                    let notesText = rawNotes;
                                    let mainText = rawDesc;
                                    if (!notesText) {
                                        const notesMatch = mainText.match(/(?:^|\n)Notes?:\s*([\s\S]*)/i);
                                        if (notesMatch) {
                                            notesText = notesMatch[1].trim();
                                            mainText = mainText.substring(0, notesMatch.index).trim();
                                        }
                                    }

                                    mainText = cleanText(mainText);

                                    const renderDescription = (text) => {
                                        if (!text) return null;
                                        return text.split('\n').map((line, idx) => {
                                            const trimmed = line.trim();
                                            if (!trimmed) return <div key={idx} style={{ height: '8px' }}></div>;

                                            if (/^[A-Z\s\-]+(?:\(.*\))?$/.test(trimmed) || trimmed.includes('DPS') || trimmed.includes('SUPPORT')) {
                                                if (trimmed.length < 60 && !trimmed.includes(':')) {
                                                    return <div key={idx} style={{ marginTop: '8px', marginBottom: '0px' }}><strong>{trimmed}</strong></div>;
                                                }
                                            }

                                            const match = line.match(/^([A-Za-z\s\-]+:)(.*)/);
                                            if (match) {
                                                return (
                                                    <div key={idx}>
                                                        <strong>{match[1]}</strong>{match[2]}
                                                    </div>
                                                );
                                            }
                                            return <div key={idx}>{line}</div>;
                                        });
                                    };

                                    return (
                                        <>
                                            <div style={{ marginBottom: '4px' }}>
                                                <strong>Playstyle:</strong> {character.role}
                                            </div>

                                            {mainText && (
                                                <div style={{ paddingLeft: '16px', marginBottom: '12px', fontSize: '13px', lineHeight: '1.5', color: 'rgba(255,255,255,0.9)' }}>
                                                    {renderDescription(mainText)}
                                                </div>
                                            )}

                                            <div style={{ marginBottom: '12px' }}>
                                                <strong>Priority:</strong> {character.priority || character.mainStats?.split('\n')[0] || 'See Artifacts'}
                                            </div>

                                            {notesText && (
                                                <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
                                                    <strong style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text)' }}>Notes:</strong>
                                                    <div style={{ marginTop: '4px', whiteSpace: 'pre-wrap', paddingLeft: '8px' }}>
                                                        {notesText}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="card talent-card side-col">
                            <div className="small-title">Talent Priority</div>
                            <div className="bullets">
                                {character.talents ? character.talents.split(/\r?\n/).map((t, i) => {
                                    const trimmed = t.trim();
                                    if (!trimmed) return null;

                                    const isNote = trimmed.startsWith('~');
                                    const match = trimmed.match(/^(\d+)\.\s*/);
                                    const priority = match ? match[1] : null;

                                    let cleanText = trimmed;
                                    if (priority) {
                                        cleanText = trimmed.replace(/^\d+\.\s*/, '');
                                    }
                                    cleanText = cleanText.trim();

                                    const icons = getTalentIcons(cleanText, isNote);

                                    return (
                                        <div key={i} className={`talent-row ${isNote ? 'is-note' : ''}`}>
                                            <div className="talent-icon-group" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                {icons.map((icon, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="talent-icon"
                                                        style={{
                                                            position: 'relative',
                                                            marginLeft: idx > 0 ? '-12px' : '0',
                                                            zIndex: 10 - idx,
                                                            border: idx > 0 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                                                        }}
                                                    >
                                                        {icon}
                                                    </div>
                                                ))}
                                                {priority && (
                                                    <div className="talent-priority-badge">{priority}</div>
                                                )}
                                            </div>
                                            <div className="talent-text">
                                                {cleanText}
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div>Priority: Skill &gt; Burst &gt; Normal Attack</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="layout-row row-2">
                        <div className="card weapons-card main-col" style={{ overflow: 'visible', zIndex: 20, position: 'relative' }}>
                            <div className="small-title">Weapons</div>
                            <div className="weapons-row" style={{ overflowX: 'visible', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {(() => {
                                    const groups = parseWeapons(character.weapon);
                                    if (!groups.length) return <div className="p-3 text-muted">No weapons data</div>;

                                    return groups.map((group, i) => (
                                        <div key={i} className="weapon-group position-relative">
                                            <div
                                                className={`weapon-primary has-dropdown ${activeDropdown === i ? 'is-active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (group.alts.length > 0) {
                                                        setActiveDropdown(activeDropdown === i ? null : i);
                                                    }
                                                }}
                                            >
                                                <div className="weapon-circle">
                                                    <img
                                                        src={getWeaponImage(group.name)}
                                                        alt={group.name}
                                                        title={group.name}
                                                        onError={(e) => e.target.style.display = 'none'}
                                                    />
                                                    {group.alts.length > 0 && (
                                                        <div className="dropdown-indicator">
                                                            <i className={`bi ${activeDropdown === i ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="weapon-name">{group.name}</div>
                                                {group.note && <div className="weapon-note">{group.note}</div>}

                                                {group.alts.length > 0 && (
                                                    <div className="weapon-dropdown" onClick={(e) => e.stopPropagation()}>
                                                        {['Alternative', 'F2P', 'Craftable', 'Battle Pass'].map(cat => {
                                                            const catAlts = group.alts.filter(a => a.category === cat);
                                                            if (!catAlts.length) return null;
                                                            return (
                                                                <div key={cat} className="dropdown-section">
                                                                    <div className="cat-title">{cat}</div>
                                                                    {catAlts.map((alt, idx) => (
                                                                        <div key={idx} className="dropdown-item">
                                                                            <img src={getWeaponImage(alt.name)} alt="" />
                                                                            <span>{alt.name}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        <div className="card artifacts-card side-col stacked-layout">
                            <div className="artifacts-section">
                                <div className="small-title">Artifact Sets (quick)</div>
                                <div className="artifact-sets">
                                    {(character.artifacts ? character.artifacts.split('\n').slice(0, 10) : ['Set 1', 'Set 2']).map((art, i) => {
                                        const cleanLabel = cleanArtifactLabelV2(art);
                                        const matches = [...cleanLabel.matchAll(/([a-zA-Z\s\-']+?)\s*\((\d)\)/g)];
                                        const foundImages = [];

                                        if (matches.length > 0) {
                                            matches.forEach(m => {
                                                const name = m[1].trim();
                                                const count = m[2];
                                                let imgSrc = null;
                                                let bestLen = 0;
                                                const searchName = name.replace(/['\s\(\)\d\*]/g, '').toLowerCase();

                                                for (const path in ARTIFACT_IMAGES) {
                                                    const fileName = path.split('/').pop().replace('.webp', '').replace(/_Flower|[_'\s]/g, '').toLowerCase();
                                                    if (searchName.includes(fileName) || fileName.includes(searchName)) {
                                                        if (fileName.length > bestLen) {
                                                            bestLen = fileName.length;
                                                            imgSrc = ARTIFACT_IMAGES[path];
                                                        }
                                                    }
                                                }
                                                if (imgSrc) foundImages.push({ src: imgSrc, count: count });
                                            });
                                        } else {
                                            const normText = art.replace(/['\s\(\)\d\*]/g, '').toLowerCase();
                                            const sortedKeys = Object.keys(ARTIFACT_IMAGES)
                                                .filter(k => k.split('/').pop().replace('.webp', '').replace(/_Flower|[_'\s]/g, '').length > 2)
                                                .sort((a, b) => b.length - a.length);

                                            for (const path of sortedKeys) {
                                                const fileName = path.split('/').pop().replace('.webp', '');
                                                const cleanName = fileName.replace(/_Flower/g, '').replace(/[_'\s]/g, '').toLowerCase();
                                                if (normText.includes(cleanName)) {
                                                    foundImages.push({ src: ARTIFACT_IMAGES[path], count: '4' });
                                                    break;
                                                }
                                            }
                                        }

                                        if (foundImages.length === 0) {
                                            foundImages.push({ src: getPlaceholder(64, 64, '?'), count: '?' });
                                        }

                                        return (
                                            <div className="artifact-item" key={i}>
                                                {foundImages.length > 1 ? (
                                                    <div className="artifact-icon-group">
                                                        {foundImages.map((item, idx) => (
                                                            <div key={idx} className={`artifact-icon-wrapper icon-${idx}`}>
                                                                <img src={item.src} alt="Artifact" />
                                                                {item.count && <span className="artifact-badge">{item.count}pc</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div style={{ position: 'relative', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <div className="artifact-icon-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                            <img src={foundImages[0].src} alt="Artifact" />
                                                            {foundImages[0].count && <span className="artifact-badge" style={{ top: 0, right: 0 }}>{foundImages[0].count}pc</span>}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="artifact-name">{cleanLabel.replace(/\s*\(\d+\)/g, '')}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="stats-section">
                                {(() => {
                                    const notes = [];
                                    const mainStatLines = character.mainStats ? character.mainStats.split('\n') : [];
                                    const cleanMainStats = mainStatLines.filter(line => {
                                        const isNote = line.match(/^\s*Notes?\s*[:\-]/i);
                                        if (isNote) {
                                            const noteContent = line.replace(/^\s*Notes?\s*[:\-]\s*/i, '').trim();
                                            if (noteContent) notes.push(noteContent);
                                            return false;
                                        }
                                        return true;
                                    });

                                    let subStatsText = character.subStats || 'CRIT > ATK% > ER';
                                    const subNoteMatch = subStatsText.match(/(?:,\s*)?Notes?\s*[:\-]\s*(.*)$/i);
                                    if (subNoteMatch) {
                                        const noteContent = subNoteMatch[1].trim();
                                        if (noteContent && !notes.includes(noteContent)) notes.push(noteContent);
                                        subStatsText = subStatsText.substring(0, subNoteMatch.index).trim();
                                        if (subStatsText.endsWith(',')) subStatsText = subStatsText.slice(0, -1).trim();
                                    }

                                    return (
                                        <>
                                            <div className="small-title">Main Stats</div>
                                            <div className="stat-grid">
                                                {cleanMainStats.length > 0 ? (
                                                    cleanMainStats.map((stat, i) => {
                                                        const match = stat.match(/^(.*?)(?:\s*[:\-]\s*)(.*)$/);
                                                        if (match) {
                                                            return (
                                                                <React.Fragment key={i}>
                                                                    <div className="stat-label">{match[1].trim()}</div>
                                                                    <div className="stat-value">{match[2].trim()}</div>
                                                                </React.Fragment>
                                                            );
                                                        }
                                                        return null;
                                                    })
                                                ) : (
                                                    <>
                                                        <div className="stat-label">Sands</div><div className="stat-value">ATK% / EM</div>
                                                        <div className="stat-label">Goblet</div><div className="stat-value">{character.element} DMG</div>
                                                        <div className="stat-label">Circlet</div><div className="stat-value">CRIT Rate / DMG</div>
                                                    </>
                                                )}
                                            </div>
                                            <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--muted)' }}>
                                                <strong>Substats:</strong> {subStatsText.replace(/\n/g, ', ')}
                                            </div>
                                            <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--muted)' }}>
                                                <strong>LV Req:</strong> 90/90
                                            </div>
                                            {notes.length > 0 && (
                                                <div style={{ marginTop: '8px', fontSize: '12px', color: '#ffb7b7', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px' }}>
                                                    <strong>Note:</strong> {notes.join(' • ')}
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* ROW 3: TEAMS (Dynamic Column Layout) */}
                    <div className="layout-row row-3">
                        <div className="card teams-card full-width">
                            <div className="small-title">Teams</div>
                            {(() => {
                                const { groups: teamGroups, notes: globalNotes } = parseTeams(character.teams);
                                if (!teamGroups.length && !globalNotes.length) return <div>No teams data</div>;

                                let gridClass = 'teams-grid-1';
                                if (teamGroups.length >= 5) gridClass = 'teams-grid-3';
                                else if (teamGroups.length >= 3) gridClass = 'teams-grid-2';

                                return (
                                    <>
                                        <div className={`teams-container ${gridClass}`}>
                                            {teamGroups.map((group, groupIdx) => (
                                                <div key={groupIdx} className="team-group-card">
                                                    <div className="team-group-header">
                                                        <span className="team-group-number">{groupIdx + 1}.</span> {group.name}
                                                    </div>
                                                    <div className="team-variants">
                                                        {group.variants.map((variant, vIdx) => (
                                                            <div key={vIdx} className="team-variant-row">
                                                                <div className={`variant-type ${variant.type.toLowerCase().replace(/[^a-z]/g, '')}`}>
                                                                    {variant.type}
                                                                </div>
                                                                <div className="variant-members">
                                                                    {variant.members.slice(0, 4).map((member, mIdx) => {
                                                                        const isSplit = member.includes('/');
                                                                        const parts = member.split('/');
                                                                        if (isSplit) {
                                                                            return (
                                                                                <div key={mIdx} className="team-slot split-slot">
                                                                                    <img
                                                                                        src={getCharacterImage(parts[0].trim())}
                                                                                        title={parts[0].trim()}
                                                                                        alt={parts[0]}
                                                                                    />
                                                                                    <img
                                                                                        src={getCharacterImage(parts[1].trim())}
                                                                                        title={parts[1].trim()}
                                                                                        alt={parts[1]}
                                                                                    />
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return (
                                                                            <div key={mIdx} className="team-slot">
                                                                                <img src={getCharacterImage(member.trim())} title={member.trim()} alt={member} />
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {globalNotes.length > 0 && (
                                            <div className="team-global-notes">
                                                {globalNotes.map((note, nIdx) => (
                                                    <div key={nIdx} className="team-note-item">
                                                        <img src={IconNotes} alt="" />
                                                        <span>{note}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
                <div className="footer-credits" style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', padding: '6px 0 18px 0' }} contentEditable={false} suppressContentEditableWarning={true}>
                    Data: CodeTraveller Excel (author) • MilkImpact (YT/Twitch) • Genshin Community
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
                </div>
            </div>
        </div>
    );
};

export default CharacterDetail;
