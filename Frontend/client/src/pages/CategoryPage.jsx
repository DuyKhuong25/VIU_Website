// src/pages/CategoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../services/api';
import ArticleListCard from '../components/ArticleListCard';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';
import Pagination from '../components/Pagination';

const findCategoryBySlug = (categories, slug) => {
    for (const category of categories) {
        const translation = category.translations.find(t => t.slug === slug);
        if (translation) return category;
        if (category.children && category.children.length > 0) {
            const found = findCategoryBySlug(category.children, slug);
            if (found) return found;
        }
    }
    return null;
};

const CategoryPage = () => {
    const { slug } = useParams();
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const [category, setCategory] = useState(null);
    const [articles, setArticles] = useState([]);
    const [latestArticles, setLatestArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 4;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // 1. Gọi API lấy cây danh mục
                const categoryTreeRes = await apiClient.get('/public/categories/tree');
                const currentCategory = findCategoryBySlug(categoryTreeRes.data, slug);

                if (!currentCategory) {
                    throw new Error("Không tìm thấy danh mục.");
                }
                setCategory(currentCategory);

                const articlesRes = await apiClient.get(`/public/articles/by-category-slug/${slug}/${currentLang}?limit=99`);
                setArticles(articlesRes.data);

                const latestRes = await apiClient.get(`/public/articles/latest/${currentLang}?limit=6`);
                setLatestArticles(latestRes.data);

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu trang danh mục:", err);
                setError("Đã xảy ra lỗi khi tải trang.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        setCurrentPage(1);
    }, [slug, currentLang]);

    const totalPages = Math.ceil(articles.length / articlesPerPage);
    const currentArticles = articles.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage);
    const categoryTranslation = category?.translations.find(t => t.languageCode === currentLang) || category?.translations[0];

    if (isLoading) {
        return <div className="text-center py-20">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-500">{error}</div>;
    }

    return (
        <div className="w-full">
            <div
                className="h-48 md:h-64 relative flex items-center justify-center"
                style={{backgroundColor: 'var(--brand-blue)'}}
            >
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center opacity-20"
                    style={{backgroundImage: `url('https://tuyensinhso.vn/images/files/tuyensinhso.com/truong-dai-hoc-cong-nghiep-viet-hung-1.jpg')`}}
                ></div>

                <div className="relative z-10 text-white p-6 border-1 border-white/80 rounded-md">
                    <h1 className="text-3xl text-center md:text-3xl mb-3 font-bold uppercase">{categoryTranslation.name}</h1>
                    <div className="flex justify-center">
                        <Breadcrumbs crumbs={[{name: categoryTranslation.name}]}/>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-3/4 mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-2">
                    <div className="lg:col-span-4">
                        <div className="space-y-6">
                            {currentArticles.length > 0 ? (
                                currentArticles.map(article => (
                                    <ArticleListCard key={article.id} article={article}/>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-10">Chưa có bài viết nào trong mục này.</p>
                            )}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <Sidebar announcements={latestArticles}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;