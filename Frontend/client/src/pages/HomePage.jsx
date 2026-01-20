// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useTranslation } from 'react-i18next';
import Slider from '../components/Slider';
import QuickLinks from '../components/QuickLinks';
import FeaturedNews from '../components/FeaturedNews';
import CategorySection from '../components/CategorySection';
import Sidebar from '../components/Sidebar';
import Partners from '../components/Partners';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import ArticleCard from '../components/ArticleCard';


const HomePage = () => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const [featuredArticles, setFeaturedArticles] = useState([]);
    const [homepageCategories, setHomepageCategories] = useState([]);
    const [latestArticles, setLatestArticles] = useState([]);
    const [categoryArticlesMap, setCategoryArticlesMap] = useState({});
    const [popularTags, setPopularTags] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoryRes = await apiClient.get('/public/categories/tree');
                const allCategories = categoryRes.data;
                const rootCategories = allCategories.filter(cat => cat.parentId === null);

                const categoriesToShow = rootCategories.filter(cat => cat.showOnHomepage);
                setHomepageCategories(categoriesToShow);

                const featuredPromise = apiClient.get(`/public/articles/featured/${currentLang}?limit=3`);
                const latestPromise = apiClient.get(`/public/articles/latest/${currentLang}?limit=6`);
                const popularTagsPromise = apiClient.get('/public/tags/popular?limit=10');

                const categoryArticlePromises = categoriesToShow.map(cat => {
                    const slug = cat.translations.find(t => t.languageCode === currentLang)?.slug || cat.translations[0].slug;
                    return apiClient.get(`/public/articles/by-category-slug/${slug}/${currentLang}?limit=6`);
                });

                const [featuredRes, latestRes, popularTagsRes, ...categoryArticlesResponses] = await Promise.all([
                    featuredPromise,
                    latestPromise,
                    popularTagsPromise,
                    ...categoryArticlePromises
                ]);

                setFeaturedArticles(featuredRes.data);
                setLatestArticles(latestRes.data);
                setPopularTags(popularTagsRes.data);

                const articlesMap = {};
                categoriesToShow.forEach((category, index) => {
                    articlesMap[category.id] = categoryArticlesResponses[index].data;
                });
                setCategoryArticlesMap(articlesMap);

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu trang chủ:", err);
            }
        };

        fetchData();
    }, [currentLang])

    const announcementsTitle = currentLang === 'vi' ? 'Thông báo mới nhất' : 'Latest Announcements';

    return (
        <div className="w-full">
            <Slider />
            <QuickLinks />

            <div className="w-full lg:w-3/4 mx-auto px-4 py-8">
                <div className="lg:hidden mb-8 pb-8 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 border-l-4 border-red-500 pl-4 uppercase">
                            {announcementsTitle}
                        </h2>
                    </div>

                    <Swiper slidesPerView={'auto'} spaceBetween={16} className="!px-1 py-1">
                        {latestArticles.map(article => (
                            <SwiperSlide key={article.id} className="!w-[80%] sm:!w-[60%] md:!w-[45%]">
                                <div className="h-full">
                                    <ArticleCard article={article}/>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
                    <div className="lg:col-span-4">
                        <FeaturedNews articles={featuredArticles}/>
                        {homepageCategories.map(category => {
                            const articlesForThisCategory = categoryArticlesMap[category.id] || [];
                            if (articlesForThisCategory.length === 0) {
                                return null;
                            }
                            return (
                                <CategorySection
                                    key={category.id}
                                    category={category}
                                    articles={articlesForThisCategory}
                                />
                            );
                        })}
                    </div>
                    <div className="lg:col-span-2">
                        <Sidebar announcements={latestArticles} popularTags={popularTags}/>
                    </div>
                </div>
            </div>

            <Partners/>
        </div>
    );
};

export default HomePage;