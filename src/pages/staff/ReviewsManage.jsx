import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import './ReviewsManage.scss';

const API_STAFF_REVIEWS = 'http://vitegourmand.local/api/staff/reviews';

// ---------------------------------------------------------------------------
// Star display (green for staff page)
// ---------------------------------------------------------------------------
function StarDisplay({ rating }) {
    return (
        <span
            className="rm-stars"
            aria-label={`${rating} étoile${rating > 1 ? 's' : ''} sur 5`}
        >
            {[1, 2, 3, 4, 5].map((s) => (
                <span
                    key={s}
                    className={`rm-star${s <= rating ? ' rm-star--on' : ''}`}
                    aria-hidden="true"
                >
                    ★
                </span>
            ))}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
function ReviewsManage() {
    const { token } = useAuth();
    const [reviews, setReviews]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [acting, setActing]     = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_STAFF_REVIEWS, {
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

    const handleAction = async (reviewId, action) => {
        setActing(reviewId);
        setError('');
        try {
            const res = await fetch(`${API_STAFF_REVIEWS}/${reviewId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ action }),
            });
            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.message || 'Erreur lors de la mise à jour.');
            }
            // Remove from "En attente" list
            setReviews((prev) => prev.filter((r) => r._id !== reviewId));
            const label = action === 'validate' ? 'validé' : 'refusé';
            setSuccessMsg(`Avis ${label} avec succès.`);
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (e) {
            setError(e.message || 'Une erreur est survenue.');
        } finally {
            setActing(null);
        }
    };

    return (
        <div className="reviews-manage-page">
            <Header />
            <main>
                <div className="container">
                    <section
                        className="reviews-manage-section"
                        aria-labelledby="rm-title"
                    >
                        <h1 id="rm-title" className="reviews-manage-title">
                            Gestion des avis clients
                        </h1>

                        <Link to="/staff/dashboard/" className="reviews-manage-back">
                            ← Retour au tableau de bord
                        </Link>

                        {successMsg && (
                            <p className="reviews-manage-success" role="status" aria-live="polite">
                                {successMsg}
                            </p>
                        )}

                        {error && (
                            <p className="reviews-manage-error" role="alert">{error}</p>
                        )}

                        {loading && (
                            <p className="reviews-manage-loading" aria-live="polite">
                                Chargement des avis…
                            </p>
                        )}

                        {!loading && !error && reviews.length === 0 && (
                            <p className="reviews-manage-empty">
                                Aucun avis en attente de validation.
                            </p>
                        )}

                        {!loading && reviews.length > 0 && (
                            <ul className="rm-list" aria-label="Avis en attente de validation">
                                {reviews.map((review) => (
                                    <li key={review._id} className="rm-card">
                                        <div className="rm-card__header">
                                            <span className="rm-card__order">
                                                Commande #{review.order_id}
                                            </span>
                                            <span className="rm-card__client">
                                                {review.user_name}
                                            </span>
                                        </div>

                                        <StarDisplay rating={review.rating} />

                                        <p className="rm-card__comment">
                                            {review.comment}
                                        </p>

                                        <p className="rm-card__date">
                                            Posté le{' '}
                                            {new Date(review.created_at).toLocaleString('fr-FR', {
                                                day:    '2-digit',
                                                month:  'long',
                                                year:   'numeric',
                                                hour:   '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>

                                        <div className="rm-card__actions">
                                            <button
                                                type="button"
                                                className="rm-btn rm-btn--validate"
                                                onClick={() => handleAction(review._id, 'validate')}
                                                disabled={acting === review._id}
                                                aria-busy={acting === review._id}
                                            >
                                                Valider
                                            </button>
                                            <button
                                                type="button"
                                                className="rm-btn rm-btn--refuse"
                                                onClick={() => handleAction(review._id, 'refuse')}
                                                disabled={acting === review._id}
                                                aria-busy={acting === review._id}
                                            >
                                                Refuser
                                            </button>
                                        </div>
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

export default ReviewsManage;
