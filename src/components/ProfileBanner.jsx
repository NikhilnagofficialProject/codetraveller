import React, { useState, useEffect } from 'react';

// Removed local banner imports

const ProfileBanner = ({ assets, posts = [], refreshPosts, refreshing: dataRefreshing }) => {

    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTxPyUvbWHiVl7VjPbiAJXS3Hob9AH6l8yb7oqNWQvryZ-WRfGcog3zjL_44XkxnKN/exec';

    const [syncing, setSyncing] = useState(false);
    const [showUpdated, setShowUpdated] = useState(false);
    const [randomBanner, setRandomBanner] = useState('');
    const [avatarLoaded, setAvatarLoaded] = useState(false);
    const [avatarFailed, setAvatarFailed] = useState(false);

    // Use assets.logo as avatar if no dedicated avatar field
    const avatarSrc = assets.avatar || assets.logo;

    useEffect(() => {
        const fallbackBanners = [
            'https://images8.alphacoders.com/131/1310185.jpeg',
            'https://images2.alphacoders.com/130/1307521.jpg'
        ];
        
        const wallpaperKeys = Object.keys(assets?.wallpapers || {});
        if (wallpaperKeys.length > 0) {
            const randomMonth = wallpaperKeys[Math.floor(Math.random() * wallpaperKeys.length)];
            setRandomBanner(assets.wallpapers[randomMonth].windows);
        } else {
            setRandomBanner(fallbackBanners[Math.floor(Math.random() * fallbackBanners.length)]);
        }
    }, [assets]);

    const handleSync = async () => {
        if (syncing || showUpdated || dataRefreshing) return;
        setSyncing(true);
        try {
            // Updated to use the new optimized sync parameter
            const response = await fetch(`${APPS_SCRIPT_URL}?sync=true`);
            const rawText = await response.text();

            // HEALER: Extract JSON from potentially noisy Apps Script response
            let data;
            try {
                const startIndex = rawText.indexOf('{');
                const endIndex = rawText.lastIndexOf('}');

                if (startIndex === -1 || endIndex === -1) {
                    throw new Error("No valid JSON found in response");
                }

                const jsonText = rawText.substring(startIndex, endIndex + 1);
                data = JSON.parse(jsonText);
            } catch (pErr) {
                console.error("JSON Extraction Error:", pErr, "Response text:", rawText);
                throw new Error("Invalid response format from server");
            }

            if (data.success) {
                setShowUpdated(true);
                // Background refresh the data
                if (refreshPosts) refreshPosts();

                // Wait 3 seconds to show "Updated"
                setTimeout(() => {
                    setShowUpdated(false);
                }, 3000);
            } else {
                alert(`Sync Failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Sync Error:', error);
            alert(`Failed to sync. Error: ${error.message}. Check console for details.`);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="position-relative w-100 overflow-hidden" style={{ height: '350px', marginBottom: '40px' }}>
            {/* Top Loading Bar */}
            {syncing && (
                <div className="position-absolute top-0 start-0 w-100" style={{ zIndex: 3000, height: '3px', background: 'rgba(255,255,255,0.1)' }}>
                    <div className="h-100 bg-primary sync-progress-animation"></div>
                </div>
            )}
            <div
                className="position-absolute w-100 h-100"
                style={{
                    backgroundImage: `url(${randomBanner})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 0
                }}
            >
                <div
                    className="position-absolute w-100 h-50 bottom-0"
                    style={{
                        background: 'linear-gradient(to bottom, transparent, #0c0f1d)',
                        zIndex: 1
                    }}
                ></div>
            </div>

            <div className="container h-100 position-relative z-index-2">
                <div className="h-100 d-flex flex-column justify-content-end pb-4">
                    <div className="d-flex align-items-end gap-3 gap-md-4">
                        <div
                            className="rounded-circle bg-dark border border-4 border-dark overflow-hidden shadow-lg"
                            style={{ width: 'clamp(80px, 15vw, 110px)', height: 'clamp(80px, 15vw, 110px)', flexShrink: 0, position: 'relative' }}
                        >
                            {avatarSrc && !avatarFailed && (
                                <img
                                    src={avatarSrc}
                                    alt="Avatar"
                                    onLoad={() => setAvatarLoaded(true)}
                                    onError={() => setAvatarFailed(true)}
                                    style={{
                                        width: '100%', height: '100%',
                                        objectFit: 'cover',
                                        position: 'absolute', top: 0, left: 0,
                                        opacity: avatarLoaded ? 1 : 0,
                                        transition: 'opacity 0.3s',
                                        zIndex: 2
                                    }}
                                />
                            )}
                            {(!avatarLoaded || avatarFailed) && (
                                <div
                                    style={{
                                        position: 'absolute', top: 0, left: 0,
                                        width: '100%', height: '100%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '2rem',
                                        background: '#0d6efd',
                                        zIndex: 1
                                    }}
                                >CT</div>
                            )}
                        </div>




                        <div className="flex-grow-1 mb-2">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h1 className="fw-bold text-white mb-0 lh-1" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>CodeTraveller</h1>
                                    <p className="text-light opacity-75 mb-0 mt-2 small d-none d-md-block" style={{ maxWidth: '600px' }}>
                                        I'm a code hunter and I will help and find new codes. Thank you family and friends.
                                    </p>
                                </div>
                                <button
                                    className={`btn btn-glass rounded-pill d-flex align-items-center gap-2 px-3 no-capture ${showUpdated ? 'btn-success bg-success border-success' : ''}`}
                                    onClick={handleSync}
                                    disabled={syncing || showUpdated}
                                    style={{
                                        background: showUpdated ? undefined : 'rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: showUpdated ? undefined : '1px solid rgba(255,255,255,0.1)',
                                        color: 'white',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <span className="small fw-bold">
                                        {syncing ? 'Syncing...' : (showUpdated ? 'Updated' : 'Sync')}
                                    </span>
                                    {!showUpdated ? (
                                        <svg title="Sync" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className={`bi bi-arrow-repeat ${syncing ? 'spin-animation' : ''}`} viewBox="0 0 16 16">
                                            <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                                            <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16">
                                            <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.42-6.447a.733.733 0 0 1 1.047 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <div className="d-flex gap-3 mt-3 profile-stats-row">
                                <div className="text-white small"><span className="fw-bold">{posts.length || 0}</span> <span className="opacity-75">Posts</span></div>
                                <div className="text-white small">
                                    <span className="fw-bold">
                                        {(posts.reduce((sum, p) => sum + (p.stat_view || 0), 0)).toLocaleString()}
                                    </span> <span className="opacity-75">Views</span>
                                </div>
                                <div className="text-white small">
                                    <span className="fw-bold">
                                        {(posts.reduce((sum, p) => sum + (p.stat_like || 0), 0)).toLocaleString()}
                                    </span> <span className="opacity-75">Likes</span>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .spin-animation { animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .btn-glass:hover { background: rgba(255,255,255,0.2) !important; transform: translateY(-1px); }
                .z-index-2 { z-index: 2; }
                
                .sync-progress-animation {
                    width: 30%;
                    animation: progressMove 2s infinite linear;
                }
                @keyframes progressMove {
                    0% { margin-left: -30%; width: 30%; }
                    50% { width: 50%; }
                    100% { margin-left: 100%; width: 30%; }
                }
            `}</style>
        </div>
    );
};

export default ProfileBanner;
