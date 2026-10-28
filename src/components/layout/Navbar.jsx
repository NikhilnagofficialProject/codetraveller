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
    setIsMenuOpen,
    theme,
    toggleTheme
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

                    <div className="d-flex align-items-center">
                        <button 
                            className="btn glass p-0 border-0 d-flex align-items-center justify-content-center transition-all me-2"
                            onClick={toggleTheme}
                            aria-label="Toggle Theme"
                            style={{ width: '38px', height: '38px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
                        >
                            <i className={`bi ${theme === 'dark' ? 'bi-moon-stars-fill text-info' : 'bi-sun-fill text-warning'} fs-5`}></i>
                        </button>

                        <div className="d-flex align-items-baseline gap-1 me-3 d-none d-md-flex">
                            <span className="text-white-50 small fw-bold" style={{ letterSpacing: '1px' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase()}</span>
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

export default React.memo(Navbar);
