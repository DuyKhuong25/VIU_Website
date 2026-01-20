import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/userService';
import toast from 'react-hot-toast';
import { KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const PasswordInput = ({ id, label, value, onChange, error }) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound size={18} className="text-gray-400" />
                </div>
                <input
                    id={id}
                    name={id}
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    className={`w-full pl-10 pr-10 py-2 border rounded-md shadow-sm transition-colors ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                        {showPassword ? <Eye size={18} className="text-gray-500" /> : <EyeOff size={18} className="text-gray-500" />}
                    </button>
                </div>
            </div>
            {error && <p className="text-[12px] italic text-red-500 mt-1">{error}</p>}
        </div>
    );
};

function ChangePasswordPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.oldPassword.trim()) {
            newErrors.oldPassword = 'Mật khẩu hiện tại không được để trống.';
        }
        if (!formData.newPassword.trim()) {
            newErrors.newPassword = 'Mật khẩu mới không được để trống.';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
        }
        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
        } else if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const passwordData = {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            };
            await changePassword(user.id, passwordData);
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            logout();
            navigate('/login', { replace: true });
            toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        } catch (error) {
            const errorMsg = error.data.message || "Đã có lỗi xảy ra.";
            if (errorMsg.toLowerCase().includes('mật khẩu cũ')) {
                setErrors({ oldPassword: errorMsg });
            } else {
                toast.error(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-x-3 mb-8">
                <ShieldCheck size={36} className="text-[var(--brand-blue)]" />
                <h1 className="text-3xl font-bold text-brand-blue uppercase tracking-wider">
                    Đổi mật khẩu
                </h1>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <p className="text-[14px] italic text-gray-600 text-center border-b border-gray-200 pb-6">
                        Để đảm bảo an toàn, vui lòng không chia sẻ mật khẩu của bạn cho người khác.
                    </p>

                    <PasswordInput
                        id="oldPassword"
                        label="Mật khẩu hiện tại"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        error={errors.oldPassword}
                    />
                    <PasswordInput
                        id="newPassword"
                        label="Mật khẩu mới"
                        value={formData.newPassword}
                        onChange={handleChange}
                        error={errors.newPassword}
                    />
                    <PasswordInput
                        id="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                    />

                    <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
                        <Link to="/forgot-password" className="text-sm font-medium text-brand-blue hover:text-blue-600 transition-colors">
                            Bạn quên mật khẩu hiện tại?
                        </Link>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-[var(--brand-blue)] text-white text-button font-bold rounded-lg hover:bg-opacity-90 transition-colors duration-200 disabled:bg-gray-400"
                        >
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangePasswordPage;