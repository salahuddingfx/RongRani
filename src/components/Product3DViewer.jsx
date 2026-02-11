import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, X, RotateCw } from 'lucide-react';

const Product3DViewer = ({ images = [], productName = '' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [autoRotate, setAutoRotate] = useState(false);
    const imageRef = useRef(null);
    const containerRef = useRef(null);

    // Auto-rotate effect
    useEffect(() => {
        if (autoRotate && images.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [autoRotate, images.length]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, isFullscreen]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        setRotation(0);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setRotation(0);
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.clientX);
        setAutoRotate(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const rotationChange = deltaX * 0.5;
        setRotation((prev) => prev + rotationChange);
        setStartX(e.clientX);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartX(e.touches[0].clientX);
        setAutoRotate(false);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;

        const deltaX = e.touches[0].clientX - startX;
        const rotationChange = deltaX * 0.5;
        setRotation((prev) => prev + rotationChange);
        setStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const toggleZoom = () => {
        setIsZoomed(!isZoomed);
    };

    const toggleAutoRotate = () => {
        setAutoRotate(!autoRotate);
    };

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                <p className="text-slate-400">No images available</p>
            </div>
        );
    }

    const currentImage = images[currentIndex];

    return (
        <>
            {/* Main Viewer */}
            <div
                ref={containerRef}
                className="relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl"
            >
                {/* Main Image Container */}
                <div
                    className={`relative aspect-square overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <img
                        ref={imageRef}
                        src={currentImage.url || currentImage}
                        alt={`${productName} - Image ${currentIndex + 1}`}
                        className={`w-full h-full object-contain transition-all duration-300 ${isZoomed ? 'scale-150' : 'scale-100'
                            }`}
                        style={{
                            transform: `rotate(${rotation}deg) scale(${isZoomed ? 1.5 : 1})`,
                            transition: isDragging ? 'none' : 'transform 0.3s ease'
                        }}
                        draggable={false}
                    />

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 p-2 md:p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-all z-10"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-slate-700 dark:text-white" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 p-2 md:p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-all z-10"
                                aria-label="Next image"
                            >
                                <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-slate-700 dark:text-white" />
                            </button>
                        </>
                    )}

                    {/* Control Buttons */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                        <button
                            onClick={toggleZoom}
                            className={`bg-white/90 dark:bg-slate-800/90 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-all ${isZoomed ? 'bg-maroon text-white' : ''
                                }`}
                            aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
                        >
                            {isZoomed ? (
                                <ZoomOut className="h-4 w-4 md:h-5 md:w-5" />
                            ) : (
                                <ZoomIn className="h-4 w-4 md:h-5 md:w-5 text-slate-700 dark:text-white" />
                            )}
                        </button>

                        <button
                            onClick={toggleAutoRotate}
                            className={`bg-white/90 dark:bg-slate-800/90 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-all ${autoRotate ? 'bg-maroon text-white' : ''
                                }`}
                            aria-label="Toggle auto-rotate"
                        >
                            <RotateCw className={`h-4 w-4 md:h-5 md:w-5 ${autoRotate ? 'animate-spin' : 'text-slate-700 dark:text-white'}`} />
                        </button>

                        <button
                            onClick={() => setIsFullscreen(true)}
                            className="bg-white/90 dark:bg-slate-800/90 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-all"
                            aria-label="Fullscreen"
                        >
                            <Maximize2 className="h-4 w-4 md:h-5 md:w-5 text-slate-700 dark:text-white" />
                        </button>
                    </div>

                    {/* Image Counter */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                        {currentIndex + 1} / {images.length}
                    </div>

                    {/* Drag Hint */}
                    {!isDragging && rotation === 0 && (
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-xs animate-bounce">
                            👆 Drag to rotate
                        </div>
                    )}
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentIndex(index);
                                        setRotation(0);
                                    }}
                                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                                            ? 'border-maroon ring-2 ring-maroon/30'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-maroon/50'
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
                <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all z-10"
                        aria-label="Close fullscreen"
                    >
                        <X className="h-6 w-6 text-white" />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            src={currentImage.url || currentImage}
                            alt={`${productName} - Fullscreen`}
                            className="max-w-full max-h-full object-contain"
                            style={{
                                transform: `rotate(${rotation}deg)`,
                            }}
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-4 bg-white/20 hover:bg-white/30 p-4 rounded-full transition-all"
                                >
                                    <ChevronLeft className="h-8 w-8 text-white" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-4 bg-white/20 hover:bg-white/30 p-4 rounded-full transition-all"
                                >
                                    <ChevronRight className="h-8 w-8 text-white" />
                                </button>
                            </>
                        )}

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white px-6 py-3 rounded-full text-lg font-medium backdrop-blur-sm">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Product3DViewer;
