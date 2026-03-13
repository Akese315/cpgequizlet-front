import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useUserStore } from '../../store/userStore';
import type { MetaFunction } from "react-router";
import { API_URL } from '../../config';
import './auth.css';

export const meta: MetaFunction = () => {
    return [
        { title: "Connexion - QuizletCPGE" },
        { name: "description", content: "Connectez-vous à votre espace QuizletCPGE pour reprendre vos révisions." },
    ];
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        setLoading(true);
        setError('');

        try {
            const hashedPassword = await hashPassword(password);

            // TODO: Remplace cette URL par l'endpoint réel de ton backend (ex: http://localhost:8080/login)
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password: hashedPassword }),
            });

            if (!response.ok) {
                // Gère l'erreur renvoyée par le backend
                throw new Error("Identifiants incorrects ou erreur serveur.");
            }

            const data = await response.json();

            console.log(data)

            localStorage.setItem('token', data.user_token);
            localStorage.setItem('userId', data.user_id);

            setUser({
                id: data.user_id,
                token: data.user_token,
            });

            await fetchUserInfo(data.user_id, data.user_token)

            navigate('/quizzes'); // Redirection après connexion
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
                    <h1 className="auth-title">Connexion</h1>
                    <p className="auth-subtitle">Content de te revoir !</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
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

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>

                <div className="auth-footer">
                    Pas encore de compte ? <Link to="/register" className="auth-link">S'inscrire</Link>
                </div>
            </motion.div>
        </div>
    );
}
