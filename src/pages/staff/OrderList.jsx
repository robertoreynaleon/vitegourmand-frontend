import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import SearchBar from './SearchBar';
import './OrderList.scss';

const API_STAFF_ORDERS = `${process.env.REACT_APP_API_URL}/api/staff/orders`;

/**
 * Page de liste des commandes pour le staff.
 * Affiche toutes les commandes avec leurs statuts et permet de les filtrer
 * (numéro, client, date, heure, statut) via la SearchBar.
 * Chaque commande est un lien vers la page de traitement.
 */
function StaffOrderList() {
    const { token } = useAuth();
    const location = useLocation();
    const [treatSuccess, setTreatSuccess] = useState(location.state?.treatSuccess === true);
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [filters, setFilters] = useState({ number: '', client: '', date: '', time: '', status: '' });

    useEffect(() => {
        if (!token) return;
        const fetchOrders = async () => {
            try {
                const res = await fetch(API_STAFF_ORDERS, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Erreur lors du chargement.');
                }
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

    const displayedOrders = useMemo(() => {
        return orders.filter((order) => {
            if (filters.number && !String(order.id).includes(filters.number.trim())) return false;
            if (filters.client && !order.clientName.toLowerCase().includes(filters.client.trim().toLowerCase())) return false;
            if (filters.date && !(order.deliveryDate || '').includes(filters.date.trim())) return false;
            if (filters.time && !(order.deliveryTime || '').includes(filters.time.trim())) return false;
            if (filters.status && order.status !== filters.status) return false;
            return true;
        });
    }, [orders, filters]);

    return (
        <div className="staff-orders-page">
            <Header />

            <main>
                <section className="staff-orders-section">
                    <div className="container">

                        <h1 className="staff-orders-title">Gestion des commandes</h1>

                        {treatSuccess && (
                            <div className="staff-orders-success" role="status" aria-live="polite">
                                <p>La commande a bien été traitée.</p>
                                <button
                                    className="staff-orders-success__close"
                                    onClick={() => setTreatSuccess(false)}
                                    aria-label="Fermer le message de succès"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        <Link to="/staff/dashboard/" className="staff-orders-back">
                            ← Retour au tableau de bord
                        </Link>

                        {loading && (
                            <p className="staff-orders-loading" aria-live="polite">
                                Chargement des commandes…
                            </p>
                        )}

                        {error && (
                            <p className="staff-orders-error" role="alert">{error}</p>
                        )}

                        {!loading && !error && (
                            <>
                                <SearchBar filters={filters} onChange={setFilters} />

                                <p className="staff-orders-count" aria-live="polite" aria-atomic="true">
                                    {displayedOrders.length} commande{displayedOrders.length !== 1 ? 's' : ''}
                                    {orders.length !== displayedOrders.length && ` sur ${orders.length}`}
                                </p>

                                {orders.length === 0 && (
                                    <p className="staff-orders-empty">Aucune commande enregistrée.</p>
                                )}

                                {orders.length > 0 && displayedOrders.length === 0 && (
                                    <p className="staff-orders-empty">Aucune commande ne correspond aux filtres.</p>
                                )}

                                {displayedOrders.length > 0 && (
                                    <div className="staff-orders-table-wrapper" role="region" aria-label="Liste des commandes">
                                        <table className="staff-orders-table">
                                            <thead>
                                                <tr>
                                                    <th scope="col">N°</th>
                                                    <th scope="col">Client</th>
                                                    <th scope="col">Date commande</th>
                                                    <th scope="col">Date livraison</th>
                                                    <th scope="col">Heure</th>
                                                    <th scope="col">Statut</th>
                                                    <th scope="col">Montant</th>
                                                    <th scope="col"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {displayedOrders.map((order) => (
                                                    <tr key={order.id}>
                                                        <td data-label="N° Commande">
                                                            <span className="staff-orders-id">#{order.id}</span>
                                                        </td>
                                                        <td data-label="Client">{order.clientName}</td>
                                                        <td data-label="Date commande">{order.orderDate}</td>
                                                        <td data-label="Date livraison">{order.deliveryDate}</td>
                                                        <td data-label="Heure de livraison">{order.deliveryTime}</td>
                                                        <td data-label="Statut">
                                                            <span className={`staff-orders-status staff-orders-status--${order.status.replace(/[\s'éèêàù]+/g, '-')}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td data-label="Montant total" className="staff-orders-amount">
                                                            {parseFloat(order.totalAmount).toLocaleString('fr-FR', {
                                                                style: 'currency',
                                                                currency: 'EUR',
                                                            })}
                                                        </td>
                                                        <td data-label="Infos">
                                                            <Link
                                                                to={`/staff/orders/${order.id}/treat/`}
                                                                className="staff-orders-btn-detail"
                                                                aria-label={`Voir le détail de la commande #${order.id}`}
                                                            >
                                                                Commande
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default StaffOrderList;
