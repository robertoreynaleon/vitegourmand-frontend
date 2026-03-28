import React from 'react';
import './PageLoader.scss';

function PageLoader({ message = 'Chargement en cours...' }) {
    return (
        <div className="page-loader" role="status" aria-live="polite">
            <div className="page-loader-inner">
                <div className="page-loader-icon" aria-hidden="true"></div>
                <p className="page-loader-text">{message}</p>
            </div>
        </div>
    );
}

export default PageLoader;
