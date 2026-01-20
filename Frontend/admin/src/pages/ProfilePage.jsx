import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateUser, getUserById } from '../services/userService';
import { getAllRoles } from '../services/roleService';
import toast from 'react-hot-toast';
import {Check, ChevronDown, UserCircle2} from "lucide-react";
import { format, parseISO } from 'date-fns';

function ProfilePage() {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        roles: new Set(),
    });
    const [allRoles, setAllRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isRolesExpanded, setIsRolesExpanded] = useState(false);

    const isCurrentUserAdmin = user?.roles?.includes('ROLE_ADMIN');

    useEffect(() => {
        if (user?.id) {
            const fetchInitialData = async () => {
                try {
                    const [userResponse, rolesResponse] = await Promise.all([
                        getUserById(user.id),
                        getAllRoles()
                    ]);

                    setAllRoles(rolesResponse.data);
                    let userRoles;
                    if (isCurrentUserAdmin) {
                        userRoles = new Set(rolesResponse.data.map(role => role.name));
                    } else {
                        userRoles = new Set(userResponse.data.roles);
                    }

                    setFormData({
                        email: userResponse.data.email,
                        fullName: userResponse.data.fullName,
                        createdAt: userResponse.data.createdAt,
                        roles: userRoles
                    });
                } catch (error) {
                    toast.error("Không thể tải dữ liệu trang.");
                } finally {
                    setInitialLoading(false);
                }
            };
            fetchInitialData();
        }
    }, [user?.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (roleName) => {
        setFormData(prev => {
            const newRoles = new Set(prev.roles);
            if (newRoles.has(roleName)) {
                newRoles.delete(roleName);
            } else {
                newRoles.add(roleName);
            }
            return { ...prev, roles: newRoles };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updateData = {
                email: formData.email,
                fullName: formData.fullName,
                roles: Array.from(formData.roles)
            };

            await updateUser(user.id, updateData);
            logout();
            navigate('/login', { replace: true });
            toast.success("Cập nhật thông tin thành công! Vui lòng đăng nhập lại.");

        } catch (error) {
            const errorMsg = error.data?.message || "Đã có lỗi xảy ra.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div>Đang tải thông tin...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-x-3 mb-8">
                <UserCircle2 size={36} className="text-[var(--brand-blue)]"/>
                <h1 className="text-3xl font-bold text-brand-blue uppercase tracking-wider">
                    Thông tin tài khoản
                </h1>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-8">
                <form onSubmit={handleSubmit}>
                    <div
                        className="flex flex-col items-center md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6 pb-6 border-b border-gray-200">
                        <div
                            className="flex-shrink-0 w-18 h-18 rounded-full bg-[var(--brand-blue)] flex items-center justify-center text-white text-[30px] font-bold uppercase">
                            {user?.fullName ? user.fullName.charAt(0) : 'A'}
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl uppercase font-bold text-gray-800">{user?.fullName}</h2>
                        </div>
                    </div>
                    <div className="py-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <label htmlFor="username"
                                       className="block text-sm font-medium text-gray-700">Username</label>
                                <input type="text" id="username" value={user?.username || ''} disabled
                                       className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"/>
                            </div>
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Họ và
                                    Tên</label>
                                <input type="text" name="fullName" id="fullName" value={formData.fullName}
                                       onChange={handleChange}
                                       className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]"/>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" name="email" id="email" value={formData.email}
                                       onChange={handleChange}
                                       className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]"/>
                            </div>
                            <div>
                                <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700">Ngày
                                    tạo</label>
                                <input
                                    type="text"
                                    id="createdAt"
                                    value={format(parseISO(formData.createdAt), 'dd/MM/yyyy')}
                                    disabled
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        {isCurrentUserAdmin && (
                            <div className="border-t border-gray-200 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsRolesExpanded(!isRolesExpanded)}
                                    className="w-full flex justify-between items-center"
                                >
                                    <span
                                        className="block text-[16px] uppercase font-semibold text-gray-900">Phân quyền</span>
                                    <ChevronDown
                                        className={`transition-transform duration-300 ${isRolesExpanded ? 'rotate-180' : ''}`}/>
                                </button>
                                <p className={`text-[13px] italic text-gray-500 transition-opacity duration-300 ${isRolesExpanded ? 'mt-1' : 'opacity-0'}`}>
                                    Tài khoản Admin mặc định có tất cả các quyền.
                                </p>

                                <div
                                    className={`transition-all duration-300 ease-in-out overflow-hidden ${isRolesExpanded ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {allRoles.map((role) => {
                                            const isChecked = formData.roles.has(role.name);
                                            const isDisabled = role.name === 'ROLE_ADMIN' || role.name === 'ROLE_EDITOR' || role.name === 'ROLE_VIEW';
                                            return (
                                                <label
                                                    key={role.id}
                                                    htmlFor={`role-${role.id}`}
                                                    className={`flex items-center p-3 rounded-lg border transition-colors duration-200 ${
                                                        isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                                                    } ${isChecked ? 'border-[var(--brand-blue)] bg-blue-50' : 'border-gray-300'}`}
                                                >
                                                    <input
                                                        id={`role-${role.id}`}
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleRoleChange(role.name)}
                                                        disabled={isDisabled}
                                                        className="sr-only"
                                                    />
                                                    <div
                                                        className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                                                            isChecked ? 'bg-[var(--brand-blue)] border-[var(--brand-blue)]' : 'bg-white border-gray-400'
                                                        }`}>
                                                        {isChecked && <Check size={14} className="text-white"/>}
                                                    </div>
                                                    <span
                                                        className={`ml-3 block text-[13px] font-medium truncate ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                                                        {role.name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="border-t border-gray-200 pt-6 flex justify-end">
                        <button type="submit" disabled={loading}
                                className="px-6 py-2.5 bg-[var(--brand-blue)] text-white text-button font-bold rounded-lg hover:bg-opacity-90 transition-colors duration-200 disabled:bg-gray-400">
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProfilePage;