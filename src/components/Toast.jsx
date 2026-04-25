import React, { useEffect, useState, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import './Toast.scss';

// Duree de l'animation de sortie en ms — doit correspondre a $toast-exit-duration dans Toast.scss
const EXIT_DURATION = 350;

/**
 * Icone de succes (coche dans un cercle).
 */
function IconSuccess() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            width="20"
            height="20"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="9 12 11 14 15 10" />
        </svg>
    );
}

/**
 * Icone d'erreur/information (croix dans un cercle).
 */
function IconError() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            width="20"
            height="20"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    );
}

/**
 * Icone de fermeture (croix simple).
 */
function IconClose() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            width="14"
            height="14"
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

/**
 * Toast individuel avec auto-dismiss et bouton de fermeture manuel.
 * Lance l'animation de sortie avant de se retirer de la liste.
 *
 * @param {{ id: number, message: string, type: 'success'|'error', duration: number }} props
 */
function ToastItem({ id, message, type, duration }) {
    const { dismissNotification } = useNotification();
    const [exiting, setExiting] = useState(false);

    /** Declenche l'animation de sortie puis supprime le toast du contexte. */
    const handleDismiss = useCallback(() => {
        setExiting(true);
        setTimeout(() => dismissNotification(id), EXIT_DURATION);
    }, [dismissNotification, id]);

    // Lance le minuteur d'auto-dismiss : animation de sortie demarre avant la fin du delai total
    useEffect(() => {
        const timer = setTimeout(handleDismiss, duration - EXIT_DURATION);
        return () => clearTimeout(timer);
    }, [duration, handleDismiss]);

    return (
        <div
            className={`toast toast--${type}${exiting ? ' is-exiting' : ''}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            <span className="toast__icon" aria-hidden="true">
                {type === 'success' ? <IconSuccess /> : <IconError />}
            </span>

            <span className="toast__message">{message}</span>

            <button
                type="button"
                className="toast__close"
                onClick={handleDismiss}
                aria-label="Fermer la notification"
            >
                <IconClose />
            </button>
        </div>
    );
}

/**
 * Conteneur de notifications toast.
 * A rendre une seule fois dans l'arbre React (dans App.js, au-dessus des routes).
 * Affiche une pile de toasts en haut a droite de l'ecran.
 */
function Toast() {
    const { notifications } = useNotification();

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div
            className="toast-container"
            // region permet aux lecteurs d'ecran de naviguer vers ce bloc
            role="region"
            aria-label="Notifications"
        >
            {notifications.map((n) => (
                <ToastItem key={n.id} {...n} />
            ))}
        </div>
    );
}

export default Toast;
