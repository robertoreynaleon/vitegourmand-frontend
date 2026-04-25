import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

/** Contexte React partagé dans toute l'application pour l'authentification. */
const AuthContext = createContext(null);

/**
 * Décode le payload d'un JWT (base64url → JSON) et retourne la date d'expiration
 * en millisecondes (Unix timestamp × 1000).
 * Ne vérifie pas la signature côté client — c'est le rôle du serveur Symfony.
 * Retourne null si le token est mal formé ou ne contient pas de claim « exp ».
 *
 * @param {string} token Token JWT à décoder
 * @returns {number|null} Timestamp d'expiration en ms, ou null
 */
function getJwtExpiryMs(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
}

/**
 * Fournisseur du contexte d'authentification.
 * Gère l'utilisateur connecté et son token JWT en mémoire et dans localStorage.
 * Déconnecte automatiquement l'utilisateur à l'expiration du JWT (TTL : 8h côté Symfony).
 * Expose : user, token, login(), logout(), updateUser(), loading.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    /** Référence vers le timer setTimeout de déconnexion automatique. */
    const expiryTimerRef = useRef(null);

    /**
     * Action interne de déconnexion (vide état React + localStorage).
     * Réutilisée à la fois par logout() et par le timer d'expiration.
     */
    const clearSession = useCallback(() => {
        if (expiryTimerRef.current) {
            clearTimeout(expiryTimerRef.current);
            expiryTimerRef.current = null;
        }
        setToken(null);
        setUser(null);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('auth_user');
    }, []);

    /**
     * Planifie une déconnexion automatique au moment exact où le JWT expire.
     * Si le token est déjà expiré, déclenche la déconnexion immédiatement.
     *
     * @param {string} jwtToken Token JWT dont on lit le claim « exp »
     */
    const scheduleAutoLogout = useCallback((jwtToken) => {
        const expiryMs = getJwtExpiryMs(jwtToken);
        if (!expiryMs) return;

        const delay = expiryMs - Date.now();

        if (delay <= 0) {
            // Token déjà expiré : nettoyage immédiat
            clearSession();
            return;
        }

        // Annuler tout timer précédent avant d'en créer un nouveau
        if (expiryTimerRef.current) {
            clearTimeout(expiryTimerRef.current);
        }

        // setTimeout est limité à ~24.8 jours (MAX_INT_32 ms) — largement suffisant pour 8h
        expiryTimerRef.current = setTimeout(clearSession, delay);
    }, [clearSession]);

    // Restaure la session depuis localStorage au démarrage de l'application
    useEffect(() => {
        const storedToken = localStorage.getItem('jwt_token');
        const storedUser  = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            try {
                // Vérifier si le JWT est déjà expiré avant de restaurer la session
                const expiryMs = getJwtExpiryMs(storedToken);
                if (expiryMs && Date.now() >= expiryMs) {
                    // Token expiré pendant l'absence de l'utilisateur — on nettoie
                    localStorage.removeItem('jwt_token');
                    localStorage.removeItem('auth_user');
                } else {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    // Planifier la déconnexion automatique pour la durée restante
                    scheduleAutoLogout(storedToken);
                }
            } catch {
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('auth_user');
            }
        }

        setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Connecte l'utilisateur : stocke ses données et le token JWT
     * en mémoire React et dans localStorage pour persistance entre recharges.
     * Planifie la déconnexion automatique à l'expiration du JWT.
     */
    const login = useCallback((userData, jwtToken) => {
        setToken(jwtToken);
        setUser(userData);
        localStorage.setItem('jwt_token', jwtToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        // Programmer le logout automatique à l'expiration du nouveau token
        scheduleAutoLogout(jwtToken);
    }, [scheduleAutoLogout]);

    /**
     * Déconnecte l'utilisateur : vide l'état React, supprime les données localStorage
     * et annule le timer d'expiration en cours.
     */
    const logout = useCallback(() => {
        clearSession();
    }, [clearSession]);

    /**
     * Met à jour les données utilisateur (après édition de profil par exemple)
     * sans toucher au token JWT ni au timer d'expiration.
     */
    const updateUser = useCallback((userData) => {
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook utilitaire pour accéder au contexte d'authentification depuis n'importe quel composant.
 * Usage : const { user, token, login, logout } = useAuth();
 */
export function useAuth() {
    return useContext(AuthContext);
}
