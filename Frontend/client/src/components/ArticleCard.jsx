// src/components/ArticleCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaRegClock } from 'react-icons/fa';
import { PATHS } from '../routesConfig';


const ArticleCard = ({ article, size = 'normal' }) => {
    if (!article || !article.translations || !article.category) {
        return null;
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const localizedPath = PATHS.article[currentLang] || PATHS.article.en;

    const articleTranslation = article.translations.find(t => t.languageCode === currentLang) || article.translations[0];
    const categoryName = article.category.name;

    if (!articleTranslation) return null;

    const formattedDate = new Date(article.publishedAt).toLocaleDateString(currentLang === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });

    const sizeClasses = {
        large: {
            imageContainer: 'aspect-[2.5/1]',
            contentPadding: 'p-6',
            title: 'text-[16px]',
            excerpt: 'line-clamp-3 text-[13px] mt-2',
        },
        normal: {
            imageContainer: 'aspect-[16/9]',
            contentPadding: 'p-4',
            title: 'text-[16px]',
            excerpt: 'line-clamp-2 text-[13px]',
        }
    };
    const currentSize = sizeClasses[size] || sizeClasses.normal;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden group h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <Link to={`/${localizedPath}/${articleTranslation.slug}`} className="relative block">
                <div className={`w-full overflow-hidden ${currentSize.imageContainer}`}>
                    <img
                        src={article.thumbnailUrl}
                        alt={articleTranslation.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                </div>
                <span className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-sm">
                    {categoryName}
                </span>
            </Link>

            <div className={`flex flex-col flex-grow ${currentSize.contentPadding}`}>
                <Link to={`/${localizedPath}/${articleTranslation.slug}`}>
                    <h3 className={`${currentSize.title} font-bold text-gray-800 group-hover:text-[var(--brand-blue)] transition-colors duration-300 leading-tight line-clamp-2 mb-2`}>
                        {articleTranslation.title}
                    </h3>
                </Link>
                <p className={`text-gray-600 flex-grow ${currentSize.excerpt}`}>
                    {articleTranslation.excerpt}
                </p>
                <div className="mt-auto pt-3 text-[11px] text-gray-500 flex items-center">
                    <FaRegClock className="mr-1.5" />
                    <span className="italic mr-1">{`${currentLang === 'vi' ? 'Ngày đăng: ' : 'Published: '}`}</span>
                    <span>{formattedDate}</span>
                </div>
            </div>
        </div>
    );
};

export default ArticleCard;