import React from 'react';
import { motion } from 'framer-motion';
import './HomePage.scss';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import chefsImg from '../assets/img/cooks/chefs.webp';
import { fadeUpVariants, staggerContainerVariants } from '../hooks/useScrollReveal';

// Options viewport communes — calquées sur home.js (threshold 0.1, rootMargin -100px bas)
const vp = { once: true, amount: 0.1, margin: '0px 0px -100px 0px' };

function HomePage() {
    return (
        <>
            <Header />
            <Hero />

            <main>
            {/* Section : À propos */}
            <section id="about" className="about-section" aria-labelledby="about-title">
                <div className="container">
                    <motion.div
                        className="section-header"
                        variants={fadeUpVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={vp}
                    >
                        <h2 id="about-title">À PROPOS DE NOUS</h2>
                        <div className="divider"></div>
                    </motion.div>
                    <motion.div
                        className="about-content"
                        variants={fadeUpVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={vp}
                    >
                        <motion.div
                            className="about-text"
                            variants={fadeUpVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={vp}
                        >
                            <h3>Votre traiteur événementiel à Bordeaux depuis 25 ans</h3>
                            <p><strong>JULIE & JOSÉ,</strong> nous sommes VITE & GOURMAND.</p>
                            <p>Avant tout épicuriens dans l'âme, nous sommes deux cuisiniers bordelais passionnés qui partagent, depuis un quart de siècle, l'amour de la bonne cuisine et du terroir. De Noël à Pâques, en passant par vos moments les plus précieux, nous mettons notre savoir-faire au service de vos événements.</p>
                            <p>En travaillant avec des produits frais et de saison, nous créons des menus en constante évolution qui s'adaptent aux richesses de notre belle région et aux tendances culinaires, tout en conservant cette authenticité qui fait notre signature.</p>
                            <p>Qu'il s'agisse d'un simple repas en famille ou d'un événement d'exception, notre cuisine se veut jolie et créative, fine et conviviale, authentique et généreuse. Mais toujours sur mesure et selon vos envies !</p>
                        </motion.div>
                        <motion.div
                            className="about-image"
                            variants={fadeUpVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={vp}
                        >
                            <img src={chefsImg} alt="Julie et José, les cuisiniers de Vite & Gourmand" />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Section : Charte */}
            <section id="charte" className="charte-section" aria-labelledby="charte-title">
                <div className="container">
                    <motion.div
                        className="section-header"
                        variants={fadeUpVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={vp}
                    >
                        <h2 id="charte-title">NOTRE CHARTE ÉCO-RESPONSABLE</h2>
                        <div className="divider"></div>
                    </motion.div>
                    <motion.p
                        className="section-intro"
                        variants={fadeUpVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={vp}
                    >
                        Notre charte s'inscrit dans la dynamique actuelle de valorisation des productions des territoires, et d'un retour vers la filière locale.
                    </motion.p>

                    <motion.div
                        className="charte-grid"
                        variants={staggerContainerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={vp}
                    >
                        <motion.div className="charte-card" variants={fadeUpVariants}>
                            <div className="icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            <h3>LE PARTAGE DES VALEURS</h3>
                            <p>Travailler exclusivement avec des acteurs et producteurs locaux, en réseaux et circuits courts, agrobiologiques, labellisés ou non, et partageant nos valeurs ; préserver et promouvoir un modèle alimentaire traditionnel, comme facteur de lien social.</p>
                        </motion.div>

                        <motion.div className="charte-card" variants={fadeUpVariants}>
                            <div className="icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                    <path d="M2 17l10 5 10-5"></path>
                                    <path d="M2 12l10 5 10-5"></path>
                                </svg>
                            </div>
                            <h3>UN SAVOIR-FAIRE</h3>
                            <p>Constituer un système de partage et d'échange nous permettant de valoriser leur production et leur savoir-faire, dans le respect de valeurs communes. À travers notre cuisine, nous voulons soutenir, diffuser et participer ainsi à ces différentes initiatives.</p>
                        </motion.div>

                        <motion.div className="charte-card" variants={fadeUpVariants}>
                            <div className="icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                </svg>
                            </div>
                            <h3>UNE CULTURE ALIMENTAIRE</h3>
                            <p>Garder un souci permanent d'éducation concernant le bien manger, la lutte contre le gaspillage, le développement durable ainsi que l'éveil aux cultures alimentaires du monde.</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Section : Locavore */}
            <section id="values" className="locavore-section" aria-labelledby="values-title">
                <div className="container">
                    <motion.div
                        className="section-header"
                        variants={fadeUpVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={vp}
                    >
                        <h2 id="values-title">ÊTRE LOCAVORE C'EST QUOI ?</h2>
                        <div className="divider"></div>
                    </motion.div>
                    <motion.h3
                        className="locavore-subtitle"
                        variants={fadeUpVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={vp}
                    >
                        MANGER BON, BIEN & PAS LOIN
                    </motion.h3>

                    <motion.div
                        className="locavore-content"
                        variants={fadeUpVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={vp}
                    >
                        <div className="locavore-main">
                            <p>S'alimenter de produits locaux produits à 200 km maximum autour de chez nous et valoriser :</p>
                            <ul>
                                <li>Les produits frais et de saison</li>
                                <li>Des relations de confiance</li>
                                <li>L'économie locale</li>
                            </ul>
                            <p>Véritablement à l'écoute, notre équipe veille par son suivi sans faille et sa gestion transparente, à la parfaite réussite de vos événements privés ou professionnels.</p>
                        </div>

                        <div className="locavore-features">
                            <div className="feature-item">
                                <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" />
                                </svg>
                                <h4>RÉDUIRE SON EMPREINTE CARBONE</h4>
                            </div>
                            <div className="feature-item">
                                <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path d="M2 22s16-4 20-16c-8 4-16 16-16 16z" />
                                    <path d="M14 6c0 4.418-3.582 8-8 8" />
                                </svg>
                                <h4>RESPECTER LES SAISONS</h4>
                            </div>
                            <div className="feature-item">
                                <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73z" />
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                    <line x1="12" y1="22.08" x2="12" y2="12" />
                                </svg>
                                <h4>LIMITER LES EMBALLAGES ET LES CONTENANTS</h4>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            </main>

            <Footer />
        </>
    );
}

export default HomePage;
