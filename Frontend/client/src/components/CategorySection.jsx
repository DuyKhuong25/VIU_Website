// src/components/CategorySection.jsx
import React from 'react';
import ArticleCard from './ArticleCard';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { FaArrowRight } from 'react-icons/fa';

import { PATHS } from '../routesConfig';

const CategorySection = ({ category, articles }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const localizedPath = PATHS.category[currentLang] || PATHS.category.en;

    const categoryTranslation = category.translations.find(t => t.languageCode === currentLang) || category.translations[0];

    return (
        <section className="mb-8 pb-8 border-b border-gray-200 last:border-b-0 last:pb-0 last:mb-0">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-1xl lg:text-[22px] font-bold text-gray-800 border-l-4 border-[var(--brand-blue)] pl-4 uppercase">
                    {categoryTranslation.name}
                </h2>

                <Link to={`/${localizedPath}/${categoryTranslation.slug}`} className="flex items-center font-semibold text-[var(--brand-blue)] hover:text-amber-500 transition-colors group whitespace-nowrap text-[11px] sm:text-[11px]">
                    {currentLang === 'en' ? 'See all' : 'Xem tất cả'}
                    <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-2">
                {articles.map(article => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>

            <div className="lg:hidden">
                <Swiper slidesPerView={'auto'} spaceBetween={16} className="!px-1 py-1">
                    {articles.map(article => (
                        <SwiperSlide key={article.id} className="!w-[80%] sm:!w-[60%] md:!w-[45%]">
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

export default CategorySection;