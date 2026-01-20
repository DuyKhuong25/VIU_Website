import React from 'react';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const halfPagesToShow = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow + 2) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if (currentPage > halfPagesToShow + 1) {
                pageNumbers.push('...');
            }
            let start = Math.max(2, currentPage - halfPagesToShow + 2);
            let end = Math.min(totalPages - 1, currentPage + halfPagesToShow + 2);

            if (currentPage < halfPagesToShow + 2) {
                end = maxPagesToShow;
            }
            if (currentPage > totalPages - halfPagesToShow - 3) {
                start = totalPages - maxPagesToShow + 1;
            }

            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }
            if (currentPage < totalPages - halfPagesToShow - 3) {
                pageNumbers.push('...');
            }
            pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav className="flex items-center space-x-1.5">
            <button
                onClick={() => onPageChange(0)}
                disabled={currentPage === 0}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronsLeft size={18} />
            </button>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={18} />
            </button>

            {pageNumbers.map((page, index) =>
                typeof page === 'number' ? (
                    <button
                        key={index}
                        onClick={() => onPageChange(page - 1)}
                        className={`w-8 h-8 rounded-full text-[14px] flex items-center justify-center border font-semibold transition-colors
                        ${currentPage === page - 1
                            ? 'bg-[var(--brand-blue)] text-white border-[var(--brand-blue)]'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {page}
                    </button>
                ) : (
                    <span key={index} className="w-8 h-8 flex items-center justify-center text-gray-500">...</span>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight size={18} />
            </button>
            <button
                onClick={() => onPageChange(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronsRight size={18} />
            </button>
        </nav>
    );
};

export default Pagination;