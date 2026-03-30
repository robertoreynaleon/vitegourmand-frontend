import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './Auth.scss';
import { validateRegister } from './registerValidation';

function Register() {
	const navigate = useNavigate();

	const [formValues, setFormValues] = useState({
		name: '',
		lastname: '',
		email: '',
		phone: '',
		address: '',
		city: '',
		postalCode: '',
		password: '',
		password_confirm: ''
	});
	const [errors, setErrors] = useState({});
	const [serverError, setServerError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormValues((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: '' }));
		setServerError('');
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		const validationErrors = validateRegister(formValues);
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			const firstInvalid = Object.keys(validationErrors)[0];
			const target = event.currentTarget.querySelector(`[name="${firstInvalid}"]`);
			if (target) target.focus();
			return;
		}
		setErrors({});
		setServerError('');
		setIsSubmitting(true);

		try {
			const body = new URLSearchParams();
			Object.entries(formValues).forEach(([key, val]) => body.append(key, val));

			const response = await fetch('http://vitegourmand.local/auth/register/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: body.toString(),
			});

			const data = await response.json();

			if (response.ok && data.success) {
				navigate('/auth/login', { state: { registered: true } });
			} else {
				setServerError(data.message || 'Une erreur est survenue. Veuillez réessayer.');
			}
		} catch {
			setServerError('Impossible de contacter le serveur. Veuillez réessayer.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="auth-page-wrapper">
			<Header />
			<main>
				<section className="form-page-section" aria-labelledby="register-title">
					<div className="container">
						<div className="form-content">
							<h1 id="register-title" className="form-page-title">Creer un compte</h1>
							<p className="form-subtitle">Rejoignez ViteGourmand et profitez de nos menus</p>

							{serverError && (
								<p className="form-error form-error--server" role="alert" aria-live="assertive">
									{serverError}
								</p>
							)}

							<form className="form-main" onSubmit={handleSubmit} noValidate>
								<div className="form-row">
									<div className="form-group">
										<label htmlFor="name" className="form-label">Prenom</label>
										<input
											type="text"
											id="name"
											name="name"
											className="form-input-field"
											autoComplete="given-name"
											value={formValues.name}
											onChange={handleChange}
											aria-invalid={Boolean(errors.name)}
											aria-describedby={errors.name ? 'name-error' : undefined}
											required
										/>
										{errors.name && <p id="name-error" className="form-error" aria-live="polite">{errors.name}</p>}
									</div>

									<div className="form-group">
										<label htmlFor="lastname" className="form-label">Nom</label>
										<input
											type="text"
											id="lastname"
											name="lastname"
											className="form-input-field"
											autoComplete="family-name"
											value={formValues.lastname}
											onChange={handleChange}
											aria-invalid={Boolean(errors.lastname)}
											aria-describedby={errors.lastname ? 'lastname-error' : undefined}
											required
										/>
										{errors.lastname && <p id="lastname-error" className="form-error" aria-live="polite">{errors.lastname}</p>}
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
										value={formValues.email}
										onChange={handleChange}
										aria-invalid={Boolean(errors.email)}
										aria-describedby={errors.email ? 'email-error' : undefined}
										required
									/>
									{errors.email && <p id="email-error" className="form-error" aria-live="polite">{errors.email}</p>}
								</div>

								<div className="form-group">
									<label htmlFor="phone" className="form-label">Telephone mobile</label>
									<input
										type="tel"
										id="phone"
										name="phone"
										className="form-input-field"
										autoComplete="tel"
										value={formValues.phone}
										onChange={handleChange}
										aria-invalid={Boolean(errors.phone)}
										aria-describedby={errors.phone ? 'phone-error' : undefined}
										required
									/>
									{errors.phone && <p id="phone-error" className="form-error" aria-live="polite">{errors.phone}</p>}
								</div>

								<div className="form-group">
									<label htmlFor="address" className="form-label">Adresse</label>
									<input
										type="text"
										id="address"
										name="address"
										className="form-input-field"
										autoComplete="street-address"
										value={formValues.address}
										onChange={handleChange}
										aria-invalid={Boolean(errors.address)}
										aria-describedby={errors.address ? 'address-error' : undefined}
										required
									/>
									{errors.address && <p id="address-error" className="form-error" aria-live="polite">{errors.address}</p>}
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
											value={formValues.city}
											onChange={handleChange}
											aria-invalid={Boolean(errors.city)}
											aria-describedby={errors.city ? 'city-error' : undefined}
											required
										/>
										{errors.city && <p id="city-error" className="form-error" aria-live="polite">{errors.city}</p>}
									</div>

									<div className="form-group">
										<label htmlFor="postalCode" className="form-label">Code Postal</label>
										<input
											type="text"
											id="postalCode"
											name="postalCode"
											className="form-input-field"
											autoComplete="postal-code"
											value={formValues.postalCode}
											onChange={handleChange}
											aria-invalid={Boolean(errors.postalCode)}
											aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
											required
										/>
										{errors.postalCode && <p id="postalCode-error" className="form-error" aria-live="polite">{errors.postalCode}</p>}
									</div>
								</div>

								<div className="form-group">
									<label htmlFor="password" className="form-label">Mot de passe</label>
									<div className="form-password-row">
										<input
											type={showPassword ? 'text' : 'password'}
											id="password"
											name="password"
											className="form-input-field form-input-field--with-toggle"
											autoComplete="new-password"
											value={formValues.password}
											onChange={handleChange}
											aria-invalid={Boolean(errors.password)}
											aria-describedby={errors.password ? 'password-error' : undefined}
											required
										/>
										<button
											type="button"
											className="form-password-toggle"
											onClick={() => setShowPassword((prev) => !prev)}
											aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
										>
											{showPassword ? (
												<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
													<path d="M3 12c2.7-4.5 6.2-7 9-7s6.3 2.5 9 7c-2.7 4.5-6.2 7-9 7s-6.3-2.5-9-7z" fill="none" stroke="currentColor" strokeWidth="2" />
													<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
												</svg>
											) : (
												<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
													<path d="M2 5l20 14" fill="none" stroke="currentColor" strokeWidth="2" />
													<path d="M4.5 7.5C3.6 8.7 2.9 10.1 2.2 12c2.7 4.5 6.2 7 9 7 1.5 0 3-.4 4.4-1.1" fill="none" stroke="currentColor" strokeWidth="2" />
													<path d="M9.5 9.8a3.2 3.2 0 0 0 4.7 4.4" fill="none" stroke="currentColor" strokeWidth="2" />
													<path d="M19.8 12c-.7-1.8-1.4-3.2-2.3-4.4" fill="none" stroke="currentColor" strokeWidth="2" />
												</svg>
											)}
										</button>
									</div>
									{errors.password && <p id="password-error" className="form-error" aria-live="polite">{errors.password}</p>}
								</div>

								<div className="form-group">
									<label htmlFor="password_confirm" className="form-label">Confirmer le mot de passe</label>
									<div className="form-password-row">
										<input
											type={showPasswordConfirm ? 'text' : 'password'}
											id="password_confirm"
											name="password_confirm"
											className="form-input-field form-input-field--with-toggle"
											autoComplete="new-password"
											value={formValues.password_confirm}
											onChange={handleChange}
											aria-invalid={Boolean(errors.password_confirm)}
											aria-describedby={errors.password_confirm ? 'password-confirm-error' : undefined}
											required
										/>
										<button
											type="button"
											className="form-password-toggle"
											onClick={() => setShowPasswordConfirm((prev) => !prev)}
											aria-label={showPasswordConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
										>
											{showPasswordConfirm ? (
												<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
													<path d="M3 12c2.7-4.5 6.2-7 9-7s6.3 2.5 9 7c-2.7 4.5-6.2 7-9 7s-6.3-2.5-9-7z" fill="none" stroke="currentColor" strokeWidth="2" />
													<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
												</svg>
											) : (
												<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
													<path d="M2 5l20 14" fill="none" stroke="currentColor" strokeWidth="2" />
													<path d="M4.5 7.5C3.6 8.7 2.9 10.1 2.2 12c2.7 4.5 6.2 7 9 7 1.5 0 3-.4 4.4-1.1" fill="none" stroke="currentColor" strokeWidth="2" />
													<path d="M9.5 9.8a3.2 3.2 0 0 0 4.7 4.4" fill="none" stroke="currentColor" strokeWidth="2" />
													<path d="M19.8 12c-.7-1.8-1.4-3.2-2.3-4.4" fill="none" stroke="currentColor" strokeWidth="2" />
												</svg>
											)}
										</button>
									</div>
									{errors.password_confirm && <p id="password-confirm-error" className="form-error" aria-live="polite">{errors.password_confirm}</p>}
								</div>

								<button type="submit" className="form-btn-submit" disabled={isSubmitting}>
								{isSubmitting ? 'Enregistrement...' : "S'inscrire"}
							</button>
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
