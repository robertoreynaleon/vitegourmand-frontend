/** Expression régulière de validation d'une adresse e-mail. */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Expression régulière de validation d'un numéro de téléphone français (ex. 0612345678). */
const phoneRegex = /^0[1-9][0-9]{8}$/;
/** Expression régulière de validation d'un code postal français (5 chiffres). */
const postalCodeRegex = /^[0-9]{5}$/;

/** Normalise une valeur en chaîne trimée, jamais null/undefined. */
const normalize = (value) => (value || '').trim();

/**
 * Valide les champs du formulaire d'inscription.
 * Retourne un objet contenant les messages d'erreur par champ.
 * L'objet est vide si le formulaire est valide.
 * @param {object} values - Valeurs du formulaire (name, lastname, email, phone, address, city, postalCode, password, password_confirm)
 * @returns {object} Objet d'erreurs { champ: message }
 */
export function validateRegister(values) {
    const errors = {};

    const name = normalize(values.name);
    const lastname = normalize(values.lastname);
    const email = normalize(values.email);
    const phone = normalize(values.phone).replace(/\s+/g, '');
    const address = normalize(values.address);
    const city = normalize(values.city);
    const postalCode = normalize(values.postalCode);
    const password = values.password || '';
    const passwordConfirm = values.password_confirm || '';

    if (!name) errors.name = 'Champ requis.';
    if (!lastname) errors.lastname = 'Champ requis.';
    if (!email || !emailRegex.test(email)) errors.email = 'Champ requis.';
    if (!phone || !phoneRegex.test(phone)) errors.phone = 'Champ requis.';
    if (!address) errors.address = 'Champ requis.';
    if (!city) errors.city = 'Champ requis.';
    if (!postalCode || !postalCodeRegex.test(postalCode)) errors.postalCode = 'Champ requis.';
    if (!password || password.length < 12) errors.password = 'Mot de passe invalide.';
    if (!passwordConfirm || passwordConfirm !== password) errors.password_confirm = 'Confirmation invalide.';

    return errors;
}
