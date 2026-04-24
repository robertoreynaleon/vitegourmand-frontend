import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import './StaffMessages.scss';

const API_MESSAGES = 'http://vitegourmand.local/api/staff/messages';

/**
 * Formate une chaîne de date « Y-m-d H:i:s » en format lisible (ex. « lun. 10 mars 2025 à 14h30 »).
 * Retourne « — » si la chaîne est vide ou invalide.
 */
function formatDate(str) {
    if (!str) return '—';
    const d = new Date(str.replace(' ', 'T'));
    if (isNaN(d)) return str;
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

/**
 * Affiche un badge coloré représentant le statut d'un message (Non lu / Lu / Répondu).
 * @param {{ status: 'unread' | 'read' | 'replied' }} props
 */
function StatusBadge({ status }) {
    const labels = { unread: 'Non lu', read: 'Lu', replied: 'Répondu' };
    return (
        <span className={`sm-badge sm-badge--${status}`} aria-label={`Statut : ${labels[status] || status}`}>
            {labels[status] || status}
        </span>
    );
}

/**
 * Page des messages de contact (staff).
 * Affiche la liste des messages reçus, permet de les filtrer par statut,
 * de les marquer comme lus et d'y répondre directement depuis l'interface.
 */
function StaffMessages() {
    const { token } = useAuth();

    const [messages, setMessages]     = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');
    const [expanded, setExpanded]     = useState(null);
    const [replyText, setReplyText]   = useState('');
    const [replyError, setReplyError] = useState('');
    const [replying, setReplying]     = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [filter, setFilter]         = useState('all');

    /** Récupère tous les messages de contact depuis l'API et met à jour l'état local. */
    const fetchMessages = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(API_MESSAGES, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Erreur lors du chargement des messages.');
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchMessages();
    }, [token, fetchMessages]);

    const handleExpand = async (msg) => {
        if (expanded === msg._id) {
            setExpanded(null);
            setReplyText('');
            setReplyError('');
            return;
        }
        setExpanded(msg._id);
        setReplyText('');
        setReplyError('');

        // Marque le message comme lu s'il est encore non lu
        if (msg.status === 'unread') {
            try {
                await fetch(`${API_MESSAGES}/${msg._id}/read`, {
                    method: 'PATCH',
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessages((prev) =>
                    prev.map((m) => m._id === msg._id ? { ...m, status: 'read' } : m)
                );
            } catch {
                // non-blocking
            }
        }
    };

    const handleReply = async (msgId) => {
        if ((replyText || '').trim().length < 5) {
            setReplyError('La réponse doit contenir au moins 5 caractères.');
            return;
        }
        setReplying(true);
        setReplyError('');
        setSuccessMsg('');
        try {
            const res = await fetch(`${API_MESSAGES}/${msgId}/reply`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ staff_response: replyText.trim() }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Erreur lors de l\'envoi.');
            }
            setMessages((prev) =>
                prev.map((m) =>
                    m._id === msgId
                        ? { ...m, status: 'replied', staff_response: replyText.trim() }
                        : m
                )
            );
            setExpanded(null);
            setReplyText('');
            setSuccessMsg('Réponse envoyée avec succès.');
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (e) {
            setReplyError(e.message || 'Une erreur est survenue.');
        } finally {
            setReplying(false);
        }
    };

    const filtered = filter === 'all'
        ? messages
        : messages.filter((m) => m.status === filter);

    const unreadCount = messages.filter((m) => m.status === 'unread').length;

    return (
        <div className="staff-messages-page">
            <Header />

            <main>
                <section className="staff-messages-section">
                    <div className="container">

                        <div className="sm-header">
                            <h1 className="sm-title">
                                Messages de contact
                                {unreadCount > 0 && (
                                    <span className="sm-unread-badge" aria-label={`${unreadCount} non lu${unreadCount > 1 ? 's' : ''}`}>
                                        {unreadCount}
                                    </span>
                                )}
                            </h1>
                        </div>

                        <Link to="/staff/dashboard/" className="sm-back">
                            ← Retour au tableau de bord
                        </Link>

                        {successMsg && (
                            <p className="sm-alert sm-alert--success" role="status">{successMsg}</p>
                        )}
                        {error && (
                            <p className="sm-alert sm-alert--error" role="alert">{error}</p>
                        )}

                        {/* Filters */}
                        <div className="sm-filters" role="group" aria-label="Filtrer par statut">
                            {['all', 'unread', 'read', 'replied'].map((f) => (
                                <button
                                    key={f}
                                    className={`sm-filter-btn${filter === f ? ' sm-filter-btn--active' : ''}`}
                                    onClick={() => setFilter(f)}
                                >
                                    {f === 'all' ? 'Tous' : f === 'unread' ? 'Non lus' : f === 'read' ? 'Lus' : 'Répondus'}
                                    {f === 'unread' && unreadCount > 0 && (
                                        <span className="sm-filter-count">{unreadCount}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <p className="sm-loading">Chargement…</p>
                        ) : filtered.length === 0 ? (
                            <p className="sm-empty">Aucun message{filter !== 'all' ? ' dans cette catégorie' : ''}.</p>
                        ) : (
                            <ul className="sm-list">
                                {filtered.map((msg) => (
                                    <li key={msg._id} className={`sm-item${msg.status === 'unread' ? ' sm-item--unread' : ''}`}>
                                        <button
                                            className="sm-item-header"
                                            onClick={() => handleExpand(msg)}
                                            aria-expanded={expanded === msg._id}
                                        >
                                            <div className="sm-item-meta">
                                                <span className="sm-item-email">{msg.client_email}</span>
                                                <span className="sm-item-date">{formatDate(msg.sent_at)}</span>
                                            </div>
                                            <div className="sm-item-right">
                                                <span className="sm-item-subject">{msg.subject}</span>
                                                <StatusBadge status={msg.status} />
                                                <svg
                                                    className={`sm-chevron${expanded === msg._id ? ' sm-chevron--open' : ''}`}
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </div>
                                        </button>

                                        {expanded === msg._id && (
                                            <div className="sm-item-body">
                                                <p className="sm-content-label">Message :</p>
                                                <p className="sm-content-text">{msg.content}</p>

                                                {msg.staff_response && (
                                                    <div className="sm-previous-reply">
                                                        <p className="sm-content-label">Réponse envoyée :</p>
                                                        <p className="sm-content-text sm-content-text--reply">{msg.staff_response}</p>
                                                        {msg.replied_at && (
                                                            <p className="sm-replied-date">Le {formatDate(msg.replied_at)}</p>
                                                        )}
                                                    </div>
                                                )}

                                                {msg.status !== 'replied' && (
                                                    <div className="sm-reply-form">
                                                        <label className="sm-reply-label" htmlFor={`reply-${msg._id}`}>
                                                            Votre réponse :
                                                        </label>
                                                        <textarea
                                                            id={`reply-${msg._id}`}
                                                            className={`sm-reply-textarea${replyError ? ' sm-reply-textarea--error' : ''}`}
                                                            value={replyText}
                                                            onChange={(e) => {
                                                                setReplyText(e.target.value);
                                                                setReplyError('');
                                                            }}
                                                            rows={4}
                                                            maxLength={3000}
                                                            placeholder="Rédigez votre réponse ici…"
                                                        />
                                                        {replyError && (
                                                            <span className="sm-reply-error" role="alert">{replyError}</span>
                                                        )}
                                                        <button
                                                            className="sm-reply-btn"
                                                            onClick={() => handleReply(msg._id)}
                                                            disabled={replying}
                                                        >
                                                            {replying ? 'Envoi…' : 'Envoyer la réponse'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default StaffMessages;
