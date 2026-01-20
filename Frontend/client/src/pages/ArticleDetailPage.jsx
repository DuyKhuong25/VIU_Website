// src/pages/ArticleDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../services/api';
import ArticleSidebar from '../components/ArticleSidebar';
import ArticleContent from '../components/ArticleContent';
import { PATHS } from '../routesConfig';
import Breadcrumbs from "../components/Breadcrumbs.jsx";

import { Swiper, SwiperSlide } from 'swiper/react';
import { FaArrowRight } from 'react-icons/fa';
import ArticleCard from '../components/ArticleCard';
import 'swiper/css';
import TagsWidget from "../components/widgets/TagsWidget.jsx";

const ArticleDetailPage = () => {
    const { slug } = useParams();
    const { i18n } = useTranslation();
    const currentLang = i18n.language;
    const navigate = useNavigate();

    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [latestArticles, setLatestArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const handleFetchAndRedirect = async () => {
            try {
                setIsLoading(true);
                setError(null);
                window.scrollTo(0, 0);

                const articleRes = await apiClient.get(`/public/articles/slug/${slug}/${currentLang}`);
                const mainArticle = articleRes.data;

                if (!isMounted) return;

                const targetTranslation = mainArticle.translations.find(t => t.languageCode === currentLang);

                if (targetTranslation && targetTranslation.slug !== slug) {
                    const newBasePath = PATHS.article[currentLang] || PATHS.article.en;
                    navigate(`/${newBasePath}/${targetTranslation.slug}`, { replace: true });
                    return;
                }

                setArticle(mainArticle);

                const articleId = mainArticle.id;
                const categoryId = mainArticle.category.id;

                const relatedPromise = apiClient.get(`/public/articles/related/${articleId}/${categoryId}/${currentLang}?limit=5`);
                const latestPromise = apiClient.get(`/public/articles/latest/${currentLang}?limit=6`);

                const [relatedRes, latestRes] = await Promise.all([relatedPromise, latestPromise]);

                if (isMounted) {
                    setRelatedArticles(relatedRes.data);
                    setLatestArticles(latestRes.data);
                }

            } catch (err) {
                console.error("Lỗi khi tải chi tiết bài viết:", err);
                if (isMounted) setError("Không tìm thấy bài viết hoặc đã có lỗi xảy ra.");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        handleFetchAndRedirect();

        return () => {
            isMounted = false; // Cleanup
        };
    }, [slug, currentLang, navigate]);

    if (isLoading) {
        return <div className="text-center py-40">Đang tải bài viết...</div>;
    }

    if (error) {
        return <div className="text-center py-40 text-red-500">{error}</div>;
    }

    if (!article) return null;

    const categoryTranslation = article.category;
    const articleTranslation = article.translations.find(t => t.languageCode === currentLang) || article.translations[0];
    const localizedCategoryPath = PATHS.category[currentLang] || PATHS.category.en;

    const breadcrumbCrumbs = [
        { name: categoryTranslation.name, path: `/${localizedCategoryPath}/${categoryTranslation.slug}` },
        { name: articleTranslation.title }
    ];

    const relatedTitle = currentLang === 'vi' ? 'Bài viết cùng danh mục' : 'Related Articles';
    const announcementsTitle = currentLang === 'vi' ? 'Thông báo Mới nhất' : 'Latest Announcements';
    const tagsTitle = (currentLang === 'vi') ? 'Thẻ bài viết' : 'Article Tags';

    return (
        <div className="w-full">
            <div
                className="h-48 md:h-64 relative flex items-center justify-center"
                style={{ backgroundColor: 'var(--brand-blue)' }}
            >
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(${article.thumbnailUrl})` }}
                ></div>
                <div className="relative z-10 text-white p-4 border-2 border-white/80 rounded-md">
                    <h1 className="text-3xl md:text-5xl font-bold uppercase">{categoryTranslation.name}</h1>
                    <div className="mt-2 flex justify-center">
                        <Breadcrumbs crumbs={[{ name: categoryTranslation.name }]} />
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-3/4 mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-2">
                    <div className="lg:col-span-4">
                        <ArticleContent article={article} breadcrumbCrumbs={breadcrumbCrumbs}/>
                    </div>

                    <div className="lg:hidden">
                        <TagsWidget tags={article.tags} title={tagsTitle}/>
                    </div>

                    <div className="lg:hidden mt-2 space-y-8">
                        {relatedArticles && relatedArticles.length > 0 && (
                            <section className="pb-8 border-b border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 border-l-4 border-[var(--brand-blue)] pl-4 uppercase">
                                        {relatedTitle}
                                    </h2>
                                    <Link to={`/${localizedCategoryPath}/${categoryTranslation.slug}`}
                                          className="flex items-center font-semibold text-[var(--brand-blue)] hover:text-amber-500 transition-colors group whitespace-nowrap text-[11px] sm:text-[11px]">
                                        {currentLang === 'en' ? 'See all' : 'Xem tất cả'}
                                        <FaArrowRight
                                            className="ml-2 transform group-hover:translate-x-1 transition-transform"/>
                                    </Link>
                                </div>
                                <Swiper slidesPerView={'auto'} spaceBetween={16} className="!px-1 py-1">
                                    {relatedArticles.map(art => (
                                        <SwiperSlide key={art.id} className="!w-[80%] sm:!w-[60%] md:!w-[45%]">
                                            <div className="h-full">
                                                <ArticleCard article={art}/>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </section>
                        )}

                        {latestArticles && latestArticles.length > 0 && (
                            <section className="pb-8">
                                <div className="flex justify-between items-center 2">
                                    <h2 className="text-xl font-bold text-gray-800 border-l-4 border-red-500 pl-4 uppercase">
                                        {announcementsTitle}
                                    </h2>
                                </div>
                                <Swiper slidesPerView={'auto'} spaceBetween={16} className="!px-1 py-1">
                                    {latestArticles.map(art => (
                                        <SwiperSlide key={art.id} className="!w-[80%] sm:!w-[60%] md:!w-[45%]">
                                            <div className="h-full">
                                                <ArticleCard article={art}/>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </section>
                        )}
                    </div>
                    <div className="hidden lg:block lg:col-span-2">
                        <ArticleSidebar
                            announcements={latestArticles}
                            relatedArticles={relatedArticles}
                            tags={article.tags}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleDetailPage;