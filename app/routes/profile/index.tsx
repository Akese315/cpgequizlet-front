import React from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router';
import type { MetaFunction } from "react-router";
import './profile.css';

export const meta: MetaFunction = () => {
    return [
        { title: "Mon Profil - QuizletCPGE" },
        { name: "robots", content: "noindex, nofollow" }, // On ne veut pas indexer les pages de profil privées
    ];
};

export default function Profile() {
    const { user, clearUser } = useUserStore();
    const navigate = useNavigate();

    // Redirection si l'utilisateur n'est pas connecté
    React.useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    const handleLogout = () => {
        clearUser();
        navigate('/');
    };

    return (
        <div className="profile-container">
            <motion.div
                className="profile-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
            >
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.pseudo ? user.pseudo.charAt(0).toUpperCase() : '?'}
                    </div>
                    <h1 className="profile-title">Mon Profil</h1>
                    <p className="profile-subtitle">Gère tes informations personnelles</p>
                </div>

                <div className="profile-details">
                    <div className="profile-detail-item">
                        <label>Pseudo</label>
                        <p>{user.pseudo}</p>
                    </div>
                    <div className="profile-detail-item">
                        <label>Email</label>
                        <p>{user.email}</p>
                    </div>
                    <div className="profile-detail-item">
                        <label>Prénom</label>
                        <p>{user.firstName}</p>
                    </div>
                    <div className="profile-detail-item">
                        <label>Nom</label>
                        <p>{user.lastName}</p>
                    </div>
                    <div className="profile-detail-item">
                        <label>Rôle</label>
                        <p className="profile-badge">{user.role}</p>
                    </div>
                </div>

                <div className="profile-actions">
                    <button className="btn-logout" onClick={handleLogout}>
                        Se déconnecter
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
