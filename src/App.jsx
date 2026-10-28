import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';

// Layout Components
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import FloatingFAB from './components/layout/FloatingFAB';
import ProfileBanner from './components/ProfileBanner';
import BirthdayCalendar from './components/BirthdayCalendar';

// Page Components (Lazy Loaded)
const PostCard = lazy(() => import('./components/PostCard'));
const PostDetail = lazy(() => import('./components/PostDetail'));
const GenshinBuilds = lazy(() => import('./components/GenshinBuilds'));
const CharacterDetail = lazy(() => import('./components/CharacterDetail'));
const Calendar = lazy(() => import('./components/Calendar'));
const Collections = lazy(() => import('./components/Collections'));
const ArtifactDiscovery = lazy(() => import('./components/ArtifactDiscovery'));
const WeaponDiscovery = lazy(() => import('./components/WeaponDiscovery'));
const WeaponsPage = lazy(() => import('./components/WeaponsPage'));
const ArtifactsPage = lazy(() => import('./components/ArtifactsPage'));
const Lab = lazy(() => import('./components/Lab'));

// Hooks
import { usePostsData } from './hooks/usePostsData';
import { useBuildsData } from './hooks/useBuildsData';
import characterBaseStats from './data/characters.json';

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);
    const [logoFailed, setLogoFailed] = useState(false);
    const [showSticky, setShowSticky] = useState(false);
    const [stickySuccess, setStickySuccess] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const { builds, assets, loading: buildsLoading, error: buildsError } = useBuildsData();
    const { posts, loading: postsLoading, refreshing, refreshPosts } = usePostsData();

    // Sync active tab with URL for the navbar highlights
    const activeTab = location.pathname.split('/')[1] || 'posts';

    useEffect(() => {
        const handleScroll = () => setShowSticky(window.pageYOffset > 300);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    }, [isMenuOpen]);

    const handleTabChange = (tab) => {
        navigate(`/${tab === 'posts' ? '' : tab}`);
        setIsMenuOpen(false);
        window.scrollTo(0, 0);
    };

    const handleStickySync = async () => {
        if (refreshing || stickySuccess) return;
        await refreshPosts();
        setStickySuccess(true);
        setTimeout(() => setStickySuccess(false), 2000);
    };

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
                theme={theme}
                toggleTheme={toggleTheme}
            />

            <MobileNav 
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                activeTab={activeTab}
                handleTabChange={handleTabChange}
                toggleTheme={toggleTheme}
                theme={theme}
            />

            <ProfileBanner assets={assets} posts={posts} refreshPosts={refreshPosts} refreshing={refreshing} />
            <BirthdayCalendar assets={assets} onViewAll={() => handleTabChange('calendar')} />

            <div className="container pb-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-xl-11">
                        <Suspense fallback={
                            <div className="text-center py-5 animate-pulse">
                                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                                <div className="text-white-50 fw-bold tracking-widest text-uppercase small">Initializing Experience...</div>
                            </div>
                        }>
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
                                <Route path="/lab" element={<Lab builds={builds} assets={assets} />} />
                            </Routes>
                        </Suspense>
                    </div>
                </div>
            </div>

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
    // Find character base stats from JSON
    const getBaseStats = (name) => {
        const clean = (n) => n.toLowerCase().trim().replace(/[\s\-_]+/g, '').replace(/[^a-z0-9]/g, '');
        const search = clean(name);
        
        // SPECIAL: Map all travelers to the traveler/aether role in JSON
        const isTraveler = search.includes('traveler') || search.includes('lumine') || search.includes('aether');

        for (const role of Object.values(characterBaseStats)) {
            const match = Object.entries(role).find(([k, v]) => {
                const cleanK = clean(k);
                if (isTraveler && (cleanK === 'aether' || cleanK === 'lumine' || cleanK === 'traveler')) return true;
                return cleanK === search || search.includes(cleanK) || cleanK.includes(search);
            });
            if (match) return match[1];
        }
        return null;
    };

    const matchingBuilds = builds.filter(b => {
        const charData = Array.isArray(b) ? b[0] : b;
        return (charData.uname || charData.name).toLowerCase() === name.toLowerCase();
    });

    if (matchingBuilds.length === 0) return <Navigate to="/builds" />;

    const mergedBuilds = matchingBuilds.map(b => ({
        ...b,
        baseStats: getBaseStats(b.name)
    }));
    
    return <CharacterDetail character={mergedBuilds} assets={assets} onBack={onBack} />;
}


export default App;

