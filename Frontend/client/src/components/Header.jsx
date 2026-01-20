// src/components/Header.jsx

import React, {useState, useEffect, useRef } from 'react';
import {Link, NavLink, useNavigate} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CountryFlag from "react-country-flag";
import { AnimatePresence, motion } from 'framer-motion';
import { FaSearch, FaPhoneAlt, FaEnvelope, FaBars, FaTimes, FaChevronDown, FaChevronRight, FaHome } from 'react-icons/fa';
import { XMarkIcon } from '@heroicons/react/24/outline';

import { PATHS } from '../routesConfig';

import apiClient from '../services/api';

// ===================================================================================
// COMPONENT CON: DESKTOP MENU ITEM
// ===================================================================================
const DesktopMenuItem = ({ item, currentLang, level = 0 }) => {
    const [isHovered, setHovered] = useState(false);
    const translation = item.translations.find(t => t.languageCode === currentLang) || item.translations[0];
    if (!translation) return null;

    const hasChildren = item.children && item.children.length > 0;

    const localizedPath = PATHS.category[currentLang] || PATHS.category.en;

    return (
        <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <NavLink
                to={`/${localizedPath}/${translation.slug}`}
                className={`flex items-center w-full h-full px-2 font-semibold text-[11px] uppercase transition-colors duration-300
                    ${level > 0
                    ? 'normal-case font-normal justify-between py-2 hover:translate-x-1 transition-transform duration-300 ease-in-out'
                    : (isHovered ? 'text-amber-300' : 'text-white')}`
                }
            >
                <span>{translation.name}</span>
                {hasChildren && (level > 0
                        ? <FaChevronRight size={12} className="ml-4 opacity-70" />
                        : <FaChevronDown size={12} className={`ml-2 opacity-70 transition-transform duration-300 ${isHovered ? 'rotate-180' : ''}`} />
                )}
            </NavLink>

            {hasChildren && isHovered && (
                <div className={`
                  absolute w-64 bg-white text-gray-800 shadow-xl p-1
                  transition-opacity duration-300
                  ${level > 0 ? 'left-full -top-1 ml-1' : 'top-full left-0'}
                `}>
                    {item.children.map(childItem => (
                        <DesktopMenuItem key={childItem.id} item={childItem} currentLang={currentLang} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};


// ===================================================================================
// COMPONENT CON: MOBILE MENU ITEM
// ===================================================================================
const MobileMenuItem = ({ item, currentLang, closeMenu, level = 0 }) => {
    const [isSubMenuOpen, setSubMenuOpen] = useState(false);
    const translation = item.translations.find(t => t.languageCode === currentLang) || item.translations[0];
    if (!translation) return null;
    const hasChildren = item.children && item.children.length > 0;
    const localizedPath = PATHS.category[currentLang] || PATHS.category.en;

    const handleToggleSubMenu = () => {
        setSubMenuOpen(!isSubMenuOpen);
    };

    return (
        <div className={` text-[13px]
            ${level > 0 ? 'pl-4 border-l-2 border-white/10' : ''}
            ${level === 0 ? 'border-b border-white/10' : ''}
        `}>
            <div className="flex items-center justify-between w-full">
                <NavLink
                    to={`/${localizedPath}/${translation.slug}`}
                    onClick={closeMenu}
                    className="flex-grow flex items-center p-4 font-semibold uppercase transition-colors duration-300"
                >
                    {level > 0 && <span className="mr-2 text-white/50">└─</span>}
                    <span>{translation.name}</span>
                </NavLink>

                {hasChildren && (
                    <button
                        onClick={handleToggleSubMenu}
                        className="flex-shrink-0 h-10 w-10 mr-2 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <FaChevronDown size={12} className={`transition-transform duration-300 ${isSubMenuOpen ? 'rotate-0' : '-rotate-90'}`}/>
                    </button>
                )}
            </div>

            {hasChildren && isSubMenuOpen && (
                <div className="text-white">
                    {item.children.map(childItem => (
                        <MobileMenuItem key={childItem.id} item={childItem} currentLang={currentLang}
                                        closeMenu={closeMenu} level={level + 1}/>
                    ))}
                </div>
            )}
        </div>
    );
};


// ===================================================================================
// COMPONENT CON: LANGUAGE SWITCHER
// ===================================================================================
const LanguageSwitcher = () => {
    const {i18n} = useTranslation();
    const currentLang = i18n.language;
    const languages = [{code: 'vi', name: 'VI', country_code: 'VN'}, {code: 'en', name: 'EN', country_code: 'GB'}];
    return (
        <div className="flex items-center space-x-1 bg-white/20 p-1 rounded-full">
            {languages.map((lang) => (
                <button key={lang.code} onClick={() => i18n.changeLanguage(lang.code)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[9px] font-semibold transition-all duration-300 
                        ${currentLang === lang.code ? 'bg-white text-[var(--brand-blue)] cursor-default' : 'text-white opacity-70 hover:opacity-100'}`}
                        disabled={currentLang === lang.code
                        }>
                    <CountryFlag countryCode={lang.country_code} svg style={{width: '1em', height: '1em'}}
                                 title={lang.name}/>
                    <span>{lang.name}</span>
                </button>
            ))}
        </div>
    );
};


// ===================================================================================
// COMPONENT CON: MOBILE MENU
// ===================================================================================
const MobileMenu = ({ menuItems, currentLang, closeMenu }) => {
    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeMenu} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"/>
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-[var(--brand-blue)] text-white shadow-lg z-50 overflow-y-auto lg:hidden">
                <div className="p-4 flex justify-between items-center border-b border-white/20">
                    <span className="font-bold text-lg">MENU</span>
                    <button onClick={closeMenu} className="text-2xl"><FaTimes /></button>
                </div>
                <nav className="flex flex-col">
                    <NavLink to="/" onClick={closeMenu} className="flex items-center p-4 border-b border-white/10 font-semibold uppercase text-[13px]"><FaHome className="mr-3" size={16} /> <span>{currentLang == "vi" ? "TRANG CHỦ" : "HOME"}</span></NavLink>
                    {menuItems.map(item => (<MobileMenuItem key={item.id} item={item} currentLang={currentLang} closeMenu={closeMenu} level={0} />))}
                </nav>
                <div className="p-4 mt-auto flex justify-center border-t border-white/20"><LanguageSwitcher /></div>
            </motion.div>
        </>
    );
};


// ===================================================================================
// COMPONENT CON: SEARCH MODAL
// ===================================================================================
const SearchModal = ({ closeSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { i18n } = useTranslation();
    const currentLang = i18n.language;
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            const searchPath = PATHS.search[currentLang] || PATHS.search.en;
            navigate(`/${searchPath}?q=${searchTerm.trim()}`);
            closeSearch();
        }
    };

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-white z-50"/>
            <motion.button initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }} onClick={closeSearch} className="fixed top-4 right-4 z-[51] flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <XMarkIcon className="h-6 w-6 text-gray-700" />
            </motion.button>
            <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 left-0 w-full p-4 z-50 pt-20 md:pt-28">
                <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto mb-6">
                    <input
                        type="text"
                        placeholder="Nhập nội dung tìm kiếm..."
                        className="w-full h-16 pl-6 pr-20 rounded-full bg-gray-100 border-2 border-transparent focus:bg-white focus:border-[var(--brand-blue)] focus:outline-none focus:ring-0 text-lg text-gray-800 transition-colors duration-300"
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="absolute top-1/2 right-2 -translate-y-1/2 p-4 bg-[var(--brand-blue)] rounded-full text-white hover:bg-blue-700 transition-colors">
                        <FaSearch size={18} />
                    </button>
                </form>
            </motion.div>
        </>
    );
};


// ===================================================================================
// COMPONENT HEADER CHÍNH
// ===================================================================================
const Header = ({ variant = 'full' }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;
    const navigate = useNavigate()
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState('');
    const [topLevelMenuItems, setTopLevelMenuItems] = useState([]);
    const [desktopSearchQuery, setDesktopSearchQuery] = useState('');

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                const response = await apiClient.get('/public/categories/tree');
                const rootCategories = response.data.filter(item => item.parentId === null);
                setTopLevelMenuItems(rootCategories);
            } catch (error) {
                console.error("Lỗi khi tải menu:", error);
                setTopLevelMenuItems([]);
            }
        };
        fetchMenuData();
    }, []);

    const handleDesktopSearchSubmit = (e) => {
        e.preventDefault();
        if (desktopSearchQuery.trim()) {
            const searchPath = PATHS.search[currentLang] || PATHS.search.en;
            navigate(`/${searchPath}?q=${desktopSearchQuery.trim()}`);
            setDesktopSearchQuery('');
        }
    };

    // --- FIXED HEADER ---
    const [isSticky, setSticky] = useState(false);
    const headerTopRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const topBarsHeight = headerTopRef.current?.offsetHeight || 0;
            if (window.scrollY > topBarsHeight) {
                setSticky(true);
            } else {
                setSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const date = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const locale = currentLang === 'vi' ? 'vi-VN' : 'en-US';
        setCurrentDate(date.toLocaleDateString(locale, options));
    }, [currentLang]);

    return (
        <header className="relative z-40">
            <div ref={headerTopRef}>
                {variant === "full" && (
                    <>
                        {/* Logo Trường */}
                        {/*<div className="bg-white">*/}
                        {/*    <div className="w-full lg:w-3/4 mx-auto px-4 flex justify-start items-center py-2">*/}
                        {/*        <Link to="/"><img src="https://upload.wikimedia.org/wikipedia/vi/3/3b/Logo_viethung.png"*/}
                        {/*                          alt="Logo Trường" className="h-16"/></Link>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        <div className="hidden lg:flex bg-[var(--brand-blue)] text-white/80 border-y border-blue-800">
                            <div
                                className="w-full lg:w-3/4 mx-auto px-4 flex justify-between items-center py-2 text-[10px]">
                                <div className="flex items-center space-x-4">
                                    <span className="font-semibold">{currentDate}</span>
                                    <a href="tel:02433838345"
                                       className="flex items-center space-x-1.5 hover:text-white"><FaPhoneAlt
                                        size={12}/><span>02433 838 345</span></a>
                                    <a href="mailto:dhcnviethung.viu@gmail.com"
                                       className="flex items-center space-x-1.5 hover:text-white"><FaEnvelope
                                        size={14}/><span>dhcnviethung.viu@gmail.com</span></a>
                                </div>
                                <form onSubmit={handleDesktopSearchSubmit}
                                      className="flex items-center bg-white/10 rounded-full h-8 px-3">
                                    <input
                                        type="text"
                                        placeholder={`${currentLang == 'vi' ? "Tìm kiếm..." : "Search..."}`}
                                        className="bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder-gray-300 text-[11px] w-64"
                                        value={desktopSearchQuery}
                                        onChange={(e) => setDesktopSearchQuery(e.target.value)}
                                    />
                                    <button type="submit" className="text-white opacity-70 hover:opacity-100">
                                        <FaSearch size={14}/>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {isSticky && <div className="h-16"/>}

            <div className={`
                bg-[var(--brand-blue)] text-white h-14 shadow-lg w-full
                ${isSticky ? 'fixed top-0 left-0 z-30' : 'relative'}
            `}>
                <div className="w-full lg:w-3/4 mx-auto px-4 flex justify-between items-center h-full">
                    <div className="lg:flex-10  flex justify-start">
                        <button className="lg:hidden text-2xl p-2 -ml-2" onClick={() => setMobileMenuOpen(true)}>
                            <FaBars/>
                        </button>
                        <nav className="hidden lg:flex items-center h-full">
                            <Link to="/" className="flex items-center h-full px-4 group"><FaHome size={20} className="text-white group-hover:text-amber-300 transition-colors"/></Link>
                            {topLevelMenuItems.map((item) => (
                                <DesktopMenuItem key={item.id} item={item} currentLang={currentLang} level={0}/>
                            ))}
                        </nav>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <div className="flex items-center space-x-2">
                            <div className="hidden lg:block"><LanguageSwitcher/></div>
                            <button
                                className="lg:hidden flex items-center bg-white/20 hover:bg-white/30 text-white py-2 px-3 rounded-full transition-colors duration-200"
                                onClick={() => setSearchOpen(true)}>
                            <FaSearch size={16} className="mr-2" />
                                <span className="text-sm font-semibold">{`${currentLang == 'vi' ? "Tìm kiếm..." : "Search..."}`}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && ( <MobileMenu menuItems={topLevelMenuItems} currentLang={currentLang} closeMenu={() => setMobileMenuOpen(false)} /> )}
            </AnimatePresence>
            <AnimatePresence>
                {isSearchOpen && ( <SearchModal closeSearch={() => setSearchOpen(false)} /> )}
            </AnimatePresence>
        </header>
    );
};

export default Header;