// Công dụng: Bọc các route chỉ dành cho khách (chưa đăng nhập).
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function GuestRoute() {
    const { token } = useAuth();
    return !token ? <Outlet /> : <Navigate to="/" replace />;
}
export default GuestRoute;