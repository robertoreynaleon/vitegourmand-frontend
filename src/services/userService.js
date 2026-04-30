/** URL de base des routes API utilisateur. */
const API_BASE = `${process.env.REACT_APP_API_URL}/api/user`;

/**
 * Met à jour les informations du profil de l'utilisateur connecté.
 * @param {string} token    - Token JWT pour l'authentification
 * @param {object} formData - Données du formulaire (nom, prénom, email, mot de passe...)
 * @returns {Promise<object>} Les données utilisateur mises à jour
 */
export async function updateMe(token, formData) {
    const response = await fetch(`${API_BASE}/me`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
}

/**
 * Supprime le compte de l'utilisateur connecté (suppression définitive).
 * @param {string} token - Token JWT pour l'authentification
 * @returns {Promise<object>} Message de confirmation
 */
export async function deleteAccount(token) {
    const response = await fetch(`${API_BASE}/me`, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
}
