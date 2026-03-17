import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/userStore';
import './Navbar.css';

const Navbar = () => {
    const { user } = useUserStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMenu = () => setMobileMenuOpen(prev => !prev);
    const closeMenu = () => setMobileMenuOpen(false);

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
                        <Link to="/" className="logo-link" onClick={closeMenu}>
                            Aki<span className="logo-highlight">Quiz</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
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

                    {/* Desktop Actions / CTA */}
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

                        {/* Hamburger Button — mobile only */}
                        <button
                            className={`hamburger-btn${mobileMenuOpen ? ' active' : ''}`}
                            onClick={toggleMenu}
                            aria-label="Menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            <span className="hamburger-line" />
                            <span className="hamburger-line" />
                            <span className="hamburger-line" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Slide-Down Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            className="mobile-menu-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={closeMenu}
                        />
                        <motion.div
                            className="mobile-menu"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                        >
                            <div className="mobile-menu-inner">
                                <Link to="/" className="mobile-nav-link" onClick={closeMenu}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                        <polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                    Accueil
                                </Link>
                                <Link to="/courses" className="mobile-nav-link" onClick={closeMenu}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                                    </svg>
                                    Cours
                                </Link>
                                <Link to="/quizzes" className="mobile-nav-link" onClick={closeMenu}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <line x1="3" y1="9" x2="21" y2="9" />
                                        <line x1="9" y1="21" x2="9" y2="9" />
                                    </svg>
                                    Quiz
                                </Link>

                                <div className="mobile-menu-divider" />

                                {user ? (
                                    <Link to="/profile" className="mobile-nav-link" onClick={closeMenu}>
                                        <div className="mobile-profile-icon">
                                            {user.pseudo ? user.pseudo.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        Mon Profil
                                    </Link>
                                ) : (
                                    <div className="mobile-auth-actions">
                                        <Link to="/login" className="mobile-btn-login" onClick={closeMenu}>
                                            Connexion
                                        </Link>
                                        <Link to="/register" className="mobile-btn-signup" onClick={closeMenu}>
                                            S'inscrire
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
