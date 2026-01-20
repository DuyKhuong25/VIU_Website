// Công dụng: Chứa các hàm gọi API liên quan đến quản lý Role.
import apiClient from './api';

/**
 * Lấy danh sách tất cả các role trong hệ thống.
 * @returns {Promise<object>}
 */
export const getAllRoles = () => {
    return apiClient.get('/admin/roles');
};

/**
 * Tạo một role mới.
 * @param {object} roleData - Dữ liệu role từ form.
 * @returns {Promise<object>}
 */
export const createRole = (roleData) => {
    return apiClient.post('/admin/roles', roleData);
};

/**
 * Xóa một role.
 * @param roleId
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const deleteRole = (roleId) => {
    return apiClient.delete(`/admin/roles/${roleId}`);
};