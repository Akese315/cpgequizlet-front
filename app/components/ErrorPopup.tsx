import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useErrorStore } from '../store/errorStore';
import './ErrorPopup.css';

const ErrorPopup = () => {
    const { error, clearError } = useErrorStore();

    return (
        <AnimatePresence>
            {error && (
                <motion.div
                    className="error-popup-backdrop"
                    // The backdrop is fixed and covers nothing interactable as it's pointer-events: none 
                    // except the content
                    initial={{ opacity: 0, scale: 0.9, y: 50, x: "-50%" }}
                    animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, scale: 0.9, y: 50, x: "-50%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                    <div className="error-popup-content">
                        <div className="error-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <div className="error-message">
                            <h4>Erreur</h4>
                            <p>{error}</p>
                        </div>
                        <button className="error-close-btn" onClick={clearError}>&times;</button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ErrorPopup;
