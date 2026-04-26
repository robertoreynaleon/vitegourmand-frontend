import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './Legal.scss';

/**
 * Page Mentions légales.
 * Contenu obligatoire en application de l'article 6 de la loi n° 2004-575
 * du 21 juin 2004 pour la Confiance dans l'Économie Numérique (LCEN).
 */
function MentionsLegales() {
    return (
        <div className="legal-page">
            <Header />
            <main>
                <section className="legal-section">
                    <div className="container">
                        <div className="legal-header">
                            <h1>Mentions légales</h1>
                            <p className="legal-date">Dernière mise à jour : avril 2026</p>
                        </div>

                        <div className="legal-body">

                            <h2>1. Éditeur du site</h2>
                            <p>
                                Le présent site est édité par :<br />
                                <strong>Vite Gourmand</strong><br />
                                Forme juridique : Entreprise individuelle<br />
                                Adresse : 3 rue Dupaty, 33300 Bordeaux<br />
                                Téléphone : <a href="tel:+33540250651">05 40 25 06 51</a><br />
                                E-mail : <a href="mailto:vitegourmand@gmail.com">vitegourmand@gmail.com</a><br />
                                Numéro SIRET : [à compléter]<br />
                                Directeur de la publication : [Nom du responsable]
                            </p>

                            <h2>2. Hébergement</h2>
                            <p>
                                Le site est hébergé par :<br />
                                <strong>[Nom de l'hébergeur]</strong><br />
                                Adresse : [Adresse de l'hébergeur]<br />
                                Site web : [URL de l'hébergeur]
                            </p>

                            <h2>3. Propriété intellectuelle</h2>
                            <p>
                                L'ensemble des contenus présents sur ce site (textes, images, logos, photographies,
                                illustrations, mise en page) est la propriété exclusive de Vite Gourmand ou de ses
                                fournisseurs, et est protégé par les lois françaises et internationales relatives à
                                la propriété intellectuelle.
                            </p>
                            <p>
                                Toute reproduction, représentation, modification, publication ou adaptation de tout
                                ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est
                                interdite sans l'autorisation préalable et écrite de Vite Gourmand.
                            </p>
                            <p>
                                Toute exploitation non autorisée du site ou de son contenu sera considérée comme
                                constitutive d'une contrefaçon et poursuivie conformément aux dispositions des
                                articles L.335-2 et suivants du Code de la Propriété Intellectuelle.
                            </p>

                            <h2>4. Protection des données personnelles</h2>
                            <p>
                                Vite Gourmand s'engage à protéger les données personnelles de ses utilisateurs
                                conformément au Règlement Général sur la Protection des Données (RGPD — Règlement
                                UE 2016/679) et à la loi Informatique et Libertés n° 78-17 du 6 janvier 1978
                                modifiée.
                            </p>

                            <h3>4.1 Données collectées</h3>
                            <p>Dans le cadre de l'utilisation du site, les données suivantes sont collectées :</p>
                            <ul>
                                <li>Nom, prénom, adresse e-mail, numéro de téléphone (inscription et commandes)</li>
                                <li>Adresse postale de livraison</li>
                                <li>Historique des commandes</li>
                                <li>Messages envoyés via le formulaire de contact</li>
                            </ul>

                            <h3>4.2 Finalités du traitement</h3>
                            <p>Les données sont collectées pour :</p>
                            <ul>
                                <li>La gestion des comptes utilisateurs et l'authentification</li>
                                <li>Le traitement et le suivi des commandes</li>
                                <li>La communication relative aux commandes (e-mails de confirmation)</li>
                                <li>La gestion du service client</li>
                            </ul>

                            <h3>4.3 Durée de conservation</h3>
                            <p>
                                Les données sont conservées pour la durée strictement nécessaire à la réalisation
                                des finalités pour lesquelles elles ont été collectées, et au maximum 3 ans à
                                compter de la dernière interaction avec le service.
                            </p>

                            <h3>4.4 Droits des utilisateurs</h3>
                            <p>
                                Conformément au RGPD, vous disposez des droits suivants sur vos données
                                personnelles : droit d'accès, de rectification, d'effacement, de limitation du
                                traitement, à la portabilité, et d'opposition.
                            </p>
                            <p>
                                Pour exercer ces droits, contactez-nous à :{' '}
                                <a href="mailto:vitegourmand@gmail.com">vitegourmand@gmail.com</a>
                            </p>
                            <p>
                                Vous disposez également du droit d'introduire une réclamation auprès de la
                                Commission Nationale de l'Informatique et des Libertés (CNIL) —{' '}
                                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
                            </p>

                            <h2>5. Cookies et stockage local</h2>
                            <p>
                                Ce site utilise des mécanismes de stockage local (<em>localStorage</em>) pour le
                                bon fonctionnement de l'application. Ces données ne sont pas transmises à des tiers
                                et sont strictement nécessaires au service :
                            </p>
                            <ul>
                                <li>
                                    <strong>Authentification</strong> — Le token de session (JWT) est conservé
                                    localement pour maintenir votre connexion jusqu'à expiration automatique (8 heures).
                                </li>
                                <li>
                                    <strong>Panier</strong> — Le contenu de votre panier est enregistré localement
                                    pour une durée de 2 heures.
                                </li>
                            </ul>
                            <p>
                                Ces données étant strictement fonctionnelles et nécessaires à la prestation du
                                service, elles ne sont pas soumises au recueil de votre consentement préalable
                                (article 82 de la loi Informatique et Libertés).
                            </p>

                            <h2>6. Responsabilité</h2>
                            <p>
                                Vite Gourmand s'efforce d'assurer l'exactitude et la mise à jour des informations
                                diffusées sur ce site. Cependant, Vite Gourmand ne peut garantir l'exhaustivité
                                ou l'absence d'erreur des informations présentes sur le site, ni leur adéquation
                                à un usage particulier.
                            </p>
                            <p>
                                Vite Gourmand ne saurait être tenu responsable des dommages directs ou indirects
                                résultant de l'utilisation de ce site ou de l'impossibilité d'y accéder.
                            </p>

                            <h2>7. Liens hypertextes</h2>
                            <p>
                                Le site peut contenir des liens vers des sites tiers. Vite Gourmand n'exerce aucun
                                contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
                            </p>

                            <h2>8. Droit applicable et juridiction</h2>
                            <p>
                                Les présentes mentions légales sont régies par le droit français. En cas de litige
                                et à défaut de résolution amiable, les tribunaux compétents de Bordeaux seront
                                seuls compétents.
                            </p>

                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default MentionsLegales;
