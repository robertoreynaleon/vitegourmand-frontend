import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { loginUser } from "../../services/authService";
import { loadCart } from "../../services/cartCalc";
import "./Auth.scss";

/**
 * Page de connexion.
 * Permet à l'utilisateur de s'authentifier avec son e-mail et son mot de passe.
 * Après connexion réussie, redirige vers la page d'origine (ou l'accueil).
 * Affiche des messages contextuels si l'utilisateur vient de s'inscrire,
 * si sa session a expiré ou si ses identifiants viennent d'être modifiés.
 */
function Login() {
	const { login } = useAuth();
	const { showNotification } = useNotification();
	const navigate = useNavigate();
	const location = useLocation();
	// Vrai si l'utilisateur arrive depuis la page d'inscription
	const justRegistered = location.state?.registered === true;
	// Vrai si la session JWT a expiré et l'utilisateur a été redirigé
	const sessionExpired = location.state?.sessionExpired === true;
	// Vrai si l'utilisateur vient de réinitialiser son mot de passe avec succès
	const passwordReset = location.state?.passwordReset === true;
	const [credentialsUpdated] = useState(() => {
		// Flag sessionStorage posé après modification d'e-mail ou de mot de passe
		const flag = sessionStorage.getItem("credentials_updated") === "1";
		if (flag) sessionStorage.removeItem("credentials_updated");
		return flag;
	});

	const [cartLoginRequired] = useState(() => {
		// Flag sessionStorage posé quand l'utilisateur tente de passer commande sans être connecté
		const flag = sessionStorage.getItem('cart_login_required') === '1';
		if (flag) sessionStorage.removeItem('cart_login_required');
		return flag;
	});

	const [formValues, setFormValues] = useState({ email: "", password: "" });
	const [errors, setErrors] = useState({});
	const [serverError, setServerError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	/** Met à jour le champ modifié et efface ses messages d'erreur. */
	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormValues((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: "" }));
		setServerError("");
	};

	/** Valide les champs e-mail et mot de passe. Retourne un objet d'erreurs (vide si valide). */
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

	/** Soumet le formulaire après validation et déclenche la connexion via l'API. */
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
			showNotification('Bienvenue ! Vous etes maintenant connecte.', 'success');

			// ── Redirection selon le rôle ─────────────────────────────────────
			const roles = user.roles ?? [];
			const isStaff  = roles.includes('ROLE_STAFF_MEMBER');
			const isAdmin  = roles.includes('ROLE_ADMIN');
			const isClient = roles.includes('ROLE_CLIENT');

			if (isStaff || isAdmin) {
				// STAFF et ADMIN → TOUJOURS vers le tableau de bord staff, sans exception
				navigate('/staff/dashboard/');
			} else if (isClient) {
				// CLIENT avec des menus dans le panier → page MON PANIER
				// CLIENT sans panier → tableau de bord client
				const cartItems = loadCart();
				navigate(cartItems.length > 0 ? '/user/order/' : '/user/dashboard/');
			} else {
				// Rôle inconnu : accueil par défaut
				navigate('/');
			}
		} catch (err) {
			if (err.response?.status === 401) {
				setServerError('Email ou mot de passe incorrect. Verifiez vos identifiants et reessayez.');
			} else {
				setServerError('Une erreur est survenue. Veuillez reessayer.');
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

							{sessionExpired && (
							<p className="form-error" role="alert">
								Votre session a expiré. Veuillez vous reconnecter.
							</p>
						)}

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

							{passwordReset && (
								<p className="form-success" role="status" aria-live="polite">
									Votre mot de passe a été réinitialisé avec succès. Connectez-vous avec vos nouveaux identifiants.
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

								{serverError && (
									<p
										id="server-error"
										className="form-error--server"
										role="alert"
										aria-live="assertive"
									>
										{serverError}
									</p>
								)}

								<button type="submit" className="form-btn-submit" disabled={isSubmitting}>
									{isSubmitting ? "Connexion..." : "Se connecter"}
								</button>
							</form>

							<div className="form-alt-section">
								<Link to="/auth/forgot-password/" className="form-alt-link">
									Mot de passe oublié ?
								</Link>
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
