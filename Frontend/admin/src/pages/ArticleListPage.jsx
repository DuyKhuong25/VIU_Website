import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllArticles, deleteArticle, toggleArticlePinStatus } from '../services/articleService';
import toast from 'react-hot-toast';
import Pagination from '../components/common/Pagination';
import { FileText, PlusCircle, Edit, Trash2, Pin } from 'lucide-react';
import { format, parseISO } from 'date-fns';

function ArticleListPage() {
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const fetchArticles = useCallback(async (page, size, search) => {
        try {
            setLoading(true);
            const response = await getAllArticles(page, size, search);
            setArticles(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
            setCurrentPage(response.data.number);
        } catch (error) {
            toast.error("Không thể tải danh sách bài viết.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles(currentPage, pageSize, searchTerm);
    }, [fetchArticles, currentPage, pageSize, searchTerm]);

    const handleDelete = async (articleId) => {
        if (window.confirm("Bạn có chắc muốn xóa bài viết này? Hành động này sẽ xóa vĩnh viễn.")) {
            try {
                await deleteArticle(articleId);
                toast.success("Xóa bài viết thành công!");
                fetchArticles(currentPage, pageSize, searchTerm);
            } catch (error) {
                toast.error("Xóa bài viết thất bại.");
            }
        }
    };

    const handleTogglePin = async (articleId) => {
        try {
            await toggleArticlePinStatus(articleId);
            toast.success("Cập nhật trạng thái ghim thành công!");
            fetchArticles(currentPage, pageSize, searchTerm);
        } catch (error) {
            toast.error("Cập nhật trạng thái ghim thất bại.");
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setCurrentPage(0);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-x-3">
                    <FileText size={36} className="text-[var(--brand-blue)]" />
                    <h1 className="text-[22px] font-bold text-brand-blue uppercase tracking-wider">Quản lý Bài viết</h1>
                </div>
                <Link to="/articles/new" className="flex items-center gap-x-2 px-4 py-2 bg-[var(--brand-blue)] text-white font-semibold rounded-lg hover:bg-opacity-90">
                    <PlusCircle size={20} /><span>Viết bài mới</span>
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                    <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                        <th className="px-3 py-3 w-12 text-center">Ghim</th>
                        <th className="px-5 py-3">Ảnh</th>
                        <th className="px-5 py-3">Tiêu đề (VI)</th>
                        <th className="px-5 py-3">Tác giả</th>
                        <th className="px-5 py-3">Danh mục</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3">Ngày xuất bản</th>
                        <th className="px-5 py-3 text-center">Hành động</th>
                    </tr>
                    </thead>
                    <tbody className="text-gray-700">
                    {loading ? (
                        <tr><td colSpan="7" className="text-center p-8 text-gray-500">Đang tải...</td></tr>
                    ) : articles.length === 0 ? (
                        <tr><td colSpan="7" className="text-center p-8 text-gray-500">Không tìm thấy bài viết nào.</td></tr>
                    ) : articles.map(article => {
                        const vi = article.translations.find(t => t.languageCode === 'vi') || {};
                        return (
                            <tr key={article.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-3 py-2 text-center">
                                    <button onClick={() => handleTogglePin(article.id)}
                                            title={article.pinned ? "Bỏ ghim bài viết" : "Ghim bài viết này"}
                                            className={`p-2 rounded-full transition-colors ${
                                                article.pinned
                                                    ? 'text-red-800 hover:bg-blue-100'
                                                    : 'text-gray-400 hover:bg-gray-200'
                                            }`}>
                                        <Pin size={18} fill={article.pinned ? 'currentColor' : 'none'}/>
                                    </button>
                                </td>
                                <td className="px-5 py-2">
                                    <img src={article.thumbnailUrl} alt={vi.title}
                                         className="w-24 h-16 object-cover rounded"/>
                                </td>
                                <td className="px-5 py-2 text-sm font-semibold text-gray-900">{vi.title}</td>
                                <td className="px-5 py-2 text-sm">{article.author.fullName}</td>
                                <td className="px-5 py-2 text-sm">{article.category.name}</td>
                                <td className="px-5 py-2 text-sm">
                                        <span
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${article.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {article.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                                        </span>
                                </td>
                                <td className="px-5 py-2 text-sm">
                                    {article.publishedAt ? format(parseISO(article.publishedAt), 'dd/MM/yyyy HH:mm') : 'Chưa xuất bản'}
                                </td>
                                <td className="px-5 py-2 text-sm text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <Link to={`/articles/edit/${article.id}`}
                                              className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors">
                                            <Edit size={18}/>
                                        </Link>
                                        <button onClick={() => handleDelete(article.id)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors">
                                            <Trash2 size={18}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4 px-1 py-2">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <span>Hiển thị</span>
                    <select value={pageSize} onChange={handlePageSizeChange}
                            className="px-2 py-1.5 border border-gray-300 rounded-md">
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                    </select>
                    <span>trên tổng số {totalElements} kết quả</span>
                </div>
                {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                )}
            </div>
        </div>
    );
}

export default ArticleListPage;