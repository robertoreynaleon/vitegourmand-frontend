const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^0[1-9][0-9]{8}$/;
const postalCodeRegex = /^[0-9]{5}$/;

const normalize = (value) => (value || '').trim();

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
