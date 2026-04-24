import axios from 'axios';

/** URL de base de l'API Symfony. */
const API_URL = 'http://vitegourmand.local';

/**
 * Envoie les identifiants au serveur et retourne le token JWT et les données utilisateur.
 * Lève une exception si les identifiants sont invalides (401) ou en cas d'erreur réseau.
 */
export async function loginUser(email, password) {
    const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
    });

    return {
        token: response.data.token,
        user: response.data.user,
    };
}
