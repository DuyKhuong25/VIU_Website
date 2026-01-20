// src/components/ArticleListCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaRegClock } from 'react-icons/fa';
import { PATHS } from '../routesConfig';

const ArticleListCard = ({ article }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const localizedPath = PATHS.article[currentLang] || PATHS.article.en;

    const articleTranslation = article.translations.find(t => t.languageCode === currentLang) || article.translations[0];

    const formattedDate = new Date(article.publishedAt).toLocaleDateString(currentLang === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });

    return (
        <div
            className="bg-white rounded-[3px] mb-4 shadow-md overflow-hidden group transition-shadow duration-300 hover:shadow-xl flex flex-col sm:flex-row sm:h-40">

            <Link to={`/${localizedPath}/${articleTranslation.slug}`} className="block sm:w-48 flex-shrink-0 overflow-hidden">
                <img
                    src={article.thumbnailUrl}
                    alt={articleTranslation.title}
                    className="w-full h-40 sm:h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
            </Link>

            <div className="p-3 flex flex-col flex-1">
                <Link to={`/${localizedPath}/${articleTranslation.slug}`}>
                    <h3 className="text-[16px] font-bold text-gray-800 group-hover:text-[var(--brand-blue)] transition-colors duration-300 leading-tight line-clamp-2">
                        {articleTranslation.title}
                    </h3>
                </Link>

                <p className="hidden sm:block text-[13px] text-gray-600 mt-2 line-clamp-2 flex-grow">
                    {articleTranslation.excerpt}
                </p>

                <div className="mt-auto pt-2 border-t border-gray-100 text-[11px] italic text-gray-500 flex items-center">
                    <FaRegClock className="mr-1.5"/>
                    <span>{`${currentLang === 'vi' ? 'Ngày đăng: ' : 'Published: '} ${formattedDate}`}</span>
                </div>
            </div>
        </div>
    );
};

export default ArticleListCard;