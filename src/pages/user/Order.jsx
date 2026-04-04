import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import {
    loadCart,
    removeFromCart,
    updateCartQuantity,
    hasDiscount,
    subtotalBeforeDiscount,
    subtotal,
    cartSubtotal,
    cartTotal,
    formatPrice,
    DISCOUNT_THRESHOLD,
} from '../../services/cartCalc';
import { calculateDeliveryFee } from '../../services/delivery';

function Order() {
    const { user } = useAuth();

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

    // Chargement initial depuis localStorage
    useEffect(() => {
        setCart(loadCart());
    }, []);

    const handleRemove = (menuId) => {
        setCart(removeFromCart(menuId));
    };

    const handleQuantityChange = (menuId, minPeople, rawValue) => {
        let qty = parseInt(rawValue, 10);
        if (isNaN(qty) || qty < minPeople) qty = minPeople;
        setCart(updateCartQuantity(menuId, qty));
    };

    // Calcul des frais de livraison au blur de l'adresse
    const handleAddressBlur = useCallback(async () => {
        const trimmed = deliveryAddress.trim();
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
    }, [deliveryAddress]);

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
            <div className="order-page-wrapper">
                <Header />
                <main>
                    <div className="container">
                        <h1>Mon panier</h1>
                        <p>Votre panier est vide.</p>
                        <Link to="/menu/list/">Découvrir nos menus</Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // ─── Panier avec items ───────────────────────────────────────────────────────
    return (
        <div className="order-page-wrapper">
            <Header />
            <main>
                <div className="container">
                    <h1>Mon panier</h1>

                    {/* Date de la commande */}
                    <div className="order-date-section">
                        <p>📅 Date de la commande : {orderDate}</p>
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
                                        🎉 Réduction de 10 % appliquée ! (Plus de{' '}
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
                        <h2>📋 Informations de livraison</h2>
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
                        <h2>🚚 Détails de livraison souhaités</h2>

                        <div className="order-form-group">
                            <label htmlFor="delivery_date">
                                Date de livraison souhaitée :
                            </label>
                            <input
                                id="delivery_date"
                                type="date"
                                min={minDateStr}
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                            />
                            <small>
                                Minimum {maxAdvanceDays} jour{maxAdvanceDays > 1 ? 's' : ''} à l'avance
                            </small>
                        </div>

                        <div className="order-form-group">
                            <label htmlFor="delivery_time">
                                Heure de livraison souhaitée :
                            </label>
                            <input
                                id="delivery_time"
                                type="time"
                                min="08:00"
                                max="20:00"
                                value={deliveryTime}
                                onChange={(e) => setDeliveryTime(e.target.value)}
                            />
                            <small>Entre 8h00 et 20h00</small>
                        </div>

                        <div className="order-form-group">
                            <label htmlFor="delivery_address">
                                Adresse de livraison :
                            </label>
                            <input
                                id="delivery_address"
                                type="text"
                                placeholder="Saisissez l'adresse complète de livraison"
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                onBlur={handleAddressBlur}
                            />
                            <small>
                                Les frais se calculent automatiquement après modification
                            </small>
                        </div>

                        <div className="order-delivery-fee">
                            {deliveryLoading && <p>⏳ Calcul en cours...</p>}
                            {deliveryError && (
                                <p className="order-error">{deliveryError}</p>
                            )}
                            {!deliveryLoading && deliveryInfo && (
                                <p>
                                    🚚 <strong>Frais de livraison :</strong>{' '}
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
                    <div className="order-actions">
                        <Link to="/menu/list/" className="order-btn-continue">
                            ← Continuer mes achats
                        </Link>
                        <button
                            type="button"
                            className="order-btn-validate"
                            disabled={!canValidate}
                        >
                            ✓ Valider ma commande
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default Order;
