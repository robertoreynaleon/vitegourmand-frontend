import React from "react";
import './Hero.css';

function Hero() {
    return (
        <section id="welcome" class="hero">
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">VITE & GOURMAND</h1>
                <h1 class="hero-subtitle">
                    TRAITEUR ET TABLE D'HÔTES
                    <hr />LOCAVORE SUR BORDEAUX
                </h1>
                <a href="/menu/list/" class="btn-primary">Découvrez nos menus</a>
            </div>
        </section>
    );
}

export default Hero;