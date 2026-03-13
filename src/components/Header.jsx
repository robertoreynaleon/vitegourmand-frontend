import React, { useRef } from 'react';
import { useScrollHeader, scrollToAnchor } from '../hooks/useScrollHeader';
import './Header.scss';

function Header({ user }) {
    const headerRef = useRef(null);
    const { scrolled } = useScrollHeader();

    const handleAnchorClick = (e, href) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const height = headerRef.current ? headerRef.current.offsetHeight : 0;
            scrollToAnchor(href, height);
        }
    };

    return (
        <header
            ref={headerRef}
            className={`main-header${scrolled ? ' scrolled' : ''}`}
        >
            <div className="container">
                <nav className="navbar" aria-label="Navigation principale">
                    <div className="logo">
                        <h1 aria-hidden="true">VITE & GOURMAND</h1>
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
                        <li><a href="/" onClick={(e) => handleAnchorClick(e, '/')}>HOME</a></li>
                        <li><a href="/menu/list/">MENUS</a></li>
                        <li><a href="/auth/login/">CONNEXION</a></li>
                        <li><a href="/contact/">CONTACT</a></li>
                        {user && user.role_id === 3 && (
                            <>
                                <li><a href="/user/dashboard/">MON COMPTE</a></li>
                                <li><a href="/cart/show/">🛒 PANIER</a></li>
                            </>
                        )}
                        {user && (user.role_id === 2 || user.role_id === 1) && (
                            <>
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
