// src/components/Breadcrumbs.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from "react-i18next";

const Breadcrumbs = ({ crumbs, theme = 'light', size = '13px' }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;
    const homeText = { vi: 'Trang chủ', en: 'Home' };

    const baseTextColor = theme === 'light' ? 'text-white/80' : 'text-gray-500';
    const activeTextColor = theme === 'light' ? 'text-white' : 'text-gray-800';
    const hoverTextColor = theme === 'light' ? 'hover:text-white' : 'hover:text-[var(--brand-blue)]';
    const iconColor = theme === 'light' ? 'text-white/80' : 'text-gray-400';

    if (!crumbs || crumbs.length === 0) {
        return null;
    }

    return (
        <nav className={`text-[${size}] font-semibold mt-2 w-full overflow-hidden ${
            theme === 'light' ? 'flex justify-center' : ''
        }`}>

            <ol className={`flex items-center space-x-2 ${baseTextColor} flex-nowrap`}>

                <li className="flex-shrink-0">
                    <Link to="/" className={`flex items-center ${hoverTextColor}`}>
                        <FaHome className="mr-2" />
                        {homeText[currentLang]}
                    </Link>
                </li>

                {crumbs.map((crumb, index) => {
                    const isLastItem = index === crumbs.length - 1;

                    return (
                        <li
                            key={index}
                            className={`flex items-center space-x-2 ${isLastItem ? 'min-w-0' : 'flex-shrink-0'}`}
                        >

                            <FaChevronRight size={10} className={`${iconColor} flex-shrink-0`} />

                            {isLastItem ? (
                                <span
                                    className={`font-bold ${activeTextColor} block overflow-hidden text-ellipsis whitespace-nowrap`}
                                    title={crumb.name}
                                >
                                    {crumb.name}
                                </span>
                            ) : (
                                <Link
                                    to={crumb.path}
                                    className={`${hoverTextColor} whitespace-nowrap`}
                                    title={crumb.name}
                                >
                                    {crumb.name}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;