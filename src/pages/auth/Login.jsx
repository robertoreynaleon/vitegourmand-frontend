import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './Login.scss';

function Login() {
	return (
		<div className="auth-page-wrapper">
			<Header />
			<main>
				<section className="form-page-section" aria-labelledby="login-title">
					<div className="container">
						<div className="form-content">
							<h1 id="login-title" className="form-page-title">Connexion</h1>
							<p className="form-subtitle">Accedez a votre espace ViteGourmand</p>

							<form className="form-main" method="post" action="/auth/login/">
								<div className="form-group">
									<label htmlFor="email" className="form-label">Mail</label>
									<input
										type="email"
										id="email"
										name="email"
										className="form-input-field"
										autoComplete="email"
										required
									/>
								</div>

								<div className="form-group">
									<label htmlFor="password" className="form-label">Mot de passe</label>
									<input
										type="password"
										id="password"
										name="password"
										className="form-input-field"
										autoComplete="current-password"
										required
									/>
								</div>

								<button type="submit" className="form-btn-submit">Se connecter</button>
							</form>

							<div className="form-alt-section">
								<p className="form-alt-text">Vous n'avez pas encore de compte ?</p>
								<a href="/auth/register/" className="form-alt-link">Creer un compte</a>
							</div>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}

export default Login;
