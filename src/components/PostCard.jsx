import React, { useState } from 'react';
import { cleanHoyoContent } from '../utils/contentCleaner';

const PostCard = ({ post, onClick }) => {
    const imageUrls = post.images && post.images.length > 0
        ? post.images
        : (post.cover_image_url ? post.cover_image_url.split(', ') : []);

    const [activeIndex, setActiveIndex] = useState(0);

    const handleNext = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((prev) => (prev + 1) % imageUrls.length);
    };

    const handlePrev = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
    };

    const handleTitleClick = () => {
        if (onClick) {
            onClick();
        } else if (post.url) {
            window.open(post.url, '_blank', 'noopener,noreferrer');
        }
    };

    const tagsString = post.tags || post.topics || post.Builds || '';
    const tags = tagsString ? tagsString.split(', ') : [];

    // Use the cleaner utility
    const cleanedContent = cleanHoyoContent(post.content);
    const cleanedDescription = cleanedContent.split(/\s+/).slice(0, 10).join(' ') + (cleanedContent.split(/\s+/).length > 10 ? '...' : '');

    return (
        <div
            className="card border-0 mb-4 rounded-4 overflow-hidden post-card-premium"
            style={{
                background: 'rgba(21, 23, 37, 0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.3s ease'
            }}
        >
            {/* Carousel Section */}
            {imageUrls.length > 0 && (
                <div className="position-relative group-carousel" style={{ height: '240px' }}>
                    <img
                        src={imageUrls[activeIndex]}
                        alt={`Cover ${activeIndex + 1}`}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                    />

                    {imageUrls.length > 1 && (
                        <>
                            <button
                                className="carousel-nav-btn prev"
                                onClick={handlePrev}
                            >
                                ‹
                            </button>
                            <button
                                className="carousel-nav-btn next"
                                onClick={handleNext}
                            >
                                ›
                            </button>
                            <div className="carousel-indicators-custom">
                                {imageUrls.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`indicator-dot ${idx === activeIndex ? 'active' : ''}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="card-body p-4">
                <h5
                    className="card-title fw-bold text-white mb-2"
                    style={{
                        fontSize: '1.2rem',
                        lineHeight: '1.4',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease'
                    }}
                    onClick={handleTitleClick}
                >
                    {post.subject}
                </h5>

                <div className="mb-3 d-flex flex-wrap gap-1">
                    {tags.map((tag, idx) => (
                        <span key={idx} className="badge rounded-pill text-light py-1 px-2" style={{ background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.7rem' }}>
                            #{tag.trim()}
                        </span>
                    ))}
                </div>

                <p
                    className="text-secondary mb-4 description-text"
                    style={{
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        display: '-webkit-box',
                        WebkitLineClamp: '3',
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        opacity: 0.8
                    }}
                >
                    {cleanedDescription}
                </p>

                <div className="d-flex align-items-center justify-content-between pt-3 border-top border-white border-opacity-10">
                    <div className="d-flex gap-4 text-secondary" style={{ fontSize: '0.85rem' }}>
                        <span className="d-flex align-items-center gap-1">
                            <i className="bi bi-eye"></i> {post.stat_view || 0}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                            <i className="bi bi-hand-thumbs-up"></i> {post.stat_like || 0}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                            <i className="bi bi-chat-dots"></i> {post.stat_reply || 0}
                        </span>
                    </div>
                    <div className="text-primary small fw-bold cursor-pointer hover-underline" onClick={handleTitleClick}>
                        Read More ➝
                    </div>
                </div>
            </div>

            <style>{`
                .post-card-premium:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
                    border-color: rgba(255,255,255,0.15) !important;
                }
                .post-card-premium:hover .card-title {
                    color: var(--bs-primary) !important;
                }
                .carousel-nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(0,0,0,0.3);
                    backdrop-filter: blur(4px);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    z-index: 2;
                }
                .carousel-nav-btn:hover { background: rgba(0,0,0,0.6); }
                .carousel-nav-btn.prev { left: 10px; }
                .carousel-nav-btn.next { right: 10px; }
                .carousel-indicators-custom {
                    position: absolute;
                    bottom: 12px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 6px;
                    z-index: 2;
                }
                .indicator-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.4);
                    transition: all 0.3s ease;
                }
                .indicator-dot.active {
                    background: white;
                    width: 12px;
                    border-radius: 3px;
                }
                .hover-underline:hover { text-decoration: underline; }
            `}</style>
        </div>
    );
};

export default PostCard;
