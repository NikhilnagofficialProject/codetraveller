import React from 'react';

const DataCenter = ({ posts = [] }) => {
    const postCount = Array.isArray(posts) ? posts : [];

    const totalViews = postCount.reduce((acc, curr) => acc + (Number(curr.stat_view) || 0), 0);
    const totalLikes = postCount.reduce((acc, curr) => acc + (Number(curr.stat_like) || 0), 0);
    const totalComments = postCount.reduce((acc, curr) => acc + (Number(curr.stat_reply) || 0), 0);

    const totalFollowers = 205;
    const totalCommentLikes = 97;
    const totalCommentReplies = 22;

    const [isExpanded, setIsExpanded] = React.useState(false);

    const statsData = [
        { icon: "👁️", value: totalViews, label: "Post Views", subTag: "↗ 30" },
        { icon: "👍", value: totalLikes, label: "Post Likes" },
        { icon: "💬", value: totalComments, label: "Post Comments" },
        { icon: "👤", value: totalFollowers, label: "Followers" },
    ];

    const visibleStats = isExpanded ? statsData : statsData.slice(0, 3);

    const StatCard = ({ icon, value, label, subTag }) => (
        <div className="p-3 rounded mb-2 h-100" style={{ backgroundColor: '#25252b' }}>
            <div className="d-flex align-items-center mb-1">
                <span className="me-2" style={{ fontSize: '1.2rem' }}>{icon}</span>
                {subTag && <span className="text-success small fw-bold">{subTag}</span>}
            </div>
            <div className="fw-bold fs-5">{value > 1000 ? (value / 1000).toFixed(0) + 'k' : value}</div>
            <small className="text-secondary" style={{ fontSize: '0.75rem' }}>{label}</small>
        </div>
    );

    return (
        <div className="card border-0 shadow-sm rounded-4" style={{ backgroundColor: '#1b1b1b', color: '#fff' }}>
            <div className="card-header border-0 bg-transparent text-white d-flex justify-content-between align-items-center pt-3 pb-0">
                <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold">Data Center</span>
                </div>
            </div>
            <div className="card-body">
                <small className="text-secondary d-block mb-1" style={{ fontSize: '0.7rem' }}>The current data update time is {new Date().toLocaleDateString()}</small>

                <div className="row g-2 mb-2">
                    {visibleStats.map((stat, idx) => (
                        <div key={idx} className="col-4">
                            <StatCard
                                icon={stat.icon}
                                value={stat.value}
                                label={stat.label}
                                subTag={stat.subTag}
                            />
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="btn btn-sm btn-link text-secondary text-decoration-none p-0"
                        style={{ fontSize: '1.2rem', lineHeight: '1' }}
                    >
                        {isExpanded ? '⌃' : '⌄'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataCenter;
