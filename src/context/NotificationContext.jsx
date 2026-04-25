import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Contexte global de notifications toast.
 * Permet d'afficher des messages ephemeres (succes, erreur) depuis n'importe quelle page.
 * Expose : showNotification(message, type?, duration?)
 */
const NotificationContext = createContext(null);

/** Compteur interne pour generer des identifiants uniques par notification. */
let nextId = 0;

/**
 * Fournisseur du contexte de notifications.
 * A placer en dehors de AuthProvider pour que les toasts survivent aux redirections
 * post-connexion et post-deconnexion.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    /**
     * Affiche une notification toast.
     *
     * @param {string}  message  Texte visible par l'utilisateur
     * @param {'success'|'error'} [type='success']  Type visuellement distinct
     * @param {number}  [duration=4500]  Duree totale en ms (animation de sortie incluse)
     */
    const showNotification = useCallback((message, type = 'success', duration = 4500) => {
        const id = ++nextId;
        setNotifications((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    /**
     * Supprime une notification de la liste par son identifiant.
     * Appelee par le composant Toast apres l'animation de sortie.
     *
     * @param {number} id
     */
    const dismissNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, showNotification, dismissNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}

/**
 * Hook utilitaire pour acceder au contexte de notifications.
 * Usage : const { showNotification } = useNotification();
 */
export function useNotification() {
    return useContext(NotificationContext);
}
