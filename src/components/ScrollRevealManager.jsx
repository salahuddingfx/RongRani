import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollRevealManager = () => {
    const location = useLocation();

    useEffect(() => {
        // Respect user's reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) {
            return;
        }

        // Target elements with specific animation classes
        const selector = '.reveal, .reveal-left, .reveal-right, .reveal-up, .reveal-down, .reveal-scale';

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        // Optimization: Stop observing once revealed to improve performance
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px',
            }
        );

        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [location.pathname]);

    return null;
};

export default ScrollRevealManager;
