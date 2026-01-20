import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleHomepageStatus,
    getAllCategoriesAsTree
} from '../services/categoryService';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import CategoryForm from '../components/categories/CategoryForm';
import CategoryRow from '../components/categories/CategoryRow';
import Pagination from '../components/common/Pagination';
import ToggleSwitch from '../components/common/ToggleSwitch';
import { FolderKanban, PlusCircle, Edit, Trash2, ListTree } from 'lucide-react';
import ReorderModal from "../components/categories/ReorderModal.jsx";
import {useAuth} from "../context/AuthContext.jsx";

function CategoryManagementPage() {
    const { user } = useAuth();

    const userRoles = new Set(user?.roles || []);
    const isAdmin = userRoles.has('ROLE_ADMIN');

    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';

    const [categoriesData, setCategoriesData] = useState([]);
    const [allCategoriesTree, setAllCategoriesTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    const fetchAllCategoriesForForm = useCallback(async () => {
        try {
            const response = await getAllCategoriesAsTree();
            setAllCategoriesTree(response.data);
        } catch (error) {
            toast.error("Lỗi khi tải cây danh mục cho form.");
        }
    }, []);

    const fetchPaginatedCategories = useCallback(async (page, size, search) => {
        try {
            setLoading(true);
            const response = await getAllCategories(page, size, search);
            setCategoriesData(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
            setCurrentPage(response.data.number);
        } catch (error) {
            toast.error("Không thể tải danh sách danh mục.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPaginatedCategories(currentPage, pageSize, searchTerm);
        fetchAllCategoriesForForm();
    }, [fetchPaginatedCategories, currentPage, pageSize, searchTerm]);

    const handleOpenModal = (category = null) => {
        setCurrentCategory(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCategory(null);
    };

    const handleOpenReorderModal = () => {
        setIsReorderModalOpen(true);
    };

    const handleReorderSuccess = () => {
        fetchPaginatedCategories(0, pageSize, searchTerm);
    };

    const handleSaveCategory = async (categoryData) => {
        if (currentCategory) {
            await updateCategory(currentCategory.id, categoryData);
            toast.success(`Đã cập nhật danh mục!`);
        } else {
            await createCategory(categoryData);
            toast.success(`Đã tạo danh mục mới!`);
        }
        fetchPaginatedCategories(0, pageSize, '');
        handleCloseModal();
    };

    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            try {
                await deleteCategory(categoryId);
                toast.success("Xóa danh mục thành công!");
                fetchPaginatedCategories(currentPage, pageSize, searchTerm);
            } catch (error) {
                toast.error(error.response?.data?.message || "Không thể xóa danh mục.");
            }
        }
    };

    const handleToggleHomepage = async (categoryId) => {
        try {
            await toggleHomepageStatus(categoryId);
            toast.success("Cập nhật trạng thái thành công!");
            fetchPaginatedCategories(currentPage, pageSize, searchTerm);
        } catch (error) {
            toast.error(error.response?.data?.message || "Không thể cập nhật.");
        }
    };

    const toggleExpand = (categoryId) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            newSet.has(categoryId) ? newSet.delete(categoryId) : newSet.add(categoryId);
            return newSet;
        });
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
                    <FolderKanban size={36} className="text-[var(--brand-blue)]"/>
                    <h1 className="text-[22px] font-bold text-brand-blue uppercase tracking-wider">Quản lý Danh mục</h1>
                </div>
                <div className="flex items-center gap-x-4">
                    {!searchTerm && isAdmin && (
                        <button onClick={handleOpenReorderModal}
                                className="flex items-center gap-x-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">
                            <ListTree size={20}/><span>Sắp xếp thứ tự</span>
                        </button>
                    )}
                    <button onClick={() => handleOpenModal()}
                            className="flex items-center gap-x-2 px-4 py-2 bg-[var(--brand-blue)] text-white font-semibold rounded-lg hover:bg-opacity-90">
                        <PlusCircle size={20}/><span>Thêm danh mục</span>
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                    <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                        <th className="px-3 py-3 w-4/12">Tên danh mục</th>
                        <th className="px-3 py-3 w-4/12 text-center">Slug (vi/en)</th>
                        <th className="px-3 py-3 w-2/12 text-center">Hành động</th>
                        <th className="px-3 py-3 w-2/12 text-center">Hiển thị</th>
                    </tr>
                    </thead>
                    <tbody className="text-gray-700">
                    {loading ? (
                        <tr>
                            <td colSpan="4" className="text-center p-8 text-gray-500">Đang tải dữ liệu...</td>
                        </tr>
                    ) : categoriesData.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center p-8 text-gray-500">Không tìm thấy danh mục nào.</td>
                        </tr>
                    ) : searchTerm ? (
                        categoriesData.map(category => {
                            const viTranslation = category.translations.find(t => t.languageCode === 'vi') || {};
                            const enTranslation = category.translations.find(t => t.languageCode === 'en') || {};
                            const hasChildren = category.children && category.children.length > 0;
                            const isParent = category.parentId === null;
                            return (
                                <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-5 py-3 text-sm">
                                        <span className="font-semibold">{viTranslation.name}</span>
                                        {category.parentId &&
                                            <span className="text-xs text-gray-500 ml-2">(Danh mục con)</span>}
                                    </td>
                                    <td className="px-5 py-3 text-sm text-gray-600 font-mono">{`${viTranslation.slug} / ${enTranslation.slug}`}</td>
                                    <td className="px-5 py-3 text-sm text-center">
                                        <ToggleSwitch checked={category.showOnHomepage}
                                                      onChange={() => handleToggleHomepage(category.id)}
                                                      disabled={!isParent}/>
                                    </td>
                                    <td className="px-5 py-3 text-sm text-center whitespace-nowrap">
                                        <button onClick={() => handleOpenModal(category)}
                                                className="text-yellow-600 hover:text-yellow-900 mr-4"><Edit size={20}/>
                                        </button>
                                        <button onClick={() => handleDeleteCategory(category.id)}
                                                className="text-red-600 hover:text-red-900 disabled:opacity-40"
                                                disabled={hasChildren}><Trash2 size={20}/></button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        categoriesData.map(category => (
                            <CategoryRow key={category.id} category={category} onEdit={handleOpenModal}
                                         onDelete={handleDeleteCategory} onToggleHomepage={handleToggleHomepage}
                                         expandedIds={expandedIds} toggleExpand={toggleExpand}/>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4 px-1 py-1">
                <div className="flex items-center space-x-2 text-[14px] text-gray-700">
                    <span>Hiển thị</span>
                    <select value={pageSize} onChange={handlePageSizeChange}
                            className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none">
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                    </select>
                    <span>trên tổng số {totalElements} kết quả</span>
                </div>
                {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange}/>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}
                   title={currentCategory ? `Chỉnh sửa danh mục` : "Tạo danh mục mới"}>
                <CategoryForm category={currentCategory} onSave={handleSaveCategory} onCancel={handleCloseModal}
                              allCategories={allCategoriesTree} isOpen={isModalOpen}/>
            </Modal>

            <Modal isOpen={isReorderModalOpen} onClose={() => setIsReorderModalOpen(false)}
                   title="Sắp xếp thứ tự danh mục">
                <ReorderModal onClose={() => setIsReorderModalOpen(false)} onReorderSuccess={handleReorderSuccess}/>
            </Modal>
        </div>
    );
}

export default CategoryManagementPage;