import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

// Layout Components
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import FloatingFAB from './components/layout/FloatingFAB';
import ProfileBanner from './components/ProfileBanner';
import BirthdayCalendar from './components/BirthdayCalendar';

// Page Components
import PostCard from './components/PostCard';
import PostDetail from './components/PostDetail';
import GenshinBuilds from './components/GenshinBuilds';
import CharacterDetail from './components/CharacterDetail';
import Calendar from './components/Calendar';
import Collections from './components/Collections';
import ArtifactDiscovery from './components/ArtifactDiscovery';
import WeaponDiscovery from './components/WeaponDiscovery';
import WeaponsPage from './components/WeaponsPage';
import ArtifactsPage from './components/ArtifactsPage';

// Hooks
import { usePostsData } from './hooks/usePostsData';
import { useBuildsData } from './hooks/useBuildsData';

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);
    const [logoFailed, setLogoFailed] = useState(false);
    const [showSticky, setShowSticky] = useState(false);
    const [stickySuccess, setStickySuccess] = useState(false);

    const { builds, assets, loading: buildsLoading, error: buildsError } = useBuildsData();
    const { posts, loading: postsLoading, refreshing, refreshPosts } = usePostsData();

    // Sync active tab with URL for the navbar highlights
    const activeTab = location.pathname.split('/')[1] || 'posts';

    useEffect(() => {
        const handleScroll = () => setShowSticky(window.pageYOffset > 300);
=======
import PostCard from './components/PostCard';
import DataCenter from './components/DataCenter';
import ProfileBanner from './components/ProfileBanner';
import BirthdayCalendar from './components/BirthdayCalendar';
import Calendar from './components/Calendar';
import PostDetail from './components/PostDetail';
import GenshinBuilds from './components/GenshinBuilds';
import CharacterDetail from './components/CharacterDetail';
import Collections from './components/Collections';
import { usePostsData } from './hooks/usePostsData';

function App() {
    const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('activeTab') || 'posts');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (activeTab === 'data') setActiveTab('collections');
    }, [activeTab]);

    const [selectedPost, setSelectedPost] = useState(() => {
        const saved = sessionStorage.getItem('selectedPost');
        return saved ? JSON.parse(saved) : null;
    });

    const [selectedBuild, setSelectedBuild] = useState(() => {
        const saved = sessionStorage.getItem('selectedBuild');
        return saved ? JSON.parse(saved) : null;
    });

    // Handle body scroll locking when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMenuOpen]);

    useEffect(() => {
        sessionStorage.setItem('activeTab', activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (selectedPost) {
            sessionStorage.setItem('selectedPost', JSON.stringify(selectedPost));
        } else {
            sessionStorage.removeItem('selectedPost');
        }
    }, [selectedPost]);

    useEffect(() => {
        if (selectedBuild) {
            sessionStorage.setItem('selectedBuild', JSON.stringify(selectedBuild));
        } else {
            sessionStorage.removeItem('selectedBuild');
        }
    }, [selectedBuild]);

    const { posts, loading, refreshing, refreshPosts } = usePostsData();
    const [showSticky, setShowSticky] = useState(false);
    const [stickySuccess, setStickySuccess] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.pageYOffset;
            setShowSticky(currentScroll > 300);
        };
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

<<<<<<< HEAD
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    }, [isMenuOpen]);

    const handleTabChange = (tab) => {
        navigate(`/${tab === 'posts' ? '' : tab}`);
        setIsMenuOpen(false);
        window.scrollTo(0, 0);
    };

=======
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
    const handleStickySync = async () => {
        if (refreshing || stickySuccess) return;
        await refreshPosts();
        setStickySuccess(true);
        setTimeout(() => setStickySuccess(false), 2000);
    };

<<<<<<< HEAD
    return (
        <div className="min-vh-100">
            <Navbar 
                activeTab={activeTab} 
                handleTabChange={handleTabChange}
                assets={assets}
                logoLoaded={logoLoaded}
                setLogoLoaded={setLogoLoaded}
                logoFailed={logoFailed}
                setLogoFailed={setLogoFailed}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
            />

            <MobileNav 
                isMenuOpen={isMenuOpen}
                activeTab={activeTab}
                handleTabChange={handleTabChange}
            />

            <ProfileBanner assets={assets} posts={posts} refreshPosts={refreshPosts} refreshing={refreshing} />
            <BirthdayCalendar assets={assets} onViewAll={() => handleTabChange('calendar')} />

            <div className="container pb-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-xl-11">
                        <Routes>
                            <Route path="/" element={<Navigate to="/posts" replace />} />
                            <Route path="/posts" element={
                                <div className="animate-fade-in">
                                    {postsLoading ? (
                                        <div className="text-center py-5"><div className="spinner-border spinner-border-sm me-2"></div>Loading posts...</div>
                                    ) : (
                                        <>
                                            {posts.map(post => (
                                                <PostCard key={post.postId} post={post} onClick={() => navigate(`/posts/${post.postId}`)} />
                                            ))}
                                            <div className="text-center py-4 text-white-50"><small>That's all~</small></div>
                                        </>
                                    )}
                                </div>
                            } />
                            <Route path="/posts/:postId" element={
                                <PostDetail_Wrapper posts={posts} loading={postsLoading} onBack={() => navigate('/posts')} />
                            } />
                            <Route path="/builds" element={
                                <div className="animate-fade-in">
                                    <GenshinBuilds 
                                        builds={builds} 
                                        assets={assets} 
                                        loading={buildsLoading} 
                                        error={buildsError} 
                                        onCharacterClick={(b) => navigate(`/builds/${b[0].uname || b[0].name.toLowerCase()}`)} 
                                    />
                                </div>
                            } />
                            <Route path="/builds/:name" element={
                                <CharacterDetail_Wrapper builds={builds} assets={assets} loading={buildsLoading} onBack={() => navigate('/builds')} />
                            } />
                            <Route path="/calendar" element={<Calendar assets={assets} />} />
                            <Route path="/collections" element={<Collections posts={posts} onPostClick={(p) => navigate(`/posts/${p.postId}`)} />} />
                            <Route path="/artifacts/:setName" element={<ArtifactDiscovery builds={builds} assets={assets} />} />
                            <Route path="/weapons/:weaponName" element={<WeaponDiscovery builds={builds} assets={assets} />} />
                            <Route path="/weapons" element={<WeaponsPage assets={assets} />} />
                            <Route path="/artifacts" element={<ArtifactsPage assets={assets} />} />
                        </Routes>
=======
    const handlePostClick = (post) => {
        setSelectedPost(post);
        setIsMenuOpen(false);
        window.scrollTo(0, 0);
    };

    const handleBackToFeed = () => {
        setSelectedPost(null);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedBuild(null);
        setSelectedPost(null);
        setIsMenuOpen(false);
    };

    const handleBuildClick = (builds) => {
        setSelectedBuild(builds[0]);
        setIsMenuOpen(false);
        window.scrollTo(0, 0);
    };

    return (
        <div className="min-vh-100" style={{ backgroundColor: '#0c0f1d', color: '#e9ecef' }}>
            <nav className="navbar navbar-expand-lg sticky-top p-0 no-capture" style={{
                backgroundColor: 'rgba(12, 15, 29, 0.6)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                zIndex: 2000
            }}>
                <div className="container py-2">
                    <div className="d-flex w-100 justify-content-between align-items-center">
                        <div className="navbar-brand fw-bold text-white d-flex align-items-center gap-2 m-0" style={{ cursor: 'pointer', zIndex: 2001 }} onClick={() => { handleTabChange('posts'); }}>
                            <img src="src/assets/Logo/codetraveller.png" alt="Logo" style={{ width: '30px', height: '30px' }} className="rounded-circle" />
                            <span style={{ fontSize: '1rem', letterSpacing: '1px' }}>HOYO BLOG</span>
                        </div>

                        {/* Desktop Navigation */}
                        <ul className="nav nav-pills d-none d-lg-flex gap-1">
                            {['posts', 'builds', 'collections', 'calendar'].map((tab) => (
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
                                        {tab === 'builds' ? 'Genshin Builds' : tab}
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className="d-flex align-items-center gap-3">
                            <div className="d-none d-md-block text-white-50 small fw-bold" style={{ letterSpacing: '1px' }}>
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                            </div>

                            {/* Mobile Hamburger Toggle */}
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

            {/* Mobile Navigation Overlay */}
            <div className={`mobile-nav-overlay ${isMenuOpen ? 'active' : ''}`}>
                <div className="container h-100 d-flex flex-column justify-content-center align-items-center">
                    <div className="mobile-nav-links d-flex flex-column gap-4 w-100 px-4">
                        {['posts', 'builds', 'collections', 'calendar'].map((tab) => (
                            <button
                                key={tab}
                                className={`mobile-nav-item ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => handleTabChange(tab)}
                            >
                                <span className="tab-label">{tab === 'builds' ? 'GENSHIN BUILDS' : tab.toUpperCase()}</span>
                                <span className="tab-arrow">→</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-5 text-white-50 small fw-bold text-center">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
                    </div>
                </div>
            </div>

<<<<<<< HEAD
            <FloatingFAB 
                showSticky={showSticky} 
                stickySuccess={stickySuccess} 
                refreshing={refreshing} 
                handleStickySync={handleStickySync} 
            />
        </div>
    );
}

// Helper wrappers to handle data lookup from URL
function PostDetail_Wrapper({ posts, loading, onBack }) {
    const { postId } = useParams();
    if (loading) return <div className="text-center py-5 text-white"><div className="spinner-border spinner-border-sm me-2"></div>Loading...</div>;
    const post = posts.find(p => String(p.postId) === postId);
    return post ? <PostDetail post={post} onBack={onBack} /> : <Navigate to="/posts" />;
}

function CharacterDetail_Wrapper({ builds, assets, loading, onBack }) {
    const { name } = useParams();
    if (loading) return <div className="text-center py-5 text-white"><div className="spinner-border spinner-border-sm me-2"></div>Loading character data...</div>;
    
    // Find character by uname or name
    const character = builds.find(b => {
        const charData = Array.isArray(b) ? b[0] : b;
        return (charData.uname || charData.name).toLowerCase() === name.toLowerCase();
    });
    
    return character ? <CharacterDetail character={character} assets={assets} onBack={onBack} /> : <Navigate to="/builds" />;
}

import { useParams } from 'react-router-dom';
=======
            <ProfileBanner refreshPosts={refreshPosts} refreshing={refreshing} />

            <div className="container pb-5">
                <div className="row g-4 justify-content-center">
                    <div className={(selectedPost || selectedBuild || activeTab === 'calendar' || activeTab === 'collections') ? 'col-12' : 'col-lg-8'}>
                        {activeTab === 'posts' && (
                            selectedPost ? (
                                <PostDetail post={selectedPost} onBack={handleBackToFeed} />
                            ) : (
                                <div className="animate-fade-in">
                                    {loading ? (
                                        <div className="text-center text-white py-5">
                                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                            Loading posts...
                                        </div>
                                    ) : (
                                        <>
                                            {posts.map((post) => (
                                                <PostCard key={post.postId} post={post} onClick={() => handlePostClick(post)} />
                                            ))}
                                            <div className="text-center py-4 text-white-50">
                                                <small>That's all~</small>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        )}

                        {activeTab === 'builds' && (
                            selectedBuild ? (
                                <CharacterDetail character={selectedBuild} onBack={() => setSelectedBuild(null)} />
                            ) : (
                                <div className="animate-fade-in">
                                    <GenshinBuilds onCharacterClick={handleBuildClick} />
                                </div>
                            )
                        )}

                        {activeTab === 'calendar' && (
                            <div className="animate-fade-in">
                                <Calendar />
                            </div>
                        )}

                        {activeTab === 'collections' && (
                            <div className="animate-fade-in">
                                <Collections posts={posts} onPostClick={handlePostClick} />
                            </div>
                        )}
                    </div>

                    {!selectedPost && !selectedBuild && (activeTab === 'posts' || activeTab === 'collections') && (
                        <div className="col-lg-4 d-none d-lg-block">
                            <div className="d-flex flex-column gap-4">
                                <DataCenter posts={posts} isSidebar={true} />
                                <BirthdayCalendar onViewAll={() => handleTabChange('calendar')} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Sync Button (FAB) - Sticky Sync */}
            <div className={`position-fixed bottom-0 end-0 p-3 p-md-4 no-capture ${showSticky ? 'sticky-sync-visible' : 'sticky-sync-hidden'}`} style={{ zIndex: 1050, transition: 'all 0.4s ease' }}>
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
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
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

            <style>{`
                .hov-white:hover { color: white !important; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .spin-animation { animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                
                .sticky-sync-visible { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
                .sticky-sync-hidden { opacity: 0; transform: translateY(20px) scale(0.8); pointer-events: none; }

                .sync-progress-animation {
                    width: 30%;
                    animation: progressMove 2s infinite linear;
                }
                @keyframes progressMove {
                    0% { margin-left: -30%; width: 30%; }
                    50% { width: 50%; }
                    100% { margin-left: 100%; width: 30%; }
                }

                /* Hamburger Button */
                .hamburger-btn {
                    width: 30px;
                    height: 20px;
                    position: relative;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .hamburger-btn span {
                    display: block;
                    width: 100%;
                    height: 2px;
                    background-color: white;
                    border-radius: 2px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .hamburger-btn.open span:nth-child(1) {
                    transform: translateY(9px) rotate(45deg);
                }
                .hamburger-btn.open span:nth-child(2) {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                .hamburger-btn.open span:nth-child(3) {
                    transform: translateY(-9px) rotate(-45deg);
                }

                /* Mobile Navigation Overlay */
                .mobile-nav-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(12, 15, 29, 0.95);
                    backdrop-filter: blur(25px);
                    z-index: 1500;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .mobile-nav-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }
                .mobile-nav-item {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 1.5rem;
                    font-weight: 900;
                    text-align: left;
                    padding: 1.5rem 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.3s ease;
                    letter-spacing: 2px;
                }
                .mobile-nav-item.active {
                    color: white;
                    border-bottom-color: var(--bs-primary);
                }
                .mobile-nav-item .tab-arrow {
                    opacity: 0;
                    transform: translateX(-20px);
                    transition: all 0.3s ease;
                }
                .mobile-nav-item.active .tab-arrow {
                    opacity: 1;
                    transform: translateX(0);
                    color: var(--bs-primary);
                }
            `}</style>
        </div >
    );
}

>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
export default App;
