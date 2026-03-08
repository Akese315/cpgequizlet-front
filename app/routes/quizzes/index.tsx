import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import AddQuizModal from '../../components/AddQuizModal';
import { useUserStore } from '../../store/userStore';
import type { MetaFunction } from "react-router";
import './quizzes.css';

export const meta: MetaFunction = () => {
    return [
        { title: "Quiz par Matière - QuizletCPGE" },
        { name: "description", content: "Explorez nos quiz CPGE par matière : Mathématiques, Physique, Chimie, SI et plus. Testez vos connaissances sur tout le programme scientifique." },
        { property: "og:title", content: "QuizletCPGE - Quiz par Thème" },
    ];
};

const subjects = [
    {
        id: 'maths',
        name: 'Mathématiques',
        description: 'Algèbre, Analyse, Géométrie et Probabilités selon le programme officiel des CPGE.',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'physique',
        name: 'Physique',
        description: 'Mécanique, Électromagnétisme, Thermodynamique et Optique interférentielle.',
        image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'chimie',
        name: 'Chimie',
        description: 'Architecture de la matière, Cinétique chimique et Thermodynamique chimique.',
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'si',
        name: 'Sciences de l\'Ingénieur',
        description: 'Analyse des systèmes, Mécanique des systèmes, Automatique et Informatique.',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'philo',
        name: 'Philosophie',
        description: 'Le sens, Le Monde, et sujets de dissertation autour du thème de l\'année.',
        image: 'https://media.lesechos.com/api/v1/images/view/68e77acaaaf1a170240de622/1280x720/0160922022121-web-tete.jpg'
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

const Quizzes = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const canCreateQuiz = useUserStore(state => state.canCreateQuiz());

    return (
        <div className="quizzes-container">
            <div className="quizzes-header">
                <motion.h1
                    className="quizzes-title"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                >
                    Choisis un Thème de Quiz
                </motion.h1>
                {canCreateQuiz && (
                    <button
                        className="add-quiz-btn"
                        onClick={() => setIsModalOpen(true)}
                        title="Ajouter un Quiz"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                )}
            </div>

            <motion.div
                className="themes-grid"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {subjects.map((subject) => (
                    <motion.div key={subject.id} variants={itemVariants} style={{ height: '100%' }}>
                        <Link
                            to={`/quiz/subject?id=${subject.id}`}
                            className="theme-card"
                            style={{ height: '100%' }}
                        >
                            <div className="theme-image-wrapper">
                                <img src={subject.image} alt={subject.name} className="theme-image" />
                            </div>
                            <div className="theme-content">
                                <h2 className="theme-title">{subject.name}</h2>
                                <p className="theme-description">{subject.description}</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            <AddQuizModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                subjects={subjects}
            />
        </div>
    );
};

export default Quizzes;
