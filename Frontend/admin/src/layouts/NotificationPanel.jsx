// src/components/layout/NotificationPanel.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications.jsx';
import { X, CheckCheck, Trash2 } from 'lucide-react';
import Pagination from '../components/common/Pagination.jsx';

function NotificationPanel({ isOpen, onClose }) {
    const navigate = useNavigate();

    const {
        paginatedData,
        fetchPaginated,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications
    } = useNotifications();

    useEffect(() => {
        if (isOpen) {
            fetchPaginated(0);
        }
    }, [isOpen, fetchPaginated]);

    const handleItemClick = (id, link) => {
        markAsRead(id, link);
        navigate(link);
        onClose();
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm("Bạn có chắc muốn xóa thông báo này?")) {
            deleteNotification(id);
        }
    };

    const handleDeleteAll = () => {
        if (window.confirm("Bạn có chắc muốn xóa TẤT CẢ thông báo? Hành động này không thể hoàn tác.")) {
            deleteAllNotifications();
        }
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black/30 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-blue-300">
                        <h2 className="text-[14px] uppercase font-bold text-[var(--brand-blue)]">Tất cả Thông báo</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
                    </div>

                    <div className="p-2 flex justify-between items-center">
                        <button onClick={handleDeleteAll} className="text-[13px] font-semibold text-red-400 hover:text-red-600 flex items-center gap-x-1 cursor-pointer">
                            <Trash2 size={14}/><span>Xóa tất cả thông báo</span>
                        </button>
                        <button onClick={markAllAsRead}
                                className="text-[13px] font-semibold text-gray-500 hover:text-[var(--brand-blue)] flex items-center gap-x-1 cursor-pointer">
                            <CheckCheck size={14}/><span>Đánh dấu đã đọc tất cả</span>
                        </button>
                    </div>

                    <div className="flex-grow py-1 overflow-y-auto">
                        {paginatedData.notifications.map(noti => (
                            <div key={noti.id} onClick={() => handleItemClick(noti.id, noti.link)} className={`px-3 py-3 cursor-pointer ${!noti.read ? 'bg-blue-100' : 'bg-white'} hover:bg-blue-100`}>
                                <div className="flex items-start space-x-2">
                                    <div
                                        className={`w-1.5 h-1.5 mt-1.5 rounded-full flex-shrink-0 ${!noti.read ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!noti.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{noti.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(noti.createdAt).toLocaleString('vi-VN')}</p>
                                    </div>
                                    <button onClick={(e) => handleDelete(e, noti.id)}
                                            className="p-2 rounded-full text-red-400 hover:bg-red-100 hover:text-red-600 z-20">
                                        <Trash2 size={15}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex-shrink-0 p-2 flex justify-center">
                        <Pagination currentPage={paginatedData.pageInfo.currentPage} totalPages={paginatedData.pageInfo.totalPages} onPageChange={fetchPaginated} />
                    </div>
                </div>
            </div>
        </>
    );
}
export default NotificationPanel;