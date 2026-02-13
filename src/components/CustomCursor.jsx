import React, { useState, useEffect } from 'react';

const CustomCursor = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const addEventListeners = () => {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseenter', onMouseEnter);
            document.addEventListener('mouseleave', onMouseLeave);
            document.addEventListener('mousedown', onMouseDown);
            document.addEventListener('mouseup', onMouseUp);
        };

        const removeEventListeners = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseenter', onMouseEnter);
            document.removeEventListener('mouseleave', onMouseLeave);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);

            const target = e.target;
            const isSelectable = window.getComputedStyle(target).cursor === 'pointer' ||
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('button') ||
                target.closest('a');
            setIsHovering(isSelectable);
        };

        const onMouseLeave = () => setIsVisible(false);
        const onMouseEnter = () => setIsVisible(true);
        const onMouseDown = () => setIsHovering(true);
        const onMouseUp = () => setIsHovering(false);

        addEventListeners();
        return () => removeEventListeners();
    }, [isVisible]);

    if (typeof window === 'undefined') return null;

    return (
        <>
            {/* Main Smooth Bubble */}
            <div
                className="fixed pointer-events-none z-[99999] mix-blend-difference hidden md:block"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    opacity: isVisible ? 1 : 0,
                    transform: 'translate(-50%, -50%)',
                    transition: 'width 0.3s, height 0.3s, opacity 0.3s, transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                <div
                    className={`rounded-full bg-white transition-all duration-500 ease-out flex items-center justify-center ${isHovering ? 'w-16 h-16 opacity-40' : 'w-8 h-8 opacity-60'}`}
                    style={{
                        boxShadow: isHovering ? '0 0 30px rgba(255,255,255,0.6)' : 'none'
                    }}
                >
                    <div className={`bg-white rounded-full transition-all duration-300 ${isHovering ? 'w-2 h-2' : 'w-1 h-1'}`} />
                </div>
            </div>

            {/* Faster Inner Dot for Precision */}
            <div
                className="fixed pointer-events-none z-[100000] mix-blend-difference hidden md:block w-1.5 h-1.5 bg-white rounded-full"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    opacity: isVisible ? 1 : 0,
                    transform: 'translate(-50%, -50%)',
                    transition: 'transform 0.05s linear, opacity 0.2s'
                }}
            />
        </>
    );
};

export default CustomCursor;
