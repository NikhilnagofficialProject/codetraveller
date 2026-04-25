import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlaceholder } from '../utils/characterUtils.jsx';

const ArtifactsPage = ({ assets }) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const artifacts = useMemo(() => {
        if (!assets?.artifacts) return [];
        
        // We only want unique artifact sets (not aliases)
        const seen = new Set();
        const list = [];
        
        // Filter out short names and common aliases to show a clean list
        Object.entries(assets.artifacts).forEach(([name, image]) => {
            const cleanName = name.toLowerCase().trim();
            // Basic heuristic to skip aliases: if it's shorter than 5 chars or matches a short name
            const isShort = Object.values(assets.artifactShortNames).some(s => s.toLowerCase() === cleanName);
            const isAlias = ['anemo set', 'hydro set', 'pyro set', 'atk set', 'em set', 'er set'].includes(cleanName);
            
            if (!isShort && !isAlias && !seen.has(image)) {
                seen.add(image);
                list.push({ name, image });
            }
        });

        return list.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
    }, [assets, search]);

    return (
        <div className="artifacts-page animate-fade-in py-4 text-white">
            <div className="page-header mb-5 text-center">
                <h1 className="display-4 fw-bold mb-2">Artifact Set Database</h1>
                <p className="opacity-50">Discover all artifact sets and their character combinations.</p>
            </div>

            {/* Search Bar */}
            <div className="row g-3 mb-5 justify-content-center">
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="input-group bg-dark bg-opacity-50 border border-white border-opacity-10 rounded-pill px-3 py-1">
                        <span className="input-group-text bg-transparent border-0 text-white-50"><i className="bi bi-search"></i></span>
                        <input 
                            type="text" 
                            className="form-control bg-transparent border-0 text-white shadow-none" 
                            placeholder="Search artifact sets..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="row g-4 justify-content-center">
                {artifacts.length > 0 ? artifacts.map((a, i) => (
                    <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2 d-flex justify-content-center">
                        <div 
                            className="artifact-card-v p-3 text-center rounded-4 border border-white border-opacity-10 bg-dark bg-opacity-25 hover-lift pointer position-relative overflow-hidden d-flex flex-column"
                            onClick={() => navigate(`/artifacts/${a.name}`)}
                            style={{ width: '100%', maxWidth: '180px', aspectRatio: '1/1.2' }}
                        >
                            <div className="artifact-icon-box mx-auto mb-3 p-2 bg-dark rounded-circle" style={{ width: '80px', height: '80px' }}>
                                <img src={a.image || getPlaceholder(80, 80, '?')} alt={a.name} className="w-100 h-100 object-contain" />
                            </div>
                            <div className="fw-bold small text-capitalize truncate">{a.name.replace(/-/g, ' ')}</div>
                        </div>
                    </div>
                )) : (
                    <div className="col-12 text-center py-5 opacity-25">
                        <i className="bi bi-search display-1 mb-3 d-block"></i>
                        <p>No artifact sets match your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtifactsPage;
