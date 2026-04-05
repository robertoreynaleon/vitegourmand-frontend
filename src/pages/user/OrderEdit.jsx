import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import {
    hasDiscount,
    subtotalBeforeDiscount,
    subtotal,
    cartSubtotal,
    cartTotal,
    formatPrice,
    DISCOUNT_THRESHOLD,
} from '../../services/cartCalc';
import { calculateDeliveryFee } from '../../services/delivery';
import DatePicker from '../../components/DatePicker';
import TimePicker from '../../components/TimePicker';
import './OrderEdit.scss';

const API_ORDER      = (id) => `http://vitegourmand.local/api/orders/${id}/detail`;
const API_ORDER_EDIT = (id) => `http://vitegourmand.local/api/orders/${id}/edit`;
const API_ORDER_CANCEL = (id) => `http://vitegourmand.local/api/orders/${id}/cancel`;

/**
 * Formate une date de commande pour l'affichage.
 * Accepte le format français (dd/mm/yyyy à hh:mm) ou ISO (2026-04-05T...).
 */
function formatOrderDate(dateStr) {
    if (!dateStr) return '';
    // Déjà au format français → on retourne tel quel
    if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) return dateStr;
    // Format ISO → on convertit
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day   = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year  = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins  = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} à ${hours}:${mins}`;
}

function OrderEdit() {
    const { id } = useParams();
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading]         = useState(true);
    const [fetchError, setFetchError]   = useState('');
    const [orderMeta, setOrderMeta]     = useState(null); // { id, orderDate, status }

    const [cart, setCart]                     = useState([]);
    const [deliveryDate, setDeliveryDate]     = useState('');
    const [deliveryTime, setDeliveryTime]     = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryFee, setDeliveryFee]       = useState(0);
    const [deliveryInfo, setDeliveryInfo]     = useState(null);
    const [deliveryLoading, setDeliveryLoading] = useState(false);
    const [deliveryError, setDeliveryError]   = useState('');

    const [suggestions, setSuggestions]       = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [isSubmitting, setIsSubmitting]     = useState(false);
    const [isCancelling, setIsCancelling]     = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [submitError, setSubmitError]       = useState('');

    const addressWrapperRef = useRef(null);
    const debounceRef       = useRef(null);
    const suggestAbortRef   = useRef(null);

    // ─── Chargement de la commande ───────────────────────────────────────────
    useEffect(() => {
        if (!token) return;
        const fetchOrder = async () => {
            try {
                const res = await fetch(API_ORDER(id), {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Commande introuvable.');
                const data = await res.json();

                setOrderMeta({
                    id:        data.id,
                    orderDate: formatOrderDate(data.orderDate),
                    status:    data.status,
                });
                setCart(data.items || []);
                setDeliveryDate(data.deliveryDate || '');
                setDeliveryTime(data.deliveryTime || '');
                setDeliveryAddress(data.deliveryAddress || '');
                setDeliveryFee(parseFloat(data.deliveryFee) || 0);
            } catch (e) {
                setFetchError(e.message || 'Erreur lors du chargement.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, token]);

    // ─── Fermeture suggestions au clic extérieur ─────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (addressWrapperRef.current && !addressWrapperRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ─── Calcul des frais de livraison ───────────────────────────────────────
    const triggerDeliveryCalc = useCallback(async (address) => {
        const trimmed = address.trim();
        if (!trimmed) return;
        setDeliveryLoading(true);
        setDeliveryError('');
        const result = await calculateDeliveryFee(trimmed);
        if (result.success) {
            setDeliveryFee(result.deliveryFee);
            setDeliveryInfo(result);
        } else {
            setDeliveryError(result.error);
            setDeliveryFee(0);
            setDeliveryInfo(null);
        }
        setDeliveryLoading(false);
    }, []);

    const handleAddressChange = (e) => {
        const value = e.target.value;
        setDeliveryAddress(value);
        setDeliveryInfo(null);
        setDeliveryFee(0);
        setDeliveryError('');

        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (suggestAbortRef.current) suggestAbortRef.current.abort();

        if (value.trim().length < 5) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const controller = new AbortController();
        suggestAbortRef.current = controller;
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&limit=5`,
                    { signal: controller.signal }
                );
                const data = await res.json();
                const items = (data.features || []).map((f) => ({
                    label: f.properties.label,
                    city: f.properties.city || f.properties.name,
                }));
                setSuggestions(items);
                setShowSuggestions(items.length > 0);
            } catch {
                // AbortError ignorée silencieusement
            }
        }, 300);
    };

    const handleSuggestionSelect = (label) => {
        setDeliveryAddress(label);
        setSuggestions([]);
        setShowSuggestions(false);
        triggerDeliveryCalc(label);
    };

    const handleQuantityChange = (menuId, minPeople, rawValue) => {
        let qty = parseInt(rawValue, 10);
        if (isNaN(qty) || qty < minPeople) qty = minPeople;
        setCart((prev) =>
            prev.map((item) =>
                item.menuId === menuId ? { ...item, quantity: qty } : item
            )
        );
    };

    // ─── Calculs ─────────────────────────────────────────────────────────────
    const menusSubtotal = cartSubtotal(cart);
    const total         = cartTotal(cart, deliveryFee);

    const maxAdvanceDays = cart.reduce(
        (max, item) => Math.max(max, item.advanceOrderDays ?? 2),
        2
    );
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + maxAdvanceDays);
    const minDateStr = minDate.toISOString().split('T')[0];

    const canSave =
        deliveryDate &&
        deliveryTime &&
        deliveryAddress.trim() &&
        deliveryFee > 0 &&
        cart.length > 0;

    // ─── Enregistrement des modifications ───────────────────────────────────
    const handleSave = async () => {
        if (!canSave || isSubmitting) return;
        setIsSubmitting(true);
        setSubmitError('');
        const payload = {
            deliveryDate:    deliveryDate,
            deliveryTime:    deliveryTime,
            deliveryAddress: deliveryAddress,
            subtotal:        menusSubtotal,
            deliveryFee:     deliveryFee,
            totalAmount:     total,
            items: cart.map((item) => ({
                menuId:         item.menuId,
                quantity:       item.quantity,
                pricePerPerson: item.pricePerPerson,
            })),
        };
        try {
            const res = await fetch(API_ORDER_EDIT(id), {
                method: 'PUT',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                setSubmitError(data.message || 'Erreur lors de la modification.');
                return;
            }
            navigate('/user/orders/', { state: { editSuccess: true } });
        } catch {
            setSubmitError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Annulation de la commande ───────────────────────────────────────────
    const handleCancel = async () => {
        setIsCancelling(true);
        setSubmitError('');
        try {
            const res = await fetch(API_ORDER_CANCEL(id), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const data = await res.json();
                setSubmitError(data.message || 'Erreur lors de l\'annulation.');
                setShowCancelConfirm(false);
                return;
            }
            navigate('/user/orders/', { state: { cancelSuccess: true } });
        } catch {
            setSubmitError('Une erreur est survenue. Veuillez réessayer.');
            setShowCancelConfirm(false);
        } finally {
            setIsCancelling(false);
        }
    };

    // ─── États de chargement / erreur ────────────────────────────────────────
    if (loading) {
        return (
            <div className="menu-page-wrapper order-edit-wrapper">
                <Header />
                <main>
                    <div className="container">
                        <p className="order-edit-loading" aria-live="polite">Chargement de la commande…</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="menu-page-wrapper order-edit-wrapper">
                <Header />
                <main>
                    <div className="container">
                        <p className="order-edit-fetch-error" role="alert">{fetchError}</p>
                        <Link to="/user/orders/" className="order-edit-back">← Retour à mes commandes</Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // ─── Page principale ─────────────────────────────────────────────────────
    return (
        <div className="menu-page-wrapper order-edit-wrapper">
            <Header />
            <main>
                <div className="container">
                    <div className="order-edit-content">

                        <h1 className="order-edit-title">Modifier ma commande</h1>

                        {/* Bandeau d'information */}
                        <div className="order-edit-notice" role="note">
                            <p className="order-edit-notice-headline">
                                Commande #{orderMeta.id} — Créée le {orderMeta.orderDate}
                            </p>
                            <p className="order-edit-notice-text">
                                Cette commande peut être modifiée car elle est encore en attente de validation.
                            </p>
                        </div>

                        {/* Menus du panier */}
                        {cart.map((item) => {
                            const disc     = hasDiscount(item);
                            const subBefore = subtotalBeforeDiscount(item);
                            const sub      = subtotal(item);
                            return (
                                <div key={item.menuId} className="order-item-card">
                                    <div className="order-item-header">
                                        <h2 className="order-item-title">{item.menuTitle}</h2>
                                    </div>

                                    <p className="order-item-info">
                                        <strong>Prix unitaire :</strong>{' '}
                                        {formatPrice(item.pricePerPerson)} / personne
                                    </p>
                                    <p className="order-item-info">
                                        <strong>Minimum requis :</strong> {item.minPeople} personnes
                                    </p>

                                    <div className="order-quantity-row">
                                        <label htmlFor={`qty-${item.menuId}`}>
                                            <strong>Quantité commandée :</strong>
                                        </label>
                                        <input
                                            id={`qty-${item.menuId}`}
                                            type="number"
                                            min={item.minPeople}
                                            max={100}
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleQuantityChange(
                                                    item.menuId,
                                                    item.minPeople,
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <small>Minimum : {item.minPeople} personnes</small>
                                    </div>

                                    {disc && (
                                        <div className="order-discount-badge">
                                            Réduction de 10 % appliquée ! (Plus de{' '}
                                            {item.minPeople + DISCOUNT_THRESHOLD} personnes)
                                        </div>
                                    )}
                                    {disc && (
                                        <p className="order-price-crossed">{formatPrice(subBefore)}</p>
                                    )}
                                    <p className="order-subtotal">
                                        <strong>Sous-total :</strong> {formatPrice(sub)}
                                    </p>
                                </div>
                            );
                        })}

                        {/* Détails de livraison */}
                        <div className="order-delivery-section">
                            <h2>Détails de livraison souhaités</h2>

                            <div className="order-form-group">
                                <label htmlFor="delivery_date">
                                    Date de livraison souhaitée :
                                </label>
                                <DatePicker
                                    id="delivery_date"
                                    value={deliveryDate}
                                    onChange={setDeliveryDate}
                                    minDate={minDateStr}
                                />
                                <small>
                                    Minimum {maxAdvanceDays} jour{maxAdvanceDays > 1 ? 's' : ''} à l'avance
                                </small>
                            </div>

                            <div className="order-form-group">
                                <label htmlFor="delivery_time">
                                    Heure de livraison souhaitée :
                                </label>
                                <TimePicker
                                    id="delivery_time"
                                    value={deliveryTime}
                                    onChange={setDeliveryTime}
                                />
                                <small>Entre 8h00 et 20h00</small>
                            </div>

                            <div className="order-form-group">
                                <label htmlFor="delivery_address">
                                    Adresse de livraison :
                                </label>
                                <div className="order-address-wrapper" ref={addressWrapperRef}>
                                    <input
                                        id="delivery_address"
                                        type="text"
                                        className="order-address-input"
                                        placeholder="Saisissez l'adresse complète de livraison"
                                        value={deliveryAddress}
                                        onChange={handleAddressChange}
                                        autoComplete="off"
                                        aria-autocomplete="list"
                                        aria-controls="address-suggestions"
                                        aria-expanded={showSuggestions}
                                    />
                                    {showSuggestions && (
                                        <ul
                                            id="address-suggestions"
                                            className="order-address-suggestions"
                                            role="listbox"
                                            aria-label="Suggestions d'adresse"
                                        >
                                            {suggestions.map((s, i) => (
                                                <li key={i} role="option">
                                                    <button
                                                        type="button"
                                                        className="order-address-suggestion-btn"
                                                        onMouseDown={() => handleSuggestionSelect(s.label)}
                                                    >
                                                        {s.label}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <small>
                                    Les frais se calculent automatiquement après sélection d'une adresse
                                </small>
                            </div>

                            <div className="order-delivery-fee">
                                {deliveryLoading && <p>⏳ Calcul en cours...</p>}
                                {deliveryError && (
                                    <p className="order-error">{deliveryError}</p>
                                )}
                                {!deliveryLoading && deliveryInfo && (
                                    <p>
                                        <strong>Frais de livraison :</strong>{' '}
                                        {formatPrice(deliveryFee)}
                                        {deliveryInfo.isBordeaux
                                            ? ' (Bordeaux)'
                                            : ` (${deliveryInfo.city} — ${deliveryInfo.distance} km)`}
                                    </p>
                                )}
                                {!deliveryLoading && !deliveryInfo && !deliveryError && deliveryFee > 0 && (
                                    <p>
                                        <strong>Frais de livraison actuels :</strong>{' '}
                                        {formatPrice(deliveryFee)}
                                    </p>
                                )}
                                {!deliveryLoading && !deliveryInfo && !deliveryError && deliveryFee === 0 && (
                                    <p>Modifiez l'adresse pour recalculer les frais de livraison</p>
                                )}
                            </div>
                        </div>

                        {/* Récapitulatif total */}
                        <div className="order-total-section">
                            <h2>💳 Prix total de la commande</h2>

                            <div className="order-price-details">
                                {cart.map((item) => {
                                    const disc = hasDiscount(item);
                                    return (
                                        <p key={item.menuId} className="order-price-line">
                                            {item.menuTitle} — {item.quantity} ×{' '}
                                            {formatPrice(item.pricePerPerson)} / pers.
                                            {disc && ' (−10 %)'}
                                            {' = '}
                                            {formatPrice(subtotal(item))}
                                        </p>
                                    );
                                })}
                            </div>

                            <p className="order-subtotal-line">
                                <strong>Sous-total menus :</strong> {formatPrice(menusSubtotal)}
                            </p>
                            <p className="order-delivery-line">
                                <strong>Frais de livraison :</strong> {formatPrice(deliveryFee)}
                            </p>
                            <p className="order-grand-total">
                                <strong>Total : {formatPrice(total)}</strong>
                            </p>
                        </div>

                        {/* Actions */}
                        {submitError && (
                            <p className="order-error order-error--submit" role="alert">{submitError}</p>
                        )}

                        <div className="order-edit-actions">
                            <Link to="/user/orders/" className="order-btn-continue">
                                ← Retour à mes commandes
                            </Link>
                            <button
                                type="button"
                                className="order-btn-validate"
                                disabled={!canSave || isSubmitting}
                                onClick={handleSave}
                                aria-busy={isSubmitting}
                            >
                                {isSubmitting ? 'Enregistrement...' : '✓ Enregistrer les modifications'}
                            </button>
                            <button
                                type="button"
                                className="order-edit-btn-cancel"
                                onClick={() => setShowCancelConfirm(true)}
                                aria-haspopup="dialog"
                            >
                                Annuler ma commande
                            </button>
                        </div>

                        {/* Modale de confirmation d'annulation */}
                        {showCancelConfirm && (
                            <div
                                className="order-edit-confirm"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="cancel-confirm-title"
                            >
                                <p id="cancel-confirm-title" className="order-edit-confirm__text">
                                    Êtes-vous sûr de vouloir annuler la commande #{orderMeta.id} ? Cette action est irréversible.
                                </p>
                                <div className="order-edit-confirm__actions">
                                    <button
                                        type="button"
                                        className="order-edit-confirm__btn-confirm"
                                        onClick={handleCancel}
                                        disabled={isCancelling}
                                        aria-busy={isCancelling}
                                    >
                                        {isCancelling ? 'Annulation...' : 'Oui, annuler la commande'}
                                    </button>
                                    <button
                                        type="button"
                                        className="order-edit-confirm__cancel"
                                        onClick={() => setShowCancelConfirm(false)}
                                        disabled={isCancelling}
                                        autoFocus
                                    >
                                        Garder la commande
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default OrderEdit;
