import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import {
    loadCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
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
import './Order.scss';

const API_ORDERS = 'http://vitegourmand.local/api/orders/create';

/**
 * Page de commande (panier).
 * Affiche le contenu du panier localStorage, le récapitulatif des prix et des réductions,
 * le formulaire de livraison (adresse géolocalisée), le sélecteur de date et d'heure,
 * et finalise la commande via l'API après validation.
 */
function Order() {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [orderDate] = useState(() => new Date().toLocaleString('fr-FR'));

    // Livraison
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [deliveryInfo, setDeliveryInfo] = useState(null);
    const [deliveryLoading, setDeliveryLoading] = useState(false);
    const [deliveryError, setDeliveryError] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const addressWrapperRef = useRef(null);
    // Ref pour annuler le debounce en cours
    const debounceRef = useRef(null);
    // Ref pour annuler la requête suggestions en cours
    const suggestAbortRef = useRef(null);

    // Chargement initial depuis localStorage
    useEffect(() => {
        setCart(loadCart());
    }, []);

    // Fermeture de la liste de suggestions au clic extérieur
    useEffect(() => {
        const handler = (e) => {
            if (addressWrapperRef.current && !addressWrapperRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Calcul automatique des frais après sélection ou debounce
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

        // Annuler le debounce précédent
        if (debounceRef.current) clearTimeout(debounceRef.current);
        // Annuler la requête de suggestions précédente
        if (suggestAbortRef.current) suggestAbortRef.current.abort();

        if (value.trim().length < 5) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        // Suggestions en temps réel (debounce 300 ms)
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
        // Calcul immédiat des frais
        triggerDeliveryCalc(label);
    };

    const handleValidateOrder = async () => {
        if (!canValidate || isSubmitting) return;
        setIsSubmitting(true);
        setSubmitError('');
        const payload = {
            orderDate:       new Date().toISOString(),
            deliveryDate:    deliveryDate,
            deliveryTime:    deliveryTime,
            deliveryAddress: deliveryAddress,
            subtotal:        menusSubtotal,
            deliveryFee:     deliveryFee,
            totalAmount:     total,
            equipmentLoan:   false,
            items: cart.map((item) => ({
                menuId:         item.menuId,
                quantity:       item.quantity,
                pricePerPerson: item.pricePerPerson,
            })),
        };
        try {
            const res = await fetch(API_ORDERS, {
                method: 'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                setSubmitError(data.message || 'Erreur lors de la commande.');
                return;
            }
            clearCart();
            navigate('/user/orders/', { state: { orderSuccess: true } });
        } catch {
            setSubmitError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemove = (menuId) => {
        setCart(removeFromCart(menuId));
    };

    const handleQuantityChange = (menuId, minPeople, rawValue) => {
        let qty = parseInt(rawValue, 10);
        if (isNaN(qty) || qty < minPeople) qty = minPeople;
        setCart(updateCartQuantity(menuId, qty));
    };

    const menusSubtotal = cartSubtotal(cart);
    const total = cartTotal(cart, deliveryFee);

    // Délai minimum = maximum des advanceOrderDays de tous les menus du panier
    const maxAdvanceDays = cart.reduce(
        (max, item) => Math.max(max, item.advanceOrderDays ?? 2),
        2
    );
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + maxAdvanceDays);
    const minDateStr = minDate.toISOString().split('T')[0];

    const canValidate =
        cart.length > 0 &&
        deliveryDate &&
        deliveryTime &&
        deliveryAddress.trim() &&
        deliveryFee > 0;

    // ─── Panier vide ────────────────────────────────────────────────────────────
    if (cart.length === 0) {
        return (
            <div className="menu-page-wrapper order-page-wrapper">
                <Header />
                <main>
                    <div className="container">
                    <div className="order-content">
                        <h1 className="order-page-title">Mon panier</h1>
                        <div className="order-empty">
                            <p className="order-empty-text">Votre panier est vide.</p>
                            <Link to="/menu/list/" className="order-empty-link">Découvrir nos menus</Link>
                        </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // ─── Panier avec items ───────────────────────────────────────────────────────
    return (
        <div className="menu-page-wrapper order-page-wrapper">
            <Header />
            <main>
                <div className="container">
                    <div className="order-content">
                    <h1 className="order-page-title">Mon panier</h1>

                    {/* Date de la commande */}
                    <div className="order-date-section">
                        <p>Date de la commande : {orderDate}</p>
                    </div>

                    {/* Menus du panier */}
                    {cart.map((item) => {
                        const disc = hasDiscount(item);
                        const subBefore = subtotalBeforeDiscount(item);
                        const sub = subtotal(item);
                        return (
                            <div key={item.menuId} className="order-item-card">
                                <div className="order-item-header">
                                    <h2 className="order-item-title">{item.menuTitle}</h2>
                                    <button
                                        type="button"
                                        className="order-remove-btn"
                                        onClick={() => handleRemove(item.menuId)}
                                    >
                                        Retirer
                                    </button>
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

                    {/* Informations du client */}
                    <div className="order-customer-section">
                        <h2>Informations de livraison</h2>
                        <p>
                            <strong>Client :</strong> {user.name} {user.lastname}
                        </p>
                        <p>
                            <strong>Email :</strong> {user.email}
                        </p>
                        <p>
                            <strong>Adresse :</strong>{' '}
                            {user.address || 'Non renseignée'}
                            {(user.postalCode || user.city)
                                ? `, ${[user.postalCode, user.city].filter(Boolean).join(' ')}`
                                : ''}
                        </p>
                        <p>
                            <strong>Téléphone :</strong> {user.phone || 'Non renseigné'}
                        </p>
                    </div>

                    {/* Détails de livraison souhaitée */}
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
                            {!deliveryLoading && !deliveryInfo && !deliveryError && (
                                <p>Modifiez l'adresse pour calculer les frais de livraison</p>
                            )}
                        </div>
                    </div>

                    {/* Récapitulatif du prix total */}
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
                    <div className="order-actions">
                        <Link to="/menu/list/" className="order-btn-continue">
                            ← Continuer mes achats
                        </Link>
                        <button
                            type="button"
                            className="order-btn-validate"
                            disabled={!canValidate || isSubmitting}
                            onClick={handleValidateOrder}
                            aria-busy={isSubmitting}
                        >
                            {isSubmitting ? 'Enregistrement...' : '✓ Valider ma commande'}
                        </button>
                    </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default Order;
