import React, { useEffect, useState } from 'react';
import axios from 'axios';

function HomePage() {
    const [users, setUsers] = useState([]);
    const [menus, setMenus] = useState([]);

    useEffect(() => {
        axios.get('http://vitegourmand.local/api/users')
            .then(res => setUsers(res.data['member'] || res.data['hydra:member'] || []))
            .catch(err => console.error(err));

        axios.get('http://vitegourmand.local/api/menus')
            .then(res => setMenus(res.data['member'] || res.data['hydra:member'] || []))
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
        </div>
    );
}

export default HomePage;