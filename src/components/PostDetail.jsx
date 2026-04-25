import React from 'react';
import { cleanHoyoContent } from '../utils/contentCleaner';

const PostDetail = ({ post, onBack }) => {
    const imageUrls = post.images && post.images.length > 0
        ? post.images
        : (post.cover_image_url ? post.cover_image_url.split(', ') : []);

    const heroImage = imageUrls.length > 0 ? imageUrls[0] : null;

    const cleanedContent = cleanHoyoContent(post.content);
    const getTeaser = (text, wordCount = 60) => {
        if (!text) return '';
        const words = text.trim().split(/\s+/).filter(Boolean);
        if (words.length <= wordCount) return text;
        return words.slice(0, wordCount).join(' ') + '...';
    };

    const displayContent = getTeaser(cleanedContent, 60);

    return (
        <div className="container p-0 p-lg-2 fade-in post-detail-luxury" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="d-flex align-items-center mb-4 mt-2">
                <button
                    className="btn-back-magazine"
                    onClick={onBack}
                >
                    <span className="arrow">‹</span> Back to Feed
                </button>
            </div>

            <div className="card border-0 rounded-4 overflow-hidden mb-5 luxury-article-card">
                {heroImage && (
                    <div className="position-relative hero-wrapper">
                        <img
                            src={heroImage}
                            alt={post.subject}
                            className="w-100 h-100 hero-img"
                        />
                        <div className="hero-overlay"></div>
                    </div>
                )}

                <div className="card-body p-4 p-md-5">
                    <h1 className="fw-bold article-title mb-4" style={{ color: 'white' }}>{post.subject}</h1>
                    <div className="d-flex align-items-center gap-3 mb-5 article-meta">
                        <div className="ms-auto d-flex gap-3 stats-luxury">
                            <span title="Views">👁️ {post.stat_view || 0}</span>
                            <span title="Likes">👍 {post.stat_like || 0}</span>
                        </div>
                    </div>

                    <div className="magazine-content mb-5">
                        {displayContent}

                        <div className="source-callout mt-5">
                            <div className="callout-icon">🌐</div>
                            <div className="callout-body">
                                <p className="mb-1 opacity-75 small">Check out the original article and pics over on HoYoLAB! If you're feeling the vibes, drop a like and support your homie so I can keep 'em coming!</p>
                                <a href={post.url} target="_blank" rel="noreferrer" className="hoyolab-link">
                                    Click here <span className="ms-1">↗</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="pt-5 border-top border-white border-opacity-10 d-flex justify-content-start align-items-center">
                        <div className="d-flex gap-3">
                            <button className="btn btn-luxury-action">
                                <i className="bi bi-chat-dots me-2"></i> {post.stat_reply || 0} Comments
                            </button>
                            <button className="btn btn-luxury-action active">
                                <i className="bi bi-hand-thumbs-up me-2"></i> {post.stat_like || 0} Likes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .post-detail-luxury {
                    color: #e9ecef;
                }
                .btn-back-magazine {
                    background: transparent;
                    border: none;
                    color: rgba(255,255,255,0.6);
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 0;
                    transition: all 0.2s ease;
                }
                .btn-back-magazine:hover {
                    color: white;
                    transform: translateX(-5px);
                }
                .btn-back-magazine .arrow {
                    width: 32px;
                    height: 32px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.4rem;
                }
                .luxury-article-card {
                    background: #111320;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .hero-wrapper {
                    height: 450px;
                }
                .hero-img {
                    object-fit: cover;
                }
                .hero-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 100px;
                    background: linear-gradient(to top, #111320, transparent);
                }
                .article-title {
                    font-size: clamp(1.8rem, 5vw, 2.5rem);
                    line-height: 1.2;
                    letter-spacing: -0.02em;
                }
                .avatar-simulated {
                    width: 44px;
                    height: 44px;
                    background: var(--bs-primary);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: white;
                }
                .stats-luxury {
                    color: rgba(255,255,255,0.4);
                    font-size: 0.9rem;
                }
                .magazine-content {
                    line-height: 1.9;
                    font-size: 1.15rem;
                    color: rgba(255,255,255,0.85);
                    white-space: pre-wrap;
                }
                .source-callout {
                    display: flex;
                    gap: 20px;
                    padding: 25px;
                    background: rgba(255,255,255,0.03);
                    border-radius: 16px;
                    border-left: 4px solid var(--bs-primary);
                    align-items: flex-start;
                }
                .callout-icon {
                    font-size: 1.5rem;
                }
                .hoyolab-link {
                    color: var(--bs-primary);
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 1.1rem;
                    transition: all 0.2s ease;
                }
                .hoyolab-link:hover {
                    color: white;
                    text-decoration: underline;
                }
                .btn-luxury-action {
                    background: rgba(255,255,255,0.05);
                    border: none;
                    color: rgba(255,255,255,0.6);
                    padding: 10px 20px;
                    border-radius: 30px;
                    font-size: 0.9rem;
                    transition: all 0.2s ease;
                }
                .btn-luxury-action:hover {
                    background: rgba(255,255,255,0.1);
                    color: white;
                }
                .btn-luxury-action.active {
                    color: var(--bs-primary);
                    background: rgba(13, 110, 253, 0.1);
                }
            `}</style>
        </div>
    );
};

export default PostDetail;
