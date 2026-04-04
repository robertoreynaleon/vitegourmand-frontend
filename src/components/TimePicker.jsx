import React, { useState, useRef, useEffect } from 'react';
import './TimePicker.scss';

// Créneaux de 08:00 à 20:00 par tranches de 30 min
function generateSlots() {
    const slots = [];
    for (let h = 8; h <= 20; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`);
        if (h < 20) slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
}

const TIME_SLOTS = generateSlots();

// value    : string HH:MM ou ''
// onChange : (HH:MM) => void
// id       : string — pour l'association <label htmlFor>
function TimePicker({ id, value, onChange }) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);
    const listRef = useRef(null);

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

    // Scroll automatique sur le créneau sélectionné à l'ouverture
    useEffect(() => {
        if (!open || !value || !listRef.current) return;
        const selected = listRef.current.querySelector('.tp-option--selected');
        if (selected) {
            selected.scrollIntoView({ block: 'nearest' });
        }
    }, [open, value]);

    const displayValue = value || 'Sélectionner une heure';

    return (
        <div className="tp-wrapper" ref={wrapperRef}>
            <button
                type="button"
                id={id}
                className={`tp-trigger${open ? ' tp-trigger--open' : ''}`}
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className={`tp-trigger-text${!value ? ' tp-trigger-text--placeholder' : ''}`}>
                    {displayValue}
                </span>
                {/* Icône horloge */}
                <svg className="tp-trigger-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                    <polyline
                        points="12 7 12 12 15.5 14.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {open && (
                <ul
                    ref={listRef}
                    className="tp-list"
                    role="listbox"
                    aria-label="Sélectionner une heure"
                >
                    {TIME_SLOTS.map((slot) => {
                        const isSelected = value === slot;
                        return (
                            <li key={slot} role="option" aria-selected={isSelected}>
                                <button
                                    type="button"
                                    className={`tp-option${isSelected ? ' tp-option--selected' : ''}`}
                                    onClick={() => { onChange(slot); setOpen(false); }}
                                >
                                    {slot}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default TimePicker;
