// src/pages/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../services/api';
import ArticleListCard from '../components/ArticleListCard';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaSearch } from 'react-icons/fa';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const query = searchParams.get('q') || '';

    const [articles, setArticles] = useState([]);
    const [latestArticles, setLatestArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!query) {
                setArticles([]);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const searchPromise = apiClient.get(`/public/articles/search?q=${query}&lang=${currentLang}`);
                const latestPromise = apiClient.get(`/public/articles/latest/${currentLang}?limit=6`);

                const [searchRes, latestRes] = await Promise.all([searchPromise, latestPromise]);

                setArticles(searchRes.data);
                setLatestArticles(latestRes.data);

            } catch (err) {
                console.error("Lỗi khi tìm kiếm:", err);
                setError("Đã xảy ra lỗi khi tải kết quả.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [query, currentLang]);

    const title = currentLang === 'vi' ? 'Tìm kiếm' : 'Search';
    const breadcrumbName = `${title}: "${query}"`;
    const resultText = currentLang === 'vi'
        ? `Tìm thấy ${articles.length} kết quả cho "${query}"`
        : `Found ${articles.length} results for "${query}"`;

    if (isLoading) {
        return <div className="text-center py-20">Đang tìm kiếm...</div>;
    }
    if (error) {
        return <div className="text-center py-20 text-red-500">{error}</div>;
    }

    return (
        <div className="w-full">
            <div
                className="h-48 md:h-64 relative flex items-center justify-center"
                style={{ backgroundColor: 'var(--brand-blue)' }}
            >
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url('https://tuyensinhso.vn/images/files/tuyensinhso.com/truong-dai-hoc-cong-nghiep-viet-hung-1.jpg')` }}
                ></div>
                <div className="relative z-10 text-white p-4 border-2 border-white/80 rounded-md">
                    <h1 className="text-3xl md:text-5xl font-bold uppercase">{title}</h1>
                    <div className="mt-2 flex justify-center">
                        <Breadcrumbs crumbs={[{ name: breadcrumbName }]} />
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-3/4 mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-2">
                    <div className="lg:col-span-4">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">{resultText}</h2>
                        <div className="space-y-6">
                            {articles.length > 0 ? (
                                articles.map(article => (
                                    <ArticleListCard key={article.id} article={article} />
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-10">
                                    <FaSearch size={40} className="mx-auto mb-4" />
                                    <p>{currentLang === 'vi' ? 'Không tìm thấy bài viết nào phù hợp.' : 'No matching articles found.'}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <Sidebar announcements={latestArticles} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;