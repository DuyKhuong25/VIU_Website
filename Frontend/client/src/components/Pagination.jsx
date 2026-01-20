// src/components/Pagination.jsx
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav className="flex justify-center items-center space-x-2 mt-8">
            {pageNumbers.map(number => {
                const isActive = number === currentPage;
                return (
                    <button
                        key={number}
                        onClick={() => onPageChange(number)}
                        className={`h-10 w-10 rounded-full font-semibold transition-colors duration-300
              ${isActive
                            ? 'bg-[var(--brand-blue)] text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`
                        }
                    >
                        {number}
                    </button>
                );
            })}
        </nav>
    );
};

export default Pagination;