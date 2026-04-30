import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import './UserCreate.scss';

/** URL de l'API de gestion des employés (admin). */
const API_BASE = `${process.env.REACT_APP_API_URL}/api/admin/staff`;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^0[1-9][0-9]{8}$/;
const postalCodeRegex = /^[0-9]{5}$/;

const EMPTY_FORM = {
    name: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    password: '',
    password_confirm: '',
};

function validateForm(values) {
    const errors = {};
    const trim = (v) => (v || '').trim();
    const phone = trim(values.phone).replace(/\s+/g, '');

    if (trim(values.name).length < 2)                            errors.name = 'Champ requis.';
    if (trim(values.lastname).length < 2)                        errors.lastname = 'Champ requis.';
    if (!emailRegex.test(trim(values.email)))                    errors.email = 'Adresse e-mail invalide.';
    if (!phoneRegex.test(phone))                                 errors.phone = 'Numéro invalide (ex: 0612345678).';
    if (trim(values.address).length < 5)                         errors.address = 'Champ requis.';
    if (trim(values.city).length < 2)                            errors.city = 'Champ requis.';
    if (!postalCodeRegex.test(trim(values.postalCode)))          errors.postalCode = 'Code postal invalide.';
    if ((values.password || '').length < 12)                     errors.password = 'Minimum 12 caractères.';
    if (values.password_confirm !== values.password)             errors.password_confirm = 'Les mots de passe ne correspondent pas.';

    return errors;
}

/**
 * Page de gestion des employés (admin uniquement).
 * Permet à l'administrateur de voir la liste des employés, de créer
 * un nouveau compte staff et de supprimer un compte existant.
 */
function UserCreate() {
    const { token } = useAuth();

    // ── Form state ────────────────────────────────────────────────────────
    const [formValues, setFormValues] = useState(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    // ── Staff list state ──────────────────────────────────────────────────
    const [staffList, setStaffList] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState('');

    // ── Delete confirm ────────────────────────────────────────────────────
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');

    // ── Fetch staff list ──────────────────────────────────────────────────
    const fetchStaff = useCallback(async () => {
        setListLoading(true);
        setListError('');
        try {
            const res = await fetch(API_BASE, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Erreur lors du chargement.');
            setStaffList(await res.json());
        } catch {
            setListError('Impossible de charger la liste des employés.');
        } finally {
            setListLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
        setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm(formValues);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            const first = Object.keys(errors)[0];
            e.currentTarget.querySelector(`[name="${first}"]`)?.focus();
            return;
        }
        setFormErrors({});
        setServerError('');
        setIsSubmitting(true);

        try {
            const res = await fetch(API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name:       formValues.name.trim(),
                    lastname:   formValues.lastname.trim(),
                    email:      formValues.email.trim().toLowerCase(),
                    phone:      formValues.phone.trim().replace(/\s+/g, ''),
                    address:    formValues.address.trim(),
                    city:       formValues.city.trim(),
                    postalCode: formValues.postalCode.trim(),
                    password:   formValues.password,
                }),
            });

            if (res.status === 409) {
                setServerError('Cette adresse e-mail est déjà utilisée.');
                return;
            }
            if (!res.ok) {
                setServerError('Une erreur est survenue. Veuillez réessayer.');
                return;
            }

            const created = await res.json();
            setStaffList((prev) => [...prev, created]);
            setFormValues(EMPTY_FORM);
            setSuccessMsg(`Employé ${created.name} ${created.lastname} ajouté avec succès.`);
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch {
            setServerError('Impossible de contacter le serveur. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!confirmDeleteId) return;
        setIsDeleting(true);
        setDeleteError('');

        try {
            const res = await fetch(`${API_BASE}/${confirmDeleteId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            const deleted = staffList.find((u) => u.id === confirmDeleteId);
            setStaffList((prev) => prev.filter((u) => u.id !== confirmDeleteId));
            setConfirmDeleteId(null);
            if (deleted) {
                setDeleteSuccessMsg(`Employé ${deleted.name} ${deleted.lastname} supprimé avec succès.`);
                setTimeout(() => setDeleteSuccessMsg(''), 5000);
            }
        } catch {
            setDeleteError('Une erreur est survenue lors de la suppression.');
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmTarget = staffList.find((u) => u.id === confirmDeleteId);

    return (
        <div className="user-create-page">
            <Header />

            <main>
                {/* ── Section formulaire ──────────────────────────────────── */}
                <section className="user-create-section" aria-labelledby="create-section-title">
                    <div className="container">
                        <div className="user-create-form-wrapper">
                            <h1 id="create-section-title" className="user-create-title">
                                Ajouter un employé
                            </h1>
                            <p className="user-create-subtitle">
                                Le nouvel employé recevra un e-mail lui indiquant que son compte a été créé.
                            </p>

                            {serverError && (
                                <p className="form-error form-error--server" role="alert" aria-live="assertive">
                                    {serverError}
                                </p>
                            )}
                            {successMsg && (
                                <p className="user-create-success" role="status" aria-live="polite">
                                    {successMsg}
                                </p>
                            )}

                            <form className="form-main" onSubmit={handleSubmit} noValidate>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="name" className="form-label">Prénom</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            className="form-input-field"
                                            autoComplete="given-name"
                                            value={formValues.name}
                                            onChange={handleChange}
                                            aria-invalid={Boolean(formErrors.name)}
                                            aria-describedby={formErrors.name ? 'name-error' : undefined}
                                            required
                                        />
                                        {formErrors.name && (
                                            <p id="name-error" className="form-error" aria-live="polite">
                                                {formErrors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="lastname" className="form-label">Nom</label>
                                        <input
                                            type="text"
                                            id="lastname"
                                            name="lastname"
                                            className="form-input-field"
                                            autoComplete="family-name"
                                            value={formValues.lastname}
                                            onChange={handleChange}
                                            aria-invalid={Boolean(formErrors.lastname)}
                                            aria-describedby={formErrors.lastname ? 'lastname-error' : undefined}
                                            required
                                        />
                                        {formErrors.lastname && (
                                            <p id="lastname-error" className="form-error" aria-live="polite">
                                                {formErrors.lastname}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">Adresse e-mail</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="form-input-field"
                                        autoComplete="email"
                                        value={formValues.email}
                                        onChange={handleChange}
                                        aria-invalid={Boolean(formErrors.email)}
                                        aria-describedby={formErrors.email ? 'email-error' : undefined}
                                        required
                                    />
                                    {formErrors.email && (
                                        <p id="email-error" className="form-error" aria-live="polite">
                                            {formErrors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone" className="form-label">Téléphone mobile</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        className="form-input-field"
                                        autoComplete="tel"
                                        value={formValues.phone}
                                        onChange={handleChange}
                                        aria-invalid={Boolean(formErrors.phone)}
                                        aria-describedby={formErrors.phone ? 'phone-error' : undefined}
                                        required
                                    />
                                    {formErrors.phone && (
                                        <p id="phone-error" className="form-error" aria-live="polite">
                                            {formErrors.phone}
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="address" className="form-label">Adresse</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        className="form-input-field"
                                        autoComplete="street-address"
                                        value={formValues.address}
                                        onChange={handleChange}
                                        aria-invalid={Boolean(formErrors.address)}
                                        aria-describedby={formErrors.address ? 'address-error' : undefined}
                                        required
                                    />
                                    {formErrors.address && (
                                        <p id="address-error" className="form-error" aria-live="polite">
                                            {formErrors.address}
                                        </p>
                                    )}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="city" className="form-label">Ville</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            className="form-input-field"
                                            autoComplete="address-level2"
                                            value={formValues.city}
                                            onChange={handleChange}
                                            aria-invalid={Boolean(formErrors.city)}
                                            aria-describedby={formErrors.city ? 'city-error' : undefined}
                                            required
                                        />
                                        {formErrors.city && (
                                            <p id="city-error" className="form-error" aria-live="polite">
                                                {formErrors.city}
                                            </p>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="postalCode" className="form-label">Code postal</label>
                                        <input
                                            type="text"
                                            id="postalCode"
                                            name="postalCode"
                                            className="form-input-field"
                                            autoComplete="postal-code"
                                            value={formValues.postalCode}
                                            onChange={handleChange}
                                            aria-invalid={Boolean(formErrors.postalCode)}
                                            aria-describedby={formErrors.postalCode ? 'postalCode-error' : undefined}
                                            required
                                        />
                                        {formErrors.postalCode && (
                                            <p id="postalCode-error" className="form-error" aria-live="polite">
                                                {formErrors.postalCode}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password" className="form-label">Mot de passe</label>
                                    <div className="form-password-row">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            className="form-input-field form-input-field--with-toggle"
                                            autoComplete="new-password"
                                            value={formValues.password}
                                            onChange={handleChange}
                                            aria-invalid={Boolean(formErrors.password)}
                                            aria-describedby={formErrors.password ? 'password-error' : 'password-hint'}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="form-password-toggle"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                        >
                                            {showPassword ? (
                                                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                                    <path d="M3 12c2.7-4.5 6.2-7 9-7s6.3 2.5 9 7c-2.7 4.5-6.2 7-9 7s-6.3-2.5-9-7z" fill="none" stroke="currentColor" strokeWidth="2" />
                                                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                                    <path d="M2 5l20 14" fill="none" stroke="currentColor" strokeWidth="2" />
                                                    <path d="M4.5 7.5C3.6 8.7 2.9 10.1 2.2 12c2.7 4.5 6.2 7 9 7 1.5 0 3-.4 4.4-1.1" fill="none" stroke="currentColor" strokeWidth="2" />
                                                    <path d="M9.5 9.8a3.2 3.2 0 0 0 4.7 4.4" fill="none" stroke="currentColor" strokeWidth="2" />
                                                    <path d="M19.8 12c-.7-1.8-1.4-3.2-2.3-4.4" fill="none" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <p id="password-hint" className="form-hint">Minimum 12 caractères.</p>
                                    {formErrors.password && (
                                        <p id="password-error" className="form-error" aria-live="polite">
                                            {formErrors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password_confirm" className="form-label">Confirmer le mot de passe</label>
                                    <div className="form-password-row">
                                        <input
                                            type={showPasswordConfirm ? 'text' : 'password'}
                                            id="password_confirm"
                                            name="password_confirm"
                                            className="form-input-field form-input-field--with-toggle"
                                            autoComplete="new-password"
                                            value={formValues.password_confirm}
                                            onChange={handleChange}
                                            aria-invalid={Boolean(formErrors.password_confirm)}
                                            aria-describedby={formErrors.password_confirm ? 'password-confirm-error' : undefined}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="form-password-toggle"
                                            onClick={() => setShowPasswordConfirm((prev) => !prev)}
                                            aria-label={showPasswordConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                        >
                                            {showPasswordConfirm ? (
                                                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                                    <path d="M3 12c2.7-4.5 6.2-7 9-7s6.3 2.5 9 7c-2.7 4.5-6.2 7-9 7s-6.3-2.5-9-7z" fill="none" stroke="currentColor" strokeWidth="2" />
                                                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                                    <path d="M2 5l20 14" fill="none" stroke="currentColor" strokeWidth="2" />
                                                    <path d="M4.5 7.5C3.6 8.7 2.9 10.1 2.2 12c2.7 4.5 6.2 7 9 7 1.5 0 3-.4 4.4-1.1" fill="none" stroke="currentColor" strokeWidth="2" />
                                                    <path d="M9.5 9.8a3.2 3.2 0 0 0 4.7 4.4" fill="none" stroke="currentColor" strokeWidth="2" />
                                                    <path d="M19.8 12c-.7-1.8-1.4-3.2-2.3-4.4" fill="none" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {formErrors.password_confirm && (
                                        <p id="password-confirm-error" className="form-error" aria-live="polite">
                                            {formErrors.password_confirm}
                                        </p>
                                    )}
                                </div>

                                <button type="submit" className="form-btn-submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Enregistrement...' : 'Ajouter l\'employé'}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* ── Section liste des employés ───────────────────────────── */}
                <section className="user-create-list-section" aria-labelledby="staff-list-title">
                    <div className="container">
                        <h2 id="staff-list-title" className="user-create-list-title">
                            Membres du staff
                        </h2>

                        {deleteSuccessMsg && (
                            <p className="user-create-success" role="status" aria-live="polite">
                                {deleteSuccessMsg}
                            </p>
                        )}

                        {listLoading && (
                            <p className="user-create-loading" aria-live="polite">Chargement...</p>
                        )}

                        {listError && (
                            <p className="form-error" role="alert">{listError}</p>
                        )}

                        {!listLoading && !listError && staffList.length === 0 && (
                            <p className="user-create-empty">Aucun employé enregistré pour le moment.</p>
                        )}

                        {!listLoading && staffList.length > 0 && (
                            <ul className="staff-list" aria-label="Liste des employés">
                                {staffList.map((employee) => (
                                    <li key={employee.id} className="staff-list__item">
                                        <div className="staff-list__info">
                                            <span className="staff-list__name">
                                                {employee.name} {employee.lastname}
                                            </span>
                                            <span className="staff-list__email">{employee.email}</span>
                                            {employee.phone && (
                                                <span className="staff-list__phone">{employee.phone}</span>
                                            )}
                                            {(employee.address || employee.city) && (
                                                <span className="staff-list__address">
                                                    {[employee.address, employee.postalCode && employee.city
                                                        ? `${employee.postalCode} ${employee.city}`
                                                        : employee.city
                                                    ].filter(Boolean).join(', ')}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="staff-list__btn-delete"
                                            onClick={() => {
                                                setConfirmDeleteId(employee.id);
                                                setDeleteError('');
                                            }}
                                            aria-label={`Supprimer l'employé ${employee.name} ${employee.lastname}`}
                                        >
                                            Supprimer
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </main>

            <Footer />

            {/* ── Modal de confirmation de suppression ─────────────────────── */}
            {confirmDeleteId !== null && (
                <div
                    className="user-create-confirm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-confirm-title"
                >
                    <div className="user-create-confirm__box">
                        <p id="delete-confirm-title" className="user-create-confirm__text">
                            Êtes-vous sûr de vouloir supprimer{' '}
                            <strong>{confirmTarget?.name} {confirmTarget?.lastname}</strong> ?
                            Cette action est irréversible.
                        </p>
                        {deleteError && (
                            <p className="user-create-confirm__error" role="alert">{deleteError}</p>
                        )}
                        <div className="user-create-confirm__actions">
                            <button
                                type="button"
                                className="user-create-confirm__btn-confirm"
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                aria-busy={isDeleting}
                            >
                                {isDeleting ? 'Suppression...' : 'Oui, supprimer'}
                            </button>
                            <button
                                type="button"
                                className="user-create-confirm__cancel"
                                onClick={() => setConfirmDeleteId(null)}
                                disabled={isDeleting}
                                autoFocus
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserCreate;
