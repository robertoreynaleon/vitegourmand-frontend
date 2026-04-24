import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Composant de protection de route pour les utilisateurs connectés.
 * Si l'utilisateur n'est pas authentifié, il est redirigé vers la page de connexion.
 * La page d'origine est conservée dans l'état de navigation pour y revenir après connexion.
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

    return children;
}
