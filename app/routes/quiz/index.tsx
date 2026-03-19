import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import Flashcard, { renderMixedText } from '../../components/Flashcard';
import QuoteGame from '../../components/QuoteGame';
import ChapterSelector from '../../components/ChapterSelector';
import { useErrorStore } from '../../store/errorStore';
import { API_URL } from '../../config';
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
    explication?: string;
}


const fetchQuestionsByTheme = async (subjectId: string, quizId: string | undefined, chapter?: string | null): Promise<Question[]> => {
    let url = `${API_URL}/quiz?subject=${subjectId}`;
    if (quizId) {
        url += `&id=${quizId}`;
    }
    if (chapter) {
        url += `&chapter=${encodeURIComponent(chapter)}`;
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
    const subjectId = searchParams.get('id') || 'inconnu';
    const selectedChapter = searchParams.get('chapter');

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

    const currentQ = questions[currentIndex];

    const { shuffledAnswers, correctIndex } = React.useMemo(() => {
        if (!currentQ || !currentQ.answers) return { shuffledAnswers: [], correctIndex: -1 };

        const answersArray = Array.isArray(currentQ.answers) ? currentQ.answers : [currentQ.answers];

        const mappedAnswers = answersArray.map((answer, index) => ({
            text: answer,
            isCorrect: index === currentQ.correct_answer_index
        }));

        const shuffled = [...mappedAnswers];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const newCorrectIndex = shuffled.findIndex(a => a.isCorrect);

        return {
            shuffledAnswers: shuffled.map(a => a.text),
            correctIndex: newCorrectIndex !== -1 ? newCorrectIndex : 0,
        };
    }, [currentQ?.uuid, currentQ?.answers]);

    // Effet réseau au chargement pour simuler le fetch serveur
    useEffect(() => {
        loadQuestions();
    }, [subjectId, quizId, selectedChapter]);

    const handleProposalClick = (index: number) => {
        if (selectedAnswer !== null) return; // Empêche le multi-clic
        setSelectedAnswer(index);

        const isCorrect = index === correctIndex;

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

            // Transition automatique après 1 seconde si bonne réponse
            setTimeout(() => {
                handleNextQuestion();
            }, 1000);
        } else {
            setStreak(0);
            setLastXpGain(0);
        }
    };

    const buildUrl = (uuid: string) => {
        let url = `/quiz/${uuid}/subject?id=${subjectId}`;
        if (selectedChapter) {
            url += `&chapter=${encodeURIComponent(selectedChapter)}`;
        }
        return url;
    };

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const data = await fetchQuestionsByTheme(subjectId, quizId, selectedChapter);
            setQuestions(data);

            if (!quizId && data.length > 0 && data[0].uuid) {
                window.history.replaceState(null, '', buildUrl(data[0].uuid));
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
            const data = await fetchQuestionsByTheme(subjectId, undefined, selectedChapter);
            setQuestions(data);
            setCurrentIndex(0);
            setSelectedAnswer(null);

            if (data.length > 0 && data[0].uuid) {
                window.history.replaceState(null, '', buildUrl(data[0].uuid));
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
            window.history.replaceState(null, '', buildUrl(nextQ.uuid));
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
                <h2>Oups, aucune question trouvée pour "{subjectId}".</h2>
                <button className="quiz-next-btn" onClick={() => navigate('/quizzes')}>Retour aux thèmes</button>
            </div>
        );
    }




    const isAnswered = selectedAnswer !== null;

    const isQuoteTheme = ['philosophy', 'quotes'].includes(subjectId?.toLowerCase() || '');

    const handleChapterChange = (chapter: string | null) => {
        // Reset quiz state when chapter changes
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setScore(0);
        setXp(0);
        setStreak(0);
        setLastXpGain(0);
    };

    return (
        <motion.div
            className="quiz-page-container"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* Chapter Selector */}
            <ChapterSelector
                subject={subjectId}
                onChapterChange={handleChapterChange}
            />

            <div className="quiz-header" style={{ width: '100%', maxWidth: '48rem' }}>
                <h1 className="quiz-theme-title">
                    {decodeURIComponent(subjectId).charAt(0).toUpperCase() + decodeURIComponent(subjectId).slice(1)}
                    {selectedChapter && (
                        <span className="chapter-badge">
                            <span className="chapter-badge-dot" />
                            {decodeURIComponent(selectedChapter).replace(/_/g, ' ')}
                        </span>
                    )}
                </h1>
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
                        {lastXpGain > 0 && isAnswered && selectedAnswer === correctIndex && (
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

                    {isQuoteTheme ? (
                        <QuoteGame
                            key={`quote-${currentQ.uuid}`}
                            question={currentQ}
                            onSuccess={() => {
                                handleProposalClick(correctIndex);
                            }}
                            onFail={() => {
                                setStreak(0);
                                setLastXpGain(0);
                            }}
                        />
                    ) : (
                        <>
                            {/* FLashcard adaptative: on désactive le check manuel et on gère state vis isFlipped */}
                            <Flashcard
                                key={`flash-${currentQ.uuid}`}
                                disableFlip={!isAnswered}
                                isFlipped={isAnswered}
                                front={{
                                    text: currentQ.question,
                                    imageUrl: `${API_URL}/quiz/image/${currentQ.uuid}`,
                                }}
                                back={{
                                    text: isAnswered
                                        ? (selectedAnswer === correctIndex ? "✨ Correct !" : "❌ Mauvaise réponse")
                                        : "...",
                                    explication: isAnswered && currentQ.explication ? currentQ.explication : undefined,
                                }}
                            />

                            {/* Propositions dynamiques */}
                            <div className="proposals-container">
                                {shuffledAnswers.map((proposal, idx) => {
                                    let btnClass = "proposal-btn";
                                    let icon = null;

                                    if (isAnswered) {
                                        if (idx === correctIndex) {
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
                        </>
                    )}
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

                {isAnswered && selectedAnswer !== correctIndex && (
                    <motion.button
                        className="quiz-next-btn"
                        onClick={handleNextQuestion}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring" }}
                    >
                        Continuer
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default ThemeQuiz;
