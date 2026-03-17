import React from 'react';

const CollectionCard = ({ post, onClick }) => {
    const imageUrls = post.images && post.images.length > 0
        ? post.images
        : (post.cover_image_url ? post.cover_image_url.split(', ') : []);

    const [activeIndex, setActiveIndex] = React.useState(0);

    const truncateTitle = (title) => {
        if (!title) return '';
        const words = title.split(/\s+/);
        if (words.length > 5) {
            return words.slice(0, 5).join(' ') + ' ..';
        }
        return title;
    };

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

    return (
        <div className="card shadow-sm border-0 mb-3 rounded-4 overflow-hidden h-100" style={{ backgroundColor: '#1b1b1b', transition: 'transform 0.3s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

            {imageUrls.length > 0 && (
                <div className="position-relative" style={{ aspectRatio: '4/5' }}>
                    <img
                        src={imageUrls[activeIndex]}
                        alt="Collection Cover"
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                    />
                    {imageUrls.length > 1 && (
                        <>
                            <button className="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-1 rounded-circle p-1 bg-opacity-50 border-0 no-capture" onClick={handlePrev} style={{ width: '24px', height: '24px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>‹</button>
                            <button className="btn btn-dark position-absolute top-50 end-0 translate-middle-y me-1 rounded-circle p-1 bg-opacity-50 border-0 no-capture" onClick={handleNext} style={{ width: '24px', height: '24px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>›</button>
                        </>
                    )}
                </div>
            )}

            <div className="card-body p-3">
                <h5 className="card-title fw-bold text-white mb-3" style={{ fontSize: '1.1rem', lineHeight: '1.3', cursor: 'pointer' }} onClick={() => onClick && onClick(post)}>
                    {truncateTitle(post.subject)}
                </h5>
                <div className="d-flex align-items-center">
                    <span className="badge bg-primary bg-opacity-25 text-primary fw-bold px-2 py-1 text-start" style={{ fontSize: '0.65rem', borderRadius: '4px', whiteSpace: 'normal', lineHeight: '1.2' }}>
                        {post.collection || 'General'}
                    </span>
                </div>
            </div>
        </div>
    );
};

const Collections = ({ posts = [], onPostClick }) => {
    const customOrder = [
        "Redeem codes",
        "Update summary",
        "Character Help",
        "GENSHIN IMPACT – QUICK BUILD GUIDE",
        "Tire list",
        "Events",
        "Birthday wishes",
        "Mile stone",
        "My pulls",
        "NA"
    ];
    const groupedPosts = posts.reduce((groups, post) => {
        const collection = post.collection || 'Uncategorized';
        if (!groups[collection]) {
            groups[collection] = [];
        }
        groups[collection].push(post);
        return groups;
    }, {});

    const collections = Object.keys(groupedPosts).sort((a, b) => {
        const indexA = customOrder.findIndex(item => item.toLowerCase() === a.toLowerCase());
        const indexB = customOrder.findIndex(item => item.toLowerCase() === b.toLowerCase());
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        if (a === 'Uncategorized') return 1;
        if (b === 'Uncategorized') return -1;
        return a.localeCompare(b);
    });

    return (
        <div className="collections-container animate-fade-in pb-5">
            {collections.length > 0 ? (
                collections.map((collection) => (
                    <div key={collection} className="mb-5">
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <h2 className="text-white fw-bold m-0" style={{ fontSize: '1.4rem', borderLeft: '4px solid #007bff', paddingLeft: '1rem' }}>
                                {collection}
                            </h2>
                            <div className="flex-grow-1 border-bottom border-secondary border-opacity-25"></div>
                            <span className="badge bg-secondary bg-opacity-25 text-secondary">{groupedPosts[collection].length} Posts</span>
                        </div>

                        <div className="row g-4">
                            {groupedPosts[collection].map((post) => (
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={post.postId}>
                                    <CollectionCard post={post} onClick={onPostClick} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-5 text-white-50">
                    <p>No collections found.</p>
                </div>
            )}
        </div>
    );
};

export default Collections;
