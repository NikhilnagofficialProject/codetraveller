import React from 'react';

const MobileNav = ({ isMenuOpen, activeTab, handleTabChange }) => {
    const tabs = ['posts', 'builds', 'weapons', 'collections', 'calendar', 'lab'];

    return (
        <div className={`mobile-nav-overlay ${isMenuOpen ? 'active' : ''}`}>
            <div className="container h-100 d-flex flex-column justify-content-center align-items-center">
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
