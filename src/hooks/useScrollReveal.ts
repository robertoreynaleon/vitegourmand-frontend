// Ce fichier Typescript gère l'apparition progressive des sections au scroll (IntersectionObserver)

import { useRef } from 'react';
import { useInView } from 'framer-motion';

interface ScrollRevealOptions {
    /** Seuil de visibilité entre 0 et 1 (défaut : 0.1) */
    threshold?: number;
    /** Déclencher l'animation une seule fois (défaut : true) */
    once?: boolean;
    /** Marge autour de la zone de détection (défaut : "0px 0px -80px 0px") */
    margin?: string;
}

/**
 * Hook qui retourne une ref et un booléen `isVisible`.
 * Utilisé avec les variants framer-motion dans HomePage.jsx.
 */
export function useScrollReveal(options: ScrollRevealOptions = {}) {
    const {
        threshold = 0.1,
        once = true,
        margin = '0px 0px -80px 0px',
    } = options;

    const ref = useRef<HTMLElement>(null);
    const isVisible = useInView(ref, {
        once,
        amount: threshold,
        margin: margin as `${number}px ${number}px ${number}px ${number}px`,
    });

    return { ref, isVisible };
}

/** Variants réutilisables pour framer-motion — fadeUp (comme home.js) */
export const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};

/** Variant avec délai pour les cartes (stagger) */
export const staggerContainerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15,
        },
    },
};
