// Ce fichier Typescript gère l'effet de défilement du header et le smooth scroll vers les ancres

import { useState, useEffect } from 'react';

interface ScrollHeaderState {
    scrolled: boolean;
    scrollY: number;
}

/**
 * Hook qui détecte le scroll pour appliquer l'effet "scrolled" au header.
 */
export function useScrollHeader(): ScrollHeaderState {
    const [state, setState] = useState<ScrollHeaderState>({
        scrolled: false,
        scrollY: 0,
    });

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.pageYOffset;
            setState({
                scrolled: currentScroll > 100,
                scrollY: currentScroll,
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return state;
}

/**
 * Smooth scroll vers une ancre en tenant compte de la hauteur du header.
 */
export function scrollToAnchor(href: string, headerHeight: number = 0): void {
    const target = document.querySelector(href);
    if (target) {
        const targetPosition =
            (target as HTMLElement).getBoundingClientRect().top +
            window.pageYOffset -
            headerHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
}
