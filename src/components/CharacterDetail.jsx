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
            container.style.width = '1080px';
            document.body.appendChild(container);

            // Clone the sheet and set up for download mode
            const clone = original.cloneNode(true);
            clone.classList.add('downloading');
            clone.style.width = '1080px';
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
        } finally {
            setIsDownloading(false);
        }
    };

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
                            <i className="bi bi-chevron-right"></i>
                        </button>
                    </div>
                )}

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
                </div>

                <div className="watermark">
                    CodeTraveller HoYoLAB Visual Guide • {new Date().toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

export default CharacterDetail;
