import React, { useEffect, useState } from "react";
import Header from '../../components/Header';

import SearchBar from "./SearchBar";
import Footer from '../../components/Footer';
import './MenuList.scss';


const API_MENUS = 'http://vitegourmand.local/api/menus';

function MenuList() {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fetchUrl, setFetchUrl] = useState(`${API_MENUS}${window.location.search || ''}`);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(fetchUrl, {
            headers: { Accept: 'application/ld+json' }
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                const list = Array.isArray(data) ? data : (data['hydra:member'] || data.member || []);
                setMenus(list);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [fetchUrl]);

    const handleSearch = (queryString) => {
        const nextUrl = queryString ? `${API_MENUS}?${queryString}` : API_MENUS;
        setFetchUrl(nextUrl);
    };

    return (
        <div className="menu-page-wrapper">
            <Header />

            <main>
                <SearchBar onSearch={handleSearch} />
                {/* Section d'affichage des menus */}
                <section className="menu-page">
                    <div className="container">

                        {loading && <p className="loading-message">Chargement des menus...</p>}
                        {error && <p className="error-message">Erreur : {error}</p>}

                        {!loading && !error && menus.length === 0 && (
                            <p className="no-menu-message">Aucun menu disponible pour le moment.</p>
                        )}

                        {!loading && !error && menus.length > 0 && (
                            <div className="menu-grid">
                                {menus.map((menu) => (
                                    <div key={menu.id} className="menu-card">
                                        {/* En-tête de la carte */}
                                        <div className="menu-card-header">
                                            <h2 className="menu-card-title">{menu.title}</h2>
                                        </div>

                                        {/* Corps de la carte */}
                                        <div className="menu-card-body">
                                            {/* Régime */}
                                            <div className="menu-info">
                                                <span className="menu-info-label">Régime : </span>
                                                <span className="regime-badge">{menu.regime && menu.regime.label ? menu.regime.label : '—'}</span>
                                            </div>

                                            {/* Nombre minimum */}
                                            <div className="menu-info">
                                                <span className="menu-info-label">Nombre minimum : </span>
                                                <span>{typeof menu.minPeople !== 'undefined' ? menu.minPeople : '—'} personnes</span>
                                            </div>

                                            {/* Description */}
                                            {menu.description && (
                                                <div className="menu-description">
                                                    <div className="menu-description-title">Description :</div>
                                                    <p className="menu-description-text">{menu.description}</p>
                                                </div>
                                            )}

                                            {/* Prix */}
                                            <div className="menu-price">
                                                {menu.pricePerPerson !== undefined && menu.pricePerPerson !== null ? Number(menu.pricePerPerson).toFixed(2) : '--'} € / pers.
                                            </div>

                                            {/* Stock */}
                                            <div className="menu-stock">
                                                <span className="menu-info-label">Stock restant : </span>
                                                <span className={(menu.remainingQuantity ?? 0) > 10 ? 'stock-available' : 'stock-low'}>
                                                    {typeof menu.remainingQuantity !== 'undefined' && menu.remainingQuantity !== null ? menu.remainingQuantity : 'Non défini'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Pied de carte */}
                                        <div className="menu-card-footer">
                                            <a href={`/menu/show/${menu.id}`} className="menu-detail-btn">
                                                Voir les détails
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default MenuList;