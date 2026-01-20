// Công dụng: Cấu hình instance của axios. Tự động đính kèm JWT token vào mọi request.
// Xử lý lỗi 401 (Unauthorized) bằng cách tự động đăng xuất người dùng.
// ADMIN SIDE
import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để đính kèm token vào header của mỗi request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest.url !== '/auth/login') {
            console.log("Token hết hạn hoặc không hợp lệ!");
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        return Promise.reject(error.response || error);
    }
);

export default apiClient;