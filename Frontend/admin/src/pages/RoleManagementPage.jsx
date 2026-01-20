import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllRoles, createRole, deleteRole } from '../services/roleService';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import { Shield, PlusCircle, Trash2 } from 'lucide-react';

function RoleManagementPage() {
    const { user: currentUserLoggedIn } = useAuth();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [formError, setFormError] = useState('');

    const canManage = new Set(currentUserLoggedIn?.roles || []).has('ROLE_ADMIN');

    const fetchRoles = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllRoles();
            setRoles(response.data);
        } catch (error) {
            toast.error("Không thể tải danh sách quyền.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleOpenModal = () => {
        setNewRoleName('');
        setFormError('');
        setIsModalOpen(true);
    };

    const handleCreateRole = async (event) => {
        event.preventDefault();
        const roleNamePattern = /^ROLE_[A-Z_]+$/;
        const roleNameTransformed = newRoleName.trim().toUpperCase();

        if (!roleNameTransformed) {
            setFormError("Tên quyền không được để trống.");
            return;
        }
        if (!roleNamePattern.test(roleNameTransformed)) {
            setFormError("Sai định dạng. Tên quyền phải bắt đầu bằng 'ROLE_'");
            return;
        }
        setFormError('');

        try {
            await createRole({ name: roleNameTransformed });
            toast.success(`Đã tạo quyền mới: ${roleNameTransformed}`);
            setIsModalOpen(false);
            fetchRoles();
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Lỗi khi tạo quyền.";
            toast.error(errorMsg);
        }
    };

    const handleDeleteRole = async (roleId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa quyền này? Việc này có thể ảnh hưởng đến người dùng đang có quyền này.")) {
            try {
                await deleteRole(roleId);
                toast.success("Xóa quyền thành công!");
                fetchRoles();
            } catch (error) {
                toast.error("Không thể xóa quyền.");
            }
        }
    };

    if (loading) {
        return <p>Đang tải dữ liệu...</p>
    }

    if (!canManage) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white rounded-lg shadow-md">
                <img
                    src="https://learn.microsoft.com/en-us/training/achievements/describe-the-concepts-of-security-compliance-and-identity.svg"
                    alt="Access Denied"
                    className="w-88 h-88 mb-6"
                />
                <h2 className="text-2xl uppercase font-bold text-red-600">Nội dung dành cho ADMIN!</h2>
                <p className="mt-3 italic text-[14px] text-gray-600">Bạn không có quyền truy cập nội dung này.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-x-3">
                    <Shield size={36} className="text-[var(--brand-blue)]" />
                    <h1 className="text-[22px] font-bold text-brand-blue uppercase tracking-wider">
                        Quản lý Quyền
                    </h1>
                </div>
                {canManage && (
                    <button onClick={handleOpenModal} className="flex items-center gap-x-2 px-4 py-2 bg-[var(--brand-blue)] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors">
                        <PlusCircle size={20} />
                        <span>Thêm quyền mới</span>
                    </button>
                )}
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                    <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                        <th className="px-5 py-3">Tên Quyền (Role Name)</th>
                        {canManage && <th className="px-5 py-3 text-center">Hành động</th>}
                    </tr>
                    </thead>
                    <tbody className="text-gray-700">
                    {roles.map(role => (
                        <tr key={role.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-5 py-4 text-sm font-semibold">{role.name}</td>
                            {canManage && (
                                <td className="px-5 py-4 text-sm text-center">
                                    <button
                                        onClick={() => handleDeleteRole(role.id)}
                                        className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={['ROLE_ADMIN', 'ROLE_EDITOR', 'ROLE_VIEW', 'ROLE_MANAGER'].includes(role.name)}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm quyền mới">
                <form onSubmit={handleCreateRole} className="space-y-4">
                    <div>
                        <label htmlFor="newRoleName" className="block text-sm font-medium text-gray-700">Tên quyền</label>
                        <input
                            type="text"
                            id="newRoleName"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            placeholder="Ví dụ: ROLE_JOURNALIST"
                            className="mt-2 text-[14px] w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-blue)]"
                        />
                        {formError ? (
                            <p className="text-xs text-red-600 mt-1">{formError}</p>
                        ) : (
                            <p className="text-xs text-gray-500 mt-1">Tên quyền theo định dạng ROLE_TÊNQUYỀN (chữ không dấu, không khoảng trắng).</p>
                        )}
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-sm">Hủy</button>
                        <button type="submit" className="px-6 py-2 bg-[var(--brand-blue)] text-white font-bold rounded-lg hover:bg-opacity-90 text-sm">Thêm mới</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
export default RoleManagementPage;