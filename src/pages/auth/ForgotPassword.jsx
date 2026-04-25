import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { forgotPassword } from "../../services/authService";
import "./Auth.scss";
import "./ForgotPassword.scss";

/**
 * Page "Mot de passe oublié".
 * Affiche un formulaire avec un champ e-mail.
 * Après soumission, affiche toujours le même message de confirmation
 * pour éviter l'énumération des comptes (anti-enumeration).
 */
function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [emailError, setEmailError] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	/**
	 * Valide le format de l'adresse e-mail.
	 * Retourne un message d'erreur ou une chaîne vide si valide.
	 */
	const validateEmail = (value) => {
		if (!value.trim()) {
			return "L'adresse e-mail est obligatoire.";
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
			return "L'adresse e-mail n'est pas valide.";
		}
		return "";
	};

	/** Met à jour le champ e-mail et efface l'éventuelle erreur associée. */
	const handleChange = (e) => {
		setEmail(e.target.value);
		setEmailError("");
	};

	/** Soumet la demande de réinitialisation après validation du champ. */
	const handleSubmit = async (e) => {
		e.preventDefault();

		const error = validateEmail(email);
		if (error) {
			setEmailError(error);
			return;
		}

		setIsSubmitting(true);

		try {
			// L'API retourne toujours 200 avec un message neutre (anti-énumération)
			await forgotPassword(email);
		} catch {
			// On ignore l'erreur réseau : on affiche toujours le message de confirmation
		} finally {
			setIsSubmitting(false);
			// Affichage du message de confirmation quel que soit le résultat
			setSubmitted(true);
		}
	};

	return (
		<div className="auth-page-wrapper">
			<Header />
			<main>
				<section className="form-page-section" aria-labelledby="forgot-password-title">
					<div className="container">
						<div className="form-content">
							<h1 id="forgot-password-title" className="form-page-title">
								Mot de passe oublié
							</h1>
							<p className="form-subtitle">
								Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.
							</p>

							{submitted ? (
								/* Message de confirmation — identique qu'un compte existe ou non */
								<div
									className="forgot-password-confirmation"
									role="status"
									aria-live="polite"
									aria-atomic="true"
								>
									<p>
										Si un compte est associé à cette adresse, un e-mail de réinitialisation vous a été envoyé.
										Vérifiez votre boîte de réception (et vos spams).
									</p>
									<Link to="/auth/login/" className="form-alt-link">
										Retour à la connexion
									</Link>
								</div>
							) : (
								<form className="form-main" onSubmit={handleSubmit} noValidate>
									<div className="form-group">
										<label htmlFor="email" className="form-label">
											Adresse e-mail
										</label>
										<input
											type="email"
											id="email"
											name="email"
											className="form-input-field"
											autoComplete="email"
											value={email}
											onChange={handleChange}
											aria-invalid={Boolean(emailError)}
											aria-describedby={emailError ? "email-error" : undefined}
											required
										/>
										{emailError && (
											<p id="email-error" className="form-error" role="alert" aria-live="polite">
												{emailError}
											</p>
										)}
									</div>

									<button
										type="submit"
										className="form-btn-submit"
										disabled={isSubmitting}
									>
										{isSubmitting ? "Envoi en cours..." : "Recevoir le lien"}
									</button>
								</form>
							)}

							{!submitted && (
								<div className="form-alt-section">
									<Link to="/auth/login/" className="form-alt-link">
										Retour à la connexion
									</Link>
								</div>
							)}
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}

export default ForgotPassword;
