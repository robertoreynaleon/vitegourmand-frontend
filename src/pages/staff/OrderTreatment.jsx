import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import './OrderTreatment.scss';

const API_ORDER      = (id) => `http://vitegourmand.local/api/staff/orders/${id}`;
const API_ORDER_TREAT = (id) => `http://vitegourmand.local/api/staff/orders/${id}/treat`;

const STATUS_OPTIONS = [
    { value: 'en attente',                      label: 'En attente' },
    { value: 'acceptée',                        label: 'Acceptée' },
    { value: 'en préparation',                  label: 'En préparation' },
    { value: 'en cours de livraison',           label: 'En cours de livraison' },
    { value: 'livrée',                          label: 'Livrée' },
    { value: 'en attente de retour de matériel', label: 'En attente de retour de matériel' },
    { value: 'terminée',                        label: 'Terminée' },
    { value: 'annulée',                         label: 'Annulée' },
];

const MAX_MESSAGE = 500;

function OrderTreatment() {
    const { id }          = useParams();
    const { token }       = useAuth();
    const navigate        = useNavigate();

    const [loading, setLoading]       = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [order, setOrder]           = useState(null);

    // Champs modifiables
    const [status, setStatus]                     = useState('');
    const [equipmentLoan, setEquipmentLoan]       = useState(false);
    const [equipmentReturned, setEquipmentReturned] = useState(false);
    const [staffMessage, setStaffMessage]         = useState('');

    // Soumission
    const [isSaving, setIsSaving]     = useState(false);
    const [isRefusing, setIsRefusing] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [showRefuseConfirm, setShowRefuseConfirm] = useState(false);

    // ─── Chargement de la commande ─────────────────────────────────────────
    useEffect(() => {
        if (!token) return;
        const fetch_ = async () => {
            try {
                const res = await fetch(API_ORDER(id), {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    const d = await res.json();
                    throw new Error(d.message || 'Commande introuvable.');
                }
                const data = await res.json();
                setOrder(data);
                setStatus(data.status);
                setEquipmentLoan(data.equipmentLoan);
                setEquipmentReturned(data.equipmentReturned);
            } catch (e) {
                setFetchError(e.message || 'Erreur lors du chargement.');
            } finally {
                setLoading(false);
            }
        };
        fetch_();
    }, [id, token]);

    // ─── Soumission commune ────────────────────────────────────────────────
    const submitTreat = async (action) => {
        const isSave = action === 'update';
        if (isSave) setIsSaving(true);
        else        setIsRefusing(true);
        setSubmitError('');

        const payload = {
            action,
            status,
            equipmentLoan,
            equipmentReturned,
            staffMessage,
        };

        try {
            const res = await fetch(API_ORDER_TREAT(id), {
                method: 'PUT',
                headers: {
                    'Content-Type':  'application/json',
                    Authorization:   `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                setSubmitError(data.message || 'Erreur lors de la mise à jour.');
                return;
            }
            navigate('/staff/orders/', {
                state: { treatSuccess: true, orderId: id },
            });
        } catch {
            setSubmitError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsSaving(false);
            setIsRefusing(false);
            setShowRefuseConfirm(false);
        }
    };

    const canRefuse = staffMessage.trim().length > 0;

    // ─── Calculs tableau ───────────────────────────────────────────────────
    const formatEur = (val) =>
        parseFloat(val).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

    const rawSubtotal    = order ? order.items.reduce((acc, item) => acc + item.subtotal, 0) : 0;
    const storedSubtotal = order ? parseFloat(order.subtotal) : 0;
    const itemsHaveDiscount = rawSubtotal > storedSubtotal + 0.005;

    // ─── États ────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="staff-treatment-page">
                <Header />
                <main><div className="container">
                    <p className="staff-treatment-loading" aria-live="polite">Chargement…</p>
                </div></main>
                <Footer />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="staff-treatment-page">
                <Header />
                <main><div className="container">
                    <p className="staff-treatment-error" role="alert">{fetchError}</p>
                    <Link to="/staff/orders/" className="staff-treatment-back">← Retour aux commandes</Link>
                </div></main>
                <Footer />
            </div>
        );
    }

    const client = order.client;

    return (
        <div className="staff-treatment-page">
            <Header />

            <main>
                <section className="staff-treatment-section">
                    <div className="container">

                        <h1 className="staff-treatment-title">
                            Traitement de la commande <span>#{order.id}</span>
                        </h1>

                        <Link to="/staff/orders/" className="staff-treatment-back">
                            ← Retour aux commandes
                        </Link>

                        <div className="staff-treatment-grid">

                            {/* ── Infos client ─────────────────────────────── */}
                            <section className="staff-treatment-card" aria-labelledby="client-title">
                                <h2 id="client-title" className="staff-treatment-card__title">
                                    Informations client
                                </h2>
                                <ul className="staff-treatment-info-list">
                                    <li><span>Nom</span><span>{client.name} {client.lastname}</span></li>
                                    <li><span>Email</span><span>{client.email}</span></li>
                                    <li><span>Téléphone</span><span>{client.phone || '—'}</span></li>
                                    <li>
                                        <span>Adresse</span>
                                        <span>
                                            {client.address
                                                ? `${client.address}, ${client.postalCode} ${client.city}`
                                                : '—'}
                                        </span>
                                    </li>
                                </ul>
                            </section>

                            {/* ── Infos livraison ──────────────────────────── */}
                            <section className="staff-treatment-card" aria-labelledby="delivery-title">
                                <h2 id="delivery-title" className="staff-treatment-card__title">
                                    Informations de livraison
                                </h2>
                                <ul className="staff-treatment-info-list">
                                    <li><span>Date commande</span><span>{order.orderDate}</span></li>
                                    <li><span>Date livraison</span><span>{order.deliveryDate}</span></li>
                                    <li><span>Heure</span><span>{order.deliveryTime}</span></li>
                                    <li><span>Adresse</span><span>{order.deliveryAddress}</span></li>
                                </ul>
                            </section>

                            {/* ── Matériel ─────────────────────────────────── */}
                            <section className="staff-treatment-card" aria-labelledby="equipment-title">
                                <h2 id="equipment-title" className="staff-treatment-card__title">
                                    Prestation matériel
                                </h2>
                                <div className="staff-treatment-toggle-group">
                                    <div className="staff-treatment-toggle">
                                        <label htmlFor="equipment-loan" className="staff-treatment-toggle__label">
                                            Prêt de matériel accordé
                                        </label>
                                        <button
                                            id="equipment-loan"
                                            type="button"
                                            role="switch"
                                            aria-checked={equipmentLoan}
                                            className={`staff-treatment-toggle__btn${equipmentLoan ? ' staff-treatment-toggle__btn--on' : ''}`}
                                            onClick={() => setEquipmentLoan((v) => !v)}
                                        >
                                            <span className="staff-treatment-toggle__track" aria-hidden="true">
                                                <span className="staff-treatment-toggle__knob" />
                                            </span>
                                            <span className="staff-treatment-toggle__text">
                                                {equipmentLoan ? 'Oui' : 'Non'}
                                            </span>
                                        </button>
                                    </div>

                                    <div className="staff-treatment-toggle">
                                        <label htmlFor="equipment-returned" className="staff-treatment-toggle__label">
                                            Matériel restitué
                                        </label>
                                        <button
                                            id="equipment-returned"
                                            type="button"
                                            role="switch"
                                            aria-checked={equipmentReturned}
                                            className={`staff-treatment-toggle__btn${equipmentReturned ? ' staff-treatment-toggle__btn--on' : ''}`}
                                            onClick={() => setEquipmentReturned((v) => !v)}
                                        >
                                            <span className="staff-treatment-toggle__track" aria-hidden="true">
                                                <span className="staff-treatment-toggle__knob" />
                                            </span>
                                            <span className="staff-treatment-toggle__text">
                                                {equipmentReturned ? 'Oui' : 'Non'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* ── Statut ───────────────────────────────────── */}
                            <section className="staff-treatment-card" aria-labelledby="status-title">
                                <h2 id="status-title" className="staff-treatment-card__title">
                                    Statut de la commande
                                </h2>
                                <div className="staff-treatment-form-group">
                                    <label htmlFor="order-status" className="staff-treatment-label">
                                        Changer le statut :
                                    </label>
                                    <select
                                        id="order-status"
                                        className="staff-treatment-select"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        {STATUS_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </section>

                        </div>{/* /grid */}

                        {/* ── Tableau des articles ───────────────────────── */}
                        <section className="staff-treatment-card staff-treatment-card--full" aria-labelledby="items-title">
                            <h2 id="items-title" className="staff-treatment-card__title">
                                Détail de la commande
                            </h2>
                            <div className="staff-treatment-table-wrapper">
                                <table className="staff-treatment-table">
                                    <thead>
                                        <tr>
                                            <th scope="col">Menu</th>
                                            <th scope="col">Quantité</th>
                                            <th scope="col">Prix / pers.</th>
                                            <th scope="col">Sous-total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item, i) => (
                                            <tr key={i}>
                                                <td data-label="Menu">{item.menuTitle}</td>
                                                <td data-label="Quantité">{item.quantity}</td>
                                                <td data-label="Prix / pers.">{formatEur(item.pricePerPerson)}</td>
                                                <td data-label="Sous-total">{formatEur(item.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} className="staff-treatment-tfoot-label">
                                                Sous-total menus
                                                {itemsHaveDiscount && (
                                                    <span className="staff-treatment-discount-badge"> − 10 %</span>
                                                )}
                                            </td>
                                            <td>
                                                {itemsHaveDiscount && (
                                                    <span className="staff-treatment-price-crossed">{formatEur(rawSubtotal)}</span>
                                                )}
                                                {formatEur(storedSubtotal)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} className="staff-treatment-tfoot-label">Frais de livraison</td>
                                            <td>{formatEur(order.deliveryFee)}</td>
                                        </tr>
                                        <tr className="staff-treatment-tfoot-total">
                                            <td colSpan={3} className="staff-treatment-tfoot-label">
                                                <strong>Total</strong>
                                            </td>
                                            <td><strong>{formatEur(order.totalAmount)}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </section>

                        {/* ── Message au client ──────────────────────────── */}
                        <section className="staff-treatment-card staff-treatment-card--full" aria-labelledby="message-title">
                            <h2 id="message-title" className="staff-treatment-card__title">
                                Message au client
                            </h2>
                            <p className="staff-treatment-card__hint">
                                Ce message sera inclus dans l'email envoyé au client.
                                {' '}Obligatoire pour refuser la commande.
                            </p>
                            <div className="staff-treatment-form-group">
                                <label htmlFor="staff-message" className="staff-treatment-label">
                                    Message <span aria-hidden="true">({staffMessage.length}/{MAX_MESSAGE})</span>
                                    <span className="sr-only">({staffMessage.length} caractères sur {MAX_MESSAGE} maximum)</span>
                                </label>
                                <textarea
                                    id="staff-message"
                                    className="staff-treatment-textarea"
                                    rows={6}
                                    maxLength={MAX_MESSAGE}
                                    value={staffMessage}
                                    onChange={(e) => setStaffMessage(e.target.value)}
                                    placeholder="Écrivez un message à destination du client…"
                                    aria-describedby="message-hint"
                                />
                                <small id="message-hint" className="staff-treatment-hint">
                                    Maximum {MAX_MESSAGE} caractères.
                                </small>
                            </div>
                        </section>

                        {/* ── Erreur de soumission ───────────────────────── */}
                        {submitError && (
                            <p className="staff-treatment-submit-error" role="alert">{submitError}</p>
                        )}

                        {/* ── Boutons d'action ───────────────────────────── */}
                        <div className="staff-treatment-actions">
                            <button
                                type="button"
                                className="staff-treatment-btn staff-treatment-btn--save"
                                onClick={() => submitTreat('update')}
                                disabled={isSaving || isRefusing}
                                aria-busy={isSaving}
                            >
                                {isSaving ? 'Enregistrement…' : '✓ Enregistrer les modifications'}
                            </button>

                            <button
                                type="button"
                                className="staff-treatment-btn staff-treatment-btn--refuse"
                                onClick={() => setShowRefuseConfirm(true)}
                                disabled={!canRefuse || isSaving || isRefusing}
                                aria-disabled={!canRefuse}
                                aria-haspopup="dialog"
                                title={!canRefuse ? 'Un message est requis pour refuser la commande' : undefined}
                            >
                                ✕ Refuser la commande
                            </button>
                        </div>

                        {/* ── Modale confirmation refus ─────────────────── */}
                        {showRefuseConfirm && (
                            <div
                                className="staff-treatment-modal"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="refuse-modal-title"
                            >
                                <p id="refuse-modal-title" className="staff-treatment-modal__text">
                                    Confirmer le refus de la commande <strong>#{order.id}</strong> ?
                                    Un email sera envoyé au client avec votre message.
                                </p>
                                <div className="staff-treatment-modal__actions">
                                    <button
                                        type="button"
                                        className="staff-treatment-modal__confirm"
                                        onClick={() => submitTreat('refuse')}
                                        disabled={isRefusing}
                                        aria-busy={isRefusing}
                                    >
                                        {isRefusing ? 'Refus en cours…' : 'Confirmer le refus'}
                                    </button>
                                    <button
                                        type="button"
                                        className="staff-treatment-modal__cancel"
                                        onClick={() => setShowRefuseConfirm(false)}
                                        disabled={isRefusing}
                                        autoFocus
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default OrderTreatment;
