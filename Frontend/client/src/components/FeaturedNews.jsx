// src/components/FeaturedNews.jsx

import React from 'react';
import ArticleCard from './ArticleCard';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useTranslation } from 'react-i18next';
import { PATHS } from '../routesConfig';

const FeaturedNews = ({ articles }) => {
    const { i18n } = useTranslation(); // 3. Lấy ngôn ngữ
    const currentLang = i18n.language;
    const localizedPath = PATHS.featured[currentLang] || PATHS.featured.en;

    if (!articles || articles.length === 0) {
        return;
    }

    const mainArticle = articles[0];
    const sideArticles = articles.length > 1 ? articles.slice(1, 3) : [];

    return (
        <section className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl lg:text-[22px] font-bold text-gray-800 border-l-4 border-amber-400 pl-4 uppercase">
                    {currentLang === 'en' ? 'Featured News' : 'Tin tức Nổi bật'}
                </h2>
                <Link to={`/${localizedPath}`} className="flex items-center font-semibold text-[var(--brand-blue)] hover:text-amber-500 transition-colors group whitespace-nowrap text-[11px] sm:text-[11px]">
                    {currentLang === 'en' ? 'See all' : 'Xem tất cả'}
                    <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="hidden md:grid grid-cols-2 gap-2">
                <div className="col-span-2">
                    <ArticleCard article={mainArticle} size="large" />
                </div>
                {sideArticles.map(article => (
                    <ArticleCard key={article.id} article={article} size="normal" />
                ))}
            </div>

            <div className="md:hidden">
                <Swiper slidesPerView={'auto'} spaceBetween={16} className="!px-1 py-1">
                    {articles.map(article => (
                        <SwiperSlide key={article.id} className="!w-[280px]">
                            <div className="h-full">
                                <ArticleCard article={article} />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default FeaturedNews;