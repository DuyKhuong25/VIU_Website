// src/pages/FeaturedArticlesPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../services/api';
import ArticleListCard from '../components/ArticleListCard';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';
import Pagination from '../components/Pagination';

const pageTitle = {
    vi: 'Bài viết Nổi bật',
    en: 'Featured Articles'
};

const FeaturedArticlesPage = () => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const [articles, setArticles] = useState([]);
    const [latestArticles, setLatestArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 6;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const articlesRes = await apiClient.get(`/public/articles/featured/${currentLang}?limit=99`);
                setArticles(articlesRes.data);

                const latestRes = await apiClient.get(`/public/articles/latest/${currentLang}?limit=6`);
                setLatestArticles(latestRes.data);

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu trang:", err);
                setError("Đã xảy ra lỗi khi tải trang.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        setCurrentPage(1);
    }, [currentLang]);

    // Logic phân trang
    const totalPages = Math.ceil(articles.length / articlesPerPage);
    const currentArticles = articles.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage);

    if (isLoading) {
        return <div className="text-center py-20">Đang tải dữ liệu...</div>;
    }
    if (error) {
        return <div className="text-center py-20 text-red-500">{error}</div>;
    }

    const title = pageTitle[currentLang];

    return (
        <div className="w-full">
            <div
                className="h-48 md:h-64 relative flex items-center justify-center"
                style={{ backgroundColor: 'var(--brand-blue)' }}
            >
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url('https://www.htnc.vn/uploads/news/2021_05/119651083_2275826359230376_3872936022398986400_n.jpg')` }}
                ></div>
                <div className="relative z-10 text-white p-4 border-2 border-white/80 rounded-md">
                    <h1 className="text-3xl md:text-5xl font-bold uppercase">{title}</h1>
                    <div className="mt-2 flex justify-center">
                        <Breadcrumbs crumbs={[{ name: title }]} />
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-3/4 mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-2">
                    <div className="lg:col-span-4">
                        <div className="space-y-6">
                            {currentArticles.length > 0 ? (
                                currentArticles.map(article => (
                                    <ArticleListCard key={article.id} article={article} />
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-10">Chưa có bài viết nổi bật nào.</p>
                            )}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <Sidebar announcements={latestArticles} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturedArticlesPage;