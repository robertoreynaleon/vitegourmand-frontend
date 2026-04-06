import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protège les pages réservées au staff (ROLE_STAFF_MEMBER ou ROLE_ADMIN).
 * - Non connecté  → redirection vers /auth/login/
 * - Connecté CLIENT → redirection vers /user/dashboard/
 * - Staff / Admin  → accès accordé
 */
export default function StaffRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/auth/login/" replace state={{ from: location }} />;
    }

    const roles = user.roles ?? [];
    const isStaff =
        roles.includes('ROLE_STAFF_MEMBER') || roles.includes('ROLE_ADMIN');

    if (!isStaff) {
        return <Navigate to="/user/dashboard/" replace />;
    }

    return children;
}
