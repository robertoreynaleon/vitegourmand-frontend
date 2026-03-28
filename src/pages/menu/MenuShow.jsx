import React, { useEffect, useMemo, useState } from "react";
import { useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageLoader from '../../components/PageLoader';
import './MenuShow.scss';

const API_MENUS = 'http://vitegourmand.local/api/menus';
const API_DISHES = 'http://vitegourmand.local/api/dishes';

function MenuShow() {
    const { id } = useParams();
    const [menu, setMenu] = useState(null);
    const [dishesById, setDishesById] = useState({});
    const [menuLoaded, setMenuLoaded] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [dishesLoaded, setDishesLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    useEffect(() => {
        if (!id) {
            setError('Menu introuvable.');
            setMenuLoaded(true);
            setImagesLoaded(true);
            setDishesLoaded(true);
            return;
        }

        const controller = new AbortController();
        setMenuLoaded(false);
        setImagesLoaded(false);
        setDishesLoaded(false);
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
                setMenuLoaded(true);
            })
            .catch((err) => {
                if (err.name === 'AbortError') return;
                setError(err.message);
                setMenuLoaded(true);
                setImagesLoaded(true);
                setDishesLoaded(true);
            });

        return () => controller.abort();
    }, [id]);

    useEffect(() => {
        if (!menu || !Array.isArray(menu.menuDishes)) {
            setDishesLoaded(true);
            return;
        }

        const dishIds = menu.menuDishes
            .map((item) => item?.dish?.id)
            .filter((dishId) => dishId);

        const uniqueDishIds = Array.from(new Set(dishIds));
        if (uniqueDishIds.length === 0) {
            setDishesLoaded(true);
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
                setDishesLoaded(true);
            })
            .catch(() => {
                setDishesById((prev) => ({ ...prev }));
                setDishesLoaded(true);
            });

        return () => controller.abort();
    }, [menu]);

    useEffect(() => {
        setActiveImageIndex(0);
    }, [menu]);

    useEffect(() => {
        if (!menu) {
            return;
        }

        const imageList = Array.isArray(menu.images)
            ? menu.images.filter((image) => image?.imagePath)
            : [];

        if (imageList.length === 0) {
            setImagesLoaded(true);
            return;
        }

        let isActive = true;
        const preloaders = imageList.map((image) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve;
                img.src = image.imagePath;
            });
        });

        Promise.all(preloaders).then(() => {
            if (isActive) {
                setImagesLoaded(true);
            }
        });

        return () => {
            isActive = false;
        };
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
    const images = Array.isArray(menu?.images) ? menu.images.filter((image) => image?.imagePath) : [];
    const canNavigateImages = images.length > 1;
    const isPageLoading = !error && (!menuLoaded || !imagesLoaded || !dishesLoaded);

    const handlePrevImage = () => {
        if (!canNavigateImages) return;
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleNextImage = () => {
        if (!canNavigateImages) return;
        setActiveImageIndex((prev) => (prev + 1) % images.length);
    };

    const handleOpenLightbox = () => {
        if (images.length === 0) return;
        setIsLightboxOpen(true);
    };

    const handleCloseLightbox = () => {
        setIsLightboxOpen(false);
    };

    return (
        <div className="menu-page-wrapper menu-show-page">
            <Header />
            <main className="menu-show-content">
                <div className="container">
                    {isPageLoading && <PageLoader message="Chargement du menu..." />}
                    {error && <p className="error-message">Erreur : {error}</p>}

                    {!isPageLoading && !error && !menu && (
                        <p className="no-menu-message">Menu introuvable.</p>
                    )}

                    {!isPageLoading && !error && menu && (
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
                        <div className="menu-show-carousel">
                            <div className="menu-show-media">
                                {images.length > 0 ? (
                                    <button
                                        type="button"
                                        className="menu-show-media-btn"
                                        onClick={handleOpenLightbox}
                                        aria-label="Agrandir la photo"
                                    >
                                        <img
                                            src={images[activeImageIndex].imagePath}
                                            alt={images[activeImageIndex].altText || menu.title || 'Photo du menu'}
                                        />
                                    </button>
                                ) : (
                                    <div className="menu-show-media-placeholder" aria-hidden="true"></div>
                                )}
                                <div className="menu-show-nav">
                                    <button
                                        type="button"
                                        onClick={handlePrevImage}
                                        aria-label="Photo precedente"
                                        disabled={!canNavigateImages}
                                    >
                                        ‹
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNextImage}
                                        aria-label="Photo suivante"
                                        disabled={!canNavigateImages}
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                            {images.length > 1 && (
                                <div className="menu-show-thumbs" aria-label="Miniatures du menu">
                                    {images.map((image, index) => (
                                        <button
                                            key={image.id || image.imagePath}
                                            type="button"
                                            className={`menu-show-thumb${index === activeImageIndex ? ' is-active' : ''}`}
                                            onClick={() => setActiveImageIndex(index)}
                                            aria-label={`Afficher la photo ${index + 1}`}
                                        >
                                            <img
                                                src={image.imagePath}
                                                alt={image.altText || menu.title || 'Miniature du menu'}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                    {isLightboxOpen && images.length > 0 && (
                        <div className="menu-show-lightbox" role="dialog" aria-modal="true">
                            <button
                                type="button"
                                className="menu-show-lightbox-close"
                                onClick={handleCloseLightbox}
                                aria-label="Fermer la photo"
                            >
                                ×
                            </button>
                            <img
                                src={images[activeImageIndex].imagePath}
                                alt={images[activeImageIndex].altText || menu.title || 'Photo du menu'}
                            />
                        </div>
                    )}

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
                            <div className="menu-price-show">
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