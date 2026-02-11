import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollRevealManager = () => {
    const location = useLocation();

    useEffect(() => {
        // Target elements with specific animation classes
        const selector = '.reveal, .reveal-left, .reveal-right, .reveal-up, .reveal-down, .reveal-scale';

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    } else {
                        entry.target.classList.remove('active');
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
