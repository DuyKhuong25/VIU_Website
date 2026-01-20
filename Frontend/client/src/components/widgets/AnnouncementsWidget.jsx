// src/components/widgets/AnnouncementsWidget.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

import { getReadStatus, markAsRead } from '../../utils/readStatus';
import { PATHS } from '../../routesConfig';
const AnnouncementsWidget = ({ announcements }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const [readIds, setReadIds] = useState([]);

    useEffect(() => {
        setReadIds(getReadStatus());
    }, []);

    const handleLinkClick = (id) => {
        markAsRead(id);
        setReadIds(prevReadIds => [...prevReadIds, id]);
    };

    const localizedArticlePath = PATHS.article[currentLang] || PATHS.article.en;


    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl md:text-[14px] font-bold text-gray-800 border-l-4 border-amber-400 pl-3 uppercase">
                    {currentLang === 'vi' ? 'Thông báo mới nhất' : 'New Announcements'}
                </h3>
            </div>
            <ul>
                {announcements.map(item => {
                    const translation = item.translations.find(t => t.languageCode === currentLang) || item.translations[0];
                    const formattedDate = new Date(item.publishedAt).toLocaleDateString(currentLang === 'vi' ? 'vi-VN' : 'en-US', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                    });

                    const isUnread = !readIds.includes(item.id);

                    return (
                        <li key={item.id} className="border-b last:border-b-0 border-gray-300">
                            <Link
                                to={`/${localizedArticlePath}/${translation.slug}`}
                                className="group flex items-center space-x-4 py-2"
                                onClick={() => handleLinkClick(item.id)}
                            >
                                <div className="relative text-amber-400">
                                    <img
                                        src={item.thumbnailUrl}
                                        alt={translation.title}
                                        className="w-16 h-16 object-cover rounded-md"
                                    />
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <p className={`font-semibold text-[14px] group-hover:text-[var(--brand-blue)] transition-colors whitespace-nowrap overflow-hidden text-ellipsis ${isUnread ? 'text-gray-800' : 'text-gray-600'}`}>
                                        {translation.title}
                                    </p>
                                    <p className="text-[11px] text-gray-500 mt-1">
                                        <span className="italic mr-1">{`${currentLang === 'vi' ? 'Ngày đăng:' : 'Published:'}`}</span>
                                        {formattedDate}
                                    </p>
                                </div>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};

export default AnnouncementsWidget;