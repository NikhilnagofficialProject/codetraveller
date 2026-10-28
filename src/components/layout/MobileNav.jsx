import React from 'react';

const MobileNav = ({ isMenuOpen, activeTab, handleTabChange, toggleTheme, theme }) => {
    const tabs = ['posts', 'builds', 'weapons', 'collections', 'calendar', 'lab'];

    return (
        <div className={`mobile-nav-overlay ${isMenuOpen ? 'active' : ''}`}>
            <div className="container min-vh-100 d-flex flex-column justify-content-start align-items-center pt-5">
                <div className="d-flex align-items-center justify-content-between w-100 px-4 mb-5">
                    <span className="text-white-50 small fw-bold">APPEARANCE</span>
                    <button 
                        className="btn glass d-flex align-items-center gap-2 px-3 py-2 border-0 transition-all"
                        onClick={toggleTheme}
                        style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.1)' }}
                    >
                        <i className={`bi ${theme === 'dark' ? 'bi-moon-stars-fill text-info' : 'bi-sun-fill text-warning'} fs-5`}></i>
                        <span className="text-white small fw-bold">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    </button>
                </div>

                <div className="mobile-nav-links d-flex flex-column gap-4 w-100 px-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`mobile-nav-item ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab)}
                        >
                            <span className="tab-label">
                                {tab === 'builds' ? 'GENSHIN BUILDS' : tab === 'lab' ? 'LAB 🧪' : tab.toUpperCase()}
                            </span>
                            <span className="tab-arrow">→</span>
                        </button>
                    ))}
                </div>

                <div className="mt-5 text-white-50 small fw-bold text-center">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
                </div>
            </div>
        </div>
    );
};

export default MobileNav;
