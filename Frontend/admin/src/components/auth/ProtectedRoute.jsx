// Công dụng: Bọc các route yêu cầu người dùng phải đăng nhập.
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute() {
    const { token } = useAuth();
    return token ? <Outlet /> : <Navigate to="/login" replace />;
}
export default ProtectedRoute;