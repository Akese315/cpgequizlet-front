import React, { useState, useRef, useEffect } from 'react';
import type { DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useErrorStore } from '../store/errorStore';
import { API_URL } from '../config';
import './AddQuizModal.css';

interface Answer {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface AddQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjects: { id: string; name: string }[];
}

const AddQuizModal: React.FC<AddQuizModalProps> = ({ isOpen, onClose, subjects }) => {
    const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
    const [themesAvailable, setThemesAvailable] = useState<string[]>([]);
    const [chaptersAvailable, setChaptersAvailable] = useState<string[]>([]);
    const [themeId, setThemeId] = useState('');
    const [chapterId, setChapterId] = useState('');
    const [question, setQuestion] = useState('');
    const [difficulty, setDifficulty] = useState(1);
    const [answers, setAnswers] = useState<Answer[]>([
        { id: Date.now().toString(), text: '', isCorrect: false }
    ]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchThemes();
        fetchChapters();
    }, [subjectId]);

    const fetchThemes = async () => {
        const response = await fetch(`${API_URL}/themes?subject=${subjectId}`);
        const data = await response.json();
        setThemesAvailable(data);
    };

    const fetchChapters = async () => {
        const response = await fetch(`${API_URL}/chapters?subject=${subjectId}`);
        const data = await response.json();
        setChaptersAvailable(data)
    }

    const showError = useErrorStore(state => state.showError);

    const handleAddAnswer = () => {
        setAnswers([...answers, { id: Date.now().toString(), text: '', isCorrect: false }]);
    };

    const handleUpdateAnswer = (id: string, field: keyof Answer, value: any) => {
        setAnswers(answers.map(ans => ans.id === id ? { ...ans, [field]: value } : ans));
    };

    const handleRemoveAnswer = (id: string) => {
        setAnswers(answers.filter(ans => ans.id !== id));
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setImageFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();

        // Correspond exactement à la structure Rust
        formData.append("theme", themeId);
        formData.append("question", question);
        formData.append("subject", subjectId);
        formData.append("difficulty", difficulty.toString());

        const latexRegex = /(\\[a-zA-Z]+)|(\$.*\$)|(\\\[.*\\\])|(\\\(.*\\\))/;
        const isLatex = latexRegex.test(question) || answers.some(ans => latexRegex.test(ans.text));
        formData.append("latex", isLatex.toString());

        const correctIndex = answers.findIndex(ans => ans.isCorrect);
        formData.append("correct_answer_index", Math.max(0, correctIndex).toString());

        formData.append("answers", JSON.stringify(answers.map(ans => ans.text)));

        if (imageFile) {
            formData.append("image", imageFile);
        }

        try {
            const response = await fetch(`${API_URL}/quiz`, {
                method: 'POST',
                // Ne pas définir manuellement le Content-Type avec FormData, 
                // sinon il manquera le boundary
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Erreur serveur lors de la création.");
            }

            onClose();
            resetForm();
        } catch (error) {
            console.error("Erreur lors de l'envoi du quiz:", error);
            showError("Impossible d'enregistrer le quiz. Vérifiez votre connexion.");
        }
    };

    const resetForm = () => {
        setSubjectId(subjects[0]?.id || '');
        setThemeId('');
        setDifficulty(1);
        setQuestion('');
        setAnswers([{ id: Date.now().toString(), text: '', isCorrect: false }]);
        setImageFile(null);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay" onClick={onClose}>
                <motion.div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                    <h2 className="modal-title">Créer un nouveau Quiz</h2>

                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="form-group">
                            <label>Matière</label>
                            <select
                                value={subjectId}
                                onChange={(e) => setSubjectId(e.target.value)}
                                className="form-select"
                                required
                            >
                                {subjects.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Thème</label>
                            <select
                                value={themeId}
                                onChange={(e) => setThemeId(e.target.value)}
                                className="form-select"
                                required
                            >
                                {themesAvailable.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Chapitre</label>
                            <select
                                value={chapterId}
                                onChange={(e) => setChapterId(e.target.value)}
                                className="form-select"
                                required
                            >
                                {chaptersAvailable.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Difficulté (1-5)</label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={difficulty}
                                onChange={(e) => setDifficulty(parseInt(e.target.value) || 1)}
                                className="form-select"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Question</label>
                            <textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Posez votre question ici..."
                                className="form-textarea"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Image (Optionnelle)</label>
                            <div
                                className={`drag-drop-zone ${isDragging ? 'dragging' : ''} ${imageFile ? 'has-file' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden-file-input"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                                {imageFile ? (
                                    <div className="file-info">
                                        <span className="file-name">{imageFile.name}</span>
                                        <button
                                            type="button"
                                            className="remove-file-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setImageFile(null);
                                            }}
                                        >
                                            Changer d'image
                                        </button>
                                    </div>
                                ) : (
                                    <div className="drag-drop-prompt">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                        <p>Glissez-déposez une image ici ou cliquez pour parcourir</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="answers-label">
                                Réponses
                                <button type="button" onClick={handleAddAnswer} className="add-answer-btn">
                                    + Ajouter
                                </button>
                            </label>

                            <div className="answers-list">
                                {answers.map((answer, index) => (
                                    <motion.div
                                        key={answer.id}
                                        className="answer-item"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <div className="answer-header">
                                            <span>Réponse {index + 1}</span>
                                            {answers.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAnswer(answer.id)}
                                                    className="remove-answer-btn"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                                </button>
                                            )}
                                        </div>
                                        <textarea
                                            value={answer.text}
                                            onChange={(e) => handleUpdateAnswer(answer.id, 'text', e.target.value)}
                                            placeholder="Texte de la réponse..."
                                            className="form-textarea answer-textarea"
                                            required
                                        />
                                        <div className="answer-options">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={answer.isCorrect}
                                                    onChange={(e) => handleUpdateAnswer(answer.id, 'isCorrect', e.target.checked)}
                                                />
                                                Bonne réponse
                                            </label>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={onClose}>
                                Annuler
                            </button>
                            <button type="submit" className="btn-primary">
                                Enregistrer le Quiz
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddQuizModal;
