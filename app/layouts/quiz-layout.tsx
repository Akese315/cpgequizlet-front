import React from 'react'
import { Outlet } from 'react-router'
import { motion } from 'framer-motion';
import ErrorPopup from '../components/ErrorPopup';
import './quiz-layout.css'
import Navbar from '../components/Navbar'

const QuizLayout = () => {
    return (
        <div className='quiz-layout'>
            <Navbar />
            <motion.main
                className="main-content"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <Outlet />
            </motion.main>
            <ErrorPopup />
        </div>
    )
}

export default QuizLayout