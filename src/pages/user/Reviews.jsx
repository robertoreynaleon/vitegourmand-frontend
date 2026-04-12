import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import './Reviews.scss';

const API_MY_REVIEWS  = 'http://vitegourmand.local/api/reviews/my';
const API_REVIEW_BASE = 'http://vitegourmand.local/api/reviews';
const MAX_CHARS       = 1000;

const STATUS_LABEL = {
    'Validé':                   'Validé',
    'Non validé':              'Non validé',
    'En attente de validation': 'En attente',
};

const STATUS_CLASS = {
    'Validé':                   'valid',
    'Non validé':              'refused',
    'En attente de validation': 'pending',
};

// ---------------------------------------------------------------------------
// Star display (read-only)
// ---------------------------------------------------------------------------
function StarDisplay({ rating }) {
    return (
        <span
            className="reviews-stars"
            aria-label={`${rating} étoile${rating > 1 ? 's' : ''} sur 5`}
        >
            {[1, 2, 3, 4, 5].map((s) => (
                <span
                    key={s}
                    className={`reviews-star${s <= rating ? ' reviews-star--on' : ''}`}
                    aria-hidden="true"
                >
                    ★
                </span>
            ))}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Star picker (interactive)
// ---------------------------------------------------------------------------
function StarPicker({ value, onChange }) {
    const [hovered, setHovered] = useState(0);

    return (
        <div
            className="reviews-star-picker"
            role="group"
            aria-label="Choisir une note"
        >
            {[1, 2, 3, 4, 5].map((s) => (
                <button
                    key={s}
                    type="button"
                    className={`reviews-star-pick${(hovered || value) >= s ? ' reviews-star-pick--active' : ''}`}
                    onClick={() => onChange(s)}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    aria-label={`${s} étoile${s > 1 ? 's' : ''}`}
                    aria-pressed={value === s}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
function Reviews() {
    const { token } = useAuth();
    const [reviews, setReviews]         = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');
    const [editing, setEditing]         = useState(null);
    const [editRating, setEditRating]   = useState(0);
    const [editComment, setEditComment] = useState('');
    const [saving, setSaving]           = useState(false);
    const [saveError, setSaveError]     = useState('');

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_MY_REVIEWS, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Erreur lors du chargement des avis.');
            const data = await res.json();
            setReviews(data);
        } catch (e) {
            setError(e.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchReviews();
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    const startEdit = (review) => {
        setEditing(review._id);
        setEditRating(review.rating);
        setEditComment(review.comment);
        setSaveError('');
    };

    const cancelEdit = () => {
        setEditing(null);
        setSaveError('');
    };

    const saveEdit = async (reviewId) => {
        if (editRating < 1 || editComment.trim() === '') return;
        setSaving(true);
        setSaveError('');

        try {
            const res = await fetch(`${API_REVIEW_BASE}/${reviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    rating:  editRating,
                    comment: editComment.trim(),
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Erreur lors de la mise à jour.');

            // Update in-place: review goes back to "En attente de validation"
            setReviews((prev) => prev.map((r) =>
                r._id !== reviewId ? r : {
                    ...r,
                    rating:     editRating,
                    comment:    editComment.trim(),
                    status:     'En attente de validation',
                    updated_at: new Date().toISOString(),
                }
            ));
            setEditing(null);
        } catch (e) {
            setSaveError(e.message || 'Une erreur est survenue.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="reviews-page">
            <Header />
            <main>
                <div className="container">
                    <section className="reviews-section" aria-labelledby="reviews-title">

                        <h1 id="reviews-title" className="reviews-title">
                            Mes commentaires
                        </h1>

                        <Link to="/user/dashboard/" className="reviews-back">
                            ← Retour au tableau de bord
                        </Link>

                        {loading && (
                            <p className="reviews-loading" aria-live="polite">
                                Chargement de vos commentaires…
                            </p>
                        )}

                        {error && (
                            <p className="reviews-error" role="alert">{error}</p>
                        )}

                        {!loading && !error && reviews.length === 0 && (
                            <div className="reviews-empty">
                                <p className="reviews-empty__text">
                                    Vous n'avez pas encore de commentaires.
                                </p>
                                <Link to="/user/orders/" className="reviews-empty__link">
                                    Voir mes commandes
                                </Link>
                            </div>
                        )}

                        {reviews.length > 0 && (
                            <ul className="reviews-list" aria-label="Liste de mes commentaires">
                                {reviews.map((review) => (
                                    <li
                                        key={review._id}
                                        className={`reviews-card reviews-card--${STATUS_CLASS[review.status] ?? 'refused'}`}
                                    >
                                        <div className="reviews-card__header">
                                            <span className="reviews-card__order">
                                                Commande #{review.order_id}
                                            </span>
                                            <span className={`reviews-card__badge reviews-card__badge--${STATUS_CLASS[review.status] ?? 'refused'}`}>
                                                {STATUS_LABEL[review.status] ?? review.status}
                                            </span>
                                        </div>

                                        {review.status === 'Non validé' && (
                                            <p className="reviews-card__refused-msg" role="alert">
                                                Ce commentaire n'a pas été validé par notre équipe car il ne respecte pas nos normes de convivialité.
                                            </p>
                                        )}

                                        {editing === review._id ? (
                                            <div className="reviews-card__edit">
                                                <StarPicker
                                                    value={editRating}
                                                    onChange={setEditRating}
                                                />
                                                <p className="reviews-card__stars-hint">
                                                    Cliquez sur les étoiles pour noter de 1 à 5
                                                </p>

                                                <div className="reviews-card__edit-field">
                                                    <label
                                                        htmlFor={`edit-comment-${review._id}`}
                                                        className="reviews-card__edit-label"
                                                    >
                                                        Commentaire
                                                    </label>
                                                    <textarea
                                                        id={`edit-comment-${review._id}`}
                                                        className="reviews-card__textarea"
                                                        value={editComment}
                                                        onChange={(e) => setEditComment(e.target.value)}
                                                        maxLength={MAX_CHARS}
                                                        rows={4}
                                                        aria-describedby={`edit-count-${review._id}`}
                                                    />
                                                    <p
                                                        id={`edit-count-${review._id}`}
                                                        className={`reviews-card__count${editComment.length >= MAX_CHARS ? ' reviews-card__count--full' : ''}`}
                                                        aria-live="polite"
                                                    >
                                                        {editComment.length} / {MAX_CHARS}
                                                    </p>
                                                </div>

                                                {saveError && (
                                                    <p className="reviews-card__save-error" role="alert">
                                                        {saveError}
                                                    </p>
                                                )}

                                                <div className="reviews-card__edit-actions">
                                                    <button
                                                        type="button"
                                                        className="reviews-btn reviews-btn--save"
                                                        onClick={() => saveEdit(review._id)}
                                                        disabled={saving || editRating < 1 || editComment.trim() === ''}
                                                        aria-busy={saving}
                                                    >
                                                        {saving ? 'Enregistrement…' : 'Enregistrer'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="reviews-btn reviews-btn--cancel"
                                                        onClick={cancelEdit}
                                                        disabled={saving}
                                                    >
                                                        Annuler
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <StarDisplay rating={review.rating} />
                                                <p className="reviews-card__comment">{review.comment}</p>
                                                <p className="reviews-card__date">
                                                    Posté le{' '}
                                                    {new Date(review.created_at).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </p>

                                                {review.status === 'Non validé' && (
                                                    <button
                                                        type="button"
                                                        className="reviews-btn reviews-btn--edit"
                                                        onClick={() => startEdit(review)}
                                                    >
                                                        Modifier
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}

                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default Reviews;
