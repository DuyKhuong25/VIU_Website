// src/components/widgets/RelatedArticlesWidget.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PATHS } from '../../routesConfig';
import {FaArrowRight} from "react-icons/fa";

const RelatedArticlesWidget = ({ articles }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const localizedArticlePath = PATHS.article[currentLang] || PATHS.article.en;
    const localizedCategoryPath = PATHS.category[currentLang] || PATHS.category.en;

    const firstArticle = articles[0];
    if (!firstArticle) return null;

    const categoryTranslation = firstArticle.category;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl md:text-[14px] font-bold text-gray-800 border-l-4 border-amber-400 pl-3 uppercase">
                    {currentLang == "vi" ? "Bài viết cùng danh mục" : "Related Articles"}
                </h3>
                <Link to={`/${localizedCategoryPath}/${categoryTranslation.slug}`}
                    className="flex items-center text-[11px] font-semibold text-[var(--brand-blue)] hover:text-amber-500 transition-colors group whitespace-nowrap cursor-pointer">
                    {currentLang === 'vi' ? 'Xem tất cả' : 'View All'}
                    <FaArrowRight className="ml-1.5 transform group-hover:translate-x-1 transition-transform" size={12}/>
                </Link>
            </div>
            <ul>
                {articles.map(item => {
                    const translation = item.translations.find(t => t.languageCode === currentLang) || item.translations[0];
                    if (!translation) return null;
                    const formattedDate = new Date(item.publishedAt).toLocaleDateString(currentLang === 'vi' ? 'vi-VN' : 'en-US', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                    });

                    return (
                        <li key={item.id} className="border-b last:border-b-0 border-gray-100">
                            <Link to={`/${localizedArticlePath}/${translation.slug}`}
                                  className="group flex items-center space-x-3 py-3">
                                <img
                                    src={item.thumbnailUrl}
                                    alt={translation.title}
                                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                                />
                                <div className="flex-1 overflow-hidden">
                                    <p className={`font-semibold text-[14px] group-hover:text-[var(--brand-blue)] transition-colors whitespace-nowrap overflow-hidden text-ellipsis`}>
                                        {translation.title}
                                    </p>
                                    <p className="text-[11px] text-gray-500 mt-1">
                                        <span
                                            className="italic mr-1">{`${currentLang === 'vi' ? 'Ngày đăng:' : 'Published:'}`}</span>
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

export default RelatedArticlesWidget;