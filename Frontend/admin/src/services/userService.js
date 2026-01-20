// Công dụng: Chứa tất cả các hàm gọi API liên quan đến quản lý User.
import apiClient from './api';

/**
 * Lấy danh sách tất cả người dùng.
 @param {number} id - ID của người dùng.
 * @param {number} page - Trang hiện tại (mặc định là 0).
 * @param {number} size - Số người dùng trên mỗi trang (mặc định là 10).
 * @returns {Promise<object>}
 */
export const getAllUsers = (page = 0, size = 10, search = '') => {
    return apiClient.get(`/admin/users?page=${page}&size=${size}&search=${search}`);
};

/**
 * Lấy thông tin chi tiết một người dùng bằng ID.
 * @param {number} id - ID của người dùng.
 * @returns {Promise<object>}
 */
export const getUserById = (id) => {
    return apiClient.get(`/admin/users/${id}`);
};

/**
 * Tạo một người dùng mới.
 * @param {object} userData - Dữ liệu người dùng từ form.
 * @returns {Promise<object>}
 */
export const createUser = (userData) => {
    return apiClient.post('/admin/users', userData);
};

/**
 * Cập nhật thông tin profile của người dùng.
 * @param {number} id - ID của người dùng.
 * @param {object} userData - Dữ liệu cập nhật.
 * @returns {Promise<object>}
 */
export const updateUser = (id, userData) => {
    return apiClient.put(`/admin/users/${id}`, userData);
};

/**
 * Xóa một người dùng.
 * @param {number} id - ID của người dùng.
 * @returns {Promise<object>}
 */
export const deleteUser = (id) => {
    return apiClient.delete(`/admin/users/${id}`);
};

/**
 * Gửi yêu cầu thay đổi mật khẩu đến server.
 * @param {number} id - ID của người dùng.
 * @param {object} passwordData - Object chứa oldPassword và newPassword.
 * @returns {Promise<object>}
 */
export const changePassword = (id, passwordData) => {
    return apiClient.post(`/admin/users/${id}/change-password`, passwordData);
};