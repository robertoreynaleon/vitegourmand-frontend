import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.scss';

const API_MESSAGES = `${process.env.REACT_APP_API_URL}/api/staff/messages`;
/** Intervalle de polling pour vérifier les nouveaux messages (toutes les 5 minutes). */
const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Tableau de bord staff.
 * Affiche un indicateur du nombre de messages non lus et des liens rapides vers
 * les principales fonctionnalités staff (commandes, catalogue, avis, messages).
 * Interroge l'API toutes les 5 minutes pour mettre à jour le compteur de messages.
 */
function StaffDashboard() {
    const { user, token } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const intervalRef = useRef(null);

    /** Récupère le nombre de messages non lus depuis l'API staff/messages. */
    const fetchUnread = async () => {
        if (!token) return;
        try {
            const res = await fetch(API_MESSAGES, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const data = await res.json();
            if (Array.isArray(data)) {
                setUnreadCount(data.filter((m) => m.status === 'unread').length);
            }
        } catch {
            // Silencieux : une erreur de polling ne doit pas bloquer le tableau de bord
        }
    };

    useEffect(() => {
        fetchUnread();
        intervalRef.current = setInterval(fetchUnread, POLL_INTERVAL);
        return () => clearInterval(intervalRef.current);
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

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

                            {/* Carte Messages — visible pour ROLE_ADMIN et ROLE_STAFF_MEMBER */}
                            <article className="staff-dashboard-card" aria-labelledby="card-messages-title">
                                <div className="staff-dashboard-card__icon staff-dashboard-card__icon--messages" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span
                                            className="staff-dashboard-card__badge"
                                            aria-label={`${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}`}
                                        >
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                <h2 id="card-messages-title" className="staff-dashboard-card__title">
                                    Messages
                                </h2>
                                <p className="staff-dashboard-card__desc">
                                    Lire et répondre aux messages de contact des visiteurs.
                                </p>
                                <Link
                                    to="/staff/messages/"
                                    className="staff-dashboard-card__btn"
                                    aria-label="Accéder aux messages de contact"
                                >
                                    Voir les messages
                                </Link>
                            </article>

                            {/* Cartes Admin uniquement */}
                            {user?.roles?.includes('ROLE_ADMIN') && (
                                <>
                                    {/* Carte Employés */}
                                    <article className="staff-dashboard-card" aria-labelledby="card-staff-title">
                                        <div className="staff-dashboard-card__icon" aria-hidden="true">
                                            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                            </svg>
                                        </div>
                                        <h2 id="card-staff-title" className="staff-dashboard-card__title">
                                            Employés
                                        </h2>
                                        <p className="staff-dashboard-card__desc">
                                            Ajouter, consulter et supprimer les membres du staff.
                                        </p>
                                        <Link
                                            to="/admin/users/"
                                            className="staff-dashboard-card__btn"
                                            aria-label="Accéder à la gestion des employés"
                                        >
                                            Gérer les employés
                                        </Link>
                                    </article>

                                    {/* Carte Stats */}
                                    <article className="staff-dashboard-card" aria-labelledby="card-stats-title">
                                        <div className="staff-dashboard-card__icon" aria-hidden="true">
                                            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                                <line x1="18" y1="20" x2="18" y2="10" />
                                                <line x1="12" y1="20" x2="12" y2="4" />
                                                <line x1="6" y1="20" x2="6" y2="14" />
                                                <line x1="2" y1="20" x2="22" y2="20" />
                                            </svg>
                                        </div>
                                        <h2 id="card-stats-title" className="staff-dashboard-card__title">
                                            Stats
                                        </h2>
                                        <p className="staff-dashboard-card__desc">
                                            Visualiser les statistiques de commandes par menu.
                                        </p>
                                        <Link
                                            to="/admin/stats/"
                                            className="staff-dashboard-card__btn"
                                            aria-label="Accéder aux statistiques"
                                        >
                                            Voir les stats
                                        </Link>
                                    </article>
                                </>
                            )}

                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default StaffDashboard;
