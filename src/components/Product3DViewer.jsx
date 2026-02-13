import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, X, RotateCw, Sparkles, TrendingUp } from 'lucide-react';

const Product3DViewer = ({ images = [], productName = '', discount = null, compact = false }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [autoRotate, setAutoRotate] = useState(false);
    const [showHint, setShowHint] = useState(true);
    const imageRef = useRef(null);
    const containerRef = useRef(null);

    // Auto-rotate carousel effect
    useEffect(() => {
        if (autoRotate && images.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [autoRotate, images.length]);

    // Hide hint after first interaction
    useEffect(() => {
        if (isDragging || rotation !== 0 || zoom !== 1) {
            setShowHint(false);
        }
    }, [isDragging, rotation, zoom]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
            if (e.key === '+' || e.key === '=') handleZoomIn();
            if (e.key === '-' || e.key === '_') handleZoomOut();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, isFullscreen, zoom]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        setRotation(0);
        setZoom(1);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setRotation(0);
        setZoom(1);
    };

    // Mouse drag handlers
    const handleMouseDown = (e) => {
        if (window.innerWidth < 768) return; // Disable rotation on small screens
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setAutoRotate(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragStart.x;
        const rotationChange = deltaX * 0.3;
        setRotation((prev) => (prev + rotationChange) % 360);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch drag handlers
    const handleTouchStart = (e) => {
        if (window.innerWidth < 768) return; // Disable rotation on small screens
        setIsDragging(true);
        setDragStart({
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        });
        setAutoRotate(false);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;

        const deltaX = e.touches[0].clientX - dragStart.x;
        const rotationChange = deltaX * 0.3;
        setRotation((prev) => (prev + rotationChange) % 360);
        setDragStart({
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        });
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Zoom handlers
    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 0.25, 1));
    };

    const resetView = () => {
        setZoom(1);
        setRotation(0);
    };

    const toggleAutoRotate = () => {
        setAutoRotate(!autoRotate);
        if (!autoRotate) {
            setRotation(0);
            setZoom(1);
        }
    };

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-3xl flex items-center justify-center shadow-xl">
                <p className="text-slate-400 text-lg">📸 No images available</p>
            </div>
        );
    }

    const currentImage = images[currentIndex];

    const stopPropagation = (e) => {
        e.stopPropagation();
    };

    return (
        <>
            {/* Main Viewer */}
            <div
                ref={containerRef}
                className="relative bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-maroon/10"
            >
                {/* Discount Badge */}
                {discount && (
                    <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        -{discount}% OFF
                    </div>
                )}

                {/* Trending Badge */}
                {!compact && (
                    <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        TRENDING
                    </div>
                )}

                {/* Main Image Container */}
                <div
                    className={`relative aspect-square overflow-hidden bg-gradient-to-br from-cream/30 to-white dark:from-slate-900 dark:to-slate-800 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                        }`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="w-full h-full flex items-center justify-center p-8">
                        <img
                            ref={imageRef}
                            src={currentImage.url || currentImage}
                            alt={`${productName} - View ${currentIndex + 1}`}
                            className="max-w-full max-h-full object-contain transition-all duration-300"
                            style={{
                                transform: `rotate(${rotation}deg) scale(${zoom})`,
                                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            draggable={false}
                        />
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                onMouseDown={stopPropagation}
                                onTouchStart={stopPropagation}
                                className={`absolute left-3 top-1/2 -translate-y-1/2 bg-maroon hover:bg-maroon-dark text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-all z-10 ${compact ? 'p-2' : 'p-3'}`}
                                aria-label="Previous image"
                            >
                                <ChevronLeft className={`h-6 w-6 ${compact ? 'h-4 w-4' : ''}`} />
                            </button>
                            <button
                                onClick={handleNext}
                                onMouseDown={stopPropagation}
                                onTouchStart={stopPropagation}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 bg-maroon hover:bg-maroon-dark text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-all z-10 ${compact ? 'p-2' : 'p-3'}`}
                                aria-label="Next image"
                            >
                                <ChevronRight className={`h-6 w-6 ${compact ? 'h-4 w-4' : ''}`} />
                            </button>
                        </>
                    )}

                    {/* Control Panel */}
                    <div
                        className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-md rounded-full z-10 ${compact ? 'bottom-2 px-3 py-2 scale-90' : 'bottom-4 px-4 py-3'}`}
                        onMouseDown={stopPropagation}
                        onTouchStart={stopPropagation}
                    >
                        {/* Zoom Out */}
                        <button
                            onClick={handleZoomOut}
                            disabled={zoom <= 1}
                            className="text-white hover:text-maroon transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Zoom out"
                            title="Zoom Out (-)"
                        >
                            <ZoomOut className="h-5 w-5" />
                        </button>

                        {/* Zoom Level Indicator */}
                        <div className="text-white text-sm font-bold min-w-[60px] text-center">
                            {Math.round(zoom * 100)}%
                        </div>

                        {/* Zoom In */}
                        <button
                            onClick={handleZoomIn}
                            disabled={zoom >= 3}
                            className="text-white hover:text-maroon transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Zoom in"
                            title="Zoom In (+)"
                        >
                            <ZoomIn className="h-5 w-5" />
                        </button>

                        <div className="w-px h-6 bg-white/30 mx-2" />

                        {/* Auto Rotate */}
                        <button
                            onClick={toggleAutoRotate}
                            className={`transition-all ${autoRotate ? 'text-maroon' : 'text-white hover:text-maroon'
                                }`}
                            aria-label="Toggle auto-rotate"
                            title="Auto Rotate"
                        >
                            <RotateCw className={`h-5 w-5 ${autoRotate ? 'animate-spin' : ''}`} />
                        </button>

                        {/* Reset View */}
                        {(zoom !== 1 || rotation !== 0) && (
                            <button
                                onClick={resetView}
                                className="text-white hover:text-maroon transition-colors text-xs font-medium px-2"
                                title="Reset View"
                            >
                                Reset
                            </button>
                        )}

                        {!compact && (
                            <>
                                <div className="w-px h-6 bg-white/30 mx-2" />

                                {/* Fullscreen */}
                                <button
                                    onClick={() => setIsFullscreen(true)}
                                    className="text-white hover:text-maroon transition-colors"
                                    aria-label="Fullscreen"
                                    title="Fullscreen"
                                >
                                    <Maximize2 className="h-5 w-5" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Image Counter */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
                        {currentIndex + 1} / {images.length}
                    </div>

                    {/* Interactive Hint - Hidden on mobile */}
                    {showHint && !isDragging && rotation === 0 && zoom === 1 && window.innerWidth >= 768 && (
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-gradient-to-r from-maroon to-pink-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl animate-bounce flex items-center gap-2">
                            <span className="text-2xl">👆</span>
                            <span>Drag to rotate • Scroll to zoom</span>
                        </div>
                    )}
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-maroon scrollbar-track-slate-200">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentIndex(index);
                                        resetView();
                                    }}
                                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 ${index === currentIndex
                                        ? 'border-maroon ring-4 ring-maroon/30 scale-110'
                                        : 'border-slate-300 dark:border-slate-600 hover:border-maroon/50'
                                        }`}
                                >
                                    <img
                                        src={image.url || image}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    {/* Close Button */}
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 p-4 rounded-full transition-all z-10 group"
                        aria-label="Close fullscreen"
                    >
                        <X className="h-7 w-7 text-white group-hover:rotate-90 transition-transform" />
                    </button>

                    {/* Fullscreen Image */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            src={currentImage.url || currentImage}
                            alt={`${productName} - Fullscreen`}
                            className="max-w-[90vw] max-h-[90vh] object-contain"
                            style={{
                                transform: `rotate(${rotation}deg) scale(${zoom})`,
                            }}
                        />

                        {/* Fullscreen Navigation */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-6 bg-white/20 hover:bg-white/30 p-5 rounded-full transition-all"
                                >
                                    <ChevronLeft className="h-8 w-8 text-white" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-6 bg-white/20 hover:bg-white/30 p-5 rounded-full transition-all"
                                >
                                    <ChevronRight className="h-8 w-8 text-white" />
                                </button>
                            </>
                        )}

                        {/* Fullscreen Counter */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full text-lg font-bold">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Product3DViewer;
