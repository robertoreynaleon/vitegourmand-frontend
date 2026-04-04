import React, { useState, useRef, useEffect } from 'react';
import './DatePicker.scss';

const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

// value     : string YYYY-MM-DD ou ''
// minDate   : string YYYY-MM-DD
// onChange  : (YYYY-MM-DD) => void
// id        : string — pour l'association <label htmlFor>
function DatePicker({ id, value, onChange, minDate }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDateObj = minDate ? new Date(minDate + 'T00:00:00') : today;

    const selectedDateObj = value ? new Date(value + 'T00:00:00') : null;

    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(minDateObj.getFullYear());
    const [viewMonth, setViewMonth] = useState(minDateObj.getMonth());
    const wrapperRef = useRef(null);

    // Fermeture au clic extérieur
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Fermeture à la touche Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open]);

    // Affichage dans le bouton déclencheur
    const displayValue = selectedDateObj
        ? `${selectedDateObj.getDate()} ${MONTHS[selectedDateObj.getMonth()]} ${selectedDateObj.getFullYear()}`
        : 'Sélectionner une date';

    // Construction de la grille du mois
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    // Lundi = 0 (JS : dimanche = 0, donc +6 % 7)
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
        cells.push(new Date(viewYear, viewMonth, d));
    }

    const canGoPrev =
        new Date(viewYear, viewMonth, 1) >
        new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1);

    const handlePrevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
        else setViewMonth((m) => m - 1);
    };
    const handleNextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
        else setViewMonth((m) => m + 1);
    };

    const handleDayClick = (day) => {
        if (!day || day < minDateObj) return;
        const y = day.getFullYear();
        const m = String(day.getMonth() + 1).padStart(2, '0');
        const d = String(day.getDate()).padStart(2, '0');
        onChange(`${y}-${m}-${d}`);
        setOpen(false);
    };

    const isSameDay = (a, b) =>
        a && b && a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    return (
        <div className="dp-wrapper" ref={wrapperRef}>
            <button
                type="button"
                id={id}
                className={`dp-trigger${open ? ' dp-trigger--open' : ''}`}
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                <span className={`dp-trigger-text${!value ? ' dp-trigger-text--placeholder' : ''}`}>
                    {displayValue}
                </span>
                {/* Icône calendrier */}
                <svg className="dp-trigger-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                    <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2" />
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            {open && (
                <div className="dp-calendar" role="dialog" aria-label="Choisir une date">
                    {/* Navigation mois */}
                    <div className="dp-header">
                        <button
                            type="button"
                            className="dp-nav-btn"
                            onClick={handlePrevMonth}
                            disabled={!canGoPrev}
                            aria-label="Mois précédent"
                        >
                            ‹
                        </button>
                        <span className="dp-month-label">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button
                            type="button"
                            className="dp-nav-btn"
                            onClick={handleNextMonth}
                            aria-label="Mois suivant"
                        >
                            ›
                        </button>
                    </div>

                    {/* Grille */}
                    <div className="dp-grid" role="grid">
                        {/* En-têtes jours */}
                        {DAYS_SHORT.map((d) => (
                            <div key={d} className="dp-day-header" role="columnheader" aria-label={d}>
                                {d}
                            </div>
                        ))}

                        {/* Cellules */}
                        {cells.map((day, idx) => {
                            const disabled = !day || day < minDateObj;
                            const selected = day && isSameDay(day, selectedDateObj);
                            const isToday = day && isSameDay(day, today);
                            const cls = [
                                'dp-day',
                                !day ? 'dp-day--empty' : '',
                                selected ? 'dp-day--selected' : '',
                                isToday && !selected ? 'dp-day--today' : '',
                                disabled && day ? 'dp-day--disabled' : '',
                            ].filter(Boolean).join(' ');

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    className={cls}
                                    onClick={() => handleDayClick(day)}
                                    disabled={disabled}
                                    aria-label={
                                        day
                                            ? `${day.getDate()} ${MONTHS[day.getMonth()]} ${day.getFullYear()}`
                                            : undefined
                                    }
                                    aria-pressed={selected || undefined}
                                    tabIndex={disabled ? -1 : 0}
                                >
                                    {day ? day.getDate() : ''}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DatePicker;
