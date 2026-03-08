import React from 'react'
import { Outlet } from "react-router";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ErrorPopup from '../components/ErrorPopup';
import { motion } from 'framer-motion';
import './main-layout.css';

const MainLayout = () => {


    return (
        <div className="main-layout">
            <Navbar />

            <motion.main
                className="main-content"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <Outlet />
            </motion.main>

            <Footer />
            <ErrorPopup />
        </div>
    )
}

export default MainLayout