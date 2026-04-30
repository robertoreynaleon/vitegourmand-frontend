import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import './OrderList.scss';

/** URL de l'API des commandes du client connecté. */
const API_USER_ORDERS  = `${process.env.REACT_APP_API_URL}/api/user/orders`;
const API_USER_REVIEWS = `${process.env.REACT_APP_API_URL}/api/reviews/my`;

function OrderList() {
    const { token } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const orderSuccess  = location.state?.orderSuccess  === true;
    const editSuccess   = location.state?.editSuccess   === true;
    const cancelSuccess = location.state?.cancelSuccess === true;
    const reviewSuccess = location.state?.reviewSuccess === true;
    const [orders, setOrders]               = useState([]);
    const [reviewedOrderIds, setReviewedOrderIds] = useState(new Set());
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState('');

    useEffect(() => {
        if (!token) return;
        const fetchData = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const [ordersRes, reviewsRes] = await Promise.all([
                    fetch(API_USER_ORDERS,  { headers }),
                    fetch(API_USER_REVIEWS, { headers }),
                ]);
                if (!ordersRes.ok) throw new Error('Erreur lors du chargement des commandes.');
                const ordersData  = await ordersRes.json();
                setOrders(ordersData);
                if (reviewsRes.ok) {
                    const reviewsData = await reviewsRes.json();
                    setReviewedOrderIds(new Set(reviewsData.map((r) => r.order_id)));
                }
            } catch (e) {
                setError(e.message || 'Une erreur est survenue.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    return (
        <div className="menu-page-wrapper orders-list-wrapper">
            <Header />
            <main>
                <div className="container">
                    <div className="orders-list-content">

                        <h1 className="orders-list-title">Mes commandes</h1>

                        {orderSuccess && (
                            <p className="form-success orders-list-success" role="status" aria-live="polite">
                                Votre commande a bien été enregistrée. Un email de confirmation vous a été envoyé.
                            </p>
                        )}

                        {editSuccess && (
                            <p className="form-success orders-list-success" role="status" aria-live="polite">
                                Votre commande a bien été mise à jour. Un email de confirmation vous a été envoyé.
                            </p>
                        )}

                        {cancelSuccess && (
                            <p className="form-success orders-list-success" role="status" aria-live="polite">
                                Votre commande a bien été annulée. Un email de confirmation vous a été envoyé.
                            </p>
                        )}

                        {reviewSuccess && (
                            <p className="form-success orders-list-success" role="status" aria-live="polite">
                                Votre commentaire a bien été enregistré. Il sera publié après validation par notre équipe.
                            </p>
                        )}

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
                                        <span className={`orders-list-status orders-list-status--${order.status.replace(/[\s'éèêà]+/g, '-')}`}>
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
                                {order.status === 'en attente' && (
                                    <div className="orders-list-card-actions">
                                        <Link
                                            to={`/user/orders/${order.id}/edit/`}
                                            className="orders-list-btn-edit"
                                        >
                                            Voir ma commande
                                        </Link>
                                    </div>
                                )}

                                {order.status === 'terminée' && !reviewedOrderIds.has(order.id) && (
                                    <div className="orders-list-card-actions">
                                        <Link
                                            to={`/user/reviews/create/${order.id}`}
                                            state={{ deliveryDate: order.deliveryDate }}
                                            className="orders-list-btn-review"
                                        >
                                            Laisser un commentaire
                                        </Link>
                                    </div>
                                )}
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
