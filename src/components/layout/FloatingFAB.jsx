import React from 'react';

const FloatingFAB = ({ showSticky, stickySuccess, refreshing, handleStickySync }) => {
    return (
        <div
            className={`position-fixed bottom-0 end-0 p-3 p-md-4 no-capture d-flex flex-column align-items-center gap-2 ${
                showSticky ? 'sticky-sync-visible' : 'sticky-sync-hidden'
            }`}
            style={{ zIndex: 1050, transition: 'all 0.4s ease' }}
        >
            {/* Go to Top */}
            <button
                className="btn rounded-circle shadow-lg d-flex align-items-center justify-content-center"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{
                    width: '44px',
                    height: '44px',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                title="Go to Top"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
                </svg>
            </button>

            {/* Sync */}
            <button
                className={`btn rounded-circle shadow-lg d-flex align-items-center justify-content-center ${stickySuccess ? 'btn-success bg-success border-success' : 'btn-primary'}`}
                onClick={handleStickySync}
                disabled={refreshing || stickySuccess}
                style={{
                    width: '56px',
                    height: '56px',
                    background: stickySuccess ? undefined : 'rgba(13, 110, 253, 0.85)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    shadow: '0 4px 15px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                title="Sync Data"
            >
                {!stickySuccess ? (
                    <svg title="Sync" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className={`bi bi-arrow-repeat ${refreshing ? 'spin-animation' : ''}`} viewBox="0 0 16 16">
                        <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                        <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" className="bi bi-check-lg" viewBox="0 0 16 16">
                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.42-6.447a.733.733 0 0 1 1.047 0z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default FloatingFAB;
