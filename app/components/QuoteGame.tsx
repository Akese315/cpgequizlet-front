import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './QuoteGame.css';

export interface Question {
    uuid: string;
    theme: string;
    question: string;
    answers: string | string[];
    latex: boolean;
    difficulty: number;
    chapter: string;
    correct_answer_index: number;
}

interface QuoteGameProps {
    question: Question;
    onSuccess?: () => void;
    onFail?: () => void;
}

// Fonction de parsing robuste identique à index.tsx pour extraire les réponses
function parseAnswers(rawAnswers: string | string[]): string[] {
    const raw = Array.isArray(rawAnswers) ? rawAnswers.join(",") : rawAnswers;
    try {
        return JSON.parse(raw);
    } catch {
        try {
            return JSON.parse(raw.replace(/\\/g, '\\\\'));
        } catch {
            const parsed: string[] = [];
            let current = '';
            let depth = 0;
            let inMath = false;
            for (let i = 0; i < raw.length; i++) {
                const char = raw[i];
                const nextChar = raw[i + 1] || '';

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
                    parsed.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            if (current) parsed.push(current.trim());
            return parsed;
        }
    }
}

// Distance de Levenshtein
function getLevenshteinDistance(a: string, b: string): number {
    const matrix = [];
    let i, j;
    for (i = 0; i <= b.length; i++) matrix[i] = [i];
    for (j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1  // deletion
                    )
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// Calcul du pourcentage de similarité (0 à 1)
function calculateSimilarity(str1: string, str2: string): number {
    const normalize = (s: string) =>
        s.toLowerCase()
            .replace(/[.,/#!$%^&*;:{}=\-_`~()'"«»]/g, "")
            .replace(/\s{2,}/g, " ")
            .trim();

    const n1 = normalize(str1);
    const n2 = normalize(str2);

    if (n1.length === 0 && n2.length === 0) return 1;
    const distance = getLevenshteinDistance(n1, n2);
    const maxLen = Math.max(n1.length, n2.length);
    if (maxLen === 0) return 1;

    return 1 - distance / maxLen;
}

export const QuoteGame: React.FC<QuoteGameProps> = ({ question, onSuccess, onFail }) => {
    const [userInput, setUserInput] = useState('');
    const [gameState, setGameState] = useState<'playing' | 'wrong' | 'won' | 'revealed'>('playing');
    const [similarityScore, setSimilarityScore] = useState<number | null>(null);

    // Extraction de la citation cible (on suppose que c'est la bonne réponse)
    const { promptText, fullQuote } = useMemo(() => {
        const parsed = parseAnswers(question.answers);
        return {
            promptText: question.question,
            fullQuote: parsed[question.correct_answer_index] || parsed[0] || "",
        };
    }, [question]);

    const targetWords = useMemo(() => fullQuote.split(/\s+/), [fullQuote]);

    // L'utilisateur doit compléter la citation. On révèle environ 25% des mots au début (au moins 1, au plus lent-1)
    const initialRevealedCount = Math.max(1, Math.floor(targetWords.length * 0.25));
    const [revealedCount, setRevealedCount] = useState(initialRevealedCount);

    // Réinitialiser le jeu quand la question change
    useEffect(() => {
        setUserInput('');
        setGameState('playing');
        setSimilarityScore(null);
        setRevealedCount(Math.max(1, Math.floor(fullQuote.split(/\s+/).length * 0.25)));
    }, [question, fullQuote]);

    const revealedPart = targetWords.slice(0, revealedCount).join(" ");
    const remainingPart = targetWords.slice(revealedCount).join(" ");

    const handleCheck = () => {
        if (!userInput.trim()) return;

        const sim = calculateSimilarity(userInput, remainingPart);
        setSimilarityScore(sim);

        if (sim >= 0.85) {
            setGameState('won');
            if (onSuccess) {
                setTimeout(onSuccess, 2000); // Transition après 2s
            }
        } else {
            setGameState('wrong');
            // On aide le joueur en révélant un mot supplémentaire à chaque erreur
            if (revealedCount < targetWords.length - 1) {
                setRevealedCount(prev => prev + 1);
            }
            if (onFail) onFail();
            setTimeout(() => {
                if (gameState !== 'won') setGameState('playing');
            }, 2000);
        }
    };

    const handleRevealTotal = () => {
        setRevealedCount(targetWords.length);
        setGameState('revealed');
        setUserInput(remainingPart);
    };

    const percentageFormat = (score: number) => Math.round(score * 100);

    return (
        <motion.div
            className="quote-game-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
        >
            <div className="quote-game-header">
                <span className="quote-theme-pill">{question.theme || 'Philosophie'}</span>
                <span className="quote-difficulty-pill">Niveau {question.difficulty || 1}</span>
            </div>

            <h3 className="quote-prompt">{promptText}</h3>

            <div className="quote-content-wrapper">
                <div className="quote-text-container">
                    <span className="quote-icon-left">«</span>
                    <span className="quote-revealed-text">{revealedPart} </span>
                    <AnimatePresence mode="popLayout">
                        {gameState !== 'revealed' && (
                            <motion.span
                                key="typing-area"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="quote-typing-area"
                            >
                                <textarea
                                    className={`quote-textarea ${gameState === 'wrong' ? 'input-error' : gameState === 'won' ? 'input-success' : ''}`}
                                    value={userInput}
                                    onChange={e => {
                                        setUserInput(e.target.value);
                                        if (gameState === 'wrong') setGameState('playing');
                                    }}
                                    placeholder="... complétez la citation"
                                    disabled={gameState === 'won'}
                                    rows={remainingPart.length > 50 ? 3 : 2}
                                />
                            </motion.span>
                        )}
                    </AnimatePresence>
                    <span className="quote-icon-right">»</span>
                </div>
            </div>

            <AnimatePresence>
                {gameState === 'wrong' && similarityScore !== null && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="quote-feedback error"
                    >
                        Pas tout à fait... Proximité : {percentageFormat(similarityScore)}%
                        <br />
                        <span className="quote-hint">Indice ajouté !</span>
                    </motion.div>
                )}
                {gameState === 'won' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="quote-feedback success"
                    >
                        ✨ Parfait ! Proximité : {percentageFormat(similarityScore || 1)}%
                    </motion.div>
                )}
                {gameState === 'revealed' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="quote-feedback info"
                    >
                        Voici la citation complète. Mémorisez-la bien !
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="quote-actions">
                {gameState !== 'won' && gameState !== 'revealed' && (
                    <>
                        <button className="quote-btn-secondary" onClick={handleRevealTotal}>
                            Révéler
                        </button>
                        <button className="quote-btn-primary" onClick={handleCheck} disabled={!userInput.trim()}>
                            Vérifier
                        </button>
                    </>
                )}
                {(gameState === 'won' || gameState === 'revealed') && onSuccess && (
                    <button className="quote-btn-primary" onClick={onSuccess}>
                        Suivant ➔
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default QuoteGame;
