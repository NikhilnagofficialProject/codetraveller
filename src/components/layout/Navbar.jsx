import React from 'react';

const Navbar = ({
    activeTab,
    handleTabChange,
    assets,
    logoLoaded,
    setLogoLoaded,
    logoFailed,
    setLogoFailed,
    isMenuOpen,
    setIsMenuOpen
}) => {
    return (
        <nav className="navbar navbar-expand-lg sticky-top p-0 no-capture" style={{
            backgroundColor: 'rgba(12, 15, 29, 0.6)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            zIndex: 2000
        }}>
            <div className="container py-2">
                <div className="d-flex w-100 justify-content-between align-items-center">
                    <div className="navbar-brand fw-bold text-white d-flex align-items-center gap-2 m-0" style={{ cursor: 'pointer', zIndex: 2001 }} onClick={() => { handleTabChange('posts'); }}>
                        <div style={{ position: 'relative', width: '30px', height: '30px', flexShrink: 0 }}>
                            {assets.logo && !logoFailed && (
                                <img
                                    src={assets.logo}
                                    alt="Logo"
                                    onLoad={() => setLogoLoaded(true)}
                                    onError={() => setLogoFailed(true)}
                                    style={{
                                        width: '30px', height: '30px',
                                        borderRadius: '50%',
                                        position: 'absolute', top: 0, left: 0,
                                        opacity: logoLoaded ? 1 : 0,
                                        transition: 'opacity 0.3s',
                                        zIndex: 2
                                    }}
                                />
                            )}
                            {(!logoLoaded || logoFailed) && (
                                <div
                                    className="rounded-circle bg-primary"
                                    style={{
                                        width: '30px', height: '30px',
                                        fontSize: '10px', fontWeight: 'bold',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        position: 'absolute', top: 0, left: 0,
                                        zIndex: 1
                                    }}
                                >CT</div>
                            )}
                        </div>
                        <span style={{ fontSize: '1rem', letterSpacing: '1px' }}>CODETRAVELLER BLOG</span>
                    </div>

                    <ul className="nav nav-pills d-none d-lg-flex gap-1">
                        {['posts', 'builds', 'weapons', 'artifacts', 'collections', 'calendar', 'lab'].map((tab) => (
                            <li className="nav-item" key={tab}>
                                <button
                                    className={`nav-link fw-bold border-0 px-3 py-2 ${activeTab === tab ? 'active bg-primary text-white shadow-sm' : 'text-white-50 hov-white'}`}
                                    onClick={() => handleTabChange(tab)}
                                    style={{
                                        textTransform: 'uppercase',
                                        fontSize: '0.75rem',
                                        letterSpacing: '1px',
                                        transition: 'all 0.3s ease',
                                        background: activeTab === tab ? undefined : 'transparent'
                                    }}
                                >
                                    {tab === 'builds' ? 'Genshin Builds' : tab === 'lab' ? 'Lab 🧪' : tab}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="d-flex align-items-center gap-3">
                        <div className="d-none d-md-block text-white-50 small fw-bold" style={{ letterSpacing: '1px' }}>
                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                        </div>

                        <button
                            className={`hamburger-btn d-lg-none ${isMenuOpen ? 'open' : ''}`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle Navigation"
                            style={{ zIndex: 2001 }}
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
