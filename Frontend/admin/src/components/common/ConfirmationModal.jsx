import React, { useEffect, useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { X, AlertTriangle } from 'lucide-react';

/**
 * Modal chuyên dụng để xác nhận hành động (thay thế window.confirm)
 * @param {boolean} isOpen - Trạng thái mở/đóng
 * @param {function} onClose - Hàm gọi khi đóng (bấm Hủy, 'X' hoặc click ngoài)
 * @param {function} onConfirm - Hàm gọi khi bấm xác nhận
 * @param {string} title - Tiêu đề
 * @param {string} confirmText - Chữ trên nút xác nhận
 * @param {string} variant - 'danger' (cho nút màu đỏ) hoặc 'primary' (mặc định)
 * @param {React.ReactNode} children - Nội dung/thông điệp cảnh báo
 */
function ConfirmationModal({ isOpen, onClose, onConfirm, title, children, confirmText = "Xác nhận", variant = "primary" }) {
    const modalRef = useRef(null);

    useClickOutside(modalRef, () => {
        if (isOpen) {
            onClose();
        }
    });

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    const confirmButtonClass = variant === 'danger'
        ? 'bg-red-600 hover:bg-red-700'
        : 'bg-[var(--brand-blue)] hover:bg-opacity-90';

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 
                        bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out
                        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div
                ref={modalRef}
                className={`bg-white rounded-lg shadow-xl w-full max-w-lg relative 
                            transition-all duration-300 ease-in-out
                            ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95'}`}
            >
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <div className="flex items-center gap-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-100' : 'bg-blue-100'}`}>
                            <AlertTriangle size={20} className={variant === 'danger' ? 'text-red-600' : 'text-blue-600'} />
                        </div>
                        <h3 className="text-[16px] uppercase font-bold text-gray-800">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors focus:outline-none"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="text-sm text-gray-600 leading-relaxed">
                        {children}
                    </div>
                </div>

                <div className="flex justify-end space-x-4 p-5 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-sm"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`px-6 py-2 text-white font-bold rounded-lg text-sm transition-colors ${confirmButtonClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
export default ConfirmationModal;