/** Expression régulière de validation d'une adresse e-mail. */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Expression régulière de validation d'un numéro de téléphone français (ex. 0612345678). */
const phoneRegex = /^0[1-9][0-9]{8}$/;
/** Expression régulière de validation d'un code postal français (5 chiffres). */
const postalCodeRegex = /^[0-9]{5}$/;
/** Expression régulière : mot de passe min. 8 caractères avec majuscule, chiffre et caractère spécial. */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
/** Lettres (dont accents), espaces, tirets et apostrophes uniquement — pour nom, prénom, ville. */
const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
/** Adresse postale : lettres, chiffres, espaces et ponctuation courante. */
const addressRegex = /^[a-zA-ZÀ-ÿ0-9\s\-',./]+$/

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

    if (!name || name.length < 2 || !nameRegex.test(name)) errors.name = 'Lettres, espaces, tirets et apostrophes uniquement (min. 2 caractères).';
    if (!lastname || lastname.length < 2 || !nameRegex.test(lastname)) errors.lastname = 'Lettres, espaces, tirets et apostrophes uniquement (min. 2 caractères).';
    if (!email || !emailRegex.test(email)) errors.email = 'Adresse e-mail invalide.';
    if (!phone || !phoneRegex.test(phone)) errors.phone = 'Format invalide (ex : 0612345678).';
    if (!address || address.length < 5 || !addressRegex.test(address)) errors.address = 'Adresse invalide (min. 5 caractères, lettres et chiffres).';
    if (!city || city.length < 2 || !nameRegex.test(city)) errors.city = 'Ville invalide (lettres, espaces, tirets uniquement).';
    if (!postalCode || !postalCodeRegex.test(postalCode)) errors.postalCode = 'Code postal invalide (5 chiffres).'
    if (!password || !passwordRegex.test(password)) errors.password = 'Min. 8 caractères avec majuscule, chiffre et caractère spécial.';
    if (!passwordConfirm || passwordConfirm !== password) errors.password_confirm = 'Confirmation invalide.';

    return errors;
}
