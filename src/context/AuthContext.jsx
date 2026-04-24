import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/** Contexte React partagé dans toute l'application pour l'authentification. */
const AuthContext = createContext(null);

/**
 * Fournisseur du contexte d'authentification.
 * Gère l'utilisateur connecté et son token JWT en mémoire et dans localStorage.
 * Expose : user, token, login(), logout(), updateUser(), loading.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restaure la session depuis localStorage au démarrage
    useEffect(() => {
        const storedToken = localStorage.getItem('jwt_token');
        const storedUser = localStorage.getItem('auth_user');
        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('auth_user');
            }
        }
        setLoading(false);
    }, []);

    /**
     * Connecte l'utilisateur : stocke ses données et le token JWT
     * en mémoire React et dans localStorage pour persistance entre recharges.
     */
    const login = (userData, jwtToken) => {
        setToken(jwtToken);
        setUser(userData);
        localStorage.setItem('jwt_token', jwtToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));
    };

    /**
     * Déconnecte l'utilisateur : vide l'état React et supprime les données localStorage.
     */
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('auth_user');
    };

    /**
     * Met à jour les données utilisateur (après édition de profil par exemple)
     * sans toucher au token JWT.
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
