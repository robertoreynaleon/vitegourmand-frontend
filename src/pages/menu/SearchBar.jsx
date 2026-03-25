import React from "react";
import './SearchBar.scss';

function SearchBar({ regimes = [], filters = {}, onSubmit, onChange }) {
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
                        onSubmit={onSubmit}
                    >
                        <div className="filter-group">
                            <label htmlFor="regime_id">Régime</label>
                            <select
                                name="regime_id"
                                id="regime_id"
                                defaultValue={filters.regime_id ?? ''}
                                onChange={onChange}
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
                                defaultValue={filters.price_min ?? ''}
                                inputMode="numeric"
                                onChange={onChange}
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
                                defaultValue={filters.price_max ?? ''}
                                inputMode="numeric"
                                onChange={onChange}
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="min_people">Personnes min</label>
                            <input
                                type="number"
                                min="6"
                                name="min_people"
                                id="min_people"
                                defaultValue={filters.min_people ?? '6'}
                                inputMode="numeric"
                                onChange={onChange}
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