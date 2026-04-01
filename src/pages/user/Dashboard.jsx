import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';

function Dashboard() {
    const { user } = useAuth();
    const location = useLocation();
    const justUpdated = location.state?.updated === true;

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
                                        <div>
                                            <h2>Mes informations personnelles</h2>
                                        </div>
                                        <div className="dashboard-card__identity">
                                            <h3>
                                                {user.name} {user.lastname}
                                            </h3>
                                        </div>
                                    </div>

                                    <ul className="dashboard-info-list">
                                        <li className="dashboard-info-item">
                                            <span className="dashboard-info-label">Email : </span>
                                            <span className="dashboard-info-value">{user.email}</span>
                                        </li>
                                        <li className="dashboard-info-item">
                                            <span className="dashboard-info-label">Téléphone : </span>
                                            <span className="dashboard-info-value">{user.phone || '—'}</span>
                                        </li>
                                        <li className="dashboard-info-item">
                                            <span className="dashboard-info-label">Adresse : </span>
                                            <span className="dashboard-info-value">
                                                {user.address
                                                    ? `${user.address}, ${user.postalCode} ${user.city}`
                                                    : '—'}
                                            </span>
                                        </li>
                                    </ul>

                                    <Link to="/user/edit" className="dashboard-btn-edit">
                                        Modifier mes informations
                                    </Link>
                                </div>
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
