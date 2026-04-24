import React from 'react';
import './PageLoader.scss';

/**
 * Indicateur de chargement pleine page.
 * Affiche une animation et un message personnalisable (par défaut « Chargement en cours... »).
 * Accessible : utilise role="status" et aria-live pour les lecteurs d'écran.
 * @param {string} [message] - Texte affiché sous l'animation
 */
function PageLoader({ message = 'Chargement en cours...' }) {
    return (
        <div className="page-loader" role="status" aria-live="polite">
            <div className="page-loader-inner">
                <div className="page-loader-icon" aria-hidden="true"></div>
                <p className="page-loader-text">{message}</p>
            </div>
        </div>
    );
}

export default PageLoader;
