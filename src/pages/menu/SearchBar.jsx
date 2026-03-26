import React, { useEffect, useState } from "react";
import './SearchBar.scss';

const API_REGIMES = 'http://vitegourmand.local/api/regimes';

function SearchBar({ onSearch }) {
    const [regimes, setRegimes] = useState([]);
    const [filters, setFilters] = useState({
        regime_id: '',
        price_min: '',
        price_max: '',
        min_people: '6'
    });
    const [loadingRegimes, setLoadingRegimes] = useState(true);

    useEffect(() => {
        fetch(API_REGIMES, {
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
                setRegimes(list);
                setLoadingRegimes(false);
            })
            .catch(() => {
                setRegimes([]);
                setLoadingRegimes(false);
            });
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setFilters({
            regime_id: params.get('regime.id') || '',
            price_min: params.get('pricePerPerson[gte]') || '',
            price_max: params.get('pricePerPerson[lte]') || '',
            min_people: params.get('minPeople[gte]') || '6'
        });
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const buildQueryString = () => {
        const params = new URLSearchParams();

        if (filters.regime_id) {
            params.set('regime.id', filters.regime_id);
        }
        if (filters.price_min) {
            params.set('pricePerPerson[gte]', filters.price_min);
        }
        if (filters.price_max) {
            params.set('pricePerPerson[lte]', filters.price_max);
        }
        if (filters.min_people) {
            params.set('minPeople[gte]', filters.min_people);
        }

        return params.toString();
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const qs = buildQueryString();
        const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
        window.history.replaceState({}, '', url);
        if (onSearch) {
            onSearch(qs);
        }
    };
    return (
        <section className="filter-section" aria-label="Filtres de recherche">
            <div className="container">
                
                <div className="section-header">
                    <h2>Nos menus</h2>
                    <div className="divider"></div>
                </div>
                <div className="filter-bar">
                    <form
                        method="get"
                        action=""
                        className="filter-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="filter-group">
                            <label htmlFor="regime_id">Régime</label>
                            <select
                                name="regime_id"
                                id="regime_id"
                                value={filters.regime_id}
                                onChange={handleChange}
                                disabled={loadingRegimes}
                            >
                                <option value="">Tous</option>
                                {regimes.map((regime) => (
                                    <option key={regime.id} value={regime.id}>
                                        {regime.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="price_min">Prix min</label>
                            <input
                                type="number"
                                step="10"
                                min="0"
                                name="price_min"
                                id="price_min"
                                value={filters.price_min}
                                inputMode="numeric"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="price_max">Prix max</label>
                            <input
                                type="number"
                                step="10"
                                min="0"
                                name="price_max"
                                id="price_max"
                                value={filters.price_max}
                                inputMode="numeric"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="min_people">Personnes min</label>
                            <input
                                type="number"
                                min="6"
                                name="min_people"
                                id="min_people"
                                value={filters.min_people}
                                inputMode="numeric"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="filter-group filter-action">
                            <button type="submit" className="filter-btn">Filtrer</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default SearchBar;