// src/components/ArticleContent.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaRegClock, FaUserEdit } from 'react-icons/fa';
import Breadcrumbs from './Breadcrumbs';
import { PATHS } from '../routesConfig';

const ArticleContent = ({ article, breadcrumbCrumbs }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const translation = article.translations.find(t => t.languageCode === currentLang) || article.translations[0];
    const authorName = article.author.fullName || 'Admin';

    const formattedDate = new Date(article.publishedAt).toLocaleDateString(currentLang === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <article className="bg-white p-4 sm:p-8 rounded-lg shadow-md">
            <Breadcrumbs crumbs={breadcrumbCrumbs} theme="dark" size="12px" />

            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 my-4 leading-tight">
                {translation.title}
            </h1>

            <div className="flex flex-wrap items-center text-[11px] text-gray-500 space-x-4 mb-4 pb-4 border-b">
                <div className="flex items-center">
                    <FaRegClock className="mr-1.5" />
                    <span>{formattedDate}</span>
                </div>
                <div className="flex items-center">
                    <FaUserEdit className="mr-1.5" />
                    <span>{authorName}</span>
                </div>
            </div>

            <p className="text-[16px] font-semibold text-gray-700 leading-relaxed mb-6">
                {translation.excerpt}
            </p>

            <div
                className="article-content text-[14px]"
                dangerouslySetInnerHTML={{ __html: translation.content }}
            />
        </article>
    );
};

export default ArticleContent;
