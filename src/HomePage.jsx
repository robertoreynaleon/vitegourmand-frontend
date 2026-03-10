import React, { useEffect, useState } from 'react';
import axios from 'axios';

function HomePage() {
    const [users, setUsers] = useState([]);
    const [menus, setMenus] = useState([]);
    const [dishes, setDishes] = useState([]);
    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [orderStatusHistory, setOrderStatusHistory] = useState([]);
    const [menuStats, setMenuStats] = useState([]);

    useEffect(() => {
        axios.get('http://vitegourmand.local/api/users')
            .then(res => setUsers(res.data['member'] || res.data['hydra:member'] || []))
            .catch(err => console.error(err));

        axios.get('http://vitegourmand.local/api/menus')
            .then(res => setMenus(res.data['member'] || res.data['hydra:member'] || []))
            .catch(err => console.error(err));

        axios.get('http://vitegourmand.local/api/dishes')
            .then(res => setDishes(res.data['member'] || res.data['hydra:member'] || []))
            .catch(err => console.error(err));

        axios.get('http://vitegourmand.local/api/orders')
            .then(res => setOrders(res.data['member'] || res.data['hydra:member'] || []))
            .catch(err => console.error(err));

        axios.get('http://vitegourmand.local/api/mongo/reviews')
            .then(res => setReviews(res.data))
            .catch(err => console.error(err));

        axios.get('http://vitegourmand.local/api/mongo/order_status_history')
            .then(res => setOrderStatusHistory(res.data))
            .catch(err => console.error(err));

        axios.get('http://vitegourmand.local/api/mongo/menu_stats')
            .then(res => setMenuStats(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h1>Bienvenue sur Vite & Gourmand</h1>
            <h2>Utilisateurs (test MySQL)</h2>

            <h2>Reviews (MongoDB)</h2>
            <ul>
                {reviews.map(review => (
                    <li key={review._id} style={{ marginBottom: '1em' }}>
                        <strong>ID:</strong> {review._id}<br/>
                        <strong>Order ID:</strong> {review.order_id}<br/>
                        <strong>User ID:</strong> {review.user_id}<br/>
                        <strong>Note:</strong> {review.rating}<br/>
                        <strong>Commentaire:</strong> {review.comment}<br/>
                        <strong>Créé le:</strong> {review.created_at}<br/>
                        <strong>Modifié le:</strong> {review.updated_at}
                    </li>
                ))}
            </ul>

            <h2>Order Status History (MongoDB)</h2>
            <ul>
                {orderStatusHistory.map(status => (
                    <li key={status._id} style={{ marginBottom: '1em' }}>
                        <strong>ID:</strong> {status._id}<br/>
                        <strong>Order ID:</strong> {status.order_id}<br/>
                        <strong>Status:</strong> {status.status}<br/>
                        <strong>Modifié par (user id):</strong> {status.changed_by}<br/>
                        <strong>Date de modification:</strong> {status.changed_at}
                    </li>
                ))}
            </ul>

            <h2>Menu Stats (MongoDB)</h2>
            <ul>
                {menuStats.map(stat => (
                    <li key={stat.order_id + '-' + stat.menu_id} style={{ marginBottom: '1em' }}>
                        <strong>Order ID:</strong> {stat.order_id}<br/>
                        <strong>User ID:</strong> {stat.user_id}<br/>
                        <strong>Menu ID:</strong> {stat.menu_id}<br/>
                        <strong>Menu:</strong> {stat.menu_name}<br/>
                        <strong>Quantité:</strong> {stat.quantity}<br/>
                        <strong>Total:</strong> {stat.total_price} €<br/>
                        <strong>Date de commande:</strong> {stat.order_date}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default HomePage;