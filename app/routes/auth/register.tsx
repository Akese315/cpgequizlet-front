import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useUserStore } from '../../store/userStore';
import type { MetaFunction } from "react-router";
import { API_URL } from '../../config';
import './auth.css';

export const meta: MetaFunction = () => {
    return [
        { title: "S'inscrire - QuizletCPGE" },
        { name: "description", content: "Créez votre compte QuizletCPGE pour accéder à tous nos quiz et suivre votre progression en prépa." },
    ];
};

export default function Register() {
    const [name, setName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUser } = useUserStore();

    const hashPassword = async (pwd: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(pwd);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const fetchUserInfo = async (user_id: any, user_token: any) => {
        try {
            // Utilise une requête POST avec un corps JSON pour correspondre à web::Json<UserInfoQuery> côté Rust
            const response = await fetch(`${API_URL}/user/info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user_id,
                    user_token: user_token,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data)
                setUser({
                    id: data.user_id,
                    token: data.user_token,
                    email: data.email,
                    pseudo: data.first_name || '', // On utilise first_name en guise d'affichage par défaut si besoin
                    firstName: data.first_name,
                    lastName: data.last_name,
                    role: data.role || 'student',
                });
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des infos utilisateur:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const password_hash = await hashPassword(password);
            // TODO: Remplace cette URL par l'endpoint réel de ton backend (ex: http://localhost:8080/register)
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: name,
                    email,
                    password_hash,
                    first_name: firstName,
                    last_name: lastName
                }),
            });

            if (!response.ok) {
                // Gère l'erreur renvoyée par le backend
                throw new Error("Erreur lors de l'inscription.");
            }

            const data = await response.json();
            console.log(data)

            localStorage.setItem('token', data.user_token);
            localStorage.setItem('userId', data.user_id);

            await fetchUserInfo(data.user_id, data.user_token)

            navigate('/'); // Redirection vers l'accueil après inscription
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
            >
                <div>
                    <h1 className="auth-title">Inscription</h1>
                    <p className="auth-subtitle">Crée ton profil pour continuer</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-form-group">
                        <label className="auth-label">Pseudo</label>
                        <input
                            type="text"
                            className="auth-input"
                            placeholder="Élève de prépa"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Prénom</label>
                        <input
                            type="text"
                            className="auth-input"
                            placeholder="Jean"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Nom</label>
                        <input
                            type="text"
                            className="auth-input"
                            placeholder="Dupont"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Adresse Email</label>
                        <input
                            type="email"
                            className="auth-input"
                            placeholder="ton@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Mot de passe</label>
                        <input
                            type="password"
                            className="auth-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Confirmer le mot de passe</label>
                        <input
                            type="password"
                            className={`auth-input ${confirmPassword && password !== confirmPassword ? 'input-error' : ''}`}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <motion.span
                                className="input-error-message"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                Les mots de passe ne correspondent pas
                            </motion.span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading || (confirmPassword !== '' && password !== confirmPassword)}
                    >
                        {loading ? "Création du compte..." : "Créer mon compte"}
                    </button>
                </form>

                <div className="auth-footer">
                    Tu as déjà un compte ? <Link to="/login" className="auth-link">Se connecter</Link>
                </div>
            </motion.div>
        </div>
    );
}
