import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllTags, createTag, updateTag, deleteTag } from '../services/tagService';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import TagForm from '../components/tags/TagForm';
import Pagination from '../components/common/Pagination';
import { Tag as TagIcon, PlusCircle, Edit, Trash2 } from 'lucide-react';

function TagManagementPage() {
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';

    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTag, setCurrentTag] = useState(null);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const fetchTags = useCallback(async (page, size, search) => {
        try {
            setLoading(true);
            const response = await getAllTags(page, size, search);
            setTags(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
            setCurrentPage(response.data.number);
        } catch (error) {
            toast.error("Không thể tải danh sách thẻ.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTags(currentPage, pageSize, searchTerm);
    }, [fetchTags, currentPage, pageSize, searchTerm]);

    const handleOpenModal = (tag = null) => {
        setCurrentTag(tag);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentTag(null);
    };

    const handleSaveTag = async (tagData) => {
        if (currentTag) {
            await updateTag(currentTag.id, tagData);
            toast.success(`Đã cập nhật thẻ!`);
        } else {
            await createTag(tagData);
            toast.success(`Đã tạo thẻ mới!`);
        }
        fetchTags(0, pageSize, '');
        handleCloseModal();
    };

    const handleDeleteTag = async (tagId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa thẻ này?")) {
            try {
                await deleteTag(tagId);
                toast.success("Xóa thẻ thành công!");
                fetchTags(currentPage, pageSize, searchTerm);
            } catch (error) {
                toast.error("Không thể xóa thẻ.");
            }
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
                    <TagIcon size={36} className="text-[var(--brand-blue)]" />
                    <h1 className="text-[22px] font-bold text-brand-blue uppercase tracking-wider">Quản lý Thẻ</h1>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-x-2 px-4 py-2 bg-[var(--brand-blue)] text-white font-semibold rounded-lg hover:bg-opacity-90">
                    <PlusCircle size={20} /><span>Thêm thẻ mới</span>
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                    <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                        <th className="px-5 py-3">Tên thẻ (VI)</th>
                        <th className="px-5 py-3">Tên thẻ (EN)</th>
                        <th className="px-5 py-3">Slug (VI / EN)</th>
                        <th className="px-5 py-3 text-center">Hành động</th>
                    </tr>
                    </thead>
                    <tbody className="text-gray-700">
                    {loading ? (
                        <tr><td colSpan="4" className="text-center p-8 text-gray-500">Đang tải...</td></tr>
                    ) : tags.length === 0 ? (
                        <tr><td colSpan="4" className="text-center p-8 text-gray-500">Không tìm thấy thẻ nào.</td></tr>
                    ) : tags.map(tag => {
                        const vi = tag.translations.find(t => t.languageCode === 'vi') || {};
                        const en = tag.translations.find(t => t.languageCode === 'en') || {};
                        return (
                            <tr key={tag.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-5 py-4 text-sm font-semibold">{vi.name}</td>
                                <td className="px-5 py-4 text-sm">{en.name}</td>
                                <td className="px-5 py-4 text-sm text-gray-600 font-mono">{`${vi.slug} / ${en.slug}`}</td>
                                <td className="px-5 py-4 text-sm text-center whitespace-nowrap">
                                    <button onClick={() => handleOpenModal(tag)} className="text-yellow-600 hover:text-yellow-900 mr-4"><Edit size={20} /></button>
                                    <button onClick={() => handleDeleteTag(tag.id)} className="text-red-600 hover:text-red-900"><Trash2 size={20} /></button>
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
                    <select value={pageSize} onChange={handlePageSizeChange} className="px-2 py-1.5 border border-gray-300 rounded-md">
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

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentTag ? `Chỉnh sửa thẻ` : "Tạo thẻ mới"}>
                <TagForm tag={currentTag} onSave={handleSaveTag} onCancel={handleCloseModal} isOpen={isModalOpen} />
            </Modal>
        </div>
    );
}
export default TagManagementPage;