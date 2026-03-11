import React from 'react';
import './Header.css';

function Header({ user }) {
    return (
            <header className="main-header">
                <div className="container">
                    <nav className="navbar">
                        <div className="logo">
                            <h1>VITE & GOURMAND</h1>
                        </div>

                        <div className="user-greeting">
                            {user && (
                                <ul>
                                    <li>BIENVENUE, <strong>{user.name}</strong></li>
                                </ul>
                            )}
                        </div>

                        <ul className="nav-menu">
                            {user && (
                                <li><a href="/auth/logout/">DÉCONNEXION</a></li>
                            )}
                            <li><a href="/">HOME</a></li>
                            <li><a href="/menu/list/">MENUS</a></li>
                            <li><a href="/auth/login/">CONNEXION</a></li>
                            <li><a href="/contact/">CONTACT</a></li>
                            {user && user.role_id === 3 && (
                                <>
                                    {/* Client : accès au compte et panier */}
                                    <li><a href="/user/dashboard/">MON COMPTE</a></li>
                                    <li><a href="/cart/show/">🛒 PANIER</a></li>
                                </>
                            )}
                            {user && (user.role_id === 2 || user.role_id === 1) && (
                                <>
                                    {/* Employé : accès au dashboard staff uniquement */}
                                    <li><a href="/staff/dashboard/">ESPACE STAFF</a></li>
                                </>
                            )}
                        </ul>
                    </nav>
                </div>
            </header>
    );
}

export default Header;