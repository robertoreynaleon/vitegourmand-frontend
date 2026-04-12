import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.scss';

function StaffDashboard() {
    const { user } = useAuth();

    return (
        <div className="staff-dashboard-page">
            <Header />

            <main>
                <section className="staff-dashboard-section">
                    <div className="container">

                        <h1 className="staff-dashboard-title">Espace Staff — Gestion</h1>

                        {user && (
                            <p className="staff-dashboard-welcome">
                                Bonjour, <strong>{user.name} {user.lastname}</strong>
                            </p>
                        )}

                        <div className="staff-dashboard-grid">

                            {/* Carte Commandes */}
                            <article className="staff-dashboard-card" aria-labelledby="card-orders-title">
                                <div className="staff-dashboard-card__icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                                        <rect x="9" y="3" width="6" height="4" rx="1" />
                                        <path d="M9 12h6M9 16h4" />
                                    </svg>
                                </div>
                                <h2 id="card-orders-title" className="staff-dashboard-card__title">
                                    Commandes
                                </h2>
                                <p className="staff-dashboard-card__desc">
                                    Voir et gérer toutes les commandes des clients.
                                </p>
                                <Link
                                    to="/staff/orders/"
                                    className="staff-dashboard-card__btn"
                                    aria-label="Accéder à la gestion des commandes"
                                >
                                    Gérer les commandes
                                </Link>
                            </article>

                            {/* Carte Menus */}
                            <article className="staff-dashboard-card" aria-labelledby="card-menus-title">
                                <div className="staff-dashboard-card__icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                                        <path d="M8 12h8M12 8v8" />
                                    </svg>
                                </div>
                                <h2 id="card-menus-title" className="staff-dashboard-card__title">
                                    Menus
                                </h2>
                                <p className="staff-dashboard-card__desc">
                                    Créer, modifier et supprimer des menus et leur contenu.
                                </p>
                                <Link
                                    to="/staff/catalog/"
                                    className="staff-dashboard-card__btn"
                                    aria-label="Accéder à la gestion du catalogue"
                                >
                                    Gérer les menus
                                </Link>
                            </article>

                            {/* Carte Avis */}
                            <article className="staff-dashboard-card" aria-labelledby="card-reviews-title">
                                <div className="staff-dashboard-card__icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                </div>
                                <h2 id="card-reviews-title" className="staff-dashboard-card__title">
                                    Avis
                                </h2>
                                <p className="staff-dashboard-card__desc">
                                    Valider les avis des clients avant publication.
                                </p>
                                <Link
                                    to="/staff/reviews/"
                                    className="staff-dashboard-card__btn"
                                    aria-label="Accéder à la gestion des avis clients"
                                >
                                    Gérer les avis
                                </Link>
                            </article>

                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default StaffDashboard;
