import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../context/AuthContext';
import './MenuCreate.scss';

/** URL de base de l'API. */
const BASE             = process.env.REACT_APP_API_URL;
const API_REGIMES      = `${BASE}/api/staff/catalog/regimes`;
const API_DISHES       = `${BASE}/api/staff/catalog/dishes`;
const API_ALLERGENS    = `${BASE}/api/staff/catalog/allergens`;
const API_MENUS_CREATE = `${BASE}/api/staff/catalog/menus`;

const DISH_TYPES = [
    { value: 'entrÃ©e',         label: 'EntrÃ©e' },
    { value: 'plat_principal', label: 'Plat principal' },
    { value: 'dessert',        label: 'Dessert' },
];

const MAX_IMAGES = 5;

const COMPRESSION_OPTIONS = {
    maxSizeMB:        1,
    maxWidthOrHeight: 1920,
    fileType:         'image/webp',
    useWebWorker:     true,
    initialQuality:   0.8,
};

/**
 * Page de crÃ©ation d'un menu.
 * Permet au staff de saisir toutes les informations d'un menu :
 * titre, description, prix, rÃ©gime, plats, allÃ¨rgÃ¨nes et images (compressÃ©es avant envoi).
 */
function MenuCreate() {
    const { token }  = useAuth();
    const navigate   = useNavigate();

    // â”€â”€ DonnÃ©es de rÃ©fÃ©rence â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [regimes,   setRegimes]   = useState([]);
    const [dishes,    setDishes]    = useState([]);
    const [allergens, setAllergens] = useState([]);
    const [loadError, setLoadError] = useState('');

    // â”€â”€ Champs du formulaire â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [title,             setTitle]             = useState('');
    const [description,       setDescription]       = useState('');
    const [regimeId,          setRegimeId]          = useState('');
    const [pricePerPerson,    setPricePerPerson]    = useState('');
    const [minPeople,         setMinPeople]         = useState(6);
    const [remainingQuantity, setRemainingQuantity] = useState(0);
    const [advanceOrderDays,  setAdvanceOrderDays]  = useState(2);

    // â”€â”€ SÃ©lection d'un plat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [selDishId,      setSelDishId]      = useState('');
    const [selDishType,    setSelDishType]    = useState('entrÃ©e');
    const [selAllergenIds, setSelAllergenIds] = useState([]);
    const [menuDishes,     setMenuDishes]     = useState([]);
    // menuDishes : [{ dishId, dishTitle, dishType, allergenIds[] }]

    // â”€â”€ Images â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [imageFiles, setImageFiles] = useState([]);
    // imageFiles : [{ file: File, preview: string }]
    const fileInputRef = useRef(null);

    // â”€â”€ Ã‰tat du formulaire â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [errors,      setErrors]      = useState({});
    const [busy,        setBusy]        = useState(false);
    const [compressing, setCompressing] = useState(false);

    // â”€â”€ Chargement des donnÃ©es de rÃ©fÃ©rence â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        if (!token) return;
        const h = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(API_REGIMES,   { headers: h }).then(r => r.ok ? r.json() : []),
            fetch(API_DISHES,    { headers: h }).then(r => r.ok ? r.json() : []),
            fetch(API_ALLERGENS, { headers: h }).then(r => r.ok ? r.json() : []),
        ])
            .then(([r, d, a]) => {
                setRegimes(Array.isArray(r) ? r : []);
                setDishes(Array.isArray(d) ? d : []);
                setAllergens(Array.isArray(a) ? a : []);
            })
            .catch(() => setLoadError('Erreur lors du chargement des donnÃ©es de rÃ©fÃ©rence.'));
    }, [token]);

    // â”€â”€ PrÃ©-remplissage des allergÃ¨nes quand le plat change â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        if (!selDishId) { setSelAllergenIds([]); return; }
        const dish = dishes.find(d => d.id === parseInt(selDishId, 10));
        setSelAllergenIds(dish ? (dish.allergenIds ?? []) : []);
    }, [selDishId, dishes]);

    // â”€â”€ Gestion des plats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleAddDish = () => {
        const id = parseInt(selDishId, 10);
        if (!id) {
            setErrors(e => ({ ...e, dish: 'Veuillez sÃ©lectionner un plat.' }));
            return;
        }
        if (menuDishes.some(md => md.dishId === id)) {
            setErrors(e => ({ ...e, dish: 'Ce plat est dÃ©jÃ  ajoutÃ© Ã  ce menu.' }));
            return;
        }
        const dish = dishes.find(d => d.id === id);
        if (!dish) return;

        setMenuDishes(prev => [
            ...prev,
            { dishId: dish.id, dishTitle: dish.title, dishType: selDishType, allergenIds: [...selAllergenIds] },
        ]);
        setSelDishId('');
        setSelDishType('entrÃ©e');
        setSelAllergenIds([]);
        setErrors(e => ({ ...e, dish: '' }));
    };

    const handleRemoveDish = (dishId) =>
        setMenuDishes(prev => prev.filter(md => md.dishId !== dishId));

    const toggleAllergen = (aId) =>
        setSelAllergenIds(prev =>
            prev.includes(aId) ? prev.filter(id => id !== aId) : [...prev, aId]
        );

    // â”€â”€ Gestion des images â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (e.target) e.target.value = '';

        const remaining = MAX_IMAGES - imageFiles.length;
        const toProcess = files.slice(0, remaining);
        const msgList   = [];

        if (files.length > remaining) {
            msgList.push(`Quota atteint : seulement ${remaining} photo${remaining !== 1 ? 's' : ''} ajoutÃ©e${remaining !== 1 ? 's' : ''} (maximum ${MAX_IMAGES} au total).`);
        }
        if (toProcess.length === 0) {
            setErrors(prev => ({ ...prev, images: msgList.join(' ') }));
            return;
        }

        setCompressing(true);
        try {
            const compressed = await Promise.all(
                toProcess.map(f => imageCompression(f, COMPRESSION_OPTIONS))
            );
            setImageFiles(prev => [
                ...prev,
                ...compressed.map(f => ({ file: f, preview: URL.createObjectURL(f) })),
            ]);
            setErrors(prev => ({ ...prev, images: msgList.join(' ') }));
        } catch {
            setErrors(prev => ({ ...prev, images: 'Erreur lors de la compression des photos.' }));
        } finally {
            setCompressing(false);
        }
    };

    const handleRemoveImage = (index) => {
        setImageFiles(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
        setErrors(e => ({ ...e, images: '' }));
    };

    // â”€â”€ Validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const validate = () => {
        const errs = {};
        if (!title.trim())                          errs.title            = 'Le titre est obligatoire.';
        else if (title.trim().length > 100)         errs.title            = 'Maximum 100 caractÃ¨res.';
        if (!regimeId)                              errs.regimeId         = 'Veuillez sÃ©lectionner un rÃ©gime.';
        const p = parseFloat(pricePerPerson);
        if (isNaN(p) || p < 0)                     errs.pricePerPerson   = 'Prix invalide (nombre positif requis).';
        if (parseInt(minPeople, 10) < 1)            errs.minPeople        = 'Minimum 1 personne.';
        if (parseInt(advanceOrderDays, 10) < 0)     errs.advanceOrderDays = 'Valeur positive requise.';
        return errs;
    };

    // â”€â”€ Soumission â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setErrors({});
        setBusy(true);

        const fd = new FormData();
        fd.append('title',             title.trim());
        fd.append('description',       description.trim());
        fd.append('regimeId',          regimeId);
        fd.append('pricePerPerson',    pricePerPerson);
        fd.append('minPeople',         String(minPeople));
        fd.append('remainingQuantity', String(remainingQuantity));
        fd.append('advanceOrderDays',  String(advanceOrderDays));
        fd.append('dishes',            JSON.stringify(menuDishes));
        imageFiles.forEach(({ file }) => fd.append('images[]', file));

        try {
            const res = await fetch(API_MENUS_CREATE, {
                method:  'POST',
                headers: { Authorization: `Bearer ${token}` },
                body:    fd,
            });
            if (res.status === 201) {
                navigate('/staff/catalog/', { state: { success: 'Menu crÃ©Ã© avec succÃ¨s.' } });
            } else {
                const json = await res.json().catch(() => ({}));
                setErrors({ server: json.message || 'Erreur lors de la crÃ©ation.' });
            }
        } catch {
            setErrors({ server: 'Erreur rÃ©seau. Veuillez rÃ©essayer.' });
        } finally {
            setBusy(false);
        }
    };

    const selectedDish = dishes.find(d => d.id === parseInt(selDishId, 10));

    return (
        <div className="menu-form-page">
            <Header />
            <main>
                <section className="menu-form-section" aria-labelledby="create-menu-title">
                    <div className="container">
                        <h1 id="create-menu-title" className="menu-form-title">
                            CrÃ©er un <span>menu</span>
                        </h1>

                        <Link to="/staff/catalog/" className="menu-form-back">
                            â† Retour au catalogue
                        </Link>

                        {loadError && (
                            <p className="catalog-load-error" role="alert">{loadError}</p>
                        )}

                        <form
                            className="menu-form"
                            onSubmit={handleSubmit}
                            noValidate
                            aria-label="Formulaire de crÃ©ation de menu"
                        >
                            {errors.server && (
                                <p className="form-error--server" role="alert">{errors.server}</p>
                            )}

                            {/* â”€â”€ Informations gÃ©nÃ©rales â”€â”€ */}
                            <fieldset className="menu-form-fieldset">
                                <legend className="menu-form-legend">Informations gÃ©nÃ©rales</legend>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="menu-title">
                                        Titre <span aria-hidden="true">*</span>
                                    </label>
                                    <input
                                        id="menu-title"
                                        type="text"
                                        className={`form-input-field${errors.title ? ' form-input-field--error' : ''}`}
                                        value={title}
                                        onChange={e => { setTitle(e.target.value); setErrors(v => ({ ...v, title: '' })); }}
                                        maxLength={100}
                                        required
                                        aria-required="true"
                                        aria-invalid={!!errors.title}
                                        autoComplete="off"
                                        placeholder="Ex. VÃ©gÃ©tarien Printemps"
                                    />
                                    {errors.title && <span className="form-error" role="alert">{errors.title}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="menu-description">
                                        Description
                                    </label>
                                    <textarea
                                        id="menu-description"
                                        className="form-input-field menu-form-textarea"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        rows={4}
                                        placeholder="Description du menuâ€¦"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="menu-regime">
                                            RÃ©gime <span aria-hidden="true">*</span>
                                        </label>
                                        <select
                                            id="menu-regime"
                                            className={`form-input-field${errors.regimeId ? ' form-input-field--error' : ''}`}
                                            value={regimeId}
                                            onChange={e => { setRegimeId(e.target.value); setErrors(v => ({ ...v, regimeId: '' })); }}
                                            required
                                            aria-required="true"
                                            aria-invalid={!!errors.regimeId}
                                        >
                                            <option value="">-- SÃ©lectionner --</option>
                                            {regimes.map(r => (
                                                <option key={r.id} value={r.id}>{r.label}</option>
                                            ))}
                                        </select>
                                        {errors.regimeId && <span className="form-error" role="alert">{errors.regimeId}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="menu-price">
                                            Prix / personne (â‚¬) <span aria-hidden="true">*</span>
                                        </label>
                                        <input
                                            id="menu-price"
                                            type="number"
                                            className={`form-input-field${errors.pricePerPerson ? ' form-input-field--error' : ''}`}
                                            value={pricePerPerson}
                                            onChange={e => { setPricePerPerson(e.target.value); setErrors(v => ({ ...v, pricePerPerson: '' })); }}
                                            min="0"
                                            step="0.01"
                                            required
                                            aria-required="true"
                                            aria-invalid={!!errors.pricePerPerson}
                                            placeholder="Ex. 29.90"
                                        />
                                        {errors.pricePerPerson && <span className="form-error" role="alert">{errors.pricePerPerson}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="menu-min-people">
                                            Personnes min. <span aria-hidden="true">*</span>
                                        </label>
                                        <input
                                            id="menu-min-people"
                                            type="number"
                                            className={`form-input-field${errors.minPeople ? ' form-input-field--error' : ''}`}
                                            value={minPeople}
                                            onChange={e => { setMinPeople(e.target.value); setErrors(v => ({ ...v, minPeople: '' })); }}
                                            min="1"
                                            step="1"
                                            required
                                            aria-invalid={!!errors.minPeople}
                                        />
                                        {errors.minPeople && <span className="form-error" role="alert">{errors.minPeople}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="menu-remaining">
                                            QuantitÃ© restante
                                        </label>
                                        <input
                                            id="menu-remaining"
                                            type="number"
                                            className="form-input-field"
                                            value={remainingQuantity}
                                            onChange={e => setRemainingQuantity(e.target.value)}
                                            min="0"
                                            step="1"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="menu-advance">
                                            Jours Ã  l'avance
                                        </label>
                                        <input
                                            id="menu-advance"
                                            type="number"
                                            className={`form-input-field${errors.advanceOrderDays ? ' form-input-field--error' : ''}`}
                                            value={advanceOrderDays}
                                            onChange={e => { setAdvanceOrderDays(e.target.value); setErrors(v => ({ ...v, advanceOrderDays: '' })); }}
                                            min="0"
                                            step="1"
                                            aria-invalid={!!errors.advanceOrderDays}
                                        />
                                        {errors.advanceOrderDays && <span className="form-error" role="alert">{errors.advanceOrderDays}</span>}
                                    </div>
                                </div>
                            </fieldset>

                            {/* â”€â”€ Plats â”€â”€ */}
                            <fieldset className="menu-form-fieldset">
                                <legend className="menu-form-legend">Plats du menu</legend>

                                <div className="menu-form-dish-row">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="dish-select">
                                            Plat
                                        </label>
                                        <select
                                            id="dish-select"
                                            className="form-input-field"
                                            value={selDishId}
                                            onChange={e => setSelDishId(e.target.value)}
                                        >
                                            <option value="">-- Choisir un plat --</option>
                                            {dishes.map(d => (
                                                <option key={d.id} value={d.id}>{d.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="dish-type">
                                            Type de plat
                                        </label>
                                        <select
                                            id="dish-type"
                                            className="form-input-field"
                                            value={selDishType}
                                            onChange={e => setSelDishType(e.target.value)}
                                        >
                                            {DISH_TYPES.map(dt => (
                                                <option key={dt.value} value={dt.value}>{dt.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        className="menu-form-add-dish-btn"
                                        onClick={handleAddDish}
                                        aria-label="Ajouter ce plat au menu"
                                    >
                                        + Ajouter
                                    </button>
                                </div>

                                {errors.dish && <p className="form-error" role="alert">{errors.dish}</p>}

                                {/* AllergÃ¨nes du plat sÃ©lectionnÃ© */}
                                {selDishId && (
                                    <div className="menu-form-allergens" aria-live="polite">
                                        <p className="menu-form-allergens-title">
                                            AllergÃ¨nes pour{' '}
                                            <strong>{selectedDish?.title}</strong>
                                            <span className="menu-form-allergens-hint">
                                                {' '}â€” cochez ceux associÃ©s Ã  ce plat
                                            </span>
                                        </p>
                                        {allergens.length === 0 ? (
                                            <p className="menu-form-allergens-empty">Aucun allergÃ¨ne enregistrÃ©.</p>
                                        ) : (
                                            <ul className="menu-form-allergens-list" >
                                                {allergens.map(a => (
                                                    <li key={a.id} className="menu-form-allergen-item">
                                                        <label className="menu-form-allergen-label">
                                                            <input
                                                                type="checkbox"
                                                                className="menu-form-allergen-checkbox"
                                                                checked={selAllergenIds.includes(a.id)}
                                                                onChange={() => toggleAllergen(a.id)}
                                                            />
                                                            {a.label}
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}

                                {/* Plats dÃ©jÃ  ajoutÃ©s */}
                                {menuDishes.length > 0 && (
                                    <div className="menu-form-dishes-added" aria-live="polite">
                                        <p className="menu-form-dishes-added-title">Plats ajoutÃ©s :</p>
                                        <ul className="menu-form-dishes-list" >
                                            {menuDishes.map(md => (
                                                <li key={md.dishId} className="menu-form-dish-item">
                                                    <span className="menu-form-dish-info">
                                                        <strong>{md.dishTitle}</strong>
                                                        <span className="menu-form-dish-type">
                                                            {DISH_TYPES.find(dt => dt.value === md.dishType)?.label}
                                                        </span>
                                                        {md.allergenIds.length > 0 && (
                                                            <span className="menu-form-dish-allergens">
                                                                {md.allergenIds.length} allergÃ¨ne{md.allergenIds.length > 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="menu-form-dish-remove"
                                                        onClick={() => handleRemoveDish(md.dishId)}
                                                        aria-label={`Retirer ${md.dishTitle} du menu`}
                                                    >
                                                        Ã—
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </fieldset>

                            {/* â”€â”€ Photos â”€â”€ */}
                            <fieldset className="menu-form-fieldset">
                                <legend className="menu-form-legend">
                                    Photos du menu{' '}
                                    <span className="menu-form-legend-hint">(max. {MAX_IMAGES})</span>
                                </legend>

                                {imageFiles.length < MAX_IMAGES && (
                                    <div className="menu-form-image-upload">
                                        <label htmlFor="image-input" className="menu-form-image-label">
                                            Choisir des photos
                                            <input
                                                id="image-input"
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                multiple
                                                onChange={handleImageSelect}
                                                disabled={compressing}
                                                className="sr-only"
                                            />
                                        </label>
                                        <span className="menu-form-image-count">
                                            {imageFiles.length}/{MAX_IMAGES}
                                        </span>
                                        {compressing && (
                                            <span className="menu-form-image-compressing" role="status">
                                                Compression en coursâ€¦
                                            </span>
                                        )}
                                    </div>
                                )}

                                {errors.images && <p className="form-error" role="alert">{errors.images}</p>}

                                {imageFiles.length > 0 && (
                                    <ul className="menu-form-image-previews"  aria-label="Photos sÃ©lectionnÃ©es">
                                        {imageFiles.map((img, i) => (
                                            <li key={i} className="menu-form-image-preview-item">
                                                <img
                                                    src={img.preview}
                                                    alt={`AperÃ§u ${i + 1}`}
                                                    className="menu-form-image-thumb"
                                                />
                                                <button
                                                    type="button"
                                                    className="menu-form-image-remove"
                                                    onClick={() => handleRemoveImage(i)}
                                                    aria-label={`Supprimer la photo ${i + 1}`}
                                                >
                                                    Ã—
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </fieldset>

                            {/* â”€â”€ Actions â”€â”€ */}
                            <div className="menu-form-actions">
                                <Link to="/staff/catalog/" className="menu-form-cancel">
                                    Annuler
                                </Link>
                                <button
                                    type="submit"
                                    className="menu-form-submit"
                                    disabled={busy || compressing}
                                    aria-busy={busy || compressing}
                                >
                                    {busy ? 'CrÃ©ation en coursâ€¦' : 'CrÃ©er le menu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default MenuCreate;

