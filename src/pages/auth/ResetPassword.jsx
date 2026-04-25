import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { resetPassword } from "../../services/authService";
import "./Auth.scss";
import "./ResetPassword.scss";

/** Expression régulière de validation du mot de passe (identique à l'inscription). */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{12,}$/;

/**
 * Page "Réinitialiser le mot de passe".
 * Accessible via le lien reçu par e-mail : /auth/reset-password?token=...
 * Affiche un formulaire avec deux champs (nouveau mot de passe + confirmation)
 * ainsi qu'un indicateur de force du mot de passe.
 * En cas de succès, redirige vers la page de connexion avec un message de confirmation.
 */
function ResetPassword() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	// Récupération du token depuis l'URL (?token=...)
	const token = searchParams.get("token") || "";

	const [formValues, setFormValues] = useState({ password: "", passwordConfirm: "" });
	const [errors, setErrors] = useState({});
	const [serverError, setServerError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	/**
	 * Calcule le niveau de force du mot de passe (0 à 4).
	 * Critères : longueur ≥ 12, minuscule, majuscule, chiffre, caractère spécial.
	 *
	 * @param {string} pwd Mot de passe à évaluer
	 * @returns {number} Score entre 0 (vide) et 4 (très fort)
	 */
	const getPasswordStrength = (pwd) => {
		if (!pwd) return 0;
		let score = 0;
		if (pwd.length >= 12)          score++;
		if (/[A-Z]/.test(pwd))         score++;
		if (/\d/.test(pwd))            score++;
		if (/[^\w\s]/.test(pwd))       score++;
		return score;
	};

	/**
	 * Retourne le libellé correspondant au score de force du mot de passe.
	 *
	 * @param {number} score Score entre 0 et 4
	 * @returns {string} Libellé de force
	 */
	const getStrengthLabel = (score) => {
		const labels = ["", "Faible", "Moyen", "Bon", "Fort"];
		return labels[score] || "";
	};

	/** Met à jour le champ modifié et efface son message d'erreur. */
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormValues((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: "" }));
		setServerError("");
	};

	/**
	 * Valide les champs du formulaire.
	 * Retourne un objet d'erreurs (vide si tout est valide).
	 */
	const validate = () => {
		const newErrors = {};

		if (!formValues.password) {
			newErrors.password = "Le nouveau mot de passe est obligatoire.";
		} else if (!PASSWORD_REGEX.test(formValues.password)) {
			newErrors.password =
				"Minimum 12 caractères avec majuscule, chiffre et caractère spécial.";
		}

		if (!formValues.passwordConfirm) {
			newErrors.passwordConfirm = "La confirmation est obligatoire.";
		} else if (formValues.password !== formValues.passwordConfirm) {
			newErrors.passwordConfirm = "Les mots de passe ne correspondent pas.";
		}

		return newErrors;
	};

	/** Soumet le nouveau mot de passe à l'API après validation. */
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Vérification préalable que le token est bien présent dans l'URL
		if (!token) {
			setServerError("Lien de réinitialisation invalide ou manquant.");
			return;
		}

		const validationErrors = validate();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		setIsSubmitting(true);
		setServerError("");

		try {
			await resetPassword(token, formValues.password);
			// Redirection vers la connexion avec un flag pour afficher le message de succès
			navigate("/auth/login/", { state: { passwordReset: true } });
		} catch (err) {
			if (err.response?.status === 400) {
				setServerError(
					err.response.data?.message ||
					"Ce lien de réinitialisation est invalide ou a expiré."
				);
			} else {
				setServerError("Une erreur est survenue. Veuillez réessayer.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const strengthScore = getPasswordStrength(formValues.password);
	const strengthLabel = getStrengthLabel(strengthScore);

	return (
		<div className="auth-page-wrapper">
			<Header />
			<main>
				<section
					className="form-page-section"
					aria-labelledby="reset-password-title"
				>
					<div className="container">
						<div className="form-content">
							<h1
								id="reset-password-title"
								className="form-page-title"
							>
								Nouveau mot de passe
							</h1>
							<p className="form-subtitle">
								Choisissez un mot de passe sécurisé pour votre compte.
							</p>

							{/* Avertissement si le token est absent de l'URL */}
							{!token && (
								<p className="form-error--server" role="alert">
									Lien invalide. Veuillez refaire une demande de réinitialisation.{" "}
									<Link to="/auth/forgot-password/" className="form-alt-link">
										Mot de passe oublié
									</Link>
								</p>
							)}

							{/* Erreur renvoyée par le serveur (token expiré, déjà utilisé…) */}
							{serverError && (
								<p className="form-error--server" role="alert">
									{serverError}
								</p>
							)}

							{token && (
								<form
									className="form-main"
									onSubmit={handleSubmit}
									noValidate
								>
									{/* ---- Nouveau mot de passe ---- */}
									<div className="form-group">
										<label htmlFor="password" className="form-label">
											Nouveau mot de passe
										</label>
										<div className="form-password-row">
											<input
												type={showPassword ? "text" : "password"}
												id="password"
												name="password"
												className="form-input-field form-input-field--with-toggle"
												autoComplete="new-password"
												value={formValues.password}
												onChange={handleChange}
												aria-invalid={Boolean(errors.password)}
												aria-describedby={
													errors.password
														? "password-error"
														: "password-strength"
												}
												required
											/>
											<button
												type="button"
												className="form-password-toggle"
												onClick={() => setShowPassword((prev) => !prev)}
												aria-label={
													showPassword
														? "Masquer le mot de passe"
														: "Afficher le mot de passe"
												}
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

										{/* Indicateur de force du mot de passe (RGAA : aria-describedby) */}
										{formValues.password && (
											<div
												id="password-strength"
												className={`reset-password-strength reset-password-strength--${strengthScore}`}
												aria-live="polite"
												aria-atomic="true"
											>
												<div className="reset-password-strength__bar">
													{[1, 2, 3, 4].map((step) => (
														<span
															key={step}
															className={`reset-password-strength__segment${step <= strengthScore ? " reset-password-strength__segment--active" : ""}`}
															aria-hidden="true"
														/>
													))}
												</div>
												<span className="reset-password-strength__label">
													{strengthLabel}
												</span>
											</div>
										)}

										{errors.password && (
											<p
												id="password-error"
												className="form-error"
												role="alert"
												aria-live="polite"
											>
												{errors.password}
											</p>
										)}
									</div>

									{/* ---- Confirmation du mot de passe ---- */}
									<div className="form-group">
										<label htmlFor="passwordConfirm" className="form-label">
											Confirmer le mot de passe
										</label>
										<div className="form-password-row">
											<input
												type={showConfirm ? "text" : "password"}
												id="passwordConfirm"
												name="passwordConfirm"
												className="form-input-field form-input-field--with-toggle"
												autoComplete="new-password"
												value={formValues.passwordConfirm}
												onChange={handleChange}
												aria-invalid={Boolean(errors.passwordConfirm)}
												aria-describedby={
													errors.passwordConfirm
														? "passwordConfirm-error"
														: undefined
												}
												required
											/>
											<button
												type="button"
												className="form-password-toggle"
												onClick={() => setShowConfirm((prev) => !prev)}
												aria-label={
													showConfirm
														? "Masquer la confirmation"
														: "Afficher la confirmation"
												}
											>
												{showConfirm ? (
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
										{errors.passwordConfirm && (
											<p
												id="passwordConfirm-error"
												className="form-error"
												role="alert"
												aria-live="polite"
											>
												{errors.passwordConfirm}
											</p>
										)}
									</div>

									<button
										type="submit"
										className="form-btn-submit"
										disabled={isSubmitting || strengthScore < 4}
										aria-describedby={
											strengthScore < 4 ? "password-strength" : undefined
										}
									>
										{isSubmitting
											? "Réinitialisation..."
											: "Réinitialiser mon mot de passe"}
									</button>
								</form>
							)}

							<div className="form-alt-section">
								<Link to="/auth/login/" className="form-alt-link">
									Retour à la connexion
								</Link>
							</div>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}

export default ResetPassword;
