import React from "react";
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function MenuShow() {
    return (
        <div className="menu-show-page">
            <Header />
            <main className="menu-show-content">
                <div className="container">
                    <section className="menu-show-hero">
                        <div className="menu-show-heading">
                            <p className="menu-show-kicker">Detail du menu</p>
                            <h1 className="menu-show-title">Nom du menu</h1>
                            <div className="menu-show-regime">
                                <span className="menu-info-label">Regime : </span>
                                <span className="regime-badge">Vegetarien</span>
                            </div>
                        </div>
                    </section>

                    <section className="menu-show-gallery" aria-label="Photos du menu">
                        <div className="menu-show-gallery-grid">
                            <div className="menu-show-photo" aria-hidden="true"></div>
                            <div className="menu-show-photo" aria-hidden="true"></div>
                            <div className="menu-show-photo" aria-hidden="true"></div>
                        </div>
                    </section>

                    <section className="menu-show-summary">
                        <div className="menu-info">
                            <span className="menu-info-label">Nombre minimum : </span>
                            <span>6 personnes</span>
                        </div>
                        <div className="menu-description">
                            <div className="menu-description-title">Description :</div>
                            <p className="menu-description-text">
                                Description du menu a venir.
                            </p>
                        </div>
                    </section>

                    <section className="menu-show-composition" aria-label="Composition du menu">
                        <h2 className="menu-section-title">Composition</h2>
                        <div className="menu-composition-grid">
                            <article className="menu-composition-card">
                                <h3 className="menu-composition-title">Entree</h3>
                                <p className="menu-composition-name">Nom de l entree</p>
                                <div className="menu-composition-allergens">
                                    <span className="menu-info-label">Allergenes : </span>
                                    <span>Aucun</span>
                                </div>
                            </article>

                            <article className="menu-composition-card">
                                <h3 className="menu-composition-title">Plat principal</h3>
                                <p className="menu-composition-name">Nom du plat</p>
                                <div className="menu-composition-allergens">
                                    <span className="menu-info-label">Allergenes : </span>
                                    <span>Aucun</span>
                                </div>
                            </article>

                            <article className="menu-composition-card">
                                <h3 className="menu-composition-title">Dessert</h3>
                                <p className="menu-composition-name">Nom du dessert</p>
                                <div className="menu-composition-allergens">
                                    <span className="menu-info-label">Allergenes : </span>
                                    <span>Aucun</span>
                                </div>
                            </article>
                        </div>
                    </section>

                    <section className="menu-show-stock">
                        <div className="menu-stock">
                            <span className="menu-info-label">Stock disponible : </span>
                            <span className="stock-available">20</span>
                        </div>
                    </section>

                    <section className="menu-show-pricing" aria-label="Informations de commande">
                        <h2 className="menu-section-title">Commande</h2>
                        <div className="menu-pricing-grid">
                            <div className="menu-price">
                                24.90 € / pers.
                            </div>
                            <div className="menu-pricing-info">
                                <div className="menu-info">
                                    <span className="menu-info-label">Delai de demande : </span>
                                    <span>2 jours</span>
                                </div>
                                <div className="menu-info">
                                    <span className="menu-info-label">Commande minimum : </span>
                                    <span>6 personnes - 149.40 €</span>
                                </div>
                            </div>
                        </div>
                        <div className="menu-show-actions">
                            <a href="/order" className="menu-action-btn">Commander</a>
                            <a href="/menu/list/" className="menu-action-secondary">Retour aux menus</a>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default MenuShow;