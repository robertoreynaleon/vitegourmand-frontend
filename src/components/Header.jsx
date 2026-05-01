import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollHeader, scrollToAnchor } from '../hooks/useScrollHeader';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './Header.scss';

/**
 * En-tête principal de l'application.
 * Affiche le logo, la navigation et les liens adaptés au rôle de l'utilisateur connecté
 * (client, staff, admin ou non connecté). Gère le menu hamburger mobile,
 * le scroll (ajout de la classe « scrolled ») et la navigation vers les ancres de la page d'accueil.
 */
function Header() {
    const { user, logout } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    /**
     * Déconnecte l'utilisateur, ferme le menu mobile et redirige vers l'accueil.
     */
    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        showNotification('Vous avez ete deconnecte. A bientot\u00a0!', 'error');
        setMenuOpen(false);
        navigate('/');
    };
    const headerRef = useRef(null);
    const { scrolled } = useScrollHeader();

    /**
     * Gère le clic sur un lien de navigation.
     * Si le lien pointe vers une ancre (#...), fait défiler la page en douceur
     * en tenant compte de la hauteur fixe du header. Ferme le menu mobile dans tous les cas.
     */
    const handleAnchorClick = (e, href) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const height = headerRef.current ? headerRef.current.offsetHeight : 0;
            scrollToAnchor(href, height);
        }
        setMenuOpen(false);
    };

    /** Ferme le menu mobile (utilisé sur les liens simples sans comportement spécial). */
    const closeMenu = () => setMenuOpen(false);

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
                        {user && user.roles?.includes('ROLE_CLIENT') && (
                            <ul>
                                <li>BIENVENUE, <strong>{user.name}</strong></li>
                            </ul>
                        )}
                    </div>

                    <button
                        className={`hamburger${menuOpen ? ' hamburger--open' : ''}`}
                        aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                        aria-expanded={menuOpen}
                        aria-controls="nav-menu"
                        onClick={() => setMenuOpen((prev) => !prev)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <ul id="nav-menu" className={`nav-menu${menuOpen ? ' nav-menu--open' : ''}`}>
                        {user && (
                            <li className="nav-greeting">BONJOUR, <strong>{user.name}</strong></li>
                        )}
                        <li><a href="/" onClick={(e) => handleAnchorClick(e, '/')}>HOME</a></li>
                        <li><a href="/menu/list/" onClick={closeMenu}>MENUS</a></li>
                        {!user && (
                            <li><a href="/auth/login/" onClick={closeMenu}>CONNEXION</a></li>
                        )}
                        {user && user.roles?.includes('ROLE_CLIENT') && (
                            <li><a href="/user/dashboard/" onClick={closeMenu}>MON COMPTE</a></li>
                        )}
                        {user && (user.roles?.includes('ROLE_STAFF_MEMBER') || user.roles?.includes('ROLE_ADMIN')) && (
                            <li><a href="/staff/dashboard/" onClick={closeMenu}>STAFF</a></li>
                        )}
                        {user && (
                            <li><button onClick={handleLogout} className="nav-logout-btn">DÉCONNEXION</button></li>
                        )}
                        <li><a href="/contact/" onClick={closeMenu}>CONTACT</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
