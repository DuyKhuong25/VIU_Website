import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import logo from '../assets/logo_viethung.png';

const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
    </svg>
);
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);
const EyeOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const EyeClosedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
);

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const data = await loginService(email, password);
            console.log("Login successful:", data);
            const { accessToken, ...userData } = data;
            login(accessToken, userData);
            toast.success('Đăng nhập thành công!');
            navigate('/');
        } catch (err) {
            if (err.status === 400 && err.data) {
                setErrors(err.data);
            } else if (err.status === 401) {
                setErrors({ general: err.data.message });
            } else {
                setErrors({ general: "Đã có lỗi xảy ra. Vui lòng thử lại." });
            }
            console.error("Login failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://csdlthanhnien.quangngai.gov.vn/GiaoDien/assets/image/login_background.png)' }}
        >
            <div className="absolute inset-0 bg-white/30 backdrop-blur-md"></div>

            <div className="relative z-10 flex w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/50">
                <div className="hidden md:flex flex-col w-1/2 bg-brand-blue/80 p-8">
                    <div className="flex-grow flex items-center justify-center">
                        <img src={logo} alt="VHU Logo" className="w-90 h-auto" />
                    </div>
                </div>

                <div className="hidden md:block w-px bg-gray-200/50"></div>

                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <h2 className="text-3xl uppercase text-center font-bold text-brand-blue mb-2">Đăng nhập</h2>
                    <p className="text-[13px] text-center italic text-gray-600 mb-8">Chào mừng trở lại!</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email:
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EmailIcon />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="off"
                                    autoFocus={true}
                                    className={`w-full text-[14px] pl-10 pr-4 py-2 border rounded-md focus:outline-none shadow-sm transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                />
                            </div>
                            {errors.email && <p className="text-[10px] italic text-red-500 mt-2">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mật khẩu:
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockIcon/>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full text-[14px] pl-10 pr-10 py-2 border rounded-md shadow-sm focus:outline-none transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="focus:outline-none"
                                    >
                                        {showPassword ? <EyeOpenIcon/> : <EyeClosedIcon/>}
                                    </button>
                                </div>
                            </div>
                            {errors.password &&
                                <p className="text-[10px] italic text-red-500 mt-2">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-brand-blue accent-brand-blue border-gray-300 rounded  focus:outline-none"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-[13px] text-gray-900">
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>

                            <div className="text-[13px]">
                                <a href="#" className="font-medium text-brand-blue hover:text-blue-700">
                                    Quên mật khẩu?
                                </a>
                            </div>
                        </div>

                        {errors.general &&
                            <p className="text-[12px] italic text-red-500 text-center">{errors.general}</p>}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-button font-bold text-white bg-[var(--brand-blue)] hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;