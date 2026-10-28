import React from 'react';
import './FlipCard.css';

/**
 * A reusable FlipCard component using 3D CSS transforms.
 * 
 * @param {ReactNode} front - Content for the front of the card.
 * @param {ReactNode} back - Content for the back of the card.
 * @param {string} className - Optional container class.
 * @param {string} height - Height of the card (default: '300px').
 * @param {string} width - Width of the card (default: '100%').
 * @param {string} borderRadius - Border radius (default: '12px').
 */
const FlipCard = ({ 
    front, 
    back, 
    className = '', 
    height = '300px', 
    width = '100%',
    borderRadius = '12px'
}) => {
    return (
        <div 
            className={`flip-card ${className}`} 
            style={{ height, width }}
        >
            <div className="flip-card-inner" style={{ borderRadius }}>
                <div className="flip-card-front" style={{ borderRadius }}>
                    {front}
                </div>
                <div className="flip-card-back" style={{ borderRadius }}>
                    {back}
                </div>
            </div>
        </div>
    );
};

export default FlipCard;
