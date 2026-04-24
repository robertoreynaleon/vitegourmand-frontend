import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import './ReviewCreate.scss';

/** URL de l'API pour la création d'un avis. */
const API_REVIEWS = 'http://vitegourmand.local/api/reviews';
/** Nombre maximal de caractères autorisés dans le texte de l'avis. */
const MAX_CHARS   = 1000;

/**
 * Page de création d'un avis.
 * Accessible après une commande terminée, avec le titre du menu pré-rempli
 * depuis l'état de navigation (useLocation state).
 * La note est sélectionnable à l'aide d'un composant d'étoiles interactif.
 */
function ReviewCreate() {
    const { token }   = useAuth();
    const navigate    = useNavigate();
    const { orderId } = useParams();
    const location    = useLocation();
    const { deliveryDate } = location.state || {};

    const [rating, setRating]         = useState(0);
    const [hovered, setHovered]       = useState(0);
    const [comment, setComment]       = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState('');

    const isValid = rating >= 1 && comment.trim().length >= 1;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid || submitting) return;

        setSubmitting(true);
        setError('');

        try {
            const res = await fetch(API_REVIEWS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    order_id: parseInt(orderId, 10),
                    rating,
                    comment: comment.trim(),
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Erreur lors de l\'enregistrement.');

            navigate('/user/orders/', { state: { reviewSuccess: true } });
        } catch (err) {
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="review-create-page">
            <Header />
            <main>
                <div className="container">
                    <section
                        className="review-create-section"
                        aria-labelledby="review-create-title"
                    >
                        <h1 id="review-create-title" className="review-create-title">
                            Laisser un commentaire
                        </h1>

                        <div className="review-create-meta">
                            <p>
                                <span className="review-create-meta__label">Commande :</span>
                                <span className="review-create-meta__value">#{orderId}</span>
                            </p>
                            {deliveryDate && (
                                <p>
                                    <span className="review-create-meta__label">Date de livraison :</span>
                                    <span className="review-create-meta__value">{deliveryDate}</span>
                                </p>
                            )}
                        </div>

                        {error && (
                            <p className="review-create-error" role="alert">{error}</p>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="review-create-form"
                            noValidate
                            aria-label="Formulaire de commentaire"
                        >
                            {/* Star rating */}
                            <fieldset className="review-create-fieldset">
                                <legend className="review-create-legend" id="rating-legend">
                                    Note <span aria-hidden="true" className="required-mark">*</span>
                                </legend>

                                <div
                                    className="review-create-stars"
                                    role="group"
                                    aria-labelledby="rating-legend"
                                >
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={`review-create-star${(hovered || rating) >= star ? ' review-create-star--active' : ''}`}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHovered(star)}
                                            onMouseLeave={() => setHovered(0)}
                                            aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                                            aria-pressed={rating === star}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>

                                <p className="review-create-stars-hint">
                                    Cliquez sur les étoiles pour noter de 1 à 5
                                </p>
                            </fieldset>

                            {/* Comment */}
                            <div className="review-create-field">
                                <label
                                    htmlFor="review-comment"
                                    className="review-create-label"
                                >
                                    Commentaire{' '}
                                    <span aria-hidden="true" className="required-mark">*</span>
                                </label>
                                <textarea
                                    id="review-comment"
                                    className="review-create-textarea"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    maxLength={MAX_CHARS}
                                    rows={6}
                                    placeholder="Partagez votre expérience…"
                                    aria-required="true"
                                    aria-describedby="review-comment-count"
                                />
                                <p
                                    id="review-comment-count"
                                    className={`review-create-count${comment.length >= MAX_CHARS ? ' review-create-count--full' : ''}`}
                                    aria-live="polite"
                                >
                                    {comment.length} / {MAX_CHARS} caractères
                                </p>
                            </div>

                            <div className="review-create-actions">
                                <button
                                    type="submit"
                                    className="review-create-btn review-create-btn--primary"
                                    disabled={!isValid || submitting}
                                    aria-busy={submitting}
                                >
                                    {submitting ? 'Enregistrement…' : 'Enregistrer le commentaire'}
                                </button>
                                <button
                                    type="button"
                                    className="review-create-btn review-create-btn--cancel"
                                    onClick={() => navigate('/user/orders/')}
                                    disabled={submitting}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default ReviewCreate;
