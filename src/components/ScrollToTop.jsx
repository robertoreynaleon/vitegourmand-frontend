import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Composant utilitaire de gestion du scroll lors des changements de route.
 * - Si l'URL contient un hash (#section), fait défiler jusqu'à la section cible.
 *   Un délai de 80ms laisse le temps à la page de rendu avant de chercher l'élément.
 * - Sans hash, remet la fenêtre en haut de page (comportement par défaut).
 * Doit être placé juste à l'intérieur du composant BrowserRouter.
 * Ne rend aucun élément HTML visible.
 */
export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            // Laisser le temps à la page cible de se rendre avant de chercher l'élément
            const timer = setTimeout(() => {
                const el = document.querySelector(hash);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                }
            }, 80);
            return () => clearTimeout(timer);
        }

        window.scrollTo(0, 0);
    }, [pathname, hash]);

    return null;
}
