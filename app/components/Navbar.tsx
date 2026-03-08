import React from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useUserStore } from '../store/userStore';
import './Navbar.css';

const Navbar = () => {
    const { user } = useUserStore();

    return (
        <motion.nav
            className="navbar"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="navbar-container">
                <div className="navbar-content">
                    {/* Logo Section */}
                    <div className="logo-section">
                        <Link to="/" className="logo-link">
                            Quizlet<span className="logo-highlight">CPGE</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="nav-links">
                        <Link to="/" className="nav-link">
                            Accueil
                        </Link>
                        <Link to="/courses" className="nav-link">
                            Cours
                        </Link>
                        <Link to="/quizzes" className="nav-link">
                            Quiz
                        </Link>
                    </div>

                    {/* Actions / CTA */}
                    <div className="nav-actions">
                        {user ? (
                            <Link to="/profile" className="profile-icon-link">
                                <div className="profile-icon">
                                    {user.pseudo ? user.pseudo.charAt(0).toUpperCase() : '?'}
                                </div>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn-login">
                                    Connexion
                                </Link>
                                <Link to="/register" className="btn-signup">
                                    S'inscrire
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
