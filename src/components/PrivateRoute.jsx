import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Composant de protection de route réservée aux clients (ROLE_CLIENT).
 * - Non connecté → redirection vers /auth/login/ (avec conservation de la page d'origine)
 * - Staff ou Admin connecté → redirection vers /staff/dashboard/ (pas d'accès client)
 * - Client → accès accordé
 * Pendant le chargement initial de la session, rien n'est rendu (null).
 */
export default function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // Session en cours de restauration : ne pas rendre la page ni rediriger
        return null;
    }

    if (!user) {
        return <Navigate to="/auth/login/" replace state={{ from: location }} />;
    }

    const roles = user.roles ?? [];

    // Les employés et administrateurs n'ont pas accès aux pages client
    if (roles.includes('ROLE_STAFF_MEMBER') || roles.includes('ROLE_ADMIN')) {
        return <Navigate to="/staff/dashboard/" replace />;
    }

    return children;
}
