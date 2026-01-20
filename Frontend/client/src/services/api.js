// Công dụng: Cấu hình instance của axios. Tự động đính kèm JWT token vào mọi request.
// CLIENT SIDE
import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;