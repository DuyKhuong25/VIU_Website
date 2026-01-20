import React, { useState, useEffect } from 'react';
import { getAllRoles } from '../../services/roleService';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../common/ConfirmationModal';

function UserForm({ user, onSave, onCancel, loggedInUserRoles = new Set() }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        password: '',
        roles: new Set(),
    });
    const [allRoles, setAllRoles] = useState([]);
    const [errors, setErrors] = useState({});
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [roleToChange, setRoleToChange] = useState(null);

    const isOperatorAdmin = loggedInUserRoles.has('ROLE_ADMIN');
    const isOperatorManager = loggedInUserRoles.has('ROLE_MANAGER');

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await getAllRoles();
                setAllRoles(response.data);
            } catch (error) {
                toast.error("Không thể tải danh sách quyền.");
            }
        };
        fetchRoles();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                password: '',
                roles: new Set(user.roles).add('ROLE_VIEW'),
            });
        } else {
            setFormData({
                username: '',
                email: '',
                fullName: '',
                password: '',
                roles: new Set(['ROLE_EDITOR', 'ROLE_VIEW'])
            });
        }
        setErrors({});
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: null}));
        }
    };

    const handleRoleChange = (roleName) => {
        if (roleName === 'ROLE_MANAGER' && !formData.roles.has('ROLE_MANAGER')) {
            setRoleToChange(roleName);
            setIsConfirmModalOpen(true);
        } else {
            updateRolesState(roleName);
        }
    };

    const updateRolesState = (roleName) => {
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

    const handleConfirmRoleChange = () => {
        if (roleToChange) {
            updateRolesState(roleToChange);
        }
        setIsConfirmModalOpen(false);
        setRoleToChange(null);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Họ tên không được để trống.';
        if (!formData.email.trim()) newErrors.email = 'Email không được để trống.';

        // Chỉ validate username và password khi tạo mới
        if (!user) {
            if (!formData.username.trim()) newErrors.username = 'Username không được để trống.';
            if (!formData.password) {
                newErrors.password = 'Mật khẩu không được để trống.';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const isValid = validateForm();
        if (!isValid) {
            return;
        }

        const dataToSend = { ...formData, roles: Array.from(formData.roles) };

        if (user && !dataToSend.password) {
            delete dataToSend.password;
        }

        onSave(dataToSend);
    };

    const visibleRoles = allRoles.filter(role => {
        const roleName = role.name;
        if (roleName === 'ROLE_ADMIN') {
            return false;
        }

        if (isOperatorAdmin) {
            return true;
        }

        if (isOperatorManager) {
            return roleName !== 'ROLE_MANAGER';
        }

        return false;
    });

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange}
                               className={`w-full px-3 py-2 mt-1 border rounded ${errors.username ? 'border-red-500' : 'border-gray-300'}`} disabled={!!user}/>
                        {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Họ tên</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                               className={`w-full px-3 py-2 mt-1 border rounded ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}/>
                        {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                           className={`w-full px-3 py-2 mt-1 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}/>
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>
                {!user && (
                    <div>
                        <label className="block text-sm font-medium">Mật khẩu</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange}
                               className={`w-full px-3 py-2 mt-1 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`}/>
                        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                    </div>
                )}
                <div className="pt-2">
                    <label className="block text-base font-semibold text-gray-900">Phân quyền</label>
                    <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-3">
                        {visibleRoles.length > 0 ? (
                            visibleRoles.map((role) => {
                                const isChecked = formData.roles.has(role.name);
                                const isDisabled = role.name === 'ROLE_VIEW';
                                return (
                                    <label key={role.id} htmlFor={`role-form-${role.id}`}
                                           className={`flex items-center p-3 rounded-lg border transition-colors duration-200 cursor-pointer hover:bg-gray-50 ${isChecked ? 'border-[var(--brand-blue)] bg-blue-50' : 'border-gray-300'}`}>
                                        <input id={`role-form-${role.id}`} type="checkbox" checked={isChecked} disabled={isDisabled}
                                               onChange={() => handleRoleChange(role.name)} className="sr-only"/>
                                        <div
                                            className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${isChecked ? 'bg-[var(--brand-blue)] border-[var(--brand-blue)]' : 'bg-white border-gray-400'}`}>
                                            {isChecked && <Check size={14} className="text-white"/>}
                                        </div>
                                        <span
                                            className="ml-3 block text-sm font-medium text-gray-900 truncate">{role.name}</span>
                                    </label>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-500">Không có quyền nào để hiển thị.</p>
                        )}
                    </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 mt-4">
                    <button type="button" onClick={onCancel}
                            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-sm">Hủy
                    </button>
                    <button type="submit"
                            className="px-6 py-2 bg-[var(--brand-blue)] text-white font-bold rounded-lg hover:bg-opacity-90 text-sm">Lưu
                    </button>
                </div>
            </form>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmRoleChange}
                title="Cảnh báo Bảo mật"
                confirmText="Vẫn cấp quyền"
                variant="danger"
            >
                <p className="font-semibold text-gray-800">
                    Bạn đang cấp quyền MANAGER (quyền cấp cao) cho người dùng này.
                </p>
                <p className="mt-2">
                    Họ sẽ có quyền truy cập và thay đổi hệ thống (bao gồm cả quản lý người dùng khác).
                </p>
                <p className="mt-3 font-semibold">Bạn có chắc chắn muốn tiếp tục?</p>
            </ConfirmationModal>
        </>
    );
}

export default UserForm;