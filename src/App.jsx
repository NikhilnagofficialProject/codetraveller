import React, { useState, useEffect } from 'react';
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
    const character = builds.find(b => {
        const charData = Array.isArray(b) ? b[0] : b;
        return (charData.uname || charData.name).toLowerCase() === name.toLowerCase();
    });
    
    return character ? <CharacterDetail character={character} assets={assets} onBack={onBack} /> : <Navigate to="/builds" />;
}

import { useParams } from 'react-router-dom';

export default App;

