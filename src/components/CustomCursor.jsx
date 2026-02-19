import React, { useState, useEffect } from 'react';

const CustomCursor = () => {
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const onMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);

            // Smarter hovering detection
            const target = e.target;
            if (!target) return;

            const isClickable = window.getComputedStyle(target).cursor === 'pointer' ||
                ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName) ||
                target.closest('button') ||
                target.closest('a') ||
                target.closest('[role="button"]');

            setIsHovering(isClickable);
        };

        const onMouseLeave = () => setIsVisible(false);
        const onMouseEnter = () => setIsVisible(true);
        const onMouseDown = () => setIsHovering(true);
        const onMouseUp = () => setIsHovering(false);

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseenter', onMouseEnter);
        document.addEventListener('mouseleave', onMouseLeave);
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseenter', onMouseEnter);
            document.removeEventListener('mouseleave', onMouseLeave);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [isVisible]);

    if (typeof window === 'undefined') return null;

    return (
        <div className={`fixed inset-0 pointer-events-none z-[999999] overflow-hidden hidden md:block transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Outer Ring */}
            <div
                className={`absolute rounded-full border-2 border-maroon/40 transition-all duration-300 ease-out flex items-center justify-center ${isHovering ? 'w-14 h-14 bg-maroon/5 scale-110' : 'w-10 h-10 bg-transparent'}`}
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: isHovering ? '0 0 25px rgba(139, 38, 53, 0.2)' : 'none'
                }}
            >
                {/* Inner Dot */}
                <div className={`rounded-full bg-maroon shadow-lg transition-all duration-300 ${isHovering ? 'w-2 h-2 opacity-100' : 'w-1.5 h-1.5 opacity-60'}`} />
            </div>

            {/* Extra precision dot for lag-free feel */}
            <div
                className="absolute w-1 h-1 bg-maroon rounded-full transition-transform duration-75"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'translate(-50%, -50%)',
                }}
            />
        </div>
    );
};

export default CustomCursor;
