import React from "react";
import './Hero.scss';

/**
 * Section hero de la page d'accueil.
 * Affiche l'image de fond, le nom du restaurant, le slogan
 * et un bouton d'appel à l'action vers la liste des menus.
 */
function Hero() {
    return (
        <section
            id="welcome"
            className="hero"
            style={{ '--hero-image': "url('/assets/img/hero/hero.webp')" }}
        >
            <div className="hero-overlay"></div>
            <div className="hero-content">
                <h1 className="hero-title">VITE & GOURMAND</h1>
                <p className="hero-subtitle">
                    TRAITEUR ET TABLE D'HÔTES
                    <br />LOCAVORE SUR BORDEAUX
                </p>
                <a href="/menu/list/" className="btn-primary">Découvrez nos menus</a>
            </div>
        </section>
    );
}

export default Hero;