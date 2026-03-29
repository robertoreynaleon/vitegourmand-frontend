import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './Auth.scss';

function Register() {
	return (
		<div className="auth-page-wrapper">
			<Header />
			<main>
				<section className="form-page-section" aria-labelledby="register-title">
					<div className="container">
						<div className="form-content">
							<h1 id="register-title" className="form-page-title">Creer un compte</h1>
							<p className="form-subtitle">Rejoignez ViteGourmand et profitez de nos menus</p>

							<form className="form-main" method="post" action="/auth/register/">
								<div className="form-row">
									<div className="form-group">
										<label htmlFor="name" className="form-label">Prenom</label>
										<input
											type="text"
											id="name"
											name="name"
											className="form-input-field"
											autoComplete="given-name"
											required
										/>
									</div>

									<div className="form-group">
										<label htmlFor="lastname" className="form-label">Nom</label>
										<input
											type="text"
											id="lastname"
											name="lastname"
											className="form-input-field"
											autoComplete="family-name"
											required
										/>
									</div>
								</div>

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
									<label htmlFor="phone" className="form-label">Telephone mobile</label>
									<input
										type="tel"
										id="phone"
										name="phone"
										className="form-input-field"
										autoComplete="tel"
										required
									/>
								</div>

								<div className="form-group">
									<label htmlFor="address" className="form-label">Adresse</label>
									<input
										type="text"
										id="address"
										name="address"
										className="form-input-field"
										autoComplete="street-address"
										required
									/>
								</div>

								<div className="form-row">
									<div className="form-group">
										<label htmlFor="city" className="form-label">Ville</label>
										<input
											type="text"
											id="city"
											name="city"
											className="form-input-field"
											autoComplete="address-level2"
											required
										/>
									</div>

									<div className="form-group">
										<label htmlFor="postalCode" className="form-label">Code Postal</label>
										<input
											type="text"
											id="postalCode"
											name="postalCode"
											className="form-input-field"
											autoComplete="postal-code"
											required
										/>
									</div>
								</div>

								<div className="form-group">
									<label htmlFor="password" className="form-label">Mot de passe</label>
									<input
										type="password"
										id="password"
										name="password"
										className="form-input-field"
										autoComplete="new-password"
										required
									/>
								</div>

								<div className="form-group">
									<label htmlFor="password_confirm" className="form-label">Confirmer le mot de passe</label>
									<input
										type="password"
										id="password_confirm"
										name="password_confirm"
										className="form-input-field"
										autoComplete="new-password"
										required
									/>
								</div>

								<button type="submit" className="form-btn-submit">S'inscrire</button>
							</form>

							<div className="form-alt-section">
								<p className="form-alt-text">Vous avez deja un compte ?</p>
								<a href="/auth/login/" className="form-alt-link">Se connecter</a>
							</div>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}

export default Register;
