import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatWidget from '../components/chat/ChatWidget.jsx';
import ScrollToTopButton from '../components/ScrollToTopButton';

const MainLayout = () => {
    const location = useLocation();

    const isHomePage = location.pathname === '/';

    const headerVariant = isHomePage ? 'full' : 'minimal';

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header variant={headerVariant}/>
            <main className="flex-grow w-full">
                <Outlet />
                <ChatWidget />
            </main>
            <Footer />
            <ScrollToTopButton />
        </div>
    );
};

export default MainLayout;