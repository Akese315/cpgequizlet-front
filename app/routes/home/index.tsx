import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { useUserStore } from '../../store/userStore';
import type { MetaFunction } from "react-router";
import './home.css';

export const meta: MetaFunction = () => {
    return [
        { title: "AkiQuiz - L'excellence en Prépa commence ici" },
        { name: "description", content: "Optimisez vos révisions en CPGE scientifique avec nos quiz interactifs et flashcards. Mathématiques, Physique, Chimie et plus pour réussir vos concours." },
        { property: "og:title", content: "AkiQuiz - Révisez pour les concours Prépa" },
        { property: "og:description", content: "Plateforme de révision gratuite pour les étudiants en CPGE MPSI, PCSI, PTSI." },
        { name: "keywords", content: "CPGE, Prépa, Quiz, Flashcards, Mathématiques, Physique, Concours, Révisions" },
    ];
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

const Home = () => {
    const { user } = useUserStore();
    return (
        <motion.div
            className="home-container"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* Hero Section */}
            <motion.section className="hero-section" variants={itemVariants}>
                <h1 className="hero-title">
                    L'excellence en CPGE
                    <span className="hero-title-highlight">commence ici.</span>
                </h1>
                <p className="hero-subtitle">
                    Révisez, testez-vous et maîtrisez le programme complet des classes préparatoires scientifiques avec nos quiz interactifs et nos flashcards sur-mesure.
                </p>
                <div className="hero-actions">
                    <Link to="/quizzes" className="btn-primary">
                        Démarrer les Quiz
                    </Link>
                    <Link to="/courses" className="btn-secondary">
                        Voir les Cours
                    </Link>
                </div>
            </motion.section>

            {/* Features Section */}
            <motion.section className="features-section" variants={itemVariants}>
                <h2 className="section-title">Tout ce qu'il vous faut pour réussir</h2>

                <div className="features-grid">
                    <motion.div className="feature-card" whileHover={{ scale: 1.02 }}>
                        <div className="feature-icon-wrapper">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                <line x1="9" y1="21" x2="9" y2="9"></line>
                            </svg>
                        </div>
                        <h3 className="feature-title">Quiz Interactifs</h3>
                        <p className="feature-description">
                            Des centaines de questions par matière pour tester vos connaissances rapidement et cibler vos points faibles.
                        </p>
                    </motion.div>

                    <motion.div className="feature-card" whileHover={{ scale: 1.02 }}>
                        <div className="feature-icon-wrapper">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </div>
                        <h3 className="feature-title">Flashcards Enrichies</h3>
                        <p className="feature-description">
                            Formules LaTeX, citations et schémas d'explication. Retournez la carte pour apprendre et mémoriser durablement.
                        </p>
                    </motion.div>

                    <motion.div className="feature-card" whileHover={{ scale: 1.02 }}>
                        <div className="feature-icon-wrapper">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                        </div>
                        <h3 className="feature-title">Suivi de Progression</h3>
                        <p className="feature-description">
                            Identifiez vos erreurs et suivez votre avancée pour le bac ou les concours de prépa grâce à nos statistiques.
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* CTA Section */}
            {!user && (
                <motion.section className="cta-section" variants={itemVariants}>
                    <h2 className="cta-title">Prêt à intégrer ?</h2>
                    <p className="cta-subtitle">
                        Rejoignez des milliers d'étudiants qui optimisent leurs révisions avec QuizletCPGE. C'est gratuit !
                    </p>
                    <Link to="/register" className="btn-primary btn-white">
                        Créer un compte gratuitement
                    </Link>
                </motion.section>
            )}

        </motion.div>
    );
};

export default Home;