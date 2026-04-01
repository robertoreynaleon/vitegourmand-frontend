const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^0[1-9][0-9]{8}$/;
const postalCodeRegex = /^[0-9]{5}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{12,}$/;

const normalize = (value) => (value || '').trim();

export function validateEdit(values) {
    const errors = {};

    const name       = normalize(values.name);
    const lastname   = normalize(values.lastname);
    const email      = normalize(values.email);
    const phone      = normalize(values.phone).replace(/\s+/g, '');
    const address    = normalize(values.address);
    const city       = normalize(values.city);
    const postalCode = normalize(values.postalCode);
    const newPwd     = values.new_password || '';
    const confirmPwd = values.password_confirm || '';

    if (!name || name.length < 2)             errors.name       = 'Champ requis.';
    if (!lastname || lastname.length < 2)     errors.lastname   = 'Champ requis.';
    if (!email || !emailRegex.test(email))    errors.email      = 'Email invalide.';
    if (!phone || !phoneRegex.test(phone))    errors.phone      = 'Format invalide (ex : 0612345678).';
    if (!address || address.length < 5)       errors.address    = 'Champ requis.';
    if (!city || city.length < 2)             errors.city       = 'Champ requis.';
    if (!postalCode || !postalCodeRegex.test(postalCode)) errors.postalCode = 'Code postal invalide.';

    // Mot de passe optionnel — validé seulement si l'utilisateur saisit quelque chose
    if (newPwd) {
        if (!passwordRegex.test(newPwd)) {
            errors.new_password = 'Min. 12 caractères avec majuscule, chiffre et caractère spécial.';
        }
        if (newPwd !== confirmPwd) {
            errors.password_confirm = 'Les mots de passe ne correspondent pas.';
        }
    }

    return errors;
}
