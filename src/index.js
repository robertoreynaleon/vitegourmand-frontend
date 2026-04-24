import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Point d'entrée React : monte le composant racine App dans le div#root du fichier public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Mesure de performance optionnelle (désactivée par défaut).
// Passer reportWebVitals(console.log) pour afficher les métriques Core Web Vitals.
reportWebVitals();
