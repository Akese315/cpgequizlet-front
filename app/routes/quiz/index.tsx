import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import Flashcard, { renderMixedText } from '../../components/Flashcard';
import { useErrorStore } from '../../store/errorStore';
import type { MetaFunction } from "react-router";

import './quiz.css';

export const meta: MetaFunction = ({ location }) => {
    const searchParams = new URLSearchParams(location.search);
    const theme = searchParams.get('id') || 'Quiz';
    const themeName = theme.charAt(0).toUpperCase() + theme.slice(1);

    return [
        { title: `Quiz ${themeName} - QuizletCPGE` },
        { name: "description", content: `Testez vos connaissances en ${themeName} avec ce quiz dédié au programme des CPGE scientifiques.` },
    ];
};


interface Question {
    uuid: string;
    theme: string;
    question: string;
    answers: string | string[];
    latex: boolean;
    difficulty: number;
    chapter: string;
    correct_answer_index: number;
}


const fetchQuestionsByTheme = async (themeId: string, quizId: string | undefined): Promise<Question[]> => {
    let url = `http://localhost:8080/quiz?subject=${themeId}`;
    if (quizId) {
        url += `&id=${quizId}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Impossible de trouver le quiz (${response.status})`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [data];
};

const ThemeQuiz = () => {
    const [searchParams] = useSearchParams();
    const { id: quizId } = useParams();
    const navigate = useNavigate();
    // On récupère l'id depuis l'url par ex: /quiz/3/theme?id=maths
    const themeId = searchParams.get('id') || 'inconnu';

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const showError = useErrorStore(state => state.showError);

    // Etat pour le quiz 
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);

    // Système de progression (XP et Streak)
    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(0);
    const [lastXpGain, setLastXpGain] = useState(0);

    // Effet réseau au chargement pour simuler le fetch serveur
    useEffect(() => {
        loadQuestions();
    }, [themeId, quizId]);

    const handleProposalClick = (index: number) => {
        if (selectedAnswer !== null) return; // Empêche le multi-clic
        setSelectedAnswer(index);

        const isCorrect = index === questions[currentIndex].correct_answer_index;

        if (isCorrect) {
            setScore(prev => prev + 1);

            // Calcul du Streak
            const newStreak = streak + 1;
            setStreak(newStreak);

            // Calcul de l'XP : base 10 + bonus selon streak
            let xpBonus = 0;
            if (newStreak >= 5) xpBonus = 10;
            else if (newStreak >= 3) xpBonus = 4;
            else if (newStreak >= 2) xpBonus = 2;

            const gained = 10 + xpBonus;
            setLastXpGain(gained);
            setXp(prev => prev + gained);
        } else {
            setStreak(0);
            setLastXpGain(0);
        }

        // Transition automatique après feedback
        setTimeout(() => {
            handleNextQuestion();
        }, 1200);
    };

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const data = await fetchQuestionsByTheme(themeId, quizId);
            setQuestions(data);

            if (!quizId && data.length > 0 && data[0].uuid) {
                window.history.replaceState(null, '', `/quiz/${data[0].uuid}/subject?id=${themeId}`);
            }
        } catch (error: any) {
            console.error("Erreur de récupération :", error);
            showError(error.message || "Erreur de connexion au serveur.");
        }
        setLoading(false);
    };

    const fetchNewQuestion = async () => {
        setLoading(true);
        try {
            // On force un fetch sans quizId pour récupérer un quiz aléatoire du même thème
            const data = await fetchQuestionsByTheme(themeId, undefined);
            setQuestions(data);
            setCurrentIndex(0);
            setSelectedAnswer(null);

            if (data.length > 0 && data[0].uuid) {
                window.history.replaceState(null, '', `/quiz/${data[0].uuid}/subject?id=${themeId}`);
            }
        } catch (error: any) {
            console.error("Erreur :", error);
            showError("Erreur lors du chargement de la question.");
        }
        setLoading(false);
    };

    const handleNextQuestion = () => {
        const nextIdx = currentIndex + 1;
        if (nextIdx < questions.length) {
            setSelectedAnswer(null);
            setCurrentIndex(nextIdx);
            const nextQ = questions[nextIdx];
            window.history.replaceState(null, '', `/quiz/${nextQ.uuid}/subject?id=${themeId}`);
        } else {
            fetchNewQuestion();
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring" as const } }
    };

    if (loading) {
        return (
            <div className="loader-container">
                <div className="spinner"></div>
                <h2>Chargement du Quiz...</h2>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="quiz-page-container">
                <h2>Oups, aucune question trouvée pour "{themeId}".</h2>
                <button className="quiz-next-btn" onClick={() => navigate('/quizzes')}>Retour aux thèmes</button>
            </div>
        );
    }




    const currentQ = questions[currentIndex];
    const isAnswered = selectedAnswer !== null;

    let parsedAnswers: string[] = [];
    if (currentQ) {
        // Obtenir la string brute (si le backend a split() par erreur, on recolle pour réparer les dégâts)
        let rawAnswers = Array.isArray(currentQ.answers)
            ? currentQ.answers.join(",")
            : currentQ.answers;

        try {
            parsedAnswers = JSON.parse(rawAnswers);
        } catch {
            try {
                parsedAnswers = JSON.parse(rawAnswers.replace(/\\/g, '\\\\'));
            } catch {
                // Fallback : Séparer par virgule mais ignorer celles dans les parenthèses f(x,t) et le mode mathématique
                parsedAnswers = [];
                let current = '';
                let depth = 0;
                let inMath = false;
                for (let i = 0; i < rawAnswers.length; i++) {
                    const char = rawAnswers[i];
                    const nextChar = rawAnswers[i + 1] || '';

                    if (char === '$') {
                        inMath = !inMath;
                    } else if (char === '\\' && (nextChar === '(' || nextChar === '[')) {
                        inMath = true;
                    } else if (char === '\\' && (nextChar === ')' || nextChar === ']')) {
                        inMath = false;
                    }

                    if (char === '(' || char === '[' || char === '{') depth++;
                    else if (char === ')' || char === ']' || char === '}') depth--;

                    if (char === ',' && depth === 0 && !inMath) {
                        parsedAnswers.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                if (current) parsedAnswers.push(current.trim());
            }
        }
    }

    return (
        <motion.div
            className="quiz-page-container"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <div className="quiz-header" style={{ width: '100%', maxWidth: '48rem' }}>
                <h1 className="quiz-theme-title">{themeId} - Chapitre: {currentQ.chapter}</h1>
                <div className="quiz-top-bar">
                    <span className="quiz-question-count">Question {currentIndex + 1} / {questions.length}</span>
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
                    </div>
                    <div className="quiz-stats">
                        <span className="xp-total">{xp} XP</span>
                        <AnimatePresence>
                            {streak >= 2 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="streak-counter"
                                >
                                    🔥 {streak}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQ.uuid}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                    style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
                >
                    <AnimatePresence>
                        {lastXpGain > 0 && isAnswered && selectedAnswer === currentQ.correct_answer_index && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1.2, y: -20 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="xp-floating"
                            >
                                +{lastXpGain} XP
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* FLashcard adaptative: on désactive le check manuel et on gère state vis isFlipped */}
                    <Flashcard
                        key={`flash-${currentQ.uuid}`}
                        disableFlip={!isAnswered}
                        isFlipped={isAnswered}
                        front={{
                            text: currentQ.question,
                            imageUrl: `http://localhost:8080/quiz/image/${currentQ.uuid}`,
                        }}
                        back={{
                            text: isAnswered
                                ? (selectedAnswer === currentQ.correct_answer_index ? "✨ Correct !" : "❌ Mauvaise réponse")
                                : "...",
                        }}
                    />

                    {/* Propositions dynamiques */}
                    <div className="proposals-container">
                        {parsedAnswers.map((proposal, idx) => {
                            let btnClass = "proposal-btn";
                            let icon = null;

                            if (isAnswered) {
                                if (idx === currentQ.correct_answer_index) {
                                    btnClass += " correct";
                                    icon = (
                                        <svg className="feedback-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    );
                                } else if (idx === selectedAnswer) {
                                    btnClass += " incorrect";
                                    icon = (
                                        <svg className="feedback-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    );
                                }
                            }

                            return (
                                <button
                                    key={`${currentQ.uuid}-${idx}`}
                                    className={btnClass}
                                    onClick={() => handleProposalClick(idx)}
                                    disabled={isAnswered}
                                >
                                    <span className="proposal-index">{String.fromCharCode(65 + idx)}</span>
                                    <span>{renderMixedText(proposal)}</span>
                                    {icon}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="quiz-actions-container" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                {!isAnswered && (
                    <motion.button
                        className="quiz-skip-btn"
                        onClick={handleNextQuestion}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring" }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.75rem',
                            backgroundColor: 'transparent',
                            color: 'var(--text-muted)',
                            border: '2px solid var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                        whileHover={{ backgroundColor: "var(--surface)" }}
                    >
                        Sauter la question
                    </motion.button>
                )}

                {isAnswered && (
                    <motion.button
                        className="quiz-next-btn"
                        onClick={handleNextQuestion}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring" }}
                    >
                        Question Suivante
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default ThemeQuiz;
