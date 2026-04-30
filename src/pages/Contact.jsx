import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import './Contact.scss';

const API_BASE = process.env.REACT_APP_API_URL;

/**
 * Page de contact publique.
 * Affiche un formulaire permettant à tout visiteur d'envoyer un message au restaurant.
 * Si l'utilisateur est connecté, son e-mail est pré-rempli.
 * Les messages sont envoyés à l'API et stockés dans MongoDB.
 */
function Contact() {
    const { user } = useAuth();

    const [form, setForm] = useState({
        client_email: user?.email || '',
        subject: '',
        content: '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [serverError, setServerError] = useState('');

    /** Valide les champs du formulaire de contact. Retourne un objet d'erreurs (vide si tout est valide). */
    const validate = (values) => {
        const errs = {};
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test((values.client_email || '').trim())) errs.client_email = 'Adresse e-mail invalide.';
        const sub = (values.subject || '').trim();
        if (sub.length < 2 || sub.length > 150) errs.subject = 'Sujet requis (2–150 caractères).';
        const cnt = (values.content || '').trim();
        if (cnt.length < 10 || cnt.length > 3000) errs.content = 'Message requis (10–3000 caractères).';
        return errs;
    };

    /** Met à jour la valeur du champ modifié et efface son message d'erreur. */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
        setServerError('');
    };

    /** Valide le champ au moment où l'utilisateur le quitte (blur), pour un retour immédiat. */
    const handleBlur = (e) => {
        const { name } = e.target;
        const fieldErrors = validate(form);
        if (fieldErrors[name]) {
            setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
        }
    };

    /** Soumet le formulaire après validation, envoie la requête POST à l'API et affiche le résultat. */
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setSubmitting(true);
        setServerError('');
        try {
            const res = await fetch(`${API_BASE}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_email: form.client_email.trim(),
                    subject: form.subject.trim(),
                    content: form.content.trim(),
                }),
            });
            if (res.ok) {
                setSuccess(true);
                setForm({ client_email: user?.email || '', subject: '', content: '' });
                setErrors({});
            } else {
                const data = await res.json().catch(() => ({}));
                if (data.errors) {
                    const mapped = {};
                    if (data.errors.includes('client_email')) mapped.client_email = 'Adresse e-mail invalide.';
                    if (data.errors.includes('subject')) mapped.subject = 'Sujet invalide.';
                    if (data.errors.includes('content')) mapped.content = 'Message invalide.';
                    setErrors(mapped);
                } else {
                    setServerError("Une erreur est survenue. Veuillez réessayer.");
                }
            }
        } catch {
            setServerError("Impossible de joindre le serveur. Vérifiez votre connexion.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            <Header />

            <main>
                <section className="contact-section">
                    <div className="container">
                        <h1 className="contact-title">CONTACT</h1>
                        <p className="contact-subtitle">
                            Une question, une demande spéciale ? Notre équipe vous répond par e-mail.
                        </p>

                        {success ? (
                            <div className="contact-success" role="alert">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M9 12l2 2 4-4" />
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                                <p>
                                    Votre message a bien été envoyé !<br />
                                    Nous vous répondrons dans les plus brefs délais.
                                </p>
                                <button
                                    className="contact-success__btn"
                                    onClick={() => setSuccess(false)}
                                >
                                    Envoyer un autre message
                                </button>
                            </div>
                        ) : (
                            <div className="contact-card">
                                {serverError && (
                                    <p className="contact-server-error" role="alert">{serverError}</p>
                                )}
                                <form onSubmit={handleSubmit} noValidate>
                                    <div className="contact-form">

                                        <div className="form-group">
                                            <label className="form-label" htmlFor="client_email">
                                                Votre adresse e-mail *
                                            </label>
                                            <input
                                                id="client_email"
                                                name="client_email"
                                                type="email"
                                                className={`form-input-field${errors.client_email ? ' form-input-field--error' : ''}`}
                                                value={form.client_email}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                autoComplete="email"
                                                required
                                            />
                                            {errors.client_email && (
                                                <span className="form-error" role="alert">{errors.client_email}</span>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" htmlFor="subject">
                                                Sujet *
                                            </label>
                                            <input
                                                id="subject"
                                                name="subject"
                                                type="text"
                                                className={`form-input-field${errors.subject ? ' form-input-field--error' : ''}`}
                                                value={form.subject}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                maxLength={150}
                                                required
                                            />
                                            {errors.subject && (
                                                <span className="form-error" role="alert">{errors.subject}</span>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" htmlFor="content">
                                                Message *
                                            </label>
                                            <textarea
                                                id="content"
                                                name="content"
                                                className={`form-textarea${errors.content ? ' form-textarea--error' : ''}`}
                                                value={form.content}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                rows={6}
                                                maxLength={3000}
                                                required
                                            />
                                            <span className="contact-char-count">
                                                {form.content.length} / 3000
                                            </span>
                                            {errors.content && (
                                                <span className="form-error" role="alert">{errors.content}</span>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            className="contact-submit-btn"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Envoi en cours…' : 'Envoyer le message'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Contact;
