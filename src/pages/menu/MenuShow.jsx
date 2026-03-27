import React, { useEffect, useMemo, useState } from "react";
import { useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const API_MENUS = 'http://vitegourmand.local/api/menus';
const API_DISHES = 'http://vitegourmand.local/api/dishes';

function MenuShow() {
    const { id } = useParams();
    const [menu, setMenu] = useState(null);
    const [dishesById, setDishesById] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) {
            setError('Menu introuvable.');
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        setLoading(true);
        setError(null);

        fetch(`${API_MENUS}/${id}`, {
            headers: { Accept: 'application/ld+json' },
            signal: controller.signal
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                setMenu(data);
                setLoading(false);
            })
            .catch((err) => {
                if (err.name === 'AbortError') return;
                setError(err.message);
                setLoading(false);
            });

        return () => controller.abort();
    }, [id]);

    useEffect(() => {
        if (!menu || !Array.isArray(menu.menuDishes)) {
            return;
        }

        const dishIds = menu.menuDishes
            .map((item) => item?.dish?.id)
            .filter((dishId) => dishId);

        const uniqueDishIds = Array.from(new Set(dishIds));
        if (uniqueDishIds.length === 0) {
            return;
        }

        const controller = new AbortController();

        Promise.all(
            uniqueDishIds.map((dishId) =>
                fetch(`${API_DISHES}/${dishId}`, {
                    headers: { Accept: 'application/ld+json' },
                    signal: controller.signal
                })
                    .then((res) => {
                        if (!res.ok) {
                            throw new Error(`HTTP ${res.status}`);
                        }
                        return res.json();
                    })
                    .then((dish) => [dishId, dish])
            )
        )
            .then((entries) => {
                const nextMap = entries.reduce((acc, [dishId, dish]) => {
                    acc[dishId] = dish;
                    return acc;
                }, {});
                setDishesById((prev) => ({ ...prev, ...nextMap }));
            })
            .catch(() => {
                setDishesById((prev) => ({ ...prev }));
            });

        return () => controller.abort();
    }, [menu]);

    const dishTypeLabels = useMemo(() => ({
        entree: 'Entree',
        plat_principal: 'Plat principal',
        dessert: 'Dessert'
    }), []);

    const normalizeDishType = (value) => {
        if (!value) return '';
        return value
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    };

    const compositionItems = useMemo(() => {
        const menuDishes = Array.isArray(menu?.menuDishes) ? menu.menuDishes : [];
        const targetTypes = ['entree', 'plat_principal', 'dessert'];

        return targetTypes.map((typeKey) => {
            const entry = menuDishes.find((item) => normalizeDishType(item?.dishType) === typeKey);
            const dishId = entry?.dish?.id;
            const dish = dishId ? dishesById[dishId] : entry?.dish;
            const allergens = Array.isArray(dish?.allergens)
                ? dish.allergens.map((allergen) => allergen?.label).filter(Boolean)
                : [];

            return {
                key: typeKey,
                title: dishTypeLabels[typeKey],
                name: dish?.title || 'Non defini',
                allergens: allergens.length > 0 ? allergens : ['Aucun']
            };
        });
    }, [menu, dishesById, dishTypeLabels]);

    const pricePerPerson = menu?.pricePerPerson ? Number(menu.pricePerPerson) : null;
    const minPeople = typeof menu?.minPeople === 'number' ? menu.minPeople : null;
    const minOrderPrice = pricePerPerson && minPeople ? pricePerPerson * minPeople : null;

    return (
        <div className="menu-show-page">
            <Header />
            <main className="menu-show-content">
                <div className="container">
                    {loading && <p className="loading-message">Chargement du menu...</p>}
                    {error && <p className="error-message">Erreur : {error}</p>}

                    {!loading && !error && !menu && (
                        <p className="no-menu-message">Menu introuvable.</p>
                    )}

                    {!loading && !error && menu && (
                        <>
                    <section className="menu-show-hero">
                        <div className="menu-show-heading">
                            <p className="menu-show-kicker">Detail du menu</p>
                            <h1 className="menu-show-title">{menu.title || 'Menu'}</h1>
                            <div className="menu-show-regime">
                                <span className="menu-info-label">Regime : </span>
                                <span className="regime-badge">{menu.regime?.label || '—'}</span>
                            </div>
                        </div>
                    </section>

                    <section className="menu-show-gallery" aria-label="Photos du menu">
                        <div className="menu-show-gallery-grid">
                            {Array.isArray(menu.images) && menu.images.length > 0 ? (
                                menu.images.map((image) => (
                                    <figure key={image.id} className="menu-show-photo">
                                        <img
                                            src={image.imagePath}
                                            alt={image.altText || menu.title || 'Photo du menu'}
                                        />
                                    </figure>
                                ))
                            ) : (
                                <>
                                    <div className="menu-show-photo" aria-hidden="true"></div>
                                    <div className="menu-show-photo" aria-hidden="true"></div>
                                    <div className="menu-show-photo" aria-hidden="true"></div>
                                </>
                            )}
                        </div>
                    </section>

                    <section className="menu-show-summary">
                        <div className="menu-info">
                            <span className="menu-info-label">Nombre minimum : </span>
                            <span>{minPeople !== null ? `${minPeople} personnes` : '—'}</span>
                        </div>
                        <div className="menu-description">
                            <div className="menu-description-title">Description :</div>
                            <p className="menu-description-text">
                                {menu.description || 'Description non disponible.'}
                            </p>
                        </div>
                    </section>

                    <section className="menu-show-composition" aria-label="Composition du menu">
                        <h2 className="menu-section-title">Composition</h2>
                        <div className="menu-composition-grid">
                            {compositionItems.map((item) => (
                                <article key={item.key} className="menu-composition-card">
                                    <h3 className="menu-composition-title">{item.title}</h3>
                                    <p className="menu-composition-name">{item.name}</p>
                                    <div className="menu-composition-allergens">
                                        <span className="menu-info-label">Allergenes : </span>
                                        <span>{item.allergens.join(', ')}</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="menu-show-stock">
                        <div className="menu-stock">
                            <span className="menu-info-label">Stock disponible : </span>
                            <span className={(menu.remainingQuantity ?? 0) > 10 ? 'stock-available' : 'stock-low'}>
                                {typeof menu.remainingQuantity !== 'undefined' && menu.remainingQuantity !== null
                                    ? menu.remainingQuantity
                                    : 'Non defini'}
                            </span>
                        </div>
                    </section>

                    <section className="menu-show-pricing" aria-label="Informations de commande">
                        <h2 className="menu-section-title">Commande</h2>
                        <div className="menu-pricing-grid">
                            <div className="menu-price">
                                {pricePerPerson !== null ? `${pricePerPerson.toFixed(2)} € / pers.` : '-- € / pers.'}
                            </div>
                            <div className="menu-pricing-info">
                                <div className="menu-info">
                                    <span className="menu-info-label">Delai de demande : </span>
                                    <span>{menu.advanceOrderDays ? `${menu.advanceOrderDays} jours` : '—'}</span>
                                </div>
                                <div className="menu-info">
                                    <span className="menu-info-label">Commande minimum : </span>
                                    <span>
                                        {minPeople !== null ? `${minPeople} personnes` : '—'}
                                        {minOrderPrice !== null ? ` - ${minOrderPrice.toFixed(2)} €` : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="menu-show-actions">
                            <a href="/order" className="menu-action-btn">Commander</a>
                            <a href="/menu/list/" className="menu-action-secondary">Retour aux menus</a>
                        </div>
                    </section>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default MenuShow;