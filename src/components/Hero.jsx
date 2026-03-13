import React from "react";
import './Hero.scss';

function Hero() {
    return (
        <section id="welcome" className="hero">
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