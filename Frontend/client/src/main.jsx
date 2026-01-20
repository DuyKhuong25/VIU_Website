// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import './i18n.js';

// Layout và Pages
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import CategoryPage from "./pages/CategoryPage.jsx";
import { PATHS } from './routesConfig';
import FeaturedArticlesPage from "./pages/FeaturedArticlesPage.jsx";
import ArticleDetailPage from "./pages/ArticleDetailPage.jsx";
import TagPage from "./pages/TagPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true, // Trang chủ
                element: <HomePage />,
            },
            {
                path: `${PATHS.category.vi}/:slug`,
                element: <CategoryPage />,
            },
            {
                path: `${PATHS.category.en}/:slug`,
                element: <CategoryPage />,
            },
            {
                path: `${PATHS.featured.vi}`,
                element: <FeaturedArticlesPage />,
            },
            {
                path: `${PATHS.featured.en}`,
                element: <FeaturedArticlesPage />,
            },
            {
                path: `${PATHS.article.vi}/:slug`,
                element: <ArticleDetailPage />,
            },
            {
                path: `${PATHS.article.en}/:slug`,
                element: <ArticleDetailPage />,
            },
            {
                path: `${PATHS.tag.vi}/:slug`,
                element: <TagPage />,
            },
            {
                path: `${PATHS.tag.en}/:slug`,
                element: <TagPage />,
            },
            {
                path: `${PATHS.search.vi}`,
                element: <SearchPage />,
            },
            {
                path: `${PATHS.search.en}`,
                element: <SearchPage />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)