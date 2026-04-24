import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { deleteAccount } from '../../services/userService';
import { loadCart } from '../../services/cartCalc';
import './Dashboard.scss';

/**
 * Tableau de bord du client connecté.
 * Affiche les informations du compte, le lien vers les commandes, les avis
 * et la possibilité de supprimer le compte de façon définitive.
 */
function Dashboard() {
    const { user, token, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const justUpdated = location.state?.updated === true;
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const cartCount = loadCart().length;

    const handleDelete = async () => {
        setIsDeleting(true);
        setDeleteError('');
        try {
            await deleteAccount(token);
            logout();
            window.location.href = '/';
        } catch (err) {
            setDeleteError(err.message || 'Une erreur est survenue.');
            setIsDeleting(false);
        }
    };

    return (
        <div className="dashboard-page">
            <Header />

            <main>
                <section className="dashboard-section">
                    <div className="container">

                        <h1 className="dashboard-title">Mon espace</h1>

                        {justUpdated && (
                            <p className="form-success" role="status" aria-live="polite">
                                Vos informations ont bien été mises à jour.
                            </p>
                        )}

                        {user && (
                            <>
                                {/* Carte profil */}
                                <div className="dashboard-card dashboard-card--profile">
                                    <div className="dashboard-card__header">
                                        <h2>Mes informations personnelles</h2>
                                        <p className="dashboard-card__identity">
                                            {user.name} {user.lastname}
                                        </p>
                                    </div>

                                    <ul className="dashboard-info-list" aria-label="Informations du profil">
                                        <li className="dashboard-info-item">
                                            <span className="dashboard-info-label">Email</span>
                                            <span className="dashboard-info-value">{user.email}</span>
                                        </li>
                                        <li className="dashboard-info-item">
                                            <span className="dashboard-info-label">Téléphone</span>
                                            <span className="dashboard-info-value">{user.phone || '—'}</span>
                                        </li>
                                        <li className="dashboard-info-item">
                                            <span className="dashboard-info-label">Adresse</span>
                                            <span className="dashboard-info-value">
                                                {user.address
                                                    ? `${user.address}, ${user.postalCode} ${user.city}`
                                                    : '—'}
                                            </span>
                                        </li>
                                    </ul>

                                    <Link to="/user/edit/" className="dashboard-btn-edit">
                                        Modifier mes informations
                                    </Link>
                                </div>

                                {/* Navigation vers les sections */}
                                <nav className="dashboard-nav" aria-label="Navigation Mon espace">
                                    <Link to="/user/orders/" className="dashboard-nav-card">
                                        <span className="dashboard-nav-card__icon" aria-hidden="true">
                                            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                                <line x1="3" y1="6" x2="21" y2="6" />
                                                <path d="M16 10a4 4 0 0 1-8 0" />
                                            </svg>
                                        </span>
                                        <span className="dashboard-nav-card__label">Mes commandes</span>
                                    </Link>
                                    <Link to="/user/reviews/" className="dashboard-nav-card">
                                        <span className="dashboard-nav-card__icon" aria-hidden="true">
                                            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                            </svg>
                                        </span>
                                        <span className="dashboard-nav-card__label">Mes commentaires</span>
                                    </Link>
                                </nav>

                                {/* Actions globales */}
                                <div className="dashboard-actions">
                                    <Link to="/user/order/" className="dashboard-btn-cart">
                                        Mon panier
                                        {cartCount > 0 && (
                                            <span className="dashboard-btn-cart__badge" aria-label={`${cartCount} menu${cartCount > 1 ? 's' : ''} dans le panier`}>
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                    <Link to="/menu/list/" className="dashboard-btn-shop">
                                        Aller acheter
                                    </Link>
                                    <button
                                        type="button"
                                        className="dashboard-btn-delete"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        aria-haspopup="dialog"
                                    >
                                        Supprimer mon compte
                                    </button>
                                </div>

                                {showDeleteConfirm && (
                                    <div
                                        className="dashboard-confirm"
                                        role="dialog"
                                        aria-modal="true"
                                        aria-labelledby="delete-confirm-title"
                                    >
                                        <p id="delete-confirm-title" className="dashboard-confirm__text">
                                            Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
                                        </p>
                                        {deleteError && (
                                            <p className="dashboard-confirm__error" role="alert">{deleteError}</p>
                                        )}
                                        <div className="dashboard-confirm__actions">
                                            <button
                                                type="button"
                                                className="dashboard-confirm__btn-confirm"
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                                aria-busy={isDeleting}
                                            >
                                                {isDeleting ? 'Suppression...' : 'Oui, supprimer'}
                                            </button>
                                            <button
                                                type="button"
                                                className="dashboard-confirm__cancel"
                                                onClick={() => setShowDeleteConfirm(false)}
                                                disabled={isDeleting}
                                                autoFocus
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Dashboard;
