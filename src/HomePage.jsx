import React, { useEffect, useState } from 'react';
import axios from 'axios';

function HomePage() {
    const [users, setUsers] = useState([]);
    const [menus, setMenus] = useState([]);
    const [dishes, setDishes] = useState([]);
    const [orders, setOrders] = useState([]);

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
    }, []);

    return (
        <div>
            <h1>Bienvenue sur Vite & Gourmand</h1>
            <h2>Utilisateurs (test MySQL)</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id} style={{marginBottom: '1em'}}>
                        <strong>ID:</strong> {user.id}<br/>
                        <strong>Nom:</strong> {user.name} {user.lastname}<br/>
                        <strong>Email:</strong> {user.email}<br/>
                        <strong>Téléphone:</strong> {user.phone}<br/>
                        <strong>Adresse:</strong> {user.address}, {user.city} {user.postalCode}<br/>
                        <strong>Role:</strong> {user.role}<br/>
                        <strong>Orders:</strong> {user.orders && user.orders.length > 0 ? (
                          <ul>{user.orders.map(order => <li key={order}>{order}</li>)}</ul>
                        ) : 'Aucune'}<br/>
                        <strong>User Identifier:</strong> {user.userIdentifier}<br/>
                        <strong>Roles:</strong> {user.roles && user.roles.length > 0 ? user.roles.join(', ') : ''}
                    </li>
                ))}
            </ul>
            <h2>Menus (test MySQL)</h2>
            <ul>
                {menus.map(menu => (
                    <li key={menu.id} style={{marginBottom: '1em'}}>
                        <strong>ID:</strong> {menu.id}<br/>
                        <strong>Titre:</strong> {menu.title}<br/>
                        <strong>Description:</strong> {menu.description}<br/>
                        <strong>Prix par personne:</strong> {menu.pricePerPerson} €<br/>
                        <strong>Nombre minimum de personnes:</strong> {menu.minPeople}<br/>
                        <strong>Quantité restante:</strong> {menu.remainingQuantity}<br/>
                        <strong>Délai de commande (jours):</strong> {menu.advanceOrderDays}
                    </li>
                ))}
            </ul>
            <h2>Plats (test MySQL)</h2>
            <ul>
                {dishes.map(dish => (
                    <li key={dish.id} style={{marginBottom: '1em'}}>
                        <strong>ID:</strong> {dish.id}<br/>
                        <strong>Nom:</strong> {dish.name || dish.title}<br/>
                    </li>
                ))}
            </ul>
            <h2>Commandes (test MySQL)</h2>
            <ul>
                {orders.map(order => (
                    <li key={order.id} style={{marginBottom: '1em'}}>
                        <strong>ID:</strong> {order.id}<br/>
                        <strong>Utilisateur:</strong> {order.user}<br/>
                        <strong>Date de commande:</strong> {order.orderDate}<br/>
                        <strong>Heure de livraison:</strong> {order.deliveryTime}<br/>
                        <strong>Adresse de livraison:</strong> {order.deliveryAddress}<br/>
                        <strong>Subtotal :</strong> {order.subtotal} €<br/>
                        <strong>Prix de livraison:</strong> {order.deliveryFee} €<br/>
                        <strong>Total:</strong> {order.totalAmount} €<br/>
                        <strong>Equipement :</strong> {order.equipmentLoan ? 'Oui' : 'Non'}<br/>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default HomePage;