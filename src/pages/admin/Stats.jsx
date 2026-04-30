import React, { useState, useEffect, useCallback } from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DatePicker from '../../components/DatePicker';
import { useAuth } from '../../context/AuthContext';
import './Stats.scss';

const API_STATS = `${process.env.REACT_APP_API_URL}/api/admin/stats`;
const API_MENUS = `${process.env.REACT_APP_API_URL}/api/menus`;

/**
 * Aggregates raw MongoDB documents by menu name.
 * Returns an array sorted by total quantity descending.
 */
function aggregateByMenu(docs) {
    const map = {};
    docs.forEach((doc) => {
        const key = doc.menu_name || `Menu #${doc.menu_id}`;
        if (!map[key]) {
            map[key] = { menu_name: key, quantity: 0, revenue: 0 };
        }
        map[key].quantity += Number(doc.quantity) || 0;
        map[key].revenue  += parseFloat(doc.total_price) || 0;
    });
    return Object.values(map).sort((a, b) => b.quantity - a.quantity);
}

function MobileBarChart({ rows }) {
    const maxQty = Math.max(...rows.map((r) => r.quantity), 1);
    const maxRev = Math.max(...rows.map((r) => r.revenue), 1);
    return (
        <div className="stats-mobile-chart">
            {rows.map((row) => (
                <div key={row.menu_name} className="stats-mobile-chart__card">
                    <p className="stats-mobile-chart__name">{row.menu_name}</p>
                    <div className="stats-mobile-chart__row">
                        <span className="stats-mobile-chart__label">Qté</span>
                        <div className="stats-mobile-chart__bar-wrap">
                            <div
                                className="stats-mobile-chart__bar stats-mobile-chart__bar--qty"
                                style={{ width: `${(row.quantity / maxQty) * 100}%` }}
                                aria-label={`${row.quantity} commandes`}
                            />
                        </div>
                        <span className="stats-mobile-chart__value">{row.quantity}</span>
                    </div>
                    <div className="stats-mobile-chart__row">
                        <span className="stats-mobile-chart__label">CA</span>
                        <div className="stats-mobile-chart__bar-wrap">
                            <div
                                className="stats-mobile-chart__bar stats-mobile-chart__bar--rev"
                                style={{ width: `${(row.revenue / maxRev) * 100}%` }}
                                aria-label={`${row.revenue.toFixed(2)} €`}
                            />
                        </div>
                        <span className="stats-mobile-chart__value">{row.revenue.toFixed(2)} €</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Page de statistiques (admin uniquement).
 * Affiche un graphique des commandes par menu sur une période sélectionnable,
 * avec un tableau récapitulatif et un graphique adaptatif (barres mobiles ou Recharts).
 */
function Stats() {
    const { token } = useAuth();

    // ── Filters ───────────────────────────────────────────────────────────
    const [menuId,   setMenuId]   = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo,   setDateTo]   = useState('');

    // ── Menus list (for the select) ───────────────────────────────────────
    const [menus,      setMenus]      = useState([]);
    const [menusError, setMenusError] = useState('');

    // ── Stats data ────────────────────────────────────────────────────────
    const [rows,      setRows]      = useState([]);
    const [loading,   setLoading]   = useState(false);
    const [fetchError, setFetchError] = useState('');

    // ── Load menus for filter select ──────────────────────────────────────
    useEffect(() => {
        fetch(API_MENUS, { headers: { Accept: 'application/ld+json' } })
            .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
            .then((data) => {
                const list = Array.isArray(data)
                    ? data
                    : (data['hydra:member'] || data.member || []);
                setMenus(list);
            })
            .catch(() => setMenusError('Impossible de charger les menus.'));
    }, []);

    // ── Fetch stats ───────────────────────────────────────────────────────
    const fetchStats = useCallback(async () => {
        setLoading(true);
        setFetchError('');
        try {
            const params = new URLSearchParams();
            if (menuId)   params.set('menu_id',   menuId);
            if (dateFrom) params.set('date_from', dateFrom);
            if (dateTo)   params.set('date_to',   dateTo);

            const res = await fetch(`${API_STATS}?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            const docs = await res.json();
            setRows(aggregateByMenu(docs));
        } catch {
            setFetchError('Impossible de charger les statistiques.');
        } finally {
            setLoading(false);
        }
    }, [token, menuId, dateFrom, dateTo]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // ── Totals ────────────────────────────────────────────────────────────
    const totalQty     = rows.reduce((acc, r) => acc + r.quantity, 0);
    const totalRevenue = rows.reduce((acc, r) => acc + r.revenue,  0);

    // ── Chart label formatter ─────────────────────────────────────────────
    const fmtEuro = (v) => `${v.toFixed(2)} €`;

    return (
        <div className="stats-page">
            <Header />

            <main>
                {/* ── Section filtres ──────────────────────────────────────── */}
                <section className="stats-filters-section" aria-labelledby="stats-filters-title">
                    <div className="container">
                        <h1 id="stats-filters-title" className="stats-title">
                            Statistiques des commandes
                        </h1>
                        <p className="stats-subtitle">
                            Comparez les commandes et le chiffre d'affaires par menu.
                        </p>

                        {menusError && (
                            <p className="form-error" role="alert">{menusError}</p>
                        )}

                        <form
                            className="stats-filters"
                            onSubmit={(e) => e.preventDefault()}
                            role="search"
                            aria-label="Filtres des statistiques"
                        >
                            <div className="stats-filter-group">
                                <label htmlFor="filter-menu" className="stats-filter-label">
                                    Menu
                                </label>
                                <select
                                    id="filter-menu"
                                    className="stats-filter-select"
                                    value={menuId}
                                    onChange={(e) => setMenuId(e.target.value)}
                                    aria-label="Filtrer par menu"
                                >
                                    <option value="">Tous les menus</option>
                                    {menus.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="stats-filter-group">
                                <label htmlFor="filter-date-from" className="stats-filter-label">
                                    Du
                                </label>
                                <DatePicker
                                    id="filter-date-from"
                                    value={dateFrom}
                                    onChange={setDateFrom}
                                    minDate="2020-01-01"
                                />
                            </div>

                            <div className="stats-filter-group">
                                <label htmlFor="filter-date-to" className="stats-filter-label">
                                    Au
                                </label>
                                <DatePicker
                                    id="filter-date-to"
                                    value={dateTo}
                                    onChange={setDateTo}
                                    minDate={dateFrom || '2020-01-01'}
                                />
                            </div>

                            <button
                                type="button"
                                className="stats-filter-btn stats-filter-btn--reset"
                                onClick={() => { setMenuId(''); setDateFrom(''); setDateTo(''); }}
                                aria-label="Réinitialiser les filtres"
                            >
                                Réinitialiser
                            </button>
                        </form>
                    </div>
                </section>

                {/* ── Section tableau ──────────────────────────────────────── */}
                <section className="stats-table-section" aria-labelledby="stats-table-title">
                    <div className="container">
                        <h2 id="stats-table-title" className="stats-section-title">
                            Résumé par menu
                        </h2>

                        {loading && (
                            <p className="stats-loading" aria-live="polite">Chargement...</p>
                        )}

                        {fetchError && (
                            <p className="form-error" role="alert">{fetchError}</p>
                        )}

                        {!loading && !fetchError && rows.length === 0 && (
                            <p className="stats-empty">Aucune donnée pour la période sélectionnée.</p>
                        )}

                        {!loading && rows.length > 0 && (
                            <div className="stats-table-wrapper" role="region" aria-label="Tableau des statistiques">
                                <table className="stats-table" aria-describedby="stats-table-title">
                                    <thead>
                                        <tr>
                                            <th scope="col">Menu</th>
                                            <th scope="col" className="stats-table__num">Quantité commandée</th>
                                            <th scope="col" className="stats-table__num">Chiffre d'affaires</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row) => (
                                            <tr key={row.menu_name}>
                                                <td data-label="Menu">{row.menu_name}</td>
                                                <td className="stats-table__num" data-label="Quantité">{row.quantity}</td>
                                                <td className="stats-table__num" data-label="CA">{row.revenue.toFixed(2)} €</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="stats-table__total">
                                            <td data-label="Menu"><strong>Total</strong></td>
                                            <td className="stats-table__num" data-label="Quantité"><strong>{totalQty}</strong></td>
                                            <td className="stats-table__num" data-label="CA"><strong>{totalRevenue.toFixed(2)} €</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Section graphique ────────────────────────────────────── */}
                {!loading && rows.length > 0 && (
                    <section className="stats-chart-section" aria-labelledby="stats-chart-title">
                        <div className="container">
                            <h2 id="stats-chart-title" className="stats-section-title">
                                Comparaison commandes / chiffre d'affaires
                            </h2>

                            <div className="stats-chart-desktop">
                            <div
                                className="stats-chart-wrapper"
                                role="img"
                                aria-label="Graphique en barres comparant les quantités commandées et le chiffre d'affaires par menu"
                            >
                                <ResponsiveContainer width="100%" height={500}>
                                    <BarChart
                                        data={rows}
                                        margin={{ top: 20, right: 60, left: 20, bottom: 40 }}
                                        aria-label="Graphique des statistiques"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
                                        <XAxis
                                            dataKey="menu_name"
                                            tick={{ fontSize: 11, fill: '#666666' }}
                                            angle={-45}
                                            textAnchor="end"
                                            interval={0}
                                            height={150}
                                        />
                                        <YAxis
                                            yAxisId="qty"
                                            orientation="left"
                                            tick={{ fontSize: 12, fill: '#666666' }}
                                            allowDecimals={false}
                                        />
                                        <YAxis
                                            yAxisId="rev"
                                            orientation="right"
                                            tick={{ fontSize: 12, fill: '#666666' }}
                                            tickFormatter={(v) => `${v} €`}
                                        />
                                        <Tooltip
                                            formatter={(value, name) =>
                                                name === 'Chiffre d\'affaires' ? fmtEuro(value) : value
                                            }
                                            contentStyle={{ fontSize: '0.85rem', borderRadius: '8px' }}
                                        />
                                        <Legend
                                            wrapperStyle={{ paddingTop: '12px', fontSize: '0.9rem' }}
                                        />
                                        <Bar
                                            yAxisId="qty"
                                            dataKey="quantity"
                                            name="Quantité commandée"
                                            fill="#2d5016"
                                            radius={[4, 4, 0, 0]}
                                            maxBarSize={60}
                                        />
                                        <Bar
                                            yAxisId="rev"
                                            dataKey="revenue"
                                            name="Chiffre d'affaires"
                                            fill="#c9a961"
                                            radius={[4, 4, 0, 0]}
                                            maxBarSize={60}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            </div>
                            <div className="stats-chart-mobile">
                                <MobileBarChart rows={rows} />
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Stats;
