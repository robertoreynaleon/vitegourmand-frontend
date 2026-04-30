import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../context/AuthContext';
import './MenuEdit.scss';

/** URL de base de l'API. */
const BASE          = process.env.REACT_APP_API_URL;
const API_REGIMES   = `${BASE}/api/staff/catalog/regimes`;
const API_DISHES    = `${BASE}/api/staff/catalog/dishes`;
const API_ALLERGENS = `${BASE}/api/staff/catalog/allergens`;

const DISH_TYPES = [
    { value: 'entrée',         label: 'Entrée' },
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
 * Page de modification d'un menu existant.
 * Pré-charge les données du menu depuis l'API et permet au staff
 * de modifier tous les champs, d'ajouter ou supprimer des images
 * et de gérer les plats/régimes/allèrgènes associés.
 */
function MenuEdit() {
    const { token }  = useAuth();
    const navigate   = useNavigate();
    const { id }     = useParams();

    // ── Données de référence ──────────────────────────────────────────────
    const [regimes,   setRegimes]   = useState([]);
    const [dishes,    setDishes]    = useState([]);
    const [allergens, setAllergens] = useState([]);
    const [loadError, setLoadError] = useState('');

    // ── Champs du formulaire ──────────────────────────────────────────────
    const [title,             setTitle]             = useState('');
    const [description,       setDescription]       = useState('');
    const [regimeId,          setRegimeId]          = useState('');
    const [pricePerPerson,    setPricePerPerson]    = useState('');
    const [minPeople,         setMinPeople]         = useState(6);
    const [remainingQuantity, setRemainingQuantity] = useState(0);
    const [advanceOrderDays,  setAdvanceOrderDays]  = useState(2);

    // ── Sélection d'un plat ───────────────────────────────────────────────
    const [selDishId,      setSelDishId]      = useState('');
    const [selDishType,    setSelDishType]    = useState('entrée');
    const [selAllergenIds, setSelAllergenIds] = useState([]);
    const [menuDishes,     setMenuDishes]     = useState([]);
    // menuDishes : [{ dishId, dishTitle, dishType, allergenIds[] }]

    // ── Images existantes (déjà en BDD) ──────────────────────────────────
    const [existingImages,  setExistingImages]  = useState([]);
    // existingImages : [{ id, imagePath, altText }]
    const [removedImageIds, setRemovedImageIds] = useState([]);

    // ── Nouvelles images à uploader ───────────────────────────────────────
    const [newImageFiles, setNewImageFiles] = useState([]);
    // newImageFiles : [{ file: File, preview: string }]
    const fileInputRef = useRef(null);

    // ── État du formulaire ────────────────────────────────────────────────
    const [errors,        setErrors]        = useState({});
    const [busy,          setBusy]          = useState(false);
    const [compressing,   setCompressing]   = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting,      setDeleting]      = useState(false);
    const [imgErrors,     setImgErrors]     = useState({});

    // ── Chargement des données de référence + du menu à éditer ────────────
    useEffect(() => {
        if (!token || !id) return;
        const h = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(API_REGIMES,   { headers: h }).then(r => r.ok ? r.json() : []),
            fetch(API_DISHES,    { headers: h }).then(r => r.ok ? r.json() : []),
            fetch(API_ALLERGENS, { headers: h }).then(r => r.ok ? r.json() : []),
            fetch(`${BASE}/api/staff/catalog/menus/${id}`, { headers: h }).then(r => {
                if (!r.ok) throw new Error(`${r.status}`);
                return r.json();
            }),
        ])
            .then(([r, d, a, menu]) => {
                setRegimes(Array.isArray(r) ? r : []);
                setDishes(Array.isArray(d) ? d : []);
                setAllergens(Array.isArray(a) ? a : []);

                setTitle(menu.title ?? '');
                setDescription(menu.description ?? '');
                setRegimeId(menu.regimeId ? String(menu.regimeId) : '');
                setPricePerPerson(menu.pricePerPerson != null ? String(menu.pricePerPerson) : '');
                setMinPeople(menu.minPeople ?? 6);
                setRemainingQuantity(menu.remainingQuantity ?? 0);
                setAdvanceOrderDays(menu.advanceOrderDays ?? 2);
                setMenuDishes(
                    (menu.dishes ?? []).map(dish => ({
                        dishId:      dish.dishId,
                        dishTitle:   dish.dishTitle,
                        dishType:    dish.dishType,
                        allergenIds: dish.allergenIds ?? [],
                    }))
                );
                setExistingImages(menu.images ?? []);
            })
            .catch(() => setLoadError('Menu introuvable ou erreur de chargement.'));
    }, [token, id]);

    // ── Pré-remplissage des allergènes quand le plat change ───────────────
    useEffect(() => {
        if (!selDishId) { setSelAllergenIds([]); return; }
        const dish = dishes.find(d => d.id === parseInt(selDishId, 10));
        setSelAllergenIds(dish ? (dish.allergenIds ?? []) : []);
    }, [selDishId, dishes]);

    // ── Gestion des plats ─────────────────────────────────────────────────
    const handleAddDish = () => {
        const did = parseInt(selDishId, 10);
        if (!did) {
            setErrors(e => ({ ...e, dish: 'Veuillez sélectionner un plat.' }));
            return;
        }
        if (menuDishes.some(md => md.dishId === did)) {
            setErrors(e => ({ ...e, dish: 'Ce plat est déjà ajouté à ce menu.' }));
            return;
        }
        const dish = dishes.find(d => d.id === did);
        if (!dish) return;

        setMenuDishes(prev => [
            ...prev,
            { dishId: dish.id, dishTitle: dish.title, dishType: selDishType, allergenIds: [...selAllergenIds] },
        ]);
        setSelDishId('');
        setSelDishType('entrée');
        setSelAllergenIds([]);
        setErrors(e => ({ ...e, dish: '' }));
    };

    const handleRemoveDish = (dishId) =>
        setMenuDishes(prev => prev.filter(md => md.dishId !== dishId));

    const toggleAllergen = (aId) =>
        setSelAllergenIds(prev =>
            prev.includes(aId) ? prev.filter(id => id !== aId) : [...prev, aId]
        );

    // ── Gestion des images existantes ─────────────────────────────────────
    const handleRemoveExistingImage = (imgId) => {
        setRemovedImageIds(prev => [...prev, imgId]);
        setExistingImages(prev => prev.filter(img => img.id !== imgId));
    };

    // ── Gestion des nouvelles images ──────────────────────────────────────
    const totalImages = existingImages.length + newImageFiles.length;

    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (e.target) e.target.value = '';

        const remaining = MAX_IMAGES - totalImages;
        const toProcess = files.slice(0, remaining);
        const msgList   = [];

        if (files.length > remaining) {
            msgList.push(`Quota atteint : seulement ${remaining} photo${remaining !== 1 ? 's' : ''} ajoutée${remaining !== 1 ? 's' : ''} (maximum ${MAX_IMAGES} au total).`);
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
            setNewImageFiles(prev => [
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

    const handleRemoveNewImage = (index) => {
        setNewImageFiles(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
        setErrors(e => ({ ...e, images: '' }));
    };

    // ── Validation ────────────────────────────────────────────────────────
    const validate = () => {
        const errs = {};
        if (!title.trim())                          errs.title            = 'Le titre est obligatoire.';
        else if (title.trim().length > 100)         errs.title            = 'Maximum 100 caractères.';
        if (!regimeId)                              errs.regimeId         = 'Veuillez sélectionner un régime.';
        const p = parseFloat(pricePerPerson);
        if (isNaN(p) || p < 0)                     errs.pricePerPerson   = 'Prix invalide (nombre positif requis).';
        if (parseInt(minPeople, 10) < 1)            errs.minPeople        = 'Minimum 1 personne.';
        if (parseInt(advanceOrderDays, 10) < 0)     errs.advanceOrderDays = 'Valeur positive requise.';
        return errs;
    };

    // ── Suppression du menu ───────────────────────────────────────────────
    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`${BASE}/api/staff/catalog/menus/${id}`, {
                method:  'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                navigate('/staff/catalog/', { state: { success: 'Menu supprimé avec succès.' } });
            } else {
                const json = await res.json().catch(() => ({}));
                setErrors({ server: json.message || 'Erreur lors de la suppression.' });
                setConfirmDelete(false);
            }
        } catch {
            setErrors({ server: 'Erreur réseau. Veuillez réessayer.' });
            setConfirmDelete(false);
        } finally {
            setDeleting(false);
        }
    };

    // ── Soumission ────────────────────────────────────────────────────────
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
        fd.append('removedImageIds',   JSON.stringify(removedImageIds));
        newImageFiles.forEach(({ file }) => fd.append('images[]', file));

        try {
            const res = await fetch(`${BASE}/api/staff/catalog/menus/${id}`, {
                method:  'POST',
                headers: { Authorization: `Bearer ${token}` },
                body:    fd,
            });
            if (res.ok) {
                navigate('/staff/catalog/', { state: { success: 'Menu modifié avec succès.' } });
            } else {
                const json = await res.json().catch(() => ({}));
                setErrors({ server: json.message || 'Erreur lors de la modification.' });
            }
        } catch {
            setErrors({ server: 'Erreur réseau. Veuillez réessayer.' });
        } finally {
            setBusy(false);
        }
    };

    const selectedDish = dishes.find(d => d.id === parseInt(selDishId, 10));

    return (
        <div className="menu-form-page">
            <Header />
            <main>
                <section className="menu-form-section" aria-labelledby="edit-menu-title">
                    <div className="container">
                        <h1 id="edit-menu-title" className="menu-form-title">
                            Modifier le <span>menu</span>
                        </h1>

                        <Link to="/staff/catalog/" className="menu-form-back">
                            ← Retour au catalogue
                        </Link>

                        {loadError && (
                            <p className="catalog-load-error" role="alert">{loadError}</p>
                        )}

                        <form
                            className="menu-form"
                            onSubmit={handleSubmit}
                            noValidate
                            aria-label="Formulaire de modification de menu"
                        >
                            {errors.server && (
                                <p className="form-error--server" role="alert">{errors.server}</p>
                            )}

                            {/* ── Informations générales ── */}
                            <fieldset className="menu-form-fieldset">
                                <legend className="menu-form-legend">Informations générales</legend>

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
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="menu-regime">
                                            Régime <span aria-hidden="true">*</span>
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
                                            <option value="">-- Sélectionner --</option>
                                            {regimes.map(r => (
                                                <option key={r.id} value={r.id}>{r.label}</option>
                                            ))}
                                        </select>
                                        {errors.regimeId && <span className="form-error" role="alert">{errors.regimeId}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="menu-price">
                                            Prix / personne (€) <span aria-hidden="true">*</span>
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
                                            Quantité restante
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
                                            Jours à l'avance
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

                            {/* ── Plats ── */}
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

                                {/* Allergènes du plat sélectionné */}
                                {selDishId && (
                                    <div className="menu-form-allergens" aria-live="polite">
                                        <p className="menu-form-allergens-title">
                                            Allergènes pour{' '}
                                            <strong>{selectedDish?.title}</strong>
                                            <span className="menu-form-allergens-hint">
                                                {' '}— cochez ceux associés à ce plat
                                            </span>
                                        </p>
                                        {allergens.length === 0 ? (
                                            <p className="menu-form-allergens-empty">Aucun allergène enregistré.</p>
                                        ) : (
                                            <ul className="menu-form-allergens-list" role="list">
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

                                {/* Plats déjà ajoutés */}
                                {menuDishes.length > 0 && (
                                    <div className="menu-form-dishes-added" aria-live="polite">
                                        <p className="menu-form-dishes-added-title">Plats du menu :</p>
                                        <ul className="menu-form-dishes-list" role="list">
                                            {menuDishes.map(md => (
                                                <li key={md.dishId} className="menu-form-dish-item">
                                                    <span className="menu-form-dish-info">
                                                        <strong>{md.dishTitle}</strong>
                                                        <span className="menu-form-dish-type">
                                                            {DISH_TYPES.find(dt => dt.value === md.dishType)?.label}
                                                        </span>
                                                        {md.allergenIds.length > 0 && (
                                                            <span className="menu-form-dish-allergens">
                                                                {md.allergenIds.length} allergène{md.allergenIds.length > 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="menu-form-dish-remove"
                                                        onClick={() => handleRemoveDish(md.dishId)}
                                                        aria-label={`Retirer ${md.dishTitle} du menu`}
                                                    >
                                                        ×
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </fieldset>

                            {/* ── Photos ── */}
                            <fieldset className="menu-form-fieldset">
                                <legend className="menu-form-legend">
                                    Photos du menu{' '}
                                    <span className="menu-form-legend-hint">
                                        ({totalImages}/{MAX_IMAGES})
                                    </span>
                                </legend>

                                {/* Images existantes */}
                                {existingImages.length > 0 && (
                                    <div className="menu-form-existing-images">
                                        <p className="menu-form-existing-label">
                                            Photos actuelles{' '}
                                            <span className="menu-form-existing-warning">
                                                (la suppression est définitive une fois les modifications enregistrées)
                                            </span>
                                        </p>
                                        <ul className="menu-form-image-previews" role="list" aria-label="Photos actuelles">
                                            {existingImages.map(img => (
                                                <li key={img.id} className="menu-form-image-preview-item">
                                                    {imgErrors[img.id] ? (
                                                        <span className="menu-form-img-error">
                                                            {img.imagePath.split('/').pop()}
                                                        </span>
                                                    ) : (
                                                        <img
                                                            src={`${BASE}/${img.imagePath.replace(/^\/+/, '')}`}
                                                            alt={img.altText || 'Photo du menu'}
                                                            className="menu-form-image-thumb"
                                                            onError={() => setImgErrors(prev => ({ ...prev, [img.id]: true }))}
                                                        />
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="menu-form-image-remove"
                                                        onClick={() => handleRemoveExistingImage(img.id)}
                                                        aria-label="Supprimer cette photo"
                                                    >
                                                        ×
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Nouvelles images */}
                                {totalImages < MAX_IMAGES && (
                                    <div className="menu-form-image-upload">
                                        <label htmlFor="image-input" className="menu-form-image-label">
                                            Ajouter des photos
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
                                            {totalImages}/{MAX_IMAGES}
                                        </span>
                                        {compressing && (
                                            <span className="menu-form-image-compressing" role="status">
                                                Compression en cours…
                                            </span>
                                        )}
                                    </div>
                                )}

                                {errors.images && <p className="form-error" role="alert">{errors.images}</p>}

                                {newImageFiles.length > 0 && (
                                    <>
                                        <p className="menu-form-existing-label" style={{ marginTop: '0.8rem' }}>
                                            Nouvelles photos :
                                        </p>
                                        <ul className="menu-form-image-previews" role="list" aria-label="Nouvelles photos">
                                            {newImageFiles.map((img, i) => (
                                                <li key={i} className="menu-form-image-preview-item">
                                                    <img
                                                        src={img.preview}
                                                        alt={`Aperçu ${i + 1}`}
                                                        className="menu-form-image-thumb"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="menu-form-image-remove"
                                                        onClick={() => handleRemoveNewImage(i)}
                                                        aria-label={`Supprimer la nouvelle photo ${i + 1}`}
                                                    >
                                                        ×
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </fieldset>

                            {/* ── Actions ── */}
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
                                    {busy ? 'Enregistrement…' : 'Enregistrer les modifications'}
                                </button>
                                <button
                                    type="button"
                                    className="menu-form-delete"
                                    onClick={() => setConfirmDelete(true)}
                                    disabled={confirmDelete}
                                >
                                    Supprimer ce menu
                                </button>
                            </div>
                        </form>

                        {/* ── Modale de confirmation (hors formulaire) ── */}
                        {confirmDelete && (
                            <div
                                className="menu-form-modal"
                                role="dialog"
                                aria-modal="true"
                                aria-label="Confirmer la suppression du menu"
                            >
                                <p className="menu-form-modal__text">
                                    Voulez-vous vraiment supprimer définitivement ce menu ?
                                    Cette action est <strong>irréversible</strong> : le menu,
                                    ses plats et toutes ses photos seront supprimés.
                                </p>
                                <div className="menu-form-modal__actions">
                                    <button
                                        type="button"
                                        className="menu-form-modal__confirm"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                    >
                                        {deleting ? 'Suppression…' : 'Oui, supprimer définitivement'}
                                    </button>
                                    <button
                                        type="button"
                                        className="menu-form-modal__cancel"
                                        onClick={() => setConfirmDelete(false)}
                                    >
                                        Non, annuler
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default MenuEdit;
