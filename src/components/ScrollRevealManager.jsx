import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollRevealManager = () => {
    const location = useLocation();

    useEffect(() => {
        // Animate all elements inside main
        const selectorList = [
            'main', // Animate main itself
            'main > *', // Animate all direct children of main
            'main *', // All descendants of main
        ];

        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll(selectorList.join(',')).forEach(el =>
                el.classList.add('reveal-visible')
            );
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('reveal-visible');
                        observer.unobserve(entry.target); // reveal ONCE
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -10% 0px',
            }
        );

        const applyReveal = () => {
            document.querySelectorAll(selectorList.join(',')).forEach((el) => {
                if (el.dataset.revealInit === 'true') return;
                el.dataset.revealInit = 'true';
                observer.observe(el);
            });
        };

        applyReveal();

        return () => observer.disconnect();
    }, [location.pathname]);

    return null;
};

export default ScrollRevealManager;
