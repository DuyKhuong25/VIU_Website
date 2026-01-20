import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllQuickAccessLinks, deleteQuickAccessLink, reorderQuickAccessLinks } from '../services/quickAccessService';
import toast from 'react-hot-toast';
import { Grid, PlusCircle, Edit, Trash2, Loader2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function QuickAccessListPage() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getAllQuickAccessLinks()
            .then(res => setLinks(res.data.content))
            .catch(() => toast.error("Không thể tải danh sách."))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa liên kết này?")) {
            try {
                await deleteQuickAccessLink(id);
                setLinks(prev => prev.filter(link => link.id !== id));
                toast.success("Xóa thành công!");
            } catch {
                toast.error("Xóa thất bại.");
            }
        }
    };

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(links);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setLinks(items);

        const linkIds = items.map(item => item.id);
        reorderQuickAccessLinks(linkIds)
            .then(() => toast.success("Cập nhật thứ tự thành công!"))
            .catch(() => toast.error("Lỗi khi cập nhật thứ tự."));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-x-3">
                    <Grid size={36} className="text-[var(--brand-blue)]" />
                    <h1 className="text-[22px] font-bold text-[var(--brand-blue)] uppercase tracking-wider">Quản lý Truy cập nhanh</h1>
                </div>
                <Link to="/quick-access/new" className="flex items-center gap-x-2 px-4 py-2 bg-[var(--brand-blue)] text-white font-semibold rounded-lg hover:bg-opacity-90">
                    <PlusCircle size={20} /><span>Thêm liên kết mới</span>
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="links">
                        {(provided) => (
                            <table className="min-w-full leading-normal" {...provided.droppableProps} ref={provided.innerRef}>
                                <thead>
                                <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                                    <th className="px-5 py-3 w-12"></th>
                                    <th className="px-5 py-3 w-24">Icon</th>
                                    <th className="px-5 py-3">Tên liên kết</th>
                                    <th className="px-5 py-3 text-center">Trạng thái</th>
                                    <th className="px-5 py-3 w-40 text-center">Hành động</th>
                                </tr>
                                </thead>
                                <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center p-8"><Loader2 className="animate-spin text-blue-500 mx-auto" size={32} /></td></tr>
                                ) : links.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center p-8 text-gray-500">Chưa có liên kết nào.</td></tr>
                                ) : links.map((link, index) => (
                                    <Draggable key={link.id} draggableId={String(link.id)} index={index}>
                                        {(provided) => (
                                            <tr {...provided.draggableProps} ref={provided.innerRef} className="border-b border-gray-200 hover:bg-gray-50 bg-white">
                                                <td {...provided.dragHandleProps} className="px-5 py-2 text-center cursor-move text-gray-400">
                                                    <GripVertical size={20} />
                                                </td>
                                                <td className="px-5 py-2">
                                                    <img src={link.iconUrl} alt={link.title} className="w-12 h-12 object-contain bg-gray-50 p-1 rounded"/>
                                                </td>
                                                <td className="px-5 py-2 text-sm font-semibold text-gray-900">{link.title}</td>
                                                <td className="px-5 py-2 text-sm text-center">
                                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${link.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {link.active ? 'Hoạt động' : 'Tạm ẩn'}
                                                        </span>
                                                </td>
                                                <td className="px-5 py-2 text-sm text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <Link to={`/quick-access/edit/${link.id}`} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full">
                                                            <Edit size={18}/>
                                                        </Link>
                                                        <button onClick={() => handleDelete(link.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full">
                                                            <Trash2 size={18}/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                                </tbody>
                            </table>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    );
}

export default QuickAccessListPage;