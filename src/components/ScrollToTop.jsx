import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Composant utilitaire de remise à zéro du scroll.
 * Détecte chaque changement de route via useLocation et force la fenêtre
 * à défiler en haut (position 0, 0) lors de chaque navigation.
 * Doit être placé juste à l'intérieur du composant BrowserRouter
 * pour être actif sur toutes les pages de l'application.
 * Ne rend aucun élément HTML visible.
 */
export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
