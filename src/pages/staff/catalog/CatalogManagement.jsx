import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../context/AuthContext';
import './CatalogManagement.scss';

// ─── Points d'accès API ───────────────────────────────────────────────────────
// Lecture — contrôleurs Symfony dédiés (JSON brut, toutes les entrées de la BDD)
const API_STAFF_REGIMES   = 'http://vitegourmand.local/api/staff/catalog/regimes';
const API_STAFF_DISHES    = 'http://vitegourmand.local/api/staff/catalog/dishes';
const API_STAFF_ALLERGENS = 'http://vitegourmand.local/api/staff/catalog/allergens';
const API_STAFF_MENUS     = 'http://vitegourmand.local/api/staff/catalog/menus';

// Écriture — API Platform (POST) + suppression (DELETE)
const API_REGIMES   = 'http://vitegourmand.local/api/regimes';
const API_DISHES    = 'http://vitegourmand.local/api/dishes';
const API_ALLERGENS = 'http://vitegourmand.local/api/allergens';

// ─── Sub-component: Feedback message ──────────────────────────────────────
function Feedback({ id, feedback }) {
    if (!feedback) return null;
    const isAlert = feedback.type === 'error' || feedback.type === 'warning';
    return (
        <p
            id={id}
            className={`catalog-feedback catalog-feedback--${feedback.type}`}
            role={isAlert ? 'alert' : 'status'}
            aria-live={isAlert ? 'assertive' : 'polite'}
        >
            {feedback.msg}
        </p>
    );
}

// ─── Composant principal ────────────────────────────────────────────────────────────
/**
 * Page de gestion du catalogue (regimes, plats, allèrgènes).
 * Permet au staff de créer, modifier et supprimer des régimes alimentaires,
 * des plats (avec leurs allèrgènes) et des allèrgènes de manière indépendante.
 */
function CatalogManagement() {
    const { token, logout } = useAuth();

    // ── Data ────────────────────────────────────────────────────────────────
    // regimes   : [{ id, label }]
    // dishes    : [{ id, title, allergenIds[] }]
    // allergens : [{ id, label, dishIds[] }]
    // menus     : [{ id, title, regimeId, dishIds[] }]
    const [regimes,   setRegimes]   = useState([]);
    const [dishes,    setDishes]    = useState([]);
    const [allergens, setAllergens] = useState([]);
    const [menus,     setMenus]     = useState([]);
    const [loadError, setLoadError] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    // ── Inputs ──────────────────────────────────────────────────────────────
    const [regimeInput,   setRegimeInput]   = useState('');
    const [dishInput,     setDishInput]     = useState('');
    const [allergenInput, setAllergenInput] = useState('');

    // ── Per-section feedback: { type: 'success'|'error'|'warning', msg } ───
    const [regimeFb,   setRegimeFb]   = useState(null);
    const [dishFb,     setDishFb]     = useState(null);
    const [allergenFb, setAllergenFb] = useState(null);

    // ── Per-section busy (prevents double-click) ────────────────────────────
    const [regimeBusy,   setRegimeBusy]   = useState(false);
    const [dishBusy,     setDishBusy]     = useState(false);
    const [allergenBusy, setAllergenBusy] = useState(false);

    // ── Feedback helper: auto-clear successes after 5 s ────────────────────
    const setFb = useCallback((setter, obj) => {
        setter(obj);
        if (obj?.type === 'success') {
            setTimeout(() => setter(null), 5000);
        }
    }, []);

    // ── Auth headers ────────────────────────────────────────────────────────
    const getHeaders = useCallback(() => ({
        Authorization: `Bearer ${token}`,
    }), [token]);

    // ── Initial data fetch ───────────────────────────────────────────────────
    useEffect(() => {
        if (!token) return;
        const h = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(API_STAFF_REGIMES,   { headers: h }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
            fetch(API_STAFF_DISHES,    { headers: h }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
            fetch(API_STAFF_ALLERGENS, { headers: h }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
            fetch(API_STAFF_MENUS,     { headers: h }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
        ])
        .then(([r, d, a, m]) => {
            setRegimes(Array.isArray(r) ? r : []);
            setDishes(Array.isArray(d) ? d : []);
            setAllergens(Array.isArray(a) ? a : []);
            setMenus(Array.isArray(m) ? m : []);
        })
        .catch(errCode => {
            if (errCode === 401) {
                logout();
                navigate('/auth/login/', { state: { sessionExpired: true } });
            } else {
                setLoadError('Erreur lors du chargement des données. Veuillez recharger la page.');
            }
        });
    }, [token, logout, navigate]);

    // ════════════════════════════════════════════════════════════════════════
    // ADD HANDLERS
    // ════════════════════════════════════════════════════════════════════════

    const handleAddRegime = async () => {
        const label = regimeInput.trim();
        if (!label) { setFb(setRegimeFb, { type: 'warning', msg: 'Le champ est vide.' }); return; }
        setRegimeBusy(true);
        setRegimeFb(null);
        try {
            const res = await fetch(API_REGIMES, {
                method: 'POST',
                headers: { ...getHeaders(), 'Content-Type': 'application/ld+json', Accept: 'application/ld+json' },
                body: JSON.stringify({ label }),
            });
            const json = await res.json();
            if (res.status === 201) {
                setRegimes(prev => [...prev, { id: json.id, label: json.label }].sort((a, b) => a.label.localeCompare(b.label, 'fr')));
                setRegimeInput('');
                setFb(setRegimeFb, { type: 'success', msg: `Régime « ${json.label} » ajouté avec succès.` });
            } else {
                throw new Error(json?.['hydra:description'] || json?.detail || 'Erreur lors de l\'ajout.');
            }
        } catch (e) {
            setFb(setRegimeFb, { type: 'error', msg: e.message });
        } finally {
            setRegimeBusy(false);
        }
    };

    const handleAddDish = async () => {
        const title = dishInput.trim();
        if (!title) { setFb(setDishFb, { type: 'warning', msg: 'Le champ est vide.' }); return; }
        setDishBusy(true);
        setDishFb(null);
        try {
            const res = await fetch(API_DISHES, {
                method: 'POST',
                headers: { ...getHeaders(), 'Content-Type': 'application/ld+json', Accept: 'application/ld+json' },
                body: JSON.stringify({ title }),
            });
            const json = await res.json();
            if (res.status === 201) {
                setDishes(prev => [...prev, { id: json.id, title: json.title, allergenIds: [] }].sort((a, b) => a.title.localeCompare(b.title, 'fr')));
                setDishInput('');
                setFb(setDishFb, { type: 'success', msg: `Plat « ${json.title} » ajouté avec succès.` });
            } else {
                throw new Error(json?.['hydra:description'] || json?.detail || 'Erreur lors de l\'ajout.');
            }
        } catch (e) {
            setFb(setDishFb, { type: 'error', msg: e.message });
        } finally {
            setDishBusy(false);
        }
    };

    const handleAddAllergen = async () => {
        const label = allergenInput.trim();
        if (!label) { setFb(setAllergenFb, { type: 'warning', msg: 'Le champ est vide.' }); return; }
        setAllergenBusy(true);
        setAllergenFb(null);
        try {
            const res = await fetch(API_ALLERGENS, {
                method: 'POST',
                headers: { ...getHeaders(), 'Content-Type': 'application/ld+json', Accept: 'application/ld+json' },
                body: JSON.stringify({ label }),
            });
            const json = await res.json();
            if (res.status === 201) {
                setAllergens(prev => [...prev, { id: json.id, label: json.label, dishIds: [] }].sort((a, b) => a.label.localeCompare(b.label, 'fr')));
                setAllergenInput('');
                setFb(setAllergenFb, { type: 'success', msg: `Allergène « ${json.label} » ajouté avec succès.` });
            } else {
                throw new Error(json?.['hydra:description'] || json?.detail || 'Erreur lors de l\'ajout.');
            }
        } catch (e) {
            setFb(setAllergenFb, { type: 'error', msg: e.message });
        } finally {
            setAllergenBusy(false);
        }
    };

    // ════════════════════════════════════════════════════════════════════════
    // DELETE HANDLERS (with usage check)
    // ════════════════════════════════════════════════════════════════════════

    const handleDeleteRegime = async (regime) => {
        // menus[].regimeId est directement un entier fourni par le contrôleur Symfony
        const isUsed = menus.some(m => m.regimeId === regime.id);
        if (isUsed) {
            setFb(setRegimeFb, {
                type: 'error',
                msg: 'Impossible de supprimer, ce régime fait partie d\'un menu existant.',
            });
            return;
        }
        setRegimeBusy(true);
        try {
            const res = await fetch(`${API_REGIMES}/${regime.id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            if (res.status === 204) {
                setRegimes(prev => prev.filter(r => r.id !== regime.id));
                setFb(setRegimeFb, { type: 'success', msg: `Régime « ${regime.label} » supprimé avec succès.` });
            } else {
                throw new Error('Erreur lors de la suppression.');
            }
        } catch (e) {
            setFb(setRegimeFb, { type: 'error', msg: e.message });
        } finally {
            setRegimeBusy(false);
        }
    };

    const handleDeleteDish = async (dish) => {
        // menus[].dishIds est un tableau d'entiers fourni par le contrôleur Symfony
        const isUsed = menus.some(m => (m.dishIds ?? []).includes(dish.id));
        if (isUsed) {
            setFb(setDishFb, {
                type: 'error',
                msg: 'Impossible de supprimer, ce plat fait partie d\'un menu existant.',
            });
            return;
        }
        setDishBusy(true);
        try {
            const res = await fetch(`${API_DISHES}/${dish.id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            if (res.status === 204) {
                setDishes(prev => prev.filter(d => d.id !== dish.id));
                setFb(setDishFb, { type: 'success', msg: `Plat « ${dish.title} » supprimé avec succès.` });
            } else {
                throw new Error('Erreur lors de la suppression.');
            }
        } catch (e) {
            setFb(setDishFb, { type: 'error', msg: e.message });
        } finally {
            setDishBusy(false);
        }
    };

    const handleDeleteAllergen = async (allergen) => {
        // allergens[].dishIds est un tableau d'entiers fourni par le contrôleur Symfony
        const isUsed = allergen.dishIds.length > 0;
        if (isUsed) {
            setFb(setAllergenFb, {
                type: 'error',
                msg: 'Impossible de supprimer, cet allergène fait partie d\'un plat existant.',
            });
            return;
        }
        setAllergenBusy(true);
        try {
            const res = await fetch(`${API_ALLERGENS}/${allergen.id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            if (res.status === 204) {
                setAllergens(prev => prev.filter(a => a.id !== allergen.id));
                setFb(setAllergenFb, { type: 'success', msg: `Allergène « ${allergen.label} » supprimé avec succès.` });
            } else {
                throw new Error('Erreur lors de la suppression.');
            }
        } catch (e) {
            setFb(setAllergenFb, { type: 'error', msg: e.message });
        } finally {
            setAllergenBusy(false);
        }
    };

    // ════════════════════════════════════════════════════════════════════════
    // RENDER
    // ════════════════════════════════════════════════════════════════════════

    return (
        <div className="catalog-page">
            <Header />

            <main>
                <section className="catalog-section">
                    <div className="container">

                        <h1 className="catalog-title">
                            Gestion du <span>catalogue</span>
                        </h1>

                        <Link to="/staff/dashboard/" className="catalog-back">
                            ← Retour au tableau de bord
                        </Link>

                        {location.state?.success && (
                            <p className="catalog-success-banner" role="status">{location.state.success}</p>
                        )}

                        {loadError && (
                            <p className="catalog-load-error" role="alert">{loadError}</p>
                        )}

                        <div className="catalog-grid">

                            {/* ══ RÉGIMES ═══════════════════════════════════════ */}
                            <article className="catalog-block" aria-labelledby="regimes-title">
                                <h2 id="regimes-title" className="catalog-block__title">
                                    Régimes alimentaires
                                </h2>

                                <div className="catalog-add-row">
                                    <label htmlFor="regime-input" className="sr-only">
                                        Ajoutez un nouveau régime
                                    </label>
                                    <input
                                        id="regime-input"
                                        type="text"
                                        className="catalog-add-input"
                                        value={regimeInput}
                                        onChange={e => setRegimeInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddRegime()}
                                        placeholder="Ajoutez un nouveau régime"
                                        aria-describedby="regime-fb"
                                        maxLength={50}
                                        autoComplete="off"
                                    />
                                    <button
                                        type="button"
                                        className="catalog-add-btn"
                                        onClick={handleAddRegime}
                                        disabled={regimeBusy}
                                        aria-label="Ajouter ce régime"
                                    >
                                        +
                                    </button>
                                </div>

                                <Feedback id="regime-fb" feedback={regimeFb} />

                                <table className="catalog-table">
                                    <thead>
                                        <tr>
                                            <th>Régime alimentaire</th>
                                            <th className="catalog-table__action-col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {regimes.length === 0 ? (
                                            <tr><td colSpan={2} className="catalog-table__empty">Aucun régime enregistré.</td></tr>
                                        ) : (
                                            regimes.map(r => (
                                                <tr key={r.id}>
                                                    <td>{r.label}</td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="catalog-delete-btn"
                                                            onClick={() => handleDeleteRegime(r)}
                                                            disabled={regimeBusy}
                                                            aria-label={`Supprimer le régime ${r.label}`}
                                                        >×</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </article>

                            {/* ══ PLATS ══════════════════════════════════════════ */}
                            <article className="catalog-block" aria-labelledby="dishes-title">
                                <h2 id="dishes-title" className="catalog-block__title">
                                    Plats
                                </h2>

                                <div className="catalog-add-row">
                                    <label htmlFor="dish-input" className="sr-only">
                                        Ajoutez un nouveau plat
                                    </label>
                                    <input
                                        id="dish-input"
                                        type="text"
                                        className="catalog-add-input"
                                        value={dishInput}
                                        onChange={e => setDishInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddDish()}
                                        placeholder="Ajoutez un nouveau plat"
                                        aria-describedby="dish-fb"
                                        maxLength={100}
                                        autoComplete="off"
                                    />
                                    <button
                                        type="button"
                                        className="catalog-add-btn"
                                        onClick={handleAddDish}
                                        disabled={dishBusy}
                                        aria-label="Ajouter ce plat"
                                    >
                                        +
                                    </button>
                                </div>

                                <Feedback id="dish-fb" feedback={dishFb} />

                                <table className="catalog-table">
                                    <thead>
                                        <tr>
                                            <th>Plat</th>
                                            <th className="catalog-table__action-col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dishes.length === 0 ? (
                                            <tr><td colSpan={2} className="catalog-table__empty">Aucun plat enregistré.</td></tr>
                                        ) : (
                                            dishes.map(d => (
                                                <tr key={d.id}>
                                                    <td>{d.title}</td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="catalog-delete-btn"
                                                            onClick={() => handleDeleteDish(d)}
                                                            disabled={dishBusy}
                                                            aria-label={`Supprimer le plat ${d.title}`}
                                                        >×</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </article>

                            {/* ══ ALLERGÈNES ═════════════════════════════════════ */}
                            <article className="catalog-block" aria-labelledby="allergens-title">
                                <h2 id="allergens-title" className="catalog-block__title">
                                    Allergènes
                                </h2>

                                <div className="catalog-add-row">
                                    <label htmlFor="allergen-input" className="sr-only">
                                        Ajoutez un nouvel allergène
                                    </label>
                                    <input
                                        id="allergen-input"
                                        type="text"
                                        className="catalog-add-input"
                                        value={allergenInput}
                                        onChange={e => setAllergenInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddAllergen()}
                                        placeholder="Ajoutez un nouvel allergène"
                                        aria-describedby="allergen-fb"
                                        maxLength={100}
                                        autoComplete="off"
                                    />
                                    <button
                                        type="button"
                                        className="catalog-add-btn"
                                        onClick={handleAddAllergen}
                                        disabled={allergenBusy}
                                        aria-label="Ajouter cet allergène"
                                    >
                                        +
                                    </button>
                                </div>

                                <Feedback id="allergen-fb" feedback={allergenFb} />

                                <table className="catalog-table">
                                    <thead>
                                        <tr>
                                            <th>Allergène</th>
                                            <th className="catalog-table__action-col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allergens.length === 0 ? (
                                            <tr><td colSpan={2} className="catalog-table__empty">Aucun allergène enregistré.</td></tr>
                                        ) : (
                                            allergens.map(a => (
                                                <tr key={a.id}>
                                                    <td>{a.label}</td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="catalog-delete-btn"
                                                            onClick={() => handleDeleteAllergen(a)}
                                                            disabled={allergenBusy}
                                                            aria-label={`Supprimer l'allergène ${a.label}`}
                                                        >×</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </article>

                            {/* ══ MENUS ══════════════════════════════════════════ */}
                            <article className="catalog-block" aria-labelledby="menus-title">
                                <h2 id="menus-title" className="catalog-block__title">
                                    Menus
                                </h2>

                                <div className="catalog-menus-actions">
                                    <Link
                                        to="/staff/catalog/menu/create/"
                                        className="catalog-btn-create"
                                        aria-label="Créer un nouveau menu"
                                    >
                                        + Créer un menu
                                    </Link>
                                </div>

                                <table className="catalog-table">
                                    <thead>
                                        <tr>
                                            <th>Menu</th>
                                            <th className="catalog-table__action-col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {menus.length === 0 ? (
                                            <tr><td colSpan={2} className="catalog-table__empty">Aucun menu enregistré.</td></tr>
                                        ) : (
                                            menus.map(m => (
                                                <tr key={m.id}>
                                                    <td>{m.title}</td>
                                                    <td>
                                                        <Link
                                                            to={`/staff/catalog/menu/${m.id}/edit/`}
                                                            className="catalog-btn-edit"
                                                            aria-label={`Modifier le menu ${m.title}`}
                                                        >Modifier</Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </article>

                        </div>{/* /catalog-grid */}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default CatalogManagement;
