import React from 'react';

function DashboardPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white rounded-lg shadow-md">
            <img
                src="https://cdn.worldvectorlogo.com/logos/sys-admin.svg"
                alt="Access Denied"
                className="w-88 h-88 mb-6"
            />
            <h2 className="text-2xl uppercase font-bold text-red-600">Chào mừng bạn đến với trang quản trị!</h2>
            <p className="mt-3 italic text-[18px] text-gray-600">Hãy chọn một mục từ thanh điều hướng bên trái để bắt đầu.</p>
        </div>
    );
}

export default DashboardPage;