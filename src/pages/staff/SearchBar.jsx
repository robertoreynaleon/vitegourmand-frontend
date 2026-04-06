import React from 'react';
import './SearchBar.scss';

const STATUS_OPTIONS = [
    { value: '', label: 'Tous les statuts' },
    { value: 'en attente', label: 'En attente' },
    { value: 'acceptée', label: 'Acceptée' },
    { value: 'en préparation', label: 'En préparation' },
    { value: 'en cours de livraison', label: 'En cours de livraison' },
    { value: 'livrée', label: 'Livrée' },
    { value: 'en attente de retour de matériel', label: 'En attente retour matériel' },
    { value: 'terminée', label: 'Terminée' },
    { value: 'annulée', label: 'Annulée' },
];

/**
 * SearchBar — filtre les commandes côté client.
 *
 * Props :
 *   filters  : { number, client, date, time, status }
 *   onChange : (newFilters) => void
 */
function SearchBar({ filters, onChange }) {
    const set = (field, value) => onChange({ ...filters, [field]: value });

    const hasActiveFilter = Object.values(filters).some(Boolean);

    const reset = () =>
        onChange({ number: '', client: '', date: '', time: '', status: '' });

    return (
        <div className="staff-searchbar" role="search" aria-label="Rechercher une commande">
            <p className="staff-searchbar__title" aria-hidden="true">Rechercher une commande</p>

            <div className="staff-searchbar__fields">

                <div className="staff-searchbar__group">
                    <label htmlFor="search-number" className="staff-searchbar__label">
                        N° commande
                    </label>
                    <input
                        id="search-number"
                        type="text"
                        className="staff-searchbar__input"
                        placeholder="Ex : 31"
                        value={filters.number}
                        onChange={(e) => set('number', e.target.value)}
                        aria-label="Rechercher par numéro de commande"
                        autoComplete="off"
                    />
                </div>

                <div className="staff-searchbar__group">
                    <label htmlFor="search-client" className="staff-searchbar__label">
                        Nom du client
                    </label>
                    <input
                        id="search-client"
                        type="text"
                        className="staff-searchbar__input"
                        placeholder="Ex : Dupont"
                        value={filters.client}
                        onChange={(e) => set('client', e.target.value)}
                        aria-label="Rechercher par nom du client"
                        autoComplete="off"
                    />
                </div>

                <div className="staff-searchbar__group">
                    <label htmlFor="search-date" className="staff-searchbar__label">
                        Date de livraison
                    </label>
                    <input
                        id="search-date"
                        type="text"
                        className="staff-searchbar__input"
                        placeholder="Ex : 20/04/2026"
                        value={filters.date}
                        onChange={(e) => set('date', e.target.value)}
                        aria-label="Rechercher par date de livraison"
                        autoComplete="off"
                    />
                </div>

                <div className="staff-searchbar__group">
                    <label htmlFor="search-time" className="staff-searchbar__label">
                        Heure de livraison
                    </label>
                    <input
                        id="search-time"
                        type="text"
                        className="staff-searchbar__input"
                        placeholder="Ex : 09:00"
                        value={filters.time}
                        onChange={(e) => set('time', e.target.value)}
                        aria-label="Rechercher par heure de livraison"
                        autoComplete="off"
                    />
                </div>

                <div className="staff-searchbar__group">
                    <label htmlFor="search-status" className="staff-searchbar__label">
                        Statut
                    </label>
                    <select
                        id="search-status"
                        className="staff-searchbar__select"
                        value={filters.status}
                        onChange={(e) => set('status', e.target.value)}
                        aria-label="Filtrer par statut de commande"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

            </div>

            {hasActiveFilter && (
                <div className="staff-searchbar__footer">
                    <button
                        type="button"
                        className="staff-searchbar__reset"
                        onClick={reset}
                        aria-label="Réinitialiser tous les filtres de recherche"
                    >
                        Réinitialiser les filtres ✕
                    </button>
                </div>
            )}
        </div>
    );
}

export default SearchBar;
