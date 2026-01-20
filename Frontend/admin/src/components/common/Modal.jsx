import React, { useEffect, useState, useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { X } from 'lucide-react';

function Modal({ isOpen, onClose, title, children }) {
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

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 
                  bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out
                  ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div
                ref={modalRef}
                className={`bg-white rounded-lg shadow-xl w-full max-w-6xl relative 
                    transition-all duration-300 ease-in-out
                    ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95'}`}
            >
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h3 className="text-[16px] uppercase font-bold text-[var(--brand-blue)]">{title}</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors focus:outline-none"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
export default Modal;