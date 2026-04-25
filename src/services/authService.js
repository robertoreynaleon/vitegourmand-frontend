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

/**
 * Envoie une demande de réinitialisation de mot de passe pour l'e-mail donné.
 * Retourne toujours un message neutre côté serveur (anti-énumération).
 *
 * @param {string} email Adresse e-mail de l'utilisateur
 * @returns {Promise<{message: string}>}
 */
export async function forgotPassword(email) {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
}

/**
 * Réinitialise le mot de passe à partir d'un token valide.
 *
 * @param {string} token    Token reçu par e-mail
 * @param {string} password Nouveau mot de passe
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function resetPassword(token, password) {
    const response = await axios.post(`${API_URL}/auth/reset-password`, { token, password });
    return response.data;
}
