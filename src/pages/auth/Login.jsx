import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/authService";
import "./Auth.scss";

function Login() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const justRegistered = location.state?.registered === true;
	const [credentialsUpdated] = useState(() => {
		const flag = sessionStorage.getItem("credentials_updated") === "1";
		if (flag) sessionStorage.removeItem("credentials_updated");
		return flag;
	});

	const [cartLoginRequired] = useState(() => {
		const flag = sessionStorage.getItem('cart_login_required') === '1';
		if (flag) sessionStorage.removeItem('cart_login_required');
		return flag;
	});

	const [formValues, setFormValues] = useState({ email: "", password: "" });
	const [errors, setErrors] = useState({});
	const [serverError, setServerError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormValues((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: "" }));
		setServerError("");
	};

	const validate = () => {
		const newErrors = {};
		if (!formValues.email.trim()) {
			newErrors.email = "L adresse email est obligatoire.";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
			newErrors.email = "L adresse email n est pas valide.";
		}
		if (!formValues.password) {
			newErrors.password = "Le mot de passe est obligatoire.";
		}
		return newErrors;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		const validationErrors = validate();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			const firstKey = Object.keys(validationErrors)[0];
			const target = event.currentTarget.querySelector(`[name="${firstKey}"]`);
			if (target) target.focus();
			return;
		}

		setIsSubmitting(true);
		setServerError("");

		try {
			const { token, user } = await loginUser(formValues.email, formValues.password);
			login(user, token);
			const from = location.state?.from;
			navigate(typeof from === 'string' ? from : from?.pathname || '/');
		} catch (err) {
			if (err.response?.status === 401) {
				setServerError("Email ou mot de passe incorrect.");
			} else {
				setServerError("Une erreur est survenue. Veuillez reessayer.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="auth-page-wrapper">
			<Header />
			<main>
				<section className="form-page-section" aria-labelledby="login-title">
					<div className="container">
						<div className="form-content">
							<h1 id="login-title" className="form-page-title">Connexion</h1>
							<p className="form-subtitle">Accedez a votre espace ViteGourmand</p>

							{justRegistered && (
								<p className="form-success" role="status" aria-live="polite">
									Votre compte a bien ete cree. Connectez-vous !
								</p>
							)}

							{credentialsUpdated && (
								<p className="form-success" role="status" aria-live="polite">
									Vos informations ont bien ete mises a jour. Reconnectez-vous avec vos nouveaux identifiants.
								</p>
							)}

							{cartLoginRequired && (
								<p className="form-info" role="status" aria-live="polite">
									Il est nécessaire d'être connecté pour acheter un menu.
								</p>
							)}

							<form className="form-main" onSubmit={handleSubmit} noValidate>
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
										aria-describedby={errors.email ? "email-error" : undefined}
										required
									/>
									{errors.email && (
										<p id="email-error" className="form-error" aria-live="polite">{errors.email}</p>
									)}
								</div>

								<div className="form-group">
									<label htmlFor="password" className="form-label">Mot de passe</label>
									<div className="form-password-row">
										<input
											type={showPassword ? "text" : "password"}
											id="password"
											name="password"
											className="form-input-field form-input-field--with-toggle"
											autoComplete="current-password"
											value={formValues.password}
											onChange={handleChange}
											aria-invalid={Boolean(errors.password)}
											aria-describedby={errors.password ? "password-error" : undefined}
											required
										/>
										<button
											type="button"
											className="form-password-toggle"
											onClick={() => setShowPassword((prev) => !prev)}
											aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
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
									{errors.password && (
										<p id="password-error" className="form-error" aria-live="polite">{errors.password}</p>
									)}
								</div>

								<button type="submit" className="form-btn-submit" disabled={isSubmitting}>
									{isSubmitting ? "Connexion..." : "Se connecter"}
								</button>
							</form>

							<div className="form-alt-section">
								<p className="form-alt-text">Vous n avez pas encore de compte ?</p>
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
