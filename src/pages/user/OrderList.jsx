import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import './OrderList.scss';

const API_USER_ORDERS = 'http://vitegourmand.local/api/user/orders';

function OrderList() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) return;
        const fetchOrders = async () => {
            try {
                const res = await fetch(API_USER_ORDERS, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Erreur lors du chargement des commandes.');
                const data = await res.json();
                setOrders(data);
            } catch (e) {
                setError(e.message || 'Une erreur est survenue.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [token]);

    return (
        <div className="menu-page-wrapper orders-list-wrapper">
            <Header />
            <main>
                <div className="container">
                    <div className="orders-list-content">

                        <h1 className="orders-list-title">Mes commandes</h1>

                        <Link to="/user/dashboard/" className="orders-list-back">
                            ← Retour au tableau de bord
                        </Link>

                        {loading && (
                            <p className="orders-list-loading" aria-live="polite">
                                Chargement de vos commandes…
                            </p>
                        )}

                        {error && (
                            <p className="orders-list-error" role="alert">{error}</p>
                        )}

                        {!loading && !error && orders.length === 0 && (
                            <div className="orders-list-empty">
                                <p className="orders-list-empty-text">
                                    Vous n'avez pas encore de commandes.
                                </p>
                                <Link to="/menu/list/" className="orders-list-empty-link">
                                    Découvrir nos menus
                                </Link>
                            </div>
                        )}

                        {orders.map((order) => (
                            <article key={order.id} className="orders-list-card" aria-label={`Commande numéro ${order.id}`}>
                                <h2 className="orders-list-card-title">Commande #{order.id}</h2>
                                <ul className="orders-list-card-info">
                                    <li>
                                        <span className="orders-list-label">Date de commande :</span>
                                        <span className="orders-list-value">{order.orderDate}</span>
                                    </li>
                                    <li>
                                        <span className="orders-list-label">Date de livraison :</span>
                                        <span className="orders-list-value">
                                            {order.deliveryDate} à {order.deliveryTime}
                                        </span>
                                    </li>
                                    <li>
                                        <span className="orders-list-label">Adresse de livraison :</span>
                                        <span className="orders-list-value">{order.deliveryAddress}</span>
                                    </li>
                                    <li>
                                        <span className="orders-list-label">Statut :</span>
                                        <span className={`orders-list-status orders-list-status--${order.status.replace(/[\s']+/g, '-')}`}>
                                            {order.status}
                                        </span>
                                    </li>
                                    <li>
                                        <span className="orders-list-label">Montant total :</span>
                                        <span className="orders-list-value orders-list-total">
                                            {parseFloat(order.totalAmount).toLocaleString('fr-FR', {
                                                style: 'currency',
                                                currency: 'EUR',
                                            })}
                                        </span>
                                    </li>
                                </ul>
                            </article>
                        ))}

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default OrderList;
