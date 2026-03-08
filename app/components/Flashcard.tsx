import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './Flashcard.css';
import { motion } from 'framer-motion';


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
}

export interface FlashcardProps {
    front: CardSideContent;
    back: CardSideContent;
    isFlipped?: boolean;
    disableFlip?: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ front, back, isFlipped: propIsFlipped, disableFlip }) => {
    const [localIsFlipped, setLocalIsFlipped] = useState(false);

    const isFlipped = propIsFlipped !== undefined ? propIsFlipped : localIsFlipped;

    const handleFlip = () => {
        if (disableFlip) return;
        if (propIsFlipped === undefined) {
            setLocalIsFlipped(!localIsFlipped);
        }
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
            </div>
        );
    };

    return (
        <div className="flashcard-container" onClick={handleFlip}>
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
