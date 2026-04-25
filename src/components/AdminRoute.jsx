import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protège les pages réservées aux administrateurs (ROLE_ADMIN uniquement).
 * - Non connecté → redirection vers /auth/login/
 * - Connecté ROLE_CLIENT → redirection vers /user/dashboard/
 * - Connecté ROLE_STAFF_MEMBER → redirection vers /staff/dashboard/
 * - Admin → accès accordé
 */
export default function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/auth/login/" replace state={{ from: location }} />;
    }

    if (!user.roles?.includes('ROLE_ADMIN')) {
        // Rediriger vers le dashboard approprié selon le rôle réel de l'utilisateur
        const isClient = user.roles?.includes('ROLE_CLIENT');
        return <Navigate to={isClient ? '/user/dashboard/' : '/staff/dashboard/'} replace />;
    }

    return children;
}
