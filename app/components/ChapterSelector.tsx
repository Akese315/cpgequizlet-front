import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';
import './ChapterSelector.css';



interface ChapterSelectorProps {
    subject: string;
    onChapterChange?: (chapter: string | null) => void;
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({ subject, onChapterChange }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [chapters, setChapters] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedChapter = searchParams.get('chapter');

    // Fetch chapters for the given subject
    useEffect(() => {
        const fetchChapters = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/chapters?subject=${subject}`);
                if (!response.ok) {
                    throw new Error('Erreur lors du chargement des chapitres');
                }
                const data: string[] = await response.json();
                setChapters(data);
            } catch (error) {
                console.error('Erreur fetch chapters:', error);
                setChapters([]);
            }
            setLoading(false);
        };

        if (subject) {
            fetchChapters();
        }
    }, [subject]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 150);
        }
        if (!isOpen) {
            setSearchQuery('');
        }
    }, [isOpen]);

    const handleSelectChapter = (chapterName: string | null) => {
        const newParams = new URLSearchParams(searchParams);
        chapterName = chapterName?.replace(/\s+/g, '_') || chapterName;

        if (chapterName === null) {
            newParams.delete('chapter');
        } else {
            newParams.set('chapter', chapterName);
        }

        setSearchParams(newParams, { replace: true });
        setIsOpen(false);

        if (onChapterChange) {
            onChapterChange(chapterName);
        }
    };

    const filteredChapters = useMemo(() => {
        if (!searchQuery.trim()) return chapters;
        const q = searchQuery.toLowerCase().trim();
        return chapters.filter(ch => ch.toLowerCase().includes(q));
    }, [chapters, searchQuery]);

    const displayValue = selectedChapter || 'Tous les chapitres';

    return (
        <div className="chapter-selector-wrapper" ref={dropdownRef}>
            {/* Toggle Button */}
            <button
                className={`chapter-toggle-btn${isOpen ? ' active' : ''}`}
                onClick={() => setIsOpen(prev => !prev)}
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                id="chapter-selector-toggle"
            >
                <div className="chapter-toggle-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                    </svg>
                </div>
                <div className="chapter-toggle-text">
                    <span className="chapter-toggle-label">Chapitre</span>
                    <span className="chapter-toggle-value">{loading ? 'Chargement...' : displayValue}</span>
                </div>
                <div className={`chapter-toggle-arrow${isOpen ? ' open' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </button>

            {/* Dropdown Overlay (click-away) */}
            {isOpen && <div className="chapter-dropdown-overlay" onClick={() => setIsOpen(false)} />}

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chapter-dropdown"
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                        role="listbox"
                        aria-labelledby="chapter-selector-toggle"
                    >
                        {/* Search header */}
                        {chapters.length > 5 && (
                            <div className="chapter-dropdown-header">
                                <svg className="chapter-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    ref={searchInputRef}
                                    className="chapter-search-input"
                                    type="text"
                                    placeholder="Rechercher un chapitre..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="chapter-dropdown-list">
                            {loading ? (
                                // Skeleton loading
                                <>
                                    {[1, 2, 3, 4].map(i => (
                                        <div className="chapter-skeleton" key={i}>
                                            <div className="chapter-skeleton-circle" />
                                            <div className="chapter-skeleton-text" style={{ width: `${50 + i * 10}%` }} />
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {/* "All chapters" option */}
                                    {!searchQuery && (
                                        <button
                                            className={`chapter-option all-chapters${!selectedChapter ? ' selected' : ''}`}
                                            onClick={() => handleSelectChapter(null)}
                                            role="option"
                                            aria-selected={!selectedChapter}
                                        >
                                            <div className="chapter-option-indicator">
                                                <svg className="chapter-option-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </div>
                                            <div className="chapter-option-info">
                                                <span className="chapter-option-name">Tous les chapitres</span>
                                                <span className="chapter-option-count">{chapters.length} chapitres</span>
                                            </div>
                                        </button>
                                    )}

                                    {/* Chapter list */}
                                    {filteredChapters.map((chapter, idx) => (
                                        <motion.button
                                            key={chapter}
                                            className={`chapter-option${selectedChapter === chapter ? ' selected' : ''}`}
                                            onClick={() => handleSelectChapter(chapter)}
                                            role="option"
                                            aria-selected={selectedChapter === chapter}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03, duration: 0.2 }}
                                        >
                                            <div className="chapter-option-indicator">
                                                <svg className="chapter-option-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </div>
                                            <div className="chapter-option-info">
                                                <span className="chapter-option-name">{chapter}</span>
                                            </div>
                                        </motion.button>
                                    ))}

                                    {/* No results */}
                                    {filteredChapters.length === 0 && searchQuery && (
                                        <div className="chapter-no-results">
                                            <div className="chapter-no-results-icon">🔍</div>
                                            Aucun chapitre trouvé pour « {searchQuery} »
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChapterSelector;
