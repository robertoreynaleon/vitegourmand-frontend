import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './Legal.scss';

/**
 * Page Conditions Générales de Vente et Politique de confidentialité.
 * Conforme aux obligations légales françaises pour un service de traiteur à domicile
 * (articles L.111-1 et suivants du Code de la consommation).
 * La section "Politique de confidentialité" est accessible via l'ancre #confidentialite.
 */
function CGV() {
    return (
        <div className="legal-page">
            <Header />
            <main>
                <section className="legal-section">
                    <div className="container">
                        <div className="legal-header">
                            <h1>Conditions Générales de Vente</h1>
                            <p className="legal-date">Dernière mise à jour : avril 2026</p>
                        </div>

                        <div className="legal-body">

                            <h2>1. Objet</h2>
                            <p>
                                Les présentes Conditions Générales de Vente (CGV) régissent les relations
                                contractuelles entre <strong>Vite Gourmand</strong> (ci-après « le Prestataire »),
                                service de traiteur à domicile, et tout client passant commande via le site
                                internet ou par téléphone (ci-après « le Client »).
                            </p>
                            <p>
                                Toute commande implique l'acceptation sans réserve des présentes CGV.
                            </p>

                            <h2>2. Identification du Prestataire</h2>
                            <p>
                                <strong>Vite Gourmand</strong><br />
                                3 rue Dupaty, 33300 Bordeaux<br />
                                Téléphone : <a href="tel:+33540250651">05 40 25 06 51</a><br />
                                E-mail : <a href="mailto:vitegourmand@gmail.com">vitegourmand@gmail.com</a><br />
                                SIRET : [à compléter]
                            </p>

                            <h2>3. Services proposés</h2>
                            <p>
                                Vite Gourmand propose un service de traiteur à domicile incluant :
                            </p>
                            <ul>
                                <li>La préparation de menus gastronomiques pour événements privés et professionnels</li>
                                <li>La livraison et le service à l'adresse indiquée par le Client</li>
                                <li>La location optionnelle de matériel de service (nappes, couverts, etc.)</li>
                            </ul>

                            <h2>4. Commandes</h2>

                            <h3>4.1 Procédure de commande</h3>
                            <p>
                                Les commandes sont passées via l'espace client du site internet après création d'un
                                compte. Le Client sélectionne le menu souhaité, le nombre de convives, la date
                                et l'adresse de livraison.
                            </p>

                            <h3>4.2 Délai de commande</h3>
                            <p>
                                Toute commande doit être effectuée au minimum <strong>2 jours ouvrables</strong>
                                avant la date de prestation souhaitée, sauf accord exprès du Prestataire.
                                Ce délai peut être supérieur pour certains menus dont les caractéristiques
                                sont précisées sur la fiche du menu.
                            </p>

                            <h3>4.3 Nombre de convives minimum</h3>
                            <p>
                                Chaque menu est soumis à un nombre minimum de convives, indiqué sur la fiche
                                descriptive du menu. Aucune commande ne sera acceptée en dessous de ce seuil.
                            </p>

                            <h3>4.4 Confirmation de commande</h3>
                            <p>
                                La commande est confirmée dès réception par le Client d'un e-mail de confirmation
                                envoyé automatiquement par le système. Le contrat est réputé conclu à partir de
                                cet envoi.
                            </p>

                            <h2>5. Prix</h2>
                            <p>
                                Les prix sont exprimés en euros (€) toutes taxes comprises (TTC). Ils sont
                                calculés par personne et peuvent varier selon le menu choisi et le nombre de
                                convives.
                            </p>

                            <div className="legal-info-box">
                                <p>
                                    <strong>Remise quantité :</strong> Une remise de <strong>10 %</strong> est
                                    automatiquement appliquée lorsque le nombre de convives dépasse de plus de
                                    5 personnes le minimum requis pour le menu.
                                </p>
                            </div>

                            <p>
                                Les frais de livraison sont calculés en fonction de la distance et sont indiqués
                                au Client avant validation définitive de sa commande. Ils s'ajoutent au prix
                                total de la prestation.
                            </p>
                            <p>
                                Vite Gourmand se réserve le droit de modifier ses tarifs à tout moment.
                                Toutefois, les prix applicables sont ceux en vigueur au moment de la confirmation
                                de la commande.
                            </p>

                            <h2>6. Modalités de paiement</h2>
                            <p>
                                Le paiement s'effectue selon les modalités convenues entre le Prestataire et
                                le Client lors de la confirmation de commande (virement, espèces, chèque ou
                                autre moyen convenu). Le paiement en ligne sécurisé sera proposé ultérieurement.
                            </p>
                            <p>
                                En cas de défaut de paiement ou de paiement partiel, Vite Gourmand se réserve
                                le droit d'annuler la prestation.
                            </p>

                            <h2>7. Modification et annulation</h2>

                            <h3>7.1 Modification par le Client</h3>
                            <p>
                                Toute modification de commande (date, nombre de convives, adresse) doit être
                                demandée au moins <strong>48 heures</strong> avant la prestation. Les
                                modifications sont acceptées sous réserve de disponibilité et peuvent entraîner
                                un ajustement du prix.
                            </p>

                            <h3>7.2 Annulation par le Client</h3>
                            <p>
                                Les commandes peuvent être annulées via l'espace client tant qu'elles sont
                                au statut « En attente ». Passé ce stade, toute annulation doit être formulée
                                directement auprès du Prestataire.
                            </p>
                            <p>
                                En cas d'annulation tardive (moins de 48 heures avant la prestation), des frais
                                d'annulation correspondant à 30 % du montant total de la commande pourront
                                être retenus pour couvrir les frais engagés.
                            </p>

                            <h3>7.3 Annulation par le Prestataire</h3>
                            <p>
                                Vite Gourmand se réserve le droit d'annuler une prestation en cas de force
                                majeure (intempéries exceptionnelles, accident, indisponibilité imprévue). Le
                                Client sera prévenu dans les meilleurs délais et une date de report ou un
                                remboursement intégral lui sera proposé.
                            </p>

                            <h2>8. Livraison et prestation</h2>
                            <p>
                                La livraison est effectuée à l'adresse indiquée par le Client lors de la commande.
                                Le Client est responsable de l'exactitude de cette adresse et doit s'assurer
                                d'être présent ou représenté à l'heure convenue.
                            </p>
                            <p>
                                En cas d'absence du Client à l'adresse de livraison à l'heure convenue sans
                                préavis, Vite Gourmand ne pourra être tenu responsable et la prestation sera
                                considérée comme réalisée.
                            </p>

                            <h2>9. Location de matériel</h2>
                            <p>
                                Lorsque le Client demande la mise à disposition de matériel (option équipement),
                                celui-ci doit être restitué en bon état à la fin de la prestation. Tout matériel
                                endommagé, perdu ou non restitué sera facturé au Client selon les tarifs en vigueur.
                            </p>

                            <h2>10. Allergènes et régimes alimentaires</h2>
                            <p>
                                Les informations relatives aux allergènes sont disponibles sur la fiche de chaque
                                menu. Le Client est invité à signaler toute allergie ou contrainte alimentaire
                                lors de la commande. Vite Gourmand ne pourra être tenu responsable en cas
                                d'omission de cette information par le Client.
                            </p>

                            <h2>11. Responsabilité</h2>
                            <p>
                                La responsabilité de Vite Gourmand ne saurait être engagée en cas de force
                                majeure, de faute du Client ou d'un tiers, ni pour tout préjudice indirect
                                résultant de la prestation.
                            </p>
                            <p>
                                En tout état de cause, si la responsabilité de Vite Gourmand était retenue,
                                son montant ne pourrait excéder le montant total de la commande concernée.
                            </p>

                            <h2>12. Droit de rétractation</h2>
                            <p>
                                Conformément à l'article L.221-28 12° du Code de la consommation, le droit
                                de rétractation de 14 jours ne s'applique pas aux contrats de prestation de
                                services de restauration et de loisirs qui doivent être fournis à une date
                                ou une période déterminée. Toute annulation est donc régie par l'article 7
                                des présentes CGV.
                            </p>

                            <h2>13. Protection des données personnelles</h2>
                            <p id="confidentialite">
                                Dans le cadre de la relation commerciale, Vite Gourmand collecte et traite
                                les données personnelles du Client nécessaires à l'exécution de la prestation
                                (nom, prénom, e-mail, téléphone, adresse de livraison).
                            </p>
                            <p>
                                Ces données sont traitées conformément au RGPD. Pour en savoir plus sur la
                                gestion de vos données, consultez nos{' '}
                                <a href="/mentions-legales/#4-protection-des-données-personnelles">Mentions légales — section 4</a>.
                            </p>

                            <h2>14. Litiges et médiation</h2>
                            <p>
                                En cas de litige, le Client est invité à contacter Vite Gourmand en priorité
                                à l'adresse <a href="mailto:vitegourmand@gmail.com">vitegourmand@gmail.com</a>{' '}
                                afin de rechercher une solution amiable.
                            </p>
                            <p>
                                Conformément aux articles L.611-1 et suivants du Code de la consommation,
                                le Client consommateur peut, en cas d'échec de la réclamation amiable,
                                recourir gratuitement à un médiateur de la consommation.
                            </p>
                            <p>
                                Plateforme européenne de résolution des litiges en ligne :{' '}
                                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
                                    ec.europa.eu/consumers/odr
                                </a>
                            </p>

                            <h2>15. Droit applicable</h2>
                            <p>
                                Les présentes CGV sont soumises au droit français. En cas de litige non résolu
                                amiablement, les tribunaux de Bordeaux seront compétents.
                            </p>

                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default CGV;
