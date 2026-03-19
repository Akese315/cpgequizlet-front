import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './Flashcard.css';
import { motion, AnimatePresence } from 'framer-motion';


export const renderMixedText = (text: string) => {
    if (!text) return null;
    // Sépare le texte et les formules entourées de $, $$, \(...\) ou \[...\]
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[\s\S]*?\$|\\\([\s\S]*?\\\))/g);

    return parts.map((part, index) => {
        if (!part) return null;

        let isMath = false;
        let isBlock = false;
        let mathContent = part;

        if (part.startsWith('$$') && part.endsWith('$$')) {
            isMath = true;
            isBlock = true;
            mathContent = part.slice(2, -2);
        } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
            isMath = true;
            isBlock = true;
            mathContent = part.slice(2, -2);
        } else if (part.startsWith('$') && part.endsWith('$')) {
            isMath = true;
            mathContent = part.slice(1, -1);
        } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
            isMath = true;
            mathContent = part.slice(2, -2);
        }

        if (isMath) {
            try {
                const html = katex.renderToString(mathContent, {
                    displayMode: isBlock,
                    throwOnError: false
                });
                return <span key={index} className="latex-inline" dangerouslySetInnerHTML={{ __html: html }} />;
            } catch (e) {
                return <span key={index}>{part}</span>;
            }
        }

        return <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
    });
};


export interface CardSideContent {
    text?: string;
    imageUrl?: string;
    quote?: {
        text: string;
        author?: string;
    };
    explication?: string;
}

export interface FlashcardProps {
    front: CardSideContent;
    back: CardSideContent;
    isFlipped?: boolean;
    disableFlip?: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ front, back, isFlipped: propIsFlipped, disableFlip }) => {
    const [localIsFlipped, setLocalIsFlipped] = useState(false);
    const [copied, setCopied] = useState(false);

    const isFlipped = propIsFlipped !== undefined ? propIsFlipped : localIsFlipped;

    const handleFlip = () => {
        if (disableFlip) return;
        if (propIsFlipped === undefined) {
            setLocalIsFlipped(!localIsFlipped);
        }
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderContent = (content: CardSideContent) => {
        return (
            <div className="flashcard-content-wrapper">
                {content.imageUrl && (
                    <img
                        src={content.imageUrl}
                        alt="Flashcard illustration"
                        className="flashcard-image"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                )}

                {content.quote && (
                    <blockquote className="flashcard-quote">
                        "{content.quote.text}"
                        {content.quote.author && (
                            <span className="flashcard-quote-author">— {content.quote.author}</span>
                        )}
                    </blockquote>
                )}

                {content.text && (
                    <div className="flashcard-text">{renderMixedText(content.text)}</div>
                )}

                {content.explication && (
                    <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                        className="flashcard-explanation"
                    >
                        <div className="explanation-header">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            <span>Explication</span>
                        </div>
                        <div className="explanation-body">
                            {renderMixedText(content.explication)}
                        </div>
                    </motion.div>
                )}
            </div>
        );
    };

    const shareButton = (
        <motion.button 
            className={`flashcard-share-btn ${copied ? 'copied' : ''}`}
            onClick={handleShare} 
            title="Partager"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <AnimatePresence mode="wait">
                {copied ? (
                    <motion.svg 
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </motion.svg>
                ) : (
                    <motion.svg 
                        key="share"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </motion.svg>
                )}
            </AnimatePresence>
        </motion.button>
    );

    return (
        <div className="flashcard-container" onClick={handleFlip}>
            {shareButton}
            <motion.div
                className="flashcard"
                initial={false}
                animate={{ rotateX: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            >
                <div className="flashcard-side">
                    {renderContent(front)}
                </div>
                <div className="flashcard-side flashcard-back">
                    {renderContent(back)}
                </div>
            </motion.div>
        </div>
    );
};

export default Flashcard;
